import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import {
  engagements, gateRecords, gateReviews, remediationActions,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import {
  GATE_DEFINITIONS,
  canAdvanceGate,
  buildGatePackage,
  PHASE_MAP,
} from "@/lib/workflow/golden-path";
import { recordGateApproval } from "@/lib/ledger/evidence";
import { financialAgent } from "@/lib/agents/financial";
import { communicationsAgent } from "@/lib/agents/communications";
import { notifyMondayGateAdvancement } from "@/lib/integrations/monday";
import type { LicensingSector } from "@/lib/integrations/monday";
import type { GateNumber } from "@/lib/workflow/types";

const AdvanceGateSchema = z.object({
  engagementId: z.string().uuid(),
  scores: z.record(z.string(), z.number()),
  approvedBy: z.string(),
  notes: z.string().optional(),
  outcome: z.enum(["commit", "conditional_go", "hold", "clear", "ceo_override"]).default("commit"),
  conditions: z.array(z.string()).default([]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: gateId } = await params;
  const body = await req.json();
  const parsed = AdvanceGateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { engagementId, scores, approvedBy, notes, outcome, conditions } = parsed.data;
  const log = (msg: string, data?: Record<string, unknown>) =>
    console.log(JSON.stringify({ ts: new Date().toISOString(), route: "gates/advance", msg, engagementId, outcome, gateId, ...data }));

  log("gate_advance_start");

  try {
  const [engagement] = await db
    .select()
    .from(engagements)
    .where(eq(engagements.id, engagementId));

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  const currentGate = engagement.currentGate as GateNumber;
  const gateDef = GATE_DEFINITIONS[currentGate];

  const { allowed, failedThresholds, warnings } = canAdvanceGate(currentGate, scores);

  // HOLD outcome: record block, return without advancing
  if (outcome === "hold") {
    const [existingGate] = await db
      .select()
      .from(gateRecords)
      .where(and(eq(gateRecords.engagementId, engagementId), eq(gateRecords.gateNumber, currentGate)));

    if (existingGate) {
      await db
        .update(gateRecords)
        .set({ status: "blocked", outcome: "hold", hardBlockActive: gateDef.hardBlock, updatedAt: new Date() })
        .where(eq(gateRecords.id, existingGate.id));
    }
    return NextResponse.json({ success: false, outcome: "hold", message: "Gate placed on HOLD" });
  }

  // COMMIT / CONDITIONAL_GO / CEO_OVERRIDE: all advance the gate
  const advancingOutcomes = ["commit", "conditional_go", "ceo_override"] as const;
  const isAdvancing = advancingOutcomes.includes(outcome as typeof advancingOutcomes[number]);

  if (!allowed && !isAdvancing) {
    return NextResponse.json(
      { error: "Gate advancement blocked", failedThresholds, warnings, hardBlock: gateDef.hardBlock },
      { status: 422 }
    );
  }

  if (!allowed && outcome === "commit") {
    return NextResponse.json(
      { error: "Score thresholds not met. Use CONDITIONAL_GO or CEO_OVERRIDE to advance with conditions.", failedThresholds, warnings },
      { status: 422 }
    );
  }

  // Build ledger entry
  buildGatePackage(engagementId, currentGate, scores, approvedBy, notes);
  const ledgerEntry = await recordGateApproval({ engagementId, gateNumber: currentGate, scores, approvedBy, notes });

  const nextGate = (currentGate + 1) as GateNumber;
  const nextPhase = PHASE_MAP[nextGate] ?? "debrief";

  // Update gate record to passed with outcome
  const [existingGate] = await db
    .select()
    .from(gateRecords)
    .where(and(eq(gateRecords.engagementId, engagementId), eq(gateRecords.gateNumber, currentGate)));

  if (existingGate) {
    await db
      .update(gateRecords)
      .set({
        status: "passed",
        outcome,
        thresholdsPassed: Object.fromEntries(
          gateDef.requiredThresholds.map((t) => [t.key, (scores[t.key] ?? 0) >= t.minScore])
        ),
        resilienceScore: scores.resilience_score,
        harnessScore: scores.harness_score,
        evidenceHash: ledgerEntry.sha256Hash,
        approvedBy,
        conditionsNotes: conditions.join("\n"),
        passedAt: new Date(),
        hardBlockActive: false,
        updatedAt: new Date(),
      })
      .where(eq(gateRecords.id, existingGate.id));
  }

  // Create formal gate review record
  const [review] = await db
    .insert(gateReviews)
    .values({
      gateRecordId: existingGate?.id ?? engagementId,
      engagementId,
      gateNumber: currentGate,
      outcome,
      scores,
      reviewedBy: approvedBy,
      notes,
      conditionsList: conditions,
      evidenceHash: ledgerEntry.sha256Hash,
    })
    .returning();

  // CONDITIONAL_GO: auto-create remediation actions for each condition
  let remediationItems: { id: string; title: string }[] = [];
  if (outcome === "conditional_go" && conditions.length > 0) {
    const inserted = await db
      .insert(remediationActions)
      .values(
        conditions.map((cond, idx) => ({
          engagementId,
          gateReviewId: review.id,
          title: cond,
          description: `Required condition from Gate ${currentGate} CONDITIONAL GO decision`,
          status: "todo" as const,
          priority: "high",
          gateNumber: currentGate,
        }))
      )
      .returning();
    remediationItems = inserted.map((r) => ({ id: r.id, title: r.title }));
  }

  // Unlock next gate
  if (nextGate <= 5) {
    await db
      .update(gateRecords)
      .set({ status: "active", updatedAt: new Date() })
      .where(and(eq(gateRecords.engagementId, engagementId), eq(gateRecords.gateNumber, nextGate)));

    await db
      .update(engagements)
      .set({ currentGate: nextGate, currentPhase: nextPhase, updatedAt: new Date() })
      .where(eq(engagements.id, engagementId));
  }

  // Trigger financial invoice if applicable
  let invoiceResult = null;
  if (gateDef.financialTrigger) {
    invoiceResult = await financialAgent.triggerGateInvoice({
      engagementId,
      gateNumber: currentGate as 2 | 4 | 5,
      trigger: gateDef.financialTrigger,
    });
  }

  // Monday.com gate advancement notification (non-blocking, G2 and G5 carry invoice amounts)
  const sector: LicensingSector =
    (engagement.metadata as Record<string, unknown>)?.licensingSector === "NONPROFIT"
      ? "NONPROFIT"
      : "COMMERCIAL";
  notifyMondayGateAdvancement({
    engagementId,
    clientName: engagement.clientName,
    gateNumber: currentGate,
    sector,
    invoiceAmount: invoiceResult?.output.amountDue as number | undefined,
  }).catch(() => {/* non-critical */});

  // Gate briefing (non-blocking)
  communicationsAgent
    .generateGateBriefing({
      engagementId,
      gateNumber: currentGate,
      clientName: engagement.clientName,
      scores,
      invoiceTriggered: !!gateDef.financialTrigger,
      invoiceAmount: invoiceResult?.output.amountDue as number | undefined,
    })
    .catch(() => {/* non-critical */});

  log("gate_advance_complete", { nextGate, outcome, remediations: remediationItems.length });
  return NextResponse.json({
    success: true,
    outcome,
    gateAdvanced: currentGate,
    nextGate,
    nextPhase,
    evidenceHash: ledgerEntry.sha256Hash,
    warnings,
    invoice: invoiceResult?.output ?? null,
    remediationActions: remediationItems,
    reviewId: review.id,
  });
  } catch (err) {
    console.error(JSON.stringify({ ts: new Date().toISOString(), route: "gates/advance", error: err instanceof Error ? err.message : String(err), engagementId, gateId }));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

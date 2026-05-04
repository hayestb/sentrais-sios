import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { engagements, gateRecords, evidenceEntries } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { writeToLedger } from "@/lib/ledger/evidence";
import { z } from "zod";

const Blueprint360Schema = z.object({
  scores: z.record(z.string(), z.number()),
  resilienceScore: z.number().min(0).max(100),
  approvedBy: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = Blueprint360Schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { scores, resilienceScore, approvedBy } = parsed.data;

  const [engagement] = await db
    .select()
    .from(engagements)
    .where(eq(engagements.id, id));

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  // Write to Evidence Ledger
  const entry = await writeToLedger({
    engagementId: id,
    entryType: "blueprint360_assessment",
    subject: `Blueprint360 Assessment Locked — ${engagement.clientName} — Score: ${resilienceScore}%`,
    payload: {
      scores,
      resilienceScore,
      gate2Eligible: resilienceScore >= 80,
      dimensions: Object.keys(scores).length,
    },
    authorAgent: "assessment",
    authorHuman: approvedBy,
    gateNumber: 2,
  });

  // Update Gate 2 record with resilience score if it exists
  const [gate2] = await db
    .select()
    .from(gateRecords)
    .where(and(eq(gateRecords.engagementId, id), eq(gateRecords.gateNumber, 2)));

  if (gate2) {
    await db
      .update(gateRecords)
      .set({
        resilienceScore,
        evidenceHash: entry.sha256Hash,
        updatedAt: new Date(),
      })
      .where(eq(gateRecords.id, gate2.id));
  }

  return NextResponse.json({
    locked: true,
    resilienceScore,
    gate2Eligible: resilienceScore >= 80,
    evidenceHash: entry.sha256Hash,
    entryId: entry.id,
  });
}

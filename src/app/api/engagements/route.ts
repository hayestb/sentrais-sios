import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { engagements, gateRecords, raciAssignments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { GATE_DEFINITIONS, PHASE_MAP } from "@/lib/workflow/golden-path";
import { DEFAULT_RACI_MATRIX } from "@/lib/sprint/cadence";
import { writeToLedger } from "@/lib/ledger/evidence";

const CreateEngagementSchema = z.object({
  clientName: z.string().min(1),
  vertical: z.string().min(1),
  contractValue: z.number().positive(),
  entryPoint: z.string().optional(),
  governanceStandard: z.string().optional(),
});

export async function GET() {
  const rows = await db
    .select()
    .from(engagements)
    .orderBy(desc(engagements.createdAt));

  return NextResponse.json({ engagements: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateEngagementSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Create engagement
  const [engagement] = await db
    .insert(engagements)
    .values({
      clientName: data.clientName,
      vertical: data.vertical,
      contractValue: data.contractValue,
      entryPoint: data.entryPoint,
      governanceStandard: data.governanceStandard ?? "SIOS Agentic Framework",
      status: "active",
      currentPhase: "discover",
      currentGate: 0,
      sprintNumber: 1,
    })
    .returning();

  // Initialize all 6 gate records
  const gateValues = ([0, 1, 2, 3, 4, 5] as const).map((gateNum) => ({
    engagementId: engagement.id,
    gateNumber: gateNum,
    status: gateNum === 0 ? ("active" as const) : ("locked" as const),
    hardBlockActive: false,
  }));

  await db.insert(gateRecords).values(gateValues);

  // Seed default RACI matrix
  const raciValues = Object.entries(DEFAULT_RACI_MATRIX).map(([roleId, def]) => ({
    engagementId: engagement.id,
    roleId,
    displayName: def.role,
    email: def.email,
    raciRole: "accountable" as const,
    decisionAuthority: def.decisionAuthority,
    boundary: def.boundary,
    aiCounterpart: def.aiCounterpart,
  }));

  await db.insert(raciAssignments).values(raciValues);

  // Record engagement creation in Evidence Ledger
  await writeToLedger({
    engagementId: engagement.id,
    entryType: "gate_approval",
    subject: `Engagement Created: ${data.clientName}`,
    gateNumber: 0,
    payload: {
      clientName: data.clientName,
      vertical: data.vertical,
      contractValue: data.contractValue,
      governanceStandard: data.governanceStandard,
    },
    authorAgent: "governance",
  });

  return NextResponse.json({ engagement }, { status: 201 });
}

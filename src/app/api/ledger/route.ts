import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { evidenceEntries } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { verifyLedgerIntegrity, writeToLedger } from "@/lib/ledger/evidence";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const engagementId = searchParams.get("engagementId");
  const entryType = searchParams.get("entryType");
  const limit = Number(searchParams.get("limit") ?? "50");
  const verify = searchParams.get("verify") === "true";

  const conditions = [];
  if (engagementId) conditions.push(eq(evidenceEntries.engagementId, engagementId));
  if (entryType) conditions.push(eq(evidenceEntries.entryType, entryType));

  const entries = await db
    .select()
    .from(evidenceEntries)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(evidenceEntries.createdAt))
    .limit(Math.min(limit, 200));

  let integrity = null;
  if (verify && engagementId) {
    integrity = await verifyLedgerIntegrity(engagementId);
  }

  return NextResponse.json({ entries, integrity, total: entries.length });
}

const WriteSchema = z.object({
  engagementId: z.string().uuid().optional(),
  entryType: z.string(),
  subject: z.string(),
  payload: z.record(z.string(), z.unknown()),
  authorHuman: z.string().optional(),
  gateNumber: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = WriteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const entry = await writeToLedger(parsed.data as Parameters<typeof writeToLedger>[0]);

  return NextResponse.json({ entry }, { status: 201 });
}

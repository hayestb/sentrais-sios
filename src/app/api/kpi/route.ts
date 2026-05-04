import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { kpiSnapshots } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const engagementId = req.nextUrl.searchParams.get("engagementId");
  const rows = engagementId
    ? await db.select().from(kpiSnapshots).where(eq(kpiSnapshots.engagementId, engagementId)).orderBy(desc(kpiSnapshots.capturedAt))
    : await db.select().from(kpiSnapshots).orderBy(desc(kpiSnapshots.capturedAt)).limit(100);
  return NextResponse.json({ snapshots: rows });
}

const SnapshotSchema = z.object({
  engagementId: z.string().uuid(),
  kpiKey: z.string(),
  kpiLabel: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  target: z.number().optional(),
  trend: z.string().optional(),
  vertical: z.string().optional(),
  sprintNumber: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = SnapshotSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [snapshot] = await db.insert(kpiSnapshots).values(parsed.data).returning();
  return NextResponse.json({ snapshot });
}

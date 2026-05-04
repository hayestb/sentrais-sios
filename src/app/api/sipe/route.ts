import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { sipeEntries, engagements } from "@/lib/db/schema";
import { eq, desc, and, ilike } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const vertical = url.searchParams.get("vertical");
  const phase = url.searchParams.get("phase");
  const search = url.searchParams.get("search");

  const conditions = [];
  if (category) conditions.push(eq(sipeEntries.category, category));
  if (vertical) conditions.push(eq(sipeEntries.vertical, vertical));
  if (search) conditions.push(ilike(sipeEntries.content, `%${search}%`));

  const rows = await db
    .select({
      entry: sipeEntries,
      clientName: engagements.clientName,
    })
    .from(sipeEntries)
    .leftJoin(engagements, eq(sipeEntries.engagementId, engagements.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(sipeEntries.createdAt))
    .limit(100);

  // Filter by phase client-side since phases is jsonb array
  const filtered = phase
    ? rows.filter((r) => (r.entry.applicablePhases as string[])?.includes(phase))
    : rows;

  const categories = ["pattern", "lesson", "playbook", "benchmark"];
  const counts = Object.fromEntries(
    categories.map((c) => [c, rows.filter((r) => r.entry.category === c).length])
  );

  return NextResponse.json({ entries: filtered, counts, total: filtered.length });
}

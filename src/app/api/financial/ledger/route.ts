import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { evidenceEntries } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/current-user";
import type { EvidenceEntryType } from "@/lib/ledger/evidence";

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "sysadmin" && profile.role !== "admin") {
    return NextResponse.json({ error: "Restricted to admins." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const entryType = searchParams.get("type") as EvidenceEntryType | null;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);

  const query = db
    .select()
    .from(evidenceEntries)
    .orderBy(desc(evidenceEntries.createdAt))
    .limit(limit);

  const entries = entryType
    ? await query.where(eq(evidenceEntries.entryType, entryType))
    : await query;

  return NextResponse.json({ entries });
}

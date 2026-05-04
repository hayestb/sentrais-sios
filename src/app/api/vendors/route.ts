import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { vendors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const engagementId = req.nextUrl.searchParams.get("engagementId");
  const rows = engagementId
    ? await db.select().from(vendors).where(eq(vendors.engagementId, engagementId))
    : await db.select().from(vendors);
  return NextResponse.json({ vendors: rows });
}

const VendorSchema = z.object({
  engagementId: z.string().uuid().optional(),
  name: z.string(),
  category: z.string(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  contractValue: z.number().optional(),
  contractStart: z.string().optional(),
  contractEnd: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = VendorSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [vendor] = await db
    .insert(vendors)
    .values({
      ...parsed.data,
      contractStart: parsed.data.contractStart ? new Date(parsed.data.contractStart) : undefined,
      contractEnd: parsed.data.contractEnd ? new Date(parsed.data.contractEnd) : undefined,
    })
    .returning();
  return NextResponse.json({ vendor });
}

export async function PATCH(req: NextRequest) {
  const { id, status, complianceScore, notes } = await req.json();
  const [updated] = await db
    .update(vendors)
    .set({ ...(status && { status }), ...(complianceScore != null && { complianceScore }), ...(notes && { notes }), updatedAt: new Date() })
    .where(eq(vendors.id, id))
    .returning();
  return NextResponse.json({ vendor: updated });
}

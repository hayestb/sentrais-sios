import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { crmDeals, engagements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const deals = await db.select().from(crmDeals);
  return NextResponse.json({ deals });
}

const DealSchema = z.object({
  companyName: z.string(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  stage: z.enum(["prospect", "discovery", "proposal", "scoping", "negotiation", "closed_won", "closed_lost", "live"]).default("prospect"),
  vertical: z.string().optional(),
  estimatedValue: z.number().optional(),
  probability: z.number().min(0).max(100).default(10),
  expectedCloseDate: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = DealSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [deal] = await db
    .insert(crmDeals)
    .values({
      ...parsed.data,
      expectedCloseDate: parsed.data.expectedCloseDate ? new Date(parsed.data.expectedCloseDate) : undefined,
    })
    .returning();

  return NextResponse.json({ deal });
}

export async function PATCH(req: NextRequest) {
  const { id, stage, probability, notes } = await req.json();
  const [updated] = await db
    .update(crmDeals)
    .set({ stage, probability, notes, updatedAt: new Date() })
    .where(eq(crmDeals.id, id))
    .returning();
  return NextResponse.json({ deal: updated });
}

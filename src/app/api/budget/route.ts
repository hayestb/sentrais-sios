import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { budgetMilestones } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const engagementId = req.nextUrl.searchParams.get("engagementId");
  const milestones = engagementId
    ? await db.select().from(budgetMilestones).where(eq(budgetMilestones.engagementId, engagementId))
    : await db.select().from(budgetMilestones);
  return NextResponse.json({ milestones });
}

const MilestoneSchema = z.object({
  engagementId: z.string().uuid(),
  label: z.string(),
  amount: z.number(),
  spentToDate: z.number().default(0),
  dueDate: z.string().optional(),
  gateNumber: z.number().optional(),
  alertThreshold: z.number().default(0.85),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = MilestoneSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [milestone] = await db
    .insert(budgetMilestones)
    .values({ ...parsed.data, dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined })
    .returning();
  return NextResponse.json({ milestone });
}

export async function PATCH(req: NextRequest) {
  const { id, spentToDate, completedAt } = await req.json();
  const [updated] = await db
    .update(budgetMilestones)
    .set({ ...(spentToDate != null && { spentToDate }), ...(completedAt && { completedAt: new Date(completedAt) }) })
    .where(eq(budgetMilestones.id, id))
    .returning();
  return NextResponse.json({ milestone: updated });
}

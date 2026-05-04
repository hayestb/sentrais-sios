import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { innovationIdeas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const engagementId = req.nextUrl.searchParams.get("engagementId");
  const phase = req.nextUrl.searchParams.get("phase");

  const all = await db.select().from(innovationIdeas);
  const filtered = all.filter((i) => {
    if (engagementId && i.engagementId !== engagementId) return false;
    if (phase && i.phase !== phase) return false;
    return true;
  });
  return NextResponse.json({ ideas: filtered });
}

const IdeaSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  phase: z.enum(["i1_capture", "i2_feasibility", "i3_lab", "i4_prototype", "i5_validation", "i6_scale"]).default("i1_capture"),
  engagementId: z.string().uuid().optional(),
  submittedBy: z.string().optional(),
  vertical: z.string().optional(),
  feasibilityScore: z.number().min(0).max(10).optional(),
  impactScore: z.number().min(0).max(10).optional(),
  effortScore: z.number().min(0).max(10).optional(),
  tags: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = IdeaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ninTag = `LAB-INNOV-${parsed.data.phase.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const [idea] = await db.insert(innovationIdeas).values({ ...parsed.data, ninTag }).returning();
  return NextResponse.json({ idea });
}

export async function PATCH(req: NextRequest) {
  const { id, phase, status, feasibilityScore, impactScore, effortScore } = await req.json();
  const [updated] = await db
    .update(innovationIdeas)
    .set({ phase, status, feasibilityScore, impactScore, effortScore, updatedAt: new Date() })
    .where(eq(innovationIdeas.id, id))
    .returning();
  return NextResponse.json({ idea: updated });
}

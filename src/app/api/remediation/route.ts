import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { remediationActions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const engagementId = req.nextUrl.searchParams.get("engagementId");
  const actions = engagementId
    ? await db.select().from(remediationActions).where(eq(remediationActions.engagementId, engagementId))
    : await db.select().from(remediationActions);
  return NextResponse.json({ actions });
}

const PatchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  assignedTo: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { id, status, assignedTo } = parsed.data;
  const [updated] = await db
    .update(remediationActions)
    .set({
      ...(status && { status }),
      ...(assignedTo && { assignedTo }),
      ...(status === "done" && { completedAt: new Date() }),
      updatedAt: new Date(),
    })
    .where(eq(remediationActions.id, id))
    .returning();

  return NextResponse.json({ action: updated });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [created] = await db
    .insert(remediationActions)
    .values({
      engagementId: body.engagementId,
      title: body.title,
      description: body.description,
      priority: body.priority ?? "medium",
      assignedTo: body.assignedTo,
      gateNumber: body.gateNumber,
      ninTag: body.ninTag,
    })
    .returning();
  return NextResponse.json({ action: created });
}

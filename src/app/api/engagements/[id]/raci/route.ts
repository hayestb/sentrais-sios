import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { raciAssignments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const AddRaciSchema = z.object({
  roleId: z.string(),
  displayName: z.string(),
  email: z.string().optional(),
  raciRole: z.enum(["responsible", "accountable", "consulted", "informed"]),
  phase: z.enum(["discover", "diagnose", "design", "deploy", "debrief"]).optional().nullable(),
  decisionAuthority: z.string().optional(),
  boundary: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const raci = await db
    .select()
    .from(raciAssignments)
    .where(eq(raciAssignments.engagementId, id))
    .orderBy(raciAssignments.createdAt);

  return NextResponse.json({ raci });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = AddRaciSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [row] = await db
    .insert(raciAssignments)
    .values({
      engagementId: id,
      roleId: parsed.data.roleId,
      displayName: parsed.data.displayName,
      email: parsed.data.email,
      raciRole: parsed.data.raciRole,
      phase: parsed.data.phase ?? undefined,
      decisionAuthority: parsed.data.decisionAuthority,
      boundary: parsed.data.boundary,
    })
    .returning();

  return NextResponse.json({ raci: row }, { status: 201 });
}

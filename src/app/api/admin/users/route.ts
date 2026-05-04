import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { profiles, auditLog } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentRole } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

async function assertSysadmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const role = await getCurrentRole();
  return role === "sysadmin";
}

export async function GET() {
  if (!await assertSysadmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await db.select().from(profiles).orderBy(desc(profiles.createdAt));
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  if (!await assertSysadmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, fullName, role } = await req.json();
  if (!email || !fullName) return NextResponse.json({ error: "email and fullName required" }, { status: 400 });

  const [profile] = await db
    .insert(profiles)
    .values({ email, fullName, role: role ?? "analyst" })
    .onConflictDoNothing()
    .returning();

  const { userId } = await auth();
  await db.insert(auditLog).values({
    actorClerkId: userId,
    action: "user.invited",
    targetType: "profile",
    targetId: profile?.id,
    payload: { email, role: role ?? "analyst" },
  });

  return NextResponse.json({ profile }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await assertSysadmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, role, active } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (role !== undefined) updates.role = role;
  if (active !== undefined) updates.active = active;

  const [updated] = await db.update(profiles).set(updates).where(eq(profiles.id, id)).returning();

  const { userId } = await auth();
  const action = role !== undefined ? "role.changed" : active === false ? "user.deactivated" : "user.activated";
  await db.insert(auditLog).values({
    actorClerkId: userId,
    action,
    targetType: "profile",
    targetId: id,
    payload: updates,
  });

  return NextResponse.json({ profile: updated });
}

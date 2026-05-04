import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { notifications } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get("profileId");
  const rows = profileId
    ? await db.select().from(notifications).where(eq(notifications.profileId, profileId)).orderBy(desc(notifications.createdAt)).limit(50)
    : await db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(50);
  return NextResponse.json({ notifications: rows });
}

export async function PATCH(req: NextRequest) {
  const { id } = await req.json();
  const [updated] = await db.update(notifications).set({ read: true }).where(eq(notifications.id, id)).returning();
  return NextResponse.json({ notification: updated });
}

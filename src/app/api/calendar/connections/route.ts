import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { profiles, calendarTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db.select().from(profiles).where(eq(profiles.clerkId, userId)).limit(1);
  if (!profile) return NextResponse.json({ google: false, outlook: false });

  const tokens = await db.select({
    provider: calendarTokens.provider,
    syncEnabled: calendarTokens.syncEnabled,
    lastSyncedAt: calendarTokens.lastSyncedAt,
    expiresAt: calendarTokens.expiresAt,
  }).from(calendarTokens).where(eq(calendarTokens.profileId, profile.id));

  const google = tokens.find((t) => t.provider === "google");
  const outlook = tokens.find((t) => t.provider === "outlook");

  return NextResponse.json({
    google: google ? { connected: true, syncEnabled: google.syncEnabled, lastSyncedAt: google.lastSyncedAt, expired: google.expiresAt ? new Date(google.expiresAt) < new Date() : false } : { connected: false },
    outlook: outlook ? { connected: true, syncEnabled: outlook.syncEnabled, lastSyncedAt: outlook.lastSyncedAt, expired: outlook.expiresAt ? new Date(outlook.expiresAt) < new Date() : false } : { connected: false },
  });
}

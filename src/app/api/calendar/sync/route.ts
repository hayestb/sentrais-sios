import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { profiles, calendarTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/calendar/encrypt";

export const dynamic = "force-dynamic";

type CalEvent = { id: string; date: string; title: string; subtitle?: string; type: string; engagementName?: string };
type Provider = "google" | "outlook";

async function refreshGoogle(token: typeof calendarTokens.$inferSelect) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: decrypt(token.refreshTokenEnc!),
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error("Google token refresh failed");
  const { access_token, expires_in } = await res.json() as { access_token: string; expires_in: number };
  const expiresAt = new Date(Date.now() + expires_in * 1000);
  await db.update(calendarTokens).set({ accessTokenEnc: encrypt(access_token), expiresAt, updatedAt: new Date() }).where(eq(calendarTokens.id, token.id));
  return access_token;
}

async function refreshOutlook(token: typeof calendarTokens.$inferSelect) {
  const res = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      refresh_token: decrypt(token.refreshTokenEnc!),
      grant_type: "refresh_token",
      scope: "Calendars.ReadWrite offline_access",
    }),
  });
  if (!res.ok) throw new Error("Outlook token refresh failed");
  const { access_token, expires_in } = await res.json() as { access_token: string; expires_in: number };
  const expiresAt = new Date(Date.now() + expires_in * 1000);
  await db.update(calendarTokens).set({ accessTokenEnc: encrypt(access_token), expiresAt, updatedAt: new Date() }).where(eq(calendarTokens.id, token.id));
  return access_token;
}

async function getAccessToken(token: typeof calendarTokens.$inferSelect, provider: Provider): Promise<string> {
  const isExpired = token.expiresAt && new Date(token.expiresAt) <= new Date(Date.now() + 60_000);
  if (!isExpired) return decrypt(token.accessTokenEnc);
  if (!token.refreshTokenEnc) throw new Error("Token expired and no refresh token. Please reconnect.");
  return provider === "google" ? refreshGoogle(token) : refreshOutlook(token);
}

async function pushToGoogle(accessToken: string, calendarId: string, events: CalEvent[]) {
  let synced = 0;
  for (const ev of events) {
    const start = new Date(ev.date);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: ev.title,
        description: [ev.subtitle, ev.engagementName].filter(Boolean).join(" · "),
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        source: { title: "SIOS", url: process.env.NEXT_PUBLIC_APP_URL },
        extendedProperties: { private: { siosId: ev.id, siosType: ev.type } },
      }),
    });
    if (res.ok) synced++;
  }
  return synced;
}

async function pushToOutlook(accessToken: string, events: CalEvent[]) {
  let synced = 0;
  for (const ev of events) {
    const start = new Date(ev.date);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const res = await fetch("https://graph.microsoft.com/v1.0/me/events", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: ev.title,
        body: { contentType: "text", content: [ev.subtitle, ev.engagementName].filter(Boolean).join(" · ") },
        start: { dateTime: start.toISOString(), timeZone: "UTC" },
        end: { dateTime: end.toISOString(), timeZone: "UTC" },
        categories: ["SIOS"],
      }),
    });
    if (res.ok) synced++;
  }
  return synced;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider } = await req.json() as { provider: Provider };
  if (provider !== "google" && provider !== "outlook") {
    return NextResponse.json({ error: "provider must be google or outlook" }, { status: 400 });
  }

  const [profile] = await db.select().from(profiles).where(eq(profiles.clerkId, userId)).limit(1);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const [token] = await db.select().from(calendarTokens)
    .where(and(eq(calendarTokens.profileId, profile.id), eq(calendarTokens.provider, provider)))
    .limit(1);

  if (!token) {
    return NextResponse.json({ connected: false, connectUrl: `/api/calendar/${provider}/connect` });
  }

  const baseUrl = req.nextUrl.origin;
  const { events } = await fetch(`${baseUrl}/api/calendar/events`).then((r) => r.json()) as { events: CalEvent[] };
  const futureEvents = (events ?? []).filter((e) => new Date(e.date) >= new Date());

  if (!futureEvents.length) {
    return NextResponse.json({ synced: 0, message: "No upcoming events to sync" });
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken(token, provider);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Token error", connectUrl: `/api/calendar/${provider}/connect` }, { status: 401 });
  }

  const synced = provider === "google"
    ? await pushToGoogle(accessToken, token.calendarId ?? "primary", futureEvents)
    : await pushToOutlook(accessToken, futureEvents);

  await db.update(calendarTokens).set({ lastSyncedAt: new Date(), updatedAt: new Date() }).where(eq(calendarTokens.id, token.id));

  return NextResponse.json({ synced, total: futureEvents.length, provider });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { profiles, calendarTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { encrypt } from "@/lib/calendar/encrypt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (error || !code || !state) {
    return NextResponse.redirect(`${appUrl}/calendar?error=google_denied`);
  }

  let userId: string;
  try {
    ({ userId } = JSON.parse(Buffer.from(state, "base64url").toString()));
  } catch {
    return NextResponse.redirect(`${appUrl}/calendar?error=invalid_state`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${appUrl}/api/calendar/google/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
  });

  if (!tokenRes.ok) {
    console.error("Google token exchange failed", await tokenRes.text());
    return NextResponse.redirect(`${appUrl}/calendar?error=token_exchange`);
  }

  const { access_token, refresh_token, expires_in } = await tokenRes.json() as {
    access_token: string; refresh_token?: string; expires_in: number;
  };

  // Get primary calendar ID
  const calRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const calendarId = calRes.ok ? ((await calRes.json()) as { id: string }).id : "primary";

  // Find or create profile
  const [profile] = await db.select().from(profiles).where(eq(profiles.clerkId, userId)).limit(1);
  if (!profile) return NextResponse.redirect(`${appUrl}/calendar?error=no_profile`);

  const expiresAt = new Date(Date.now() + expires_in * 1000);
  const accessTokenEnc = encrypt(access_token);
  const refreshTokenEnc = refresh_token ? encrypt(refresh_token) : null;

  // Upsert token record
  const existing = await db.select().from(calendarTokens)
    .where(and(eq(calendarTokens.profileId, profile.id), eq(calendarTokens.provider, "google")))
    .limit(1);

  if (existing[0]) {
    await db.update(calendarTokens).set({
      accessTokenEnc, refreshTokenEnc: refreshTokenEnc ?? existing[0].refreshTokenEnc,
      expiresAt, calendarId, syncEnabled: true, updatedAt: new Date(),
    }).where(eq(calendarTokens.id, existing[0].id));
  } else {
    await db.insert(calendarTokens).values({
      profileId: profile.id, provider: "google",
      accessTokenEnc, refreshTokenEnc, expiresAt, calendarId, syncEnabled: true,
    });
  }

  return NextResponse.redirect(`${appUrl}/calendar?connected=google`);
}

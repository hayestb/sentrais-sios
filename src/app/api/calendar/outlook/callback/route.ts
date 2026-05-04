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
    return NextResponse.redirect(`${appUrl}/calendar?error=outlook_denied`);
  }

  let userId: string;
  try {
    ({ userId } = JSON.parse(Buffer.from(state, "base64url").toString()));
  } catch {
    return NextResponse.redirect(`${appUrl}/calendar?error=invalid_state`);
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID!;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!;
  const redirectUri = `${appUrl}/api/calendar/outlook/callback`;

  const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code", scope: "Calendars.ReadWrite offline_access" }),
  });

  if (!tokenRes.ok) {
    console.error("Outlook token exchange failed", await tokenRes.text());
    return NextResponse.redirect(`${appUrl}/calendar?error=token_exchange`);
  }

  const { access_token, refresh_token, expires_in } = await tokenRes.json() as {
    access_token: string; refresh_token?: string; expires_in: number;
  };

  const [profile] = await db.select().from(profiles).where(eq(profiles.clerkId, userId)).limit(1);
  if (!profile) return NextResponse.redirect(`${appUrl}/calendar?error=no_profile`);

  const expiresAt = new Date(Date.now() + expires_in * 1000);
  const accessTokenEnc = encrypt(access_token);
  const refreshTokenEnc = refresh_token ? encrypt(refresh_token) : null;

  const existing = await db.select().from(calendarTokens)
    .where(and(eq(calendarTokens.profileId, profile.id), eq(calendarTokens.provider, "outlook")))
    .limit(1);

  if (existing[0]) {
    await db.update(calendarTokens).set({
      accessTokenEnc, refreshTokenEnc: refreshTokenEnc ?? existing[0].refreshTokenEnc,
      expiresAt, syncEnabled: true, updatedAt: new Date(),
    }).where(eq(calendarTokens.id, existing[0].id));
  } else {
    await db.insert(calendarTokens).values({
      profileId: profile.id, provider: "outlook",
      accessTokenEnc, refreshTokenEnc, expiresAt, syncEnabled: true,
    });
  }

  return NextResponse.redirect(`${appUrl}/calendar?connected=outlook`);
}

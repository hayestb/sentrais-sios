import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider } = await req.json();
  if (provider !== "google" && provider !== "outlook") {
    return NextResponse.json({ error: "provider must be google or outlook" }, { status: 400 });
  }

  // Fetch events from our own API
  const baseUrl = req.nextUrl.origin;
  const eventsRes = await fetch(`${baseUrl}/api/calendar/events`);
  const { events } = await eventsRes.json();

  if (!events?.length) return NextResponse.json({ synced: 0 });

  // For Google Calendar: redirect to OAuth connect if no token
  // For now return connection guidance — full OAuth requires GOOGLE_CLIENT_ID / MICROSOFT_CLIENT_ID env vars
  const connectUrl = provider === "google"
    ? `${baseUrl}/api/calendar/google/connect`
    : `${baseUrl}/api/calendar/outlook/connect`;

  return NextResponse.json({
    message: `To sync ${events.length} events to ${provider}, connect your calendar first.`,
    connectUrl,
    eventCount: events.length,
    // In production: check calendarTokens table for this user's token,
    // then call Google Calendar API / Microsoft Graph to create events.
  });
}

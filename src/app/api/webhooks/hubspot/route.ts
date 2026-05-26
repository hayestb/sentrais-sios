// POST /api/webhooks/hubspot
// Receives HubSpot deal property-change subscription events.
// Validates the X-HubSpot-Signature-v3 HMAC header, fetches full deal data,
// and syncs the stage mutation to the appropriate Monday.com tenant board.

import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import {
  fetchHubSpotDeal,
  isValidDealStage,
  isValidSector,
  type HubSpotWebhookEvent,
} from "@/lib/integrations/hubspot";
import { reconcilePipelineMutation } from "@/lib/integrations/hubspot-monday-sync";

function verifyHubSpotSignature(
  rawBody: string,
  signature: string,
  requestUri: string,
  timestamp: string
): boolean {
  const secret = process.env.HUBSPOT_WEBHOOK_SECRET;
  if (!secret) return false;

  // HubSpot v3 signature: HMAC-SHA256 of (clientSecret + httpMethod + uri + body + timestamp)
  const method = "POST";
  const source = `${secret}${method}${requestUri}${rawBody}${timestamp}`;
  const digest = createHmac("sha256", secret).update(source).digest("base64");

  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hubspot-signature-v3") ?? "";
  const timestamp = req.headers.get("x-hubspot-request-timestamp") ?? "";
  const requestUri = `${req.nextUrl.protocol}//${req.nextUrl.host}${req.nextUrl.pathname}`;

  if (!verifyHubSpotSignature(rawBody, signature, requestUri, timestamp)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let events: HubSpotWebhookEvent[];
  try {
    events = JSON.parse(rawBody) as HubSpotWebhookEvent[];
  } catch {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  // Process only deal stage change events; ack everything else immediately
  const stageEvents = events.filter(
    (e) =>
      e.subscriptionType === "deal.propertyChange" &&
      e.propertyName === "dealstage"
  );

  for (const event of stageEvents) {
    try {
      const dealId = String(event.objectId);
      const props = await fetchHubSpotDeal(dealId);

      const stage = props.dealstage ?? "";
      const sector = (props.legal_licensing_sector ?? "").toUpperCase();

      if (!isValidDealStage(stage)) {
        console.warn(`[hubspot-webhook] Unknown deal stage "${stage}" for deal ${dealId}`);
        continue;
      }

      await reconcilePipelineMutation({
        dealId,
        dealName: props.dealname ?? `Deal ${dealId}`,
        dealStage: stage,
        licensingSector: isValidSector(sector) ? sector : "COMMERCIAL",
        estimatedRevenue: parseFloat(props.amount ?? "0"),
      });
    } catch (err) {
      // Log but don't 500 — HubSpot will retry on non-2xx; we ack all events
      console.error(
        JSON.stringify({
          ts: new Date().toISOString(),
          route: "webhooks/hubspot",
          error: err instanceof Error ? err.message : String(err),
          eventId: event.eventId,
        })
      );
    }
  }

  return NextResponse.json({ received: events.length, processed: stageEvents.length });
}

// HubSpot CRM API client — deal property fetching and webhook type definitions

export type HubSpotDealStage =
  | "appointment_scheduled"
  | "contract_sent"
  | "closed_won"
  | "closed_lost";

export type LicensingSector = "COMMERCIAL" | "NONPROFIT";

export interface HubSpotDealMutation {
  dealId: string;
  dealName: string;
  dealStage: HubSpotDealStage;
  licensingSector: LicensingSector;
  estimatedRevenue: number;
}

// Shape of a single event in the HubSpot subscription webhook payload array
export interface HubSpotWebhookEvent {
  eventId: number;
  subscriptionId: number;
  portalId: number;
  appId: number;
  occurredAt: number;
  subscriptionType: string;
  attemptNumber: number;
  objectId: number;
  propertyName?: string;
  propertyValue?: string;
  changeSource?: string;
}

interface HubSpotDealProperties {
  dealname?: string;
  dealstage?: string;
  amount?: string;
  legal_licensing_sector?: string;
}

export async function fetchHubSpotDeal(
  dealId: string
): Promise<HubSpotDealProperties> {
  const apiKey = process.env.HUBSPOT_API_KEY;
  if (!apiKey) throw new Error("HUBSPOT_API_KEY is not configured");

  const props = "dealname,dealstage,amount,legal_licensing_sector";
  const res = await fetch(
    `https://api.hubapi.com/crm/v3/objects/deals/${dealId}?properties=${props}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`HubSpot API ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as { properties: HubSpotDealProperties };
  return json.properties;
}

export function isValidDealStage(s: string): s is HubSpotDealStage {
  return ["appointment_scheduled", "contract_sent", "closed_won", "closed_lost"].includes(s);
}

export function isValidSector(s: string): s is LicensingSector {
  return s === "COMMERCIAL" || s === "NONPROFIT";
}

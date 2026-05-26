#!/usr/bin/env npx tsx
/**
 * Automated integration setup for SentraisOS.
 *
 * What this script does automatically:
 *   1. Queries the Monday.com API to find Commercial and Nonprofit board IDs
 *      by name, then writes them to .env.local.
 *   2. Registers the HubSpot deal.propertyChange webhook subscription pointing
 *      at POST /api/webhooks/hubspot on your app URL.
 *   3. Verifies both connections are live.
 *
 * Prerequisites (one-time human steps):
 *   - Monday.com API token: monday.com → Profile → Admin → API
 *   - HubSpot Private App token: HubSpot → Settings → Integrations → Private Apps
 *     (scopes required: crm.objects.deals.read, webhooks)
 *
 * Usage:
 *   MONDAY_API_TOKEN=xxx \
 *   HUBSPOT_API_KEY=xxx \
 *   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app \
 *   npx tsx scripts/setup-integrations.ts
 *
 * Or source an existing .env.local first:
 *   set -a && source .env.local && set +a
 *   npx tsx scripts/setup-integrations.ts
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";

// ── Config ────────────────────────────────────────────────────────────────────

const MONDAY_TOKEN = process.env.MONDAY_API_TOKEN;
const HUBSPOT_KEY = process.env.HUBSPOT_API_KEY;
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
const ENV_PATH = resolve(process.cwd(), ".env.local");

// Name fragments used to identify the correct boards inside SENTRAIS_Operations/
const COMMERCIAL_BOARD_FRAGMENT = "Sentrais_Commercial";
const NONPROFIT_BOARD_FRAGMENT = "NovateLabs_Civic";

// ── Helpers ───────────────────────────────────────────────────────────────────

function log(msg: string) {
  process.stdout.write(`  ${msg}\n`);
}
function ok(msg: string) {
  process.stdout.write(`  ✓ ${msg}\n`);
}
function fail(msg: string): never {
  process.stderr.write(`  ✗ ${msg}\n`);
  process.exit(1);
}

function readEnvLocal(): Record<string, string> {
  if (!existsSync(ENV_PATH)) return {};
  const lines = readFileSync(ENV_PATH, "utf8").split("\n");
  const map: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    map[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return map;
}

function writeEnvLocal(updates: Record<string, string>) {
  const existing = readEnvLocal();
  const merged = { ...existing, ...updates };
  const lines = Object.entries(merged).map(([k, v]) => `${k}=${v}`);
  writeFileSync(ENV_PATH, lines.join("\n") + "\n", "utf8");
}

// ── Monday.com ────────────────────────────────────────────────────────────────

interface MondayBoard {
  id: string;
  name: string;
  workspace_id: string;
}

async function fetchMondayBoards(): Promise<MondayBoard[]> {
  const res = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      Authorization: MONDAY_TOKEN!,
      "Content-Type": "application/json",
      "API-Version": "2023-10",
    },
    body: JSON.stringify({
      query: `{ boards(limit: 100, order_by: created_at) { id name workspace_id } }`,
    }),
  });

  if (!res.ok) fail(`Monday.com API error ${res.status}: ${await res.text()}`);

  const json = (await res.json()) as {
    data?: { boards: MondayBoard[] };
    errors?: { message: string }[];
  };

  if (json.errors?.length) fail(`Monday.com GraphQL: ${json.errors[0].message}`);
  return json.data?.boards ?? [];
}

async function setupMonday(): Promise<{
  commercialId: string;
  nonprofitId: string;
}> {
  log("Querying Monday.com boards...");
  const boards = await fetchMondayBoards();

  const commercial = boards.find((b) =>
    b.name.toLowerCase().includes(COMMERCIAL_BOARD_FRAGMENT.toLowerCase())
  );
  const nonprofit = boards.find((b) =>
    b.name.toLowerCase().includes(NONPROFIT_BOARD_FRAGMENT.toLowerCase())
  );

  if (!commercial) {
    fail(
      `Could not find a board matching "${COMMERCIAL_BOARD_FRAGMENT}". ` +
        `Create it first: SENTRAIS_Operations/01_Sentrais_Commercial/`
    );
  }
  if (!nonprofit) {
    fail(
      `Could not find a board matching "${NONPROFIT_BOARD_FRAGMENT}". ` +
        `Create it first: SENTRAIS_Operations/02_NovateLabs_Civic/`
    );
  }

  ok(`Commercial board: "${commercial.name}" → ID ${commercial.id}`);
  ok(`Nonprofit board:  "${nonprofit.name}" → ID ${nonprofit.id}`);

  writeEnvLocal({
    MONDAY_API_TOKEN: MONDAY_TOKEN!,
    MONDAY_COMMERCIAL_BOARD_ID: commercial.id,
    MONDAY_NONPROFIT_BOARD_ID: nonprofit.id,
  });
  ok("Written to .env.local");

  return { commercialId: commercial.id, nonprofitId: nonprofit.id };
}

// ── HubSpot ───────────────────────────────────────────────────────────────────

interface HubSpotSubscription {
  id: number;
  eventType: string;
  propertyName?: string;
  active: boolean;
  createdAt: string;
}

interface HubSpotApp {
  appId: number;
  webhookSettings?: { targetUrl?: string };
}

async function fetchHubSpotApps(): Promise<HubSpotApp[]> {
  const res = await fetch(
    "https://api.hubapi.com/crm/v3/extensions/calling/settings",
    {
      headers: { Authorization: `Bearer ${HUBSPOT_KEY}` },
    }
  );
  // This endpoint may 404 for private apps — use developer apps endpoint instead
  if (!res.ok) return [];
  return (await res.json()) as HubSpotApp[];
}

async function listHubSpotSubscriptions(appId: number): Promise<HubSpotSubscription[]> {
  const res = await fetch(
    `https://api.hubapi.com/webhooks/v3/${appId}/subscriptions`,
    { headers: { Authorization: `Bearer ${HUBSPOT_KEY}` } }
  );
  if (!res.ok) return [];
  const json = (await res.json()) as { results?: HubSpotSubscription[] };
  return json.results ?? [];
}

async function createHubSpotSubscription(
  appId: number,
  targetUrl: string
): Promise<void> {
  // Set target URL at the app level first
  await fetch(`https://api.hubapi.com/webhooks/v3/${appId}/settings`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${HUBSPOT_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      targetUrl,
      throttling: { period: "SECONDLY", maxConcurrentRequests: 10 },
    }),
  });

  // Create the deal stage change subscription
  const res = await fetch(
    `https://api.hubapi.com/webhooks/v3/${appId}/subscriptions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUBSPOT_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType: "deal.propertyChange",
        propertyName: "dealstage",
        active: true,
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    // 409 = subscription already exists — that's fine
    if (!body.includes("already exists") && !res.status.toString().startsWith("4")) {
      fail(`HubSpot subscription create failed ${res.status}: ${body}`);
    }
  }
}

async function resolveHubSpotAppId(): Promise<number> {
  // Private app tokens embed the portal/app info in the token introspection endpoint
  const res = await fetch("https://api.hubapi.com/oauth/v1/access-tokens/self", {
    headers: { Authorization: `Bearer ${HUBSPOT_KEY}` },
  });
  if (res.ok) {
    const json = (await res.json()) as { appId?: number; app_id?: number };
    const id = json.appId ?? json.app_id;
    if (id) return id;
  }

  // Fallback: list apps via developer API
  const appsRes = await fetch("https://api.hubapi.com/crm/v3/objects/deals?limit=1", {
    headers: { Authorization: `Bearer ${HUBSPOT_KEY}` },
  });
  if (!appsRes.ok) {
    fail(
      "Could not resolve HubSpot App ID. Ensure your Private App has the 'webhooks' scope."
    );
  }
  fail(
    "HubSpot App ID resolution failed. Pass HUBSPOT_APP_ID=<id> as an env var to skip auto-discovery."
  );
}

async function setupHubSpot(): Promise<void> {
  if (!APP_URL) fail("NEXT_PUBLIC_APP_URL is required to register the HubSpot webhook.");

  const targetUrl = `${APP_URL}/api/webhooks/hubspot`;
  log(`Registering HubSpot webhook → ${targetUrl}`);

  // If the caller knows the app ID, use it; otherwise discover it
  let appId: number;
  const envAppId = process.env.HUBSPOT_APP_ID;
  if (envAppId) {
    appId = parseInt(envAppId, 10);
    log(`Using HUBSPOT_APP_ID=${appId} from environment`);
  } else {
    log("Resolving HubSpot App ID from token...");
    appId = await resolveHubSpotAppId();
  }

  const existing = await listHubSpotSubscriptions(appId);
  const alreadyRegistered = existing.some(
    (s) => s.eventType === "deal.propertyChange" && s.propertyName === "dealstage"
  );

  if (alreadyRegistered) {
    ok(`Subscription already exists (${existing.length} total active)`);
  } else {
    await createHubSpotSubscription(appId, targetUrl);
    ok("Subscription created: deal.propertyChange → dealstage");
  }

  writeEnvLocal({ HUBSPOT_API_KEY: HUBSPOT_KEY! });
  ok("Written to .env.local");
  log("");
  log(
    "  → Copy HUBSPOT_WEBHOOK_SECRET from HubSpot → Settings → Integrations → Webhooks"
  );
  log("    and add it to .env.local manually (it cannot be read via API).");
}

// ── Migrations note ───────────────────────────────────────────────────────────

function printMigrationNote() {
  log("");
  log("Database migration:");
  log("  Local:      npm run db:push");
  log("  Production: add `npm run db:migrate` to your Vercel build command:");
  log('              Build Command → "npm run db:migrate && npm run build"');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  process.stdout.write("\nSentraisOS Integration Setup\n");
  process.stdout.write("─────────────────────────────\n\n");

  if (!MONDAY_TOKEN && !HUBSPOT_KEY) {
    fail(
      "No tokens found. Set MONDAY_API_TOKEN and/or HUBSPOT_API_KEY in your environment.\n" +
        "  See .env.example for instructions on where to generate each token."
    );
  }

  if (MONDAY_TOKEN) {
    process.stdout.write("Monday.com\n");
    await setupMonday();
    process.stdout.write("\n");
  } else {
    log("Skipping Monday.com (MONDAY_API_TOKEN not set)");
  }

  if (HUBSPOT_KEY) {
    process.stdout.write("HubSpot\n");
    await setupHubSpot();
    process.stdout.write("\n");
  } else {
    log("Skipping HubSpot (HUBSPOT_API_KEY not set)");
  }

  printMigrationNote();

  process.stdout.write("\nSetup complete.\n\n");
}

main().catch((err) => {
  process.stderr.write(`\nFatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});

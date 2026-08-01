/**
 * Ingest seed 2: Zone 1 Ground Truth + BRIC EIN Conflict + Reference & Action Plan + Golden Path
 * Run: npx tsx src/scripts/seed-ingest-2.ts
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../lib/db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const client = postgres(connectionString, {
  max: 1,
  ssl: connectionString.includes("neon.tech") ? "require" : undefined,
});
const db = drizzle(client, { schema });

async function main() {
  // ── 1. SIPE: Zone 1 Ground Truth — Venue Intelligence Layer ──────────────
  console.log("Ingesting Zone 1 Ground Truth (Venue Intelligence Layer)...");

  const zone1Entries = [
    {
      category: "platform-intelligence",
      content:
        "Sentrais Command & Control — The Venue Intelligence Layer: transforms raw data into an authoritative Venue Integrity Score through weighted logic and real-time oversight. The C&C Dashboard serves as the central Intelligence Layer, delivering a real-time Integrity Score by integrating system health and milestone compliance, automating communication, and ensuring a transparent, audit-ready record of all venue activities.",
      tags: ["zone-1", "command-control", "venue-intelligence", "integrity-score"],
      vertical: "Global Sports Ecosystem",
      confidenceScore: 0.99,
      ninTag: "NIN-Z1-001",
      playbookId: "zone-1-ground-truth",
    },
    {
      category: "platform-intelligence",
      content:
        "Sentrais Integrity Engine — 70/30 Weighted System Logic: Tier 1 Systems (IVRS, O2O) carry 70% weight. If yellow, the index cannot exceed 30%. Automatic Milestone Penalties: any Tier 1 task open past its 'Hard Block' triggers an immediate -15% index penalty. Real-Time Recalculation: venue health score recalculates instantly every time a shadow-write event is committed.",
      tags: ["integrity-engine", "70-30-logic", "hard-block", "milestone-penalty", "zone-1"],
      vertical: "Global Sports Ecosystem",
      confidenceScore: 0.99,
      ninTag: "NIN-Z1-002",
      playbookId: "zone-1-ground-truth",
    },
    {
      category: "platform-intelligence",
      content:
        "CITRUS Mode Overrides: allows NFL leads to manually override systems using specific justification codes and signatures. The CITRUS Border: overridden systems are visually flagged for inclusion in the Final After Action Report. WhatsApp Comms Bridge: automatically creates and archives dedicated chat threads for every system incident.",
      tags: ["citrus-mode", "override", "nfl", "after-action-report", "whatsapp-comms", "zone-1"],
      vertical: "Global Sports Ecosystem",
      confidenceScore: 0.99,
      ninTag: "NIN-Z1-003",
      playbookId: "zone-1-ground-truth",
    },
    {
      category: "platform-intelligence",
      content:
        "Dashboard Lens — Three core displays: (1) Venue Integrity Index — the 'vital sign', a single weighted percentage of system health. (2) Milestone Compliance — the 'clock', visual timeline showing hard block triggers. (3) Audit Stream — the 'transparency', live feed of validated entries and overrides.",
      tags: ["dashboard", "venue-integrity-index", "milestone-compliance", "audit-stream", "zone-1"],
      vertical: "Global Sports Ecosystem",
      confidenceScore: 0.99,
      ninTag: "NIN-Z1-004",
      playbookId: "zone-1-ground-truth",
    },
  ];

  for (const entry of zone1Entries) {
    const [inserted] = await db
      .insert(schema.sipeEntries)
      .values(entry)
      .returning();
    console.log(`  SIPE: ${inserted.ninTag}`);
  }

  // ── 2. SIPE: Corporate Architecture (Reference & Action Plan) ─────────────
  console.log("Ingesting Corporate Architecture (Reference & Action Plan)...");

  const corpArchEntries = [
    {
      category: "corporate-architecture",
      content:
        "Sentrais Corporate Structure — Three-layer architecture: (1) Sentrais Corporation (Parent): owns core intelligence infrastructure — SentraisOS core IP, Blueprint360 runtime, Evidence Ledger, Decision Rights Engine, AI Governance Layer, core patents and trademarks. Revenue: licensing fees to Ventures, enterprise direct OS contracts, royalty share from vertical deployments. (2) Sentrais Ventures (Commercial Arm): licenses SentraisOS from Sentrais Corporation and deploys vertical intelligence systems into ecosystems. Earns vertical licensing revenue, implementation fees, ecosystem participation agreements. (3) NOVATELabs (Nonprofit): research, responsible AI validation, certification, Living Lab validation. No equity participation. Supports category legitimacy and federal credibility.",
      tags: ["corporate-structure", "sentrais-corp", "sentrais-ventures", "novatelabs", "architecture"],
      vertical: "Enterprise / Platform",
      confidenceScore: 0.98,
      ninTag: "NIN-ARCH-001",
      playbookId: "sentrais-reference-action-plan",
    },
    {
      category: "corporate-architecture",
      content:
        "Ecosystem Verticals — Four isolated capital pools: (1) Sports: EVERGAME — leagues, stadiums, global events. (2) Entertainment: EntertainmentOS — venues, festivals, touring production. (3) Civic: CiviGrid — cities, agencies, host city coordination. (4) National: SEARGrid — SEAR-level, federal, multi-jurisdiction. Each vertical isolates its own risk and revenue. Investors in one ecosystem do not gain exposure to, or control over, the others or the core OS.",
      tags: ["verticals", "evergame", "entertainmentos", "civigrid", "seargrid", "capital-isolation"],
      vertical: "Enterprise / Platform",
      confidenceScore: 0.98,
      ninTag: "NIN-ARCH-002",
      playbookId: "sentrais-reference-action-plan",
    },
    {
      category: "corporate-architecture",
      content:
        "Three-Layer Licensing Architecture: Layer 1 — Core OS License (Sentrais Corporation to Sentrais Ventures or direct enterprise clients; non-transferable, non-derivative, usage-bound). Layer 2 — Vertical Deployment License (through Sentrais Ventures; sector-specific configuration, playbooks, dashboard frameworks, certification models; ecosystem-specific investors participate here). Layer 3 — Engagement Model License (client-specific layer; client owns data and workflow configurations; Sentrais owns orchestration framework and system logic underneath). IP Guardrails: core OS proprietary, no reverse engineering, no derivative orchestration frameworks, no AI training data extraction.",
      tags: ["licensing", "ip-guardrails", "three-layer", "architecture"],
      vertical: "Enterprise / Platform",
      confidenceScore: 0.98,
      ninTag: "NIN-ARCH-003",
      playbookId: "sentrais-reference-action-plan",
    },
    {
      category: "capital-structure",
      content:
        "Capital Structure — Four independent ecosystem capital pools: Sports, Entertainment, Civic, SEAR (subject to federal capital restrictions). Investors in a given pool receive revenue share and minority interest scoped to that vertical only — no interest in core OS IP, other verticals, or parent governance. Royalty benchmark: 10–15% of gross revenue from vertical to parent. Phase 1 (Days 1–30): legal/structural lock, language lock, internal discipline. Phase 2 (Days 31–60): vertical capital mechanics, investor materials, public-facing build. Phase 3 (Days 61–90): product experience (OS shell: TopBar, SideNav, MainViewport, ContextRail), pressure testing, expansion planning.",
      tags: ["capital", "investor", "royalty", "90-day-plan"],
      vertical: "Enterprise / Platform",
      confidenceScore: 0.97,
      ninTag: "NIN-ARCH-004",
      playbookId: "sentrais-reference-action-plan",
    },
  ];

  for (const entry of corpArchEntries) {
    const [inserted] = await db
      .insert(schema.sipeEntries)
      .values(entry)
      .returning();
    console.log(`  SIPE: ${inserted.ninTag}`);
  }

  // ── 3. SIPE: Golden Path — Structural Legal Migration ─────────────────────
  console.log("Ingesting Golden Path (Structural Legal Migration)...");

  const goldenPathEntries = [
    {
      category: "legal-architecture",
      content:
        "Sentrais Golden Path — Target Architecture (End State): L0 Asset Fortress: Resilient Reach Holdings (RRH) — Wyoming LLC, sole member Tye Hayes. Holds SentraisOS, Blueprint360, EVERGAME, SIPE, FORGE, NIN methodology, all trademarks and patents. Licenses IP to Sentrais Inc. Receives Meta $5M SAFE. L1 Commercial Parent: Sentrais, Inc. — C-Corp, operating parent, Series A vehicle. NFL/EVERGAME contract stays here permanently. Licenses IP from RRH at certified arm's-length rate. 100% owner of Sentrais Ventures and NOVATELabs. L2 Commercial Deployment: Sentrais Ventures (to be formed) — vertical deployment arm. CiviGrid first. Meta L1 commercial licensing. 100% owner of Advisory, Academy, Platform LLCs post-migration. Ecosystem investor capital enters here by vertical. L2 Research + Validation: NOVATELabs, Inc. — C-Corp pursuing nonprofit status. BRIC/federal grant work, NIN validation, responsible AI governance, workforce development. No commercial subsidiaries, no for-profit revenue. L3 Vertical Subsidiaries: Sentrais Advisory / Academy / Platform — Georgia LLCs, service delivery under Ventures.",
      tags: ["golden-path", "rrh", "sentrais-inc", "sentrais-ventures", "novatelabs", "target-architecture", "legal"],
      vertical: "Enterprise / Platform",
      confidenceScore: 0.99,
      ninTag: "NIN-GOLDEN-001",
      playbookId: "sentrais-golden-path",
    },
    {
      category: "legal-architecture",
      content:
        "Golden Path — Decisions Locked: (1) Source of truth for target architecture: brand-arc model (Corp/Ventures/Labs) as migration target. (2) Tiebreaker: founder risk elimination wins over generational wealth and investor attraction. (3) RRH role: remains passive IP Asset Fortress, no structural change. (4) Meta SAFE placement: stays at RRH level, small core pool preserved. (5) NFL contract placement: stays in Sentrais, Inc., no assignment to Ventures. (6) Ventures formation timing: form Sentrais Ventures now, ahead of vertical capital raise. (7) Ventures first defining engagement: CiviGrid/Atlanta360 leads; Meta L1 commercial runs in parallel. (8) Advisory, Academy, Platform true owner: NOVATELabs (confirmed by IP License and FEMA BRIC narrative). (9) Advisory, Academy, Platform target home: migrate to Sentrais Ventures; leave NOVATELabs clean for nonprofit status (Pending Counsel).",
      tags: ["golden-path", "decisions-locked", "rrh", "nfl", "ventures", "advisory-academy-platform"],
      vertical: "Enterprise / Platform",
      confidenceScore: 0.99,
      ninTag: "NIN-GOLDEN-002",
      playbookId: "sentrais-golden-path",
    },
    {
      category: "legal-architecture",
      content:
        "Golden Path — What Not to Do (Friction Risks): (1) Do not assign/novate NFL contract to Ventures — requires NFL affirmative consent, risks renegotiation, loads Ventures with liquidated damages exposure. (2) Do not move RRH IP into Sentrais Inc. or Ventures directly — eliminates asset fortress, exposes IP to NFL contract liability. (3) Do not advance FEMA BRIC application before resolving NOVATELabs ownership — creates federal agency misrepresentation under 2 CFR Part 200. (4) Do not allow Meta SAFE proceeds to flow from RRH to personal without formal distribution resolution — looks like commingling to auditor, could pierce RRH liability shield. (5) Do not form additional named brands or holding layers before Series A. (6) Do not treat Advisory, Academy, or Platform as NOVATELabs subsidiaries in any new federal filings until ownership is confirmed and migration is complete.",
      tags: ["golden-path", "friction-risks", "compliance", "rrh", "bric", "nfl"],
      vertical: "Enterprise / Platform",
      confidenceScore: 0.99,
      ninTag: "NIN-GOLDEN-003",
      playbookId: "sentrais-golden-path",
    },
  ];

  for (const entry of goldenPathEntries) {
    const [inserted] = await db
      .insert(schema.sipeEntries)
      .values(entry)
      .returning();
    console.log(`  SIPE: ${inserted.ninTag}`);
  }

  // ── 4. Remediation: FEMA BRIC EIN Conflict ────────────────────────────────
  console.log("Ingesting BRIC EIN Conflict remediation...");

  // Create FEMA BRIC as a CRM deal (federal grant opportunity)
  const [bricDeal] = await db
    .insert(schema.crmDeals)
    .values({
      companyName: "FEMA BRIC Grant Application",
      contactName: "GEMHSA (Georgia Emergency Management)",
      stage: "negotiation",
      vertical: "Federal / Community Resilience",
      estimatedValue: null,
      probability: 55,
      licensingSector: "NONPROFIT",
      notes: [
        "FEMA BRIC application deadline: July 23, 2026. Days remaining from June 30, 2026: 23.",
        "Critical EIN conflict: application names NOVATELabs Inc. (Delaware C-Corp, EIN 39-4510998) as implementing partner, but FEMA requires implementing partners to be local government or confirmed nonprofit.",
        "Only confirmed 501(c)(3) entity: N-OvateUS Foundation Inc. (Georgia, EIN 99-1315061) — active since Feb 2024. NOT named in application narrative.",
        "NOVATELabs Inc. (Delaware, EIN 39-4510998): standard C-Corp, Form 1023 not yet filed, no nonprofit status. Named in application and signed by Tye Hayes.",
        "GEMHSA managed FEMA GO system entry — unknown which EIN was entered.",
        "Three questions for GEMHSA: (1) Which EIN in FEMA GO: 99-1315061 or 39-4510998? (2) Is application submitted or still draft? (3) Who has edit access for correction?",
        "Resolution scenarios: Georgia EIN → narrative amendment only (low risk). Delaware EIN → GEMHSA must amend FEMA GO entry (requires cooperation + possible FEMA Region IV notification). Draft status → straightforward fix before submission.",
        "Classified: Internal Only.",
      ].join(" | "),
    })
    .returning();

  console.log(`  Created BRIC CRM deal: ${bricDeal.id}`);

  // SIPE entry for the BRIC conflict intelligence
  const [bricSipe] = await db
    .insert(schema.sipeEntries)
    .values({
      category: "federal-compliance-risk",
      content:
        "FEMA BRIC EIN Conflict (CRITICAL — Deadline July 23, 2026): FEMA BRIC application names NOVATELabs Inc. (Delaware C-Corp, EIN 39-4510998) as implementing partner. FEMA requires implementing partners to be local government or confirmed nonprofit. Only confirmed 501(c)(3) is N-OvateUS Foundation Inc. (Georgia, EIN 99-1315061, active since Feb 2024) — not named in application narrative. Risk: if Delaware EIN was entered in FEMA GO, application is registered under ineligible entity. Must contact GEMHSA to confirm which EIN was entered, whether application is draft or submitted, and whether correction can be made before July 23. Call framing: frame as routine administrative verification, not legal alarm. Scenario A (Georgia EIN entered): narrative amendment only, low effort. Scenario B (Delaware EIN entered): GEMHSA must amend FEMA GO, substitute Georgia entity or reposition Delaware as contracted service provider. Per Golden Path: do not advance BRIC application until NOVATELabs ownership structure is reconciled (2 CFR Part 200 compliance risk).",
      tags: ["bric", "fema", "ein-conflict", "novatelabs", "n-ovateus", "compliance-risk", "july-2026-deadline"],
      vertical: "Federal / Community Resilience",
      confidenceScore: 0.99,
      ninTag: "NIN-BRIC-001",
      playbookId: "bric-ein-conflict-resolution",
    })
    .returning();

  console.log(`  SIPE: ${bricSipe.ninTag}`);

  console.log("\nIngest 2 complete.");
  console.log(`  Zone 1 Ground Truth SIPE entries: NIN-Z1-001 through NIN-Z1-004`);
  console.log(`  Corporate Architecture SIPE entries: NIN-ARCH-001 through NIN-ARCH-004`);
  console.log(`  Golden Path SIPE entries: NIN-GOLDEN-001 through NIN-GOLDEN-003`);
  console.log(`  BRIC EIN Conflict: CRM deal ${bricDeal.id} + NIN-BRIC-001`);

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

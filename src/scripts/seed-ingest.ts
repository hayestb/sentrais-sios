/**
 * Ingest seed: N-OvateUS Foundation + Cascade UMC + Community Resilience Network
 * Run: npx tsx src/scripts/seed-ingest.ts
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
  console.log("Ingesting N-OvateUS Foundation...");

  // ── 1. N-OvateUS Foundation — CRM Deal ────────────────────────────────────
  const [nOvateUSDeal] = await db
    .insert(schema.crmDeals)
    .values({
      companyName: "N-OvateUS Foundation Inc",
      contactName: "Tye Hayes",
      contactEmail: null,
      stage: "discovery",
      vertical: "Community Resilience / Nonprofit",
      estimatedValue: null,
      probability: 40,
      licensingSector: "NONPROFIT",
      notes: [
        "Georgia nonprofit corporation incorporated February 1, 2024.",
        "Board: Tye Hayes (President), Rene Chatfield (VP), Valorie Salahuddin (Treasurer), Meloni Boatswain (Secretary).",
        "3 directors: Tye Hayes, Rene Chatfield, Valorie Salahuddin.",
        "Organizational board meeting by unanimous written consent dated Feb 1, 2024; signed Feb 6, 2024.",
        "Officers authorized to pursue tax-exempt status, open banking, accept gifts/contributions, and execute organizational documents.",
        "Strategic partner in Community Resilience Fabric / major events readiness (NOVATELabs + Cascade UMC partnership).",
      ].join(" | "),
    })
    .returning();

  console.log(`  Created CRM deal: ${nOvateUSDeal.id}`);

  // ── 2. Cascade UMC — Active Engagement (Diagnose Phase) ───────────────────
  console.log("Ingesting Cascade UMC engagement...");

  const [cascadeEngagement] = await db
    .insert(schema.engagements)
    .values({
      clientName: "Cascade United Methodist Church",
      vertical: "Faith-Based / Community Anchor",
      contractValue: 0,
      status: "active",
      currentPhase: "diagnose",
      currentGate: 2,
      entryPoint: "360° Strategic Review — Session 3",
      governanceStandard: "SIOS Agentic Framework",
      sprintNumber: 1,
      config: {
        kpiFramework: [
          "Member Engagement Rate",
          "Leadership Pipeline Depth",
          "Multi-Campus Sync Score",
          "Operational Visibility Index",
          "Succession Readiness Score",
        ],
        zoneTaxonomy: ["Atlanta Metro", "Midtown Campus", "Community Anchor"],
      },
      metadata: {
        clientType: "faith-institution",
        incorporationType: "nonprofit",
        campuses: ["Main", "Midtown"],
        keyStakeholders: [
          "Pastor Murriel",
          "Alexander",
          "Kimberly",
        ],
        strategicScorecard: {
          visionAlignment: "A",
          leadershipMaturity: "A",
          governanceTone: "A",
          strategicDirection: "A-",
          systemsReadiness: "C+",
          dataOperationalVisibility: "C",
          successionInfrastructure: "B-",
          innovationReadiness: "B+",
          institutionalTrust: "A+",
          communityPositioning: "A+",
        },
        ninPartnership: "NOVATELabs + Cascade UMC — Community Resilience Fabric",
        resilienceHubRole: "Faith-Based Micro-Hub (Tier 2)",
        source: "360_Strategic_Review_Session_3",
      },
    })
    .returning();

  console.log(`  Created engagement: ${cascadeEngagement.id}`);

  // ── 3. SIPE Intelligence from Cascade 360° Review ─────────────────────────
  console.log("Ingesting SIPE entries from Cascade 360° review...");

  const sipeEntries = [
    {
      category: "institutional-intelligence",
      content:
        "Cascade UMC is transitioning from personality-driven excellence to systems-enabled continuity. This is an institutional transition meeting, not merely a church planning session. The leadership maturity to accomplish this appears present; the missing layer is operational architecture.",
      tags: ["succession", "governance", "systems-transition", "cascade-umc"],
      vertical: "Faith-Based / Community Anchor",
      confidenceScore: 0.95,
      ninTag: "NIN-CASCADE-001",
    },
    {
      category: "strategic-risk",
      content:
        "Operational Visibility Gap: 64% statistic indicates fragmented engagement management, inconsistent onboarding, disconnected ministry coordination, absence of lifecycle visibility, and no unified member journey architecture. People are joining emotionally but disconnecting operationally. Fixable with systems thinking.",
      tags: ["operational-gap", "engagement", "retention", "cascade-umc"],
      vertical: "Faith-Based / Community Anchor",
      confidenceScore: 0.92,
      ninTag: "NIN-CASCADE-002",
    },
    {
      category: "strategic-opportunity",
      content:
        "Cascade UMC already behaves like a civic operating system. Community sees it as: stabilizer, convener, trust anchor, mobilization center, intellectual center, justice institution, cultural institution. Systems have not caught up to institutional reality. Recommendation: build 'CascadeOS' — a Ministry Coordination Layer with member journey tracking, ministry coordination, leadership pipeline mapping, volunteer intelligence, community resource registry, multi-campus synchronization, engagement scoring, care coordination, community impact metrics, historical knowledge base.",
      tags: ["civic-os", "cascadeos", "ministry-coordination", "cascade-umc"],
      vertical: "Faith-Based / Community Anchor",
      confidenceScore: 0.94,
      ninTag: "NIN-CASCADE-003",
    },
    {
      category: "succession-intelligence",
      content:
        "Cascade may still be relying on relationship-based succession instead of system-based succession. Strong leaders are intentionally pulling younger leaders in and mentorship is occurring, but the system is not institutionalized enough to survive leadership transition. Risk: moderate. Pastor Murriel's framing 'Long distance run, not a sprint' is strategically correct. Succession pipeline is forming but institutionalization is incomplete.",
      tags: ["succession", "leadership-pipeline", "cascade-umc", "risk"],
      vertical: "Faith-Based / Community Anchor",
      confidenceScore: 0.88,
      ninTag: "NIN-CASCADE-004",
    },
    {
      category: "strategic-intelligence",
      content:
        "Strategic Identity Assessment — Cascade UMC occupies a rare multi-layer institutional position: Spiritual (Strong), Intellectual (Strong), Cultural (Strong), Civic (Strong), Justice (Strong), Operational (Emerging), Digital (Underdeveloped). Opportunity: become a fully orchestrated civic-faith ecosystem. Most institutions fail because they over-index one layer. Strategic maturity assessment: Leadership Alignment (Strong), Organizational Self-Awareness (High), Governance Culture (Healthy), Strategic Readiness (Moderate-High), Operational Maturity (Moderate), Innovation Readiness (Emerging), Succession Readiness (Moderate Risk), Community Identity (Extremely Strong), Data & Systems Capability (Weak-Moderate), Change Capacity (Strong).",
      tags: ["identity", "maturity-model", "cascade-umc", "civic-ecosystem"],
      vertical: "Faith-Based / Community Anchor",
      confidenceScore: 0.96,
      ninTag: "NIN-CASCADE-005",
    },
    {
      category: "community-resilience",
      content:
        "Community Resilience Fabric: NOVATELabs + Cascade UMC partnership leverages major sporting events (2026–2029) in Atlanta to transform trusted local sites into emergency power, cooling, and connectivity hubs during climate disasters and grid failures. Two-tiered network: 6 Hardened Primary Resilience Hubs (72-hour off-grid autonomy, solar+battery+resilience cooling, 1-mile catchment, 12,500 residents served) + Web of Faith-Based Micro-Hubs (last-mile communication, trusted care, lighter-weight Wi-Fi anchor nodes, neighborhood-level). Resilience Chaplaincy: trained community leaders for mental-health coordination and spiritual presence during crises. Infrastructure prioritized for Justice40 tracts.",
      tags: ["resilience-hub", "community-resilience", "novatelabs", "cascade-umc", "atlanta", "climate", "justice40"],
      vertical: "Community Resilience / Major Events",
      confidenceScore: 0.97,
      ninTag: "NIN-RESILIENCE-001",
      playbookId: "community-resilience-fabric-v1",
    },
  ];

  for (const entry of sipeEntries) {
    const [inserted] = await db
      .insert(schema.sipeEntries)
      .values({ ...entry, engagementId: cascadeEngagement.id })
      .returning();
    console.log(`  SIPE entry: ${inserted.ninTag}`);
  }

  // ── 4. CRM — NOVATELabs Partnership Deal ──────────────────────────────────
  console.log("Ingesting NOVATELabs CRM entry...");

  const [novateDeal] = await db
    .insert(schema.crmDeals)
    .values({
      companyName: "NOVATELabs",
      contactName: null,
      stage: "scoping",
      vertical: "Community Resilience / Major Events",
      estimatedValue: null,
      probability: 65,
      licensingSector: "COMMERCIAL",
      notes: [
        "Strategic partner in Community Resilience Fabric alongside Cascade UMC.",
        "Focus: major sporting events 2026–2029 in Atlanta.",
        "Deliverable: Community Hub Model — 6 hardened primary resilience hubs + faith-based micro-hub web.",
        "Infrastructure: solar, battery, resilience cooling, Wi-Fi anchors, emergency power for medical devices.",
        "Target: 12,500 residents per 1-mile catchment. Justice40 tract prioritization.",
        "Sentrais platform role: FORGE agent coordination, gate governance, RACI enforcement across multi-site deployment.",
      ].join(" | "),
    })
    .returning();

  console.log(`  Created NOVATELabs CRM deal: ${novateDeal.id}`);

  console.log("\nIngest complete.");
  console.log(`  Cascade UMC engagement ID: ${cascadeEngagement.id}`);
  console.log(`  N-OvateUS Foundation deal ID: ${nOvateUSDeal.id}`);
  console.log(`  NOVATELabs deal ID: ${novateDeal.id}`);

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

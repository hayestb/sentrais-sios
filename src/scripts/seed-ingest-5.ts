/**
 * Ingest seed 5: Sentrais Client Delivery Platform specification
 * Run: npx tsx src/scripts/seed-ingest-5.ts
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
  console.log("Ingesting Sentrais Client Delivery Platform specification...");

  const entries = [
    // ── Platform Overview ────────────────────────────────────────────────────
    {
      category: "platform-intelligence",
      content:
        "Sentrais Client Delivery Platform (CDP) — Full specification. Private engagement microsites at client.sentrais.com/[engagement-name] (e.g. client.sentrais.com/superbowl-2026, /city-readiness-atlanta, /nfl-blueprint360). 10-screen architecture: Executive Dashboard, Engagement Blueprint, Operational Workstreams, Decision Center, System Intelligence, Risks & Issues, Evidence Ledger, Simulation Center, Communications Center, Reports & Deliverables. HubSpot is system of record (2 standard objects + 14 custom objects). n8n powers all communications automation (6 workflows). This platform transitions Sentrais from service delivery to infrastructure-grade client engagement — a client operating environment, digital PMO, intelligence layer, and structured research feed into NOVATELabs.",
      tags: ["cdp", "client-portal", "microsite", "sentrais", "platform", "overview"],
      vertical: "Platform / Client Delivery",
      confidenceScore: 0.99,
      ninTag: "NIN-CDP-001",
      playbookId: "sentrais-cdp-spec",
    },

    // ── UI Architecture ──────────────────────────────────────────────────────
    {
      category: "platform-intelligence",
      content:
        "CDP UI Layout System. Global layout: Top bar 72px (logo, engagement name, search, alerts, profile), Left nav 260px (10 nav items), Main content max-width 1200px, 12-column grid, 32px page padding. Desktop two-panel: nav left / content right. Screen 1 — Executive Dashboard: engagement phase, readiness score, risk level, stakeholder alignment, milestone timeline, program progress chart, open decisions, latest executive brief, recent evidence, alerts. Widgets: Readiness Score, Risk Level, Programs Active, Open Decisions. Screen 2 — Engagement Blueprint: ecosystem network map, authority tree, dependency graph, system architecture stack — shows structural model of the engagement (ecosystem map, stakeholder structure, system dependency graph, decision rights model, operational playbooks).",
      tags: ["cdp", "ui", "layout", "executive-dashboard", "blueprint", "screens"],
      vertical: "Platform / Client Delivery",
      confidenceScore: 0.99,
      ninTag: "NIN-CDP-002",
      playbookId: "sentrais-cdp-spec",
    },
    {
      category: "platform-intelligence",
      content:
        "CDP Screens 3–6. Screen 3 — Operational Workstreams: digital PMO execution layer. Tabs: Programs, Workstreams, Tasks, Milestones, Dependencies, Resources. Views: Kanban, Timeline/Gantt, Dependency map, Table. Data: owner, status, due date, blockers, dependencies, priority. Screen 4 — Decision Center (key differentiator): pending decisions, decision owner, approval path, escalation deadline, decision history. UI: approval workflow status, escalation chain, due date/SLA, linked workstream/risk. Screen 5 — System Intelligence: system inventory, integration status, dependency graph, critical path, fallback paths. Views: systems table, network graph, system health panels. Screen 6 — Risks & Issues: risk register, issues log, severity, mitigation plans, escalation status. Filters by severity/program/owner/ecosystem area. Signal Amber and red for true escalation only.",
      tags: ["cdp", "ui", "workstreams", "decision-center", "system-intelligence", "risks", "screens"],
      vertical: "Platform / Client Delivery",
      confidenceScore: 0.99,
      ninTag: "NIN-CDP-003",
      playbookId: "sentrais-cdp-spec",
    },
    {
      category: "platform-intelligence",
      content:
        "CDP Screens 7–10. Screen 7 — Evidence Ledger: categories (operational, compliance, simulation, system, performance evidence). Features: upload/link artifacts, verification status, date/source, mapped to engagement/program/decision. Screen 8 — Simulation Center: simulation library, scenario results, response metrics, findings, recommendations. Metrics: response time, coordination score, failure points, readiness delta. Screen 9 — Communications Center: communication plan, upcoming briefings, executive updates, operational alerts, distribution history, feedback loop. Views: calendar, stakeholder list, sent/scheduled reports, message history. Screen 10 — Reports & Deliverables: executive/operational/readiness reports, playbooks, training materials, architecture documents. Features: preview, version history, export PDF, audience tags.",
      tags: ["cdp", "ui", "evidence-ledger", "simulation", "communications", "reports", "screens"],
      vertical: "Platform / Client Delivery",
      confidenceScore: 0.99,
      ninTag: "NIN-CDP-004",
      playbookId: "sentrais-cdp-spec",
    },

    // ── HubSpot Schema ───────────────────────────────────────────────────────
    {
      category: "platform-intelligence",
      content:
        "CDP HubSpot Object Schema. Standard objects: Contacts (stakeholders), Companies (organizations), Deals (commercial opportunity). 14 custom objects: Ecosystem (operational environment), Engagement (primary client program), Program (delivery stream), Workstream (functional execution stream), Decision (approval/escalation tracking), System (operational system inventory), Risk (risk register), Evidence Record (proof/verification), Simulation (scenario/exercise records), Communication Plan (planned communication structure), Communication Event (individual messages/reports), Deliverable (client output), Partner (external ecosystem participant), Contract (financial/commercial structure). Key Engagement object properties: engagement_name, engagement_type, engagement_phase, start_date, end_date, executive_sponsor, readiness_score, risk_level, stakeholder_alignment_score, portal_url.",
      tags: ["cdp", "hubspot", "custom-objects", "schema", "crm"],
      vertical: "Platform / Client Delivery",
      confidenceScore: 0.99,
      ninTag: "NIN-CDP-005",
      playbookId: "sentrais-cdp-spec",
    },
    {
      category: "platform-intelligence",
      content:
        "CDP HubSpot ↔ UI Data Mapping. Executive Dashboard ← Engagement, Program, Risk, Decision, Communication Event, Deliverable. Engagement Blueprint ← Ecosystem, System, Decision, Stakeholder associations, Deliverables. Workstreams ← Program, Workstream, Deliverable, Risk. Decision Center ← Decision, Stakeholder, Program, Risk. System Intelligence ← System, Ecosystem, Integration status fields. Risks & Issues ← Risk, Workstream, Decision. Evidence Ledger ← Evidence Record, Deliverable, Simulation. Simulation Center ← Simulation, Evidence Record, Risk, Deliverables. Communications Center ← Communication Plan, Communication Event, Stakeholders, Engagement status. Reports & Deliverables ← Deliverable, Evidence Record, Communication Event.",
      tags: ["cdp", "hubspot", "data-mapping", "ui-mapping"],
      vertical: "Platform / Client Delivery",
      confidenceScore: 0.99,
      ninTag: "NIN-CDP-006",
      playbookId: "sentrais-cdp-spec",
    },

    // ── n8n Automation Workflows ─────────────────────────────────────────────
    {
      category: "platform-intelligence",
      content:
        "CDP n8n Automation — 6 workflows. Workflow A (Engagement Launch): trigger = new Engagement in HubSpot → creates default Communication Plan, identifies stakeholder segments, generates welcome/kickoff package, notifies internal team, publishes microsite starter content. Outputs: executive kickoff email, operational kickoff memo, portal welcome panel, seeded calendar schedule. Workflow B (Weekly Executive Brief): trigger = every Friday 4 PM → pulls HubSpot + portal metrics, formats executive summary, generates PDF + email, publishes to Communications Center, sends to executives. Format: Executive Summary, Key Changes, Readiness Score, Top Risks, Open Decisions, Next Milestones.",
      tags: ["cdp", "n8n", "automation", "workflows", "engagement-launch", "executive-brief"],
      vertical: "Platform / Client Delivery",
      confidenceScore: 0.99,
      ninTag: "NIN-CDP-007",
      playbookId: "sentrais-cdp-spec",
    },
    {
      category: "platform-intelligence",
      content:
        "CDP n8n Automation — Workflows C–F. Workflow C (Risk Escalation Alert): trigger = risk severity → High/Critical → identifies affected stakeholders, generates escalation message, sends via email/Slack/Teams, updates portal alert banner, logs communication event. Workflow D (Milestone Completion): trigger = deliverable status = Completed → updates program progress, generates milestone announcement, notifies stakeholders by segment, adds artifact to Reports & Deliverables, updates dashboard. Workflow E (Simulation Result Distribution): trigger = simulation completed → collects metrics, generates executive + operator versions of readiness summary, publishes to portal, sends by audience. Workflow F (Monthly Strategic Insight Report): trigger = first Monday of month → pulls intelligence insights, pattern changes, risk trends, generates strategic report, distributes to executives and research team — this is where NOVATELabs and Sentrais intersect visibly.",
      tags: ["cdp", "n8n", "automation", "risk-escalation", "milestone", "simulation", "monthly-report"],
      vertical: "Platform / Client Delivery",
      confidenceScore: 0.99,
      ninTag: "NIN-CDP-008",
      playbookId: "sentrais-cdp-spec",
    },

    // ── Client Onboarding ────────────────────────────────────────────────────
    {
      category: "platform-intelligence",
      content:
        "CDP Client Onboarding Experience — 5 stages. Stage 1 (Deal Closed/Engagement Activated): trigger = HubSpot Deal → Closed Won → Engagement object created, microsite provisioned, stakeholders associated, default programs created, communication plan seeded. Stage 2 (Internal Readiness Setup): internal team receives new engagement notification, owner assignments, default workstreams, kickoff checklist. Stage 3 (Client Welcome): client receives welcome email + secure portal link + first executive summary page + kickoff agenda + support contact. Welcome screen shows: engagement name, executive sponsor, program lead, objective, next milestones, upcoming kickoff. Onboarding UX sequence: Closed Won → Portal Provisioned → Client Welcome Email → Stakeholder Access Created → Kickoff Workspace Seeded → Live Dashboard Activated.",
      tags: ["cdp", "onboarding", "client-experience", "hubspot", "deal-closed-won"],
      vertical: "Platform / Client Delivery",
      confidenceScore: 0.99,
      ninTag: "NIN-CDP-009",
      playbookId: "sentrais-cdp-spec",
    },
    {
      category: "platform-intelligence",
      content:
        "CDP Stakeholder RBAC + Kickoff Pack. Stage 4 — Stakeholder Activation: 4 roles with default views — Executive → Executive Dashboard, Operator → Workstreams/Risks, Technical → System Intelligence, Research/Advisor → Reports/Insights. Portal routes users to correct landing page post-login. Kickoff Readiness Pack: microsite auto-populates engagement overview, initial timeline, governance structure, communication cadence, known milestones, draft decision log, starter deliverables section — portal is valuable on day one. Stage 5 — Live Program Mode: home screen transitions from Welcome/Setup to Live Engagement Dashboard after kickoff. Onboarding emails: Email 1 (Welcome, immediate), Email 2 (Kickoff Prep, before kickoff), Email 3 (Engagement Activated, post-kickoff with dashboard live + support channels).",
      tags: ["cdp", "rbac", "stakeholder-roles", "kickoff-pack", "onboarding", "live-mode"],
      vertical: "Platform / Client Delivery",
      confidenceScore: 0.99,
      ninTag: "NIN-CDP-010",
      playbookId: "sentrais-cdp-spec",
    },

    // ── Implementation Roadmap ───────────────────────────────────────────────
    {
      category: "platform-intelligence",
      content:
        "CDP Implementation Roadmap — 4 phases. Phase 1: HubSpot objects, portal IA, onboarding workflow. Phase 2: Executive Dashboard, Workstreams, Communications Center. Phase 3: Decision Center, System Intelligence, Evidence Ledger. Phase 4: Simulation Center, insight reporting, advanced automation. Priority Figma deliverables (highest-value next step): wireframes for 5 screens — (1) Executive Dashboard, (2) Engagement Blueprint, (3) Workstreams, (4) Decision Center, (5) Communications Center. Figma component needs: Layout (Top Bar, Left Nav, Dashboard Grid, Content Section Header, Side Alert Rail), Data (KPI Stat Card, Risk Badge, Readiness Gauge, Milestone Tracker, Decision Card, Deliverable Card, Evidence Card, Communication Card, Simulation Card), Visualization (dependency graph, ecosystem map, authority tree, timeline, risk heat map, readiness radar).",
      tags: ["cdp", "roadmap", "phases", "figma", "implementation", "components"],
      vertical: "Platform / Client Delivery",
      confidenceScore: 0.99,
      ninTag: "NIN-CDP-011",
      playbookId: "sentrais-cdp-spec",
    },
  ];

  for (const entry of entries) {
    const [inserted] = await db
      .insert(schema.sipeEntries)
      .values(entry)
      .returning();
    console.log(`  SIPE: ${inserted.ninTag}`);
  }

  console.log("\nIngest 5 complete.");
  console.log("  Platform Overview:    NIN-CDP-001");
  console.log("  UI Architecture:      NIN-CDP-002 — NIN-CDP-004");
  console.log("  HubSpot Schema:       NIN-CDP-005 — NIN-CDP-006");
  console.log("  n8n Workflows:        NIN-CDP-007 — NIN-CDP-008");
  console.log("  Client Onboarding:    NIN-CDP-009 — NIN-CDP-010");
  console.log("  Implementation Plan:  NIN-CDP-011");

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env npx tsx
/**
 * Seeds the sipe_entries table with foundational SIPE knowledge documents.
 * Idempotent: skips any entry whose playbookId already exists.
 *
 * Run with: npm run db:seed-sipe
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { inArray } from "drizzle-orm";
import { readFileSync } from "fs";
import { resolve } from "path";
import { sipeEntries } from "../src/lib/db/schema";

// Load .env.local if present (mirrors run-migrations.ts)
try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of envFile.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0 && !process.env[line.slice(0, idx).trim()]) {
      process.env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
} catch {}

const rawUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!rawUrl) {
  process.stderr.write("DATABASE_URL not set\n");
  process.exit(1);
}
// postgres-js does not support the channel_binding parameter — strip it
const DATABASE_URL = rawUrl.replace(/[&?]channel_binding=[^&]*/g, "");

interface SeedEntry {
  category: string;
  content: string;
  tags: string[];
  vertical: string;
  applicablePhases: string[];
  confidenceScore: number;
  playbookId: string;
}

const ENTRIES: SeedEntry[] = [
  {
    playbookId: "discovery-stakeholder-mapping",
    category: "playbook",
    vertical: "general",
    applicablePhases: ["discovery", "diagnostic"],
    confidenceScore: 0.92,
    tags: ["stakeholder-mapping", "discovery", "alignment", "power-interest-grid", "kickoff"],
    content:
      "Begin every engagement by mapping stakeholders on a power/interest grid before committing to a roadmap. Identify the economic buyer, the day-to-day champion, and the silent blockers. Schedule individual 30-minute interviews with each high-power stakeholder in the first week. Document explicit and implicit success criteria for each — misalignment surfaced late is the single most common cause of stalled engagements. Reconfirm the grid at every gate review because authority and interest shift as the project gains visibility.",
  },
  {
    playbookId: "diagnostic-current-state-baseline",
    category: "playbook",
    vertical: "general",
    applicablePhases: ["diagnostic"],
    confidenceScore: 0.9,
    tags: ["baseline", "current-state", "metrics", "data-collection", "diagnostic"],
    content:
      "Establish a quantified current-state baseline before proposing any intervention. Capture the three to five KPIs the client already trusts, pull at least 90 days of history, and timestamp the snapshot. Without a credible baseline you cannot prove impact at closeout, and clients will discount qualitative claims. Where instrumentation is missing, deploy lightweight manual sampling rather than waiting for perfect telemetry.",
  },
  {
    playbookId: "design-sprint-zero-charter",
    category: "playbook",
    vertical: "general",
    applicablePhases: ["design"],
    confidenceScore: 0.88,
    tags: ["sprint-zero", "charter", "scope-control", "design", "working-agreement"],
    content:
      "Run a Sprint Zero to ratify a one-page charter: problem statement, in-scope and explicitly out-of-scope items, decision rights, and the definition of done. Get a signature or recorded verbal commitment from the economic buyer. The out-of-scope list prevents the slow expansion of expectations that erodes margin and timeline. Revisit the charter only through a formal change-control note, never informally over chat.",
  },
  {
    playbookId: "implementation-thin-slice-first",
    category: "pattern",
    vertical: "technology",
    applicablePhases: ["implementation", "execution"],
    confidenceScore: 0.91,
    tags: ["thin-slice", "vertical-slice", "incremental-delivery", "de-risking", "implementation"],
    content:
      "Ship a thin end-to-end vertical slice before broadening horizontally. One real user completing one real workflow against production-shaped data surfaces integration, auth, and data-quality problems that mockups hide. The thin slice becomes the reference architecture the rest of the build clones, and it gives the client an early credibility win that protects the budget for later phases.",
  },
  {
    playbookId: "evaluation-impact-attribution",
    category: "playbook",
    vertical: "general",
    applicablePhases: ["evaluation", "closeout"],
    confidenceScore: 0.86,
    tags: ["impact-measurement", "attribution", "roi", "evaluation", "closeout"],
    content:
      "Attribute impact by comparing the post-intervention metric against the pre-intervention baseline over an equivalent window, controlling for known seasonality. Express results in the client's own financial units (revenue, cost avoided, hours reclaimed), not in vanity activity counts. When a clean control group is impossible, document the counterfactual assumptions transparently — defensible honesty earns more renewals than inflated numbers.",
  },
  {
    playbookId: "venue-throughput-bottleneck",
    category: "lesson",
    vertical: "venue",
    applicablePhases: ["diagnostic", "implementation"],
    confidenceScore: 0.83,
    tags: ["throughput", "queueing", "venue-operations", "bottleneck-analysis", "peak-load"],
    content:
      "In venue operations the binding constraint is almost always a single chokepoint at peak load — entry scanning, concessions, or egress — not average-day capacity. Instrument dwell time at each station during a real peak event rather than modeling from averages. Relieving the true bottleneck by even 15% often unlocks more total throughput than a blanket capacity increase, at a fraction of the cost.",
  },
  {
    playbookId: "venue-staffing-demand-curve",
    category: "benchmark",
    vertical: "venue",
    applicablePhases: ["diagnostic", "evaluation"],
    confidenceScore: 0.78,
    tags: ["staffing", "demand-forecasting", "labor-cost", "venue", "benchmark"],
    content:
      "Across comparable venue engagements, labor scheduled to a flat headcount runs 20-30% over-staffed in off-peak hours and under-staffed during the 90-minute peak. Aligning shift starts to the demand curve typically recovers 12-18% of variable labor cost while improving peak service levels. Use this band as a sanity check on staffing proposals before committing to a target.",
  },
  {
    playbookId: "workforce-skills-gap-ladder",
    category: "playbook",
    vertical: "workforce",
    applicablePhases: ["design", "implementation"],
    confidenceScore: 0.85,
    tags: ["skills-gap", "upskilling", "career-ladder", "workforce-development", "competency-matrix"],
    content:
      "Frame workforce upskilling as a competency ladder with observable behaviors at each rung, not as a catalog of courses. Map current staff to rungs, identify the one rung-jump that unblocks the most downstream roles, and concentrate training budget there. Pair every formal course with an on-the-job application within two weeks or retention of the skill collapses. Measure progression by demonstrated competency, never by seat-time.",
  },
  {
    playbookId: "workforce-retention-early-warning",
    category: "pattern",
    vertical: "workforce",
    applicablePhases: ["evaluation"],
    confidenceScore: 0.8,
    tags: ["retention", "attrition", "early-warning", "workforce", "engagement-signals"],
    content:
      "Predict attrition from leading signals — declining shift pickup, drop in voluntary overtime, and reduced internal-mobility applications — which move four to eight weeks before resignation. A simple weighted index of these signals flags at-risk cohorts early enough for a manager conversation to change the outcome. Lagging metrics like exit-survey themes explain the past but cannot prevent the next departure.",
  },
  {
    playbookId: "government-procurement-compliance",
    category: "playbook",
    vertical: "government",
    applicablePhases: ["discovery", "design"],
    confidenceScore: 0.87,
    tags: ["procurement", "compliance", "public-sector", "rfp", "government"],
    content:
      "In government engagements, procurement rules constrain solution design as hard as technical requirements do. Confirm the contract vehicle, allowable sole-source thresholds, and required certifications before architecting anything. A technically superior approach that cannot be lawfully purchased is worthless. Build the compliance matrix in week one and have contracting counsel validate it before design freeze.",
  },
  {
    playbookId: "government-public-records-by-design",
    category: "lesson",
    vertical: "government",
    applicablePhases: ["design", "implementation"],
    confidenceScore: 0.82,
    tags: ["public-records", "foia", "transparency", "data-retention", "government"],
    content:
      "Assume every record a public-sector system creates is subject to disclosure and statutory retention. Design data models and audit logs for defensible export from day one rather than retrofitting under a records request. Separate genuinely exempt data (PII, security-sensitive) with field-level controls so a disclosure request can be satisfied without a costly manual redaction marathon.",
  },
  {
    playbookId: "technology-migration-strangler-fig",
    category: "pattern",
    vertical: "technology",
    applicablePhases: ["implementation"],
    confidenceScore: 0.89,
    tags: ["legacy-migration", "strangler-fig", "incremental-cutover", "technology", "risk-reduction"],
    content:
      "Migrate legacy systems with the strangler-fig pattern: route traffic through a facade, peel off one capability at a time behind it, and decommission the old path only after the new one is proven in production. Big-bang cutovers concentrate all risk on a single irreversible date. Incremental cutover keeps a rollback available at every step and lets the client absorb change at a sustainable pace.",
  },
  {
    playbookId: "technology-observability-first",
    category: "playbook",
    vertical: "technology",
    applicablePhases: ["implementation", "evaluation"],
    confidenceScore: 0.84,
    tags: ["observability", "logging", "metrics", "tracing", "technology"],
    content:
      "Stand up logging, metrics, and tracing before the first feature, not after the first incident. Observability built in from the start turns production debugging from speculation into evidence and is the foundation for the impact measurement the client will demand at closeout. The marginal cost of instrumenting as you build is a fraction of bolting it on under outage pressure.",
  },
  {
    playbookId: "community-trust-building-cadence",
    category: "playbook",
    vertical: "community",
    applicablePhases: ["discovery", "design"],
    confidenceScore: 0.81,
    tags: ["community-engagement", "trust", "co-design", "feedback-loops", "community"],
    content:
      "Community initiatives succeed or fail on trust, which is built through a visible, reliable cadence of listening and visible follow-through. Schedule recurring sessions, publish what you heard, and report back on what changed because of it. One broken commitment costs more trust than ten kept ones earn. Co-design with the affected community rather than presenting finished solutions for reaction.",
  },
  {
    playbookId: "community-equity-impact-review",
    category: "lesson",
    vertical: "community",
    applicablePhases: ["design", "evaluation"],
    confidenceScore: 0.79,
    tags: ["equity", "impact-review", "disaggregated-data", "inclusion", "community"],
    content:
      "Evaluate community interventions with disaggregated data, because an initiative that improves the average can still widen the gap for the most vulnerable subgroup. Define equity-relevant segments up front and review outcomes per segment at each gate. Surfacing an unintended disparity early lets you adjust the design; discovering it at closeout becomes a reputational liability.",
  },
];

async function seed() {
  const sql = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(sql, { schema: { sipeEntries } });

  try {
    const ids = ENTRIES.map((e) => e.playbookId);
    const existing = await db
      .select({ playbookId: sipeEntries.playbookId })
      .from(sipeEntries)
      .where(inArray(sipeEntries.playbookId, ids));
    const existingIds = new Set(existing.map((r) => r.playbookId));

    const toInsert = ENTRIES.filter((e) => !existingIds.has(e.playbookId));

    if (toInsert.length === 0) {
      process.stdout.write("All SIPE seed documents already present — nothing to insert.\n");
      return;
    }

    await db.insert(sipeEntries).values(
      toInsert.map((e) => ({
        category: e.category,
        content: e.content,
        tags: e.tags,
        vertical: e.vertical,
        applicablePhases: e.applicablePhases,
        confidenceScore: e.confidenceScore,
        playbookId: e.playbookId,
      }))
    );

    process.stdout.write(
      `Inserted ${toInsert.length} SIPE document(s); skipped ${existingIds.size} existing.\n`
    );
  } finally {
    await sql.end();
  }
}

seed().catch((e) => {
  process.stderr.write(`Seed failed: ${e instanceof Error ? e.message : String(e)}\n`);
  process.exit(1);
});

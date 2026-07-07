/**
 * Ingest seed 4: NOVATELabs Intake folder — Google Drive batch
 * Run: npx tsx src/scripts/seed-ingest-4.ts
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
  console.log("Ingesting NOVATELabs Intake folder (Google Drive batch 4)...");

  const entries = [
    // ── Governance / Compliance ──────────────────────────────────────────────
    {
      category: "governance-compliance",
      content:
        "Kevin Murriel COI Disclosure — filed 2026-07-02. Murriel is a compensated Sentrais advisor (1099 contractor). Simultaneously holds civic role at ARI/BGI (uncompensated, no conflict declared). NOVATELabs board nomination WITHDRAWN prior to this filing. Current NOVATELabs board: Knox Phillips (President), Valorie Salahuddin (Treasurer), Mikalina Simonson (Secretary). Disclosure confirms no financial entanglement between Sentrais compensation and NOVATELabs governance role. Filed for Evidence Ledger and board record.",
      tags: ["coi", "disclosure", "kevin-murriel", "board", "novatelabs", "governance"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.99,
      ninTag: "NIN-GOV-COI-001",
      playbookId: "novatelabs-intake-batch-4",
    },

    // ── Unified Identity Platform ────────────────────────────────────────────
    {
      category: "platform-intelligence",
      content:
        "Unified Identity Platform (UIP) — Draft Architecture. Single Clerk-anchored identity federating to all spokes via OIDC. Three-layer model: Root Layer (Clerk instance for Sentrais), Federated Layer (per-spoke OIDC providers), Entity-Scoped Layer (workspace/team/project claims). Evidence Ledger captures all auth events. Competitor landscape: ID.me (government biometrics), Okta (enterprise SSO), Microsoft Entra (M365 orgs), Ping Identity (regulated industries). UIP differentiator: open OIDC federation with Evidence Ledger-backed audit trail.",
      tags: ["uip", "clerk", "oidc", "identity", "federation", "architecture"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.97,
      ninTag: "NIN-UIP-001",
      playbookId: "novatelabs-intake-batch-4",
    },
    {
      category: "platform-intelligence",
      content:
        "UIP Roadmap — 4-phase plan. Phase 1: Clerk root instance + OIDC provider scaffolding (complete for sentrais-forge). Phase 2: Evidence Ledger auth event integration — every sign-in, token refresh, and role change logged with NIN reference. Phase 3: AI agent identity layer — gap flagged; AI agents currently lack a first-class identity claim in Clerk. Proposed: service-account OIDC tokens with agent-id metadata. Phase 4: Cross-spoke federation dashboard — UIP admin console showing all spoke auth status, token health, and incident flags.",
      tags: ["uip", "roadmap", "ai-agent-identity", "evidence-ledger", "phases"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.95,
      ninTag: "NIN-UIP-002",
      playbookId: "novatelabs-intake-batch-4",
    },

    // ── Lovable Prompt Templates ─────────────────────────────────────────────
    {
      category: "lovable-prompt-template",
      content:
        "Lovable Prototype Template — Structured prompt template for full app prototypes. Sections: scope statement, target users, screens list with states (empty/loading/error/populated), design requirements (Tailwind + shadcn/ui), acceptance checks (auth gate, mobile responsive, Supabase data loads, RLS enforced). Template enforces scope discipline: each prompt targets exactly one screen or one state transition. Use for initial project creation in Lovable editor.",
      tags: ["lovable", "prompt-template", "prototype", "scaffold"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.95,
      ninTag: "NIN-LOVABLE-TPL-001",
      playbookId: "novatelabs-intake-batch-4",
    },
    {
      category: "lovable-prompt-template",
      content:
        "Lovable Rapid Lo Build Template — Condensed prompt format for fast single-screen builds. Omits multi-section structure; uses inline constraints: 'Build [screen] for [user type]. Stack: React 18 + Vite + Tailwind + shadcn/ui + Supabase. No mock data. RLS required. Mobile-first.' Suitable for iteration prompts after initial scaffold. Faster feedback loop; sacrifice some structure for speed.",
      tags: ["lovable", "prompt-template", "rapid", "single-screen"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.93,
      ninTag: "NIN-LOVABLE-TPL-002",
      playbookId: "novatelabs-intake-batch-4",
    },
    {
      category: "lovable-prompt-template",
      content:
        "Lovable Client Project Portal Prompt — 5-screen client portal: (1) Login (Supabase Auth email+password), (2) Dashboard (active projects, recent activity, quick actions), (3) Deliverables (file list with download, status badges), (4) Feedback (comment threads per deliverable with @mentions), (5) Invoices (list with PDF download and payment status). Stack: React 18 + Vite + shadcn/ui + Supabase + react-query v5. RLS: client sees only their project rows.",
      tags: ["lovable", "prompt-template", "client-portal", "5-screen"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.95,
      ninTag: "NIN-LOVABLE-TPL-003",
      playbookId: "novatelabs-intake-batch-4",
    },
    {
      category: "lovable-prompt-template",
      content:
        "Lovable PM Dashboard Prompt — 8-screen project management dashboard: (1) Sprint Health overview, (2) Sprint Detail with task breakdown, (3) Workload heatmap by assignee, (4) Blockers & Issues log, (5) PR tracker with status, (6) Deployments timeline, (7) Team Member drawer (profile + assignments), (8) Incident Panel with severity triage. Uses @dnd-kit for Kanban drag-and-drop. Stack: React 18 + Vite + Tailwind + shadcn/ui + Supabase + react-query v5 + zustand.",
      tags: ["lovable", "prompt-template", "pm-dashboard", "kanban", "8-screen"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.95,
      ninTag: "NIN-LOVABLE-TPL-004",
      playbookId: "novatelabs-intake-batch-4",
    },
    {
      category: "lovable-prompt-template",
      content:
        "Lovable Software Development Dashboard Prompt — 8-screen engineering manager view: (1) Sprint Health KPIs, (2) Sprint Detail task list, (3) Workload by engineer, (4) Issues/Blockers with severity, (5) Pull Requests (open/review/merged status), (6) Deployments log with environment tags, (7) Team Member drawer with contribution metrics, (8) Incident Panel with SLA countdown. Designed for EM-level visibility across multiple squads. Integrates with GitHub PR data via Supabase Edge Function webhook.",
      tags: ["lovable", "prompt-template", "software-dev-dashboard", "engineering-manager", "8-screen"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.95,
      ninTag: "NIN-LOVABLE-TPL-005",
      playbookId: "novatelabs-intake-batch-4",
    },

    // ── Lovable Knowledge Base ───────────────────────────────────────────────
    {
      category: "lovable-knowledge-base",
      content:
        "Lovable PM Dashboard Knowledge File — Complete technical reference. Stack: React 18 + Vite + TypeScript, Tailwind CSS, shadcn/ui components, Supabase (PostgreSQL + Auth + Realtime + Storage), @tanstack/react-query v5, zustand (global state), @dnd-kit (Kanban), react-hook-form + zod (validation), date-fns, react-router v6. Full SQL schema with RLS policies: projects, sprints, tasks, team_members, blockers, pull_requests, deployments, incidents tables. 10-prompt build blueprint covering screen-by-screen sequence. 13 house rules: no mock data, mobile-first, RLS mandatory, no inline styles, query invalidation on mutations, optimistic updates for drag-and-drop, error boundaries required.",
      tags: ["lovable", "knowledge-base", "pm-dashboard", "schema", "rls", "10-prompt-blueprint", "house-rules"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.99,
      ninTag: "NIN-LOVABLE-KB-001",
      playbookId: "novatelabs-intake-batch-4",
    },

    // ── Engineering Handbooks ────────────────────────────────────────────────
    {
      category: "engineering-handbook",
      content:
        "NOVATELabs Lovable Team Handbook — Production operations guide. 5 roles: Product Owner (scope/acceptance), Prompt Lead (writes/sequences prompts), Reviewing Engineer (code review + security), Schema Steward (migration/RLS owner), Workspace Admin (Lovable + Supabase access). 6-stage loop: scope → prompt → build → review → schema → deploy. Branching strategy: main, staging, lovable/*, human/*, fix/*, schema/*. PR review checklist with 9 sections. Supabase directory: /supabase/migrations/, /supabase/functions/, /supabase/seed.sql. Project Manifest template for documenting each Lovable project.",
      tags: ["lovable", "handbook", "team", "roles", "branching", "pr-checklist", "novatelabs"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.99,
      ninTag: "NIN-LOVABLE-HB-001",
      playbookId: "novatelabs-intake-batch-4",
    },
    {
      category: "engineering-handbook",
      content:
        "NOVATELabs PULL_REQUEST_TEMPLATE — 9-section reviewer checklist. Sections: (1) Meta (PR type, linked issue, breaking change flag), (2) Scope discipline (single concern, no scope creep), (3) Type safety (no `any`, full prop types), (4) Security [BLOCKING] (no hardcoded secrets, input sanitized, auth checked), (5) Supabase/RLS [BLOCKING] (all tables have RLS, policies tested, migrations reversible), (6) Accessibility (ARIA labels, keyboard nav, color contrast), (7) Performance (no N+1 queries, memoization used), (8) Testing (happy path + error states covered), (9) Documentation (README updated if API changed). Blocking sections must pass before merge.",
      tags: ["pr-template", "checklist", "security", "rls", "accessibility", "novatelabs"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.99,
      ninTag: "NIN-LOVABLE-HB-002",
      playbookId: "novatelabs-intake-batch-4",
    },
    {
      category: "engineering-handbook",
      content:
        "NOVATELabs Schema PR Template — Dedicated PR template for database schema changes. 9-section reviewer checklist targeting schema-specific risk: migration is additive-only (no destructive column drops without deprecation window), RLS policies added for every new table, indexes added for foreign keys and frequent filter columns, seed data updated, no breaking changes to existing queries, rollback script provided, Supabase types regenerated, Row Security reviewed by Schema Steward. Two variants in repo: schema.md (machine-readable) and RLS text example (rendered/formatted).",
      tags: ["schema", "pr-template", "rls", "migration", "supabase", "novatelabs"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.99,
      ninTag: "NIN-SCHEMA-GOV-001",
      playbookId: "novatelabs-intake-batch-4",
    },

    // ── Supabase Patterns ────────────────────────────────────────────────────
    {
      category: "supabase-patterns",
      content:
        "invite-member Edge Function — Deno-based Supabase Edge Function for project member invitations. Handles 3 cases: (1) existing Supabase user → direct project_members insert, (2) new user → insert to pending_invites table with email token, (3) already a member → 409 conflict response. pending_invites table has a promotion trigger: when user signs up, trigger promotes pending_invite to project_members. CORS headers set for all origins. Zod validation on request body. Uses service-role key (server-side only). Auth guard: only project owners can invite.",
      tags: ["supabase", "edge-function", "invite", "deno", "pending-invites", "trigger"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.97,
      ninTag: "NIN-SUPABASE-001",
      playbookId: "novatelabs-intake-batch-4",
    },
    {
      category: "supabase-patterns",
      content:
        "InviteMemberDialog + useProjectMembers hooks — React component and mutation hooks for member management UI. InviteMemberDialog: shadcn/ui Dialog with email input + role selector (viewer/editor/admin), calls invite-member Edge Function, toast on success/error. useProjectMembers: react-query useQuery on project_members joined with profiles, includes Realtime subscription for live updates. useUpdateMemberRole: useMutation for PATCH with optimistic update + rollback. useRemoveMember: useMutation for DELETE with confirmation. All hooks invalidate 'project-members' query key on settle.",
      tags: ["supabase", "react", "hooks", "invite-dialog", "realtime", "mutations"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.97,
      ninTag: "NIN-SUPABASE-002",
      playbookId: "novatelabs-intake-batch-4",
    },

    // ── Monitoring / Tooling ─────────────────────────────────────────────────
    {
      category: "monitoring-tooling",
      content:
        "Dropbox Lovable Prompt Library Change Monitor — Python script tracking metadata/section/guardrail changes in the Lovable Prompt Library stored in Dropbox. Modes: --watch (polling loop), --dry-run (diff only, no write), --upload-changelog (push CHANGELOG.md back to Dropbox). Writes CHANGELOG.md at repo root and per-template logs in /logs/. Tracks: prompt text diffs, section additions/removals, guardrail edits, metadata version bumps. Intended for audit trail of prompt evolution. Integrate with CI to block merges if guardrails are removed without approval.",
      tags: ["dropbox", "monitoring", "prompt-library", "changelog", "python", "lovable"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.93,
      ninTag: "NIN-DEVTOOLS-001",
      playbookId: "novatelabs-intake-batch-4",
    },

    // ── Design System Process ────────────────────────────────────────────────
    {
      category: "design-system-process",
      content:
        "Designer–Dev Collaboration Handbook — Figma Variables → DTCG JSON → GitHub Actions → Style Dictionary → SCSS/CSS pipeline. Figma plugin exports variables as DTCG 2025.10 format JSON. Cloudflare Worker webhook relay triggers GitHub Action on export. Style Dictionary transforms tokens to SCSS custom properties and CSS variables. Token schema validated with ajv against DTCG spec before merge. Designer checklist for triggering PRs: (1) export from Figma plugin, (2) verify JSON validates, (3) open PR against design-tokens branch, (4) tag Schema Steward for review. Pipeline SLA: tokens live in production within 1 business day of merge.",
      tags: ["design-system", "figma", "dtcg", "style-dictionary", "github-actions", "tokens"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.97,
      ninTag: "NIN-DESIGN-SYS-001",
      playbookId: "novatelabs-intake-batch-4",
    },
    {
      category: "design-system-process",
      content:
        "Token Sync Troubleshooting Runbook — 4-stage diagnostic guide for the Figma → GitHub → Style Dictionary pipeline. Stage 1 (Figma plugin): check plugin version, verify variable scopes are set to 'All scopes', confirm export format is DTCG. Stage 2 (Webhook relay — Cloudflare Worker): check Worker logs for 4xx/5xx, verify GITHUB_PAT secret not expired, test with curl. Stage 3 (GitHub Actions): inspect workflow run logs, check ajv validation errors in 'Validate tokens' step, ensure SCSS output directory exists. Stage 4 (Style Dictionary): check transform group config, verify platform targets, confirm output path matches SCSS import in component library. Escalation template included for cross-team incidents.",
      tags: ["design-system", "troubleshooting", "runbook", "style-dictionary", "cloudflare-worker", "tokens"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.97,
      ninTag: "NIN-DESIGN-SYS-002",
      playbookId: "novatelabs-intake-batch-4",
    },

    // ── Session History / Deployment ─────────────────────────────────────────
    {
      category: "session-history",
      content:
        "Firebase Connection Session Recap — evergame 6-app Vercel deployment + Firebase OIDC walkthrough. Documents the session where sentrais-forge PR #5 was scaffolded with signInWithPopup via oidc.sentrais OIDC provider. Confirms: Vercel project sentrais-forge deployed, Firebase project forge-bf42d active, Clerk instance https://sought-dolphin-26.clerk.accounts.dev designated as OIDC IdP. Three external gates remain before PR #5 can merge (documented in NIN-FORGE-SSO-001 through NIN-FORGE-SSO-005). This document is the session artifact that originated the FORGE playbook.",
      tags: ["session-history", "evergame", "firebase", "vercel", "sentrais-forge", "oidc"],
      vertical: "Platform / Engineering",
      confidenceScore: 0.90,
      ninTag: "NIN-SESSION-001",
      playbookId: "novatelabs-intake-batch-4",
    },
  ];

  for (const entry of entries) {
    const [inserted] = await db
      .insert(schema.sipeEntries)
      .values(entry)
      .returning();
    console.log(`  SIPE: ${inserted.ninTag}`);
  }

  console.log("\nIngest 4 complete.");
  console.log("  Governance:          NIN-GOV-COI-001");
  console.log("  Identity Platform:   NIN-UIP-001 — NIN-UIP-002");
  console.log("  Lovable Templates:   NIN-LOVABLE-TPL-001 — NIN-LOVABLE-TPL-005");
  console.log("  Lovable KB:          NIN-LOVABLE-KB-001");
  console.log("  Handbooks:           NIN-LOVABLE-HB-001 — NIN-LOVABLE-HB-002");
  console.log("  Schema Governance:   NIN-SCHEMA-GOV-001");
  console.log("  Supabase Patterns:   NIN-SUPABASE-001 — NIN-SUPABASE-002");
  console.log("  Dev Tools:           NIN-DEVTOOLS-001");
  console.log("  Design System:       NIN-DESIGN-SYS-001 — NIN-DESIGN-SYS-002");
  console.log("  Session History:     NIN-SESSION-001");

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

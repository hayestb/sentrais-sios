/**
 * Ingest seed 3: Firebase OIDC Sentrais SSO Playbook (sentrais-forge PR #5)
 * Run: npx tsx src/scripts/seed-ingest-3.ts
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
  console.log("Ingesting Firebase OIDC Playbook (sentrais-forge SSO)...");

  const entries = [
    {
      category: "forge-playbook",
      content:
        "FORGE Playbook: Firebase Identity Platform — Sentrais SSO (OIDC). Spoke: sentrais-forge (forge-bf42d). PR #5 ships signInWithPopup via oidc.sentrais OIDC provider delegating to Clerk instance https://sought-dolphin-26.clerk.accounts.dev. App code is complete. Three external systems require configuration before merge: (1) Firebase Identity Platform upgrade, (2) Clerk OAuth application creation, (3) Firebase OIDC provider registration. Gate 1 is a billing-tier change requiring console access — hard block. All 5 gates must complete in sequence before PR #5 merges.",
      tags: ["firebase", "oidc", "clerk", "sso", "sentrais-forge", "forge-playbook", "pr-5"],
      vertical: "Platform / Spoke Infrastructure",
      confidenceScore: 0.99,
      ninTag: "NIN-FORGE-SSO-001",
      playbookId: "firebase-oidc-sentrais-sso",
    },
    {
      category: "forge-playbook",
      content:
        "Gate 1 — Enable Firebase Identity Platform (Hard Block). Owner: Tye Hayes. Firebase Console → forge-bf42d → Authentication → Sign-in method → Upgrade to Identity Platform. Required before OIDC provider can be registered. Review GCIP pricing before confirming. Completion check: OpenID Connect option visible in Sign-in method provider list.",
      tags: ["firebase", "identity-platform", "gate-1", "hard-block", "sentrais-forge"],
      vertical: "Platform / Spoke Infrastructure",
      confidenceScore: 0.99,
      ninTag: "NIN-FORGE-SSO-002",
      playbookId: "firebase-oidc-sentrais-sso",
    },
    {
      category: "forge-playbook",
      content:
        "Gate 2 — Create Clerk OAuth Application (Hard Block). Owner: Tye Hayes. Clerk Dashboard → OAuth Applications → New application. Name: 'sentrais-forge (Firebase)'. Redirect URI: https://forge-bf42d.firebaseapp.com/__/auth/handler. Scopes: openid, email, profile. Enable 'Generate access tokens as JWTs'. Store Client ID and Client Secret in secure vault under 'sentrais-forge OIDC'. Completion check: application Active in Clerk dashboard.",
      tags: ["clerk", "oauth-app", "gate-2", "hard-block", "sentrais-forge"],
      vertical: "Platform / Spoke Infrastructure",
      confidenceScore: 0.99,
      ninTag: "NIN-FORGE-SSO-003",
      playbookId: "firebase-oidc-sentrais-sso",
    },
    {
      category: "forge-playbook",
      content:
        "Gate 3 — Register OIDC Provider in Firebase (Hard Block). Dependency: Gates 1 and 2 complete. Firebase Console → forge-bf42d → Authentication → Sign-in method → Add new provider → OpenID Connect. Name: 'sentrais' (Firebase auto-assigns oidc.sentrais). Issuer URL: https://sought-dolphin-26.clerk.accounts.dev. Client ID and Secret from Gate 2. Confirm callback URL matches: https://forge-bf42d.firebaseapp.com/__/auth/handler. Completion check: oidc.sentrais appears in provider list with status Enabled.",
      tags: ["firebase", "oidc-provider", "gate-3", "hard-block", "sentrais-forge"],
      vertical: "Platform / Spoke Infrastructure",
      confidenceScore: 0.99,
      ninTag: "NIN-FORGE-SSO-004",
      playbookId: "firebase-oidc-sentrais-sso",
    },
    {
      category: "forge-playbook",
      content:
        "Gate 4 — Verify Authorized Domains (Soft Block). Firebase Console → forge-bf42d → Authentication → Settings → Authorized domains. Confirm present: forge-bf42d.firebaseapp.com, forge-bf42d.web.app, any custom production domain. Gate 5 — Set Vercel Env Var + Merge PR #5. Vercel → sentrais-forge → Settings → Environment Variables → add REACT_APP_SENTRAIS_OIDC_PROVIDER_ID = oidc.sentrais (all environments). Test on PR #5 preview: sign-in popup → Clerk auth → /dashboard loads → Firestore data loads. On pass: merge PR #5. Evidence for Audit Stream: screenshot of each gate completion logged to Evidence Ledger (entry types: blueprint, raci_update, blueprint360_assessment).",
      tags: ["firebase", "authorized-domains", "vercel", "gate-4", "gate-5", "pr-5-merge", "sentrais-forge"],
      vertical: "Platform / Spoke Infrastructure",
      confidenceScore: 0.99,
      ninTag: "NIN-FORGE-SSO-005",
      playbookId: "firebase-oidc-sentrais-sso",
    },
  ];

  for (const entry of entries) {
    const [inserted] = await db
      .insert(schema.sipeEntries)
      .values(entry)
      .returning();
    console.log(`  SIPE: ${inserted.ninTag}`);
  }

  console.log("\nIngest 3 complete.");
  console.log("  Firebase OIDC Playbook: NIN-FORGE-SSO-001 through NIN-FORGE-SSO-005");
  console.log("  Playbook file: src/playbooks/firebase-oidc-sentrais-sso.md");

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

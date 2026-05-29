#!/usr/bin/env npx tsx
/**
 * Push all secrets from .env.local to:
 *   1. GitHub Actions repository secrets
 *   2. Vercel project environment variables (production + preview)
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_xxx  VERCEL_TOKEN=xxx  npm run push:env
 *
 * To skip one platform, omit its token — the script will warn and continue.
 *
 * Vercel project is hardcoded (discovered automatically):
 *   Team:    NOVATELabs  (team_DzGghlCvuV1MGb7q8RrLKB1Z)
 *   Project: sentrais-sios (prj_mA2rYmmoOA3zx8DKAtAhhhoHtPCX)
 *
 * GitHub repo: hayestb/sentrais-sios
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// ── Hardcoded project coordinates ─────────────────────────────────────────────

const GITHUB_OWNER = "hayestb";
const GITHUB_REPO  = "sentrais-sios";
const VERCEL_TEAM  = "team_DzGghlCvuV1MGb7q8RrLKB1Z";
const VERCEL_PROJECT = "prj_mA2rYmmoOA3zx8DKAtAhhhoHtPCX";

// Variables to sync — env file key → target name (same in both platforms)
const SYNC_VARS = [
  "DATABASE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SECRET",
  "ENCRYPTION_KEY",
  "MONDAY_API_TOKEN",
  "MONDAY_COMMERCIAL_BOARD_ID",
  "MONDAY_NONPROFIT_BOARD_ID",
  "HUBSPOT_API_KEY",
  "HUBSPOT_WEBHOOK_SECRET",
  "NEXT_PUBLIC_APP_URL",
  // GCP-specific (only pushed to GitHub Actions, skipped for Vercel)
  "CLOUD_SQL_INSTANCE",
  "STAGING_APP_URL",
] as const;

// These are only needed in GitHub Actions, not Vercel
const GITHUB_ONLY = new Set(["CLOUD_SQL_INSTANCE", "STAGING_APP_URL"]);

// ── Helpers ───────────────────────────────────────────────────────────────────

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const ENV_PATH = resolve(process.cwd(), ".env.local");

function ok(msg: string)   { process.stdout.write(`  ✓ ${msg}\n`); }
function warn(msg: string) { process.stdout.write(`  ⚠ ${msg}\n`); }
function log(msg: string)  { process.stdout.write(`  ${msg}\n`); }

function readEnvLocal(): Map<string, string> {
  if (!existsSync(ENV_PATH)) return new Map();
  const map = new Map<string, string>();
  for (const line of readFileSync(ENV_PATH, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const idx = t.indexOf("=");
    if (idx === -1) continue;
    const val = t.slice(idx + 1).trim();
    if (val) map.set(t.slice(0, idx), val);
  }
  return map;
}

// ── GitHub Actions secrets ────────────────────────────────────────────────────

async function getGitHubPublicKey(): Promise<{ key: string; key_id: string }> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/secrets/public-key`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json" } }
  );
  if (!res.ok) throw new Error(`GitHub public-key fetch failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<{ key: string; key_id: string }>;
}

function encryptSecret(publicKeyB64: string, value: string): string {
  // tweetsodium.seal uses libsodium's crypto_box_seal — GitHub's required format
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sodium = require("tweetsodium") as { seal: (msg: Uint8Array, key: Uint8Array) => Uint8Array };
  const keyBytes = Buffer.from(publicKeyB64, "base64");
  const msgBytes = Buffer.from(value, "utf8");
  return Buffer.from(sodium.seal(msgBytes, keyBytes)).toString("base64");
}

async function putGitHubSecret(
  name: string,
  encryptedValue: string,
  keyId: string
): Promise<void> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/secrets/${name}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ encrypted_value: encryptedValue, key_id: keyId }),
    }
  );
  if (!res.ok && res.status !== 204) {
    throw new Error(`GitHub secret PUT failed for ${name}: ${res.status} ${await res.text()}`);
  }
}

async function pushGitHubSecrets(env: Map<string, string>): Promise<void> {
  if (!GITHUB_TOKEN) {
    warn("GITHUB_TOKEN not set — skipping GitHub Actions secrets");
    return;
  }

  process.stdout.write("\nGitHub Actions secrets\n");
  const { key, key_id } = await getGitHubPublicKey();

  let pushed = 0;
  let skipped = 0;
  for (const name of SYNC_VARS) {
    const value = env.get(name);
    if (!value) { warn(`${name} not in .env.local — skipped`); skipped++; continue; }
    const encrypted = encryptSecret(key, value);
    await putGitHubSecret(name, encrypted, key_id);
    ok(name);
    pushed++;
  }
  log(`${pushed} pushed, ${skipped} skipped`);
}

// ── Vercel environment variables ──────────────────────────────────────────────

interface VercelEnvVar {
  id?: string;
  key: string;
  value: string;
  type: "encrypted";
  target: ("production" | "preview" | "development")[];
}

async function listVercelEnv(): Promise<VercelEnvVar[]> {
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${VERCEL_PROJECT}/env?teamId=${VERCEL_TEAM}`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
  );
  if (!res.ok) throw new Error(`Vercel list env failed: ${res.status} ${await res.text()}`);
  const json = await res.json() as { envs: VercelEnvVar[] };
  return json.envs ?? [];
}

async function upsertVercelEnv(
  existing: VercelEnvVar[],
  key: string,
  value: string
): Promise<void> {
  const current = existing.find((e) => e.key === key);

  if (current?.id) {
    // Update
    const res = await fetch(
      `https://api.vercel.com/v9/projects/${VERCEL_PROJECT}/env/${current.id}?teamId=${VERCEL_TEAM}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ value, type: "encrypted", target: ["production", "preview"] }),
      }
    );
    if (!res.ok) throw new Error(`Vercel PATCH ${key} failed: ${res.status} ${await res.text()}`);
  } else {
    // Create
    const res = await fetch(
      `https://api.vercel.com/v10/projects/${VERCEL_PROJECT}/env?teamId=${VERCEL_TEAM}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, type: "encrypted", target: ["production", "preview"] }),
      }
    );
    if (!res.ok) throw new Error(`Vercel POST ${key} failed: ${res.status} ${await res.text()}`);
  }
}

async function pushVercelEnv(env: Map<string, string>): Promise<void> {
  if (!VERCEL_TOKEN) {
    warn("VERCEL_TOKEN not set — skipping Vercel env vars");
    return;
  }

  process.stdout.write("\nVercel environment variables\n");
  const existing = await listVercelEnv();

  let pushed = 0;
  let skipped = 0;
  for (const name of SYNC_VARS) {
    if (GITHUB_ONLY.has(name)) continue;
    const value = env.get(name);
    if (!value) { warn(`${name} not in .env.local — skipped`); skipped++; continue; }
    await upsertVercelEnv(existing, name, value);
    ok(name);
    pushed++;
  }
  log(`${pushed} pushed, ${skipped} skipped`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  process.stdout.write("\nSentraisOS — Push environment secrets\n");
  process.stdout.write("──────────────────────────────────────\n");

  if (!existsSync(ENV_PATH)) {
    process.stderr.write("\n✗ .env.local not found. Run npm run setup:integrations first.\n");
    process.exit(1);
  }

  const env = readEnvLocal();
  log(`Loaded ${env.size} variables from .env.local`);

  await pushGitHubSecrets(env);
  await pushVercelEnv(env);

  process.stdout.write("\nDone.\n\n");
}

main().catch((err) => {
  process.stderr.write(`\nFatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});

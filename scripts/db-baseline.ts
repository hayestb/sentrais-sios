#!/usr/bin/env npx tsx
/**
 * Baselines the drizzle migrations table when db:push was used to create
 * the initial schema. Run this once before switching to db:migrate.
 *
 * What it does:
 *   1. Checks if __drizzle_migrations table exists
 *   2. If app tables exist but tracking table doesn't, creates it and
 *      marks all existing migration files as already applied
 *   3. If tracking table already exists, exits with no changes
 *
 * Usage:
 *   npm run db:baseline
 */

import postgres from "postgres";
import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve } from "path";

try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of envFile.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0 && !process.env[line.slice(0, idx).trim()]) {
      process.env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
} catch {}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  process.stderr.write("DATABASE_URL not set\n");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function baseline() {
  const [trackingExists] = await sql`
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = '__drizzle_migrations'
  `;

  if (trackingExists) {
    process.stdout.write("__drizzle_migrations already exists — no baseline needed\n");
    await sql.end();
    return;
  }

  const [tablesExist] = await sql`
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'profiles'
  `;

  if (!tablesExist) {
    process.stdout.write("No existing tables — skipping baseline, db:migrate will create them\n");
    await sql.end();
    return;
  }

  process.stdout.write("Existing schema detected (db:push was used). Baselining migrations...\n");

  await sql`
    CREATE TABLE "__drizzle_migrations" (
      id serial PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `;

  const migrationsDir = resolve(process.cwd(), "drizzle");
  const journalPath = resolve(migrationsDir, "meta/_journal.json");

  if (!existsSync(journalPath)) {
    process.stderr.write("drizzle/meta/_journal.json not found — run npm run db:generate first\n");
    await sql.end();
    process.exit(1);
  }

  const journal = JSON.parse(readFileSync(journalPath, "utf-8")) as {
    entries: { tag: string; when: number }[];
  };

  for (const entry of journal.entries) {
    await sql`
      INSERT INTO "__drizzle_migrations" (hash, created_at)
      VALUES (${entry.tag}, ${entry.when})
    `;
    process.stdout.write(`  ✓ Marked ${entry.tag} as applied\n`);
  }

  process.stdout.write("Baseline complete. Future schema changes should use db:generate + db:migrate.\n");
  await sql.end();
}

baseline().catch((e) => {
  process.stderr.write(`Baseline failed: ${e instanceof Error ? e.message : String(e)}\n`);
  process.exit(1);
});

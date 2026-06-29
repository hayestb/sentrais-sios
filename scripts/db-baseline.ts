#!/usr/bin/env npx tsx
import postgres from "postgres";
import crypto from "crypto";
import { readFileSync, existsSync } from "fs";
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

// Prefer the direct (unpooled) connection — PgBouncer blocks the DDL/baseline work
const rawUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!rawUrl) {
  process.stderr.write("DATABASE_URL not set\n");
  process.exit(1);
}
// postgres-js does not support the channel_binding parameter — strip it
const DATABASE_URL = rawUrl.replace(/[&?]channel_binding=[^&]*/g, "");

const sql = postgres(DATABASE_URL);

function computeHash(migrationsDir: string, tag: string): string {
  const sqlContent = readFileSync(resolve(migrationsDir, `${tag}.sql`), "utf-8");
  return crypto.createHash("sha256").update(sqlContent).digest("hex");
}

async function baseline() {
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

  const migrations = journal.entries.map((entry) => ({
    tag: entry.tag,
    when: entry.when,
    hash: computeHash(migrationsDir, entry.tag),
  }));

  const [tablesExist] = await sql`
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles'
  `;

  if (!tablesExist) {
    process.stdout.write("No existing tables — skipping baseline, db:migrate will create them\n");
    await sql.end();
    return;
  }

  await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
  await sql`
    CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
      id serial PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `;

  const [lastEntry] = await sql<{ created_at: string }[]>`
    SELECT created_at FROM "drizzle"."__drizzle_migrations"
    ORDER BY created_at DESC LIMIT 1
  `;

  const maxFolderMillis = Math.max(...migrations.map((m) => m.when));
  if (lastEntry && Number(lastEntry.created_at) >= maxFolderMillis) {
    process.stdout.write("Already baselined — no action needed\n");
    await sql.end();
    return;
  }

  process.stdout.write("Baselining drizzle.__drizzle_migrations...\n");
  const lastCreatedAt = lastEntry ? Number(lastEntry.created_at) : 0;
  for (const m of migrations) {
    if (m.when > lastCreatedAt) {
      await sql`INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES (${m.hash}, ${m.when})`;
      process.stdout.write(`  OK ${m.tag}\n`);
    }
  }

  process.stdout.write("Baseline complete.\n");
  await sql.end();
}

baseline().catch((e) => {
  process.stderr.write(`Baseline failed: ${e instanceof Error ? e.message : String(e)}\n`);
  process.exit(1);
});

#!/usr/bin/env npx tsx
/**
 * Idempotently ensures the `sipe_entries` table exists (plus its indexes and,
 * where the referenced tables exist, its foreign keys).
 *
 * Why this exists: production was built from an old `db:push` snapshot that
 * predates `sipe_entries`, and the 0000 migration is not cleanly re-runnable
 * (unguarded ADD CONSTRAINT / CREATE INDEX). This script creates only what's
 * missing, so it's safe to run against that partially-migrated database.
 *
 * Requires a DATABASE_URL_UNPOOLED / DATABASE_URL whose role can CREATE in
 * schema "public" (the Neon owner role, e.g. neondb_owner).
 *
 * Run with: npm run db:ensure-sipe
 */

import postgres from "postgres";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local if present (mirrors the other db scripts)
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

// Neon requires TLS; postgres-js only enables it when told to (matches src/lib/db/client.ts)
const sql = postgres(DATABASE_URL, {
  max: 1,
  ssl: DATABASE_URL.includes("neon.tech") ? "require" : undefined,
});

async function ensure() {
  await sql.begin(async (q) => {
    await q`CREATE TABLE IF NOT EXISTS "sipe_entries" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "engagement_id" uuid,
      "sprint_id" uuid,
      "category" text NOT NULL,
      "content" text NOT NULL,
      "tags" jsonb DEFAULT '[]'::jsonb,
      "vertical" text,
      "applicable_phases" jsonb DEFAULT '[]'::jsonb,
      "confidence_score" real,
      "nin_tag" text,
      "playbook_id" text,
      "created_at" timestamp DEFAULT now() NOT NULL
    )`;

    await q`CREATE INDEX IF NOT EXISTS "sipe_category_idx" ON "sipe_entries" USING btree ("category")`;
    await q`CREATE INDEX IF NOT EXISTS "sipe_vertical_idx" ON "sipe_entries" USING btree ("vertical")`;

    // Foreign keys — only when the referenced table exists and the constraint is absent
    await q`DO $$ BEGIN
      IF to_regclass('public.engagements') IS NOT NULL
         AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sipe_entries_engagement_id_engagements_id_fk') THEN
        ALTER TABLE "sipe_entries" ADD CONSTRAINT "sipe_entries_engagement_id_engagements_id_fk"
          FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;
      END IF;
    END $$`;
    await q`DO $$ BEGIN
      IF to_regclass('public.sprint_cycles') IS NOT NULL
         AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sipe_entries_sprint_id_sprint_cycles_id_fk') THEN
        ALTER TABLE "sipe_entries" ADD CONSTRAINT "sipe_entries_sprint_id_sprint_cycles_id_fk"
          FOREIGN KEY ("sprint_id") REFERENCES "public"."sprint_cycles"("id") ON DELETE no action ON UPDATE no action;
      END IF;
    END $$`;
  });

  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sipe_entries' ORDER BY column_name
  `;
  const fks = await sql`
    SELECT conname FROM pg_constraint WHERE conname LIKE 'sipe_entries_%_fk' ORDER BY conname
  `;
  process.stdout.write(`sipe_entries ready — ${cols.length} columns, ${fks.length} foreign key(s).\n`);
}

ensure()
  .then(() => sql.end())
  .catch(async (e) => {
    const detail = e instanceof Error ? e.stack || e.message || e.name : String(e);
    const code = e && typeof e === "object" && "code" in e ? ` (code: ${(e as { code?: unknown }).code})` : "";
    process.stderr.write(`ensure-sipe failed${code}: ${detail}\n`);
    await sql.end();
    process.exit(1);
  });

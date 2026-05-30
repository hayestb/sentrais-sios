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

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  process.stderr.write("DATABASE_URL not set\n");
  process.exit(1);
}

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

  // If there are no app tables the DB is fresh — let db:migrate create everything
  const [tablesExist] = await sql`
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles'
  `;
  if (!tablesExist) {
    process.stdout.write("No existing tables — skipping baseline, db:migrate will create them\n");
    await sql.end();
    return;
  }

  // drizzle-orm stores its tracking table in the 'drizzle' schema, not 'public'.
  // Ensure the schema and table exist so we can inspect / populate them.
  await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
  await sql`
    CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
      id serial PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `;

  // drizzle-orm's migrate() skips a migration when the last row's created_at
  // is >= the migration's folderMillis. One correctly-dated row is enough.
  const [lastEntry] = await sql<{ created_at: string }[]>`
    SELECT created_at FROM "drizzle"."__drizzle_migrations"
    ORDER BY created_at DESC LIMIT 1
  `;

  const maxFolderMillis = Math.max(...migrations.map((m) => m.when));

  if (lastEntry && Number(lastEntry.created_at) >= maxFolderMillis) {
    process.stdout.write("drizzle.__drizzle_migrations already covers all migrations — no baseline needed\n");
    await sql.end();
    return;
  }

  process.stdout.write("Existing schema detected (db:push was used). Baselining migrations...\n");

  const lastCreatedAt = lastEntry ? Number(lastEntry.created_at) : 0;
  for (const m of migrations) {
    if (m.when > lastCreatedAt) {
      await sql`INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES (${m.hash}, ${m.when})`;
      process.stdout.write(`  ✓ ${m.tag} (${m.hash.slice(0, 8)}...)\n`);
    }
  }

  process.stdout.write("Baseline complete. Future schema changes should use db:generate + db:migrate.\n");
  await sql.end();
}

baseline().catch((e) => {
  process.stderr.write(`Baseline failed: ${e instanceof Error ? e.message : String(e)}\n`);
  process.exit(1);
});
The key changes vs what's currently on GitHub:

Checks drizzle.__drizzle_migrations instead of public.__drizzle_migrations
Creates drizzle schema if missing (CREATE SCHEMA IF NOT EXISTS drizzle)
Uses timestamp comparison (created_at >= folderMillis) matching drizzle-orm's actual logic — not hash comparison
Commit it to claude/loving-bell-nAkqb and merge to main. The migration job should pass this time.


Ran a command, used 2 tools
The GitHub integration in this session has read-only access — all write attempts return 403. The local commit a4501c8 can't be pushed from here.

The change is a single-file edit. In the GitHub editor, go to scripts/db-baseline.ts on claude/loving-bell-nAkqb and make these three changes:

1. Change the tracking-table check (currently checks public, needs drizzle):

- const [trackingExists] = await sql`
-   SELECT 1 FROM pg_tables
-   WHERE schemaname = 'public' AND tablename = '__drizzle_migrations'
- `;
+ // If there are no app tables the DB is fresh — let db:migrate create everything
+ const [tablesExist] = await sql`
+   SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles'
+ `;
+ if (!tablesExist) {
+   process.stdout.write("No existing tables — skipping baseline, db:migrate will create them\n");
+   await sql.end();
+   return;
+ }
+
+ await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
+ await sql`
+   CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
+     id serial PRIMARY KEY,
+     hash text NOT NULL,
+     created_at bigint
+   )
+ `;
+
+ const [lastEntry] = await sql<{ created_at: string }[]>`
+   SELECT created_at FROM "drizzle"."__drizzle_migrations"
+   ORDER BY created_at DESC LIMIT 1
+ `;
+
+ const maxFolderMillis = Math.max(...migrations.map((m) => m.when));
+
+ if (lastEntry && Number(lastEntry.created_at) >= maxFolderMillis) {
+   process.stdout.write("drizzle.__drizzle_migrations already covers all migrations — no baseline needed\n");
+   await sql.end();
+   return;
+ }

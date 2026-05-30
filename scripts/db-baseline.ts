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

  const [trackingExists] = await sql`
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = '__drizzle_migrations'
  `;

  if (trackingExists) {
    const existing = await sql<{ hash: string }[]>`SELECT hash FROM "__drizzle_migrations"`;
    const sha256Re = /^[0-9a-f]{64}$/;
    const hasWrongHashes = existing.some((row) => !sha256Re.test(row.hash));

    if (!hasWrongHashes) {
      process.stdout.write("__drizzle_migrations exists with correct hashes — no baseline needed\n");
      await sql.end();
      return;
    }

    process.stdout.write("Correcting migration hashes from tag names to SHA256...\n");
    await sql`DELETE FROM "__drizzle_migrations"`;
    for (const m of migrations) {
      await sql`INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES (${m.hash}, ${m.when})`;
      process.stdout.write(`  ✓ ${m.tag} → ${m.hash.slice(0, 8)}...\n`);
    }
    process.stdout.write("Hash correction complete.\n");
    await sql.end();
    return;
  }

  const [tablesExist] = await sql`
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles'
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

  for (const m of migrations) {
    await sql`INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES (${m.hash}, ${m.when})`;
    process.stdout.write(`  ✓ Marked ${m.tag} as applied (${m.hash.slice(0, 8)}...)\n`);
  }

  process.stdout.write("Baseline complete. Future schema changes should use db:generate + db:migrate.\n");
  await sql.end();
}

baseline().catch((e) => {
  process.stderr.write(`Baseline failed: ${e instanceof Error ? e.message : String(e)}\n`);
  process.exit(1);
});

#!/usr/bin/env npx tsx
/**
 * Runs database migrations using drizzle-orm's programmatic migrator.
 * Unlike drizzle-kit CLI, this properly checks __drizzle_migrations and
 * skips already-applied migrations.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
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

// Prefer the direct (unpooled) connection for migrations — PgBouncer blocks DDL
const rawUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!rawUrl) {
const DATABASE_URL = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  process.stderr.write("DATABASE_URL not set\n");
  process.exit(1);
}
// postgres-js does not support the channel_binding parameter — strip it
const DATABASE_URL = rawUrl.replace(/[&?]channel_binding=[^&]*/g, "");

const migrationsFolder = resolve(process.cwd(), "drizzle");
if (!existsSync(migrationsFolder)) {
  process.stderr.write("drizzle/ folder not found — run npm run db:generate first\n");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(sql);

migrate(db, { migrationsFolder })
  .then(() => {
    process.stdout.write("Migrations complete\n");
    return sql.end();
  })
  .catch(async (e) => {
    process.stderr.write(`Migration failed: ${e instanceof Error ? e.message : String(e)}\n`);
    await sql.end();
    process.exit(1);
  });

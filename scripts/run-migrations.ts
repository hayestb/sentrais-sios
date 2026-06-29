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

// Neon requires TLS; postgres-js only enables it when told to (matches src/lib/db/client.ts)
const sql = postgres(DATABASE_URL, {
  max: 1,
  ssl: DATABASE_URL.includes("neon.tech") ? "require" : undefined,
});
const db = drizzle(sql);

migrate(db, { migrationsFolder })
  .then(() => {
    process.stdout.write("Migrations complete\n");
    return sql.end();
  })
  .catch(async (e) => {
    const detail = e instanceof Error ? e.stack || e.message || e.name : String(e);
    const code = e && typeof e === "object" && "code" in e ? ` (code: ${(e as { code?: unknown }).code})` : "";
    process.stderr.write(`Migration failed${code}: ${detail}\n`);
    await sql.end();
    process.exit(1);
  });

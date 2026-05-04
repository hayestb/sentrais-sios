import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  // On Vercel serverless, each invocation gets 1 connection from Neon's PgBouncer pooler.
  // Use DATABASE_URL pointing to the -pooler.neon.tech hostname for app traffic.
  // Use DATABASE_URL_UNPOOLED (direct) only for migrations (drizzle.config.ts).
  const isServerless = process.env.VERCEL ?? process.env.AWS_LAMBDA_FUNCTION_NAME;
  const client = postgres(connectionString, {
    max: isServerless ? 1 : 10,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: connectionString.includes("neon.tech") ? "require" : undefined,
  });
  return drizzle(client, { schema, logger: process.env.NODE_ENV === "development" });
}

// Lazy singleton — only initializes when first accessed at runtime
let _db: ReturnType<typeof createClient> | undefined;

export const db = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    if (!_db) _db = createClient();
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export type DB = ReturnType<typeof createClient>;

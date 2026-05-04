import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
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

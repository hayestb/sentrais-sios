import { defineConfig } from "drizzle-kit";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local for drizzle-kit (which doesn't use Next.js env loading)
try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of envFile.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
} catch {}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});

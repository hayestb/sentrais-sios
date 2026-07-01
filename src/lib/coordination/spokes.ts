import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db/client";
import { spokeRegistry } from "@/lib/db/schema";
import type { SpokeRegistryEntry } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Sentrais 360 OS — service-to-service auth for spoke → hub calls.
// Each spoke holds a plaintext API key; the hub stores only its SHA-256 hash.

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/** Generate a new spoke service key. Returns the plaintext (shown once) and its hash. */
export function generateApiKey(): { key: string; hash: string } {
  const key = `spk_${randomBytes(24).toString("base64url")}`;
  return { key, hash: hashApiKey(key) };
}

/** Resolve + authenticate a spoke from an `Authorization: Bearer <key>` header. */
export async function authenticateSpoke(
  authHeader: string | null
): Promise<SpokeRegistryEntry | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const key = authHeader.slice("Bearer ".length).trim();
  if (!key) return null;

  const [spoke] = await db
    .select()
    .from(spokeRegistry)
    .where(eq(spokeRegistry.apiKeyHash, hashApiKey(key)))
    .limit(1);

  if (!spoke || spoke.status !== "active") return null;
  return spoke;
}

/** Mark a spoke as having just published an event (for health/last-seen). */
export async function touchSpoke(id: string): Promise<void> {
  await db.update(spokeRegistry).set({ lastEventAt: new Date() }).where(eq(spokeRegistry.id, id));
}

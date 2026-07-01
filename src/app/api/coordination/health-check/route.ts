import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { spokeRegistry } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentRole } from "@/lib/auth/current-user";

export const runtime = "nodejs";
export const maxDuration = 60;

// Sentrais 360 OS — spoke health poller.
// Runs on a Vercel cron (auth: CRON_SECRET) or manually by a sysadmin.
// Pings each active spoke's healthUrl and records healthy | degraded | down.

async function authorize(req: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth === `Bearer ${secret}`) return true; // Vercel cron
  return (await getCurrentRole()) === "sysadmin"; // manual trigger
}

async function ping(url: string): Promise<"healthy" | "degraded" | "down"> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { method: "GET", signal: controller.signal, redirect: "manual" });
    return res.status < 400 || res.status === 401 || res.status === 403 ? "healthy" : "degraded";
  } catch {
    return "down";
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest) {
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const spokes = await db
    .select({ id: spokeRegistry.id, slug: spokeRegistry.slug, healthUrl: spokeRegistry.healthUrl })
    .from(spokeRegistry)
    .where(eq(spokeRegistry.status, "active"));

  const now = new Date();
  const results = await Promise.all(
    spokes.map(async (s) => {
      // No health URL configured → can't determine; leave as unknown.
      const health = s.healthUrl ? await ping(s.healthUrl) : "unknown";
      await db
        .update(spokeRegistry)
        .set({ healthStatus: health, lastHealthAt: now })
        .where(eq(spokeRegistry.id, s.id));
      return { slug: s.slug, health };
    })
  );

  const summary = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.health] = (acc[r.health] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({ checked: results.length, summary, results, at: now.toISOString() });
}

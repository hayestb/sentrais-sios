import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { spokeRegistry } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { getCurrentRole } from "@/lib/auth/current-user";
import { generateApiKey } from "@/lib/coordination/spokes";

export const runtime = "nodejs";

// Sentrais 360 OS — spoke registry (sysadmin only).
// GET: list connected spokes (secrets never returned).
// POST: register a spoke and mint its one-time service API key.

async function requireSysadmin() {
  const role = await getCurrentRole();
  return role === "sysadmin";
}

export async function GET() {
  if (!(await requireSysadmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const rows = await db
    .select({
      id: spokeRegistry.id,
      name: spokeRegistry.name,
      slug: spokeRegistry.slug,
      baseUrl: spokeRegistry.baseUrl,
      healthUrl: spokeRegistry.healthUrl,
      vertical: spokeRegistry.vertical,
      stack: spokeRegistry.stack,
      oidcClientId: spokeRegistry.oidcClientId,
      status: spokeRegistry.status,
      lastEventAt: spokeRegistry.lastEventAt,
      lastHealthAt: spokeRegistry.lastHealthAt,
      createdAt: spokeRegistry.createdAt,
    })
    .from(spokeRegistry)
    .orderBy(desc(spokeRegistry.createdAt));
  return NextResponse.json({ spokes: rows, total: rows.length });
}

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase kebab-case"),
  baseUrl: z.string().url().optional(),
  healthUrl: z.string().url().optional(),
  vertical: z.string().max(60).optional(),
  stack: z.string().max(60).optional(),
  oidcClientId: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  if (!(await requireSysadmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { key, hash } = generateApiKey();
  const [spoke] = await db
    .insert(spokeRegistry)
    .values({ ...parsed.data, apiKeyHash: hash })
    .returning({
      id: spokeRegistry.id,
      name: spokeRegistry.name,
      slug: spokeRegistry.slug,
      status: spokeRegistry.status,
      createdAt: spokeRegistry.createdAt,
    });

  // apiKey is shown ONCE here and never retrievable again (only its hash is stored).
  return NextResponse.json({ spoke, apiKey: key }, { status: 201 });
}

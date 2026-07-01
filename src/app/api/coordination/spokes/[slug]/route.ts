import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { spokeRegistry, evidenceEntries } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentRole } from "@/lib/auth/current-user";

export const runtime = "nodejs";

async function requireSysadmin() {
  return (await getCurrentRole()) === "sysadmin";
}

// GET /api/coordination/spokes/[slug] — spoke detail + its recent ledger events.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await requireSysadmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { slug } = await params;

  const [spoke] = await db.select().from(spokeRegistry).where(eq(spokeRegistry.slug, slug)).limit(1);
  if (!spoke) return NextResponse.json({ error: "Spoke not found" }, { status: 404 });

  // events this spoke published (writeToLedger sets author_human = `spoke:<slug>`)
  const events = await db
    .select({
      id: evidenceEntries.id,
      subject: evidenceEntries.subject,
      payload: evidenceEntries.payload,
      sha256Hash: evidenceEntries.sha256Hash,
      createdAt: evidenceEntries.createdAt,
    })
    .from(evidenceEntries)
    .where(eq(evidenceEntries.authorHuman, `spoke:${slug}`))
    .orderBy(desc(evidenceEntries.createdAt))
    .limit(25);

  // never expose the key hash
  const { apiKeyHash: _omit, ...safe } = spoke;
  void _omit;
  return NextResponse.json({ spoke: safe, events });
}

const patchSchema = z.object({
  status: z.enum(["active", "paused", "inactive"]).optional(),
  baseUrl: z.string().url().nullable().optional(),
  healthUrl: z.string().url().nullable().optional(),
  vertical: z.string().max(60).nullable().optional(),
  stack: z.string().max(60).nullable().optional(),
  oidcClientId: z.string().max(200).nullable().optional(),
});

// PATCH /api/coordination/spokes/[slug] — edit spoke config (sysadmin).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await requireSysadmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { slug } = await params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(spokeRegistry)
    .set(parsed.data)
    .where(eq(spokeRegistry.slug, slug))
    .returning({
      id: spokeRegistry.id,
      slug: spokeRegistry.slug,
      status: spokeRegistry.status,
      oidcClientId: spokeRegistry.oidcClientId,
      baseUrl: spokeRegistry.baseUrl,
      healthUrl: spokeRegistry.healthUrl,
      vertical: spokeRegistry.vertical,
      stack: spokeRegistry.stack,
    });

  if (!updated) return NextResponse.json({ error: "Spoke not found" }, { status: 404 });
  return NextResponse.json({ spoke: updated });
}

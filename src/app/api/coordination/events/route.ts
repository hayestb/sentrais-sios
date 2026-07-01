import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateSpoke, touchSpoke } from "@/lib/coordination/spokes";
import { writeToLedger } from "@/lib/ledger/evidence";

export const runtime = "nodejs";

// Sentrais 360 OS — Coordination API.
// Spokes (evergame, atl-360, nfl-ims, sentrais-forge, …) publish events here;
// each is recorded in the hub's Evidence Ledger. Auth: per-spoke service key.

const bodySchema = z.object({
  subject: z.string().min(1).max(300),
  payload: z.record(z.unknown()).optional(),
  engagementId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  const spoke = await authenticateSpoke(req.headers.get("authorization"));
  if (!spoke) {
    return NextResponse.json({ error: "Unauthorized spoke" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const entry = await writeToLedger({
    engagementId: parsed.data.engagementId,
    entryType: "spoke_event",
    subject: `[${spoke.slug}] ${parsed.data.subject}`,
    payload: {
      ...(parsed.data.payload ?? {}),
      _spoke: { slug: spoke.slug, name: spoke.name },
    },
    authorHuman: `spoke:${spoke.slug}`,
  });

  await touchSpoke(spoke.id);

  return NextResponse.json(
    { ok: true, id: entry.id, sha256: entry.sha256Hash, chainHash: entry.chainHash },
    { status: 201 }
  );
}

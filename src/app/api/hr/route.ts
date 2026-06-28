import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { workforceClassifications } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/current-user";

const ADMIN_ROLES = ["sysadmin", "admin"] as const;
type AdminRole = (typeof ADMIN_ROLES)[number];

function isAdmin(role: string): role is AdminRole {
  return ADMIN_ROLES.includes(role as AdminRole);
}

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (profile.role !== "sysadmin" && profile.role !== "admin") {
    return NextResponse.json({ error: "Restricted to admins." }, { status: 403 });
  }

  const workers = await db
    .select()
    .from(workforceClassifications)
    .orderBy(asc(workforceClassifications.tier), asc(workforceClassifications.fullName));

  // Strip comp for non-sysadmin
  const sanitized = workers.map((w) => ({
    ...w,
    annualComp: profile.role === "sysadmin" ? w.annualComp : null,
  }));

  return NextResponse.json({ workers: sanitized });
}

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isAdmin(profile.role)) {
    return NextResponse.json({ error: "Restricted to admins." }, { status: 403 });
  }

  const body = await request.json() as {
    fullName: string;
    entity: string;
    classification: "W2" | "1099" | "intern" | "fellow" | "vacant";
    tier: number;
    title: string;
    benefitsTier?: string;
    annualComp?: number;
    notes?: string;
    justworksId?: string;
    gustoId?: string;
    adpId?: string;
    profileId?: string;
  };

  const { fullName, entity, classification, tier, title } = body;
  if (!fullName || !entity || !classification || tier === undefined || !title) {
    return NextResponse.json({ error: "fullName, entity, classification, tier, and title are required." }, { status: 400 });
  }

  const [worker] = await db
    .insert(workforceClassifications)
    .values({
      fullName,
      entity,
      classification,
      tier,
      title,
      benefitsTier: body.benefitsTier ?? null,
      annualComp: body.annualComp ?? null,
      notes: body.notes ?? null,
      justworksId: body.justworksId ?? null,
      gustoId: body.gustoId ?? null,
      adpId: body.adpId ?? null,
      profileId: body.profileId ?? null,
    })
    .returning();

  return NextResponse.json({ worker }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isAdmin(profile.role)) {
    return NextResponse.json({ error: "Restricted to admins." }, { status: 403 });
  }

  const body = await request.json() as {
    id: string;
    isActive?: boolean;
    complianceFreeze?: boolean;
    tier?: number;
    title?: string;
    benefitsTier?: string;
    annualComp?: number;
    notes?: string;
    endDate?: string;
  };

  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: Partial<typeof workforceClassifications.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (body.isActive !== undefined) updates.isActive = body.isActive;
  if (body.complianceFreeze !== undefined) updates.complianceFreeze = body.complianceFreeze;
  if (body.tier !== undefined) updates.tier = body.tier;
  if (body.title !== undefined) updates.title = body.title;
  if (body.benefitsTier !== undefined) updates.benefitsTier = body.benefitsTier;
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.endDate !== undefined) updates.endDate = new Date(body.endDate);

  // Only sysadmin can update comp
  if (body.annualComp !== undefined && profile.role === "sysadmin") {
    updates.annualComp = body.annualComp;
  }

  const [updated] = await db
    .update(workforceClassifications)
    .set(updates)
    .where(and(eq(workforceClassifications.id, body.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Worker not found." }, { status: 404 });

  return NextResponse.json({ worker: updated });
}

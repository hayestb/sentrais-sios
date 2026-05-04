import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/lib/db/client";
import { profiles, auditLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { UserRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

interface ClerkUserPayload {
  id: string;
  email_addresses: { email_address: string; id: string }[];
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  public_metadata: { role?: string };
}

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "Missing CLERK_WEBHOOK_SECRET" }, { status: 500 });
    }

    const headerPayload = await headers();
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

    const body = await req.text();
    const wh = new Webhook(webhookSecret);

    let evt: { type: string; data: ClerkUserPayload };
    try {
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as typeof evt;
    } catch (verifyErr) {
      const msg = verifyErr instanceof Error ? verifyErr.message : String(verifyErr);
      return NextResponse.json({ error: "Invalid signature", detail: msg }, { status: 400 });
    }

    const { type, data } = evt;

    if (type === "user.created" || type === "user.updated") {
      const email = data.email_addresses[0]?.email_address ?? "";
      const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ") || email;
      const role = (data.public_metadata?.role as UserRole) ?? "analyst";
      const avatarUrl = data.image_url ?? null;

      await db
        .insert(profiles)
        .values({ clerkId: data.id, email, fullName, role, avatarUrl })
        .onConflictDoUpdate({
          target: profiles.clerkId,
          set: { email, fullName, role, avatarUrl, updatedAt: new Date() },
        });

      await db.insert(auditLog).values({
        actorClerkId: data.id,
        action: type,
        targetType: "profile",
        targetId: data.id,
        payload: { email, role },
      });
    }

    if (type === "user.deleted") {
      await db
        .update(profiles)
        .set({ active: false, updatedAt: new Date() })
        .where(eq(profiles.clerkId, data.id));

      await db.insert(auditLog).values({
        actorClerkId: data.id,
        action: "user.deleted",
        targetType: "profile",
        targetId: data.id,
        payload: {},
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    console.error("[webhook] unhandled error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

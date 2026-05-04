import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Profile } from "@/lib/db/schema";
import type { UserRole } from "./roles";

export async function getCurrentProfile(): Promise<Profile | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.clerkId, userId))
    .limit(1);

  return profile ?? null;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Unauthorized: no profile found");
  return profile;
}

export async function getCurrentRole(): Promise<UserRole | null> {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  return (role as UserRole) ?? null;
}

export async function upsertProfileFromClerk(): Promise<Profile> {
  const user = await currentUser();
  if (!user) throw new Error("No Clerk user");

  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || email;
  const role = ((user.publicMetadata as { role?: string })?.role as UserRole) ?? "analyst";

  const existing = await db
    .select()
    .from(profiles)
    .where(eq(profiles.clerkId, user.id))
    .limit(1);

  if (existing[0]) {
    const [updated] = await db
      .update(profiles)
      .set({ email, fullName, role, avatarUrl: user.imageUrl, lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(profiles.clerkId, user.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(profiles)
    .values({ clerkId: user.id, email, fullName, role, avatarUrl: user.imageUrl })
    .onConflictDoUpdate({
      target: profiles.email,
      set: { clerkId: user.id, fullName, role, avatarUrl: user.imageUrl, updatedAt: new Date() },
    })
    .returning();

  return created;
}

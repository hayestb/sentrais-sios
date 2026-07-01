import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { canAccess, roleHome } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/auth/roles";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/(.*)",
  // Spoke → hub event ingest: authenticated by a per-spoke service key, not Clerk.
  "/api/coordination/events(.*)",
  // Health-check cron: authenticated by CRON_SECRET (Vercel cron), not Clerk.
  "/api/coordination/health-check(.*)",
  "/client/(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes without auth
  if (isPublicRoute(req)) return NextResponse.next();

  // Require auth for everything else
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const role = ((sessionClaims?.metadata as { role?: string } | undefined)?.role as UserRole) ?? "analyst";

  // Block non-sysadmin from /admin routes
  if (isAdminRoute(req) && role !== "sysadmin") {
    return NextResponse.redirect(new URL(roleHome(role), req.url));
  }

  // Check persona-based route access
  if (!pathname.startsWith("/admin") && !canAccess(role, pathname)) {
    return NextResponse.redirect(new URL(roleHome(role), req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

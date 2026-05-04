import { Sidebar } from "@/components/layout/sidebar";
import { CommandSearch } from "@/components/layout/command-search";
import { getCurrentRole } from "@/lib/auth/current-user";
import { currentUser } from "@clerk/nextjs/server";
import type { UserRole } from "@/lib/auth/roles";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [role, user] = await Promise.all([getCurrentRole(), currentUser()]);
  const resolvedRole: UserRole = role ?? "analyst";

  const userName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.emailAddresses[0]?.emailAddress
    : undefined;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={resolvedRole} userName={userName} userImageUrl={user?.imageUrl} />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <CommandSearch />
    </div>
  );
}

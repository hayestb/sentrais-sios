import { Sidebar } from "@/components/layout/sidebar";
import { CommandSearch } from "@/components/layout/command-search";
import { getCurrentRole } from "@/lib/auth/current-user";
import type { UserRole } from "@/lib/auth/roles";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role: UserRole = (await getCurrentRole()) ?? "analyst";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <CommandSearch />
    </div>
  );
}

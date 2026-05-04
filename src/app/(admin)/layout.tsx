import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentRole } from "@/lib/auth/current-user";
import {
  Users, Briefcase, BarChart3, Shield, Settings, Activity, Home,
} from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: Activity, exact: true },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/engagements", label: "Assignments", icon: Briefcase },
  { href: "/admin/ai-gateway", label: "AI Cost Monitor", icon: BarChart3 },
  { href: "/admin/audit-log", label: "Audit Log", icon: Shield },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const role = await getCurrentRole();
  if (role !== "sysadmin") redirect("/command-center");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Admin sidebar */}
      <aside className="w-56 flex-shrink-0 bg-card border-r border-border flex flex-col h-screen sticky top-0">
        <div className="px-4 py-3.5 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-red-500/80 flex items-center justify-center shrink-0">
              <Shield size={12} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Admin Panel</div>
              <div className="text-[9px] text-red-400 leading-none">Sysadmin Access</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
          {ADMIN_NAV.map(({ href, label, icon: Icon, exact }) => (
            <AdminNavLink key={href} href={href} label={label} Icon={Icon} exact={exact} />
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-border">
          <Link href="/command-center"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home size={12} /> Back to Platform
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

// Client component for active state — inline to avoid extra file
function AdminNavLink({ href, label, Icon, exact }: { href: string; label: string; Icon: React.ElementType; exact?: boolean }) {
  // Server-side we can't use usePathname, so render as a plain link and rely on CSS
  return (
    <Link href={href}
      className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors group"
    >
      <Icon size={13} className="shrink-0 text-muted-foreground group-hover:text-foreground" />
      <span className="text-xs">{label}</span>
    </Link>
  );
}

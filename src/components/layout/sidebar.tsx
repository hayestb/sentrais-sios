"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/auth/roles";
import {
  LayoutDashboard, GitBranch, Bot, FileText, Calendar, Briefcase,
  Shield, BarChart3, Brain, ChevronRight, Users, Home, DollarSign,
  Sparkles, UserCheck, AlertCircle, Package, Wallet, Activity,
  TrendingUp, FlaskConical, PieChart, MessageSquare, Bell, Settings,
  Layers, CandlestickChart,
} from "lucide-react";

interface NavItem { href: string; label: string; icon: React.ElementType; color?: string; }

const PERSONAS: (NavItem & { color: string })[] = [
  { href: "/executive", label: "Executive", icon: BarChart3, color: "text-[#0EA5E9]" },
  { href: "/command-center", label: "Operations", icon: LayoutDashboard, color: "text-green-400" },
  { href: "/advisory", label: "Advisory", icon: Brain, color: "text-purple-400" },
  { href: "/governance", label: "Governance & QA", icon: Shield, color: "text-amber-400" },
];

const DELIVERY_NAV: NavItem[] = [
  { href: "/engagements", label: "Engagements", icon: Briefcase },
  { href: "/gates", label: "Golden Path", icon: GitBranch },
  { href: "/sprint", label: "Sprint Calendar", icon: Calendar },
  { href: "/raci", label: "RACI Matrix", icon: UserCheck },
  { href: "/pmo", label: "PMO Dashboard", icon: Activity },
  { href: "/kpi", label: "KPI Framework", icon: TrendingUp },
  { href: "/remediation", label: "Remediation Board", icon: AlertCircle },
];

const INTELLIGENCE_NAV: NavItem[] = [
  { href: "/sipe", label: "SIPE Intelligence", icon: Sparkles },
  { href: "/agents", label: "FORGE Agents", icon: Bot },
  { href: "/chat", label: "Agent Chat", icon: MessageSquare },
  { href: "/lab", label: "Lab Environment", icon: FlaskConical },
];

const COMMERCIAL_NAV: NavItem[] = [
  { href: "/crm", label: "CRM Pipeline", icon: PieChart },
  { href: "/financial-os", label: "Financial OS", icon: Layers },
  { href: "/cashflow", label: "Cash Flow Runway", icon: CandlestickChart },
  { href: "/invoices", label: "Invoices", icon: DollarSign },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/vendors", label: "Vendors", icon: Package },
];

const RECORDS_NAV: NavItem[] = [
  { href: "/ledger", label: "Evidence Ledger", icon: Shield },
  { href: "/reports", label: "Executive Reports", icon: FileText },
  { href: "/feed", label: "Activity Feed", icon: Bell },
  { href: "/calendar", label: "Calendar", icon: Calendar },
];

// Which nav sections each role can see
const ROLE_SECTIONS: Record<UserRole, string[]> = {
  sysadmin: ["personas", "delivery", "intelligence", "commercial", "records"],
  admin: ["personas", "delivery", "intelligence", "commercial", "records"],
  consultant: ["personas", "delivery", "intelligence", "commercial", "records"],
  client_executive: ["personas", "records"],
  analyst: ["delivery", "records"],
};

const ROLE_PERSONAS: Record<UserRole, string[]> = {
  sysadmin: ["/executive", "/command-center", "/advisory", "/governance"],
  admin: ["/executive", "/command-center", "/advisory", "/governance"],
  consultant: ["/executive", "/command-center", "/advisory", "/governance"],
  client_executive: ["/executive"],
  analyst: ["/command-center"],
};

export function Sidebar({ role, userName }: { role: UserRole; userName?: string; userImageUrl?: string }) {
  const path = usePathname();
  const isActive = (href: string) => path === href || (href !== "/" && path.startsWith(href));
  const sections = ROLE_SECTIONS[role] ?? [];
  const allowedPersonas = ROLE_PERSONAS[role] ?? [];

  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div>
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 pb-1.5">{title}</div>
      <div className="space-y-0.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors group",
                active ? "bg-[#0EA5E9]/15 text-[#0EA5E9] font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon size={13} className={cn("shrink-0", active ? "text-[#0EA5E9]" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="flex-1 text-xs">{label}</span>
              {active && <ChevronRight size={10} className="opacity-60" />}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-56 flex-shrink-0 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 py-3.5 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded bg-[#0EA5E9] flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-bold">S</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">SIOS</div>
            <div className="text-[9px] text-muted-foreground leading-none">Innovation OS · v2026</div>
          </div>
          <Home size={11} className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      <nav className="flex-1 px-2.5 py-3 space-y-3 overflow-y-auto">
        {/* Personas */}
        {sections.includes("personas") && (
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 pb-1.5">Personas</div>
            <div className="space-y-0.5">
              {PERSONAS.filter((p) => allowedPersonas.includes(p.href)).map(({ href, label, icon: Icon, color }) => {
                const active = isActive(href);
                return (
                  <Link key={href} href={href}
                    className={cn(
                      "flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors group",
                      active ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    )}
                  >
                    <Icon size={13} className={cn("shrink-0", active ? color : "text-muted-foreground group-hover:text-foreground")} />
                    <span className="flex-1 text-xs">{label}</span>
                    {active && <ChevronRight size={10} className="opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {sections.includes("personas") && <div className="border-t border-border" />}
        {sections.includes("delivery") && <NavSection title="Delivery" items={DELIVERY_NAV} />}
        {sections.includes("delivery") && <div className="border-t border-border" />}
        {sections.includes("intelligence") && <NavSection title="Intelligence" items={INTELLIGENCE_NAV} />}
        {sections.includes("intelligence") && <div className="border-t border-border" />}
        {sections.includes("commercial") && <NavSection title="Commercial" items={COMMERCIAL_NAV} />}
        {sections.includes("commercial") && <div className="border-t border-border" />}
        {sections.includes("records") && <NavSection title="Records" items={RECORDS_NAV} />}

        {/* Sysadmin link */}
        {role === "sysadmin" && (
          <>
            <div className="border-t border-border" />
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 pb-1.5">System</div>
              <Link href="/admin"
                className={cn(
                  "flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors group",
                  isActive("/admin") ? "bg-red-500/10 text-red-400 font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Settings size={13} className={cn("shrink-0", isActive("/admin") ? "text-red-400" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="flex-1 text-xs">Admin Panel</span>
                {isActive("/admin") && <ChevronRight size={10} className="opacity-60" />}
              </Link>
            </div>
          </>
        )}

        {/* Client Portal info for consultants+ */}
        {(role === "sysadmin" || role === "admin" || role === "consultant") && (
          <div className="border-t border-border pt-2">
            <div className="px-2 py-2 rounded-md border border-dashed border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Users size={11} /><span>Client Portal</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug">
                <code className="bg-secondary px-0.5 rounded text-[9px]">/client/[id]</code> for read-only access
              </p>
            </div>
          </div>
        )}
      </nav>

      {/* User + Status Footer */}
      <div className="px-4 py-3 border-t border-border space-y-2">
        <div className="flex items-center gap-2">
          <UserButton />
          <div className="flex-1 min-w-0">
            {userName && <div className="text-[11px] font-medium text-foreground truncate">{userName}</div>}
            <div className="text-[10px] text-muted-foreground truncate capitalize">{role}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
          <span className="text-[10px] text-muted-foreground">22 Agents Online</span>
        </div>
      </div>
    </aside>
  );
}

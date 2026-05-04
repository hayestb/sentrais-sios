"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, GitBranch, Bot, FileText, Calendar, Briefcase,
  Shield, BarChart3, Brain, ChevronRight, Users, Home, DollarSign,
  Sparkles, UserCheck, AlertCircle, Package, Wallet, Activity,
  TrendingUp, FlaskConical, PieChart, MessageSquare, Bell,
} from "lucide-react";

const PERSONAS = [
  { href: "/executive", label: "Executive", icon: BarChart3, color: "text-[#0EA5E9]" },
  { href: "/command-center", label: "Operations", icon: LayoutDashboard, color: "text-green-400" },
  { href: "/advisory", label: "Advisory", icon: Brain, color: "text-purple-400" },
  { href: "/governance", label: "Governance & QA", icon: Shield, color: "text-amber-400" },
];

const DELIVERY_NAV = [
  { href: "/engagements", label: "Engagements", icon: Briefcase },
  { href: "/gates", label: "Golden Path", icon: GitBranch },
  { href: "/sprint", label: "Sprint Calendar", icon: Calendar },
  { href: "/raci", label: "RACI Matrix", icon: UserCheck },
  { href: "/pmo", label: "PMO Dashboard", icon: Activity },
  { href: "/kpi", label: "KPI Framework", icon: TrendingUp },
  { href: "/remediation", label: "Remediation Board", icon: AlertCircle },
];

const INTELLIGENCE_NAV = [
  { href: "/sipe", label: "SIPE Intelligence", icon: Sparkles },
  { href: "/agents", label: "FORGE Agents", icon: Bot },
  { href: "/chat", label: "Agent Chat", icon: MessageSquare },
  { href: "/lab", label: "Lab Environment", icon: FlaskConical },
];

const COMMERCIAL_NAV = [
  { href: "/crm", label: "CRM Pipeline", icon: PieChart },
  { href: "/invoices", label: "Invoices", icon: DollarSign },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/vendors", label: "Vendors", icon: Package },
];

const RECORDS_NAV = [
  { href: "/ledger", label: "Evidence Ledger", icon: Shield },
  { href: "/reports", label: "Executive Reports", icon: FileText },
  { href: "/feed", label: "Activity Feed", icon: Bell },
];

export function Sidebar() {
  const path = usePathname();

  const isActive = (href: string) =>
    path === href || (href !== "/" && path.startsWith(href));

  const NavSection = ({
    title,
    items,
  }: {
    title: string;
    items: { href: string; label: string; icon: React.ElementType; color?: string }[];
  }) => (
    <div>
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 pb-1.5">
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map(({ href, label, icon: Icon, color }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors group",
                active
                  ? "bg-[#0EA5E9]/15 text-[#0EA5E9] font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon size={13} className={cn("shrink-0", active ? "text-[#0EA5E9]" : color ?? "text-muted-foreground group-hover:text-foreground")} />
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
            <div className="text-[9px] text-muted-foreground leading-none">
              Innovation OS · v2026
            </div>
          </div>
          <Home size={11} className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      <nav className="flex-1 px-2.5 py-3 space-y-3 overflow-y-auto">
        {/* Persona Entry Points */}
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 pb-1.5">
            Personas
          </div>
          <div className="space-y-0.5">
            {PERSONAS.map(({ href, label, icon: Icon, color }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors group",
                    active
                      ? "bg-secondary text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
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

        <div className="border-t border-border" />

        <NavSection title="Delivery" items={DELIVERY_NAV} />
        <div className="border-t border-border" />
        <NavSection title="Intelligence" items={INTELLIGENCE_NAV} />
        <div className="border-t border-border" />
        <NavSection title="Commercial" items={COMMERCIAL_NAV} />
        <div className="border-t border-border" />
        <NavSection title="Records" items={RECORDS_NAV} />

        {/* Client Portal */}
        <div className="border-t border-border pt-2">
          <div className="px-2 py-2 rounded-md border border-dashed border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Users size={11} />
              <span>Client Portal</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug">
              <code className="bg-secondary px-0.5 rounded text-[9px]">/client/[id]</code> for read-only access
            </p>
          </div>
        </div>
      </nav>

      {/* System Status Footer */}
      <div className="px-4 py-3 border-t border-border space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] text-muted-foreground">22 Agents Online</span>
        </div>
        <div className="text-[10px] text-muted-foreground">Zone 1 Ledger: Active</div>
      </div>
    </aside>
  );
}

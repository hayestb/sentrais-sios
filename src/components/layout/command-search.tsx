"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Briefcase, GitBranch, Bot, FileText, AlertCircle,
  Package, Wallet, FlaskConical, PieChart, TrendingUp, X,
  LayoutDashboard, Brain, Shield, BarChart3,
} from "lucide-react";

interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  icon: React.ElementType;
  color: string;
  category: string;
}

const STATIC_ROUTES: SearchResult[] = [
  { id: "r-executive", label: "Executive Dashboard", href: "/executive", icon: BarChart3, color: "text-[#0EA5E9]", category: "Personas" },
  { id: "r-ops", label: "Operations", href: "/command-center", icon: LayoutDashboard, color: "text-green-400", category: "Personas" },
  { id: "r-advisory", label: "Advisory / Blueprint360", href: "/advisory", icon: Brain, color: "text-purple-400", category: "Personas" },
  { id: "r-governance", label: "Governance & QA", href: "/governance", icon: Shield, color: "text-amber-400", category: "Personas" },
  { id: "r-engagements", label: "Engagements", href: "/engagements", icon: Briefcase, color: "text-primary", category: "Delivery" },
  { id: "r-gates", label: "Golden Path Gates", href: "/gates", icon: GitBranch, color: "text-primary", category: "Delivery" },
  { id: "r-pmo", label: "PMO Dashboard", href: "/pmo", icon: LayoutDashboard, color: "text-primary", category: "Delivery" },
  { id: "r-kpi", label: "KPI Framework", href: "/kpi", icon: TrendingUp, color: "text-[#00D4AA]", category: "Delivery" },
  { id: "r-remediation", label: "Remediation Board", href: "/remediation", icon: AlertCircle, color: "text-red-400", category: "Delivery" },
  { id: "r-agents", label: "FORGE Agents", href: "/agents", icon: Bot, color: "text-purple-400", category: "Intelligence" },
  { id: "r-chat", label: "Agent Chat", href: "/chat", icon: Bot, color: "text-purple-400", category: "Intelligence" },
  { id: "r-lab", label: "Lab Environment", href: "/lab", icon: FlaskConical, color: "text-amber-400", category: "Intelligence" },
  { id: "r-crm", label: "CRM Pipeline", href: "/crm", icon: PieChart, color: "text-sky-400", category: "Commercial" },
  { id: "r-budget", label: "Budget", href: "/budget", icon: Wallet, color: "text-green-400", category: "Commercial" },
  { id: "r-vendors", label: "Vendor Registry", href: "/vendors", icon: Package, color: "text-orange-400", category: "Commercial" },
  { id: "r-ledger", label: "Evidence Ledger", href: "/ledger", icon: Shield, color: "text-primary", category: "Records" },
  { id: "r-reports", label: "Executive Reports", href: "/reports", icon: FileText, color: "text-muted-foreground", category: "Records" },
  { id: "r-feed", label: "Activity Feed", href: "/feed", icon: LayoutDashboard, color: "text-muted-foreground", category: "Records" },
];

interface DynamicResult {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  category: string;
}

async function searchEngagements(q: string): Promise<DynamicResult[]> {
  try {
    const res = await fetch("/api/engagements");
    const data = await res.json();
    return (data.engagements ?? [])
      .filter((e: { clientName: string; vertical?: string }) =>
        e.clientName.toLowerCase().includes(q) || (e.vertical ?? "").toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((e: { id: string; clientName: string; vertical?: string }) => ({
        id: `eng-${e.id}`,
        label: e.clientName,
        sublabel: e.vertical ?? "Engagement",
        href: `/engagements/${e.id}`,
        category: "Engagements",
      }));
  } catch {
    return [];
  }
}

async function searchCrm(q: string): Promise<DynamicResult[]> {
  try {
    const res = await fetch("/api/crm");
    const data = await res.json();
    return (data.deals ?? [])
      .filter((d: { companyName: string }) => d.companyName.toLowerCase().includes(q))
      .slice(0, 3)
      .map((d: { id: string; companyName: string; stage: string }) => ({
        id: `crm-${d.id}`,
        label: d.companyName,
        sublabel: `CRM · ${d.stage}`,
        href: "/crm",
        category: "CRM Deals",
      }));
  } catch {
    return [];
  }
}

async function searchRemediation(q: string): Promise<DynamicResult[]> {
  try {
    const res = await fetch("/api/remediation");
    const data = await res.json();
    return (data.actions ?? [])
      .filter((a: { title: string }) => a.title.toLowerCase().includes(q))
      .slice(0, 3)
      .map((a: { id: string; title: string; status: string }) => ({
        id: `rem-${a.id}`,
        label: a.title,
        sublabel: `Action · ${a.status}`,
        href: "/remediation",
        category: "Actions",
      }));
  } catch {
    return [];
  }
}

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dynamicResults, setDynamicResults] = useState<DynamicResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelected(0);
      setDynamicResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setDynamicResults([]); return; }
    const q = query.toLowerCase();
    setSearching(true);
    Promise.all([searchEngagements(q), searchCrm(q), searchRemediation(q)])
      .then((results) => { setDynamicResults(results.flat()); setSearching(false); });
  }, [query]);

  const staticFiltered = query.trim()
    ? STATIC_ROUTES.filter(
        (r) =>
          r.label.toLowerCase().includes(query.toLowerCase()) ||
          r.category.toLowerCase().includes(query.toLowerCase())
      )
    : STATIC_ROUTES;

  const allResults: (SearchResult | (DynamicResult & { icon?: React.ElementType; color?: string }))[] = [
    ...dynamicResults,
    ...staticFiltered,
  ];

  const handleSelect = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
    },
    [router]
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, allResults.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === "Enter" && allResults[selected]) handleSelect(allResults[selected].href);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, allResults, selected, handleSelect]);

  const groupedStatic = staticFiltered.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={15} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Search pages, engagements, deals, actions…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X size={13} />
            </button>
          )}
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {searching && (
            <div className="px-4 py-2 text-[11px] text-muted-foreground animate-pulse">Searching…</div>
          )}

          {/* Dynamic results */}
          {dynamicResults.length > 0 && (
            <div>
              {["Engagements", "CRM Deals", "Actions"].map((cat) => {
                const items = dynamicResults.filter((r) => r.category === cat);
                if (!items.length) return null;
                const globalOffset = allResults.findIndex((r) => r.id === items[0].id);
                return (
                  <div key={cat}>
                    <div className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      {cat}
                    </div>
                    {items.map((item, i) => {
                      const idx = globalOffset + i;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item.href)}
                          onMouseEnter={() => setSelected(idx)}
                          className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${selected === idx ? "bg-secondary" : "hover:bg-secondary/50"}`}
                        >
                          <Briefcase size={13} className="text-primary shrink-0" />
                          <div>
                            <div className="text-xs text-foreground font-medium">{item.label}</div>
                            {item.sublabel && <div className="text-[10px] text-muted-foreground">{item.sublabel}</div>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              <div className="border-t border-border my-1" />
            </div>
          )}

          {/* Static routes */}
          {Object.entries(groupedStatic).map(([category, items]) => {
            return (
              <div key={category}>
                <div className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {category}
                </div>
                {items.map((item) => {
                  const idx = allResults.findIndex((r) => r.id === item.id);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.href)}
                      onMouseEnter={() => setSelected(idx)}
                      className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${selected === idx ? "bg-secondary" : "hover:bg-secondary/50"}`}
                    >
                      <Icon size={13} className={`${item.color} shrink-0`} />
                      <span className="text-xs text-foreground">{item.label}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{item.href}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {allResults.length === 0 && !searching && query && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
          <span><kbd className="border border-border rounded px-1 py-0.5 font-mono mr-1">↑↓</kbd>navigate</span>
          <span><kbd className="border border-border rounded px-1 py-0.5 font-mono mr-1">↵</kbd>open</span>
          <span><kbd className="border border-border rounded px-1 py-0.5 font-mono mr-1">esc</kbd>close</span>
          <span className="ml-auto">⌘K to toggle</span>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain, BookOpen, Lightbulb, BarChart3, Search, Filter,
  RefreshCw, ChevronRight, Sparkles, Clock,
} from "lucide-react";

const CATEGORIES = [
  { key: "", label: "All", icon: Sparkles },
  { key: "pattern", label: "Patterns", icon: Brain },
  { key: "lesson", label: "Lessons", icon: Lightbulb },
  { key: "playbook", label: "Playbooks", icon: BookOpen },
  { key: "benchmark", label: "Benchmarks", icon: BarChart3 },
];

const VERTICALS = ["", "Live Events", "Healthcare", "Finance", "Retail", "Manufacturing", "Technology"];
const PHASES = ["", "discover", "diagnose", "design", "deploy", "debrief"];

interface SipeEntry {
  id: string;
  category: string;
  content: string;
  tags: string[];
  vertical: string | null;
  applicablePhases: string[];
  confidenceScore: number | null;
  createdAt: string;
}

interface SipeRow {
  entry: SipeEntry;
  clientName: string | null;
}

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  pattern: { color: "text-[#0EA5E9]", bg: "bg-[#0EA5E9]/10 border-[#0EA5E9]/20", icon: Brain },
  lesson: { color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", icon: Lightbulb },
  playbook: { color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20", icon: BookOpen },
  benchmark: { color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", icon: BarChart3 },
};

export default function SipePage() {
  const [rows, setRows] = useState<SipeRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [category, setCategory] = useState("");
  const [vertical, setVertical] = useState("");
  const [phase, setPhase] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<SipeEntry | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (vertical) params.set("vertical", vertical);
    if (phase) params.set("phase", phase);
    if (search) params.set("search", search);
    const res = await fetch(`/api/sipe?${params}`);
    const data = await res.json();
    setRows(data.entries ?? []);
    setCounts(data.counts ?? {});
    setLoading(false);
  }, [category, vertical, phase, search]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="SIPE Intelligence Browser"
        subtitle="Sentrais Intelligence Pattern Engine · Cross-engagement learning · Pre-populated intelligence"
      />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.filter((c) => c.key).map((c) => {
            const cfg = CATEGORY_CONFIG[c.key];
            const Icon = cfg.icon;
            return (
              <div key={c.key} className={`p-4 rounded-lg border ${cfg.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className={cfg.color} />
                  <span className={`text-xs font-medium ${cfg.color}`}>{c.label}</span>
                </div>
                <div className={`text-2xl font-bold ${cfg.color}`}>{counts[c.key] ?? 0}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">entries indexed</div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search intelligence…"
              className="pl-8 pr-3 h-8 text-xs bg-secondary border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]/50 w-52"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-secondary rounded-md border border-border">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  category === c.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <select
            value={vertical}
            onChange={(e) => setVertical(e.target.value)}
            className="h-8 text-xs bg-secondary border border-border rounded-md text-muted-foreground px-2 focus:outline-none"
          >
            {VERTICALS.map((v) => (
              <option key={v} value={v}>{v || "All Verticals"}</option>
            ))}
          </select>

          <select
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            className="h-8 text-xs bg-secondary border border-border rounded-md text-muted-foreground px-2 focus:outline-none"
          >
            {PHASES.map((p) => (
              <option key={p} value={p}>{p ? p.charAt(0).toUpperCase() + p.slice(1) : "All Phases"}</option>
            ))}
          </select>

          <button
            onClick={fetchEntries}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Entry List */}
          <div className="lg:col-span-3 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                <RefreshCw size={14} className="animate-spin mr-2" /> Loading intelligence…
              </div>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Brain size={28} className="text-muted-foreground mb-3 opacity-40" />
                <div className="text-sm text-muted-foreground">No SIPE entries yet</div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Intelligence is captured automatically when the Learning Agent runs Day 10 retrospectives.
                </p>
              </div>
            ) : (
              rows.map(({ entry, clientName }) => {
                const cfg = CATEGORY_CONFIG[entry.category] ?? CATEGORY_CONFIG.pattern;
                const Icon = cfg.icon;
                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedEntry?.id === entry.id
                        ? `${cfg.bg} shadow-sm`
                        : "border-border bg-card hover:bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${cfg.bg}`}>
                        <Icon size={13} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-medium uppercase tracking-widest ${cfg.color}`}>
                            {entry.category}
                          </span>
                          {entry.vertical && (
                            <span className="text-[10px] text-muted-foreground">{entry.vertical}</span>
                          )}
                          {entry.confidenceScore != null && (
                            <span className="text-[10px] text-green-400 ml-auto">
                              {Math.round(entry.confidenceScore * 100)}% confidence
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground leading-relaxed line-clamp-2">
                          {entry.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {(entry.tags as string[])?.slice(0, 4).map((t) => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary border border-border text-muted-foreground">
                              {t}
                            </span>
                          ))}
                          {clientName && (
                            <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                              <Clock size={9} />
                              {clientName}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={12} className={`text-muted-foreground shrink-0 mt-1 transition-transform ${selectedEntry?.id === entry.id ? "rotate-90" : ""}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2">
            {selectedEntry ? (
              <Card className="border-border sticky top-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const cfg = CATEGORY_CONFIG[selectedEntry.category] ?? CATEGORY_CONFIG.pattern;
                      const Icon = cfg.icon;
                      return <Icon size={14} className={cfg.color} />;
                    })()}
                    <CardTitle className="text-sm capitalize">{selectedEntry.category} Detail</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Intelligence</div>
                    <p className="text-xs text-foreground leading-relaxed">{selectedEntry.content}</p>
                  </div>
                  {selectedEntry.vertical && (
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Vertical</div>
                      <Badge variant="outline" className="text-[10px]">{selectedEntry.vertical}</Badge>
                    </div>
                  )}
                  {(selectedEntry.applicablePhases as string[])?.length > 0 && (
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Applicable Phases</div>
                      <div className="flex flex-wrap gap-1">
                        {(selectedEntry.applicablePhases as string[]).map((p) => (
                          <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground capitalize">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(selectedEntry.tags as string[])?.length > 0 && (
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Tags</div>
                      <div className="flex flex-wrap gap-1">
                        {(selectedEntry.tags as string[]).map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 border border-border text-muted-foreground">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedEntry.confidenceScore != null && (
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Confidence</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${selectedEntry.confidenceScore * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-green-400 font-mono">
                          {Math.round(selectedEntry.confidenceScore * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="p-6 rounded-lg border border-dashed border-border text-center">
                <Filter size={20} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                <div className="text-xs text-muted-foreground">Select an entry to view details</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

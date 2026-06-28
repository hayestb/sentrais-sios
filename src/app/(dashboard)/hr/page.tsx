"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";

interface WorkerRecord {
  id: string;
  fullName: string;
  entity: string;
  classification: "W2" | "1099" | "intern" | "fellow" | "vacant";
  tier: number;
  title: string;
  benefitsTier: string | null;
  annualComp: number | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  complianceFreeze: boolean;
  notes: string | null;
  justworksId: string | null;
  gustoId: string | null;
  adpId: string | null;
}

const TIER_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: "Tier 0 — Principal / C-Suite", color: "text-amber-400" },
  1: { label: "Tier 1 — Executive Leadership", color: "text-[#0EA5E9]" },
  2: { label: "Tier 2 — Senior", color: "text-teal-400" },
  3: { label: "Tier 3 — Mid-Level", color: "text-foreground" },
  4: { label: "Tier 4 — Associate / Intern", color: "text-muted-foreground" },
};

const CLASSIFICATION_STYLE: Record<string, string> = {
  W2: "bg-green-500/10 text-green-400 border-green-500/30",
  "1099": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  intern: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  fellow: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  vacant: "bg-secondary text-muted-foreground border-border",
};

function ClassBadge({ cls }: { cls: string }) {
  const style = CLASSIFICATION_STYLE[cls] ?? CLASSIFICATION_STYLE.vacant;
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-mono font-bold ${style}`}>
      {cls}
    </span>
  );
}

function WorkerRow({
  worker,
  showComp,
  onToggleFreeze,
  onToggleActive,
}: {
  worker: WorkerRecord;
  showComp: boolean;
  onToggleFreeze: (id: string, freeze: boolean) => Promise<void>;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
}) {
  const [compVisible, setCompVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  return (
    <tr className={`border-b border-border transition-colors ${
      worker.complianceFreeze ? "bg-red-500/5" : !worker.isActive ? "opacity-50" : "hover:bg-secondary/30"
    }`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${worker.isActive ? "bg-green-400" : "bg-muted-foreground"}`} />
          <div>
            <p className="text-sm font-medium text-foreground">{worker.fullName}</p>
            <p className="text-[11px] text-muted-foreground font-mono">{worker.entity}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-xs text-foreground">{worker.title}</p>
      </td>
      <td className="px-4 py-3">
        <ClassBadge cls={worker.classification} />
      </td>
      <td className="px-4 py-3 text-xs font-mono text-muted-foreground text-center">
        {worker.tier}
      </td>
      <td className="px-4 py-3 text-xs font-mono text-center">
        {showComp ? (
          worker.annualComp !== null ? (
            compVisible
              ? <span className="text-foreground">${worker.annualComp.toLocaleString()}</span>
              : <button onClick={() => setCompVisible(true)} className="text-[#0EA5E9] hover:underline text-[11px]">reveal</button>
          ) : <span className="text-muted-foreground">—</span>
        ) : <span className="text-muted-foreground">••••••</span>}
      </td>
      <td className="px-4 py-3 text-center">
        {worker.complianceFreeze && (
          <span className="text-[10px] font-mono text-red-300 border border-red-500/40 rounded px-1.5 py-0.5 bg-red-500/10">
            FROZEN
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            disabled={updating}
            onClick={async () => {
              setUpdating(true);
              await onToggleFreeze(worker.id, !worker.complianceFreeze);
              setUpdating(false);
            }}
            className={`text-[10px] font-mono rounded border px-2 py-0.5 transition-colors ${
              worker.complianceFreeze
                ? "border-red-500/40 text-red-300 hover:bg-red-500/20"
                : "border-border text-muted-foreground hover:border-amber-500/40 hover:text-amber-400"
            }`}
          >
            {worker.complianceFreeze ? "unfreeze" : "freeze"}
          </button>
          <button
            disabled={updating}
            onClick={async () => {
              setUpdating(true);
              await onToggleActive(worker.id, !worker.isActive);
              setUpdating(false);
            }}
            className="text-[10px] font-mono rounded border border-border text-muted-foreground hover:text-foreground px-2 py-0.5 transition-colors"
          >
            {worker.isActive ? "deactivate" : "activate"}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function HRWorkforcePage() {
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComp, setShowComp] = useState(false);
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("active");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hr");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load workforce data");
        return;
      }
      setWorkers(data.workers ?? []);
    } catch {
      setError("Network error loading workforce data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorkers(); }, [fetchWorkers]);

  const handleToggleFreeze = async (id: string, complianceFreeze: boolean) => {
    await fetch("/api/hr", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, complianceFreeze }),
    });
    fetchWorkers();
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await fetch("/api/hr", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive }),
    });
    fetchWorkers();
  };

  const entities = [...new Set(workers.map((w) => w.entity))].sort();
  const classifications = [...new Set(workers.map((w) => w.classification))].sort();

  const filtered = workers.filter((w) => {
    if (filterActive === "active" && !w.isActive) return false;
    if (filterActive === "inactive" && w.isActive) return false;
    if (filterClass !== "all" && w.classification !== filterClass) return false;
    if (filterEntity !== "all" && w.entity !== filterEntity) return false;
    return true;
  });

  // Group by tier
  const byTier = filtered.reduce<Record<number, WorkerRecord[]>>((acc, w) => {
    (acc[w.tier] ??= []).push(w);
    return acc;
  }, {});

  const activeCount = workers.filter((w) => w.isActive).length;
  const frozenCount = workers.filter((w) => w.complianceFreeze).length;
  const w2Count = workers.filter((w) => w.classification === "W2" && w.isActive).length;
  const contractCount = workers.filter((w) => w.classification === "1099" && w.isActive).length;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="HR Workforce"
        subtitle="Classification registry · Tier structure · Compliance freeze management"
      />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active Headcount", value: String(activeCount || "—"), color: "text-green-400" },
            { label: "W2 Employees", value: String(w2Count || "—"), color: "text-[#0EA5E9]" },
            { label: "1099 Contractors", value: String(contractCount || "—"), color: "text-blue-400" },
            { label: "Compliance Freeze", value: String(frozenCount), color: frozenCount > 0 ? "text-red-400" : "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-secondary/20 p-4">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            {(["all", "active", "inactive"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setFilterActive(v)}
                className={`text-xs rounded px-3 py-1.5 transition-colors ${
                  filterActive === v ? "bg-secondary border border-border text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="text-xs bg-secondary border border-border rounded px-2 py-1.5 text-foreground focus:outline-none"
          >
            <option value="all">All classifications</option>
            {classifications.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="text-xs bg-secondary border border-border rounded px-2 py-1.5 text-foreground focus:outline-none"
          >
            <option value="all">All entities</option>
            {entities.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <button
            onClick={() => setShowComp((v) => !v)}
            className={`ml-auto text-xs rounded px-3 py-1.5 border transition-colors ${
              showComp ? "border-amber-500/40 text-amber-400 bg-amber-500/5" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {showComp ? "Hide comp" : "Reveal comp"}
          </button>
        </div>

        {loading && <div className="text-sm text-muted-foreground">Loading workforce data…</div>}

        {error && !loading && (
          <div className="rounded border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400 font-mono">
            {error}
          </div>
        )}

        {!loading && !error && workers.length === 0 && (
          <div className="rounded border border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No workforce records found.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Add records via the HR API or database seed.</p>
          </div>
        )}

        {!loading && !error && Object.keys(byTier).length > 0 && (
          <div className="space-y-6">
            {[0, 1, 2, 3, 4].map((tier) => {
              const tierWorkers = byTier[tier];
              if (!tierWorkers?.length) return null;
              const tierMeta = TIER_LABELS[tier] ?? { label: `Tier ${tier}`, color: "text-foreground" };
              return (
                <div key={tier}>
                  <p className={`text-xs font-mono uppercase tracking-widest mb-2 ${tierMeta.color}`}>
                    {tierMeta.label} · {tierWorkers.length} record{tierWorkers.length !== 1 ? "s" : ""}
                  </p>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-secondary/30">
                          <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground">Name / Entity</th>
                          <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground">Title</th>
                          <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground">Class</th>
                          <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-wider text-muted-foreground">Tier</th>
                          <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-wider text-muted-foreground">Comp</th>
                          <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-wider text-muted-foreground">Status</th>
                          <th className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wider text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tierWorkers.map((w) => (
                          <WorkerRow
                            key={w.id}
                            worker={w}
                            showComp={showComp}
                            onToggleFreeze={handleToggleFreeze}
                            onToggleActive={handleToggleActive}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

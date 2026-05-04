"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, TrendingDown, Minus, BarChart3, Plus, RefreshCw, Target,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface KpiSnapshot {
  id: string;
  kpiKey: string;
  kpiLabel: string;
  value: number;
  unit: string | null;
  target: number | null;
  trend: string | null;
  vertical: string | null;
  sprintNumber: number | null;
  engagementId: string;
  capturedAt: string;
}

interface Engagement { id: string; clientName: string; vertical: string; }

const VERTICAL_KPIS: Record<string, { key: string; label: string; unit: string; target: number }[]> = {
  default: [
    { key: "stakeholder_nps", label: "Stakeholder NPS", unit: "pts", target: 50 },
    { key: "sprint_velocity", label: "Sprint Velocity", unit: "%", target: 85 },
    { key: "gate_compliance", label: "Gate Compliance", unit: "%", target: 100 },
    { key: "agent_efficiency", label: "Agent Efficiency", unit: "%", target: 90 },
  ],
  healthcare: [
    { key: "compliance_score", label: "Compliance Score", unit: "%", target: 95 },
    { key: "process_uptime", label: "Process Uptime", unit: "%", target: 99.5 },
    { key: "audit_readiness", label: "Audit Readiness", unit: "%", target: 100 },
  ],
  financial: [
    { key: "risk_score", label: "Risk Score", unit: "pts", target: 80 },
    { key: "sla_adherence", label: "SLA Adherence", unit: "%", target: 98 },
    { key: "cost_efficiency", label: "Cost Efficiency", unit: "%", target: 85 },
  ],
};

function TrendIcon({ trend }: { trend: string | null }) {
  if (trend === "up") return <TrendingUp size={12} className="text-[#00D4AA]" />;
  if (trend === "down") return <TrendingDown size={12} className="text-red-400" />;
  return <Minus size={12} className="text-muted-foreground" />;
}

export default function KpiPage() {
  const [snapshots, setSnapshots] = useState<KpiSnapshot[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [selectedEngId, setSelectedEngId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newKpi, setNewKpi] = useState({ kpiKey: "", kpiLabel: "", value: "", unit: "", target: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [sRes, eRes] = await Promise.all([
      fetch(selectedEngId ? `/api/kpi?engagementId=${selectedEngId}` : "/api/kpi"),
      fetch("/api/engagements"),
    ]);
    const [sData, eData] = await Promise.all([sRes.json(), eRes.json()]);
    setSnapshots(sData.snapshots ?? []);
    setEngagements(eData.engagements ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [selectedEngId]);

  const addKpi = async () => {
    if (!newKpi.kpiLabel || !newKpi.value || !selectedEngId) return;
    setSaving(true);
    await fetch("/api/kpi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        engagementId: selectedEngId,
        kpiKey: newKpi.kpiKey || newKpi.kpiLabel.toLowerCase().replace(/\s+/g, "_"),
        kpiLabel: newKpi.kpiLabel,
        value: parseFloat(newKpi.value),
        unit: newKpi.unit || undefined,
        target: newKpi.target ? parseFloat(newKpi.target) : undefined,
      }),
    });
    await load();
    setShowAdd(false);
    setNewKpi({ kpiKey: "", kpiLabel: "", value: "", unit: "", target: "" });
    setSaving(false);
  };

  // Group by kpiKey and get latest per key
  const latestByKey = Object.values(
    snapshots.reduce((acc, s) => {
      if (!acc[s.kpiKey] || new Date(s.capturedAt) > new Date(acc[s.kpiKey].capturedAt)) {
        acc[s.kpiKey] = s;
      }
      return acc;
    }, {} as Record<string, KpiSnapshot>)
  );

  // Historical trend for a key
  const historyFor = (key: string) =>
    snapshots.filter((s) => s.kpiKey === key).sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())
      .map((s) => ({ sprint: `S${s.sprintNumber ?? "?"}`, value: s.value }));

  const selectedEng = engagements.find((e) => e.id === selectedEngId);
  const suggestedKpis = VERTICAL_KPIS[selectedEng?.vertical?.toLowerCase() ?? ""] ?? VERTICAL_KPIS.default;

  return (
    <div className="flex flex-col h-full">
      <Header title="KPI Framework" subtitle="Performance snapshots · Trend tracking · Vertical-specific KPI sets" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Engagement selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-muted-foreground">Engagement:</span>
          <button onClick={() => setSelectedEngId(null)}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${!selectedEngId ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
            All
          </button>
          {engagements.map((e) => (
            <button key={e.id} onClick={() => setSelectedEngId(e.id)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${selectedEngId === e.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
              {e.clientName}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </Button>
            <Button size="sm" variant="forge" disabled={!selectedEngId} onClick={() => setShowAdd(true)}>
              <Plus size={12} className="mr-1" /> Add KPI
            </Button>
          </div>
        </div>

        {/* Suggested KPIs for vertical */}
        {selectedEng && (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <Target size={12} className="text-primary" />
                Suggested KPIs — {selectedEng.vertical}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {suggestedKpis.map((kpi) => (
                  <button
                    key={kpi.key}
                    onClick={() => setNewKpi({ kpiKey: kpi.key, kpiLabel: kpi.label, value: "", unit: kpi.unit, target: String(kpi.target) })}
                    className="text-[10px] px-2 py-1 rounded border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    {kpi.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add form */}
        {showAdd && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input value={newKpi.kpiLabel} onChange={(e) => setNewKpi((p) => ({ ...p, kpiLabel: e.target.value }))} placeholder="KPI label *" className="h-8 px-2 text-xs rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary col-span-2" />
                <input value={newKpi.unit} onChange={(e) => setNewKpi((p) => ({ ...p, unit: e.target.value }))} placeholder="Unit (%, pts…)" className="h-8 px-2 text-xs rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <input value={newKpi.value} onChange={(e) => setNewKpi((p) => ({ ...p, value: e.target.value }))} type="number" placeholder="Current value *" className="h-8 px-2 text-xs rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <input value={newKpi.target} onChange={(e) => setNewKpi((p) => ({ ...p, target: e.target.value }))} type="number" placeholder="Target value" className="h-8 px-2 text-xs rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="forge" onClick={addKpi} disabled={saving || !newKpi.kpiLabel || !newKpi.value}>{saving ? "Saving…" : "Record KPI"}</Button>
                <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {latestByKey.map((kpi) => {
            const history = historyFor(kpi.kpiKey);
            const atTarget = kpi.target != null && kpi.value >= kpi.target;
            return (
              <Card key={kpi.kpiKey} className={`border-border ${atTarget ? "border-[#00D4AA]/20" : ""}`}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-xs text-muted-foreground leading-snug">{kpi.kpiLabel}</span>
                    <TrendIcon trend={kpi.trend} />
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold font-mono" style={{ color: atTarget ? "#00D4AA" : "hsl(210, 40%, 96%)" }}>
                      {kpi.value}
                    </span>
                    {kpi.unit && <span className="text-xs text-muted-foreground mb-0.5">{kpi.unit}</span>}
                  </div>
                  {kpi.target != null && (
                    <div className="text-[10px] text-muted-foreground">Target: {kpi.target}{kpi.unit}</div>
                  )}
                  {history.length > 1 && (
                    <div className="h-12">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history}>
                          <Line type="monotone" dataKey="value" stroke={atTarget ? "#00D4AA" : "#2E75B6"} dot={false} strokeWidth={1.5} />
                          <Tooltip contentStyle={{ background: "hsl(217, 43%, 15%)", border: "none", borderRadius: 4, fontSize: 10 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {kpi.target != null && (
                    <div className="h-1 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, (kpi.value / kpi.target) * 100)}%`, backgroundColor: atTarget ? "#00D4AA" : "#2E75B6" }} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {latestByKey.length === 0 && !loading && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No KPI data yet. Select an engagement and add metrics.
          </div>
        )}
      </div>
    </div>
  );
}

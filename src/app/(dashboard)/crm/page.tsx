"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, DollarSign, Plus, RefreshCw, ArrowRight, Users, Target,
} from "lucide-react";

type CrmStage = "prospect" | "discovery" | "proposal" | "scoping" | "negotiation" | "closed_won" | "closed_lost" | "live";

interface CrmDeal {
  id: string;
  companyName: string;
  contactName: string | null;
  contactEmail: string | null;
  stage: CrmStage;
  vertical: string | null;
  estimatedValue: number | null;
  probability: number;
  expectedCloseDate: string | null;
  assignedTo: string | null;
  notes: string | null;
  convertedToEngagementId: string | null;
}

const STAGES: { key: CrmStage; label: string; color: string; prob: number }[] = [
  { key: "prospect", label: "Prospect", color: "border-border text-muted-foreground", prob: 10 },
  { key: "discovery", label: "Discovery", color: "border-primary/30 text-primary", prob: 25 },
  { key: "proposal", label: "Proposal", color: "border-purple-400/30 text-purple-400", prob: 45 },
  { key: "scoping", label: "Scoping", color: "border-amber-400/30 text-amber-400", prob: 65 },
  { key: "negotiation", label: "Negotiation", color: "border-orange-400/30 text-orange-400", prob: 80 },
  { key: "closed_won", label: "Closed Won", color: "border-[#00D4AA]/30 text-[#00D4AA]", prob: 100 },
  { key: "closed_lost", label: "Closed Lost", color: "border-red-500/30 text-red-400", prob: 0 },
  { key: "live", label: "Live", color: "border-green-400/30 text-green-400", prob: 100 },
];

const ACTIVE_STAGES: CrmStage[] = ["prospect", "discovery", "proposal", "scoping", "negotiation"];

export default function CrmPage() {
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ companyName: "", contactName: "", contactEmail: "", vertical: "", estimatedValue: "", stage: "prospect" as CrmStage });
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/crm");
    const data = await res.json();
    setDeals(data.deals ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addDeal = async () => {
    if (!form.companyName) return;
    setSaving(true);
    const stageInfo = STAGES.find((s) => s.key === form.stage);
    await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: form.companyName,
        contactName: form.contactName || undefined,
        contactEmail: form.contactEmail || undefined,
        vertical: form.vertical || undefined,
        estimatedValue: form.estimatedValue ? parseFloat(form.estimatedValue) : undefined,
        stage: form.stage,
        probability: stageInfo?.prob ?? 10,
      }),
    });
    await load();
    setShowForm(false);
    setForm({ companyName: "", contactName: "", contactEmail: "", vertical: "", estimatedValue: "", stage: "prospect" });
    setSaving(false);
  };

  const moveDeal = async (id: string, stage: CrmStage) => {
    const stageInfo = STAGES.find((s) => s.key === stage);
    setDeals((prev) => prev.map((d) => d.id === id ? { ...d, stage, probability: stageInfo?.prob ?? d.probability } : d));
    await fetch("/api/crm", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stage, probability: stageInfo?.prob ?? 10 }),
    });
  };

  const convertToEngagement = async (deal: CrmDeal) => {
    // Navigate to engagements page with pre-filled data
    const params = new URLSearchParams({
      clientName: deal.companyName,
      vertical: deal.vertical ?? "",
      from_crm: deal.id,
    });
    window.location.href = `/engagements?${params.toString()}`;
  };

  const byStage = (stage: CrmStage) => deals.filter((d) => d.stage === stage);
  const activePipeline = deals.filter((d) => ACTIVE_STAGES.includes(d.stage));
  const weightedPipeline = activePipeline.reduce((s, d) => s + ((d.estimatedValue ?? 0) * (d.probability / 100)), 0);
  const totalPipeline = activePipeline.reduce((s, d) => s + (d.estimatedValue ?? 0), 0);
  const wonDeals = deals.filter((d) => d.stage === "closed_won" || d.stage === "live");

  return (
    <div className="flex flex-col h-full">
      <Header title="CRM Pipeline" subtitle="8-stage deal management · Weighted pipeline · Engagement conversion" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Pipeline stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Active Deals", value: activePipeline.length, icon: Target, color: "text-primary" },
            { label: "Total Pipeline", value: `$${(totalPipeline / 1000).toFixed(0)}k`, icon: DollarSign, color: "text-foreground" },
            { label: "Weighted Pipeline", value: `$${(weightedPipeline / 1000).toFixed(0)}k`, icon: TrendingUp, color: "text-[#00D4AA]" },
            { label: "Won / Live", value: wonDeals.length, icon: Users, color: "text-[#00D4AA]" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <Icon size={18} className={color} />
                <div>
                  <div className="text-lg font-bold text-foreground">{value}</div>
                  <div className="text-[10px] text-muted-foreground">{label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button size="sm" variant="forge" onClick={() => setShowForm(true)}>
            <Plus size={12} className="mr-1" /> New Deal
          </Button>
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>

        {/* Add form */}
        {showForm && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input value={form.companyName} onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))} placeholder="Company name *" className="h-9 px-3 text-sm rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <input value={form.contactName} onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))} placeholder="Contact name" className="h-9 px-3 text-sm rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <input value={form.contactEmail} onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))} placeholder="Contact email" className="h-9 px-3 text-sm rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <input value={form.vertical} onChange={(e) => setForm((p) => ({ ...p, vertical: e.target.value }))} placeholder="Vertical" className="h-9 px-3 text-sm rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <input value={form.estimatedValue} onChange={(e) => setForm((p) => ({ ...p, estimatedValue: e.target.value }))} type="number" placeholder="Estimated value ($)" className="h-9 px-3 text-sm rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <select value={form.stage} onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value as CrmStage }))} className="h-9 px-3 text-sm rounded border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                  {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="forge" onClick={addDeal} disabled={saving || !form.companyName}>{saving ? "Saving…" : "Add Deal"}</Button>
                <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pipeline Kanban — active stages */}
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-max">
            {STAGES.filter((s) => !["closed_lost"].includes(s.key)).map((stage) => {
              const stageDeals = byStage(stage.key);
              return (
                <div
                  key={stage.key}
                  className={`w-48 rounded-lg border p-2 space-y-2 min-h-[200px] ${stage.key === "closed_won" || stage.key === "live" ? "border-[#00D4AA]/20 bg-[#00D4AA]/5" : "border-border bg-card/50"}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); if (dragging) moveDeal(dragging, stage.key); setDragging(null); }}
                >
                  <div className={`flex items-center gap-1.5 px-1 pb-1 border-b border-border`}>
                    <span className={`text-[10px] font-bold ${stage.color.split(" ").pop()}`}>{stage.label}</span>
                    <span className="ml-auto text-[9px] text-muted-foreground">{stage.prob > 0 ? `${stage.prob}%` : "—"}</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1">{stageDeals.length}</Badge>
                  </div>

                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => setDragging(deal.id)}
                      onDragEnd={() => setDragging(null)}
                      className={`p-2 rounded border border-border bg-card cursor-grab text-xs space-y-1 ${dragging === deal.id ? "opacity-40" : ""}`}
                    >
                      <div className="font-medium text-foreground text-[11px] leading-snug">{deal.companyName}</div>
                      {deal.vertical && <div className="text-[9px] text-muted-foreground">{deal.vertical}</div>}
                      {deal.estimatedValue && (
                        <div className="text-[10px] text-primary font-mono">${deal.estimatedValue.toLocaleString()}</div>
                      )}
                      {deal.contactName && <div className="text-[9px] text-muted-foreground">{deal.contactName}</div>}

                      {/* Convert to engagement */}
                      {(stage.key === "closed_won") && !deal.convertedToEngagementId && (
                        <button
                          onClick={() => convertToEngagement(deal)}
                          className="w-full mt-1 h-6 text-[9px] rounded border border-[#00D4AA]/40 text-[#00D4AA] hover:bg-[#00D4AA]/10 flex items-center justify-center gap-1 transition-colors"
                        >
                          <ArrowRight size={8} /> Convert to Engagement
                        </button>
                      )}
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="flex items-center justify-center py-6 text-[9px] text-muted-foreground/40 border border-dashed border-border/30 rounded">
                      Drop here
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Closed lost */}
        {byStage("closed_lost").length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">Closed Lost ({byStage("closed_lost").length})</div>
            <div className="flex gap-2 flex-wrap">
              {byStage("closed_lost").map((deal) => (
                <div key={deal.id} className="px-3 py-1.5 rounded border border-red-500/20 bg-red-500/5 text-xs text-red-400/70">
                  {deal.companyName} {deal.estimatedValue ? `· $${deal.estimatedValue.toLocaleString()}` : ""}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

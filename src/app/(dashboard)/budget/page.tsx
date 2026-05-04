"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign, TrendingUp, AlertTriangle, CheckCircle2,
  Plus, RefreshCw, Target, Flame,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface BudgetMilestone {
  id: string;
  label: string;
  amount: number;
  spentToDate: number;
  dueDate: string | null;
  completedAt: string | null;
  gateNumber: number | null;
  alertThreshold: number;
  notes: string | null;
  engagementId: string;
}

interface Engagement { id: string; clientName: string; contractValue: number; }

export default function BudgetPage() {
  const [milestones, setMilestones] = useState<BudgetMilestone[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [selectedEngId, setSelectedEngId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", amount: "", alertThreshold: "0.85", gateNumber: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [mRes, eRes] = await Promise.all([
      fetch(selectedEngId ? `/api/budget?engagementId=${selectedEngId}` : "/api/budget"),
      fetch("/api/engagements"),
    ]);
    const [mData, eData] = await Promise.all([mRes.json(), eRes.json()]);
    setMilestones(mData.milestones ?? []);
    setEngagements(eData.engagements ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [selectedEngId]);

  const totalBudget = milestones.reduce((s, m) => s + m.amount, 0);
  const totalSpent = milestones.reduce((s, m) => s + m.spentToDate, 0);
  const burnPct = totalBudget > 0 ? totalSpent / totalBudget : 0;
  const alerting = milestones.filter((m) => m.spentToDate / m.amount >= m.alertThreshold);

  const addMilestone = async () => {
    if (!form.label || !form.amount || !selectedEngId) return;
    setSaving(true);
    await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        engagementId: selectedEngId,
        label: form.label,
        amount: parseFloat(form.amount),
        alertThreshold: parseFloat(form.alertThreshold),
        gateNumber: form.gateNumber ? parseInt(form.gateNumber) : undefined,
      }),
    });
    await load();
    setShowForm(false);
    setForm({ label: "", amount: "", alertThreshold: "0.85", gateNumber: "" });
    setSaving(false);
  };

  const updateSpend = async (id: string, spentToDate: number) => {
    await fetch("/api/budget", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, spentToDate }),
    });
    setMilestones((prev) => prev.map((m) => m.id === id ? { ...m, spentToDate } : m));
  };

  const chartData = milestones.map((m) => ({
    name: m.label.slice(0, 14),
    budget: m.amount,
    spent: m.spentToDate,
    alert: m.spentToDate / m.amount >= m.alertThreshold,
  }));

  return (
    <div className="flex flex-col h-full">
      <Header title="Budget Management" subtitle="Burn summary · Milestone tracking · Threshold alerts" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Engagement selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-muted-foreground">Engagement:</span>
          <button
            onClick={() => setSelectedEngId(null)}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${!selectedEngId ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            All
          </button>
          {engagements.map((e) => (
            <button key={e.id} onClick={() => setSelectedEngId(e.id)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${selectedEngId === e.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
              {e.clientName}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Budget", value: `$${totalBudget.toLocaleString()}`, icon: Target, color: "text-primary" },
            { label: "Total Spent", value: `$${totalSpent.toLocaleString()}`, icon: DollarSign, color: "text-foreground" },
            { label: "Burn Rate", value: `${(burnPct * 100).toFixed(1)}%`, icon: Flame, color: burnPct > 0.85 ? "text-red-400" : burnPct > 0.65 ? "text-amber-400" : "text-[#00D4AA]" },
            { label: "Alerts", value: alerting.length, icon: AlertTriangle, color: alerting.length > 0 ? "text-amber-400" : "text-muted-foreground" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <Icon size={20} className={color} />
                <div>
                  <div className="text-lg font-bold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alerts */}
        {alerting.length > 0 && (
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-medium mb-1">
              <AlertTriangle size={13} /> Budget threshold alerts
            </div>
            {alerting.map((m) => (
              <div key={m.id} className="text-xs text-amber-400/80 ml-5">
                {m.label}: ${m.spentToDate.toLocaleString()} / ${m.amount.toLocaleString()} ({((m.spentToDate / m.amount) * 100).toFixed(0)}%)
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar chart */}
          <Card className="border-border lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" /> Budget vs Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barGap={2}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
                    <Tooltip contentStyle={{ background: "hsl(217, 43%, 15%)", border: "1px solid hsl(215, 35%, 22%)", borderRadius: 6, fontSize: 11 }} />
                    <Bar dataKey="budget" fill="hsl(211, 60%, 45%)" opacity={0.4} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="spent" radius={[2, 2, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.alert ? "#f97316" : "#00D4AA"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No milestones yet</div>
              )}
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button size="sm" variant="forge" onClick={() => setShowForm(true)} disabled={!selectedEngId} className="flex-1">
                <Plus size={12} className="mr-1" /> Add Milestone
              </Button>
              <Button size="sm" variant="outline" onClick={load} disabled={loading}>
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              </Button>
            </div>
            {!selectedEngId && <p className="text-[10px] text-muted-foreground">Select an engagement to add milestones.</p>}

            {showForm && (
              <Card className="border-primary/30">
                <CardContent className="p-3 space-y-2">
                  <input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} placeholder="Milestone label *" className="w-full h-8 px-2 text-xs rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  <input value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} type="number" placeholder="Amount ($) *" className="w-full h-8 px-2 text-xs rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  <input value={form.gateNumber} onChange={(e) => setForm((p) => ({ ...p, gateNumber: e.target.value }))} type="number" placeholder="Gate # (optional)" className="w-full h-8 px-2 text-xs rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  <div className="flex gap-1">
                    <Button size="sm" variant="forge" onClick={addMilestone} disabled={saving || !form.label || !form.amount} className="flex-1 text-xs h-7">{saving ? "Saving…" : "Save"}</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="text-xs h-7">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Milestone table */}
        <div className="space-y-2">
          {milestones.map((m) => {
            const burnRatio = m.spentToDate / m.amount;
            const isAlert = burnRatio >= m.alertThreshold;
            return (
              <div key={m.id} className={`p-4 rounded-lg border ${isAlert ? "border-amber-500/20 bg-amber-500/5" : "border-border bg-card"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{m.label}</span>
                    {m.gateNumber != null && <Badge variant="outline" className="text-[10px] h-4">Gate {m.gateNumber}</Badge>}
                    {m.completedAt && <CheckCircle2 size={12} className="text-[#00D4AA]" />}
                    {isAlert && <AlertTriangle size={12} className="text-amber-400" />}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-foreground">${m.spentToDate.toLocaleString()} <span className="text-muted-foreground font-normal">/ ${m.amount.toLocaleString()}</span></div>
                    <div className="text-[10px] text-muted-foreground">{(burnRatio * 100).toFixed(0)}% used</div>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, burnRatio * 100)}%`, backgroundColor: isAlert ? "#f97316" : "#00D4AA" }}
                  />
                </div>
              </div>
            );
          })}
          {milestones.length === 0 && !loading && (
            <div className="text-center py-8 text-sm text-muted-foreground">No budget milestones. Select an engagement and add one.</div>
          )}
        </div>
      </div>
    </div>
  );
}

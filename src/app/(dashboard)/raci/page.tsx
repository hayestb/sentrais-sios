"use client";
import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Users, Shield, Brain, RefreshCw, Plus, CheckCircle2, AlertTriangle,
  UserCheck, ChevronDown,
} from "lucide-react";

interface RaciRow {
  id: string;
  roleId: string;
  displayName: string;
  email: string | null;
  raciRole: "responsible" | "accountable" | "consulted" | "informed";
  phase: string | null;
  decisionAuthority: string | null;
  boundary: string | null;
  aiCounterpart: string | null;
  active: boolean;
}

interface Engagement {
  id: string;
  clientName: string;
  vertical: string;
  currentGate: number;
}

const RACI_CONFIG = {
  responsible: { label: "Responsible", color: "text-[#0EA5E9]", bg: "bg-[#0EA5E9]/10 border-[#0EA5E9]/20", short: "R" },
  accountable: { label: "Accountable", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20", short: "A" },
  consulted: { label: "Consulted", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", short: "C" },
  informed: { label: "Informed", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", short: "I" },
};

const PHASES = ["discover", "diagnose", "design", "deploy", "debrief"];
const RACI_ROLES = ["responsible", "accountable", "consulted", "informed"] as const;

export default function RaciPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [selectedEng, setSelectedEng] = useState<Engagement | null>(null);
  const [raciRows, setRaciRows] = useState<RaciRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRole, setNewRole] = useState({
    displayName: "",
    email: "",
    raciRole: "responsible" as const,
    phase: "",
    decisionAuthority: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/engagements")
      .then((r) => r.json())
      .then((d) => {
        const engs = d.engagements ?? [];
        setEngagements(engs);
        if (engs.length > 0) setSelectedEng(engs[0]);
      });
  }, []);

  const fetchRaci = useCallback(async () => {
    if (!selectedEng) return;
    setLoading(true);
    const res = await fetch(`/api/engagements/${selectedEng.id}/raci`);
    const data = await res.json();
    setRaciRows(data.raci ?? []);
    setLoading(false);
  }, [selectedEng]);

  useEffect(() => {
    fetchRaci();
  }, [fetchRaci]);

  const addRaciRow = async () => {
    if (!selectedEng || !newRole.displayName) return;
    setSaving(true);
    await fetch(`/api/engagements/${selectedEng.id}/raci`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newRole,
        roleId: newRole.displayName.toLowerCase().replace(/\s+/g, "_"),
        phase: newRole.phase || null,
      }),
    });
    setNewRole({ displayName: "", email: "", raciRole: "responsible", phase: "", decisionAuthority: "" });
    setShowAddForm(false);
    setSaving(false);
    fetchRaci();
  };

  // Group by phase for the matrix view
  const byPhase = PHASES.reduce<Record<string, RaciRow[]>>((acc, p) => {
    acc[p] = raciRows.filter((r) => r.phase === p || !r.phase);
    return acc;
  }, {});

  const coverage = RACI_ROLES.reduce((acc, role) => {
    acc[role] = raciRows.filter((r) => r.raciRole === role && r.active).length;
    return acc;
  }, {} as Record<string, number>);

  const coverageScore = coverage.accountable > 0 && coverage.responsible > 0 ? 100 : 50;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="RACI Matrix"
        subtitle="Role governance · Accountability mapping · Phase-level decision authority"
      />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Engagement Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-muted-foreground">Engagement:</span>
          {engagements.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedEng(e)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                selectedEng?.id === e.id
                  ? "border-[#0EA5E9]/50 bg-[#0EA5E9]/10 text-[#0EA5E9]"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {e.clientName}
            </button>
          ))}
          {engagements.length === 0 && (
            <span className="text-xs text-muted-foreground">
              No engagements — <Link href="/engagements" className="text-[#0EA5E9] hover:underline">create one first</Link>
            </span>
          )}
        </div>

        {/* Coverage Scorecard */}
        <div className="grid grid-cols-4 gap-3">
          {RACI_ROLES.map((role) => {
            const cfg = RACI_CONFIG[role];
            return (
              <div key={role} className={`p-4 rounded-lg border ${cfg.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                  <span className={`text-lg font-bold font-mono ${cfg.color}`}>{cfg.short}</span>
                </div>
                <div className={`text-2xl font-bold ${cfg.color}`}>{coverage[role] ?? 0}</div>
                <div className="text-[10px] text-muted-foreground">
                  {coverage[role] > 0 ? "assigned" : "unassigned"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Gate 0 Compliance Banner */}
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
          coverageScore === 100 ? "border-green-500/30 bg-green-500/5" : "border-amber-400/30 bg-amber-400/5"
        }`}>
          {coverageScore === 100 ? (
            <CheckCircle2 size={16} className="text-green-400 shrink-0" />
          ) : (
            <AlertTriangle size={16} className="text-amber-400 shrink-0" />
          )}
          <div className="flex-1 text-xs">
            <span className={coverageScore === 100 ? "text-green-400 font-medium" : "text-amber-400 font-medium"}>
              Gate 0 RACI Coverage: {coverageScore}%
            </span>
            <span className="text-muted-foreground ml-2">
              {coverageScore === 100
                ? "Accountable and Responsible roles are both assigned — Gate 0 eligible."
                : "Gate 0 requires at least one Accountable and one Responsible role to be assigned."}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* RACI Table */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users size={14} className="text-muted-foreground" />
                    Role Assignments
                  </CardTitle>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="h-7 px-3 text-[10px] rounded border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 text-[#0EA5E9] hover:bg-[#0EA5E9]/20 transition-colors flex items-center gap-1"
                  >
                    <Plus size={10} />
                    Add Role
                  </button>
                </div>
              </CardHeader>

              {showAddForm && (
                <CardContent className="pt-0 pb-4">
                  <div className="p-3 rounded-lg border border-[#0EA5E9]/20 bg-[#0EA5E9]/5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">Name / Role Title</label>
                        <input
                          value={newRole.displayName}
                          onChange={(e) => setNewRole((p) => ({ ...p, displayName: e.target.value }))}
                          placeholder="e.g. Project Sponsor"
                          className="w-full h-7 px-2 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">Email (optional)</label>
                        <input
                          value={newRole.email}
                          onChange={(e) => setNewRole((p) => ({ ...p, email: e.target.value }))}
                          placeholder="name@company.com"
                          className="w-full h-7 px-2 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]/50"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">RACI Role</label>
                        <select
                          value={newRole.raciRole}
                          onChange={(e) => setNewRole((p) => ({ ...p, raciRole: e.target.value as typeof newRole.raciRole }))}
                          className="w-full h-7 px-2 text-xs bg-background border border-border rounded focus:outline-none"
                        >
                          {RACI_ROLES.map((r) => (
                            <option key={r} value={r}>{RACI_CONFIG[r].label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">Phase (optional)</label>
                        <select
                          value={newRole.phase}
                          onChange={(e) => setNewRole((p) => ({ ...p, phase: e.target.value }))}
                          className="w-full h-7 px-2 text-xs bg-background border border-border rounded focus:outline-none"
                        >
                          <option value="">All Phases</option>
                          {PHASES.map((ph) => (
                            <option key={ph} value={ph}>{ph.charAt(0).toUpperCase() + ph.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">Decision Authority</label>
                        <input
                          value={newRole.decisionAuthority}
                          onChange={(e) => setNewRole((p) => ({ ...p, decisionAuthority: e.target.value }))}
                          placeholder="e.g. Budget approval"
                          className="w-full h-7 px-2 text-xs bg-background border border-border rounded focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="h-7 px-3 text-[10px] rounded border border-border text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addRaciRow}
                        disabled={saving || !newRole.displayName}
                        className="h-7 px-4 text-[10px] rounded bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90 disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Add Role"}
                      </button>
                    </div>
                  </div>
                </CardContent>
              )}

              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">
                    <RefreshCw size={12} className="animate-spin mr-2" /> Loading RACI…
                  </div>
                ) : raciRows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-28 text-center px-6">
                    <UserCheck size={20} className="text-muted-foreground mb-2 opacity-30" />
                    <p className="text-xs text-muted-foreground">
                      No RACI assignments yet. The Governance Agent auto-populates this on Sprint Day 1.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        {["Role", "RACI", "Phase", "Authority", "AI Counterpart"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {raciRows.map((row) => {
                        const cfg = RACI_CONFIG[row.raciRole];
                        return (
                          <tr key={row.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-foreground">{row.displayName}</div>
                              {row.email && <div className="text-[10px] text-muted-foreground">{row.email}</div>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color}`}>
                                {cfg.short} · {cfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground capitalize">
                              {row.phase ?? "All"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {row.decisionAuthority ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {row.aiCounterpart ?? "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Phase Matrix Summary */}
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain size={14} className="text-purple-400" />
                  Phase Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {PHASES.map((phase) => {
                    const phaseRows = raciRows.filter((r) => r.phase === phase || !r.phase);
                    const hasAccountable = phaseRows.some((r) => r.raciRole === "accountable");
                    const hasResponsible = phaseRows.some((r) => r.raciRole === "responsible");
                    const complete = hasAccountable && hasResponsible;
                    return (
                      <div key={phase} className="flex items-center gap-2 p-2 rounded border border-border">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          complete ? "bg-green-500/20 text-green-400" : "bg-amber-400/20 text-amber-400"
                        }`}>
                          {phase[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs capitalize text-foreground">{phase}</div>
                          <div className="text-[10px] text-muted-foreground">{phaseRows.length} roles</div>
                        </div>
                        {complete ? (
                          <CheckCircle2 size={12} className="text-green-400" />
                        ) : (
                          <AlertTriangle size={12} className="text-amber-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield size={14} className="text-amber-400" />
                  RACI Reference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  {RACI_ROLES.map((role) => {
                    const cfg = RACI_CONFIG[role];
                    return (
                      <div key={role} className="flex items-start gap-2">
                        <span className={`font-bold ${cfg.color} w-4 shrink-0`}>{cfg.short}</span>
                        <div>
                          <span className="text-foreground">{cfg.label}</span>
                          <p className="text-[10px] text-muted-foreground leading-snug">
                            {role === "responsible" && "Does the work. Can be delegated."}
                            {role === "accountable" && "Owns the outcome. One per task."}
                            {role === "consulted" && "Two-way communication. Expertise input."}
                            {role === "informed" && "One-way update. Needs to know."}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

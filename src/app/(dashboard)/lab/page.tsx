"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lightbulb, FlaskConical, Rocket, CheckCircle2, ArrowRight,
  Plus, RefreshCw, Tag, TrendingUp, Zap,
} from "lucide-react";

type IPhase = "i1_capture" | "i2_feasibility" | "i3_lab" | "i4_prototype" | "i5_validation" | "i6_scale";

interface InnovationIdea {
  id: string;
  title: string;
  description: string | null;
  phase: IPhase;
  status: string;
  submittedBy: string | null;
  vertical: string | null;
  ninTag: string | null;
  feasibilityScore: number | null;
  impactScore: number | null;
  effortScore: number | null;
  tags: string[];
  engagementId: string | null;
  createdAt: string;
}

const PHASES: { key: IPhase; label: string; desc: string; icon: React.ElementType; color: string; bg: string }[] = [
  { key: "i1_capture", label: "I1 — Idea Capture", desc: "Submit and triage innovation signals", icon: Lightbulb, color: "text-amber-400", bg: "border-amber-400/20 bg-amber-400/5" },
  { key: "i2_feasibility", label: "I2 — Feasibility", desc: "Score impact, effort, and strategic fit", icon: CheckCircle2, color: "text-primary", bg: "border-primary/20 bg-primary/5" },
  { key: "i3_lab", label: "I3 — Lab Design", desc: "Research zone — structured exploration", icon: FlaskConical, color: "text-purple-400", bg: "border-purple-400/20 bg-purple-400/5" },
  { key: "i4_prototype", label: "I4 — Prototype", desc: "Build and iterate rapidly", icon: Zap, color: "text-orange-400", bg: "border-orange-400/20 bg-orange-400/5" },
  { key: "i5_validation", label: "I5 — Validation", desc: "Test with real constraints and users", icon: TrendingUp, color: "text-[#00D4AA]", bg: "border-[#00D4AA]/20 bg-[#00D4AA]/5" },
  { key: "i6_scale", label: "I6 — Scale", desc: "Platform Factory — promote to live engagement", icon: Rocket, color: "text-green-400", bg: "border-green-400/20 bg-green-400/5" },
];

export default function LabPage() {
  const [ideas, setIdeas] = useState<InnovationIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activePhase, setActivePhase] = useState<IPhase>("i1_capture");
  const [form, setForm] = useState({ title: "", description: "", vertical: "", submittedBy: "", tags: "" });
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/innovation");
    const data = await res.json();
    setIdeas(data.ideas ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addIdea = async () => {
    if (!form.title) return;
    setSaving(true);
    await fetch("/api/innovation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description || undefined,
        phase: activePhase,
        vertical: form.vertical || undefined,
        submittedBy: form.submittedBy || undefined,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      }),
    });
    await load();
    setShowForm(false);
    setForm({ title: "", description: "", vertical: "", submittedBy: "", tags: "" });
    setSaving(false);
  };

  const moveIdea = async (id: string, phase: IPhase) => {
    setIdeas((prev) => prev.map((i) => i.id === id ? { ...i, phase } : i));
    await fetch("/api/innovation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, phase }),
    });
  };

  const byPhase = (phase: IPhase) => ideas.filter((i) => i.phase === phase);

  return (
    <div className="flex flex-col h-full">
      <Header title="Lab Environment" subtitle="Innovation Ecosystem · I1–I6 dual-track lifecycle · NIN Tag system" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Phase pipeline overview */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {PHASES.map((phase, idx) => {
            const Icon = phase.icon;
            const count = byPhase(phase.key).length;
            return (
              <div key={phase.key} className="flex items-center gap-1">
                <button
                  onClick={() => setActivePhase(phase.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap transition-all ${
                    activePhase === phase.key ? phase.bg + " " + phase.color : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={12} />
                  {phase.label}
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activePhase === phase.key ? "bg-current/20" : "bg-secondary"}`}>
                      {count}
                    </span>
                  )}
                </button>
                {idx < PHASES.length - 1 && <ArrowRight size={12} className="text-muted-foreground shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Active phase detail */}
        {(() => {
          const phase = PHASES.find((p) => p.key === activePhase)!;
          const Icon = phase.icon;
          return (
            <div className={`p-4 rounded-xl border ${phase.bg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon size={20} className={phase.color} />
                  <div>
                    <div className={`text-sm font-semibold ${phase.color}`}>{phase.label}</div>
                    <div className="text-xs text-muted-foreground">{phase.desc}</div>
                  </div>
                </div>
                <Button size="sm" variant="forge" onClick={() => setShowForm(true)}>
                  <Plus size={12} className="mr-1" /> Add Idea
                </Button>
              </div>
            </div>
          );
        })()}

        {/* Add form */}
        {showForm && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Idea title *" className="w-full h-9 px-3 text-sm rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} className="w-full px-3 py-2 text-sm rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
              <div className="grid grid-cols-3 gap-2">
                <input value={form.vertical} onChange={(e) => setForm((p) => ({ ...p, vertical: e.target.value }))} placeholder="Vertical" className="h-8 px-2 text-xs rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <input value={form.submittedBy} onChange={(e) => setForm((p) => ({ ...p, submittedBy: e.target.value }))} placeholder="Submitted by" className="h-8 px-2 text-xs rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} placeholder="Tags (comma-sep)" className="h-8 px-2 text-xs rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="forge" onClick={addIdea} disabled={saving || !form.title}>{saving ? "Saving…" : "Submit Idea"}</Button>
                <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Board: horizontal pipeline */}
        <div className="grid grid-cols-3 xl:grid-cols-6 gap-3">
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            const phaseIdeas = byPhase(phase.key);
            return (
              <div
                key={phase.key}
                className={`rounded-lg border p-2 space-y-2 min-h-[120px] ${phase.key === activePhase ? phase.bg : "border-border bg-card/30"}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragging) moveIdea(dragging, phase.key);
                  setDragging(null);
                }}
              >
                <div className="flex items-center gap-1 px-1">
                  <Icon size={10} className={phase.color} />
                  <span className={`text-[9px] font-bold uppercase tracking-wide ${phase.color}`}>
                    {phase.key.replace("_", " ").toUpperCase()}
                  </span>
                  <span className="ml-auto text-[9px] text-muted-foreground">{phaseIdeas.length}</span>
                </div>

                {phaseIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    draggable
                    onDragStart={() => setDragging(idea.id)}
                    onDragEnd={() => setDragging(null)}
                    className={`p-2 rounded border border-border bg-card cursor-grab active:cursor-grabbing text-xs space-y-1 transition-opacity ${dragging === idea.id ? "opacity-40" : ""}`}
                  >
                    <div className="font-medium text-foreground leading-snug text-[11px]">{idea.title}</div>
                    {idea.ninTag && (
                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-mono">
                        <Tag size={7} /> {idea.ninTag}
                      </div>
                    )}
                    {idea.tags && idea.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {idea.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[8px] px-1 rounded bg-secondary text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                    )}
                    {(idea.feasibilityScore != null || idea.impactScore != null) && (
                      <div className="flex gap-2 text-[9px] text-muted-foreground">
                        {idea.impactScore != null && <span>Impact: {idea.impactScore}</span>}
                        {idea.feasibilityScore != null && <span>Feasibility: {idea.feasibilityScore}</span>}
                      </div>
                    )}
                  </div>
                ))}

                {phaseIdeas.length === 0 && (
                  <div className="flex items-center justify-center py-4 text-[9px] text-muted-foreground/40 border border-dashed border-border/30 rounded">
                    Drop here
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* NIN Tag legend */}
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Tag size={12} /> <span className="font-medium text-foreground">NIN Tag System</span>
              <span>— auto-generated canonical IDs: ZONE-MODEL-PHASE-[ID]</span>
            </div>
            <div className="flex gap-3 flex-wrap text-[10px]">
              {ideas.filter((i) => i.ninTag).slice(0, 6).map((i) => (
                <code key={i.id} className="px-2 py-0.5 rounded bg-secondary text-primary font-mono">{i.ninTag}</code>
              ))}
              {ideas.filter((i) => i.ninTag).length === 0 && (
                <span className="text-muted-foreground">NIN tags auto-generated when ideas are created</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

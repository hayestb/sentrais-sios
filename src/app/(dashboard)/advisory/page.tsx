"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain, CheckCircle2, AlertTriangle, Loader2, Zap,
  BookOpen, Lock, ExternalLink, TrendingUp, Target,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from "recharts";

// ── Spec: 5 dimensions, 1.0–5.0 maturity scale ────────────────────────────

const BLUEPRINT360_DIMENSIONS = [
  {
    key: "strategic_alignment",
    label: "Strategic Alignment",
    weight: 25,
    description: "Executive sponsorship, board visibility, strategic roadmap integration",
    levels: ["No strategy", "Ad hoc", "Defined", "Managed", "Optimising"],
  },
  {
    key: "operational_readiness",
    label: "Operational Readiness",
    weight: 25,
    description: "Process documentation, SOP coverage, workflow maturity, exception handling",
    levels: ["Chaotic", "Reactive", "Proactive", "Predictive", "Autonomous"],
  },
  {
    key: "technology_maturity",
    label: "Technology Maturity",
    weight: 20,
    description: "System inventory, integration readiness, data architecture, API coverage",
    levels: ["Legacy", "Transitioning", "Standardised", "Integrated", "Intelligent"],
  },
  {
    key: "change_capacity",
    label: "Change Capacity",
    weight: 20,
    description: "Adoption readiness, training bandwidth, resistance mapping, cultural openness",
    levels: ["Resistant", "Reluctant", "Accepting", "Supportive", "Champion"],
  },
  {
    key: "risk_profile",
    label: "Risk Profile",
    weight: 10,
    description: "BCP coverage, security posture, redundancy, recovery time objectives",
    levels: ["Critical", "High", "Moderate", "Low", "Negligible"],
  },
];

const GATE2_THRESHOLD = 3.5; // weighted average ≥ 3.5 for Gate 2 eligibility

const MATURITY_COLORS = [
  "#ef4444", // 1 — red
  "#f97316", // 2 — orange
  "#eab308", // 3 — amber
  "#22c55e", // 4 — green
  "#00D4AA", // 5 — accent
];

interface Engagement {
  id: string;
  clientName: string;
  vertical: string;
  currentGate: number;
  contractValue: number;
}

function ConicScoreRing({ score, max = 5 }: { score: number; max?: number }) {
  const pct = Math.min(100, (score / max) * 100);
  const color = score >= 4 ? "#00D4AA" : score >= 3 ? "#22c55e" : score >= 2 ? "#eab308" : "#ef4444";
  const bg = "hsl(215, 35%, 18%)";
  return (
    <div
      className="relative w-32 h-32 rounded-full flex items-center justify-center"
      style={{
        background: `conic-gradient(${color} ${pct}%, ${bg} ${pct}%)`,
      }}
    >
      <div className="w-24 h-24 rounded-full bg-card flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{score.toFixed(1)}</span>
        <span className="text-[10px] text-muted-foreground">/ 5.0</span>
      </div>
    </div>
  );
}

function HeatmapGrid({ scores }: { scores: Record<string, number> }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Maturity Heatmap</div>
      <div className="grid grid-cols-5 gap-1">
        {/* Y-axis labels (5 → 1 top to bottom) */}
        {[5, 4, 3, 2, 1].map((level) => (
          <div key={level} className="contents">
            {BLUEPRINT360_DIMENSIONS.map((d) => {
              const val = scores[d.key] ?? 1;
              const active = Math.round(val) === level;
              const color = MATURITY_COLORS[level - 1];
              return (
                <div
                  key={d.key}
                  className="h-6 rounded-sm flex items-center justify-center text-[9px] font-bold transition-all"
                  style={{
                    backgroundColor: active ? color : "hsl(215, 35%, 20%)",
                    color: active ? "white" : "transparent",
                    opacity: active ? 1 : 0.3,
                  }}
                >
                  {active ? level : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1 mt-1">
        {BLUEPRINT360_DIMENSIONS.map((d) => (
          <div key={d.key} className="text-[8px] text-muted-foreground text-center leading-tight truncate">{d.label.split(" ")[0]}</div>
        ))}
      </div>
    </div>
  );
}

export default function AdvisoryPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null);
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(BLUEPRINT360_DIMENSIONS.map((d) => [d.key, 1]))
  );
  const [running, setRunning] = useState(false);
  const [locking, setLocking] = useState(false);
  const [lockResult, setLockResult] = useState<{ hash: string; gate2Eligible: boolean } | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loadingEngagements, setLoadingEngagements] = useState(true);

  useEffect(() => {
    fetch("/api/engagements")
      .then((r) => r.json())
      .then((data) => {
        setEngagements(data.engagements ?? []);
        if ((data.engagements ?? []).length > 0) setSelectedEngagement(data.engagements[0]);
      })
      .finally(() => setLoadingEngagements(false));
  }, []);

  // Weighted average: sum(score_i * weight_i / 100)
  const weightedAvg = BLUEPRINT360_DIMENSIONS.reduce((total, d) => {
    return total + (scores[d.key] ?? 1) * (d.weight / 100);
  }, 0);

  const resilienceScore = Math.round(weightedAvg * 10) / 10;
  const gate2Eligible = resilienceScore >= GATE2_THRESHOLD;

  const radarData = BLUEPRINT360_DIMENSIONS.map((d) => ({
    subject: d.label.split(" ")[0],
    value: scores[d.key] ?? 1,
    fullMark: 5,
  }));

  const lockAssessment = async () => {
    if (!selectedEngagement) return;
    setLocking(true);
    setLockResult(null);
    try {
      const res = await fetch(`/api/engagements/${selectedEngagement.id}/blueprint360`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores, resilienceScore, approvedBy: "Advisory Team" }),
      });
      const data = await res.json();
      setLockResult({ hash: data.evidenceHash, gate2Eligible: data.gate2Eligible });
    } catch {
      // silently fail
    } finally {
      setLocking(false);
    }
  };

  const runAssessment = async () => {
    if (!selectedEngagement) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/agents/assessment/invoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: "blueprint360_report",
          input: {
            action: "Generate Blueprint360 Gap Analysis Report",
            documentType: "Blueprint360 Gap Analysis",
            engagementId: selectedEngagement.id,
            clientName: selectedEngagement.clientName,
            scores,
            resilienceScore,
            scale: "1.0-5.0",
            gate2Threshold: GATE2_THRESHOLD,
          },
          engagementId: selectedEngagement.id,
        }),
      });
      const data = await res.json();
      const output = data.result?.output;
      setResult(output?.body ?? output?.summary ?? JSON.stringify(output, null, 2).slice(0, 1000));
    } catch {
      setResult("Failed to invoke Assessment Agent.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Advisory — Blueprint360"
        subtitle="Assessment Agent · Maturity scoring (1.0–5.0) · Gap analysis · Gate 2 eligibility"
      />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Engagement selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Active Engagement:</span>
          {loadingEngagements ? (
            <Loader2 size={14} className="animate-spin text-muted-foreground" />
          ) : engagements.length === 0 ? (
            <span className="text-xs text-muted-foreground">No engagements — <a href="/engagements" className="text-primary hover:underline">create one first</a></span>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {engagements.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelectedEngagement(e)}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    selectedEngagement?.id === e.id
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {e.clientName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Score Hero */}
        <div className={`p-5 rounded-xl border ${gate2Eligible ? "border-[#00D4AA]/30 bg-[#00D4AA]/5" : "border-border bg-card"}`}>
          <div className="flex items-center gap-8">
            <ConicScoreRing score={resilienceScore} />
            <div className="flex-1">
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Overall Resilience Score</div>
              <div className="text-4xl font-bold" style={{ color: resilienceScore >= 4 ? "#00D4AA" : resilienceScore >= 3 ? "#22c55e" : resilienceScore >= 2 ? "#eab308" : "#ef4444" }}>
                {resilienceScore.toFixed(1)} <span className="text-lg text-muted-foreground font-normal">/ 5.0</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Gate 2 requires ≥{GATE2_THRESHOLD} weighted average across 5 dimensions
              </div>
              <div className="mt-3 flex items-center gap-2">
                {gate2Eligible ? (
                  <Badge className="gap-1 border-[#00D4AA]/30 bg-[#00D4AA]/10 text-[#00D4AA]">
                    <CheckCircle2 size={10} /> Gate 2 Eligible
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 border-amber-500/30 text-amber-400">
                    <AlertTriangle size={10} /> {(GATE2_THRESHOLD - resilienceScore).toFixed(1)} below threshold
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {selectedEngagement ? selectedEngagement.clientName : "No engagement selected"}
                </span>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="w-48 h-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(215, 35%, 22%)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "hsl(215, 20%, 55%)" }} />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke={gate2Eligible ? "#00D4AA" : "#2E75B6"}
                    fill={gate2Eligible ? "#00D4AA" : "#2E75B6"}
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{ background: "hsl(217, 43%, 15%)", border: "1px solid hsl(215, 35%, 22%)", borderRadius: 6, fontSize: 11 }}
                    formatter={(v: number) => [`${v.toFixed(1)} / 5`, "Score"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dimension Scorers */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Blueprint360 Dimensions — Maturity 1.0 → 5.0
            </div>
            {BLUEPRINT360_DIMENSIONS.map((d) => {
              const val = scores[d.key] ?? 1;
              const color = MATURITY_COLORS[Math.round(val) - 1];
              const levelLabel = d.levels[Math.round(val) - 1];

              return (
                <Card key={d.key} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{d.label}</span>
                            <span className="text-[10px] text-muted-foreground">×{d.weight}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium" style={{ color, borderColor: color + "40", backgroundColor: color + "15" }}>
                              {levelLabel}
                            </span>
                            <span className="text-lg font-bold font-mono" style={{ color }}>{val.toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-3">{d.description}</p>

                        {/* Level buttons 1-5 */}
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={() => setScores((p) => ({ ...p, [d.key]: level }))}
                              className="flex-1 h-8 rounded text-xs font-semibold transition-all"
                              style={{
                                backgroundColor: Math.round(val) === level ? MATURITY_COLORS[level - 1] : "hsl(215, 35%, 20%)",
                                color: Math.round(val) === level ? "white" : "hsl(215, 20%, 55%)",
                                border: `1px solid ${Math.round(val) === level ? MATURITY_COLORS[level - 1] : "hsl(215, 35%, 22%)"}`,
                              }}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-1 mt-0.5">
                          {d.levels.map((l) => (
                            <span key={l} className="flex-1 text-center text-[8px] text-muted-foreground leading-tight">{l}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Heatmap */}
            <Card className="border-border">
              <CardContent className="p-4">
                <HeatmapGrid scores={scores} />
              </CardContent>
            </Card>

            {/* Score Summary */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target size={14} className="text-primary" />
                  Score Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {BLUEPRINT360_DIMENSIONS.map((d) => {
                    const val = scores[d.key] ?? 1;
                    const contribution = Math.round(val * (d.weight / 100) * 10) / 10;
                    const color = MATURITY_COLORS[Math.round(val) - 1];
                    return (
                      <div key={d.key} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate max-w-[120px]">{d.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono w-8 text-right" style={{ color }}>{val.toFixed(1)}</span>
                          <span className="text-muted-foreground w-10 text-right text-[10px]">+{contribution}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-border flex justify-between text-sm font-bold">
                    <span>Resilience Score</span>
                    <span style={{ color: gate2Eligible ? "#00D4AA" : "#eab308" }}>{resilienceScore.toFixed(1)}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">Threshold: ≥{GATE2_THRESHOLD} for Gate 2</div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap size={14} className="text-amber-400" />
                  Assessment Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="forge"
                  size="sm"
                  className="w-full gap-2"
                  disabled={running || !selectedEngagement}
                  onClick={runAssessment}
                >
                  {running ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} />}
                  {running ? "Generating…" : "Generate Gap Analysis"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  disabled={locking || !selectedEngagement || resilienceScore <= 1}
                  onClick={lockAssessment}
                >
                  {locking ? <Loader2 size={12} className="animate-spin" /> : <Lock size={12} />}
                  {locking ? "Locking…" : "Lock Assessment to Ledger"}
                </Button>
                <p className="text-[10px] text-muted-foreground">
                  Locks maturity scores (1.0–5.0 scale) to the immutable Evidence Ledger with SHA-256 hash. Required before Gate 2 advancement.
                </p>
                {lockResult && (
                  <div className={`p-2 rounded border text-[10px] ${lockResult.gate2Eligible ? "border-[#00D4AA]/20 bg-[#00D4AA]/5 text-[#00D4AA]" : "border-amber-400/20 bg-amber-400/5 text-amber-400"}`}>
                    <div className="flex items-center gap-1 mb-1">
                      <CheckCircle2 size={10} />
                      <span className="font-medium">Locked to Evidence Ledger</span>
                    </div>
                    <div className="font-mono text-[9px] opacity-70 break-all">{lockResult.hash}</div>
                    <a href="/ledger" className="flex items-center gap-1 mt-1.5 hover:underline">
                      <ExternalLink size={9} /> View in Evidence Ledger
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {result && (
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-1.5">
                    <BookOpen size={12} className="text-primary" />
                    Assessment Output
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-foreground whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed bg-secondary/30 rounded p-3 border border-border">
                    {result}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

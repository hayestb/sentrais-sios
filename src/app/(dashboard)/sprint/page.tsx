"use client";
import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar, CheckCircle2, Play, Zap, Bot, Clock, RefreshCw,
  Users, Shield, Brain, Activity, AlertTriangle, ChevronRight,
} from "lucide-react";

interface Engagement {
  id: string;
  clientName: string;
  vertical: string;
  status: string;
  sprintNumber: number;
  currentGate: number;
}

interface Sprint {
  id: string;
  engagementId: string;
  sprintNumber: number;
  startDate: string;
  endDate: string;
  completedAt: string | null;
}

interface SprintSchedule {
  events: { day: number; type: string; label: string; date: string; agents: string[] }[];
}

interface TriggerResult {
  agent: string;
  status: string;
  summary?: string;
}

const DAY_CONFIG: Record<number, {
  label: string;
  type: string;
  color: string;
  bg: string;
  agents: { name: string; action: string; icon: React.ElementType }[];
  automated: boolean;
}> = {
  1: {
    label: "Sprint Kickoff · Huddle",
    type: "huddle",
    color: "text-[#0EA5E9]",
    bg: "bg-[#0EA5E9]/10 border-[#0EA5E9]/20",
    agents: [{ name: "Governance Agent", action: "Reset RACI Matrix → Sprint Buckets", icon: Shield }],
    automated: true,
  },
  3: {
    label: "Tech Sync",
    type: "tech_sync",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
    agents: [
      { name: "Architecture Agent", action: "Technical alignment + state machines", icon: Brain },
      { name: "Delivery Agent", action: "Sprint bucket allocation + backlog sync", icon: Activity },
    ],
    automated: true,
  },
  5: {
    label: "Mid-Sprint Check",
    type: "midpoint",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
    agents: [{ name: "Risk Agent", action: "Mid-sprint risk register update", icon: AlertTriangle }],
    automated: true,
  },
  9: {
    label: "QA Review",
    type: "qa_review",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
    agents: [{ name: "QA Agent", action: "Hard block validation scan", icon: CheckCircle2 }],
    automated: true,
  },
  10: {
    label: "Retrospective · SIPE Update",
    type: "retrospective",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    agents: [{ name: "Learning Agent", action: "Ingest sprint data → SIPE intelligence update", icon: Brain }],
    automated: true,
  },
};

export default function SprintPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [selectedEng, setSelectedEng] = useState<Engagement | null>(null);
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [schedule, setSchedule] = useState<SprintSchedule | null>(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [allSprints, setAllSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [triggering, setTriggering] = useState<number | null>(null);
  const [triggerResults, setTriggerResults] = useState<Record<number, TriggerResult[]>>({});

  useEffect(() => {
    fetch("/api/engagements")
      .then((r) => r.json())
      .then((d) => {
        const engs = d.engagements ?? [];
        setEngagements(engs);
        const active = engs.find((e: Engagement) => e.status === "active") ?? engs[0];
        if (active) setSelectedEng(active);
      });
  }, []);

  const fetchSprint = useCallback(async () => {
    if (!selectedEng) return;
    setLoading(true);
    const res = await fetch(`/api/sprint?engagementId=${selectedEng.id}`);
    const data = await res.json();
    setSprint(data.activeSprint ?? null);
    setSchedule(data.schedule ?? null);
    setCurrentDay(data.currentDay ?? 0);
    setAllSprints(data.sprints ?? []);
    setLoading(false);
  }, [selectedEng]);

  useEffect(() => {
    fetchSprint();
  }, [fetchSprint]);

  const startSprint = async () => {
    if (!selectedEng) return;
    setStarting(true);
    const res = await fetch("/api/sprint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ engagementId: selectedEng.id }),
    });
    if (res.ok) await fetchSprint();
    setStarting(false);
  };

  const triggerDay = async (day: number) => {
    if (!sprint) return;
    setTriggering(day);
    const res = await fetch("/api/sprint/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sprintId: sprint.id, day }),
    });
    const data = await res.json();
    setTriggerResults((prev) => ({ ...prev, [day]: data.triggered ?? [] }));
    setTriggering(null);
  };

  const automatedDays = Object.keys(DAY_CONFIG).map(Number);
  const allDays = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Sprint Master Calendar"
        subtitle="Two-week operational cadence · Agent automation triggers · Maximum throughput"
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
              {e.clientName} · Sprint {e.sprintNumber}
            </button>
          ))}
        </div>

        {/* Active Sprint Banner or Start */}
        {sprint ? (
          <div className="flex items-center gap-4 p-5 rounded-lg border border-[#0EA5E9]/30 bg-[#0EA5E9]/5">
            <Calendar size={20} className="text-[#0EA5E9] shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#0EA5E9]">
                Sprint {sprint.sprintNumber} — Active
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {new Date(sprint.startDate).toLocaleDateString()} → {new Date(sprint.endDate).toLocaleDateString()} ·
                Day {currentDay} of 10
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-32 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#0EA5E9] transition-all"
                  style={{ width: `${Math.min(100, (currentDay / 10) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-[#0EA5E9] font-mono">{currentDay}/10</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 p-5 rounded-lg border border-dashed border-border">
            <Calendar size={20} className="text-muted-foreground shrink-0" />
            <div className="flex-1">
              <div className="text-sm text-foreground">No active sprint</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Start a new sprint to initialize the 10-day cadence and fire the Governance Agent.
              </p>
            </div>
            <Button
              variant="forge"
              size="sm"
              className="gap-2 shrink-0"
              onClick={startSprint}
              disabled={starting || !selectedEng}
            >
              {starting ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
              {starting ? "Initializing…" : "Start Sprint"}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 10-Day Timeline with Triggers */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              10-Day Execution Timeline
            </div>
            <div className="grid grid-cols-2 gap-3">
              {allDays.map((day) => {
                const cfg = DAY_CONFIG[day];
                const isPast = day < currentDay;
                const isCurrent = day === currentDay;
                const isFuture = day > currentDay;
                const results = triggerResults[day];

                if (cfg) {
                  return (
                    <div
                      key={day}
                      className={`p-4 rounded-lg border transition-all ${
                        isCurrent ? cfg.bg + " shadow-sm" : isPast ? "border-border bg-secondary/30 opacity-70" : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold font-mono ${isCurrent ? cfg.color : isPast ? "text-green-400" : "text-muted-foreground"}`}>
                              DAY {day}
                            </span>
                            {isPast && <CheckCircle2 size={10} className="text-green-400" />}
                            {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ color: "currentColor" }} />}
                          </div>
                          <div className={`text-xs font-medium mt-0.5 ${isCurrent ? cfg.color : "text-foreground"}`}>
                            {cfg.label}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bot size={11} className="text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{cfg.agents.length}</span>
                        </div>
                      </div>

                      <div className="space-y-1 mb-3">
                        {cfg.agents.map((agent) => {
                          const AgentIcon = agent.icon;
                          return (
                            <div key={agent.name} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                              <AgentIcon size={9} className="mt-0.5 shrink-0" />
                              <span>{agent.action}</span>
                            </div>
                          );
                        })}
                      </div>

                      {results && results.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {results.map((r) => (
                            <div
                              key={r.agent}
                              className={`text-[10px] px-2 py-1 rounded border ${
                                r.status === "completed" ? "border-green-500/20 bg-green-500/5 text-green-400" : "border-red-500/20 bg-red-500/5 text-red-400"
                              }`}
                            >
                              {r.agent}: {r.summary ?? r.status}
                            </div>
                          ))}
                        </div>
                      )}

                      {sprint && (
                        <button
                          onClick={() => triggerDay(day)}
                          disabled={triggering === day}
                          className={`mt-2 w-full h-6 text-[10px] rounded border flex items-center justify-center gap-1 transition-colors ${
                            isCurrent
                              ? `border-current ${cfg.color} bg-current/10 hover:bg-current/20`
                              : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                          }`}
                          style={isCurrent ? {} : {}}
                        >
                          {triggering === day ? (
                            <RefreshCw size={9} className="animate-spin" />
                          ) : (
                            <Zap size={9} />
                          )}
                          {triggering === day ? "Running…" : "Trigger Agents"}
                        </button>
                      )}
                    </div>
                  );
                }

                // Regular execution day
                return (
                  <div
                    key={day}
                    className={`p-3 rounded-lg border flex items-center gap-3 ${
                      isCurrent ? "border-border bg-secondary shadow-sm" : isPast ? "border-border/50 bg-secondary/30 opacity-60" : "border-border/50 bg-card/50"
                    }`}
                  >
                    <div className={`text-[10px] font-bold font-mono w-10 shrink-0 ${isPast ? "text-green-400" : isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                      DAY {day}
                    </div>
                    <div className="flex-1 text-xs text-muted-foreground">Execution</div>
                    {isPast && <CheckCircle2 size={10} className="text-green-400" />}
                    {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bot size={14} className="text-[#0EA5E9]" />
                  Automation Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(DAY_CONFIG).map(([day, cfg]) => (
                    <div key={day} className="flex items-start gap-3 text-xs">
                      <span className={`w-12 shrink-0 font-mono text-[10px] ${cfg.color}`}>Day {day}</span>
                      <div>
                        <div className="text-foreground font-medium">{cfg.label}</div>
                        <div className="text-muted-foreground">
                          {cfg.agents.map((a) => a.name).join(" + ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {allSprints.length > 0 && (
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock size={14} className="text-muted-foreground" />
                    Sprint History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {allSprints.map((s) => {
                      const eng = engagements.find((e) => e.id === s.engagementId);
                      return (
                        <div key={s.id} className="flex items-center justify-between text-xs p-2 rounded border border-border">
                          <div>
                            <div className="font-medium">Sprint {s.sprintNumber}</div>
                            <div className="text-muted-foreground">{eng?.clientName ?? "Unknown"}</div>
                          </div>
                          <div className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            s.completedAt
                              ? "border-green-500/20 bg-green-500/10 text-green-400"
                              : "border-[#0EA5E9]/20 bg-[#0EA5E9]/10 text-[#0EA5E9]"
                          }`}>
                            {s.completedAt ? "Complete" : "Active"}
                          </div>
                        </div>
                      );
                    })}
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

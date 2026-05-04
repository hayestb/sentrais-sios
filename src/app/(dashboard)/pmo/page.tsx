"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity, BarChart3, CheckCircle2, Clock, AlertTriangle, GitBranch,
  Users, Calendar, TrendingUp,
} from "lucide-react";

interface Engagement {
  id: string;
  clientName: string;
  vertical: string;
  status: string;
  currentGate: number;
  currentPhase: string;
  sprintNumber: number;
  contractValue: number;
  createdAt: string;
}

interface RemediationAction {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  engagementId: string | null;
  dueDate: string | null;
}

const GATE_COLORS = ["text-muted-foreground", "text-primary", "text-purple-400", "text-amber-400", "text-red-400", "text-[#00D4AA]"];
const PHASE_LABELS: Record<string, string> = {
  discover: "Discover", diagnose: "Diagnose", design: "Design", deploy: "Deploy", debrief: "Debrief",
};

// Simple Gantt: each engagement is a row, gates are blocks
function GanttRow({ engagement }: { engagement: Engagement }) {
  const gateWidth = 100 / 6;
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      <div className="w-32 shrink-0">
        <div className="text-xs font-medium text-foreground truncate">{engagement.clientName}</div>
        <div className="text-[10px] text-muted-foreground">{PHASE_LABELS[engagement.currentPhase]}</div>
      </div>
      <div className="flex-1 h-6 bg-secondary rounded relative overflow-hidden">
        {/* Completed gates */}
        <div
          className="absolute left-0 top-0 h-full rounded-l transition-all"
          style={{
            width: `${(engagement.currentGate / 5) * 100}%`,
            backgroundColor: "#2E75B6",
            opacity: 0.7,
          }}
        />
        {/* Current position */}
        <div
          className="absolute top-0 h-full w-1 bg-[#00D4AA] rounded"
          style={{ left: `calc(${(engagement.currentGate / 5) * 100}% - 2px)` }}
        />
        {/* Gate markers */}
        {[1, 2, 3, 4, 5].map((g) => (
          <div
            key={g}
            className="absolute top-0 h-full w-px bg-border/60"
            style={{ left: `${(g / 5) * 100}%` }}
          />
        ))}
        {/* Label */}
        <div className="absolute inset-0 flex items-center px-2">
          <span className="text-[9px] text-white/80 font-medium">Gate {engagement.currentGate} / 5</span>
        </div>
      </div>
      <div className="w-16 shrink-0 text-right">
        <Badge className={`text-[9px] h-4 px-1.5 ${
          engagement.status === "active" ? "border-[#00D4AA]/30 bg-[#00D4AA]/10 text-[#00D4AA]" :
          engagement.status === "blocked" ? "border-red-500/30 bg-red-500/10 text-red-400" :
          "border-border bg-secondary text-muted-foreground"
        }`}>{engagement.status}</Badge>
      </div>
    </div>
  );
}

export default function PmoPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [actions, setActions] = useState<RemediationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/engagements"), fetch("/api/remediation")]).then(async ([eRes, rRes]) => {
      const [eData, rData] = await Promise.all([eRes.json(), rRes.json()]);
      setEngagements(eData.engagements ?? []);
      setActions(rData.actions ?? []);
      setLoading(false);
    });
  }, []);

  const active = engagements.filter((e) => e.status === "active");
  const blocked = engagements.filter((e) => e.status === "blocked");
  const myTasks = actions.filter((a) => a.status !== "done");
  const highPriority = myTasks.filter((a) => a.priority === "high");
  const totalPipeline = engagements.reduce((s, e) => s + (e.contractValue ?? 0), 0);

  return (
    <div className="flex flex-col h-full">
      <Header title="PMO Dashboard" subtitle="Cross-engagement health · Gantt timeline · My Tasks · Pipeline view" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Health stats */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Active Engagements", value: active.length, icon: Activity, color: "text-[#00D4AA]" },
            { label: "Blocked", value: blocked.length, icon: AlertTriangle, color: blocked.length > 0 ? "text-red-400" : "text-muted-foreground" },
            { label: "Open Actions", value: myTasks.length, icon: CheckCircle2, color: "text-primary" },
            { label: "High Priority", value: highPriority.length, icon: Clock, color: highPriority.length > 0 ? "text-amber-400" : "text-muted-foreground" },
            { label: "Pipeline Value", value: `$${(totalPipeline / 1000).toFixed(0)}k`, icon: TrendingUp, color: "text-primary" },
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gantt Timeline */}
          <Card className="border-border lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar size={14} className="text-primary" /> Engagement Timeline — Gate Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Gate labels */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-32 shrink-0" />
                <div className="flex-1 flex justify-between text-[9px] text-muted-foreground px-0.5">
                  {["G0", "G1", "G2", "G3", "G4", "G5"].map((g) => <span key={g}>{g}</span>)}
                </div>
                <div className="w-16 shrink-0" />
              </div>

              {engagements.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">No engagements yet.</div>
              ) : (
                <div>
                  {engagements.map((e) => <GanttRow key={e.id} engagement={e} />)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Tasks */}
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-primary" /> Open Actions
                  {myTasks.length > 0 && <Badge variant="outline" className="ml-auto text-[10px] h-4">{myTasks.length}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No open actions.</p>
                ) : (
                  <div className="space-y-2">
                    {myTasks.slice(0, 8).map((action) => {
                      const eng = engagements.find((e) => e.id === action.engagementId);
                      return (
                        <div key={action.id} className={`p-2 rounded border text-xs ${
                          action.priority === "high" ? "border-red-500/20 bg-red-500/5" :
                          action.priority === "medium" ? "border-amber-500/10" : "border-border"
                        }`}>
                          <div className="font-medium text-foreground leading-snug">{action.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {eng && <span className="text-[10px] text-muted-foreground">{eng.clientName}</span>}
                            <Badge variant="outline" className={`text-[9px] h-3.5 px-1 ml-auto ${
                              action.status === "in_progress" ? "border-amber-500/30 text-amber-400" : "border-border text-muted-foreground"
                            }`}>{action.status.replace("_", " ")}</Badge>
                          </div>
                        </div>
                      );
                    })}
                    {myTasks.length > 8 && (
                      <a href="/remediation" className="block text-center text-[10px] text-primary hover:underline">
                        +{myTasks.length - 8} more → Remediation Board
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Engagement Health summary */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 size={14} className="text-primary" /> Engagement Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {engagements.slice(0, 5).map((e) => (
                    <div key={e.id} className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        e.status === "active" ? "bg-[#00D4AA]" :
                        e.status === "blocked" ? "bg-red-400" :
                        e.status === "paused" ? "bg-amber-400" : "bg-muted-foreground"
                      }`} />
                      <span className="flex-1 text-foreground truncate">{e.clientName}</span>
                      <span className="text-muted-foreground text-[10px]">G{e.currentGate} · S{e.sprintNumber}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

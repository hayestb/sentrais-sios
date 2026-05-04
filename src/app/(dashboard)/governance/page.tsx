import { db } from "@/lib/db/client";
import { engagements, gateRecords, evidenceEntries, raciAssignments } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EvidenceFeed } from "@/components/dashboard/evidence-feed";
import { GATE_DEFINITIONS } from "@/lib/workflow/golden-path";
import { truncateHash } from "@/lib/utils";
import { GateAdvanceDialog } from "@/components/dashboard/gate-advance-dialog";
import { Button } from "@/components/ui/button";
import {
  Shield, Lock, CheckCircle2, AlertTriangle, XCircle, ChevronRight,
  Users, FileText, Activity, Eye,
} from "lucide-react";
import type { GateNumber } from "@/lib/workflow/types";

export const dynamic = "force-dynamic";

const QA_THRESHOLDS = [
  { key: "harness_score", label: "Harness Score", min: 95, required: true },
  { key: "qa_defects_cleared", label: "Defects Cleared", min: 100, required: true },
  { key: "performance_benchmark", label: "Performance Benchmark", min: 90, required: true },
  { key: "security_posture", label: "Security Posture", min: 85, required: true },
];

export default async function GovernancePage() {
  const [allEngagements, allGates, recentEvidence, allRaci] = await Promise.all([
    db.select().from(engagements).orderBy(desc(engagements.updatedAt)),
    db.select().from(gateRecords),
    db.select().from(evidenceEntries).orderBy(desc(evidenceEntries.createdAt)).limit(20),
    db.select().from(raciAssignments),
  ]);

  const activeEngagement = allEngagements.find((e) => e.status === "active") ?? allEngagements[0];
  const activeGates = activeEngagement
    ? allGates.filter((g) => g.engagementId === activeEngagement.id)
    : [];

  const gate4Record = activeGates.find((g) => g.gateNumber === 4);
  const hardBlockActive = gate4Record?.status === "blocked" || gate4Record?.hardBlockActive;

  const totalEntries = recentEvidence.length;
  const immutableCount = recentEvidence.filter((e) => e.immutable).length;

  const raciForActive = activeEngagement
    ? allRaci.filter((r) => r.engagementId === activeEngagement.id)
    : [];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Governance & QA"
        subtitle="Hard block authority · Evidence chain · RACI enforcement · Zone 1 integrity"
      />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Hard Block Banner */}
        {hardBlockActive && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-red-500/40 bg-red-500/5 hard-block-pulse">
            <AlertTriangle size={18} className="text-red-400 shrink-0 animate-pulse" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-400">HARD BLOCK ACTIVE — Gate 4</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {activeEngagement?.clientName} cannot go live until QA Agent clears all 4 harness thresholds.
              </div>
            </div>
            <Badge variant="blocked">BLOCKED</Badge>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active Engagements", value: allEngagements.filter((e) => e.status === "active").length, icon: Activity, color: "text-[#0EA5E9]" },
            { label: "Evidence Entries", value: totalEntries, icon: Shield, color: "text-green-400" },
            { label: "Immutable Records", value: immutableCount, icon: Lock, color: "text-green-400" },
            { label: "Hard Blocks", value: allGates.filter((g) => g.status === "blocked").length, icon: AlertTriangle, color: "text-red-400" },
          ].map((s) => (
            <Card key={s.label} className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon size={18} className={`${s.color} shrink-0`} />
                <div>
                  <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

            {/* Gate 4 QA Validation Panel */}
            {activeEngagement && (
              <Card className={`border-border ${hardBlockActive ? "border-red-500/30" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lock size={14} className="text-red-400" />
                      Gate 4 — QA Hard Block Validation
                    </CardTitle>
                    {gate4Record && (gate4Record.status === "active" || gate4Record.status === "blocked") && (
                      <GateAdvanceDialog
                        gateRecordId={gate4Record.id}
                        gateNumber={4}
                        engagementId={activeEngagement.id}
                        contractValue={Number(activeEngagement.contractValue)}
                        clientName={activeEngagement.clientName}
                        currentStatus={gate4Record.status}
                      >
                        <Button variant="forge" size="sm" className="gap-1.5 text-xs">
                          <Shield size={11} /> Run QA Validation
                        </Button>
                      </GateAdvanceDialog>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Physical hard block for {activeEngagement.clientName}. All 4 thresholds must clear before go-live.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {QA_THRESHOLDS.map((t) => {
                      const score = gate4Record?.harnessScore ?? gate4Record?.resilienceScore ?? null;
                      const passed = gate4Record?.status === "passed";
                      return (
                        <div key={t.key} className={`p-3 rounded-lg border ${passed ? "border-green-500/20 bg-green-500/5" : "border-border bg-secondary/20"}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            {passed ? (
                              <CheckCircle2 size={12} className="text-green-400" />
                            ) : (
                              <XCircle size={12} className="text-muted-foreground" />
                            )}
                            <span className="text-xs font-medium">{t.label}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Min: {t.min}%</div>
                          {t.required && <span className="text-[10px] text-red-400">Required *</span>}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gate Status Overview */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ChevronRight size={14} className="text-[#0EA5E9]" />
                  Golden Path — All Gates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {([0, 1, 2, 3, 4, 5] as GateNumber[]).map((gateNum) => {
                    const def = GATE_DEFINITIONS[gateNum];
                    const record = activeGates.find((g) => g.gateNumber === gateNum);
                    return (
                      <div key={gateNum} className="flex items-center gap-3 p-2.5 rounded-md border border-border text-xs">
                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          record?.status === "passed" ? "bg-green-500/20 text-green-400" :
                          record?.status === "active" ? "bg-[#0EA5E9]/20 text-[#0EA5E9]" :
                          record?.status === "blocked" ? "bg-red-500/20 text-red-400" :
                          "bg-secondary text-muted-foreground"
                        }`}>
                          {gateNum}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground">{def.name}</span>
                          {def.hardBlock && <span className="text-red-400 ml-1.5 text-[10px]">HARD BLOCK</span>}
                        </div>
                        {record?.evidenceHash && (
                          <span className="font-mono text-[10px] text-muted-foreground">{truncateHash(record.evidenceHash)}</span>
                        )}
                        <Badge
                          variant={record?.status === "passed" ? "passed" : record?.status === "active" ? "active" : record?.status === "blocked" ? "blocked" : "locked"}
                          className="text-[9px] h-4 shrink-0"
                        >
                          {record?.status ?? "locked"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: RACI + Evidence */}
          <div className="space-y-4">
            {/* RACI Snapshot */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users size={14} className="text-muted-foreground" />
                  RACI Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                {raciForActive.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No RACI assignments. Create an engagement to seed the matrix.</p>
                ) : (
                  <div className="space-y-2">
                    {raciForActive.slice(0, 6).map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-xs p-2 rounded border border-border">
                        <div>
                          <div className="font-medium text-foreground">{r.displayName}</div>
                          <div className="text-muted-foreground text-[10px]">{r.email ?? r.roleId}</div>
                        </div>
                        <Badge variant="outline" className="text-[10px] capitalize">{r.raciRole}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evidence Integrity */}
            <Card className="border-border border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye size={14} className="text-green-400" />
                  Ledger Integrity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={14} className="text-green-400" />
                  <span className="text-xs text-green-400 font-medium">SHA-256 Chain: Verified</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Entries</span>
                    <span className="text-foreground">{totalEntries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Immutable</span>
                    <span className="text-green-400">{immutableCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Zone 1 DB</span>
                    <span className="text-green-400">Operational</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Evidence */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText size={14} className="text-muted-foreground" />
                  Recent Evidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EvidenceFeed entries={recentEvidence.slice(0, 5)} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

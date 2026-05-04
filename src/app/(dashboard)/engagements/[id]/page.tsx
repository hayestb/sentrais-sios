import { db } from "@/lib/db/client";
import { engagements, gateRecords, agentTasks, invoices } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GatePipeline } from "@/components/dashboard/gate-pipeline";
import { GateAdvanceDialog } from "@/components/dashboard/gate-advance-dialog";
import { GATE_DEFINITIONS } from "@/lib/workflow/golden-path";
import { formatCurrency } from "@/lib/utils";
import {
  Shield,
  AlertTriangle,
  DollarSign,
  Bot,
  FileText,
  ChevronRight,
} from "lucide-react";
import type { GateNumber } from "@/lib/workflow/types";

export const dynamic = "force-dynamic";

export default async function EngagementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [engagement] = await db
    .select()
    .from(engagements)
    .where(eq(engagements.id, id))
    .limit(1);

  if (!engagement) notFound();

  const [gates, recentTasks, engagementInvoices] = await Promise.all([
    db.select().from(gateRecords).where(eq(gateRecords.engagementId, id)),
    db
      .select()
      .from(agentTasks)
      .where(eq(agentTasks.engagementId, id))
      .orderBy(desc(agentTasks.createdAt))
      .limit(20),
    db.select().from(invoices).where(eq(invoices.engagementId, id)).orderBy(desc(invoices.createdAt)),
  ]);

  const passedGates = gates.filter((g) => g.status === "passed").length;
  const totalInvoiced = engagementInvoices.reduce((sum, inv) => sum + Number(inv.amountDue), 0);
  const hardBlocked = gates.some((g) => g.status === "blocked");

  return (
    <div className="flex flex-col h-full">
      <Header
        title={engagement.clientName}
        subtitle={`${engagement.vertical} · ${engagement.governanceStandard ?? "SIOS Agentic Framework"}`}
      />
      <div className="flex-1 p-6 space-y-6">

        {/* Status Banner */}
        {hardBlocked && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-red-500/30 bg-red-500/5 hard-block-pulse">
            <AlertTriangle size={18} className="text-red-400 shrink-0" />
            <div>
              <div className="text-sm font-medium text-red-400">Hard Block Active</div>
              <div className="text-xs text-muted-foreground">Gate 4 QA validation required before go-live</div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#0EA5E9]">{passedGates}/6</div>
              <div className="text-xs text-muted-foreground mt-0.5">Gates Passed</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(Number(engagement.contractValue))}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Contract Value</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-400">
                {formatCurrency(totalInvoiced)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Invoiced to Date</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400">{recentTasks.length}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Agent Tasks</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gate Pipeline */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield size={14} className="text-[#0EA5E9]" />
                    Golden Path Gate Status
                  </CardTitle>
                  {(() => {
                    const activeGate = gates.find((g) => g.status === "active" || g.status === "blocked");
                    if (!activeGate) return null;
                    return (
                      <GateAdvanceDialog
                        gateRecordId={activeGate.id}
                        gateNumber={activeGate.gateNumber as GateNumber}
                        engagementId={id}
                        contractValue={Number(engagement.contractValue)}
                        clientName={engagement.clientName}
                        currentStatus={activeGate.status}
                      >
                        <Button variant="forge" size="sm" className="gap-1.5 text-xs">
                          <ChevronRight size={11} />
                          Advance Gate {activeGate.gateNumber}
                        </Button>
                      </GateAdvanceDialog>
                    );
                  })()}
                </div>
              </CardHeader>
              <CardContent>
                <GatePipeline
                  gates={gates.map((g) => ({
                    ...g,
                    gateNumber: g.gateNumber as GateNumber,
                  }))}
                  clientName={engagement.clientName}
                  contractValue={Number(engagement.contractValue)}
                />
              </CardContent>
            </Card>

            {/* Invoices */}
            {engagementInvoices.length > 0 && (
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign size={14} className="text-amber-400" />
                    Financial Triggers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {engagementInvoices.map((inv) => {
                      const gateDef = GATE_DEFINITIONS[inv.triggerGate as GateNumber];
                      return (
                        <div key={inv.id} className="flex items-center justify-between p-3 rounded-md border border-border text-xs">
                          <div>
                            <div className="font-medium">{inv.invoiceNumber}</div>
                            <div className="text-muted-foreground mt-0.5">
                              Gate {inv.triggerGate} — {gateDef?.financialTrigger?.type ?? "trigger"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-amber-400">{formatCurrency(Number(inv.amountDue))}</div>
                            <Badge
                              variant={inv.status === "paid" ? "passed" : inv.status === "sent" ? "active" : "locked"}
                              className="text-[10px] mt-1"
                            >
                              {inv.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Engagement Metadata */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText size={14} className="text-muted-foreground" />
                  Engagement Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5 text-xs">
                  {[
                    { label: "Status", value: engagement.status, badge: true },
                    { label: "Phase", value: engagement.currentPhase.replace(/_/g, " "), badge: false },
                    { label: "Gate", value: `Gate ${engagement.currentGate}`, badge: false },
                    { label: "Vertical", value: engagement.vertical, badge: false },
                    { label: "Sprint", value: `Sprint ${engagement.sprintNumber}`, badge: false },
                    { label: "Entry Point", value: engagement.entryPoint ?? "—", badge: false },
                    { label: "Governance", value: engagement.governanceStandard ?? "SIOS", badge: false },
                    { label: "Created", value: new Date(engagement.createdAt).toLocaleDateString(), badge: false },
                  ].map(({ label, value, badge }) => (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">{label}</span>
                      {badge ? (
                        <Badge variant={value === "active" ? "active" : value === "completed" ? "passed" : "locked"} className="text-[10px]">
                          {value}
                        </Badge>
                      ) : (
                        <span className="text-foreground text-right">
                          {value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Agent Tasks */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bot size={14} className="text-[#0EA5E9]" />
                  Recent Agent Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tasks yet.</p>
                ) : (
                  <div className="space-y-2">
                    {recentTasks.slice(0, 10).map((task) => (
                      <div key={task.id} className="p-2 rounded border border-border text-xs">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium truncate">{task.agentName}</span>
                          <Badge
                            variant={task.status === "completed" ? "passed" : task.status === "failed" ? "blocked" : "active"}
                            className="text-[9px] h-4 shrink-0"
                          >
                            {task.status}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground mt-0.5 truncate">
                          {task.taskType.replace(/_/g, " ")}
                        </div>
                        {task.durationMs && (
                          <div className="text-muted-foreground mt-0.5">
                            {task.durationMs}ms
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}

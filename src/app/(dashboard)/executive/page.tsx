import { db } from "@/lib/db/client";
import { engagements, gateRecords, invoices, agentTasks } from "@/lib/db/schema";
import { desc, eq, sum, count } from "drizzle-orm";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp, DollarSign, Briefcase, GitBranch, FileText, CheckCircle2,
  AlertTriangle, Clock, ArrowRight, Zap,
} from "lucide-react";
import Link from "next/link";
import { ReportTrigger } from "@/components/dashboard/report-trigger";

export const dynamic = "force-dynamic";

const ARR_TARGET = 10_000_000;

export default async function ExecutivePage() {
  const [allEngagements, allGates, allInvoices, recentTasks] = await Promise.all([
    db.select().from(engagements).orderBy(desc(engagements.updatedAt)),
    db.select().from(gateRecords),
    db.select().from(invoices).orderBy(desc(invoices.createdAt)),
    db.select().from(agentTasks).orderBy(desc(agentTasks.createdAt)).limit(5),
  ]);

  const totalContractValue = allEngagements.reduce((s, e) => s + Number(e.contractValue), 0);
  const activeEngagements = allEngagements.filter((e) => e.status === "active").length;
  const totalInvoiced = allInvoices.reduce((s, i) => s + Number(i.amountDue), 0);
  const totalPaid = allInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.amountDue), 0);
  const pendingInvoices = allInvoices.filter((i) => i.status === "pending" || i.status === "sent");
  const arrProgress = Math.min(100, Math.round((totalContractValue / ARR_TARGET) * 100));

  const gateMap = allGates.reduce<Record<string, typeof allGates>>((acc, g) => {
    if (!acc[g.engagementId]) acc[g.engagementId] = [];
    acc[g.engagementId].push(g);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Executive Command"
        subtitle="Knox Phillips · Revenue, Portfolio & Financial Governance"
      />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* ARR Progress */}
        <div className="p-5 rounded-xl border border-[#0EA5E9]/20 bg-[#0EA5E9]/5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">ARR Pipeline</div>
              <div className="text-3xl font-bold text-foreground">{formatCurrency(totalContractValue)}</div>
              <div className="text-xs text-muted-foreground mt-1">of {formatCurrency(ARR_TARGET)} target · {arrProgress}% to goal</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-1">Invoiced</div>
              <div className="text-lg font-bold text-amber-400">{formatCurrency(totalInvoiced)}</div>
              <div className="text-xs text-muted-foreground">{formatCurrency(totalPaid)} collected</div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#14B8A6] transition-all"
              style={{ width: `${arrProgress}%` }}
            />
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active Engagements", value: activeEngagements, icon: Briefcase, color: "text-[#0EA5E9]" },
            { label: "Total Contract Value", value: formatCurrency(totalContractValue), icon: TrendingUp, color: "text-green-400" },
            { label: "Pending Invoices", value: pendingInvoices.length, icon: Clock, color: "text-amber-400" },
            { label: "Gates Passed", value: allGates.filter((g) => g.status === "passed").length, icon: CheckCircle2, color: "text-green-400" },
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
          {/* Portfolio Table */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Briefcase size={14} className="text-[#0EA5E9]" />
                  Engagement Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allEngagements.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No engagements yet.{" "}
                    <Link href="/engagements" className="text-[#0EA5E9] hover:underline">Create the first one →</Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allEngagements.map((eng) => {
                      const engGates = gateMap[eng.id] ?? [];
                      const passed = engGates.filter((g) => g.status === "passed").length;
                      const hardBlocked = engGates.some((g) => g.status === "blocked");
                      const engInvoices = allInvoices.filter((i) => i.engagementId === eng.id);
                      const engInvoiced = engInvoices.reduce((s, i) => s + Number(i.amountDue), 0);
                      const hasPendingInvoice = engInvoices.some((i) => i.status === "pending" || i.status === "sent");

                      return (
                        <Link
                          key={eng.id}
                          href={`/engagements/${eng.id}`}
                          className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground truncate">{eng.clientName}</span>
                              {hardBlocked && <AlertTriangle size={12} className="text-red-400 shrink-0" />}
                              {hasPendingInvoice && <DollarSign size={12} className="text-amber-400 shrink-0" />}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">{eng.vertical} · Gate {eng.currentGate}/5 · {eng.currentPhase}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold text-foreground">{formatCurrency(Number(eng.contractValue))}</div>
                            {engInvoiced > 0 && <div className="text-xs text-amber-400">{formatCurrency(engInvoiced)} invoiced</div>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex gap-0.5">
                              {[0, 1, 2, 3, 4, 5].map((n) => {
                                const g = engGates.find((x) => x.gateNumber === n);
                                return (
                                  <div key={n} className={`w-2 h-2 rounded-sm ${
                                    g?.status === "passed" ? "bg-green-500" :
                                    g?.status === "active" ? "bg-[#0EA5E9]" :
                                    g?.status === "blocked" ? "bg-red-500" :
                                    "bg-secondary"
                                  }`} />
                                );
                              })}
                            </div>
                            <Badge variant={eng.status === "active" ? "active" : eng.status === "completed" ? "passed" : "locked"} className="text-[10px]">
                              {eng.status}
                            </Badge>
                            <ArrowRight size={12} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Pending Invoices */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign size={14} className="text-amber-400" />
                  Invoice Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingInvoices.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No pending invoices.</p>
                ) : (
                  <div className="space-y-2">
                    {pendingInvoices.slice(0, 5).map((inv) => {
                      const eng = allEngagements.find((e) => e.id === inv.engagementId);
                      return (
                        <div key={inv.id} className="flex items-center justify-between text-xs p-2.5 rounded border border-border">
                          <div>
                            <div className="font-medium text-foreground">{eng?.clientName ?? "—"}</div>
                            <div className="text-muted-foreground font-mono text-[10px]">{inv.invoiceNumber}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-amber-400">{formatCurrency(Number(inv.amountDue))}</div>
                            <Badge variant={inv.status === "sent" ? "active" : "locked"} className="text-[9px] h-4 mt-0.5">
                              {inv.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Reports */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText size={14} className="text-muted-foreground" />
                  One-Click Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ReportTrigger
                  type="executive_readout"
                  label="Bi-Weekly ARR Readout"
                  agent="communications"
                  description="For Knox & Kevin McCann"
                />
                <ReportTrigger
                  type="gate_briefing"
                  label="Gate Transition Briefing"
                  agent="communications"
                  description="Most recent gate passage"
                />
                <ReportTrigger
                  type="ip_ledger_summary"
                  label="IP Ledger Summary"
                  agent="governance"
                  description="All hashed IP artifacts"
                />
                <div className="pt-1">
                  <Link href="/reports" className="text-xs text-[#0EA5E9] hover:underline flex items-center gap-1">
                    All reports <ArrowRight size={11} />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

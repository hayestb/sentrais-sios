import { db } from "@/lib/db/client";
import { engagements, gateRecords, evidenceEntries, invoices } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { GATE_DEFINITIONS } from "@/lib/workflow/golden-path";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Lock, Circle, Shield, AlertTriangle } from "lucide-react";
import type { GateNumber } from "@/lib/workflow/types";

export const dynamic = "force-dynamic";

const PHASE_LABELS: Record<string, string> = {
  discover: "Phase 1 — Discovery",
  diagnose: "Phase 2 — Diagnosis",
  design: "Phase 3 — Design",
  deploy: "Phase 4 — Deployment",
  debrief: "Phase 5 — Operationalize",
};

export default async function ClientPortalPage({
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

  const [gates, recentEvidence, engInvoices] = await Promise.all([
    db.select().from(gateRecords).where(eq(gateRecords.engagementId, id)),
    db.select().from(evidenceEntries)
      .where(eq(evidenceEntries.engagementId, id))
      .orderBy(desc(evidenceEntries.createdAt))
      .limit(10),
    db.select().from(invoices).where(eq(invoices.engagementId, id)).orderBy(desc(invoices.createdAt)),
  ]);

  const passedGates = gates.filter((g) => g.status === "passed").length;
  const progressPct = Math.round((passedGates / 6) * 100);
  const hardBlocked = gates.some((g) => g.status === "blocked");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-8 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#0EA5E9] flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Sentrais Client Portal</div>
              <div className="text-[10px] text-muted-foreground">Engagement Progress · Confidential</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-10 space-y-8">

        {/* Client Hero */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{engagement.clientName}</h1>
          <p className="text-sm text-muted-foreground mt-1">{engagement.vertical} · {PHASE_LABELS[engagement.currentPhase] ?? engagement.currentPhase}</p>
        </div>

        {/* Hard Block Alert */}
        {hardBlocked && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-amber-400">Quality Validation In Progress</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Our QA team is completing final validation before go-live. We'll be in touch shortly.
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-foreground">Engagement Progress</div>
            <div className="text-sm font-bold text-[#0EA5E9]">{progressPct}%</div>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden mb-4">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#14B8A6] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Gate Timeline */}
          <div className="flex items-start gap-0">
            {([0, 1, 2, 3, 4, 5] as GateNumber[]).map((gateNum, i) => {
              const def = GATE_DEFINITIONS[gateNum];
              const record = gates.find((g) => g.gateNumber === gateNum);
              const isPassed = record?.status === "passed";
              const isActive = record?.status === "active";
              const isLast = i === 5;

              return (
                <div key={gateNum} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isPassed ? "border-green-500 bg-green-500/20" :
                      isActive ? "border-[#0EA5E9] bg-[#0EA5E9]/20" :
                      "border-border bg-secondary"
                    }`}>
                      {isPassed ? (
                        <CheckCircle2 size={14} className="text-green-400" />
                      ) : isActive ? (
                        <Circle size={14} className="text-[#0EA5E9] fill-current" />
                      ) : (
                        <Lock size={12} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-[10px] font-medium text-foreground w-16 leading-tight">{def.name.split("—")[0].trim()}</div>
                    </div>
                  </div>
                  {!isLast && (
                    <div className={`flex-1 h-0.5 mt-[-12px] ${isPassed ? "bg-green-500/40" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestones */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Completed Milestones</h2>
          {recentEvidence.filter((e) => e.entryType === "gate_approval" || e.entryType === "ip_lock" || e.entryType === "engagement_created").length === 0 ? (
            <div className="text-sm text-muted-foreground p-4 rounded-lg border border-border">
              Engagement is in progress — milestones will appear here as they are completed.
            </div>
          ) : (
            <div className="space-y-2">
              {recentEvidence
                .filter((e) => ["gate_approval", "ip_lock", "engagement_created"].includes(e.entryType))
                .map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
                    <CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-foreground">{entry.subject}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Invoice Summary */}
        {engInvoices.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Financial Milestones</h2>
            <div className="space-y-2">
              {engInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div>
                    <div className="text-sm font-medium text-foreground">{inv.invoiceType.replace(/_/g, " ")}</div>
                    <div className="text-xs text-muted-foreground font-mono">{inv.invoiceNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-amber-400">{formatCurrency(Number(inv.amountDue))}</div>
                    <div className={`text-xs mt-0.5 capitalize ${inv.status === "paid" ? "text-green-400" : "text-muted-foreground"}`}>
                      {inv.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Shield size={11} className="text-green-400" />
            <span>All data secured by immutable SHA-256 Evidence Ledger</span>
          </div>
          <span>Sentrais Group © 2026</span>
        </div>
      </main>
    </div>
  );
}

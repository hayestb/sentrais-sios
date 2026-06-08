import { db } from "@/lib/db/client";
import { gateRecords, engagements } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GATE_DEFINITIONS } from "@/lib/workflow/golden-path";
import { Shield, Lock, CheckCircle2, AlertTriangle, DollarSign } from "lucide-react";
import type { GateNumber } from "@/lib/workflow/types";

export const dynamic = "force-dynamic";

export default async function GatesPage() {
  const [gates, allEngagements] = await Promise.all([
    db.select().from(gateRecords).orderBy(desc(gateRecords.updatedAt)),
    db.select().from(engagements),
  ]);

  const engMap = Object.fromEntries(allEngagements.map((e) => [e.id, e]));

  const passed = gates.filter((g) => g.status === "passed").length;
  const blocked = gates.filter((g) => g.status === "blocked").length;
  const active = gates.filter((g) => g.status === "active").length;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Golden Path Gates"
        subtitle="Gate governance · Immutable evidence · Automated financial triggers"
      />
      <div className="flex-1 p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Gates Passed", value: passed, icon: CheckCircle2, color: "text-green-400" },
            { label: "Active", value: active, icon: Shield, color: "text-[#0EA5E9]" },
            { label: "Hard Blocks", value: blocked, icon: AlertTriangle, color: "text-red-400" },
            { label: "Invoices Triggered", value: gates.filter((g) => g.status === "passed" && GATE_DEFINITIONS[g.gateNumber as GateNumber]?.financialTrigger).length, icon: DollarSign, color: "text-amber-400" },
          ].map((s) => (
            <Card key={s.label} className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon size={20} className={`${s.color} shrink-0`} />
                <div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gate definitions */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {([0, 1, 2, 3, 4, 5] as GateNumber[]).map((gateNum) => {
            const def = GATE_DEFINITIONS[gateNum];
            const gateInstances = gates.filter((g) => g.gateNumber === gateNum);
            const passedCount = gateInstances.filter((g) => g.status === "passed").length;
            const blockedInstance = gateInstances.find((g) => g.status === "blocked");

            return (
              <Card
                key={gateNum}
                className={`border-border ${def.hardBlock ? "border-red-500/30" : def.financialTrigger ? "border-amber-500/20" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {def.hardBlock ? (
                        <Lock size={14} className="text-red-400" />
                      ) : (
                        <Shield size={14} className="text-[#0EA5E9]" />
                      )}
                      <CardTitle className="text-xs">Gate {gateNum}</CardTitle>
                    </div>
                    {def.hardBlock && (
                      <Badge variant="blocked" className="text-[10px]">Hard Block</Badge>
                    )}
                    {def.financialTrigger && !def.hardBlock && (
                      <Badge variant="amber" className="text-[10px]">
                        <DollarSign size={9} className="mr-0.5" />
                        {def.financialTrigger.type === "deposit_25" ? "25%" : def.financialTrigger.type === "balance_50" ? "50%" : "CaaS"}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs font-medium text-foreground mt-1">{def.name}</div>
                  <div className="text-[10px] text-muted-foreground leading-snug">{def.description}</div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Thresholds */}
                  {def.requiredThresholds.length > 0 && (
                    <div className="space-y-1 mb-3">
                      {def.requiredThresholds.map((t) => (
                        <div key={t.key} className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">{t.label}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-foreground">≥{t.minScore}%</span>
                            {t.required && <span className="text-red-400">*</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Agents */}
                  <div className="flex gap-1 flex-wrap">
                    {def.responsibleAgents.map((a) => (
                      <span key={a} className="text-[10px] bg-secondary rounded px-1.5 py-0.5 text-muted-foreground">
                        {a}
                      </span>
                    ))}
                  </div>

                  {/* Instances */}
                  {gateInstances.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border space-y-1">
                      <div className="text-[10px] text-muted-foreground mb-1">
                        {passedCount}/{gateInstances.length} engagements passed
                      </div>
                      {gateInstances.slice(0, 2).map((gi) => {
                        const eng = engMap[gi.engagementId ?? ""];
                        return (
                          <div key={gi.id} className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground truncate max-w-[120px]">
                              {eng?.clientName ?? "Unknown"}
                            </span>
                            <Badge
                              variant={gi.status === "passed" ? "passed" : gi.status === "active" ? "active" : gi.status === "blocked" ? "blocked" : "locked"}
                              className="text-[9px] h-4"
                            >
                              {gi.status}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

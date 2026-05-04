import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GATE_DEFINITIONS } from "@/lib/workflow/golden-path";
import { formatPercent, truncateHash } from "@/lib/utils";
import { Lock, CheckCircle2, AlertCircle, Circle, ShieldAlert } from "lucide-react";
import type { GateRecord } from "@/lib/db/schema";
import type { GateNumber } from "@/lib/workflow/types";

interface GatePipelineProps {
  gates: GateRecord[];
  clientName: string;
  contractValue: number;
}

function GateIcon({ status }: { status: string }) {
  switch (status) {
    case "passed": return <CheckCircle2 size={16} className="text-green-400" />;
    case "active": return <Circle size={16} className="text-[#0EA5E9] fill-[#0EA5E9]/30" />;
    case "blocked": return <ShieldAlert size={16} className="text-red-400 animate-pulse" />;
    case "failed": return <AlertCircle size={16} className="text-red-400" />;
    default: return <Lock size={16} className="text-muted-foreground" />;
  }
}

const STATUS_BADGE: Record<string, "passed" | "active" | "locked" | "blocked"> = {
  passed: "passed",
  active: "active",
  blocked: "blocked",
  failed: "blocked",
  locked: "locked",
};

export function GatePipeline({ gates, clientName, contractValue }: GatePipelineProps) {
  const passedCount = gates.filter((g) => g.status === "passed").length;
  const progress = Math.round((passedCount / 6) * 100);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <Progress value={progress} className="flex-1 h-1.5" />
        <span className="text-xs text-muted-foreground w-10 text-right">
          {formatPercent(progress)}
        </span>
      </div>

      {/* Gate rows */}
      <div className="space-y-2">
        {gates.map((gate) => {
          const def = GATE_DEFINITIONS[gate.gateNumber as GateNumber];
          const isActive = gate.status === "active";
          const isBlocked = gate.status === "blocked";

          return (
            <div
              key={gate.gateNumber}
              className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                isActive
                  ? "border-[#0EA5E9]/30 bg-[#0EA5E9]/5"
                  : isBlocked
                  ? "border-red-500/30 bg-red-500/5"
                  : gate.status === "passed"
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-border bg-secondary/30"
              }`}
            >
              <GateIcon status={gate.status} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground truncate">
                    Gate {gate.gateNumber}: {def.name}
                  </span>
                  {def.financialTrigger && (
                    <span className="text-[10px] text-amber-400 hidden sm:block">
                      {def.financialTrigger.label}
                    </span>
                  )}
                </div>
                {gate.evidenceHash && (
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    SHA256: {truncateHash(gate.evidenceHash)}
                  </div>
                )}
                {gate.resilienceScore != null && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Resilience: {gate.resilienceScore}%
                    {gate.resilienceScore < 80 && (
                      <span className="text-red-400 ml-1">⚠ Below threshold</span>
                    )}
                  </div>
                )}
              </div>

              <Badge variant={STATUS_BADGE[gate.status] ?? "locked"} className="shrink-0 text-[10px]">
                {gate.status}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

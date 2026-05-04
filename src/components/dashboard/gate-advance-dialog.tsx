"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { GATE_DEFINITIONS } from "@/lib/workflow/golden-path";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle2, XCircle, AlertTriangle, Loader2, ChevronRight, DollarSign, Shield, Lock,
} from "lucide-react";
import type { GateNumber } from "@/lib/workflow/types";

interface GateAdvanceDialogProps {
  gateRecordId: string;
  gateNumber: GateNumber;
  engagementId: string;
  contractValue: number;
  clientName: string;
  currentStatus: string;
  children: React.ReactNode;
}

export function GateAdvanceDialog({
  gateRecordId,
  gateNumber,
  engagementId,
  contractValue,
  clientName,
  currentStatus,
  children,
}: GateAdvanceDialogProps) {
  const router = useRouter();
  const def = GATE_DEFINITIONS[gateNumber];

  const initialScores = Object.fromEntries(def.requiredThresholds.map((t) => [t.key, 0]));
  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [approvedBy, setApprovedBy] = useState("Knox Phillips");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    evidenceHash?: string;
    nextGate?: number;
    invoice?: { invoiceNumber: string; amountDue: number } | null;
    failedThresholds?: string[];
    warnings?: string[];
    error?: string;
  } | null>(null);
  const [open, setOpen] = useState(false);

  const getThresholdStatus = (key: string, minScore: number) => {
    const val = scores[key] ?? 0;
    return val >= minScore ? "pass" : "fail";
  };

  const requiredPassing = def.requiredThresholds
    .filter((t) => t.required)
    .every((t) => (scores[t.key] ?? 0) >= t.minScore);

  const canSubmit = requiredPassing && approvedBy.trim().length > 0 && !submitting;

  const projectedInvoice = def.financialTrigger
    ? contractValue * (def.financialTrigger.type === "deposit_25" ? 0.25 : def.financialTrigger.type === "balance_50" ? 0.5 : 0.1)
    : null;

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(`/api/gates/${gateRecordId}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engagementId, scores, approvedBy, notes }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, ...data });
        router.refresh();
      } else {
        setResult({ success: false, failedThresholds: data.failedThresholds, error: data.error });
      }
    } catch {
      setResult({ success: false, error: "Network error — please retry." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setResult(null);
      setScores(initialScores);
      setNotes("");
    }
  };

  if (currentStatus === "locked") return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {def.hardBlock ? (
              <Lock size={14} className="text-red-400" />
            ) : (
              <Shield size={14} className="text-[#0EA5E9]" />
            )}
            <Badge variant={def.hardBlock ? "blocked" : "active"} className="text-[10px]">
              Gate {gateNumber}
            </Badge>
            {def.financialTrigger && (
              <Badge variant="amber" className="text-[10px] gap-0.5">
                <DollarSign size={9} />
                {def.financialTrigger.label}
              </Badge>
            )}
          </div>
          <DialogTitle>{def.name}</DialogTitle>
          <DialogDescription>{def.description}</DialogDescription>
        </DialogHeader>

        {result?.success ? (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 border border-green-500/20">
              <CheckCircle2 size={16} className="text-green-400 shrink-0" />
              <div className="text-sm text-green-400 font-medium">Gate {gateNumber} Advanced</div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 p-3 rounded border border-border bg-secondary/30">
              <div className="flex justify-between">
                <span>Next Gate</span>
                <span className="text-foreground font-mono">Gate {result.nextGate}</span>
              </div>
              <div className="flex justify-between">
                <span>Evidence Hash</span>
                <span className="text-foreground font-mono text-[10px]">{result.evidenceHash?.slice(0, 16)}…</span>
              </div>
              {result.invoice && (
                <div className="flex justify-between text-amber-400">
                  <span>Invoice Triggered</span>
                  <span className="font-mono">{formatCurrency(result.invoice.amountDue)}</span>
                </div>
              )}
            </div>
            {result.warnings && result.warnings.length > 0 && (
              <div className="text-xs text-amber-400 space-y-1">
                {result.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" className="w-full" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {def.requiredThresholds.length === 0 ? (
              <div className="text-xs text-muted-foreground p-3 rounded border border-border bg-secondary/30">
                No threshold scores required for Gate {gateNumber}. This gate advances on confirmation only.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  Threshold Scores
                </div>
                {def.requiredThresholds.map((t) => {
                  const val = scores[t.key] ?? 0;
                  const status = getThresholdStatus(t.key, t.minScore);
                  return (
                    <div key={t.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          {status === "pass" ? (
                            <CheckCircle2 size={12} className="text-green-400" />
                          ) : (
                            <XCircle size={12} className={t.required ? "text-red-400" : "text-amber-400"} />
                          )}
                          <span className="text-foreground">{t.label}</span>
                          {t.required && <span className="text-red-400 text-[10px]">*</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">min {t.minScore}%</span>
                          <span className={`font-mono font-bold ${status === "pass" ? "text-green-400" : t.required ? "text-red-400" : "text-amber-400"}`}>
                            {val}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={val}
                          onChange={(e) => setScores((p) => ({ ...p, [t.key]: Number(e.target.value) }))}
                          className="flex-1 h-1.5 accent-[#0EA5E9]"
                        />
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={val}
                          onChange={(e) => setScores((p) => ({ ...p, [t.key]: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                          className="w-16 text-center text-xs h-7"
                        />
                      </div>
                      <div className="h-1 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${status === "pass" ? "bg-green-500" : t.required ? "bg-red-500" : "bg-amber-500"}`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {projectedInvoice && (
              <div className="flex items-center gap-2 p-3 rounded border border-amber-500/20 bg-amber-500/5 text-xs">
                <DollarSign size={13} className="text-amber-400 shrink-0" />
                <div>
                  <span className="text-amber-400 font-medium">Advancing triggers {def.financialTrigger?.label}</span>
                  <span className="text-muted-foreground ml-1">→ {formatCurrency(projectedInvoice)} invoice for {clientName}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Approved By</label>
              <Input
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="Name / role"
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Gate review notes, evidence references..."
                rows={2}
              />
            </div>

            {result?.failedThresholds && (
              <div className="p-3 rounded border border-red-500/20 bg-red-500/5 space-y-1">
                {result.failedThresholds.map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-red-400">
                    <XCircle size={11} className="mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <div className="flex items-center justify-between w-full gap-3">
                <span className="text-xs text-muted-foreground">
                  {requiredPassing
                    ? <span className="text-green-400 flex items-center gap-1"><CheckCircle2 size={11} /> All required thresholds met</span>
                    : <span className="text-red-400 flex items-center gap-1"><XCircle size={11} /> Required thresholds not met</span>
                  }
                </span>
                <Button
                  variant="forge"
                  size="sm"
                  className="gap-1.5"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                >
                  {submitting ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <ChevronRight size={12} />
                  )}
                  {submitting ? "Processing…" : `Advance Gate ${gateNumber}`}
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

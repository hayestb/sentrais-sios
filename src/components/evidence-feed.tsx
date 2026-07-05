import { Badge } from "@/components/ui/badge";
import { truncateHash } from "@/lib/utils";
import { Shield, CheckCircle2, AlertTriangle, FileText, DollarSign, Bot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { EvidenceEntry } from "@/lib/db/schema";

interface EvidenceFeedProps {
  entries: EvidenceEntry[];
}

function EntryIcon({ type }: { type: string }) {
  switch (type) {
    case "gate_approval": return <CheckCircle2 size={14} className="text-green-400" />;
    case "hard_block": return <AlertTriangle size={14} className="text-red-400" />;
    case "invoice": return <DollarSign size={14} className="text-amber-400" />;
    case "ip_lock": return <Shield size={14} className="text-[#0EA5E9]" />;
    case "agent_action": return <Bot size={14} className="text-[#14B8A6]" />;
    case "sipe_update": return <FileText size={14} className="text-purple-400" />;
    default: return <FileText size={14} className="text-muted-foreground" />;
  }
}

const TYPE_LABELS: Record<string, string> = {
  gate_approval: "Gate",
  gate_failure: "Failure",
  hard_block: "Hard Block",
  invoice: "Invoice",
  ip_lock: "IP Lock",
  agent_action: "Agent",
  sprint_event: "Sprint",
  sipe_update: "SIPE",
  escalation: "Escalation",
  ap_invoice_created: "AP Invoice",
  ap_invoice_status: "AP Status",
  agent_run: "Agent Run",
  prompt_change: "Prompt",
};

export function EvidenceFeed({ entries }: EvidenceFeedProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-xs">
        <Shield size={24} className="mx-auto mb-2 opacity-30" />
        No evidence entries yet. Zone 1 is ready.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-start gap-3 p-3 rounded-md bg-secondary/30 border border-border/50">
          <div className="mt-0.5 shrink-0">
            <EntryIcon type={entry.entryType} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-foreground truncate">{entry.subject}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                {TYPE_LABELS[entry.entryType] ?? entry.entryType}
              </Badge>
            </div>
            <div className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">
              SHA256: {truncateHash(entry.sha256Hash ?? "", 16)}
            </div>
            <div className="flex items-center gap-3 mt-1">
              {entry.authorAgent && (
                <span className="text-[10px] text-muted-foreground">
                  {entry.authorAgent.replace(/_/g, " ")} agent
                </span>
              )}
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

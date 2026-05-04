"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

interface ReportTriggerProps {
  type: string;
  label: string;
  agent: string;
  description?: string;
  engagementId?: string;
}

export function ReportTrigger({ type, label, agent, description, engagementId }: ReportTriggerProps) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [output, setOutput] = useState<string | null>(null);

  const generate = async () => {
    setState("loading");
    try {
      const res = await fetch(`/api/agents/${agent}/invoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: type,
          engagementId,
          input: { action: `Generate ${label}`, documentType: label },
        }),
      });
      const data = await res.json();
      const o = data.result?.output;
      setOutput(o?.body ?? o?.summary ?? JSON.stringify(o).slice(0, 300));
      setState("done");
    } catch {
      setOutput("Failed to generate.");
      setState("done");
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-md border border-border hover:bg-secondary/30 transition-colors">
        <div className="min-w-0">
          <div className="text-xs font-medium text-foreground truncate">{label}</div>
          {description && <div className="text-[10px] text-muted-foreground">{description}</div>}
        </div>
        <Button
          variant={state === "done" ? "outline" : "forge"}
          size="sm"
          className="h-7 px-2.5 text-xs gap-1 shrink-0"
          onClick={generate}
          disabled={state === "loading"}
        >
          {state === "loading" ? <Loader2 size={10} className="animate-spin" /> :
           state === "done" ? <CheckCircle2 size={10} /> :
           <Send size={10} />}
          {state === "loading" ? "…" : state === "done" ? "Redo" : "Run"}
        </Button>
      </div>
      {output && (
        <div className="text-[10px] text-muted-foreground bg-secondary/30 rounded p-2 border border-border max-h-24 overflow-y-auto leading-relaxed">
          {output}
        </div>
      )}
    </div>
  );
}

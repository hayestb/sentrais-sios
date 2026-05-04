"use client";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Send, CheckCircle2 } from "lucide-react";

interface Report {
  type: string;
  label: string;
  description: string;
  agent: string;
  from: string;
}

const REPORTS: Report[] = [
  {
    type: "gate_briefing",
    label: "Gate Transition Briefing",
    description: "Deloitte-grade summary of the most recent gate passage including scores, evidence hash, and financial triggers.",
    agent: "communications",
    from: "communications@sentrais.com",
  },
  {
    type: "executive_readout",
    label: "Bi-Weekly ARR Executive Readout",
    description: "ARR milestone report for Knox and Kevin McCann. Includes sprint velocity, gate progress, and projected revenue.",
    agent: "communications",
    from: "communications@sentrais.com",
  },
  {
    type: "raci_status",
    label: "RACI Enforcement Status",
    description: "Current RACI matrix snapshot with decision tracking, approvals pending, and escalation queue.",
    agent: "governance",
    from: "governance@sentrais.com",
  },
  {
    type: "blueprint360_report",
    label: "Blueprint360 Gap Analysis",
    description: "Full Blueprint360 assessment report for the active engagement — resilience scores, critical gaps, and recommendations.",
    agent: "assessment",
    from: "advisory@sentrais.com",
  },
  {
    type: "sipe_playbook",
    label: "SIPE Playbook Export",
    description: "Export current SIPE intelligence — patterns, lessons learned, and pre-populated playbooks for the next engagement.",
    agent: "learning",
    from: "advisory@sentrais.com",
  },
  {
    type: "ip_ledger_summary",
    label: "IP Ledger Summary",
    description: "Summary of all hashed IP artifacts in the Evidence Ledger — blueprints, SOPs, and design deliverables.",
    agent: "governance",
    from: "ip-ledger@sentrais.com",
  },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Record<string, string>>({});

  const generateReport = async (report: Report) => {
    setGenerating(report.type);
    try {
      const res = await fetch(`/api/agents/${report.agent}/invoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: report.type,
          input: {
            action: `Generate ${report.label}`,
            documentType: report.label,
            recipient: "Knox Phillips, Advisory Team",
          },
        }),
      });
      const data = await res.json();
      const output = data.result?.output;
      setGenerated((prev) => ({
        ...prev,
        [report.type]: output?.body ?? output?.summary ?? JSON.stringify(output, null, 2).slice(0, 800),
      }));
    } catch {
      setGenerated((prev) => ({ ...prev, [report.type]: "Failed to generate report." }));
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Executive Reports"
        subtitle="Automated Deloitte-grade deliverables · Generated from the Evidence Ledger"
      />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORTS.map((report) => {
            const isGenerating = generating === report.type;
            const result = generated[report.type];

            return (
              <Card key={report.type} className="border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm">{report.label}</CardTitle>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        From: {report.from}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {report.agent}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  {result && (
                    <div className="mb-3 p-3 rounded-md bg-secondary/40 border border-border text-xs text-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {result}
                    </div>
                  )}
                  <Button
                    variant={result ? "outline" : "forge"}
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => generateReport(report)}
                    disabled={!!generating}
                  >
                    {isGenerating ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : result ? (
                      <CheckCircle2 size={11} />
                    ) : (
                      <Send size={11} />
                    )}
                    {isGenerating ? "Generating..." : result ? "Regenerate" : "Generate Report"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

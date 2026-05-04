"use client";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AGENT_CATALOG } from "@/lib/agents/catalog";
import { Bot, Zap, Play, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface InvokeResult {
  agent: string;
  success: boolean;
  output: Record<string, unknown>;
}

export default function AgentsPage() {
  const [invoking, setInvoking] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, InvokeResult>>({});

  const invokeAgent = async (agentName: string) => {
    setInvoking(agentName);
    try {
      const res = await fetch(`/api/agents/${agentName}/invoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: "status_check",
          input: { action: "Provide a brief status report of your current operational state and readiness." },
        }),
      });
      const data = await res.json();
      setResults((prev) => ({
        ...prev,
        [agentName]: {
          agent: agentName,
          success: data.result?.success ?? false,
          output: data.result?.output ?? {},
        },
      }));
    } catch {
      setResults((prev) => ({
        ...prev,
        [agentName]: { agent: agentName, success: false, output: { error: "Failed to invoke agent" } },
      }));
    } finally {
      setInvoking(null);
    }
  };

  const tier1 = AGENT_CATALOG.filter((a) => a.tier === 1);
  const tier2 = AGENT_CATALOG.filter((a) => a.tier === 2);

  const AgentCard = ({ agent }: { agent: (typeof AGENT_CATALOG)[number] }) => {
    const result = results[agent.name];
    const isRunning = invoking === agent.name;
    const isInstantiated = ["governance", "financial", "qa", "assessment", "learning", "communications", "delivery", "discovery", "architecture"].includes(agent.name);

    return (
      <Card key={agent.name} className={`border-border transition-colors ${result?.success ? "border-green-500/30" : result && !result.success ? "border-red-500/30" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center shrink-0">
              <Bot size={15} className="text-[#0EA5E9]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{agent.label}</span>
                {agent.tier === 1 && (
                  <Badge variant="amber" className="text-[10px]">
                    <Zap size={9} className="mr-0.5" /> Tier 1
                  </Badge>
                )}
                {isInstantiated ? (
                  <Badge variant="passed" className="text-[10px]">Live</Badge>
                ) : (
                  <Badge variant="locked" className="text-[10px]">Registered</Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{agent.domain}</div>
              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{agent.email}</div>

              {result && (
                <div className={`mt-2 p-2 rounded text-[10px] border ${result.success ? "border-green-500/20 bg-green-500/5 text-green-400" : "border-red-500/20 bg-red-500/5 text-red-400"}`}>
                  {result.success ? (
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 size={11} className="mt-0.5 shrink-0" />
                      <span className="break-words">
                        {String(result.output.summary ?? JSON.stringify(result.output).slice(0, 120))}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1.5">
                      <AlertCircle size={11} className="mt-0.5 shrink-0" />
                      <span>{String(result.output.error ?? "Unknown error")}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isInstantiated && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 h-7 px-2 text-xs gap-1"
                onClick={() => invokeAgent(agent.name)}
                disabled={!!invoking}
              >
                {isRunning ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}
                {isRunning ? "Running" : "Invoke"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="FORGE Agent Network"
        subtitle="22 AI agents — the nervous system of the Sentrais Innovation OS"
      />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Agents", value: "22", color: "text-[#0EA5E9]" },
            { label: "Tier 1 (Core)", value: String(tier1.length), color: "text-amber-400" },
            { label: "Live (Instantiated)", value: "9", color: "text-green-400" },
            { label: "Hard Block Authority", value: "QA Agent", color: "text-red-400" },
          ].map((s) => (
            <Card key={s.label} className="border-border">
              <CardContent className="p-4">
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap size={14} className="text-amber-400" /> Tier 1 — Core Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tier1.map((a) => <AgentCard key={a.name} agent={a} />)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot size={14} className="text-muted-foreground" /> Tier 2 — Specialist Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tier2.map((a) => <AgentCard key={a.name} agent={a} />)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

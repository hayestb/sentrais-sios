"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import Link from "next/link";

interface AgentConfig {
  id: string;
  agentName: string;
  agentEmail: string | null;
  modelTier: string;
  isActive: boolean;
  version: string;
  lastDeployedAt: string | null;
  last_run_at: string | null;
  last_verdict: string | null;
  last_task: string | null;
  last_triggered_by: string | null;
}

interface RunResult {
  agent_name: string;
  verdict: string;
  response: string;
  sha256_hash: string;
  ledger_entry_id: string;
  timestamp: string;
  tokens_used?: number;
}

const AGENT_META: Record<string, {
  spec: string;
  tagline: string;
  description: string;
  triggers: string[];
  schedule: string;
  defaultTask: string;
}> = {
  governance: {
    spec: "SPEC 01",
    tagline: "Firewall enforcement · RACI routing · Escalation management",
    description: "Enforces the three hard firewall rules, monitors privileged engagement assignments, scans for ARI civic stakeholder violations, and resets RACI accountability every Monday.",
    triggers: ["Firewall scan", "Privileged engagement audit", "RACI reset", "Escalation routing"],
    schedule: "Every Monday 07:00 ET (automated)",
    defaultTask: "Run a full governance scan: check overdue decisions, verify privileged engagement assignments, confirm no ARI civic stakeholders appear in commercial engagements. Output VERDICT and any required escalations.",
  },
  qa: {
    spec: "SPEC 03",
    tagline: "Document scan · Hard block enforcement · Gate validation",
    description: "Scans documents for BRIC contamination and retired entity references, validates Blueprint360 gate readiness scores, and applies CLEARED / BLOCKED / CONDITIONAL verdicts.",
    triggers: ["BRIC contamination scan", "Gate readiness check", "Document status scan", "AP overdue sweep"],
    schedule: "Every Thursday 08:00 ET (automated)",
    defaultTask: "Run a QA scan: check for stalled documents, programs below the 80% readiness gate, and any AP invoices past due date. Output VERDICT per finding with BLOCKED items clearly flagged.",
  },
  financial: {
    spec: "SPEC 02",
    tagline: "Expense policy · Billback enforcement · Anti-commingling",
    description: "Enforces the three-tier card policy, mandatory billback project codes, dual-officer wire rules, and Rule 4 anti-commingling.",
    triggers: ["Expense audit", "Billback validation", "Commingling check", "AP value sweep"],
    schedule: "Daily 06:00 ET — pending platform selection",
    defaultTask: "Run a financial compliance scan: check for invoices missing project codes, expense records violating card tier policy, and confirm no commercial-to-ARI transfers exist. Output VERDICT and FLAGS.",
  },
};

const VERDICT_STYLE: Record<string, string> = {
  CLEARED: "bg-green-500/10 text-green-400 border-green-500/30",
  BLOCKED: "bg-red-500/20 text-red-300 border-red-500/50",
  CONDITIONAL: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  FLAGGED: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  COMPLETE: "bg-secondary text-muted-foreground border-border",
};

function VerdictBadge({ verdict }: { verdict: string | null }) {
  if (!verdict) return <span className="text-xs font-mono text-muted-foreground">No runs yet</span>;
  const style = VERDICT_STYLE[verdict] ?? VERDICT_STYLE.COMPLETE;
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-mono font-bold ${style}`}>
      {verdict}
    </span>
  );
}

function timeAgo(ts: string | null): string {
  if (!ts) return "Never";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AgentCard({
  agent,
  onRun,
}: {
  agent: AgentConfig;
  onRun: (agentName: string, task: string) => Promise<void>;
}) {
  const meta = AGENT_META[agent.agentName];
  const [expanded, setExpanded] = useState(false);
  const [task, setTask] = useState(meta?.defaultTask ?? "");
  const [running, setRunning] = useState(false);
  const isBlocked = agent.last_verdict === "BLOCKED";

  const handleRun = async () => {
    if (running || !agent.isActive) return;
    setRunning(true);
    await onRun(agent.agentName, task);
    setRunning(false);
  };

  return (
    <div className={`rounded-lg border transition-colors ${
      isBlocked ? "border-red-500/40 bg-red-500/5"
      : !agent.isActive ? "border-border opacity-50"
      : "border-border bg-secondary/20"
    }`}>
      <div
        className="flex items-center gap-4 px-4 py-3.5 cursor-pointer select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className={`w-2 h-2 rounded-full shrink-0 ${agent.isActive ? "bg-green-400" : "bg-muted-foreground"}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground capitalize">{agent.agentName}</span>
            {meta && <span className="text-[10px] font-mono text-muted-foreground">{meta.spec}</span>}
            <span className="text-[10px] font-mono border border-border rounded px-1.5 py-0.5 text-muted-foreground">
              {agent.modelTier.replace("claude-", "").replace("-4-5-20251001", "").replace("-4-6", "").replace("-4-8", "")}
            </span>
            {isBlocked && (
              <span className="text-[10px] font-mono text-red-300 border border-red-500/40 rounded px-1.5 py-0.5 bg-red-500/10">
                BLOCKED — ACTION REQUIRED
              </span>
            )}
          </div>
          {meta && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{meta.tagline}</p>}
        </div>
        <VerdictBadge verdict={agent.last_verdict} />
        <div className="text-right shrink-0 w-20">
          <p className="text-xs font-mono text-muted-foreground">{timeAgo(agent.last_run_at)}</p>
          {agent.last_triggered_by && (
            <p className="text-[10px] font-mono text-muted-foreground/60 truncate">{agent.last_triggered_by}</p>
          )}
        </div>
        <span className="text-muted-foreground text-xs w-3 shrink-0">{expanded ? "▼" : "▶"}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-border space-y-3">
          {meta && (
            <>
              <p className="text-sm text-foreground/80 leading-relaxed">{meta.description}</p>
              <div className="flex gap-1.5 flex-wrap">
                {meta.triggers.map((t) => (
                  <span key={t} className="text-[10px] font-mono border border-border rounded px-2 py-0.5 text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-[11px] font-mono text-muted-foreground">
                Schedule: {meta.schedule}
              </p>
            </>
          )}

          {agent.last_task && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Last task</p>
              <p className="text-xs text-foreground/70 leading-relaxed line-clamp-2">{String(agent.last_task)}</p>
            </div>
          )}

          <div className="border-t border-border pt-3 space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Manual trigger</p>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              rows={3}
              className="w-full rounded border border-border bg-secondary px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
              placeholder="Describe the task for this agent run…"
            />
            <button
              onClick={handleRun}
              disabled={running || !agent.isActive}
              className={`w-full rounded py-2 text-sm font-semibold transition-colors ${
                running || !agent.isActive
                  ? "bg-secondary text-muted-foreground cursor-not-allowed"
                  : "bg-[#0EA5E9]/80 hover:bg-[#0EA5E9] text-white"
              }`}
            >
              {running
                ? `Running ${agent.agentName} agent…`
                : !agent.isActive
                ? "Agent offline"
                : `Run ${agent.agentName.charAt(0).toUpperCase() + agent.agentName.slice(1)} Agent`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgentConsolePage() {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<RunResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      if (!res.ok) {
        const d = await res.json();
        setLoadError(d.error ?? "Failed to load agents");
        return;
      }
      const data = await res.json();
      setAgents(data.agents ?? []);
    } catch {
      setLoadError("Network error loading agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const handleRun = async (agentName: string, task: string) => {
    setRunError(null);
    setActiveResult(null);
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_name: agentName, task, trigger_type: "manual" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRunError(data.error ?? "Agent run failed");
        return;
      }
      setActiveResult(data);
      fetchAgents(); // refresh last_verdict
    } catch {
      setRunError("Network error during agent run");
    }
  };

  const specsAgents = agents.filter((a) => AGENT_META[a.agentName]);
  const otherAgents = agents.filter((a) => !AGENT_META[a.agentName]);
  const activeCount = agents.filter((a) => a.isActive).length;
  const blockedCount = agents.filter((a) => a.last_verdict === "BLOCKED").length;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Agent Console"
        subtitle="FORGE Agent Network — status, run, and Evidence Ledger feed"
      />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Agents", value: String(agents.length || "—"), color: "text-[#0EA5E9]" },
            { label: "Active", value: String(activeCount || "—"), color: "text-green-400" },
            { label: "BLOCKED", value: String(blockedCount), color: blockedCount > 0 ? "text-red-400" : "text-muted-foreground" },
            { label: "Spec Agents", value: String(specsAgents.length || "—"), color: "text-amber-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-secondary/20 p-4">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Active run result */}
        {activeResult && (
          <div className={`rounded-lg border p-5 space-y-3 ${
            activeResult.verdict === "BLOCKED" ? "border-red-500/40 bg-red-500/5"
            : activeResult.verdict === "CLEARED" ? "border-green-500/30 bg-green-500/5"
            : "border-amber-500/30 bg-amber-500/5"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-semibold capitalize">{activeResult.agent_name} Agent</span>
                <VerdictBadge verdict={activeResult.verdict} />
              </div>
              <button onClick={() => setActiveResult(null)} className="text-xs text-muted-foreground hover:text-foreground">dismiss</button>
            </div>
            <div className="rounded border border-border bg-secondary px-4 py-3 text-sm font-mono text-foreground whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {activeResult.response}
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px] font-mono text-muted-foreground">
              <div>
                <span className="block text-muted-foreground/60">Ledger ID</span>
                {activeResult.ledger_entry_id?.slice(0, 8)}…
              </div>
              <div>
                <span className="block text-muted-foreground/60">SHA-256</span>
                {activeResult.sha256_hash?.slice(0, 16)}…
              </div>
            </div>
          </div>
        )}

        {runError && (
          <div className="rounded border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400 font-mono">
            {runError}
          </div>
        )}

        {loading && (
          <div className="text-sm text-muted-foreground">Loading agent configs…</div>
        )}

        {loadError && !loading && (
          <div className="rounded border border-border bg-secondary/30 p-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">{loadError}</p>
            <p className="text-xs text-muted-foreground/60">
              Seed agent configs via the database to enable live runs.{" "}
              <Link href="/agents/prompt-editor" className="text-[#0EA5E9] hover:underline">Prompt editor →</Link>
            </p>
          </div>
        )}

        {!loading && !loadError && (
          <>
            {specsAgents.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">SPEC Agents (Governance · Financial · QA)</p>
                {specsAgents.map((a) => (
                  <AgentCard key={a.id} agent={a} onRun={handleRun} />
                ))}
              </div>
            )}

            {otherAgents.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">All Agents</p>
                {otherAgents.map((a) => (
                  <AgentCard key={a.id} agent={a} onRun={handleRun} />
                ))}
              </div>
            )}

            {agents.length === 0 && (
              <div className="rounded border border-border p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">No agent configs found in database.</p>
                <Link href="/agents/prompt-editor" className="text-xs text-[#0EA5E9] hover:underline">
                  Open Prompt Editor to create configs →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

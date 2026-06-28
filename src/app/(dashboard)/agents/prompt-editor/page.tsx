"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AGENT_CATALOG } from "@/lib/agents/catalog";
import {
  Bot, Save, AlertTriangle, CheckCircle2, Loader2, Shield, BookOpen, History,
} from "lucide-react";
import type { AgentName } from "@/lib/workflow/types";

interface AgentConfig {
  id: string;
  agentName: AgentName;
  agentEmail: string | null;
  modelTier: string;
  systemPrompt: string;
  version: string;
  isActive: boolean;
  lastDeployedAt: string | null;
}

interface LedgerEntry {
  id: string;
  subject: string;
  sha256Hash: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

const MODEL_OPTIONS = [
  "claude-opus-4-8",
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
];

export default function PromptEditorPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentName | null>(null);
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [history, setHistory] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [modelTier, setModelTier] = useState("");
  const [changelog, setChangelog] = useState("");
  const [error, setError] = useState<{ message: string; clause?: string } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadAgent(name: AgentName) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setSelectedAgent(name);
    try {
      const res = await fetch(`/api/agents/prompt?agent_name=${name}`);
      const data = await res.json();
      if (!res.ok) {
        setError({ message: data.error ?? "Failed to load agent config" });
        setConfig(null);
        return;
      }
      setConfig(data.config);
      setHistory(data.history ?? []);
      setPrompt(data.config.systemPrompt);
      setModelTier(data.config.modelTier);
      setChangelog("");
    } catch {
      setError({ message: "Network error loading agent config" });
    } finally {
      setLoading(false);
    }
  }

  async function savePrompt() {
    if (!selectedAgent || !config) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/agents/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_name: selectedAgent,
          system_prompt: prompt,
          model_tier: modelTier,
          changelog,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError({ message: data.error, clause: data.clause });
        return;
      }
      setConfig(data.agent);
      setChangelog("");
      setSuccess(data.message);
      // reload history
      await loadAgent(selectedAgent);
    } catch {
      setError({ message: "Network error saving prompt" });
    } finally {
      setSaving(false);
    }
  }

  const sovereignOk = prompt.toLowerCase().includes("sovereign lock") &&
    (prompt.toLowerCase().includes("you never sign") || prompt.toLowerCase().includes("never sign"));
  const ledgerOk = prompt.toLowerCase().includes("evidence ledger") &&
    (prompt.toLowerCase().includes("log") || prompt.toLowerCase().includes("sha-256") || prompt.toLowerCase().includes("hash"));

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Agent Prompt Editor"
        subtitle="Sovereign Lock enforced — every save logged to Evidence Ledger"
      />
      <div className="flex-1 flex overflow-hidden">

        {/* Agent selector sidebar */}
        <div className="w-56 border-r border-border overflow-y-auto p-3 space-y-1 shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-1">Agents</p>
          {AGENT_CATALOG.map((a) => (
            <button
              key={a.name}
              onClick={() => loadAgent(a.name)}
              className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                selectedAgent === a.name
                  ? "bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/30"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <div className="font-medium truncate">{a.label}</div>
              <div className="text-[10px] opacity-60">{a.domain}</div>
            </button>
          ))}
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!selectedAgent && (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Select an agent to edit its system prompt.
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" /> Loading config…
            </div>
          )}

          {selectedAgent && !loading && config && (
            <>
              {/* Header row */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-[#0EA5E9]" />
                  <span className="text-sm font-semibold">
                    {AGENT_CATALOG.find((a) => a.name === selectedAgent)?.label}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">v{config.version}</Badge>
                  {config.isActive ? (
                    <Badge variant="passed" className="text-[10px]">Active</Badge>
                  ) : (
                    <Badge variant="locked" className="text-[10px]">Inactive</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="font-mono">{config.agentEmail}</span>
                </div>
              </div>

              {/* Governance compliance badges */}
              <div className="flex gap-2 flex-wrap">
                <div className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border ${
                  sovereignOk ? "border-green-500/30 bg-green-500/5 text-green-400" : "border-amber-500/30 bg-amber-500/5 text-amber-400"
                }`}>
                  <Shield size={10} />
                  Sovereign Lock {sovereignOk ? "✓" : "missing"}
                </div>
                <div className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border ${
                  ledgerOk ? "border-green-500/30 bg-green-500/5 text-green-400" : "border-amber-500/30 bg-amber-500/5 text-amber-400"
                }`}>
                  <BookOpen size={10} />
                  Evidence Ledger mandate {ledgerOk ? "✓" : "missing"}
                </div>
              </div>

              {/* Model picker */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground w-20 shrink-0">Model tier</label>
                <select
                  value={modelTier}
                  onChange={(e) => setModelTier(e.target.value)}
                  className="text-xs bg-secondary border border-border rounded px-2 py-1 text-foreground"
                >
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Prompt editor */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">System prompt</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="font-mono text-xs min-h-[320px] resize-y"
                  placeholder="Enter system prompt…"
                />
              </div>

              {/* Changelog */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">
                  Changelog note <span className="text-red-400">*</span>
                </label>
                <Input
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="Describe what changed and why (min 10 chars)…"
                  className="text-xs"
                />
              </div>

              {/* Error / Success */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded border border-red-500/30 bg-red-500/5 text-red-400 text-xs">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">{error.clause ? `Validation: ${error.clause}` : "Error"}</div>
                    <div className="mt-0.5 opacity-80">{error.message}</div>
                  </div>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 p-3 rounded border border-green-500/30 bg-green-500/5 text-green-400 text-xs">
                  <CheckCircle2 size={13} />
                  {success}
                </div>
              )}

              {/* Save button */}
              <Button
                onClick={savePrompt}
                disabled={saving || changelog.trim().length < 10}
                className="gap-2"
                size="sm"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {saving ? "Saving…" : "Save Prompt"}
              </Button>

              {/* Version history */}
              {history.length > 0 && (
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground">
                      <History size={12} /> Version history (last {history.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {history.map((entry) => (
                      <div key={entry.id} className="text-[10px] p-2 rounded border border-border">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground">{entry.subject}</span>
                          <span className="text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="font-mono text-muted-foreground mt-0.5 truncate">{entry.sha256Hash}</div>
                        {typeof entry.payload?.changelog === "string" && (
                          <div className="text-muted-foreground mt-0.5 italic">
                            &quot;{entry.payload.changelog}&quot;
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {selectedAgent && !loading && !config && !error && (
            <div className="text-sm text-muted-foreground">No config found for this agent yet.</div>
          )}
          {selectedAgent && !loading && error && !config && (
            <div className="flex items-start gap-2 p-3 rounded border border-red-500/30 bg-red-500/5 text-red-400 text-xs">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              {error.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

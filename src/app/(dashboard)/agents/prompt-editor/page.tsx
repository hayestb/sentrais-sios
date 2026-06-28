"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { AGENT_CATALOG } from "@/lib/agents/catalog";
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

interface ValidationResult {
  sovereign_lock: boolean;
  ledger_mandate: boolean;
}

function validatePrompt(prompt: string): ValidationResult {
  const lower = prompt.toLowerCase();
  return {
    sovereign_lock:
      lower.includes("sovereign lock") &&
      (lower.includes("you never sign") || lower.includes("never sign")),
    ledger_mandate:
      lower.includes("evidence ledger") &&
      (lower.includes("log") || lower.includes("sha-256") || lower.includes("hash")),
  };
}

const MODEL_OPTIONS = [
  { value: "claude-haiku-4-5-20251001", label: "Haiku — Fast classification / high volume" },
  { value: "claude-sonnet-4-6", label: "Sonnet — Tool use / governance / structured analysis" },
  { value: "claude-opus-4-8", label: "Opus — Deep reasoning / stateful agents" },
];

const AGENT_COLORS: Record<string, string> = {
  governance: "text-teal-400",
  financial: "text-blue-400",
  qa: "text-purple-400",
  discovery: "text-amber-400",
  delivery: "text-green-400",
  assessment: "text-orange-400",
  architecture: "text-cyan-400",
  communications: "text-pink-400",
  learning: "text-violet-400",
};

function ValidationRow({ label, passing }: { label: string; passing: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <span className={passing ? "text-green-400" : "text-red-400"}>{passing ? "✓" : "✗"}</span>
      <span className={passing ? "text-muted-foreground" : "text-red-400"}>{label}</span>
    </div>
  );
}

export default function AgentPromptEditorPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentName>("governance");
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [history, setHistory] = useState<LedgerEntry[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(false);

  const [draftPrompt, setDraftPrompt] = useState("");
  const [draftModelTier, setDraftModelTier] = useState("claude-sonnet-4-6");
  const [draftActive, setDraftActive] = useState(true);
  const [changelog, setChangelog] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ sha256: string; version: string; timestamp: string } | null>(null);
  const [saveError, setSaveError] = useState<{ message: string; clause?: string } | null>(null);

  const isDirty =
    config !== null &&
    (draftPrompt !== config.systemPrompt ||
      draftModelTier !== config.modelTier ||
      draftActive !== config.isActive);

  const validation = validatePrompt(draftPrompt);
  const validationPasses = validation.sovereign_lock && validation.ledger_mandate;

  const loadConfig = useCallback(async (agentName: AgentName) => {
    setLoadingConfig(true);
    setSaveResult(null);
    setSaveError(null);
    try {
      const res = await fetch(`/api/agents/prompt?agent_name=${agentName}`);
      const data = await res.json();
      if (!res.ok) {
        setSaveError({ message: data.error ?? "Failed to load config" });
        setConfig(null);
        return;
      }
      setConfig(data.config);
      setHistory(data.history ?? []);
      setDraftPrompt(data.config.systemPrompt);
      setDraftModelTier(data.config.modelTier);
      setDraftActive(data.config.isActive);
      setChangelog("");
    } catch {
      setSaveError({ message: "Network error loading agent config" });
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  useEffect(() => {
    loadConfig(selectedAgent);
  }, [selectedAgent, loadConfig]);

  const handleSave = async () => {
    if (!validationPasses || !changelog.trim() || changelog.trim().length < 10) return;
    setSaving(true);
    setSaveResult(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/agents/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_name: selectedAgent,
          system_prompt: draftPrompt,
          model_tier: draftModelTier,
          is_active: draftActive,
          changelog,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError({ message: data.error, clause: data.clause });
        return;
      }
      setSaveResult({ sha256: data.sha256_hash, version: data.new_version, timestamp: data.timestamp });
      setChangelog("");
      loadConfig(selectedAgent);
    } catch {
      setSaveError({ message: "Network error saving prompt" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!config) return;
    setDraftPrompt(config.systemPrompt);
    setDraftModelTier(config.modelTier);
    setDraftActive(config.isActive);
    setChangelog("");
    setSaveResult(null);
    setSaveError(null);
  };

  const agentMeta = AGENT_CATALOG.find((a) => a.name === selectedAgent);
  const agentColor = AGENT_COLORS[selectedAgent] ?? "text-muted-foreground";

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Agent Prompt Editor"
        subtitle="Sovereign Lock enforced — all changes logged to Evidence Ledger with SHA-256"
      />
      <div className="flex-1 flex overflow-hidden">

        {/* Left sidebar — agent selector + validation + history */}
        <div className="w-60 border-r border-border overflow-y-auto p-3 space-y-4 shrink-0">

          {/* Agent selector */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-1">Select Agent</p>
            <div className="space-y-0.5">
              {AGENT_CATALOG.map((a) => (
                <button
                  key={a.name}
                  onClick={() => setSelectedAgent(a.name)}
                  className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                    selectedAgent === a.name
                      ? "bg-secondary border border-border"
                      : "hover:bg-secondary/50 border border-transparent"
                  }`}
                >
                  <div className={`font-medium ${selectedAgent === a.name ? (AGENT_COLORS[a.name] ?? "text-[#0EA5E9]") : "text-foreground"}`}>
                    {a.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{a.domain}</div>
                  {config && selectedAgent === a.name && (
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      v{config.version} · {config.isActive ? "active" : "inactive"}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Live validation */}
          <div className="rounded border border-border bg-secondary/30 p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Prompt Validation</p>
            <ValidationRow label="Sovereign Lock clause" passing={validation.sovereign_lock} />
            <ValidationRow label="Evidence Ledger mandate" passing={validation.ledger_mandate} />
            <p className={`text-[10px] font-mono mt-2 ${validationPasses ? "text-green-400" : "text-red-400"}`}>
              {validationPasses ? "Passes required constraints" : "Fix errors before saving"}
            </p>
          </div>

          {/* Version history */}
          {history.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-1">Prompt History</p>
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="border-l-2 border-border pl-2 space-y-0.5">
                    <p className="text-[10px] text-foreground font-medium leading-snug">{h.subject}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {new Date(h.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {typeof h.payload?.changelog === "string" && (
                      <p className="text-[10px] text-muted-foreground italic">&quot;{h.payload.changelog}&quot;</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/50 font-mono truncate">{h.sha256Hash.slice(0, 16)}…</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Editor header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className={`text-xs font-mono ${agentColor}`}>
                {agentMeta?.label} — {agentMeta?.domain}
              </p>
              {config && (
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Current version: v{config.version}
                  {isDirty && <span className="text-amber-400 ml-2">· Unsaved changes</span>}
                </p>
              )}
            </div>
            {isDirty && (
              <button
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Reset to saved
              </button>
            )}
          </div>

          {/* Model + active toggles */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Model tier</label>
              <select
                value={draftModelTier}
                onChange={(e) => setDraftModelTier(e.target.value)}
                className="text-xs bg-secondary border border-border rounded px-2 py-1 text-foreground focus:outline-none"
              >
                {MODEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Agent active</span>
              <button
                onClick={() => setDraftActive((a) => !a)}
                className={`relative w-9 h-5 rounded-full transition-colors ${draftActive ? "bg-green-600" : "bg-secondary"}`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${draftActive ? "left-4" : "left-0.5"}`}
                />
              </button>
            </div>
          </div>

          {/* Prompt textarea */}
          <div className="rounded border border-border bg-secondary/20 overflow-hidden">
            {loadingConfig ? (
              <div className="h-80 flex items-center justify-center text-sm text-muted-foreground">
                Loading prompt…
              </div>
            ) : (
              <textarea
                value={draftPrompt}
                onChange={(e) => setDraftPrompt(e.target.value)}
                className="w-full h-80 px-4 py-3 bg-transparent text-sm font-mono text-foreground resize-none focus:outline-none leading-relaxed"
                placeholder="System prompt…"
                spellCheck={false}
              />
            )}
          </div>

          {/* Char / line count */}
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>{draftPrompt.length.toLocaleString()} characters</span>
            <span>{draftPrompt.split("\n").length} lines</span>
          </div>

          {/* Changelog */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">
              Changelog note <span className="text-red-400">*</span> (min 10 chars)
            </label>
            <input
              type="text"
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="Describe what changed and why…"
              className="w-full rounded border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#0EA5E9]/50"
            />
            {changelog.length > 0 && changelog.length < 10 && (
              <p className="text-[11px] text-amber-400 font-mono mt-1">
                {10 - changelog.length} more characters required
              </p>
            )}
          </div>

          {/* Error */}
          {saveError && (
            <div className="rounded border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400 font-mono leading-relaxed">
              {saveError.clause && <div className="font-semibold mb-0.5">Validation: {saveError.clause}</div>}
              {saveError.message}
            </div>
          )}

          {/* Success */}
          {saveResult && (
            <div className="rounded border border-green-500/30 bg-green-500/5 px-4 py-3 space-y-1">
              <p className="text-sm text-green-400 font-semibold">Saved at v{saveResult.version}</p>
              <p className="text-xs text-muted-foreground font-mono">
                Logged to Evidence Ledger ·{" "}
                {new Date(saveResult.timestamp).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-[11px] text-muted-foreground/60 font-mono break-all">
                SHA-256: {saveResult.sha256}
              </p>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !isDirty || !validationPasses || changelog.trim().length < 10}
            className={`w-full rounded py-2.5 text-sm font-semibold transition-colors ${
              saving
                ? "bg-secondary text-muted-foreground cursor-not-allowed"
                : !isDirty || !validationPasses || changelog.trim().length < 10
                ? "bg-secondary text-muted-foreground cursor-not-allowed"
                : "bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white"
            }`}
          >
            {saving
              ? "Saving…"
              : !isDirty
              ? "No changes to save"
              : !validationPasses
              ? "Fix validation errors to save"
              : changelog.trim().length < 10
              ? "Add changelog note to save"
              : `Save Prompt — ${selectedAgent.charAt(0).toUpperCase() + selectedAgent.slice(1)} Agent`}
          </button>

          {/* Constraint reminder */}
          <div className="rounded border border-border bg-secondary/20 px-4 py-3 text-xs text-muted-foreground space-y-1">
            <p className="text-foreground font-medium">Required in every prompt version:</p>
            <p>1. <span className="text-foreground">Sovereign Lock</span> — agent must state it never signs, pays, transfers, files, or closes without explicit human authorization.</p>
            <p>2. <span className="text-foreground">Evidence Ledger</span> — agent must log all findings with SHA-256 hash and timestamp.</p>
            <p className="text-muted-foreground/60 pt-1">The API enforces both constraints and rejects prompts that omit them.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

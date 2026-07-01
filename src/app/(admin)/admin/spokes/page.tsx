"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Network, Plus, Loader2, Copy, Check, AlertCircle, Radio } from "lucide-react";

interface Spoke {
  id: string;
  name: string;
  slug: string;
  baseUrl: string | null;
  healthUrl: string | null;
  vertical: string | null;
  stack: string | null;
  oidcClientId: string | null;
  status: string;
  lastEventAt: string | null;
  createdAt: string;
}

const STACK_COLOR: Record<string, string> = {
  supabase: "text-emerald-400",
  firebase: "text-amber-400",
  neon: "text-teal-400",
};

function relTime(iso: string | null): string {
  if (!iso) return "never";
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

const EMPTY_FORM = { name: "", slug: "", baseUrl: "", healthUrl: "", vertical: "", stack: "" };

export default function SpokesPage() {
  const [spokes, setSpokes] = useState<Spoke[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<{ slug: string; key: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coordination/spokes");
      const data = await res.json();
      if (res.ok) setSpokes(data.spokes ?? []);
      else setError(data.error ?? "Failed to load spokes");
    } catch {
      setError("Failed to load spokes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const register = useCallback(async () => {
    setError(null);
    setSubmitting(true);
    try {
      const body = Object.fromEntries(Object.entries(form).filter(([, v]) => v.trim() !== ""));
      const res = await fetch("/api/coordination/spokes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Registration failed (check name/slug)");
        return;
      }
      setNewKey({ slug: data.spoke.slug, key: data.apiKey });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }, [form, load]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Network size={18} className="text-primary" /> Connected Spokes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sentrais 360 OS — apps federated to this hub. They authenticate with a service key and publish events to the Evidence Ledger.
          </p>
        </div>
        <Button size="sm" onClick={() => { setShowForm((s) => !s); setError(null); }}>
          <Plus size={14} className="mr-1" /> Register Spoke
        </Button>
      </div>

      {/* one-time API key banner */}
      {newKey && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="p-4 space-y-2">
            <div className="text-xs font-medium text-primary">
              ✅ Registered <span className="font-mono">{newKey.slug}</span> — copy its service key now (shown once):
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-background border border-border rounded px-2 py-1.5 truncate">{newKey.key}</code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { navigator.clipboard.writeText(newKey.key); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setNewKey(null)}>Dismiss</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* register form */}
      {showForm && (
        <Card className="border-border">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Register a spoke</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Atlanta 360" />
              <Field label="Slug * (kebab-case)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="atl-360" />
              <Field label="Base URL" value={form.baseUrl} onChange={(v) => setForm({ ...form, baseUrl: v })} placeholder="https://…" />
              <Field label="Health URL" value={form.healthUrl} onChange={(v) => setForm({ ...form, healthUrl: v })} placeholder="https://…/health" />
              <Field label="Vertical" value={form.vertical} onChange={(v) => setForm({ ...form, vertical: v })} placeholder="venue" />
              <Field label="Stack" value={form.stack} onChange={(v) => setForm({ ...form, stack: v })} placeholder="supabase" />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={register} disabled={submitting || !form.name || !form.slug}>
                {submitting ? <Loader2 size={13} className="mr-1 animate-spin" /> : null} Create + mint key
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setError(null); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-400/30 bg-red-400/5 px-3 py-2 text-xs text-red-400">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* spokes table */}
      <Card className="border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 size={18} className="animate-spin" />
            </div>
          ) : spokes.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-12">No spokes connected yet. Register one to begin.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="p-3 font-medium">Spoke</th>
                  <th className="p-3 font-medium">Stack</th>
                  <th className="p-3 font-medium">Vertical</th>
                  <th className="p-3 font-medium">SSO</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Last event</th>
                </tr>
              </thead>
              <tbody>
                {spokes.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                    <td className="p-3">
                      <Link href={`/admin/spokes/${s.slug}`} className="text-foreground font-medium hover:text-primary">{s.name}</Link>
                      <div className="text-[10px] text-muted-foreground font-mono">{s.slug}</div>
                    </td>
                    <td className={`p-3 font-mono ${s.stack ? STACK_COLOR[s.stack] ?? "text-muted-foreground" : "text-muted-foreground"}`}>{s.stack ?? "—"}</td>
                    <td className="p-3 text-muted-foreground capitalize">{s.vertical ?? "—"}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={`text-[9px] h-4 px-1.5 ${s.oidcClientId ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {s.oidcClientId ? "linked" : "not linked"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={`text-[9px] h-4 px-1.5 ${s.status === "active" ? "text-[#00D4AA]" : "text-amber-400"}`}>{s.status}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground flex items-center gap-1">
                      {s.lastEventAt && <Radio size={10} className="text-primary" />}
                      {relTime(s.lastEventAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-muted-foreground">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-8 text-xs" />
    </div>
  );
}

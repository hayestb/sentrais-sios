"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Save, Check, AlertCircle, Radio, Activity } from "lucide-react";

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
interface LedgerEvent {
  id: string;
  subject: string;
  payload: Record<string, unknown>;
  sha256Hash: string;
  createdAt: string;
}

function relTime(iso: string | null): string {
  if (!iso) return "never";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function SpokeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [spoke, setSpoke] = useState<Spoke | null>(null);
  const [events, setEvents] = useState<LedgerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ status: "active", oidcClientId: "", baseUrl: "", healthUrl: "", vertical: "", stack: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/coordination/spokes/${slug}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to load"); return; }
      setSpoke(data.spoke);
      setEvents(data.events ?? []);
      setForm({
        status: data.spoke.status ?? "active",
        oidcClientId: data.spoke.oidcClientId ?? "",
        baseUrl: data.spoke.baseUrl ?? "",
        healthUrl: data.spoke.healthUrl ?? "",
        vertical: data.spoke.vertical ?? "",
        stack: data.spoke.stack ?? "",
      });
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        status: form.status,
        oidcClientId: form.oidcClientId.trim() || null,
        baseUrl: form.baseUrl.trim() || null,
        healthUrl: form.healthUrl.trim() || null,
        vertical: form.vertical.trim() || null,
        stack: form.stack.trim() || null,
      };
      const res = await fetch(`/api/coordination/spokes/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(typeof data.error === "string" ? data.error : "Save failed"); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [form, slug, load]);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 size={20} className="animate-spin" /></div>;
  }
  if (!spoke) {
    return (
      <div className="p-6 space-y-4">
        <Link href="/admin/spokes" className="text-xs text-primary flex items-center gap-1"><ArrowLeft size={13} /> Back to spokes</Link>
        <div className="flex items-center gap-2 text-xs text-red-400"><AlertCircle size={14} /> {error ?? "Spoke not found"}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link href="/admin/spokes" className="text-xs text-primary flex items-center gap-1 mb-2 w-fit"><ArrowLeft size={13} /> Back to spokes</Link>
        <h1 className="text-xl font-bold text-foreground">{spoke.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-mono text-muted-foreground">{spoke.slug}</span>
          <Badge variant="outline" className={`text-[9px] h-4 px-1.5 ${spoke.oidcClientId ? "text-emerald-400" : "text-muted-foreground"}`}>{spoke.oidcClientId ? "SSO linked" : "SSO not linked"}</Badge>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">{spoke.lastEventAt && <Radio size={10} className="text-primary" />}last event {relTime(spoke.lastEventAt)}</span>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 rounded-md border border-red-400/30 bg-red-400/5 px-3 py-2 text-xs text-red-400"><AlertCircle size={14} /> {error}</div>}

      <div className="grid grid-cols-2 gap-6">
        {/* Config editor */}
        <Card className="border-border">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-8 text-xs bg-background border border-border rounded px-2 text-foreground">
                <option value="active">active</option>
                <option value="paused">paused</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
            <Field label="OIDC Client ID (set when SSO is wired)" value={form.oidcClientId} onChange={(v) => setForm({ ...form, oidcClientId: v })} placeholder="clerk oauth client id…" />
            <Field label="Base URL" value={form.baseUrl} onChange={(v) => setForm({ ...form, baseUrl: v })} placeholder="https://…" />
            <Field label="Health URL" value={form.healthUrl} onChange={(v) => setForm({ ...form, healthUrl: v })} placeholder="https://…/health" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Vertical" value={form.vertical} onChange={(v) => setForm({ ...form, vertical: v })} />
              <Field label="Stack" value={form.stack} onChange={(v) => setForm({ ...form, stack: v })} />
            </div>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? <Loader2 size={13} className="mr-1 animate-spin" /> : saved ? <Check size={13} className="mr-1" /> : <Save size={13} className="mr-1" />}
              {saved ? "Saved" : "Save changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Recent events */}
        <Card className="border-border">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Activity size={13} className="text-primary" /> Recent events ({events.length})</CardTitle></CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No events published yet.</p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-auto">
                {events.map((e) => (
                  <div key={e.id} className="border-b border-border/50 last:border-0 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-foreground truncate">{e.subject}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{relTime(e.createdAt)}</span>
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground/60">{e.sha256Hash.slice(0, 16)}…</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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

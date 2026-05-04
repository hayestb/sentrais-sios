"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell, CheckCircle2, AlertTriangle, GitBranch, Bot, FileText,
  DollarSign, Users, Activity, RefreshCw, BellOff,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
  profileId: string | null;
  engagementId: string | null;
}

interface LedgerEntry {
  id: string;
  evidenceType: string;
  description: string;
  source: string | null;
  createdAt: string;
  engagementId: string;
}

interface Engagement { id: string; clientName: string; }

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  gate_advanced: { icon: GitBranch, color: "text-primary", label: "Gate Advanced" },
  gate_blocked: { icon: AlertTriangle, color: "text-red-400", label: "Gate Blocked" },
  remediation_created: { icon: CheckCircle2, color: "text-amber-400", label: "Action Created" },
  remediation_done: { icon: CheckCircle2, color: "text-[#00D4AA]", label: "Action Completed" },
  agent_response: { icon: Bot, color: "text-purple-400", label: "Agent Response" },
  invoice_created: { icon: DollarSign, color: "text-green-400", label: "Invoice" },
  evidence_added: { icon: FileText, color: "text-sky-400", label: "Evidence" },
  system: { icon: Activity, color: "text-muted-foreground", label: "System" },
};

const EVIDENCE_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  gate_review: { icon: GitBranch, color: "text-primary" },
  assessment: { icon: CheckCircle2, color: "text-purple-400" },
  deliverable: { icon: FileText, color: "text-sky-400" },
  client_sign_off: { icon: Users, color: "text-[#00D4AA]" },
  agent_output: { icon: Bot, color: "text-amber-400" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function FeedPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "unread" | "activity">("all");

  const load = async () => {
    setLoading(true);
    const [nRes, lRes, eRes] = await Promise.all([
      fetch("/api/notifications"),
      fetch("/api/ledger"),
      fetch("/api/engagements"),
    ]);
    const [nData, lData, eData] = await Promise.all([nRes.json(), lRes.json(), eRes.json()]);
    setNotifications(nData.notifications ?? []);
    setLedger((lData.entries ?? []).slice(0, 30));
    setEngagements(eData.engagements ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await Promise.all(unread.map((n) => fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: n.id }),
    })));
  };

  const engName = (id: string | null) => engagements.find((e) => e.id === id)?.clientName ?? null;

  const displayed = tab === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col h-full">
      <Header title="Engagement Feed" subtitle="Activity stream · Notifications · Evidence ledger events" />
      <div className="flex-1 flex overflow-hidden">

        {/* Notifications panel */}
        <div className="w-80 shrink-0 border-r border-border flex flex-col">
          <div className="p-3 border-b border-border flex items-center gap-2">
            <Bell size={13} className="text-primary" />
            <span className="text-xs font-medium text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 ml-auto border-primary/40 text-primary">
                {unreadCount} new
              </Badge>
            )}
          </div>

          <div className="flex gap-1 p-2 border-b border-border">
            {(["all", "unread"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 text-[10px] py-1 rounded transition-colors ${tab === t ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t === "all" ? "All" : `Unread (${unreadCount})`}
              </button>
            ))}
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] px-2 py-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Mark all read"
              >
                <BellOff size={10} />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <Bell size={24} className="opacity-30" />
                <p className="text-xs">{tab === "unread" ? "All caught up" : "No notifications"}</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {displayed.map((n) => {
                  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => !n.read && markRead(n.id)}
                      className={`w-full text-left p-3 transition-colors hover:bg-secondary/30 ${!n.read ? "bg-primary/5" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon size={12} className={`${cfg.color} mt-0.5 shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-medium text-foreground leading-snug">{n.title}</span>
                            {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                          </div>
                          {n.body && <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{n.body}</p>}
                          <div className="flex items-center gap-2 mt-1">
                            {n.engagementId && (
                              <span className="text-[9px] text-muted-foreground/70">{engName(n.engagementId)}</span>
                            )}
                            <span className="text-[9px] text-muted-foreground/60 ml-auto">{timeAgo(n.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <Activity size={14} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Activity Stream</span>
            <div className="flex gap-1 ml-auto">
              <button
                onClick={() => setTab("activity")}
                className={`text-[10px] px-3 py-1 rounded border transition-colors ${tab === "activity" ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                Evidence Ledger
              </button>
              <Button size="sm" variant="outline" onClick={load} disabled={loading} className="h-6 px-2">
                <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw size={18} className="animate-spin text-muted-foreground" />
              </div>
            ) : tab === "activity" ? (
              /* Evidence Ledger stream */
              <div className="space-y-2 max-w-2xl">
                {ledger.length === 0 ? (
                  <div className="text-center py-12 text-sm text-muted-foreground">No evidence entries yet.</div>
                ) : (
                  ledger.map((entry) => {
                    const cfg = EVIDENCE_TYPE_CONFIG[entry.evidenceType] ?? { icon: FileText, color: "text-muted-foreground" };
                    const Icon = cfg.icon;
                    const client = engName(entry.engagementId);
                    return (
                      <div key={entry.id} className="flex gap-3 items-start">
                        <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 mt-0.5">
                          <Icon size={12} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-[9px] h-4 px-1.5 ${cfg.color} border-current/30`}>
                              {entry.evidenceType.replace(/_/g, " ")}
                            </Badge>
                            {client && <span className="text-[10px] text-muted-foreground">{client}</span>}
                            <span className="text-[9px] text-muted-foreground/60 ml-auto">{timeAgo(entry.createdAt)}</span>
                          </div>
                          <p className="text-xs text-foreground mt-0.5 leading-snug">{entry.description}</p>
                          {entry.source && <p className="text-[10px] text-muted-foreground mt-0.5">Source: {entry.source}</p>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* Combined notifications stream */
              <div className="space-y-2 max-w-2xl">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-sm text-muted-foreground">No activity yet.</div>
                ) : (
                  notifications.slice(0, 40).map((n) => {
                    const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
                    const Icon = cfg.icon;
                    const client = engName(n.engagementId);
                    return (
                      <Card key={n.id} className={`border-border ${!n.read ? "border-primary/20 bg-primary/5" : ""}`}>
                        <CardContent className="p-3">
                          <div className="flex gap-3 items-start">
                            <div className={`w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0`}>
                              <Icon size={12} className={cfg.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-medium text-foreground">{n.title}</span>
                                <Badge variant="outline" className="text-[9px] h-4 px-1.5">{cfg.label}</Badge>
                                {!n.read && (
                                  <button
                                    onClick={() => markRead(n.id)}
                                    className="text-[9px] text-primary hover:underline ml-auto"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                              {n.body && <p className="text-xs text-muted-foreground mt-1 leading-snug">{n.body}</p>}
                              <div className="flex items-center gap-2 mt-1.5">
                                {client && <span className="text-[10px] text-muted-foreground">{client}</span>}
                                <span className="text-[9px] text-muted-foreground/60 ml-auto">{timeAgo(n.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

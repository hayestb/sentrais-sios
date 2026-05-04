"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, Calendar, GitBranch, Zap,
  DollarSign, Package, AlertCircle, RefreshCw, CheckCircle2, XCircle,
} from "lucide-react";

interface ConnectionStatus {
  connected: boolean;
  syncEnabled?: boolean;
  lastSyncedAt?: string | null;
  expired?: boolean;
}

interface CalEvent {
  id: string;
  date: string;
  title: string;
  subtitle?: string;
  type: "gate" | "sprint" | "milestone" | "vendor" | "remediation";
  color: string;
  engagementName?: string;
}

const TYPE_CONFIG = {
  gate:        { icon: GitBranch,    color: "bg-primary/20 text-primary border-primary/30",           dot: "bg-primary" },
  sprint:      { icon: Calendar,     color: "bg-purple-400/20 text-purple-400 border-purple-400/30",  dot: "bg-purple-400" },
  milestone:   { icon: DollarSign,   color: "bg-[#00D4AA]/20 text-[#00D4AA] border-[#00D4AA]/30",    dot: "bg-[#00D4AA]" },
  vendor:      { icon: Package,      color: "bg-orange-400/20 text-orange-400 border-orange-400/30",  dot: "bg-orange-400" },
  remediation: { icon: AlertCircle,  color: "bg-red-400/20 text-red-400 border-red-400/30",           dot: "bg-red-400" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [selected, setSelected] = useState<Date>(new Date());
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [syncingOutlook, setSyncingOutlook] = useState(false);
  const [syncResult, setSyncResult] = useState<{ provider: string; synced: number } | null>(null);
  const [connections, setConnections] = useState<{ google: ConnectionStatus; outlook: ConnectionStatus }>({
    google: { connected: false }, outlook: { connected: false },
  });
  const searchParams = useSearchParams();

  const loadConnections = useCallback(() => {
    fetch("/api/calendar/connections").then((r) => r.json()).then((d) => setConnections(d));
  }, []);

  useEffect(() => {
    fetch("/api/calendar/events").then((r) => r.json()).then((d) => {
      setEvents(d.events ?? []);
      setLoading(false);
    });
    loadConnections();
  }, [loadConnections]);

  // Show toast-like feedback after OAuth redirect
  useEffect(() => {
    const connected = searchParams.get("connected");
    if (connected) loadConnections();
  }, [searchParams, loadConnections]);

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  // Build calendar grid
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsForDay = (date: Date | null) => {
    if (!date) return [];
    return events.filter((e) => isSameDay(new Date(e.date), date));
  };

  const selectedEvents = eventsForDay(selected);

  const upcoming = events
    .filter((e) => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  const handleCalendarAction = async (provider: "google" | "outlook") => {
    const conn = connections[provider];
    const setSyncing = provider === "google" ? setSyncingGoogle : setSyncingOutlook;

    if (!conn.connected) {
      window.location.href = `/api/calendar/${provider}/connect`;
      return;
    }

    setSyncing(true);
    setSyncResult(null);
    const res = await fetch("/api/calendar/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    const data = await res.json() as { synced?: number; connectUrl?: string; error?: string };
    if (data.connectUrl) {
      window.location.href = data.connectUrl;
    } else if (typeof data.synced === "number") {
      setSyncResult({ provider, synced: data.synced });
      loadConnections();
    }
    setSyncing(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Operational Calendar"
        subtitle="Sprint cycles · Gate reviews · Milestones · Vendor renewals · All engagements"
      />
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar panel */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {/* Month nav */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={prevMonth} className="h-7 w-7 p-0">
                <ChevronLeft size={13} />
              </Button>
              <span className="text-sm font-semibold text-foreground w-36 text-center">
                {MONTHS[month]} {year}
              </span>
              <Button variant="outline" size="sm" onClick={nextMonth} className="h-7 w-7 p-0">
                <ChevronRight size={13} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setViewDate(new Date()); setSelected(new Date()); }} className="h-7 text-xs px-3">
                Today
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {syncResult && (
                <span className="text-[10px] text-green-400 flex items-center gap-1">
                  <CheckCircle2 size={10} /> {syncResult.synced} events → {syncResult.provider}
                </span>
              )}
              <Button
                size="sm"
                variant={connections.google.connected ? "default" : "outline"}
                onClick={() => handleCalendarAction("google")}
                disabled={syncingGoogle}
                className="h-7 text-xs gap-1.5"
              >
                {syncingGoogle ? <RefreshCw size={10} className="animate-spin" /> : connections.google.connected ? <CheckCircle2 size={10} /> : <Calendar size={10} />}
                Google {connections.google.connected ? "Sync" : "Connect"}
              </Button>
              <Button
                size="sm"
                variant={connections.outlook.connected ? "default" : "outline"}
                onClick={() => handleCalendarAction("outlook")}
                disabled={syncingOutlook}
                className="h-7 text-xs gap-1.5"
              >
                {syncingOutlook ? <RefreshCw size={10} className="animate-spin" /> : connections.outlook.connected ? <CheckCircle2 size={10} /> : <Zap size={10} />}
                Outlook {connections.outlook.connected ? "Sync" : "Connect"}
              </Button>
              {(connections.google.expired || connections.outlook.expired) && (
                <span className="text-[10px] text-amber-400 flex items-center gap-1">
                  <XCircle size={10} /> Token expired — reconnect
                </span>
              )}
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px">
            {DAYS.map((d) => (
              <div key={d} className="text-[10px] font-semibold text-muted-foreground text-center py-1 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border border-border">
            {cells.map((date, idx) => {
              const dayEvents = eventsForDay(date);
              const isToday = date ? isSameDay(date, today) : false;
              const isSelected = date ? isSameDay(date, selected) : false;
              const isCurrentMonth = date?.getMonth() === month;

              return (
                <div
                  key={idx}
                  onClick={() => date && setSelected(date)}
                  className={`bg-card min-h-[80px] p-1.5 cursor-pointer transition-colors hover:bg-secondary/50 ${isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary/30" : ""}`}
                >
                  {date && (
                    <>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium mb-1 ${
                        isToday ? "bg-primary text-primary-foreground" :
                        isSelected ? "text-primary" :
                        isCurrentMonth ? "text-foreground" : "text-muted-foreground/40"
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map((ev) => {
                          const cfg = TYPE_CONFIG[ev.type];
                          return (
                            <div key={ev.id} className={`text-[9px] px-1.5 py-0.5 rounded border truncate ${cfg.color}`}>
                              {ev.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] text-muted-foreground px-1">+{dayEvents.length - 2}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected day events */}
          {selectedEvents.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="text-xs font-medium text-foreground mb-3">
                  {selected.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </div>
                <div className="space-y-2">
                  {selectedEvents.map((ev) => {
                    const cfg = TYPE_CONFIG[ev.type];
                    const Icon = cfg.icon;
                    return (
                      <div key={ev.id} className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                        <Icon size={12} className={`shrink-0 ${ev.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-foreground font-medium">{ev.title}</div>
                          {(ev.subtitle || ev.engagementName) && (
                            <div className="text-[10px] text-muted-foreground">{ev.subtitle}{ev.engagementName ? ` · ${ev.engagementName}` : ""}</div>
                          )}
                        </div>
                        <Badge variant="outline" className={`text-[9px] h-4 px-1.5 shrink-0 ${cfg.color}`}>{ev.type}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upcoming sidebar */}
        <div className="w-64 shrink-0 border-l border-border flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-xs font-medium text-foreground">Upcoming Events</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Next across all engagements</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-xs text-muted-foreground text-center">Loading…</div>
            ) : upcoming.length === 0 ? (
              <div className="p-4 text-xs text-muted-foreground text-center">No upcoming events.</div>
            ) : (
              <div className="divide-y divide-border/50">
                {upcoming.map((ev) => {
                  const cfg = TYPE_CONFIG[ev.type];
                  const Icon = cfg.icon;
                  const evDate = new Date(ev.date);
                  const daysAway = Math.round((evDate.getTime() - today.getTime()) / 86400000);
                  return (
                    <button
                      key={ev.id}
                      onClick={() => { setViewDate(new Date(evDate.getFullYear(), evDate.getMonth(), 1)); setSelected(evDate); }}
                      className="w-full text-left p-3 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                        <span className="text-[10px] font-medium text-foreground leading-snug flex-1">{ev.title}</span>
                      </div>
                      <div className="flex items-center justify-between pl-3.5">
                        <span className="text-[9px] text-muted-foreground">
                          {evDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <span className={`text-[9px] ${daysAway <= 3 ? "text-red-400" : daysAway <= 7 ? "text-amber-400" : "text-muted-foreground"}`}>
                          {daysAway === 0 ? "Today" : daysAway === 1 ? "Tomorrow" : `${daysAway}d`}
                        </span>
                      </div>
                      {ev.engagementName && (
                        <div className="text-[9px] text-muted-foreground/60 pl-3.5 truncate">{ev.engagementName}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="p-3 border-t border-border space-y-1.5">
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Legend</div>
            {(Object.entries(TYPE_CONFIG) as [keyof typeof TYPE_CONFIG, typeof TYPE_CONFIG[keyof typeof TYPE_CONFIG]][]).map(([type, cfg]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                <span className="text-[10px] text-muted-foreground capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

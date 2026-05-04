"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2, Circle, Clock, Plus, RefreshCw, AlertTriangle,
  GitBranch, ArrowRight,
} from "lucide-react";

type Status = "todo" | "in_progress" | "done";
interface RemediationAction {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: string;
  assignedTo: string | null;
  gateNumber: number | null;
  engagementId: string | null;
  createdAt: string;
  completedAt: string | null;
}

const COLUMNS: { key: Status; label: string; icon: React.ElementType; color: string }[] = [
  { key: "todo", label: "To Do", icon: Circle, color: "text-muted-foreground" },
  { key: "in_progress", label: "In Progress", icon: Clock, color: "text-amber-400" },
  { key: "done", label: "Done", icon: CheckCircle2, color: "text-[#00D4AA]" },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: "border-red-500/30 bg-red-500/10 text-red-400",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  low: "border-border bg-secondary text-muted-foreground",
};

export default function RemediationPage() {
  const [actions, setActions] = useState<RemediationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/remediation");
    const data = await res.json();
    setActions(data.actions ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const moveCard = async (id: string, status: Status) => {
    setActions((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    await fetch("/api/remediation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  };

  const addAction = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    const res = await fetch("/api/remediation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, priority: "medium" }),
    });
    const data = await res.json();
    setActions((prev) => [...prev, data.action]);
    setNewTitle("");
    setAdding(false);
  };

  const byStatus = (status: Status) => actions.filter((a) => a.status === status);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Remediation Board"
        subtitle="CONDITIONAL GO conditions · Kanban workflow · Gate-linked actions"
      />
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Add action bar */}
        <div className="flex gap-2 mb-6">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addAction()}
            placeholder="Add remediation action…"
            className="flex-1 h-9 px-3 text-sm rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button size="sm" variant="forge" onClick={addAction} disabled={adding || !newTitle.trim()}>
            <Plus size={12} className="mr-1" /> Add
          </Button>
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>

        {/* Stats bar */}
        <div className="flex gap-4 mb-6">
          {COLUMNS.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <Icon size={14} className={color} />
              <span className="text-muted-foreground">{label}:</span>
              <span className="font-semibold text-foreground">{byStatus(key).length}</span>
            </div>
          ))}
          <div className="ml-auto text-xs text-muted-foreground">
            {actions.filter((a) => a.gateNumber != null).length} gate-linked
          </div>
        </div>

        {/* Kanban columns */}
        <div className="grid grid-cols-3 gap-4 h-full">
          {COLUMNS.map(({ key, label, icon: Icon, color }) => (
            <div
              key={key}
              className="kanban-col flex flex-col gap-2 rounded-lg border border-border bg-card/50 p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragging) moveCard(dragging, key);
                setDragging(null);
              }}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <Icon size={13} className={color} />
                <span className="text-xs font-semibold text-foreground">{label}</span>
                <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1.5">
                  {byStatus(key).length}
                </Badge>
              </div>

              {byStatus(key).map((action) => (
                <Card
                  key={action.id}
                  draggable
                  onDragStart={() => setDragging(action.id)}
                  onDragEnd={() => setDragging(null)}
                  className={`border-border cursor-grab active:cursor-grabbing transition-opacity ${dragging === action.id ? "opacity-50" : ""}`}
                >
                  <CardContent className="p-3 space-y-2">
                    <p className="text-xs font-medium text-foreground leading-snug">{action.title}</p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${PRIORITY_COLORS[action.priority] ?? PRIORITY_COLORS.low}`}>
                        {action.priority}
                      </span>
                      {action.gateNumber != null && (
                        <span className="flex items-center gap-0.5 text-[9px] text-primary">
                          <GitBranch size={8} /> Gate {action.gateNumber}
                        </span>
                      )}
                      {action.assignedTo && (
                        <span className="text-[9px] text-muted-foreground truncate max-w-[80px]">{action.assignedTo}</span>
                      )}
                    </div>

                    {/* Quick move buttons */}
                    <div className="flex gap-1">
                      {COLUMNS.filter((c) => c.key !== key).map((col) => (
                        <button
                          key={col.key}
                          onClick={() => moveCard(action.id, col.key)}
                          className="flex-1 h-5 text-[9px] rounded border border-border text-muted-foreground hover:text-foreground hover:border-border/80 flex items-center justify-center gap-0.5 transition-colors"
                        >
                          <ArrowRight size={7} /> {col.label}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {byStatus(key).length === 0 && (
                <div className="flex-1 flex items-center justify-center text-[11px] text-muted-foreground/50 border-2 border-dashed border-border/40 rounded-md py-8">
                  Drop here
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

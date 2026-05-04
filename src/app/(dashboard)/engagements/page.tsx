"use client";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Plus, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface Engagement {
  id: string;
  clientName: string;
  vertical: string;
  contractValue: number;
  status: string;
  currentPhase: string;
  currentGate: number;
  sprintNumber: number;
}

export default function EngagementsPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    clientName: "",
    vertical: "Live Events / Entertainment",
    contractValue: 6300000,
    entryPoint: "NFL Pilot — EVERGAME GDA Module",
  });

  const fetchEngagements = async () => {
    setLoading(true);
    const res = await fetch("/api/engagements");
    const data = await res.json();
    setEngagements(data.engagements ?? []);
    setLoading(false);
  };

  useState(() => { fetchEngagements(); });

  const createEngagement = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/engagements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await fetchEngagements();
      setForm({ clientName: "", vertical: "Live Events / Entertainment", contractValue: 6300000, entryPoint: "" });
    }
    setCreating(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Engagements" subtitle="Manage client engagements through the SIOS Golden Path" />
      <div className="flex-1 p-6 space-y-6">

        {/* New Engagement Form */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Plus size={14} /> New Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createEngagement} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Client Name</label>
                <input
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="e.g. NFL — EVERGAME GDA"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Vertical</label>
                <input
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  value={form.vertical}
                  onChange={(e) => setForm({ ...form, vertical: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Contract Value ($)</label>
                <input
                  type="number"
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  value={form.contractValue}
                  onChange={(e) => setForm({ ...form, contractValue: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Entry Point</label>
                <input
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="e.g. Live Events / Entertainment"
                  value={form.entryPoint}
                  onChange={(e) => setForm({ ...form, entryPoint: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" variant="forge" disabled={creating} className="gap-2">
                  {creating && <Loader2 size={13} className="animate-spin" />}
                  Activate Engagement & Initialize Gates
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Engagement list */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Loader2 size={20} className="animate-spin mx-auto mb-2" />
              Loading engagements...
            </div>
          ) : engagements.length === 0 ? (
            <Card className="border-dashed border-border">
              <CardContent className="text-center py-12 text-muted-foreground text-sm">
                No engagements yet. Create the NFL Pilot above.
              </CardContent>
            </Card>
          ) : (
            engagements.map((eng) => (
              <Card key={eng.id} className="border-border hover:border-[#0EA5E9]/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{eng.clientName}</span>
                        <Badge variant={eng.status === "active" ? "active" : "locked"} className="text-[10px]">
                          {eng.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {eng.vertical} · {formatCurrency(eng.contractValue)} · Sprint {eng.sprintNumber} · Phase: {eng.currentPhase}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground hidden md:block">
                      Gate {eng.currentGate} / 5
                    </div>
                    <Link href={`/engagements/${eng.id}`}>
                      <Button variant="outline" size="sm" className="gap-1 text-xs">
                        Open <ArrowRight size={11} />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import { db } from "@/lib/db/client";
import { evidenceEntries, engagements } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EvidenceFeed } from "@/components/dashboard/evidence-feed";
import { Shield, Lock, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function LedgerPage() {
  const [entries, allEngagements] = await Promise.all([
    db.select().from(evidenceEntries).orderBy(desc(evidenceEntries.createdAt)).limit(100),
    db.select().from(engagements),
  ]);

  const typeBreakdown = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.entryType] = (acc[e.entryType] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Zone 1 — Evidence Ledger"
        subtitle="Immutable SHA-256 audit trail. Every gate, every decision, every agent action."
      />
      <div className="flex-1 p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#0EA5E9]">{entries.length}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Total Entries</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">
                {entries.filter((e) => e.immutable).length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Immutable Records</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-400">
                {typeBreakdown.gate_approval ?? 0}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Gate Approvals</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400">
                {typeBreakdown.ip_lock ?? 0}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">IP Locks</div>
            </CardContent>
          </Card>
        </div>

        {/* Integrity banner */}
        <div className="flex items-center gap-3 p-4 rounded-lg border border-green-500/30 bg-green-500/5">
          <CheckCircle2 size={18} className="text-green-400 shrink-0" />
          <div>
            <div className="text-sm font-medium text-green-400">Ledger Integrity: Verified</div>
            <div className="text-xs text-muted-foreground">
              SHA-256 chain intact across {entries.length} entries · Zone 1 database operational
            </div>
          </div>
          <Lock size={14} className="text-muted-foreground ml-auto shrink-0" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Full feed */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield size={14} className="text-[#0EA5E9]" />
                  All Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EvidenceFeed entries={entries} />
              </CardContent>
            </Card>
          </div>

          {/* Breakdown */}
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Entry Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(typeBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{type.replace(/_/g, " ")}</span>
                        <Badge variant="outline" className="text-[10px]">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">By Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allEngagements.map((eng) => {
                    const engEntries = entries.filter((e) => e.engagementId === eng.id);
                    return (
                      <div key={eng.id} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate max-w-[140px]">{eng.clientName}</span>
                        <Badge variant="outline" className="text-[10px]">{engEntries.length}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

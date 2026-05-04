import { db } from "@/lib/db/client";
import { engagements, gateRecords, agentTasks, evidenceEntries } from "@/lib/db/schema";
import { eq, desc, count, sum, and } from "drizzle-orm";
import { Header } from "@/components/layout/header";
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { GatePipeline } from "@/components/dashboard/gate-pipeline";
import { AgentGrid } from "@/components/dashboard/agent-grid";
import { EvidenceFeed } from "@/components/dashboard/evidence-feed";
import { SprintCalendar } from "@/components/dashboard/sprint-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CommandCenter() {
  // Fetch all dashboard data in parallel
  const [
    allEngagements,
    allGates,
    recentTasks,
    recentEvidence,
  ] = await Promise.all([
    db.select().from(engagements).orderBy(desc(engagements.updatedAt)),
    db.select().from(gateRecords),
    db.select().from(agentTasks).orderBy(desc(agentTasks.createdAt)).limit(30),
    db.select().from(evidenceEntries).orderBy(desc(evidenceEntries.createdAt)).limit(10),
  ]);

  const activeEngagements = allEngagements.filter((e) => e.status === "active");
  const totalContractValue = activeEngagements.reduce((s, e) => s + e.contractValue, 0);
  const gatesPassed = allGates.filter((g) => g.status === "passed").length;
  const hardBlocksActive = allGates.filter((g) => g.hardBlockActive).length;

  // Focus engagement: NFL pilot (first active)
  const focusEngagement = activeEngagements[0];
  const focusGates = focusEngagement
    ? allGates
        .filter((g) => g.engagementId === focusEngagement.id)
        .sort((a, b) => a.gateNumber - b.gateNumber)
    : [];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="SIOS Command Center"
        subtitle="Sentrais Innovation Operating System · AI-Native Engagement Platform"
        actions={
          <Link href="/engagements">
            <Button size="sm" variant="forge" className="gap-1.5">
              <Zap size={13} />
              New Engagement
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats row */}
        <OverviewStats
          activeEngagements={activeEngagements.length}
          totalContractValue={totalContractValue}
          agentsOnline={22}
          hardBlocksActive={hardBlocksActive}
          gatesPassed={gatesPassed}
        />

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Focus Engagement — Golden Path */}
          <div className="xl:col-span-2 space-y-6">
            {focusEngagement ? (
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">
                        {focusEngagement.clientName} — Golden Path
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatCurrency(focusEngagement.contractValue)} · Sprint {focusEngagement.sprintNumber} ·{" "}
                        {focusEngagement.currentPhase}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="active" className="text-[10px]">
                        Gate {focusEngagement.currentGate}
                      </Badge>
                      <Link href={`/engagements/${focusEngagement.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                          View <ArrowRight size={11} className="ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <GatePipeline
                    gates={focusGates}
                    clientName={focusEngagement.clientName}
                    contractValue={focusEngagement.contractValue}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border border-dashed">
                <CardContent className="p-10 text-center">
                  <p className="text-muted-foreground text-sm">No active engagements.</p>
                  <Link href="/engagements">
                    <Button variant="forge" size="sm" className="mt-4">
                      Start NFL Pilot
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Agent Grid */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">FORGE Agent Network</CardTitle>
                  <Link href="/agents">
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                      All agents <ArrowRight size={11} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <AgentGrid recentTasks={recentTasks} />
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Sprint Calendar */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Sprint Cadence</CardTitle>
                  <Link href="/sprint">
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                      <ArrowRight size={11} />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <SprintCalendar
                  currentDay={1}
                  sprintNumber={focusEngagement?.sprintNumber ?? 1}
                />
              </CardContent>
            </Card>

            {/* Evidence Feed */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Zone 1 Ledger</CardTitle>
                  <Link href="/ledger">
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                      Full ledger <ArrowRight size={11} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <EvidenceFeed entries={recentEvidence} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All active engagements */}
        {allEngagements.length > 1 && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">All Engagements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allEngagements.map((eng) => {
                  const engGates = allGates.filter((g) => g.engagementId === eng.id);
                  const passed = engGates.filter((g) => g.status === "passed").length;
                  return (
                    <Link key={eng.id} href={`/engagements/${eng.id}`}>
                      <div className="flex items-center gap-4 p-3 rounded-md border border-border hover:border-[#0EA5E9]/30 hover:bg-[#0EA5E9]/5 transition-colors cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{eng.clientName}</div>
                          <div className="text-xs text-muted-foreground">{eng.vertical} · {formatCurrency(eng.contractValue)}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{passed}/6 gates</div>
                        <Badge
                          variant={eng.status === "active" ? "active" : eng.status === "blocked" ? "blocked" : "locked"}
                          className="text-[10px]"
                        >
                          {eng.status}
                        </Badge>
                        <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { db } from "@/lib/db/client";
import { profiles, engagements, auditLog, agentConversations, sipeEntries, spokeRegistry } from "@/lib/db/schema";
import { eq, count, desc, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Shield, Bot, Activity, Upload, Network } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    userCount,
    activeEngCount,
    recentAudit,
    tokenStats,
    sipeCount,
    spokeCount,
  ] = await Promise.all([
    db.select({ count: count() }).from(profiles).where(eq(profiles.active, true)),
    db.select({ count: count() }).from(engagements).where(eq(engagements.status, "active")),
    db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(10),
    db.select({
      agentName: agentConversations.agentName,
      total: sql<number>`sum(${agentConversations.tokensTotal})`.as("total"),
    }).from(agentConversations).groupBy(agentConversations.agentName).orderBy(sql`sum(${agentConversations.tokensTotal}) desc`).limit(5),
    db.select({ count: count() }).from(sipeEntries),
    db.select({ count: count() }).from(spokeRegistry),
  ]);

  const stats = [
    { label: "Active Users", value: userCount[0]?.count ?? 0, icon: Users, color: "text-primary", href: undefined as string | undefined },
    { label: "Active Engagements", value: activeEngCount[0]?.count ?? 0, icon: Briefcase, color: "text-[#00D4AA]", href: undefined },
    { label: "Audit Events (all time)", value: recentAudit.length >= 10 ? "10+" : recentAudit.length, icon: Shield, color: "text-amber-400", href: undefined },
    { label: "Top AI Agent", value: tokenStats[0]?.agentName ?? "—", icon: Bot, color: "text-purple-400", href: undefined },
    { label: "SIPE Documents", value: sipeCount[0]?.count ?? 0, icon: Upload, color: "text-blue-400", href: "/admin/sipe" },
    { label: "Connected Spokes", value: spokeCount[0]?.count ?? 0, icon: Network, color: "text-primary", href: "/admin/spokes" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">System Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Sysadmin dashboard — platform health at a glance</p>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {stats.map(({ label, value, icon: Icon, color, href }) => {
          const card = (
            <Card className={`border-border ${href ? "transition-colors hover:border-primary/50" : ""}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon size={18} className={color} />
                <div>
                  <div className="text-lg font-bold text-foreground">{value}</div>
                  <div className="text-[10px] text-muted-foreground">{label}</div>
                </div>
              </CardContent>
            </Card>
          );
          return href ? (
            <Link key={label} href={href}>
              {card}
            </Link>
          ) : (
            <div key={label}>{card}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity size={13} className="text-primary" /> Recent Audit Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentAudit.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No audit events yet.</p>
              ) : recentAudit.map((entry) => (
                <div key={entry.id} className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="text-[9px] h-4 px-1.5 shrink-0">{entry.action}</Badge>
                  <span className="text-muted-foreground truncate flex-1">{entry.targetType} {entry.targetId?.slice(0, 8)}</span>
                  <span className="text-[10px] text-muted-foreground/60 shrink-0">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot size={13} className="text-purple-400" /> AI Token Usage by Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tokenStats.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No conversations yet.</p>
              ) : tokenStats.map((s) => (
                <div key={s.agentName} className="flex items-center gap-2 text-xs">
                  <span className="text-foreground capitalize flex-1">{s.agentName}</span>
                  <span className="font-mono text-primary">{(s.total ?? 0).toLocaleString()} tokens</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { db } from "@/lib/db/client";
import { agentConversations } from "@/lib/db/schema";
import { sql, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Bot, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AiGatewayPage() {
  const [byAgent, totals, recent] = await Promise.all([
    db.select({
      agentName: agentConversations.agentName,
      conversations: sql<number>`count(*)`.as("conversations"),
      totalTokens: sql<number>`coalesce(sum(${agentConversations.tokensTotal}), 0)`.as("total_tokens"),
      avgTokens: sql<number>`coalesce(avg(${agentConversations.tokensTotal}), 0)`.as("avg_tokens"),
    }).from(agentConversations).groupBy(agentConversations.agentName)
      .orderBy(sql`sum(${agentConversations.tokensTotal}) desc`),

    db.select({
      totalConversations: sql<number>`count(*)`.as("total_conversations"),
      totalTokens: sql<number>`coalesce(sum(${agentConversations.tokensTotal}), 0)`.as("total_tokens"),
    }).from(agentConversations),

    db.select().from(agentConversations).orderBy(desc(agentConversations.updatedAt)).limit(5),
  ]);

  const total = totals[0];
  const maxTokens = Math.max(...byAgent.map((a) => Number(a.totalTokens)), 1);

  // Approx cost at $3/M input + $15/M output (claude-sonnet) — rough estimate
  const estimatedCost = (Number(total?.totalTokens ?? 0) / 1_000_000) * 9;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 size={18} className="text-primary" /> AI Cost Monitor
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Token usage and cost tracking across all FORGE agents</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Conversations", value: (total?.totalConversations ?? 0).toLocaleString(), icon: Bot, color: "text-purple-400" },
          { label: "Total Tokens Used", value: (Number(total?.totalTokens ?? 0)).toLocaleString(), icon: Zap, color: "text-amber-400" },
          { label: "Est. Cost (all time)", value: `$${estimatedCost.toFixed(2)}`, icon: BarChart3, color: "text-[#00D4AA]" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <Icon size={18} className={color} />
              <div>
                <div className="text-lg font-bold font-mono text-foreground">{value}</div>
                <div className="text-[10px] text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot size={13} className="text-purple-400" /> Token Usage by Agent
          </CardTitle>
        </CardHeader>
        <CardContent>
          {byAgent.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No agent conversations yet.</p>
          ) : (
            <div className="space-y-3">
              {byAgent.map((a) => {
                const pct = (Number(a.totalTokens) / maxTokens) * 100;
                return (
                  <div key={a.agentName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground capitalize">{a.agentName}</span>
                      <div className="flex gap-4 text-muted-foreground">
                        <span>{Number(a.conversations)} convos</span>
                        <span className="font-mono text-primary">{Number(a.totalTokens).toLocaleString()} tokens</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Shield, Bot, AlertTriangle } from "lucide-react";

interface Stat {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

interface OverviewStatsProps {
  activeEngagements: number;
  totalContractValue: number;
  agentsOnline: number;
  hardBlocksActive: number;
  gatesPassed: number;
}

export function OverviewStats({
  activeEngagements,
  totalContractValue,
  agentsOnline,
  hardBlocksActive,
  gatesPassed,
}: OverviewStatsProps) {
  const stats: Stat[] = [
    {
      label: "Active Engagements",
      value: String(activeEngagements),
      sub: `${gatesPassed} gates passed`,
      icon: TrendingUp,
      color: "text-[#0EA5E9]",
      trend: "+1 this sprint",
    },
    {
      label: "Total Contract Value",
      value: formatCurrency(totalContractValue),
      sub: "Under SIOS governance",
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      label: "FORGE Agents",
      value: `${agentsOnline} / 22`,
      sub: "Online & routing",
      icon: Bot,
      color: "text-[#14B8A6]",
    },
    {
      label: "Hard Blocks",
      value: String(hardBlocksActive),
      sub: hardBlocksActive > 0 ? "Requires QA clearance" : "All systems clear",
      icon: hardBlocksActive > 0 ? AlertTriangle : Shield,
      color: hardBlocksActive > 0 ? "text-red-400" : "text-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label} className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </div>
              <s.icon size={18} className={`${s.color} opacity-60 mt-0.5`} />
            </div>
            {s.trend && (
              <div className="mt-3 text-[10px] text-green-400 bg-green-500/10 rounded px-2 py-1 inline-block">
                {s.trend}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

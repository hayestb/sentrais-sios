import { Badge } from "@/components/ui/badge";
import { AGENT_CATALOG } from "@/lib/agents";
import { Bot, Zap } from "lucide-react";
import type { AgentTask } from "@/lib/db/schema";

interface AgentGridProps {
  recentTasks?: AgentTask[];
}

export function AgentGrid({ recentTasks = [] }: AgentGridProps) {
  const tasksByAgent = recentTasks.reduce<Record<string, AgentTask>>((acc, t) => {
    if (!acc[t.agentName]) acc[t.agentName] = t;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {AGENT_CATALOG.map((agent) => {
        const lastTask = tasksByAgent[agent.name];
        const isRunning = lastTask?.status === "running";
        const hasFailed = lastTask?.status === "failed";
        const hasEscalated = lastTask?.status === "escalated";

        return (
          <div
            key={agent.name}
            className={`p-3 rounded-md border text-xs transition-colors ${
              isRunning
                ? "border-[#0EA5E9]/40 bg-[#0EA5E9]/5"
                : hasFailed
                ? "border-red-500/30 bg-red-500/5"
                : hasEscalated
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-border bg-secondary/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isRunning
                    ? "bg-[#0EA5E9] animate-pulse"
                    : hasFailed
                    ? "bg-red-400"
                    : hasEscalated
                    ? "bg-amber-400"
                    : lastTask?.status === "completed"
                    ? "bg-green-400"
                    : "bg-muted-foreground"
                }`}
              />
              <span className="font-medium text-foreground truncate">{agent.label}</span>
              {agent.tier === 1 && (
                <Zap size={10} className="text-amber-400 shrink-0" aria-label="Tier 1" />
              )}
            </div>
            <div className="text-muted-foreground truncate text-[10px]">{agent.domain}</div>
            {lastTask && (
              <div className="mt-1.5 text-[10px] text-muted-foreground truncate">
                Last: {lastTask.taskType.replace(/_/g, " ")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

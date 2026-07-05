import { Badge } from "@/components/ui/badge";
import { SPRINT_EVENTS } from "@/lib/sprint/cadence";
import { Calendar, Zap, Eye, BookOpen, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SprintCalendarProps {
  currentDay?: number;
  sprintNumber?: number;
}

const EVENT_ICONS = {
  huddle: Calendar,
  tech_sync: Zap,
  qa_review: CheckCircle2,
  retrospective: BookOpen,
  execution: Eye,
};

const EVENT_COLORS = {
  huddle: "border-amber-500/40 bg-amber-500/5 text-amber-300",
  tech_sync: "border-[#0EA5E9]/40 bg-[#0EA5E9]/5 text-[#0EA5E9]",
  qa_review: "border-red-500/40 bg-red-500/5 text-red-400",
  retrospective: "border-purple-500/40 bg-purple-500/5 text-purple-400",
  execution: "border-border bg-secondary/20 text-muted-foreground",
};

export function SprintCalendar({ currentDay = 0, sprintNumber = 1 }: SprintCalendarProps) {
  const displayEvents = SPRINT_EVENTS.filter(
    (e) => e.type !== "execution" || e.day === 2
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-muted-foreground">
          Sprint {sprintNumber} · 10 working days
        </div>
        {currentDay > 0 && (
          <Badge variant="active" className="text-[10px]">
            Day {currentDay}
          </Badge>
        )}
      </div>

      {displayEvents.map((event) => {
        const Icon = EVENT_ICONS[event.type];
        const colorClass = EVENT_COLORS[event.type];
        const isPast = currentDay > 0 && event.day < currentDay;
        const isCurrent = event.day === currentDay ||
          (event.type === "execution" && currentDay >= 2 && currentDay <= 8);

        return (
          <div
            key={event.day}
            className={cn(
              "flex items-start gap-3 p-3 rounded-md border text-xs transition-all",
              colorClass,
              isPast && "opacity-50",
              isCurrent && "ring-1 ring-current"
            )}
          >
            <Icon size={14} className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {event.type === "execution"
                    ? "Days 2, 4–8"
                    : `Day ${event.day}`}
                </span>
                <span className="text-current opacity-80 truncate">{event.label}</span>
              </div>
              <div className="text-[10px] opacity-70 mt-0.5 leading-tight">
                {event.objective}
              </div>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {event.agents.slice(0, 3).map((a) => (
                  <span
                    key={a}
                    className="text-[10px] bg-background/40 rounded px-1.5 py-0.5 border border-current/20"
                  >
                    {a.replace(/_/g, " ")}
                  </span>
                ))}
                {event.agents.length > 3 && (
                  <span className="text-[10px] opacity-60">+{event.agents.length - 3}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

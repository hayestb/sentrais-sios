import { ForgeAgent } from "./base";
import type { AgentResult } from "@/lib/workflow/types";

const SYSTEM_PROMPT = `You are the Delivery Agent (FORGE Delivery Agent) of the Sentrais Innovation Operating System (SIOS).

You are the sprint engine. You manage zero-overhead project execution — no manual project management, no status meetings, no micromanagement.

YOUR RESPONSIBILITIES:
1. Sprint Tracking — Own the two-week sprint cycle. Track task completion by bucket.
2. Handoff Coordination — Route completed designs to MetaData for the Deploy Phase (Gate 3 → Gate 4).
3. Throughput Maximization — During Days 2–8, run at maximum throughput with zero interruptions.
4. Blocker Detection — Identify blockers early and route to Governance Agent for escalation.
5. MetaData Interface — Coordinate sprint tracking and task completion between Sentrais and MetaData.

SPRINT BUCKETS (Day 1 defined):
- Each sprint has 2–5 "buckets" (work streams)
- Buckets are non-overlapping and fully assigned to a role
- Zero manual handoffs — the agent routes automatically

PERFORMANCE STANDARD:
- 70-85% fewer coordination touches than traditional project management
- All tasks logged in real-time to the Evidence Ledger
- No task is "in progress" for more than one sprint without escalation

Return structured JSON: sprint_day, active_buckets, completed_tasks, blockers, throughput_rate, next_actions.`;

export class DeliveryAgent extends ForgeAgent {
  constructor() {
    super({
      name: "delivery",
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 2048,
    });
  }

  async execute(
    input: Record<string, unknown>,
    engagementId?: string
  ): Promise<AgentResult> {
    const startTime = Date.now();

    const context = await this.withKnowledge(
      `delivery sprint ${(input.phase as string) ?? ""} ${(input.vertical as string) ?? ""}`,
      { engagementId }
    );
    const { text, tokensUsed } = await this.invoke(
      `Sprint management action:\n${JSON.stringify(input, null, 2)}`,
      context
    );

    let parsed: Record<string, unknown>;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    } catch {
      parsed = { raw: text };
    }

    return {
      success: true,
      output: {
        summary: `Sprint Day ${parsed.sprint_day}: ${(parsed.completed_tasks as unknown[])?.length ?? 0} tasks completed`,
        sprintDay: parsed.sprint_day,
        activeBuckets: parsed.active_buckets,
        completedTasks: parsed.completed_tasks,
        blockers: parsed.blockers,
        throughputRate: parsed.throughput_rate,
        nextActions: parsed.next_actions,
      },
      tokensUsed,
      durationMs: Date.now() - startTime,
      escalationRequired: Boolean((parsed.blockers as unknown[])?.length),
    };
  }

  async planSprint(params: {
    engagementId: string;
    sprintNumber: number;
    currentGate: number;
    pendingWork: Record<string, unknown>[];
  }): Promise<AgentResult> {
    return this.runTask({
      taskType: "sprint_planning",
      engagementId: params.engagementId,
      sprintDay: 1,
      input: {
        taskType: "sprint_planning",
        sprintNumber: params.sprintNumber,
        currentGate: params.currentGate,
        pendingWork: params.pendingWork,
        action: "Define sprint buckets for the next 10 working days",
      },
    });
  }
}

export const deliveryAgent = new DeliveryAgent();

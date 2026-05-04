import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { sprintCycles, engagements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { governanceAgent } from "@/lib/agents/governance";
import { architectureAgent } from "@/lib/agents/architecture";
import { deliveryAgent } from "@/lib/agents/delivery";
import { qaAgent } from "@/lib/agents/qa";
import { learningAgent } from "@/lib/agents/learning";
import { riskAgent } from "@/lib/agents/risk";

const TriggerSchema = z.object({
  sprintId: z.string().uuid(),
  day: z.number().int().min(1).max(10),
});

// Maps sprint day → agents to fire and their task types
const DAY_AUTOMATIONS: Record<number, { agent: string; taskType: string; description: string }[]> = {
  1: [{ agent: "governance", taskType: "raci_reset", description: "Reset RACI matrix for new sprint" }],
  3: [
    { agent: "architecture", taskType: "tech_sync", description: "Technical alignment + state machine review" },
    { agent: "delivery", taskType: "sprint_planning", description: "Sprint bucket allocation + backlog sync" },
  ],
  5: [{ agent: "risk", taskType: "midpoint_risk_review", description: "Mid-sprint risk register update" }],
  9: [{ agent: "qa", taskType: "hard_block_validation", description: "QA hard block scan before retro" }],
  10: [{ agent: "learning", taskType: "sprint_retrospective", description: "Ingest retro data + update SIPE" }],
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = TriggerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { sprintId, day } = parsed.data;

  const [sprint] = await db
    .select()
    .from(sprintCycles)
    .where(eq(sprintCycles.id, sprintId));

  if (!sprint) {
    return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
  }

  const [engagement] = await db
    .select()
    .from(engagements)
    .where(eq(engagements.id, sprint.engagementId));

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  const automations = DAY_AUTOMATIONS[day];
  if (!automations?.length) {
    return NextResponse.json({
      message: `Day ${day} has no scheduled automations`,
      triggered: [],
    });
  }

  const context = {
    engagementId: engagement.id,
    clientName: engagement.clientName,
    vertical: engagement.vertical,
    sprintNumber: sprint.sprintNumber,
    sprintDay: day,
    contractValue: engagement.contractValue,
    currentGate: engagement.currentGate,
  };

  const results: { agent: string; status: string; summary?: string }[] = [];

  for (const auto of automations) {
    try {
      let result;
      switch (auto.agent) {
        case "governance":
          result = await governanceAgent.resetRaciMatrix(engagement.id, sprint.sprintNumber);
          break;
        case "architecture":
          result = await architectureAgent.execute({ ...context, action: "tech_sync" }, engagement.id);
          break;
        case "delivery":
          result = await deliveryAgent.execute({ ...context, action: "sprint_planning" }, engagement.id);
          break;
        case "qa":
          result = await qaAgent.runHardBlockValidation({
            engagementId: engagement.id,
            harnessScore: 0,
            defectCount: 0,
            performanceBenchmark: 0,
            securityPosture: 0,
            testResults: { automated: true, source: "sprint_trigger" },
          });
          break;
        case "learning":
          result = await learningAgent.runSprintRetrospective({
            engagementId: engagement.id,
            sprintId: sprint.id,
            sprintNumber: sprint.sprintNumber,
            completedTasks: [],
            agentPerformance: {},
            gateProgress: { currentGate: engagement.currentGate },
            vertical: engagement.vertical,
          });
          break;
        case "risk":
          result = await riskAgent.execute({ ...context, action: "midpoint_review" }, engagement.id);
          break;
        default:
          result = { success: false, output: { summary: "Unknown agent" } };
      }
      results.push({
        agent: auto.agent,
        status: "completed",
        summary: (result as { output?: { summary?: string } })?.output?.summary ?? "Done",
      });
    } catch (err) {
      results.push({
        agent: auto.agent,
        status: "failed",
        summary: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    sprintId,
    day,
    triggered: results,
    message: `Day ${day} automations fired: ${results.length} agent(s)`,
  });
}

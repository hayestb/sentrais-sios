import { NextRequest, NextResponse } from "next/server";
import { getAgent, AGENT_CATALOG } from "@/lib/agents";
import type { AgentName } from "@/lib/workflow/types";
import { z } from "zod";

const InvokeSchema = z.object({
  taskType: z.string(),
  engagementId: z.string().uuid().optional(),
  input: z.record(z.string(), z.unknown()),
  sprintDay: z.number().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const agentName = name as AgentName;

  const agent = getAgent(agentName);
  if (!agent) {
    const inCatalog = AGENT_CATALOG.find((a) => a.name === agentName);
    if (!inCatalog) {
      return NextResponse.json({ error: `Unknown agent: ${agentName}` }, { status: 404 });
    }
    return NextResponse.json(
      { error: `Agent ${agentName} is registered but not yet instantiated` },
      { status: 501 }
    );
  }

  const body = await req.json();
  const parsed = InvokeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { taskType, engagementId, input, sprintDay } = parsed.data;

  const result = await agent.runTask({
    taskType,
    engagementId,
    input: { taskType, ...input },
    sprintDay,
  });

  return NextResponse.json({ result, agent: agentName });
}

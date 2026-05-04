import { NextRequest } from "next/server";
import { getAgent } from "@/lib/agents";
import type { AgentName } from "@/lib/workflow/types";

// Server-Sent Events — real-time agent streaming for dashboard
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentName = searchParams.get("agent") as AgentName | null;
  const taskType = searchParams.get("taskType") ?? "status_check";
  const engagementId = searchParams.get("engagementId") ?? undefined;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Heartbeat
      send({ type: "connected", timestamp: new Date().toISOString() });

      if (!agentName) {
        send({ type: "error", message: "No agent specified" });
        controller.close();
        return;
      }

      const agent = getAgent(agentName);
      if (!agent) {
        send({ type: "error", message: `Agent ${agentName} not instantiated` });
        controller.close();
        return;
      }

      send({ type: "agent_started", agent: agentName, taskType });

      try {
        const result = await agent.runTask({
          taskType,
          engagementId,
          input: { taskType, streaming: true },
        });

        send({ type: "agent_complete", result });
      } catch (err) {
        send({
          type: "agent_error",
          error: err instanceof Error ? err.message : String(err),
        });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

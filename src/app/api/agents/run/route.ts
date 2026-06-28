import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db/client";
import { agentConfigs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { writeToLedger } from "@/lib/ledger/evidence";
import type { AgentName } from "@/lib/workflow/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Model tier → Anthropic model ID
const MODEL_MAP: Record<string, string> = {
  "claude-haiku-4-5-20251001": "claude-haiku-4-5-20251001",
  "claude-sonnet-4-6": "claude-sonnet-4-6",
  "claude-opus-4-8": "claude-opus-4-8",
  // short-form aliases (FORGE legacy)
  haiku: "claude-haiku-4-5-20251001",
  sonnet: "claude-sonnet-4-6",
  opus: "claude-opus-4-8",
};

const DEFAULT_MODEL = "claude-sonnet-4-6";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (profile.role !== "sysadmin" && profile.role !== "admin") {
    return NextResponse.json({ error: "Agent runs restricted to admins." }, { status: 403 });
  }

  const body = await request.json() as {
    agent_name: AgentName;
    task?: string;
    context?: string;
    trigger_type?: string;
  };

  const { agent_name, task, context, trigger_type = "manual" } = body;

  if (!agent_name) {
    return NextResponse.json({ error: "agent_name required" }, { status: 400 });
  }

  const [config] = await db
    .select()
    .from(agentConfigs)
    .where(and(eq(agentConfigs.agentName, agent_name), eq(agentConfigs.isActive, true)))
    .limit(1);

  if (!config) {
    return NextResponse.json(
      { error: `Agent "${agent_name}" not found or inactive.` },
      { status: 404 }
    );
  }

  const model = MODEL_MAP[config.modelTier] ?? DEFAULT_MODEL;
  const triggeredAt = new Date().toISOString();

  const userContent = `TRIGGER: ${trigger_type.toUpperCase()}
TRIGGERED BY: ${profile.fullName}
TIMESTAMP: ${triggeredAt}

TASK:
${task ?? "General run — no specific task provided."}

${context ? `CONTEXT:\n${context}` : ""}

Respond with your assessment, verdict, and any required actions. For every finding, state clearly:
- VERDICT: CLEARED | BLOCKED | CONDITIONAL | FLAGGED
- ACTION REQUIRED: (what must happen next, if anything)
- ESCALATE TO: (who must be notified, if anyone)

Every response will be logged to the Evidence Ledger.`;

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: config.systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    const agentResponse = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const verdictMatch = agentResponse.match(/VERDICT:\s*(CLEARED|BLOCKED|CONDITIONAL|FLAGGED)/i);
    const verdict = verdictMatch ? verdictMatch[1].toUpperCase() : "COMPLETE";

    const ledgerEntry = await writeToLedger({
      entryType: "agent_run",
      subject: `${agent_name} agent run — ${verdict}`,
      authorAgent: agent_name,
      authorHuman: profile.fullName,
      payload: {
        agent_name,
        model,
        trigger_type,
        task: task?.slice(0, 300) ?? "manual",
        triggered_by: profile.fullName,
        verdict,
        response_preview: agentResponse.slice(0, 500),
      },
    });

    // Mark last_deployed_at as proxy for last run
    await db
      .update(agentConfigs)
      .set({ lastDeployedAt: new Date(), updatedAt: new Date() })
      .where(eq(agentConfigs.id, config.id));

    return NextResponse.json({
      agent_name,
      model,
      verdict,
      response: agentResponse,
      tokens_used: response.usage.input_tokens + response.usage.output_tokens,
      ledger_entry_id: ledgerEntry.id,
      sha256_hash: ledgerEntry.sha256Hash,
      timestamp: ledgerEntry.createdAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Agent run failed: ${message}` }, { status: 500 });
  }
}

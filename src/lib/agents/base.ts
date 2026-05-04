import Anthropic from "@anthropic-ai/sdk";
import type { AgentName, AgentResult } from "@/lib/workflow/types";
import { db } from "@/lib/db/client";
import { agentTasks } from "@/lib/db/schema";
import { writeToLedger } from "@/lib/ledger/evidence";
import { eq } from "drizzle-orm";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const FORGE_MODEL = "claude-sonnet-4-6";

export interface AgentConfig {
  name: AgentName;
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

// ─── Base FORGE Agent ─────────────────────────────────────────────────────────

export abstract class ForgeAgent {
  protected readonly config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  get name(): AgentName {
    return this.config.name;
  }

  protected async invoke(
    userMessage: string,
    context?: Record<string, unknown>
  ): Promise<{ text: string; tokensUsed: number }> {
    const contextBlock = context
      ? `\n\n<context>\n${JSON.stringify(context, null, 2)}\n</context>`
      : "";

    const response = await anthropic.messages.create({
      model: FORGE_MODEL,
      max_tokens: this.config.maxTokens ?? 2048,
      system: [
        {
          type: "text",
          text: this.config.systemPrompt,
          // Prompt caching: system prompts are stable — cache them
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `${userMessage}${contextBlock}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const tokensUsed =
      response.usage.input_tokens + response.usage.output_tokens;

    return { text, tokensUsed };
  }

  protected async invokeStreaming(
    userMessage: string,
    context?: Record<string, unknown>,
    onChunk?: (chunk: string) => void
  ): Promise<{ text: string; tokensUsed: number }> {
    const contextBlock = context
      ? `\n\n<context>\n${JSON.stringify(context, null, 2)}\n</context>`
      : "";

    const stream = anthropic.messages.stream({
      model: FORGE_MODEL,
      max_tokens: this.config.maxTokens ?? 4096,
      system: [
        {
          type: "text",
          text: this.config.systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        { role: "user", content: `${userMessage}${contextBlock}` },
      ],
    });

    let fullText = "";
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        fullText += event.delta.text;
        onChunk?.(event.delta.text);
      }
    }

    const finalMessage = await stream.finalMessage();
    const tokensUsed =
      finalMessage.usage.input_tokens + finalMessage.usage.output_tokens;

    return { text: fullText, tokensUsed };
  }

  // ─── Task Recording ──────────────────────────────────────────────────────────

  async runTask(params: {
    taskType: string;
    engagementId?: string;
    input: Record<string, unknown>;
    sprintDay?: number;
  }): Promise<AgentResult> {
    const startTime = Date.now();

    const [task] = await db
      .insert(agentTasks)
      .values({
        engagementId: params.engagementId,
        agentName: this.config.name,
        taskType: params.taskType,
        status: "running",
        input: params.input,
        sprintDay: params.sprintDay,
      })
      .returning();

    try {
      const result = await this.execute(params.input, params.engagementId);
      const durationMs = Date.now() - startTime;

      await db
        .update(agentTasks)
        .set({
          status: result.escalationRequired ? "escalated" : "completed",
          output: result.output,
          tokensUsed: result.tokensUsed,
          durationMs,
          completedAt: new Date(),
          escalatedTo: result.escalationReason,
        })
        .where(eq(agentTasks.id, task.id));

      // Write to Evidence Ledger
      await writeToLedger({
        engagementId: params.engagementId,
        entryType: "agent_action",
        subject: `${this.config.name}: ${params.taskType}`,
        payload: {
          taskId: task.id,
          taskType: params.taskType,
          summary: result.output.summary ?? result.output,
          tokensUsed: result.tokensUsed,
          durationMs,
        },
        authorAgent: this.config.name,
      });

      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await db
        .update(agentTasks)
        .set({
          status: "failed",
          errorMessage,
          durationMs,
          completedAt: new Date(),
        })
        .where(eq(agentTasks.id, task.id));

      return {
        success: false,
        output: { error: errorMessage },
        durationMs,
        escalationRequired: true,
        escalationReason: `Task failed: ${errorMessage}`,
      };
    }
  }

  // Override in subclasses
  abstract execute(
    input: Record<string, unknown>,
    engagementId?: string
  ): Promise<AgentResult>;
}

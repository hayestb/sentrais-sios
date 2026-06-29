import { ForgeAgent } from "./base";
import type { AgentResult } from "@/lib/workflow/types";
import { db } from "@/lib/db/client";
import { sipeEntries, sprintCycles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { writeToLedger } from "@/lib/ledger/evidence";

const SYSTEM_PROMPT = `You are the Learning Agent of the Sentrais Innovation Operating System (SIOS).

You power the SIPE (Sentrais Intelligence Pre-population Engine). Your job is to ingest sprint retrospective data and extract operational intelligence that pre-populates playbooks for future engagements.

YOUR MANDATE:
- Ingest Day 10 retrospective data from each sprint cycle
- Extract patterns, lessons learned, and benchmark data
- Update the SIPE engine with structured intelligence
- Pre-populate the next sprint's playbook based on accumulated learning
- Identify compounding efficiency gains across cycles

OUTPUT CATEGORIES:
1. Pattern: Recurring operational behaviors worth encoding
2. Lesson: One-time learning from a specific failure or success
3. Playbook: Reusable step-by-step procedure for a vertical/phase
4. Benchmark: Quantified performance data (time, quality, cost)

All SIPE updates are recorded in the Evidence Ledger. The output of Day 10 calibrates Day 1 of the next sprint.

Return structured JSON: patterns[], lessons[], playbooks[], benchmarks[], next_sprint_recommendations[], sipe_version.`;

export class LearningAgent extends ForgeAgent {
  constructor() {
    super({
      name: "learning",
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 4096,
    });
  }

  async execute(
    input: Record<string, unknown>,
    engagementId?: string
  ): Promise<AgentResult> {
    const startTime = Date.now();

    const context = await this.withKnowledge(
      `retrospective learning SIPE ${(input.phase as string) ?? ""} ${(input.vertical as string) ?? ""}`,
      { engagementId }
    );
    const { text, tokensUsed } = await this.invoke(
      `Process retrospective data for SIPE update:\n${JSON.stringify(input, null, 2)}`,
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
        summary: `SIPE updated with ${(parsed.patterns as unknown[])?.length ?? 0} patterns, ${(parsed.lessons as unknown[])?.length ?? 0} lessons`,
        patterns: parsed.patterns,
        lessons: parsed.lessons,
        playbooks: parsed.playbooks,
        benchmarks: parsed.benchmarks,
        nextSprintRecommendations: parsed.next_sprint_recommendations,
        sipeVersion: parsed.sipe_version,
      },
      tokensUsed,
      durationMs: Date.now() - startTime,
    };
  }

  async runSprintRetrospective(params: {
    engagementId: string;
    sprintId: string;
    sprintNumber: number;
    completedTasks: Record<string, unknown>[];
    agentPerformance: Record<string, unknown>;
    gateProgress: Record<string, unknown>;
    clientFeedback?: string;
    vertical: string;
  }): Promise<AgentResult> {
    const result = await this.runTask({
      taskType: "sipe_update",
      engagementId: params.engagementId,
      sprintDay: 10,
      input: {
        taskType: "sipe_update",
        ...params,
        action: "Ingest sprint data and update SIPE engine",
      },
    });

    if (result.success && result.output.patterns) {
      // Persist SIPE entries to Zone 1
      const entries = [
        ...((result.output.patterns as Record<string, unknown>[]) ?? []).map((p) => ({
          category: "pattern" as const,
          content: JSON.stringify(p),
          vertical: params.vertical,
        })),
        ...((result.output.lessons as Record<string, unknown>[]) ?? []).map((l) => ({
          category: "lesson" as const,
          content: JSON.stringify(l),
          vertical: params.vertical,
        })),
        ...((result.output.playbooks as Record<string, unknown>[]) ?? []).map((pb) => ({
          category: "playbook" as const,
          content: JSON.stringify(pb),
          vertical: params.vertical,
        })),
      ];

      for (const entry of entries) {
        await db.insert(sipeEntries).values({
          engagementId: params.engagementId,
          sprintId: params.sprintId,
          category: entry.category,
          content: entry.content,
          vertical: entry.vertical,
        });
      }

      // Mark sprint as SIPE-updated
      await db
        .update(sprintCycles)
        .set({ sipeUpdated: true, completedAt: new Date() })
        .where(eq(sprintCycles.id, params.sprintId));

      // Record in evidence ledger
      await writeToLedger({
        engagementId: params.engagementId,
        entryType: "sipe_update",
        subject: `SIPE Update — Sprint ${params.sprintNumber}`,
        payload: {
          sprintNumber: params.sprintNumber,
          entriesAdded: entries.length,
          vertical: params.vertical,
        },
        authorAgent: "learning",
      });
    }

    return result;
  }
}

export const learningAgent = new LearningAgent();

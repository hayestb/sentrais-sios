import { ForgeAgent } from "./base";
import type { AgentResult } from "@/lib/workflow/types";
import { db } from "@/lib/db/client";
import { raciAssignments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SYSTEM_PROMPT = `You are the Governance Agent of the Sentrais Innovation Operating System (SIOS).

Your role is the nervous system of the FORGE platform. You enforce the RACI matrix, track all decisions with SHA-256 immutability, route approvals, manage escalations, and ensure no gate advances without proper validation.

CORE RESPONSIBILITIES:
1. RACI Enforcement — You own the decision-routing matrix. Every approval, rejection, or escalation is logged immutably.
2. Escalation Management — When timelines are threatened or human judgment is required, you autonomously route to the correct delegate.
3. Sprint Reset — At the start of every sprint (Day 1 Huddle), you reset the RACI matrix and define sprint buckets.
4. Gate Governance — You validate that gate criteria are met before any phase transitions.
5. Hard Stop Enforcement — You can issue a system-wide halt if a critical RACI breach or governance violation is detected.

NON-NEGOTIABLE RULES:
- Gate 2 requires ≥80% Resilience Score. No exceptions.
- Gate 4 requires QA Agent hard block clearance. No exceptions.
- All decisions are hashed and recorded. Accountability is mathematically verifiable.
- Humans intervene only by exception. You manage the overhead.

Respond in structured JSON format with: decision, rationale, actions_taken, escalation_required, escalation_target (if applicable).`;

export class GovernanceAgent extends ForgeAgent {
  constructor() {
    super({
      name: "governance",
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 2048,
    });
  }

  async execute(
    input: Record<string, unknown>,
    engagementId?: string
  ): Promise<AgentResult> {
    const startTime = Date.now();

    const message = `
Governance Action Required:
Task: ${input.taskType ?? "RACI Enforcement"}
Engagement: ${engagementId ?? "N/A"}
Context: ${JSON.stringify(input, null, 2)}

Execute the appropriate governance action and return your decision in JSON format.`;

    const { text, tokensUsed } = await this.invoke(message, { engagementId });

    let parsed: Record<string, unknown>;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    } catch {
      parsed = { raw: text };
    }

    const escalationRequired = Boolean(parsed.escalation_required);

    return {
      success: true,
      output: {
        summary: parsed.decision ?? "Governance action executed",
        decision: parsed.decision,
        rationale: parsed.rationale,
        actionsTaken: parsed.actions_taken,
        escalationTarget: parsed.escalation_target,
      },
      tokensUsed,
      durationMs: Date.now() - startTime,
      escalationRequired,
      escalationReason: escalationRequired
        ? String(parsed.escalation_target ?? "Human judgment required")
        : undefined,
    };
  }

  async resetRaciMatrix(engagementId: string, sprintNumber: number): Promise<AgentResult> {
    const raci = await db
      .select()
      .from(raciAssignments)
      .where(eq(raciAssignments.engagementId, engagementId));

    return this.runTask({
      taskType: "raci_reset",
      engagementId,
      input: {
        taskType: "raci_reset",
        sprintNumber,
        currentRaci: raci,
        action: "Reset and validate RACI matrix for new sprint cycle",
      },
    });
  }

  async evaluateEscalation(params: {
    engagementId: string;
    reason: string;
    severity: "low" | "medium" | "high" | "critical";
    context: Record<string, unknown>;
  }): Promise<AgentResult> {
    return this.runTask({
      taskType: "escalation_evaluation",
      engagementId: params.engagementId,
      input: {
        taskType: "escalation_evaluation",
        reason: params.reason,
        severity: params.severity,
        context: params.context,
        action: "Evaluate escalation and determine routing",
      },
    });
  }
}

export const governanceAgent = new GovernanceAgent();

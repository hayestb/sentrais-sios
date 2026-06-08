import { ForgeAgent } from "./base";
import type { AgentResult } from "@/lib/workflow/types";

const SYSTEM_PROMPT = `You are the Discovery Agent of the Sentrais Innovation Operating System (SIOS).

You map client ecosystems and define the problem space before any technology is discussed. This is Phase 1 (Gate 0 → Gate 1) of the Golden Path.

YOUR DELIVERABLES:
1. Stakeholder Map — All relevant stakeholders, their roles, influence, and friction points
2. Friction Point Analysis — Operational pain points scored by severity and frequency
3. Ecosystem Diagram — Systems, processes, and dependencies
4. Problem Space Definition — Clear articulation of what needs to change and why
5. Gate 1 Readiness Score — Percentage of stakeholder coverage achieved

RULES:
- No technology recommendations in this phase
- Stakeholder coverage must reach 70% before Gate 1 eligibility
- Friction points must be quantified (severity 1–5, frequency 1–5)
- Output feeds directly into the Assessment Agent's Blueprint360

Return structured JSON: stakeholder_map, friction_points, gate1_readiness_score, ecosystem_summary, recommended_next_steps.`;

export class DiscoveryAgent extends ForgeAgent {
  constructor() {
    super({
      name: "discovery",
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
      `discovery ${input.vertical ?? ""} ${input.clientName ?? ""}`,
      { engagementId }
    );
    const { text, tokensUsed } = await this.invoke(
      `Run Discovery for engagement:\n${JSON.stringify(input, null, 2)}`,
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
        summary: `Discovery complete. Gate 1 readiness: ${parsed.gate1_readiness_score}%`,
        stakeholderMap: parsed.stakeholder_map,
        frictionPoints: parsed.friction_points,
        gate1ReadinessScore: parsed.gate1_readiness_score,
        ecosystemSummary: parsed.ecosystem_summary,
        recommendedNextSteps: parsed.recommended_next_steps,
      },
      tokensUsed,
      durationMs: Date.now() - startTime,
    };
  }
}

export const discoveryAgent = new DiscoveryAgent();

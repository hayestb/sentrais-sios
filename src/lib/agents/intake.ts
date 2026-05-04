import { ForgeAgent } from "./base";
import type { AgentResult } from "@/lib/workflow/types";

const SYSTEM_PROMPT = `You are the Intake Agent for the Sentrais Innovation Operating System (SIOS).

Your role is the first point of intelligence for every new client engagement. You process intake questionnaires, validate completeness, identify key stakeholders, map initial friction points, surface SIPE-relevant patterns, and prepare the Discovery phase launch brief.

INTAKE PROTOCOL:
1. Validate completeness — flag missing information that will block Gate 0 → 1 passage
2. Stakeholder Mapping — identify decision-makers, influencers, blockers by function
3. Friction Identification — capture known pain points before the team arrives
4. Vertical Context — apply industry-specific lens (Live Events, Healthcare, Finance, etc.)
5. SIPE Pre-Population — surface relevant patterns from prior engagements in this vertical
6. Discovery Readiness Score — compute 0-100 readiness for Discovery kickoff

NON-NEGOTIABLE: Gate 0 requires stakeholder coverage ≥70% and a defined Engagement Lead before Discovery begins.

Return structured JSON: {
  completenessScore: number,
  missingFields: string[],
  stakeholders: [{name, role, influence: "high|medium|low", type: "decision|influencer|blocker"}],
  initialFrictions: [{description, severity: "critical|high|medium|low", function}],
  sipePatternsApplied: string[],
  discoveryReadinessScore: number,
  gateZeroEligible: boolean,
  kickoffRecommendations: string[],
  summary: string
}`;

export class IntakeAgent extends ForgeAgent {
  constructor() {
    super({ name: "intake", systemPrompt: SYSTEM_PROMPT, maxTokens: 2048 });
  }

  async execute(input: Record<string, unknown>, engagementId?: string): Promise<AgentResult> {
    const startTime = Date.now();
    const { text, tokensUsed } = await this.invoke(
      `Process client intake for new engagement:\n${JSON.stringify(input, null, 2)}\n\nGenerate the full intake assessment.`,
      { engagementId }
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
        summary: parsed.summary ?? `Intake processed. Discovery readiness: ${parsed.discoveryReadinessScore ?? "N/A"}%`,
        completenessScore: parsed.completenessScore,
        missingFields: parsed.missingFields,
        stakeholders: parsed.stakeholders,
        initialFrictions: parsed.initialFrictions,
        discoveryReadinessScore: parsed.discoveryReadinessScore,
        gateZeroEligible: parsed.gateZeroEligible,
        kickoffRecommendations: parsed.kickoffRecommendations,
      },
      tokensUsed,
      durationMs: Date.now() - startTime,
    };
  }
}

export const intakeAgent = new IntakeAgent();

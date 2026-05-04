import { ForgeAgent } from "./base";
import type { AgentResult } from "@/lib/workflow/types";

const SYSTEM_PROMPT = `You are the Assessment Agent of the Sentrais Innovation Operating System (SIOS).

Your function is to calculate the Blueprint360 gap matrix — the diagnostic framework that determines if a client's operational ecosystem is ready to advance through the Golden Path.

THE BLUEPRINT360 FRAMEWORK:
Evaluate these dimensions, each scored 0–100:
1. Resilience Score — Operational robustness. NON-NEGOTIABLE: must reach 80% to pass Gate 2.
2. Process Maturity — Workflow documentation, SOP coverage, repeatability.
3. Technology Readiness — Existing tech stack alignment with target architecture.
4. Data Governance — Data quality, lineage, and access control.
5. Change Capacity — Org readiness for transformation.
6. Integration Complexity — Number/complexity of systems requiring integration.

GATE 2 RULE: If the overall Resilience Score is below 80%, the engagement CANNOT advance. The Gate 2 Hard Stop is non-negotiable. Flag this clearly.

Return structured JSON with:
- resilience_score (0-100)
- gap_matrix: { dimension: score }
- readiness_verdict: READY | NOT_READY | CONDITIONAL
- critical_gaps: []
- recommendations: []
- gate2_eligible: boolean`;

export class AssessmentAgent extends ForgeAgent {
  constructor() {
    super({
      name: "assessment",
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 3000,
    });
  }

  async execute(
    input: Record<string, unknown>,
    engagementId?: string
  ): Promise<AgentResult> {
    const startTime = Date.now();

    const { text, tokensUsed } = await this.invoke(
      `Run Blueprint360 Assessment:\n${JSON.stringify(input, null, 2)}`,
      { engagementId }
    );

    let parsed: Record<string, unknown>;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    } catch {
      parsed = { raw: text };
    }

    const resilienceScore = Number(parsed.resilience_score ?? 0);
    const gate2Eligible = resilienceScore >= 80;

    return {
      success: true,
      output: {
        summary: `Blueprint360 complete. Resilience: ${resilienceScore}%. Gate 2 ${gate2Eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}.`,
        resilienceScore,
        gapMatrix: parsed.gap_matrix,
        readinessVerdict: parsed.readiness_verdict,
        criticalGaps: parsed.critical_gaps,
        recommendations: parsed.recommendations,
        gate2Eligible,
      },
      tokensUsed,
      durationMs: Date.now() - startTime,
      escalationRequired: !gate2Eligible,
      escalationReason: !gate2Eligible
        ? `Resilience score ${resilienceScore}% below required 80% for Gate 2`
        : undefined,
    };
  }

  async runBlueprint360(params: {
    engagementId: string;
    clientData: Record<string, unknown>;
    stakeholderMap: Record<string, unknown>;
    frictionPoints: string[];
  }): Promise<AgentResult> {
    return this.runTask({
      taskType: "blueprint360_assessment",
      engagementId: params.engagementId,
      input: {
        taskType: "blueprint360_assessment",
        clientData: params.clientData,
        stakeholderMap: params.stakeholderMap,
        frictionPoints: params.frictionPoints,
        action: "Calculate Blueprint360 gap matrix for Gate 2 eligibility",
      },
    });
  }
}

export const assessmentAgent = new AssessmentAgent();

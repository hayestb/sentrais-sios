import { ForgeAgent } from "./base";
import type { AgentResult } from "@/lib/workflow/types";
import { writeToLedger } from "@/lib/ledger/evidence";

const SYSTEM_PROMPT = `You are the Risk Agent for the Sentrais Innovation Operating System (SIOS).

You identify, assess, and mitigate operational, financial, technical, and stakeholder risks at every gate boundary and sprint cycle. You work closely with the Governance Agent for escalation routing and the QA Agent for technical risk at Gate 4.

RISK FRAMEWORK:
1. Operational Risk — sprint velocity degradation, resource conflicts, timeline overruns
2. Financial Risk — invoice aging, contract value at risk, trigger gate delays
3. Technical Risk — integration failures, architecture debt, security gaps at Gate 4
4. Stakeholder Risk — RACI gaps, sponsor disengagement, escalation failures
5. Blueprint Risk — resilience score degradation, Gap Matrix gaps not closed

RISK SCORING: probability (0-1) × impact (1-10) = risk score
- Critical: risk score ≥ 7
- High: risk score 5-6.9
- Medium: risk score 3-4.9
- Low: risk score < 3

At each gate, issue a Gate Risk Certificate before advancement is permitted.

Return JSON: {
  riskRegister: [{id, category, description, probability, impact, score, severity, mitigation, owner}],
  gateRiskCertificate: {gate, certified: boolean, criticalRisks: number, recommendation: string},
  escalationsRequired: [{risk, escalateTo, urgency}],
  mitigationPlan: string[],
  summary: string
}`;

export class RiskAgent extends ForgeAgent {
  constructor() {
    super({ name: "risk", systemPrompt: SYSTEM_PROMPT, maxTokens: 3000 });
  }

  async execute(input: Record<string, unknown>, engagementId?: string): Promise<AgentResult> {
    const startTime = Date.now();
    const { text, tokensUsed } = await this.invoke(
      `Perform risk assessment:\n${JSON.stringify(input, null, 2)}`,
      { engagementId }
    );

    let parsed: Record<string, unknown>;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    } catch {
      parsed = { raw: text };
    }

    if (engagementId && (parsed.riskRegister as unknown[])?.length) {
      await writeToLedger({
        engagementId,
        entryType: "risk_assessment",
        subject: `Risk Assessment — Gate ${(input.gateNumber as number) ?? "General"}`,
        payload: {
          riskCount: (parsed.riskRegister as unknown[]).length,
          criticalRisks: (parsed.gateRiskCertificate as Record<string, unknown>)?.criticalRisks ?? 0,
        },
        authorAgent: "risk",
      });
    }

    return {
      success: true,
      output: {
        summary: parsed.summary ?? "Risk assessment complete",
        riskRegister: parsed.riskRegister,
        gateRiskCertificate: parsed.gateRiskCertificate,
        escalationsRequired: parsed.escalationsRequired,
        mitigationPlan: parsed.mitigationPlan,
      },
      tokensUsed,
      durationMs: Date.now() - startTime,
    };
  }
}

export const riskAgent = new RiskAgent();

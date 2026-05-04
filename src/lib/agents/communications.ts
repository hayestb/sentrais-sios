import { ForgeAgent } from "./base";
import type { AgentResult } from "@/lib/workflow/types";

const SYSTEM_PROMPT = `You are the Communications Agent of the Sentrais Innovation Operating System (SIOS).

You generate "Deloitte-grade" deliverables and executive briefings — automatically, from the Evidence Ledger, without human authoring.

YOUR OUTPUTS:
1. Go-Live Briefings — Sent to stakeholders upon Gate 4 clearance
2. Executive Readouts — Bi-weekly ARR milestone reports for Knox and Kevin McCann
3. Gate Transition Summaries — Concise one-pagers for each gate passage
4. Client Portal Updates — Progress communications for the Engagement Lead
5. RACI Breach Alerts — Immediate notifications when governance violations occur

TONE & STANDARDS:
- C-suite executive level — precise, data-driven, no fluff
- Include quantified outcomes (resilience scores, sprint velocity, harness scores)
- Reference Evidence Ledger hashes for auditability
- From: communications@sentrais.com
- All output recorded in the Evidence Ledger

Return structured JSON: document_type, recipient, subject, body, key_metrics, evidence_references.`;

export class CommunicationsAgent extends ForgeAgent {
  constructor() {
    super({
      name: "communications",
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 4096,
    });
  }

  async execute(
    input: Record<string, unknown>,
    engagementId?: string
  ): Promise<AgentResult> {
    const startTime = Date.now();

    const { text, tokensUsed } = await this.invoke(
      `Generate communication: ${JSON.stringify(input, null, 2)}`,
      { engagementId }
    );

    let parsed: Record<string, unknown>;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { documentBody: text };
    } catch {
      parsed = { documentBody: text };
    }

    return {
      success: true,
      output: {
        summary: `${parsed.document_type ?? "Communication"} generated for ${parsed.recipient}`,
        documentType: parsed.document_type,
        recipient: parsed.recipient,
        subject: parsed.subject,
        body: parsed.body,
        keyMetrics: parsed.key_metrics,
        evidenceReferences: parsed.evidence_references,
      },
      tokensUsed,
      durationMs: Date.now() - startTime,
    };
  }

  async generateGateBriefing(params: {
    engagementId: string;
    gateNumber: number;
    clientName: string;
    scores: Record<string, number>;
    invoiceTriggered?: boolean;
    invoiceAmount?: number;
  }): Promise<AgentResult> {
    return this.runTask({
      taskType: "gate_briefing",
      engagementId: params.engagementId,
      input: {
        taskType: "gate_briefing",
        documentType: "Gate Transition Briefing",
        gateNumber: params.gateNumber,
        clientName: params.clientName,
        scores: params.scores,
        invoiceTriggered: params.invoiceTriggered,
        invoiceAmount: params.invoiceAmount,
        recipient: "Knox Phillips, Engagement Lead",
      },
    });
  }

  async generateExecutiveReadout(params: {
    engagementId: string;
    sprintNumber: number;
    arrMilestone: number;
    contractValue: number;
    gatesCompleted: number;
  }): Promise<AgentResult> {
    return this.runTask({
      taskType: "executive_readout",
      engagementId: params.engagementId,
      input: {
        taskType: "executive_readout",
        documentType: "Bi-Weekly ARR Executive Readout",
        sprintNumber: params.sprintNumber,
        arrMilestone: params.arrMilestone,
        contractValue: params.contractValue,
        gatesCompleted: params.gatesCompleted,
        recipient: "Knox Phillips, Kevin McCann",
      },
    });
  }
}

export const communicationsAgent = new CommunicationsAgent();

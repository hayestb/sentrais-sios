import { ForgeAgent } from "./base";
import type { AgentResult } from "@/lib/workflow/types";
import { writeToLedger } from "@/lib/ledger/evidence";

const SYSTEM_PROMPT = `You are the Transition Agent for the Sentrais Innovation Operating System (SIOS).

You manage Gate 5 — the handoff from Sentrais delivery to client-owned operations. Your mandate is to ensure zero knowledge loss, clean IP transfer, CaaS activation, and a measurable operational baseline.

TRANSITION PROTOCOL:
1. Handoff Checklist — verify all deliverables are signed off and documented
2. Knowledge Transfer — confirm client team is trained and operationally capable
3. IP Inventory — enumerate all blueprints, SOPs, playbooks being transferred
4. CaaS Activation — trigger subscription billing initialization
5. NPS Baseline — capture initial satisfaction score before team exits
6. 30-Day Stability Plan — define the first month of CaaS operations
7. Escalation Paths — document who calls who when issues arise post-handoff

GATE 5 CRITERIA: handoff_complete = 100%, nps_baseline captured (min 50%).
CaaS billing activates automatically upon Gate 5 passage.

Return JSON: {
  handoffChecklist: [{item, status: "complete|pending|blocked", owner}],
  knowledgeTransferScore: number,
  ipInventory: [{artifact, type, hash}],
  caasActivated: boolean,
  npsBaseline: number,
  stabilityPlan: string[],
  escalationPaths: [{scenario, contact, sla}],
  summary: string
}`;

export class TransitionAgent extends ForgeAgent {
  constructor() {
    super({ name: "transition", systemPrompt: SYSTEM_PROMPT, maxTokens: 3000 });
  }

  async execute(input: Record<string, unknown>, engagementId?: string): Promise<AgentResult> {
    const startTime = Date.now();
    const { text, tokensUsed } = await this.invoke(
      `Execute transition protocol:\n${JSON.stringify(input, null, 2)}`,
      { engagementId }
    );

    let parsed: Record<string, unknown>;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    } catch {
      parsed = { raw: text };
    }

    if (engagementId && parsed.caasActivated) {
      await writeToLedger({
        engagementId,
        entryType: "caas_activation",
        subject: "CaaS Subscription Activated — Gate 5 Transition Complete",
        payload: { npsBaseline: parsed.npsBaseline, knowledgeTransferScore: parsed.knowledgeTransferScore },
        authorAgent: "transition",
      });
    }

    return {
      success: true,
      output: {
        summary: parsed.summary ?? "Transition protocol executed",
        handoffChecklist: parsed.handoffChecklist,
        knowledgeTransferScore: parsed.knowledgeTransferScore,
        caasActivated: parsed.caasActivated,
        npsBaseline: parsed.npsBaseline,
        stabilityPlan: parsed.stabilityPlan,
      },
      tokensUsed,
      durationMs: Date.now() - startTime,
    };
  }
}

export const transitionAgent = new TransitionAgent();

import { ForgeAgent } from "./base";
import type { AgentResult } from "@/lib/workflow/types";
import { recordIPLock } from "@/lib/ledger/evidence";

const SYSTEM_PROMPT = `You are the Architecture Agent of the Sentrais Innovation Operating System (SIOS).

You validate technical designs and ensure all client SOPs are mapped into executable state machines before any code is written by MetaData. You are the Technical Bridge between Advisory (the Brain) and MetaData (the Hands).

YOUR MANDATE (Phase 3 — Design):
1. Technical Design Validation — Every architecture must be an executable state machine. No vague workflows.
2. SOP-to-Workflow Mapping — Convert client standard operating procedures into precise, temporal state machine definitions
3. IP Hash Preparation — Before partner handoff, all designs are hashed and locked in the Evidence Ledger
4. MetaData Blueprint — Generate the precise technical specification MetaData will build from
5. Integration Architecture — Define all system integration points, APIs, and data flows

THE FIREWALL:
- Fractional specialists (CTO, CISO) may advise during Phase 3 (Design)
- They CANNOT access live production environments — the Governance Agent enforces this
- MetaData only receives the blueprint AFTER IP is hashed in the Zone 1 Ledger

ARCHITECTURE STANDARD:
- All workflows must be representable as finite state machines with defined inputs, outputs, and transitions
- Every state must have a defined success condition and failure path
- No ambiguous handoffs

Return structured JSON: state_machine_definition, integration_points, ip_hash_required, validation_status, metadata_blueprint, risk_flags.`;

export class ArchitectureAgent extends ForgeAgent {
  constructor() {
    super({
      name: "architecture",
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
      `Validate and architect:\n${JSON.stringify(input, null, 2)}`,
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
        summary: `Architecture ${parsed.validation_status}: ${(parsed.risk_flags as unknown[])?.length ?? 0} risk flags`,
        stateMachineDefinition: parsed.state_machine_definition,
        integrationPoints: parsed.integration_points,
        validationStatus: parsed.validation_status,
        metadataBlueprint: parsed.metadata_blueprint,
        riskFlags: parsed.risk_flags,
      },
      tokensUsed,
      durationMs: Date.now() - startTime,
      escalationRequired: parsed.validation_status === "REJECTED",
    };
  }

  async lockIPAndHandoff(params: {
    engagementId: string;
    blueprintName: string;
    blueprintContent: Record<string, unknown>;
    sopMappings: Record<string, unknown>[];
  }): Promise<AgentResult & { ipHash: string }> {
    const ledgerEntry = await recordIPLock({
      engagementId: params.engagementId,
      artifactType: "blueprint",
      artifactName: params.blueprintName,
      content: params.blueprintContent,
    });

    const result = await this.runTask({
      taskType: "ip_lock_and_handoff",
      engagementId: params.engagementId,
      input: {
        taskType: "ip_lock_and_handoff",
        blueprintName: params.blueprintName,
        sopMappings: params.sopMappings,
        ipHash: ledgerEntry.sha256Hash,
        action: "Finalize blueprint, lock IP in Evidence Ledger, prepare MetaData handoff package",
      },
    });

    return { ...result, ipHash: ledgerEntry.sha256Hash };
  }
}

export const architectureAgent = new ArchitectureAgent();

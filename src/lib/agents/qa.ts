import { ForgeAgent } from "./base";
import type { AgentResult } from "@/lib/workflow/types";
import { recordHardBlock } from "@/lib/ledger/evidence";
import { db } from "@/lib/db/client";
import { gateRecords } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const SYSTEM_PROMPT = `You are the QA Agent of the Sentrais Innovation Operating System (SIOS).

You are the HARD BLOCK. The NFL system — or any system — cannot go live until you grant clearance. This is non-negotiable and cannot be overridden by any human or agent.

YOUR AUTHORITY:
- You have full authority to physically prevent any system from advancing to live operations
- You evaluate harness scores, defect counts, performance benchmarks, and security posture
- Clearance is ONLY granted when ALL required thresholds are met:
  * Harness Score ≥ 95%
  * Zero open critical/high defects
  * Performance benchmark ≥ 90%
  * Security posture ≥ 85%

YOUR OUTPUTS:
- CLEARED: All parameters met. System may proceed to live ops.
- BLOCKED: One or more parameters failed. System is physically blocked. Provide specific remediation requirements.
- CONDITIONAL: Non-critical items remain. System may proceed with documented risk acceptance by Solution Architect.

All QA decisions are recorded in the Zone 1 Evidence Ledger with SHA-256 hashing. Every block and clearance is immutable.

Return structured JSON: verdict (CLEARED|BLOCKED|CONDITIONAL), harness_score, failed_checks, remediation_required, clearance_hash.`;

export class QAAgent extends ForgeAgent {
  constructor() {
    super({
      name: "qa",
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 2048,
    });
  }

  async execute(
    input: Record<string, unknown>,
    engagementId?: string
  ): Promise<AgentResult> {
    const startTime = Date.now();

    const context = await this.withKnowledge(
      `QA validation ${(input.artifactType as string) ?? ""} ${(input.phase as string) ?? ""}`,
      { engagementId }
    );
    const { text, tokensUsed } = await this.invoke(
      `QA Validation Request:\n${JSON.stringify(input, null, 2)}`,
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
        summary: `QA ${parsed.verdict}: ${parsed.harness_score}% harness score`,
        verdict: parsed.verdict,
        harnessScore: parsed.harness_score,
        failedChecks: parsed.failed_checks,
        remediationRequired: parsed.remediation_required,
      },
      tokensUsed,
      durationMs: Date.now() - startTime,
      escalationRequired: parsed.verdict === "BLOCKED",
      escalationReason: parsed.verdict === "BLOCKED"
        ? `Hard block active: ${JSON.stringify(parsed.failed_checks)}`
        : undefined,
    };
  }

  async runHardBlockValidation(params: {
    engagementId: string;
    harnessScore: number;
    defectCount: number;
    performanceBenchmark: number;
    securityPosture: number;
    testResults: Record<string, unknown>;
  }): Promise<AgentResult & { cleared: boolean }> {
    const failedChecks: string[] = [];

    if (params.harnessScore < 95)
      failedChecks.push(`Harness Score: ${params.harnessScore}% (required: 95%)`);
    if (params.defectCount > 0)
      failedChecks.push(`Open Defects: ${params.defectCount} (required: 0)`);
    if (params.performanceBenchmark < 90)
      failedChecks.push(`Performance: ${params.performanceBenchmark}% (required: 90%)`);
    if (params.securityPosture < 85)
      failedChecks.push(`Security Posture: ${params.securityPosture}% (required: 85%)`);

    const cleared = failedChecks.length === 0;

    if (!cleared) {
      await recordHardBlock({
        engagementId: params.engagementId,
        reason: "QA Hard Block — threshold requirements not met",
        failedChecks,
      });

      await db
        .update(gateRecords)
        .set({ hardBlockActive: true, status: "blocked" })
        .where(
          and(
            eq(gateRecords.engagementId, params.engagementId),
            eq(gateRecords.gateNumber, 4)
          )
        );
    }

    const result = await this.runTask({
      taskType: "hard_block_validation",
      engagementId: params.engagementId,
      input: {
        taskType: "hard_block_validation",
        harnessScore: params.harnessScore,
        defectCount: params.defectCount,
        performanceBenchmark: params.performanceBenchmark,
        securityPosture: params.securityPosture,
        testResults: params.testResults,
        failedChecks,
        cleared,
      },
    });

    return { ...result, cleared };
  }
}

export const qaAgent = new QAAgent();

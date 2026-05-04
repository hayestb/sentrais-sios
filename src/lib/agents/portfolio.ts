import { ForgeAgent } from "./base";
import type { AgentResult } from "@/lib/workflow/types";

const SYSTEM_PROMPT = `You are the Portfolio Agent for the Sentrais Innovation Operating System (SIOS).

You provide Knox Phillips and the leadership team with a portfolio-level view across all active and pipeline engagements. You aggregate ARR data, identify at-risk engagements, forecast revenue, and generate board-ready portfolio summaries.

PORTFOLIO INTELLIGENCE:
1. ARR Tracking — current revenue vs. targets, forecasted gate-triggered invoices
2. At-Risk Detection — engagements blocked, overdue gates, stakeholder friction
3. Vertical Performance — which industries perform best, average gate velocity by vertical
4. Pipeline Health — gate distribution across all engagements, bottleneck identification
5. Agent Performance — which FORGE agents are delivering the most value, token efficiency
6. Revenue Forecasting — projected CaaS revenue from Gate 5 pipeline

KPIs TO TRACK:
- Average time per gate (by vertical, by phase)
- Gate 4 hard block rate
- Blueprint360 average resilience scores by vertical
- SIPE pattern reuse rate (% of engagements using pre-populated intelligence)

Return JSON: {
  portfolioHealth: "green|yellow|red",
  totalARR: number,
  atRiskEngagements: [{id, name, reason, severity}],
  gateVelocity: {avgDaysPerGate: number, byVertical: Record<string, number>},
  forecastedRevenue: {next30: number, next90: number},
  topRisks: string[],
  recommendations: string[],
  summary: string
}`;

export class PortfolioAgent extends ForgeAgent {
  constructor() {
    super({ name: "portfolio", systemPrompt: SYSTEM_PROMPT, maxTokens: 3000 });
  }

  async execute(input: Record<string, unknown>, engagementId?: string): Promise<AgentResult> {
    const startTime = Date.now();
    const { text, tokensUsed } = await this.invoke(
      `Generate portfolio intelligence report:\n${JSON.stringify(input, null, 2)}`,
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
        summary: parsed.summary ?? "Portfolio report generated",
        portfolioHealth: parsed.portfolioHealth,
        totalARR: parsed.totalARR,
        atRiskEngagements: parsed.atRiskEngagements,
        forecastedRevenue: parsed.forecastedRevenue,
        topRisks: parsed.topRisks,
        recommendations: parsed.recommendations,
      },
      tokensUsed,
      durationMs: Date.now() - startTime,
    };
  }
}

export const portfolioAgent = new PortfolioAgent();

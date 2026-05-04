export { governanceAgent, GovernanceAgent } from "./governance";
export { financialAgent, FinancialAgent } from "./financial";
export { qaAgent, QAAgent } from "./qa";
export { assessmentAgent, AssessmentAgent } from "./assessment";
export { learningAgent, LearningAgent } from "./learning";
export { communicationsAgent, CommunicationsAgent } from "./communications";
export { deliveryAgent, DeliveryAgent } from "./delivery";
export { discoveryAgent, DiscoveryAgent } from "./discovery";
export { architectureAgent, ArchitectureAgent } from "./architecture";
export { intakeAgent, IntakeAgent } from "./intake";
export { transitionAgent, TransitionAgent } from "./transition";
export { portfolioAgent, PortfolioAgent } from "./portfolio";
export { riskAgent, RiskAgent } from "./risk";
export { ForgeAgent } from "./base";

import { governanceAgent } from "./governance";
import { financialAgent } from "./financial";
import { qaAgent } from "./qa";
import { assessmentAgent } from "./assessment";
import { learningAgent } from "./learning";
import { communicationsAgent } from "./communications";
import { deliveryAgent } from "./delivery";
import { discoveryAgent } from "./discovery";
import { architectureAgent } from "./architecture";
import { intakeAgent } from "./intake";
import { transitionAgent } from "./transition";
import { portfolioAgent } from "./portfolio";
import { riskAgent } from "./risk";
import type { AgentName } from "@/lib/workflow/types";
import type { ForgeAgent } from "./base";

// Agent registry — all instantiated FORGE agents
export const AGENT_REGISTRY: Partial<Record<AgentName, ForgeAgent>> = {
  governance: governanceAgent,
  financial: financialAgent,
  qa: qaAgent,
  assessment: assessmentAgent,
  learning: learningAgent,
  communications: communicationsAgent,
  delivery: deliveryAgent,
  discovery: discoveryAgent,
  architecture: architectureAgent,
  intake: intakeAgent,
  transition: transitionAgent,
  portfolio: portfolioAgent,
  risk: riskAgent,
};

export function getAgent(name: AgentName): ForgeAgent | undefined {
  return AGENT_REGISTRY[name];
}

export { AGENT_CATALOG } from "./catalog";

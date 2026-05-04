export type GateNumber = 0 | 1 | 2 | 3 | 4 | 5;

export type Phase =
  | "discover"   // Gate 0 → 1
  | "diagnose"   // Gate 1 → 2
  | "design"     // Gate 2 → 3
  | "deploy"     // Gate 3 → 4
  | "debrief";   // Gate 4 → 5

export type GateStatus = "locked" | "active" | "passed" | "failed" | "blocked";

export interface GateDefinition {
  number: GateNumber;
  entryPhase: Phase;
  name: string;
  description: string;
  requiredThresholds: GateThreshold[];
  hardBlock: boolean;
  financialTrigger: FinancialTrigger | null;
  responsibleAgents: string[];
  humanCheckpoints: string[];
}

export interface GateThreshold {
  key: string;
  label: string;
  minScore: number; // 0–100
  required: boolean;
}

export type FinancialTrigger =
  | { type: "deposit_25"; label: "25% Deposit Invoice" }
  | { type: "balance_50"; label: "50% Balance Invoice" }
  | { type: "caas"; label: "CaaS Subscription Billing" };

export interface GatePackage {
  engagementId: string;
  gateNumber: GateNumber;
  scores: Record<string, number>;
  approvedBy: string;
  timestamp: string;
  notes?: string;
}

export interface WorkflowState {
  engagementId: string;
  currentGate: GateNumber;
  currentPhase: Phase;
  gates: Record<GateNumber, GateStatus>;
  hardBlockActive: boolean;
  lastUpdated: string;
}

export type AgentName =
  | "governance"
  | "discovery"
  | "intake"
  | "assessment"
  | "architecture"
  | "design"
  | "delivery"
  | "qa"
  | "financial"
  | "transition"
  | "learning"
  | "communications"
  | "portfolio"
  | "client_success"
  | "legal"
  | "sipe"
  | "risk"
  | "compliance"
  | "knowledge"
  | "escalation"
  | "reporting"
  | "integration";

export interface AgentInvocation {
  agent: AgentName;
  taskType: string;
  engagementId?: string;
  input: Record<string, unknown>;
}

export interface AgentResult {
  success: boolean;
  output: Record<string, unknown>;
  tokensUsed?: number;
  durationMs?: number;
  escalationRequired?: boolean;
  escalationReason?: string;
}

export interface SprintEvent {
  day: number;
  type: "huddle" | "tech_sync" | "qa_review" | "retrospective" | "execution";
  label: string;
  agents: AgentName[];
  objective: string;
}

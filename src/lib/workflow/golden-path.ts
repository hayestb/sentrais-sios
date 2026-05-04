import type {
  GateNumber,
  Phase,
  GateDefinition,
  GatePackage,
  WorkflowState,
  FinancialTrigger,
} from "./types";

// ─── Gate Definitions (Non-negotiable) ───────────────────────────────────────

export const GATE_DEFINITIONS: Record<GateNumber, GateDefinition> = {
  0: {
    number: 0,
    entryPhase: "discover",
    name: "Engagement Open",
    description: "Client onboarded. Stakeholder mapping begins.",
    requiredThresholds: [],
    hardBlock: false,
    financialTrigger: null,
    responsibleAgents: ["intake", "discovery"],
    humanCheckpoints: ["engagement_lead"],
  },
  1: {
    number: 1,
    entryPhase: "diagnose",
    name: "Discovery Complete",
    description: "Stakeholder map validated. Blueprint360 assessment begins.",
    requiredThresholds: [
      { key: "stakeholder_coverage", label: "Stakeholder Coverage", minScore: 70, required: true },
      { key: "friction_mapped", label: "Friction Points Mapped", minScore: 60, required: true },
    ],
    hardBlock: false,
    financialTrigger: null,
    responsibleAgents: ["discovery", "assessment", "governance"],
    humanCheckpoints: ["engagement_lead", "solution_architect"],
  },
  2: {
    number: 2,
    entryPhase: "design",
    name: "Blueprint360 — 80% Resilience Gate",
    description:
      "Non-negotiable. Client processes must score ≥80% resilience. Triggers 25% deposit.",
    requiredThresholds: [
      { key: "resilience_score", label: "Resilience Score", minScore: 80, required: true },
      { key: "gap_matrix_complete", label: "Gap Matrix Complete", minScore: 100, required: true },
      { key: "readiness_score", label: "Operational Readiness", minScore: 65, required: false },
    ],
    hardBlock: false,
    financialTrigger: { type: "deposit_25", label: "25% Deposit Invoice" } as FinancialTrigger,
    responsibleAgents: ["assessment", "architecture", "financial", "governance"],
    humanCheckpoints: ["solution_architect", "engagement_lead"],
  },
  3: {
    number: 3,
    entryPhase: "deploy",
    name: "Design Locked",
    description: "Architecture validated. IP hashed. Blueprint handed to MetaData.",
    requiredThresholds: [
      { key: "architecture_validated", label: "Architecture Validated", minScore: 100, required: true },
      { key: "ip_hashed", label: "IP Locked in Ledger", minScore: 100, required: true },
      { key: "sow_signed", label: "SOW Signed", minScore: 100, required: true },
    ],
    hardBlock: false,
    financialTrigger: null,
    responsibleAgents: ["architecture", "design", "legal", "governance"],
    humanCheckpoints: ["solution_architect", "knox_phillips"],
  },
  4: {
    number: 4,
    entryPhase: "debrief",
    name: "QA Hard Block — Go-Live Gate",
    description:
      "Physical hard block. QA Agent must clear all harness scores before live ops. Triggers 50% balance.",
    requiredThresholds: [
      { key: "harness_score", label: "Harness Score", minScore: 95, required: true },
      { key: "qa_defects_cleared", label: "Defects Cleared", minScore: 100, required: true },
      { key: "performance_benchmark", label: "Performance Benchmark", minScore: 90, required: true },
      { key: "security_posture", label: "Security Posture", minScore: 85, required: true },
    ],
    hardBlock: true,
    financialTrigger: { type: "balance_50", label: "50% Balance Invoice" } as FinancialTrigger,
    responsibleAgents: ["qa", "delivery", "financial", "governance"],
    humanCheckpoints: ["solution_architect", "engagement_lead"],
  },
  5: {
    number: 5,
    entryPhase: "debrief",
    name: "Operationalized — CaaS Active",
    description:
      "Client transitioned to live ops. Learning Agent updates SIPE. CaaS billing activates.",
    requiredThresholds: [
      { key: "handoff_complete", label: "Handoff Complete", minScore: 100, required: true },
      { key: "nps_baseline", label: "NPS Baseline Captured", minScore: 50, required: false },
    ],
    hardBlock: false,
    financialTrigger: { type: "caas", label: "CaaS Subscription Billing" } as FinancialTrigger,
    responsibleAgents: ["transition", "financial", "learning", "client_success"],
    humanCheckpoints: ["engagement_lead", "knox_phillips"],
  },
};

export const PHASE_MAP: Record<GateNumber, Phase> = {
  0: "discover",
  1: "diagnose",
  2: "design",
  3: "deploy",
  4: "debrief",
  5: "debrief",
};

// ─── Gate Engine ──────────────────────────────────────────────────────────────

export function getGateDefinition(gate: GateNumber): GateDefinition {
  return GATE_DEFINITIONS[gate];
}

export function canAdvanceGate(
  gate: GateNumber,
  scores: Record<string, number>
): { allowed: boolean; failedThresholds: string[]; warnings: string[] } {
  const def = GATE_DEFINITIONS[gate];
  const failedThresholds: string[] = [];
  const warnings: string[] = [];

  for (const threshold of def.requiredThresholds) {
    const score = scores[threshold.key] ?? 0;
    if (score < threshold.minScore) {
      if (threshold.required) {
        failedThresholds.push(
          `${threshold.label}: ${score}% (required: ${threshold.minScore}%)`
        );
      } else {
        warnings.push(
          `${threshold.label}: ${score}% (recommended: ${threshold.minScore}%)`
        );
      }
    }
  }

  return {
    allowed: failedThresholds.length === 0,
    failedThresholds,
    warnings,
  };
}

export function isHardBlocked(gate: GateNumber, scores: Record<string, number>): boolean {
  const def = GATE_DEFINITIONS[gate];
  if (!def.hardBlock) return false;
  const { allowed } = canAdvanceGate(gate, scores);
  return !allowed;
}

export function buildGatePackage(
  engagementId: string,
  gate: GateNumber,
  scores: Record<string, number>,
  approvedBy: string,
  notes?: string
): GatePackage {
  return {
    engagementId,
    gateNumber: gate,
    scores,
    approvedBy,
    timestamp: new Date().toISOString(),
    notes,
  };
}

export function computeInvoiceAmount(
  contractValue: number,
  trigger: FinancialTrigger
): number {
  switch (trigger.type) {
    case "deposit_25":
      return contractValue * 0.25;
    case "balance_50":
      return contractValue * 0.50;
    case "caas":
      return contractValue * 0.10; // monthly CaaS = 10% of contract
  }
}

export function buildWorkflowState(
  engagementId: string,
  currentGate: GateNumber,
  gateStatuses: Partial<Record<GateNumber, "locked" | "active" | "passed" | "failed" | "blocked">>
): WorkflowState {
  const gates = { 0: "locked", 1: "locked", 2: "locked", 3: "locked", 4: "locked", 5: "locked" } as Record<GateNumber, WorkflowState["gates"][GateNumber]>;

  for (const [k, v] of Object.entries(gateStatuses)) {
    gates[Number(k) as GateNumber] = v as WorkflowState["gates"][GateNumber];
  }

  return {
    engagementId,
    currentGate,
    currentPhase: PHASE_MAP[currentGate],
    gates,
    hardBlockActive: GATE_DEFINITIONS[currentGate]?.hardBlock ?? false,
    lastUpdated: new Date().toISOString(),
  };
}

export function getPhaseLabel(phase: Phase): string {
  const labels: Record<Phase, string> = {
    discover: "Phase 1: Discover",
    diagnose: "Phase 2: Diagnose",
    design: "Phase 3: Design",
    deploy: "Phase 4: Deploy",
    debrief: "Phase 5: Debrief & Operationalize",
  };
  return labels[phase];
}

export function getPhaseProgress(currentGate: GateNumber): number {
  return Math.round((currentGate / 5) * 100);
}

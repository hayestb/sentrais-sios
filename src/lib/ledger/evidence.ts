import { createHash } from "crypto";
import { db } from "@/lib/db/client";
import { evidenceEntries } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import type { AgentName } from "@/lib/workflow/types";

export type EvidenceEntryType =
  | "gate_approval"
  | "gate_failure"
  | "sop_hash"
  | "blueprint"
  | "blueprint360_assessment"
  | "invoice"
  | "escalation"
  | "agent_action"
  | "sprint_event"
  | "ip_lock"
  | "raci_update"
  | "hard_block"
  | "sipe_update"
  | "risk_assessment"
  | "caas_activation"
  | "agent_run"
  | "prompt_change"
  | "ap_invoice_created"
  | "ap_invoice_status";

export interface LedgerEntryInput {
  engagementId?: string;
  entryType: EvidenceEntryType;
  subject: string;
  payload: Record<string, unknown>;
  authorAgent?: AgentName;
  authorHuman?: string;
  gateNumber?: number;
}

// ─── SHA-256 Hashing ──────────────────────────────────────────────────────────

export function sha256(data: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(data, Object.keys(data as object).sort()))
    .digest("hex");
}

// ─── Chain Hash (blockchain-style integrity) ──────────────────────────────────

async function getLastChainHash(engagementId?: string): Promise<string | null> {
  const where = engagementId
    ? eq(evidenceEntries.engagementId, engagementId)
    : undefined;

  const last = await db
    .select({ chainHash: evidenceEntries.chainHash, sha256Hash: evidenceEntries.sha256Hash })
    .from(evidenceEntries)
    .where(where)
    .orderBy(desc(evidenceEntries.createdAt))
    .limit(1);

  return last[0]?.sha256Hash ?? null;
}

// ─── Write to Zone 1 Ledger ───────────────────────────────────────────────────

export async function writeToLedger(input: LedgerEntryInput) {
  const payload = {
    ...input.payload,
    _meta: {
      engagementId: input.engagementId,
      entryType: input.entryType,
      subject: input.subject,
      authorAgent: input.authorAgent,
      authorHuman: input.authorHuman,
      timestamp: new Date().toISOString(),
    },
  };

  const sha256Hash = sha256(payload);
  const chainHash = await getLastChainHash(input.engagementId);

  const [entry] = await db
    .insert(evidenceEntries)
    .values({
      engagementId: input.engagementId,
      entryType: input.entryType,
      subject: input.subject,
      payload,
      sha256Hash,
      chainHash,
      authorAgent: input.authorAgent,
      authorHuman: input.authorHuman,
      gateNumber: input.gateNumber,
      immutable: true,
    })
    .returning();

  return entry;
}

// ─── Gate Approval Entry ──────────────────────────────────────────────────────

export async function recordGateApproval(params: {
  engagementId: string;
  gateNumber: number;
  scores: Record<string, number>;
  approvedBy: string;
  notes?: string;
}) {
  return writeToLedger({
    engagementId: params.engagementId,
    entryType: "gate_approval",
    subject: `Gate ${params.gateNumber} Approved`,
    gateNumber: params.gateNumber,
    payload: {
      gate: params.gateNumber,
      scores: params.scores,
      approvedBy: params.approvedBy,
      notes: params.notes,
    },
    authorAgent: "governance",
    authorHuman: params.approvedBy,
  });
}

// ─── IP Lock Entry ────────────────────────────────────────────────────────────

export async function recordIPLock(params: {
  engagementId: string;
  artifactType: "sop" | "blueprint" | "design";
  artifactName: string;
  content: unknown;
}) {
  const artifactHash = sha256(params.content);
  return writeToLedger({
    engagementId: params.engagementId,
    entryType: "ip_lock",
    subject: `IP Locked: ${params.artifactName}`,
    gateNumber: 3,
    payload: {
      artifactType: params.artifactType,
      artifactName: params.artifactName,
      artifactHash,
      lockedAt: new Date().toISOString(),
    },
    authorAgent: "architecture",
  });
}

// ─── Hard Block Entry ─────────────────────────────────────────────────────────

export async function recordHardBlock(params: {
  engagementId: string;
  reason: string;
  failedChecks: string[];
  qaAgent?: string;
}) {
  return writeToLedger({
    engagementId: params.engagementId,
    entryType: "hard_block",
    subject: "Gate 4 Hard Block Activated",
    gateNumber: 4,
    payload: {
      reason: params.reason,
      failedChecks: params.failedChecks,
      blockedAt: new Date().toISOString(),
    },
    authorAgent: "qa",
  });
}

// ─── Invoice Entry ────────────────────────────────────────────────────────────

export async function recordInvoice(params: {
  engagementId: string;
  invoiceNumber: string;
  triggerGate: number;
  invoiceType: string;
  amountDue: number;
}) {
  return writeToLedger({
    engagementId: params.engagementId,
    entryType: "invoice",
    subject: `Invoice ${params.invoiceNumber} — ${params.invoiceType}`,
    gateNumber: params.triggerGate,
    payload: {
      invoiceNumber: params.invoiceNumber,
      invoiceType: params.invoiceType,
      amountDue: params.amountDue,
      currency: "USD",
      issuedAt: new Date().toISOString(),
    },
    authorAgent: "financial",
  });
}

// ─── Read from Ledger ─────────────────────────────────────────────────────────

export async function getLedgerEntries(params: {
  engagementId?: string;
  entryType?: EvidenceEntryType;
  limit?: number;
}) {
  const conditions = [];
  if (params.engagementId) {
    conditions.push(eq(evidenceEntries.engagementId, params.engagementId));
  }
  if (params.entryType) {
    conditions.push(eq(evidenceEntries.entryType, params.entryType));
  }

  const query = db
    .select()
    .from(evidenceEntries)
    .orderBy(desc(evidenceEntries.createdAt))
    .limit(params.limit ?? 50);

  return query;
}

// ─── Verify Chain Integrity ───────────────────────────────────────────────────

export async function verifyLedgerIntegrity(engagementId: string): Promise<{
  valid: boolean;
  totalEntries: number;
  brokenAt?: string;
}> {
  const entries = await db
    .select()
    .from(evidenceEntries)
    .where(eq(evidenceEntries.engagementId, engagementId))
    .orderBy(evidenceEntries.createdAt);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const recomputed = sha256(entry.payload as Record<string, unknown>);
    if (recomputed !== entry.sha256Hash) {
      return { valid: false, totalEntries: entries.length, brokenAt: entry.id };
    }
  }

  return { valid: true, totalEntries: entries.length };
}

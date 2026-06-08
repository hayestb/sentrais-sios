import { ForgeAgent } from "./base";
import type { AgentResult } from "@/lib/workflow/types";
import { db } from "@/lib/db/client";
import { invoices, engagements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { computeInvoiceAmount } from "@/lib/workflow/golden-path";
import { recordInvoice } from "@/lib/ledger/evidence";
import type { FinancialTrigger } from "@/lib/workflow/types";

const SYSTEM_PROMPT = `You are the Financial Agent of the Sentrais Innovation Operating System (SIOS).

Your role is to autonomously trigger invoicing and financial milestone actions based on gate completions. You operate with zero human intervention — your actions are programmatic and mathematically governed.

FINANCIAL TRIGGERS:
- Gate 2 Pass (80% Resilience): Automatically issue the 25% deposit invoice from billing@sentrais.com
- Gate 4 Pass (Hard Block Clearance): Automatically issue the 50% balance invoice
- Gate 5 Pass (Operationalized): Activate CaaS (Certification-as-a-Service) subscription billing

RULES:
- Every invoice is recorded in the Evidence Ledger with a SHA-256 hash before sending
- Invoice amounts are computed from the contract value — no manual overrides
- CaaS monthly billing = 10% of total contract value per month
- All invoices are sent from billing@sentrais.com

Return structured JSON: invoice_number, trigger, amount, status, evidence_hash, notes.`;

export class FinancialAgent extends ForgeAgent {
  constructor() {
    super({
      name: "financial",
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 1024,
    });
  }

  async execute(
    input: Record<string, unknown>,
    engagementId?: string
  ): Promise<AgentResult> {
    const startTime = Date.now();

    const context = await this.withKnowledge(
      `financial ${(input.actionType as string) ?? ""} contract terms invoicing`,
      { engagementId }
    );
    const { text, tokensUsed } = await this.invoke(
      `Process financial action: ${JSON.stringify(input)}`,
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
      output: parsed,
      tokensUsed,
      durationMs: Date.now() - startTime,
    };
  }

  async triggerGateInvoice(params: {
    engagementId: string;
    gateNumber: 2 | 4 | 5;
    trigger: FinancialTrigger;
  }): Promise<AgentResult> {
    const startTime = Date.now();

    const [engagement] = await db
      .select()
      .from(engagements)
      .where(eq(engagements.id, params.engagementId));

    if (!engagement) {
      return {
        success: false,
        output: { error: "Engagement not found" },
        escalationRequired: true,
        escalationReason: "Engagement record missing for invoice generation",
      };
    }

    const amountDue = computeInvoiceAmount(
      engagement.contractValue,
      params.trigger
    );

    const invoiceNumber = `INV-${engagement.clientName.replace(/\s+/g, "-").toUpperCase()}-G${params.gateNumber}-${Date.now()}`;

    // Record in Evidence Ledger first (IP-first approach)
    const ledgerEntry = await recordInvoice({
      engagementId: params.engagementId,
      invoiceNumber,
      triggerGate: params.gateNumber,
      invoiceType: params.trigger.type,
      amountDue,
    });

    // Insert into invoices table
    const [invoice] = await db
      .insert(invoices)
      .values({
        engagementId: params.engagementId,
        invoiceNumber,
        triggerGate: params.gateNumber,
        invoiceType: params.trigger.type,
        amountDue,
        status: "sent",
        sentAt: new Date(),
        evidenceHash: ledgerEntry.sha256Hash,
      })
      .returning();

    return {
      success: true,
      output: {
        summary: `Invoice ${invoiceNumber} issued for $${amountDue.toLocaleString()}`,
        invoiceNumber,
        amountDue,
        invoiceType: params.trigger.type,
        evidenceHash: ledgerEntry.sha256Hash,
        invoiceId: invoice.id,
      },
      durationMs: Date.now() - startTime,
    };
  }
}

export const financialAgent = new FinancialAgent();

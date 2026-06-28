import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { apInvoices, engagements } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { writeToLedger } from "@/lib/ledger/evidence";

const VALID_PROJECT_CODES = [
  "NFL/SEG", "FIFA Readiness", "BRIC", "Miami Expo", "Atlanta POC", "ARI Programming",
];

function evaluateFlags(invoice: { amount: number; projectCode?: string | null }): string[] {
  const flags: string[] = [];
  if (invoice.amount > 2500) {
    flags.push("HOLD_CFO: Transaction over $2,500 — requires CFO review before processing");
  }
  if (invoice.amount > 10000) {
    flags.push("HOLD_DUAL_OFFICER: ACH/wire over $10,000 — requires dual officer approval");
  }
  if (!invoice.projectCode || !VALID_PROJECT_CODES.includes(invoice.projectCode)) {
    flags.push("MISSING_PROJECT_CODE: No valid project code assigned — auto-hold");
  }
  return flags;
}

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "sysadmin" && profile.role !== "admin") {
    return NextResponse.json({ error: "Restricted to admins." }, { status: 403 });
  }

  const rows = await db
    .select({
      id: apInvoices.id,
      vendorName: apInvoices.vendorName,
      invoiceNumber: apInvoices.invoiceNumber,
      amount: apInvoices.amount,
      capitalPool: apInvoices.capitalPool,
      entity: apInvoices.entity,
      engagementId: apInvoices.engagementId,
      status: apInvoices.status,
      dueDate: apInvoices.dueDate,
      paidAt: apInvoices.paidAt,
      projectCode: apInvoices.projectCode,
      billcomId: apInvoices.billcomId,
      notes: apInvoices.notes,
      approvedBy: apInvoices.approvedBy,
      createdAt: apInvoices.createdAt,
      engagementName: engagements.clientName,
    })
    .from(apInvoices)
    .leftJoin(engagements, eq(apInvoices.engagementId, engagements.id))
    .orderBy(asc(apInvoices.dueDate));

  const invoices = rows.map((r) => ({
    id: r.id,
    vendor_name: r.vendorName,
    invoice_number: r.invoiceNumber,
    amount: r.amount,
    capital_pool: r.capitalPool,
    entity: r.entity,
    engagement_id: r.engagementId,
    status: r.status,
    due_date: r.dueDate,
    paid_at: r.paidAt,
    project_code: r.projectCode,
    billcom_id: r.billcomId,
    notes: r.notes,
    approved_by: r.approvedBy,
    created_at: r.createdAt,
    engagements: r.engagementName ? { name: r.engagementName } : null,
  }));

  return NextResponse.json({ invoices });
}

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "sysadmin" && profile.role !== "admin") {
    return NextResponse.json({ error: "Restricted to admins." }, { status: 403 });
  }

  const body = await request.json() as {
    vendor_name: string;
    invoice_number?: string;
    amount: number;
    project_code?: string;
    capital_pool?: "operating" | "mission" | "research" | "legacy";
    entity?: string;
    engagement_id?: string;
    due_date?: string;
    notes?: string;
    status?: "pending" | "approved" | "paid" | "rejected" | "on_hold";
  };

  if (!body.vendor_name || !body.amount) {
    return NextResponse.json({ error: "vendor_name and amount are required." }, { status: 400 });
  }

  if (!body.project_code || !VALID_PROJECT_CODES.includes(body.project_code)) {
    return NextResponse.json({
      error: `BILLBACK_REQUIRED: No valid client/project code. Active codes: ${VALID_PROJECT_CODES.join(", ")}.`,
    }, { status: 400 });
  }

  const flags = evaluateFlags({ amount: body.amount, projectCode: body.project_code });
  const notesWithFlags = flags.length > 0
    ? `${body.notes ?? ""}\n\nAUTO-FLAGS:\n${flags.join("\n")}`.trim()
    : (body.notes ?? null);

  const [invoice] = await db
    .insert(apInvoices)
    .values({
      vendorName: body.vendor_name,
      invoiceNumber: body.invoice_number ?? null,
      amount: body.amount,
      capitalPool: body.capital_pool ?? "operating",
      entity: body.entity ?? "sentrais_inc",
      engagementId: body.engagement_id ?? null,
      status: body.status ?? "pending",
      dueDate: body.due_date ? new Date(body.due_date) : null,
      projectCode: body.project_code,
      notes: notesWithFlags,
    })
    .returning();

  await writeToLedger({
    entryType: "ap_invoice_created",
    subject: `AP invoice created — ${body.vendor_name} $${body.amount}`,
    authorHuman: profile.fullName,
    payload: { invoice_id: invoice.id, vendor_name: body.vendor_name, amount: body.amount, flags },
  });

  return NextResponse.json({ invoice, flags }, { status: 201 });
}

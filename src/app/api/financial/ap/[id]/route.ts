import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { apInvoices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { writeToLedger } from "@/lib/ledger/evidence";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "sysadmin" && profile.role !== "admin") {
    return NextResponse.json({ error: "Restricted to admins." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json() as {
    status?: "pending" | "approved" | "paid" | "rejected" | "on_hold";
    billcom_id?: string;
    second_approver_id?: string;
  };

  const [current] = await db
    .select({ status: apInvoices.status, amount: apInvoices.amount })
    .from(apInvoices)
    .where(eq(apInvoices.id, id))
    .limit(1);

  if (!current) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });

  // Dual-officer guard for large approvals
  if (body.status === "approved" && current.amount && current.amount > 10000) {
    if (!body.second_approver_id) {
      return NextResponse.json({
        error: "DUAL_OFFICER_REQUIRED: Transactions over $10,000 require a second officer approval.",
      }, { status: 403 });
    }
  }

  const updates: Partial<typeof apInvoices.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (body.status) {
    updates.status = body.status;
    updates.approvedBy = profile.id;
    if (body.status === "paid") updates.paidAt = new Date();
  }
  if (body.billcom_id !== undefined) updates.billcomId = body.billcom_id;

  const [updated] = await db
    .update(apInvoices)
    .set(updates)
    .where(eq(apInvoices.id, id))
    .returning();

  if (body.status && body.status !== current.status) {
    await writeToLedger({
      entryType: "ap_invoice_status",
      subject: `AP invoice ${body.status} — ${id.slice(0, 8)}`,
      authorHuman: profile.fullName,
      payload: {
        invoice_id: id,
        previous_status: current.status,
        new_status: body.status,
      },
    });
  }

  return NextResponse.json({ invoice: updated });
}

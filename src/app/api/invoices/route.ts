import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { invoices, engagements } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const engagementId = searchParams.get("engagementId");
  const status = searchParams.get("status") as "pending" | "sent" | "paid" | "overdue" | null;

  const conditions = [];
  if (engagementId) conditions.push(eq(invoices.engagementId, engagementId));
  if (status) conditions.push(eq(invoices.status, status));

  const rows = await db
    .select({
      invoice: invoices,
      clientName: engagements.clientName,
      vertical: engagements.vertical,
    })
    .from(invoices)
    .innerJoin(engagements, eq(invoices.engagementId, engagements.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(invoices.createdAt));

  const totals = rows.reduce(
    (acc, { invoice }) => {
      acc.total += invoice.amountDue;
      if (invoice.status === "pending") acc.pending += invoice.amountDue;
      if (invoice.status === "sent") acc.sent += invoice.amountDue;
      if (invoice.status === "paid") acc.paid += invoice.amountDue;
      if (invoice.status === "overdue") acc.overdue += invoice.amountDue;
      return acc;
    },
    { total: 0, pending: 0, sent: 0, paid: 0, overdue: 0 }
  );

  return NextResponse.json({ invoices: rows, totals });
}

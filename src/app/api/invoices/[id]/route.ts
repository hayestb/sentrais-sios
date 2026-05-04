import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { invoices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateSchema = z.object({
  status: z.enum(["pending", "sent", "paid", "overdue"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { status } = parsed.data;
  const now = new Date();

  const [updated] = await db
    .update(invoices)
    .set({
      status,
      sentAt: status === "sent" ? now : undefined,
      paidAt: status === "paid" ? now : undefined,
    })
    .where(eq(invoices.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json({ invoice: updated });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ invoice });
}

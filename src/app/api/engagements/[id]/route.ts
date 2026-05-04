import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { engagements, gateRecords, agentTasks, invoices } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [engagement] = await db
    .select()
    .from(engagements)
    .where(eq(engagements.id, id));

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  const gates = await db
    .select()
    .from(gateRecords)
    .where(eq(gateRecords.engagementId, id))
    .orderBy(gateRecords.gateNumber);

  const recentTasks = await db
    .select()
    .from(agentTasks)
    .where(eq(agentTasks.engagementId, id))
    .orderBy(desc(agentTasks.createdAt))
    .limit(20);

  const engagementInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.engagementId, id))
    .orderBy(desc(invoices.createdAt));

  return NextResponse.json({ engagement, gates, recentTasks, invoices: engagementInvoices });
}

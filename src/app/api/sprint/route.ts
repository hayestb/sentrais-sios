import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { sprintCycles, engagements } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { buildSprintSchedule, getCurrentSprintDay } from "@/lib/sprint/cadence";
import { governanceAgent } from "@/lib/agents/governance";
import { addDays } from "date-fns";

const StartSprintSchema = z.object({
  engagementId: z.string().uuid(),
  startDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const engagementId = searchParams.get("engagementId");

  if (!engagementId) {
    return NextResponse.json({ error: "engagementId required" }, { status: 400 });
  }

  const sprints = await db
    .select()
    .from(sprintCycles)
    .where(eq(sprintCycles.engagementId, engagementId))
    .orderBy(desc(sprintCycles.sprintNumber));

  const activeSprint = sprints[0];
  const schedule = activeSprint
    ? buildSprintSchedule(activeSprint.sprintNumber, activeSprint.startDate)
    : null;

  const currentDay = activeSprint
    ? getCurrentSprintDay(activeSprint.startDate)
    : null;

  return NextResponse.json({ sprints, activeSprint, schedule, currentDay });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = StartSprintSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { engagementId, startDate } = parsed.data;

  const [engagement] = await db
    .select()
    .from(engagements)
    .where(eq(engagements.id, engagementId));

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  const start = startDate ? new Date(startDate) : new Date();
  const end = addDays(start, 14);
  const sprintNum = engagement.sprintNumber;

  const schedule = buildSprintSchedule(sprintNum, start);

  const [sprint] = await db
    .insert(sprintCycles)
    .values({
      engagementId,
      sprintNumber: sprintNum,
      startDate: start,
      endDate: end,
      huddle: schedule.events.find((e) => e.type === "huddle")?.date,
      techSync: schedule.events.find((e) => e.type === "tech_sync")?.date,
      qaReview: schedule.events.find((e) => e.type === "qa_review")?.date,
      retrospective: schedule.events.find((e) => e.type === "retrospective")?.date,
    })
    .returning();

  // Governance Agent resets RACI on sprint start
  governanceAgent.resetRaciMatrix(engagementId, sprintNum).catch(() => {});

  return NextResponse.json({ sprint, schedule }, { status: 201 });
}

import { addDays, startOfDay, format, isWeekend } from "date-fns";
import type { SprintEvent, AgentName } from "@/lib/workflow/types";

export const SPRINT_DURATION_DAYS = 10;

// ─── Sprint Event Schedule ────────────────────────────────────────────────────

export const SPRINT_EVENTS: SprintEvent[] = [
  {
    day: 1,
    type: "huddle",
    label: "The Huddle — Sprint Planning",
    agents: ["governance", "delivery"],
    objective: "Define sprint buckets. Reset RACI matrix. Set two-week goals.",
  },
  {
    day: 2,
    type: "execution",
    label: "Execution & Build (Throughput Zone)",
    agents: ["delivery", "intake", "discovery"],
    objective: "Begin active sprint work. Agents begin routing and processing.",
  },
  {
    day: 3,
    type: "tech_sync",
    label: "Tech Sync — State Machine Alignment",
    agents: ["architecture", "governance"],
    objective: "Mandatory alignment: Solution Architect + EL + MetaData. Validate temporal state machines.",
  },
  {
    day: 4,
    type: "execution",
    label: "Primary Execution Zone",
    agents: ["delivery", "assessment", "design"],
    objective: "Maximum throughput. Asynchronous execution. No sync overhead.",
  },
  {
    day: 5,
    type: "execution",
    label: "Primary Execution Zone",
    agents: ["delivery"],
    objective: "Maximum throughput.",
  },
  {
    day: 6,
    type: "execution",
    label: "Primary Execution Zone",
    agents: ["delivery"],
    objective: "Maximum throughput.",
  },
  {
    day: 7,
    type: "execution",
    label: "Primary Execution Zone",
    agents: ["delivery"],
    objective: "Maximum throughput.",
  },
  {
    day: 8,
    type: "execution",
    label: "Primary Execution Zone",
    agents: ["delivery", "communications"],
    objective: "Final build push. Communications agent prepares QA briefing.",
  },
  {
    day: 9,
    type: "qa_review",
    label: "QA Review — Hard Block Validation",
    agents: ["qa", "governance"],
    objective: "QA Agent runs final structural validation against Hard Block requirements. No go-live until cleared.",
  },
  {
    day: 10,
    type: "retrospective",
    label: "Retrospective — SIPE Engine Update",
    agents: ["learning", "communications", "portfolio"],
    objective: "Ingest cycle performance data. Update SIPE intelligence engine. Pre-populate next sprint playbook.",
  },
];

// ─── Sprint Date Calculation ──────────────────────────────────────────────────

export interface SprintSchedule {
  sprintNumber: number;
  startDate: Date;
  endDate: Date;
  events: Array<SprintEvent & { date: Date; dateLabel: string }>;
}

export function buildSprintSchedule(
  sprintNumber: number,
  startDate: Date = new Date()
): SprintSchedule {
  const start = startOfDay(startDate);
  let workdayCount = 0;
  let calendarDay = 0;

  const eventDates: Map<number, Date> = new Map();
  let endDate = start;

  while (workdayCount < SPRINT_DURATION_DAYS) {
    const date = addDays(start, calendarDay);
    if (!isWeekend(date)) {
      workdayCount++;
      eventDates.set(workdayCount, date);
      endDate = date;
    }
    calendarDay++;
  }

  const events = SPRINT_EVENTS.map((event) => ({
    ...event,
    date: eventDates.get(event.day)!,
    dateLabel: format(eventDates.get(event.day)!, "EEE, MMM d"),
  }));

  return { sprintNumber, startDate: start, endDate, events };
}

export function getCurrentSprintDay(sprintStart: Date): number {
  const now = new Date();
  let workdays = 0;
  let d = startOfDay(sprintStart);

  while (d <= now) {
    if (!isWeekend(d)) workdays++;
    d = addDays(d, 1);
  }

  return Math.min(workdays, SPRINT_DURATION_DAYS);
}

export function getSprintEvent(day: number): SprintEvent | undefined {
  return SPRINT_EVENTS.find((e) => e.day === day);
}

export function getActiveAgentsForDay(day: number): AgentName[] {
  return SPRINT_EVENTS.find((e) => e.day === day)?.agents ?? ["delivery"];
}

// ─── RACI Matrix Default ──────────────────────────────────────────────────────

export const DEFAULT_RACI_MATRIX: Record<string, {
  role: string;
  email: string;
  decisionAuthority: string;
  boundary: string;
  aiCounterpart: AgentName;
}> = {
  knox_phillips: {
    role: "CPO / CRO",
    email: "advisory@sentrais.com",
    decisionAuthority: "Commercial Strategy & Product Principles",
    boundary: "Does not manage daily client tasks",
    aiCounterpart: "portfolio",
  },
  ai_platform_lead: {
    role: "AI Platform Lead",
    email: "governance@sentrais.com",
    decisionAuthority: "AI Platform Integrity & Agent Orchestration",
    boundary: "Does not author commercial strategy",
    aiCounterpart: "governance",
  },
  engagement_lead: {
    role: "Engagement Lead (EL)",
    email: "success@sentrais.com",
    decisionAuthority: "NFL Client Relationship & Gate Readiness",
    boundary: "Does not write code; manages the Brain outputs",
    aiCounterpart: "communications",
  },
  solution_architect: {
    role: "Solution Architect",
    email: "architecture@sentrais.com",
    decisionAuthority: "Technical Validation & Workflow Design",
    boundary: "Does not own commercial negotiations",
    aiCounterpart: "architecture",
  },
  metadata_partner: {
    role: "MetaData (Technical Partner)",
    email: "delivery@sentrais.com",
    decisionAuthority: "Technical Build & Infrastructure Execution",
    boundary: "Zero manual micromanagement from Sentrais Advisory",
    aiCounterpart: "delivery",
  },
};

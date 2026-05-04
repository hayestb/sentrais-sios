import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import {
  sprintCycles, gateReviews, budgetMilestones,
  vendors, remediationActions, engagements,
} from "@/lib/db/schema";
import { isNotNull, gte } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

  const [sprints, reviews, milestones, vendorList, actions, engList] = await Promise.all([
    db.select().from(sprintCycles).where(gte(sprintCycles.startDate, cutoff)),
    db.select().from(gateReviews),
    db.select().from(budgetMilestones).where(isNotNull(budgetMilestones.dueDate)),
    db.select().from(vendors).where(isNotNull(vendors.contractEnd)),
    db.select().from(remediationActions).where(isNotNull(remediationActions.dueDate)),
    db.select({ id: engagements.id, clientName: engagements.clientName }).from(engagements),
  ]);

  const engMap = Object.fromEntries(engList.map((e) => [e.id, e.clientName]));

  const events: {
    id: string; date: string; title: string; subtitle?: string;
    type: string; color: string; engagementName?: string;
  }[] = [];

  // Sprint events
  for (const s of sprints) {
    if (s.huddle) events.push({ id: `sprint-huddle-${s.id}`, date: s.huddle.toISOString(), title: `Sprint ${s.sprintNumber} Huddle`, type: "sprint", color: "text-purple-400", engagementName: engMap[s.engagementId] });
    if (s.techSync) events.push({ id: `sprint-tech-${s.id}`, date: s.techSync.toISOString(), title: `Sprint ${s.sprintNumber} Tech Sync`, type: "sprint", color: "text-purple-400", engagementName: engMap[s.engagementId] });
    if (s.qaReview) events.push({ id: `sprint-qa-${s.id}`, date: s.qaReview.toISOString(), title: `Sprint ${s.sprintNumber} QA Review`, type: "sprint", color: "text-purple-400", engagementName: engMap[s.engagementId] });
    if (s.retrospective) events.push({ id: `sprint-retro-${s.id}`, date: s.retrospective.toISOString(), title: `Sprint ${s.sprintNumber} Retrospective`, type: "sprint", color: "text-purple-400", engagementName: engMap[s.engagementId] });
  }

  // Gate reviews
  for (const r of reviews) {
    events.push({ id: `gate-${r.id}`, date: r.reviewedAt.toISOString(), title: `Gate ${r.gateNumber} Review`, subtitle: r.outcome.replace(/_/g, " "), type: "gate", color: "text-primary", engagementName: engMap[r.engagementId] });
  }

  // Budget milestones
  for (const m of milestones) {
    if (m.dueDate) events.push({ id: `milestone-${m.id}`, date: m.dueDate.toISOString(), title: m.label, subtitle: `$${m.amount.toLocaleString()}`, type: "milestone", color: "text-[#00D4AA]", engagementName: engMap[m.engagementId] });
  }

  // Vendor contract renewals
  for (const v of vendorList) {
    if (v.contractEnd) events.push({ id: `vendor-${v.id}`, date: v.contractEnd.toISOString(), title: `${v.name} Contract End`, subtitle: v.category, type: "vendor", color: "text-orange-400" });
  }

  // Remediation due dates
  for (const a of actions) {
    if (a.dueDate && a.status !== "done") events.push({ id: `rem-${a.id}`, date: a.dueDate.toISOString(), title: a.title, subtitle: `Priority: ${a.priority}`, type: "remediation", color: "text-red-400", engagementName: engMap[a.engagementId] });
  }

  return NextResponse.json({ events });
}

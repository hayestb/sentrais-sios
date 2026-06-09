// @ts-nocheck
import { useState } from "react";
import { Users, Zap, ArrowRight, BarChart2, MessageSquare, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody, ForgeLabel,
  ForgeBadge, ForgeAlert, ForgeGrid, C,
} from "../components/ui/forge";

const POD_COMPOSITION = {
  roles: [
    { title: "Pod Leader", count: 1, color: C.accent, responsibility: "Owns pod P&L, unblocks team, runs weekly pod sync, reports executive dashboard quadrant" },
    { title: "Growth Marketer", count: 1, color: C.teal, responsibility: "Pipeline generation, content, field events; variable comp tied to pod pipeline + revenue" },
    { title: "Business Development Rep (BDR)", count: "1–2", color: C.purple, responsibility: "Qualified meeting generation; 15-min speed-to-lead SLA on all MQL handoffs from marketing" },
    { title: "Account Executive (AE)", count: 2, color: C.green, responsibility: "Closes deals, owns ARR quota; 80% individual ARR + 20% pod NRR" },
    { title: "Customer Success Manager (CSM)", count: 1, color: C.amber, responsibility: "Retention, expansion signals, post-handoff ownership; 70% retention + 30% expansion" },
  ],
  podKicker: {
    description: "Shared quarterly pool unlocked at 100% collective target. Accelerator kicks in at 115%.",
    mechanics: [
      "Pool funded at quarter-close — distributed within 30 days",
      "Requires all pod members to hit individual floor (70%) to participate",
      "Clawback: 90-day churn clawback on AE deals; 180-day on CSM retention",
      "Onboarding milestone bonus: 80% at contract close + 20% at verified TTV",
    ],
  },
};

const COMP_TABLE = [
  { role: "Account Executive (AE)", base: "80% individual ARR quota", variable: "20% pod NRR (Net Revenue Retention)", kicker: "Pod kicker pool at 100% + accelerator at 115%", clawback: "90 days" },
  { role: "Customer Success Manager (CSM)", base: "70% portfolio retention rate", variable: "30% pod expansion (upsell/cross-sell)", kicker: "Pod kicker pool at 100%", clawback: "180 days" },
  { role: "Growth Marketer", base: "Fixed base salary", variable: "Pod pipeline $ + pod revenue achievement", kicker: "Pod kicker pool at 100%", clawback: "N/A" },
  { role: "Business Dev Rep (BDR)", base: "70% qualified meetings delivered", variable: "30% pod closed-won contribution", kicker: "Pod kicker pool at 100%", clawback: "N/A" },
  { role: "Pod Leader", base: "Fixed base + management comp", variable: "Pod P&L performance vs target", kicker: "Executive kicker at 110% pod attainment", clawback: "90 days on pod deals" },
];

const ROADMAP_PHASES = [
  {
    phase: "Phase 1: Foundation & Pilot",
    days: "Days 1–30",
    color: C.accent,
    milestones: [
      "Org announcement + town hall — Why pods, what changes, what doesn't",
      "CRM routing rules configured by regional pod assignment",
      "ERP cost centers created per pod (pilot pod first)",
      "Pod Leader assigned; first team roster finalized",
      "30-day dry run: track leads/deals through pod routing before full cutover",
      "Individual comp targets translated to pod comp model",
      "All three handoff playbooks documented and distributed",
    ],
  },
  {
    phase: "Phase 2: Testing & Calibration",
    days: "Days 31–60",
    color: C.teal,
    milestones: [
      "All active deals migrated to pod cost-center attribution",
      "Week 3 + Week 5 check-in: Is routing working? Objections addressed?",
      "Pod kicker mechanics validated with Finance — pool math confirmed",
      "First pod sync cadence running (weekly async + bi-weekly live)",
      "Executive dashboard quadrants reviewed by CEO — pipeline / velocity / retention / pod leader",
      "BDR 15-min speed-to-lead SLA tracked; violations flagged",
      "AE→CSM 24-hr handoff brief compliance tracked in CRM",
    ],
  },
  {
    phase: "Phase 3: Full Expansion",
    days: "Days 61–90",
    color: C.green,
    milestones: [
      "All pods fully operational — no legacy departmental attribution",
      "First kicker pool calculated and distributed",
      "Pod performance dashboard live for all Pod Leaders",
      "Underperforming pods identified — coaching plan initiated",
      "City-level pod assignments confirmed (ATL, NO, BOS, LA)",
      "BGI pod alignment confirmed (independent from commercial pods)",
      "Q3 QBR with executive team — full pod model review",
    ],
  },
];

const HANDOFFS = [
  {
    title: "Handoff 1: Marketing → BDR / AE",
    trigger: "MQL threshold reached in HubSpot",
    sla: "15-minute speed-to-lead",
    color: C.accent,
    steps: [
      { step: "Marketing scores lead at MQL threshold", owner: "Marketer", time: "T=0" },
      { step: "HubSpot routing assigns to pod BDR/AE by region", owner: "System", time: "T=auto" },
      { step: "BDR receives Slack notification + CRM task", owner: "BDR", time: "T=0" },
      { step: "BDR makes first outreach attempt", owner: "BDR", time: "T≤15 min" },
      { step: "BDR logs outcome in CRM — if no answer, auto-sequence activates", owner: "BDR", time: "T=15 min" },
      { step: "Pod Leader reviews stale MQLs (>24 hrs uncontacted) weekly", owner: "Pod Leader", time: "Weekly" },
    ],
    failureMode: "No outreach within 15 min = Pod Leader notified; repeat violations escalated to Exec GTM",
  },
  {
    title: "Handoff 2: AE → CSM (At Close)",
    trigger: "Contract executed — deal marked Closed Won in CRM",
    sla: "24-hour CRM brief + 48-hour warm intro call",
    color: C.teal,
    steps: [
      { step: "AE marks deal Closed Won; triggers CSM assignment task", owner: "AE", time: "T=0" },
      { step: "AE completes 24-hr CRM handoff brief (context, stakeholders, risks, expansion signals)", owner: "AE", time: "T≤24 hr" },
      { step: "CSM reviews brief; schedules warm intro call with client", owner: "CSM", time: "T≤48 hr" },
      { step: "AE leads warm intro call; formally introduces CSM as account owner", owner: "AE + CSM", time: "T≤48 hr" },
      { step: "CSM owns account — AE still available for expansion opportunities", owner: "CSM", time: "Ongoing" },
    ],
    failureMode: "CRM brief not completed in 24 hrs = AE comp risk flag. Warm intro >48 hrs = Pod Leader must intervene.",
  },
  {
    title: "Handoff 3: CSM → AE (Expansion Signal)",
    trigger: "≥85% product utilization OR NPS score 9–10 detected",
    sla: "48-hour expansion brief to AE",
    color: C.amber,
    steps: [
      { step: "CSM detects expansion signal: utilization ≥85% or NPS 9-10", owner: "CSM", time: "T=0 (signal)" },
      { step: "CSM creates expansion opportunity in CRM; tags AE", owner: "CSM", time: "T≤24 hr" },
      { step: "CSM prepares 48-hr expansion brief: context, ask, timing", owner: "CSM", time: "T≤48 hr" },
      { step: "AE reviews brief; CSM + AE plan expansion approach together", owner: "AE + CSM", time: "T≤48 hr" },
      { step: "AE leads expansion conversation; CSM maintains relationship context", owner: "AE", time: "Active pursuit" },
    ],
    failureMode: "Expansion signal not logged within 24 hrs = missed revenue; CSM variable comp at risk",
  },
];

const EXEC_DASHBOARD = [
  {
    quadrant: "Pipeline Health",
    color: C.accent,
    metrics: [
      "Total pipeline value by pod ($)",
      "Pipeline velocity (days in stage by pod)",
      "MQL → SQL conversion rate by pod",
      "Speed-to-lead compliance rate (15-min SLA %)",
    ],
  },
  {
    quadrant: "Sales Velocity",
    color: C.green,
    metrics: [
      "Closed-Won ARR by pod (QTD vs quota)",
      "Average deal cycle time by pod",
      "Win/loss ratio by pod",
      "AE individual attainment vs 80% floor",
    ],
  },
  {
    quadrant: "Retention & Expansion",
    color: C.teal,
    metrics: [
      "Net Revenue Retention (NRR) by pod",
      "Accounts at risk (utilization <40% or NPS <7)",
      "Expansion opportunities identified (signal logged)",
      "CSM-to-AE handoff compliance rate",
    ],
  },
  {
    quadrant: "Pod Leader Summary",
    color: C.purple,
    metrics: [
      "Pod attainment vs collective target (%)",
      "Pod kicker threshold status (100% / 115%)",
      "Open blockers requiring Exec GTM intervention",
      "Pod headcount vs plan (open roles flagged)",
    ],
  },
];

const ASYNC_SYNC = [
  { type: "Daily Async", cadence: "Every business day", format: "Slack pod channel — 3-question standup bot", content: "Yesterday, today, blockers" },
  { type: "Weekly Pod Sync", cadence: "Every Monday", format: "30-min live call (pod members only)", content: "Pipeline review, handoff status, blocker resolution" },
  { type: "Bi-Weekly Exec Review", cadence: "Every other Thursday", format: "60-min Pod Leader → Exec GTM", content: "Dashboard quadrants, kicker status, escalations" },
  { type: "Monthly All-Pods", cadence: "Last Friday of month", format: "60-min all pods + Founder", content: "Cross-pod wins, learnings, market signals" },
  { type: "Quarterly Calibration", cadence: "First week of new quarter", format: "Half-day working session", content: "Kicker pool distribution, target setting, pod adjustments" },
];

const TABS = [
  { id: "composition", label: "Pod Composition", icon: Users },
  { id: "comp", label: "Comp Model", icon: BarChart2 },
  { id: "roadmap", label: "90-Day Roadmap", icon: Clock },
  { id: "handoffs", label: "3-Handoff Playbook", icon: ArrowRight },
  { id: "comms", label: "Communication Protocol", icon: MessageSquare },
];

export default function PodStructure() {
  const [tab, setTab] = useState("composition");

  return (
    <ForgePage>
      <ForgeHeader
        icon={Users}
        title="GTM Pod Structure"
        subtitle="Pod composition · Core+Kicker comp · 90-day roadmap · 3-handoff playbook · Communication protocol"
        stats={[
          { label: "Pod Roles", value: 5, color: C.accent },
          { label: "Kicker Trigger", value: "100% Target", color: C.green },
          { label: "Accelerator", value: "@ 115%", color: C.teal },
        ]}
      />
      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />

      <ForgeContent>

        {tab === "composition" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ForgeCard>
              <ForgeCardHeader><ForgeLabel color={C.accent}>Cross-Functional Pod Structure</ForgeLabel></ForgeCardHeader>
              <ForgeCardBody style={{ padding: 0 }}>
                {POD_COMPOSITION.roles.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "14px 20px", borderBottom: i < POD_COMPOSITION.roles.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: r.color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Users size={14} color={r.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{r.title}</span>
                        <ForgeBadge variant="neutral">×{r.count}</ForgeBadge>
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{r.responsibility}</div>
                    </div>
                  </div>
                ))}
              </ForgeCardBody>
            </ForgeCard>

            <ForgeCard>
              <ForgeCardHeader><ForgeLabel color={C.green}>Pod Kicker — Shared Pool Mechanics</ForgeLabel></ForgeCardHeader>
              <ForgeCardBody>
                <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginTop: 0, marginBottom: 12 }}>{POD_COMPOSITION.podKicker.description}</p>
                {POD_COMPOSITION.podKicker.mechanics.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>
                    <CheckCircle2 size={13} color={C.green} style={{ flexShrink: 0, marginTop: 1 }} />{m}
                  </div>
                ))}
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

        {tab === "comp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ForgeAlert level="info">
              Core + Kicker model. Individual floors must be hit (70%+ attainment) to participate in pod kicker pool. Approval matrix: Pod Leader &lt;$5K · Exec GTM $5K–$25K · CFO &gt;$25K.
            </ForgeAlert>
            {COMP_TABLE.map((row, i) => (
              <ForgeCard key={i}>
                <ForgeCardBody>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>{row.role}</div>
                  <ForgeGrid cols={4} gap={12}>
                    <div>
                      <ForgeLabel>Base / Core (70–80%)</ForgeLabel>
                      <div style={{ fontSize: 12, color: C.accent, marginTop: 4, lineHeight: 1.4 }}>{row.base}</div>
                    </div>
                    <div>
                      <ForgeLabel>Variable / Kicker (20–30%)</ForgeLabel>
                      <div style={{ fontSize: 12, color: C.teal, marginTop: 4, lineHeight: 1.4 }}>{row.variable}</div>
                    </div>
                    <div>
                      <ForgeLabel>Pod Kicker Pool</ForgeLabel>
                      <div style={{ fontSize: 12, color: C.green, marginTop: 4, lineHeight: 1.4 }}>{row.kicker}</div>
                    </div>
                    <div>
                      <ForgeLabel>Clawback Period</ForgeLabel>
                      <div style={{ fontSize: 12, color: C.amber, marginTop: 4 }}>{row.clawback}</div>
                    </div>
                  </ForgeGrid>
                </ForgeCardBody>
              </ForgeCard>
            ))}

            <ForgeCard>
              <ForgeCardHeader><ForgeLabel color={C.amber}>Approval Matrix</ForgeLabel></ForgeCardHeader>
              <ForgeCardBody style={{ padding: 0 }}>
                {[
                  { tier: "Pod Leader", range: "< $5,000", color: C.green },
                  { tier: "Exec GTM", range: "$5,000 – $25,000", color: C.amber },
                  { tier: "CFO", range: "> $25,000", color: C.red },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{row.tier}</div>
                    <ForgeBadge variant={i === 0 ? "success" : i === 1 ? "warning" : "danger"}>{row.range}</ForgeBadge>
                  </div>
                ))}
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

        {tab === "roadmap" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {ROADMAP_PHASES.map((phase, pi) => (
              <ForgeCard key={pi} accent={phase.color}>
                <ForgeCardHeader>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: phase.color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: phase.color }}>
                      {pi + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: phase.color }}>{phase.phase}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{phase.days}</div>
                    </div>
                  </div>
                </ForgeCardHeader>
                <ForgeCardBody>
                  {phase.milestones.map((m, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#94a3b8", marginBottom: 8, lineHeight: 1.5 }}>
                      <CheckCircle2 size={13} color={phase.color} style={{ flexShrink: 0, marginTop: 1 }} />{m}
                    </div>
                  ))}
                </ForgeCardBody>
              </ForgeCard>
            ))}

            <ForgeCard>
              <ForgeCardHeader><ForgeLabel color={C.purple}>Executive Dashboard — 4 Quadrants</ForgeLabel></ForgeCardHeader>
              <ForgeCardBody>
                <ForgeGrid cols={2} gap={12}>
                  {EXEC_DASHBOARD.map((q, i) => (
                    <div key={i} style={{ background: C.bg, border: `1px solid ${q.color}30`, borderRadius: 10, padding: "14px 16px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: q.color, marginBottom: 10 }}>{q.quadrant}</div>
                      {q.metrics.map((m, j) => (
                        <div key={j} style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6, display: "flex", gap: 6 }}>
                          <div style={{ width: 3, height: 3, borderRadius: "50%", background: q.color, flexShrink: 0, marginTop: 5 }} />{m}
                        </div>
                      ))}
                    </div>
                  ))}
                </ForgeGrid>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

        {tab === "handoffs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {HANDOFFS.map((h, hi) => (
              <ForgeCard key={hi} accent={h.color}>
                <ForgeCardBody>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: h.color, marginBottom: 4 }}>{h.title}</div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Trigger: <span style={{ color: "#94a3b8" }}>{h.trigger}</span></div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>SLA: <span style={{ color: h.color, fontWeight: 600 }}>{h.sla}</span></div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 14 }}>
                    {h.steps.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: i < h.steps.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: h.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: h.color, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: "#e2e8f0" }}>{s.step}</div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Owner: {s.owner} · {s.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: "10px 14px", background: C.red + "10", border: `1px solid ${C.red}30`, borderRadius: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.red, marginBottom: 4 }}>FAILURE MODE</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{h.failureMode}</div>
                  </div>
                </ForgeCardBody>
              </ForgeCard>
            ))}
          </div>
        )}

        {tab === "comms" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ForgeCard>
              <ForgeCardHeader><ForgeLabel color={C.accent}>Async / Sync Communication Cadence</ForgeLabel></ForgeCardHeader>
              <ForgeCardBody style={{ padding: 0 }}>
                {ASYNC_SYNC.map((row, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 160px 1fr 1fr", gap: 16, alignItems: "start", padding: "14px 20px", borderBottom: i < ASYNC_SYNC.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{row.type}</div>
                    <div style={{ fontSize: 12, color: C.teal }}>{row.cadence}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{row.format}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{row.content}</div>
                  </div>
                ))}
              </ForgeCardBody>
            </ForgeCard>

            <ForgeGrid cols={2} gap={16}>
              <ForgeCard>
                <ForgeCardHeader><ForgeLabel color={C.green}>Async-First Rules</ForgeLabel></ForgeCardHeader>
                <ForgeCardBody>
                  {[
                    "Default to Slack for all non-urgent communication",
                    "Respond to pod channel messages within 4 business hours",
                    "Use threads — don't reply in main channel for side conversations",
                    "Meeting requests require an agenda — no agenda, no meeting",
                    "All decisions documented in Notion/Monday.com within 24 hrs of call",
                    "CRM must reflect reality — never send manual update, update CRM first",
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#94a3b8", marginBottom: 7 }}>
                      <CheckCircle2 size={12} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} />{r}
                    </div>
                  ))}
                </ForgeCardBody>
              </ForgeCard>

              <ForgeCard>
                <ForgeCardHeader><ForgeLabel color={C.red}>Escalation Protocol</ForgeLabel></ForgeCardHeader>
                <ForgeCardBody>
                  {[
                    "Blocker unresolved 24 hrs → Pod Leader escalates to Exec GTM",
                    "SLA breach (15-min speed-to-lead, 24/48-hr handoff) → Pod Leader notified immediately",
                    "Deal at risk (churn signal, competitor mention) → Pod Leader + CSM within 2 hrs",
                    "Spend decision >$5K → route to approval matrix before commitment",
                    "New city expansion request → CEO + Exec GTM before any external commitment",
                    "Any BGI-adjacent activity → stop and route to counsel",
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#94a3b8", marginBottom: 7 }}>
                      <AlertCircle size={12} color={C.red} style={{ flexShrink: 0, marginTop: 2 }} />{r}
                    </div>
                  ))}
                </ForgeCardBody>
              </ForgeCard>
            </ForgeGrid>
          </div>
        )}

      </ForgeContent>
    </ForgePage>
  );
}

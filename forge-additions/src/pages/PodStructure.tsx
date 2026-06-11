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
    {
      title: "Pod Leader",
      subtitle: "Product Marketer / Growth Director",
      count: 1, color: C.accent,
      responsibility: "Strategic direction, positioning, and market alignment for the pod's specific segment. Ensures the pod has the messaging, collateral, and strategic insights needed to win.",
      keyTasks: ["Developing buyer personas and segment-specific positioning", "Managing the pod's budget and spend authority (<$5K self-approve)", "Coordinating launch schedules and GTM calendar", "Unblocking cross-functional friction between demand gen, sales, and CS"],
    },
    {
      title: "Demand Generation / Growth Specialist",
      subtitle: "Growth Marketer",
      count: 1, color: C.teal,
      responsibility: "Fills the top of the funnel with high-intent pipeline specifically for this pod's target market segment.",
      keyTasks: ["Running targeted Account-Based Marketing (ABM) campaigns", "Managing paid acquisition for the pod's segment", "Optimizing segment-specific landing pages and conversion flows", "Creating lead-generation workflows and BDR handoff sequences"],
    },
    {
      title: "Business Development Rep (BDR)",
      subtitle: "Outbound & Inbound Sales",
      count: "1–2", color: C.purple,
      responsibility: "Converts marketing-generated pipeline and outbound sequences into qualified opportunities. 30-min speed-to-lead SLA on all inbound MQLs during business hours.",
      keyTasks: ["Qualifying inbound leads from demand gen campaigns", "Running outbound sequences tailored to the pod's segment", "Booking discovery calls for AEs", "Logging all activity in CRM within same business day"],
    },
    {
      title: "Account Executive (AE)",
      subtitle: "Closing & Revenue",
      count: 2, color: C.green,
      responsibility: "Converts qualified pipeline into closed-won revenue. Owns ARR quota. 24-hr CRM handover brief required at close.",
      keyTasks: ["Running discovery calls and deep-dive demos", "Managing negotiations and deal structuring", "Completing internal CRM handover brief within 24 hrs of close", "Collaborating with CSM on expansion opportunities"],
    },
    {
      title: "Customer Success Manager (CSM)",
      subtitle: "Retention, TTV & Expansion",
      count: 1, color: C.amber,
      responsibility: "Onboards new clients, drives time-to-value, retains accounts, and generates expansion revenue. 48-hr kickoff scheduling SLA from warm intro.",
      keyTasks: ["Guiding new clients through onboarding and implementation", "Monitoring product/service adoption and usage metrics", "Running quarterly business reviews (QBRs)", "Identifying and surfacing upsell/cross-sell signals to AE"],
    },
    {
      title: "RevOps / Data Support",
      subtitle: "Shared Operational Runway",
      count: "Shared", color: "#64748b",
      responsibility: "Cross-pod operational infrastructure. Maintains CRM hygiene, routing rules, reporting dashboards, and attribution integrity. Not pod-exclusive — shared across all pods.",
      keyTasks: ["CRM routing rule maintenance and regional pod assignment", "Pod dashboard reporting (pipeline, velocity, NRR, attainment)", "ERP cost-center reconciliation per pod", "Win/loss data analysis and quarterly insight distribution"],
    },
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
      "Town hall — frame the shift as autonomy + eliminating departmental bottlenecks, not micromanagement. Cover: Why pods, what changes, what doesn't, what stays the same.",
      "1-on-1 comp alignments: HR + direct manager meet individually with every AE, CSM, and Marketer to walk through their Core + Kicker structure. Zero confusion about how they get paid before Day 1 of pod operation.",
      "CRM routing rules updated: inbound lead assignment paths configured to auto-route to correct regional pod (Atlanta, New Orleans, Boston, LA) — replace any generic round-robin assignment.",
      "ERP cost centers created: distinct expense codes created per pod in NetSuite so localized travel, tools, and contractor spend are tracked accurately from Day 1.",
      "Pod Leader assigned; first team roster finalized",
      "30-day dry run begins: run the month under new pod structure, but track payouts in parallel under the old system. No comp changes during dry run.",
      "Friction audit: use the 30-day window to surface edge cases (e.g., enterprise customer HQ in Boston but implementation in Atlanta — define revenue credit owner before it hits commissions).",
      "Individual comp targets translated to pod comp model — shadow calculations reviewed by HR + Finance before going live.",
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
      "BDR 30-min speed-to-lead SLA tracked; violations flagged",
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
    sla: "30 minutes — business hours only",
    color: C.accent,
    steps: [
      { step: "Marketing scores lead at MQL threshold", owner: "Marketer", time: "T=0" },
      { step: "HubSpot routing assigns to pod BDR/AE by region", owner: "System", time: "T=auto" },
      { step: "BDR receives Slack notification + CRM task", owner: "BDR", time: "T=0" },
      { step: "BDR makes first outreach attempt", owner: "BDR", time: "T≤30 min" },
      { step: "BDR logs outcome in CRM — if no answer, auto-sequence activates", owner: "BDR", time: "T=30 min" },
      { step: "Pod Leader reviews stale MQLs (>24 hrs uncontacted) weekly", owner: "Pod Leader", time: "Weekly" },
    ],
    failureMode: "No outreach within 30 min = Pod Leader notified; repeat violations escalated to Exec GTM",
  },
  {
    title: "Handoff 2: AE → CSM (At Close)",
    trigger: "Contract executed — deal marked Closed Won in CRM",
    sla: "24-hour CRM brief + 48-hour warm intro call",
    color: C.teal,
    steps: [
      { step: "AE marks deal Closed Won; triggers CSM assignment task", owner: "AE", time: "T=0" },
      { step: "AE completes 24-hr CRM handoff brief (context, stakeholders, risks, expansion signals)", owner: "AE", time: "T≤24 hr" },
      { step: "CSM reviews brief; reaches out to client to schedule onboarding kickoff meeting", owner: "CSM", time: "T≤48 hr" },
      { step: "AE sends warm email introduction; CSM takes ownership — kickoff must be scheduled within 48 hrs of this email", owner: "AE + CSM", time: "T≤48 hr" },
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

const SHARED_KPIS = [
  {
    category: "Pipeline Health",
    metric: "Net New Pipeline Created",
    measures: "Total dollar value of qualified opportunities generated this period",
    whyItMatters: "Keeps demand gen and BDRs focused on high-value, realistic deals — not raw lead volume.",
    color: C.accent,
    owner: "Demand Gen + BDR",
  },
  {
    category: "Velocity",
    metric: "Win Rate & Sales Velocity",
    measures: "Percentage of deals won and average days to close",
    whyItMatters: "Encourages AEs and Marketers to refine targeting and messaging together to shorten cycles.",
    color: C.teal,
    owner: "AE + Demand Gen",
  },
  {
    category: "Growth & Scale",
    metric: "Net New ARR / Revenue",
    measures: "Total closed-won ARR or booked revenue inside the pod's segment",
    whyItMatters: "The North Star. The entire pod wins or loses together based on this number.",
    color: C.green,
    owner: "Full Pod",
  },
  {
    category: "LTV / Retention",
    metric: "Net Revenue Retention (NRR)",
    measures: "Revenue retained from existing customers including upgrades, minus churn",
    whyItMatters: "Forces AEs and Marketers to bring in the right customers — and ensures CSMs are set up for expansion success.",
    color: C.amber,
    owner: "CSM + AE",
  },
];

const ASYNC_SYNC = [
  { type: "Daily Async", cadence: "Every business day", format: "Slack pod channel — 3-question standup bot", content: "Yesterday, today, blockers", highlight: false },
  { type: "Monday Sync", cadence: "Every Monday", format: "30-min live call — Pipeline & Forecast Check", content: "Review active deals closing this week, pipeline health, and immediate blockers. Every pod member attends.", highlight: true },
  { type: "Wednesday Standup", cadence: "Every Wednesday", format: "15-min live call — Tactical Alignment", content: "Demand Gen + BDRs/AEs only. Campaign ground-truth check: what feedback are we getting from the market? Does outbound copy need adjustment based on what AEs are hearing in discovery?", highlight: true },
  { type: "Bi-Weekly Exec Review", cadence: "Every other Thursday", format: "60-min Pod Leader → Exec GTM", content: "Dashboard quadrants, kicker status, escalations", highlight: false },
  { type: "Monthly Retrospective", cadence: "Last week of month", format: "1-hour — Strategy Pivot", content: "Pod Leader runs: analyze NRR, churn reasons, and win/loss data. Adjust positioning, reallocate budget, or update GTM playbook based on real-world feedback. Output: one documented change to strategy or messaging.", highlight: true },
  { type: "Quarterly Calibration", cadence: "First week of new quarter", format: "Half-day working session", content: "Kicker pool distribution, target setting, pod adjustments", highlight: false },
];

const TABS = [
  { id: "composition", label: "Pod Composition", icon: Users },
  { id: "kpis", label: "Shared KPIs", icon: BarChart2 },
  { id: "comp", label: "Comp Model", icon: Zap },
  { id: "roadmap", label: "90-Day Roadmap", icon: Clock },
  { id: "handoffs", label: "3-Handoff Playbook", icon: ArrowRight },
  { id: "comms", label: "Operating Rhythm", icon: MessageSquare },
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
            {/* Architecture visual */}
            <ForgeCard>
              <ForgeCardBody style={{ padding: "20px 24px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Pod Architecture</div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 0 }}>
                  <div style={{ background: C.accent + "20", border: `1px solid ${C.accent}50`, borderRadius: 10, padding: "10px 28px", textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>Pod Leader</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Product Marketer / Growth Director</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}><div style={{ width: 2, height: 20, background: C.border }} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 0 }}>
                  {[
                    { label: "Demand Gen / Growth Specialist", color: C.teal },
                    { label: "Account Execs & BDRs", color: C.green },
                    { label: "Customer Success / Account Mgr", color: C.amber },
                  ].map((col, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "center" }}><div style={{ width: 2, height: 20, background: C.border }} /></div>
                      <div style={{ background: col.color + "18", border: `1px solid ${col.color}40`, borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: col.color }}>{col.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}><div style={{ width: 2, height: 20, background: C.border }} /></div>
                <div style={{ background: "#64748b18", border: "1px solid #33415520", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Shared Operational Runway</div>
                  <div style={{ fontSize: 10, color: "#475569" }}>RevOps / Data Support — cross-pod CRM hygiene, routing, dashboards, attribution</div>
                </div>
              </ForgeCardBody>
            </ForgeCard>

            {/* Role detail cards */}
            {POD_COMPOSITION.roles.map((r, i) => (
              <ForgeCard key={i} accent={r.color}>
                <ForgeCardBody>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: r.color }}>{r.title}</span>
                        <ForgeBadge variant="neutral">×{r.count}</ForgeBadge>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{r.subtitle}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 12px" }}>{r.responsibility}</p>
                  {r.keyTasks && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {r.keyTasks.map((t, j) => (
                        <div key={j} style={{ display: "flex", gap: 7, fontSize: 11, color: "#94a3b8" }}>
                          <div style={{ width: 4, height: 4, borderRadius: "50%", background: r.color, flexShrink: 0, marginTop: 4 }} />{t}
                        </div>
                      ))}
                    </div>
                  )}
                </ForgeCardBody>
              </ForgeCard>
            ))}

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

        {tab === "kpis" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <ForgeAlert level="info">
              The secret to making pods work is shared accountability. If marketing is only judged on leads and sales is only judged on revenue, the model breaks. Every pod member is measured on all four categories below.
            </ForgeAlert>
            {SHARED_KPIS.map((kpi, i) => (
              <ForgeCard key={i} accent={kpi.color}>
                <ForgeCardBody>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ width: 44, flexShrink: 0, textAlign: "center" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: kpi.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{kpi.category}</div>
                      <div style={{ width: "100%", height: 3, background: kpi.color, borderRadius: 2 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{kpi.metric}</span>
                        <ForgeBadge variant="neutral">{kpi.owner}</ForgeBadge>
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}><span style={{ color: "#64748b" }}>Measures: </span>{kpi.measures}</div>
                      <div style={{ fontSize: 12, color: kpi.color, fontStyle: "italic" }}>{kpi.whyItMatters}</div>
                    </div>
                  </div>
                </ForgeCardBody>
              </ForgeCard>
            ))}
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

            <ForgeCard accent={C.purple}>
              <ForgeCardHeader><ForgeLabel color={C.purple}>Comp Transition Protocol — Rollout Best Practices</ForgeLabel></ForgeCardHeader>
              <ForgeCardBody style={{ padding: 0 }}>
                <div style={{ padding: "12px 18px", background: C.purple + "08", borderBottom: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                    Changing comp plans creates anxiety and attrition when rolled out poorly. Follow these three principles to protect team trust during the pod transition.
                  </p>
                </div>
                {[
                  {
                    number: "1",
                    title: "Change Management & Staff Rollout",
                    body: "Run a town hall framing the shift as autonomy and eliminating bottlenecks — not micromanagement. Then HR + leadership meet 1-on-1 with every AE, CSM, and Marketer to walk through their exact Core + Kicker structure. No one should leave that meeting uncertain about how they get paid. Shadow period runs 90 days: track pod metrics but pay out on the old model so no one is penalized while pods stabilize.",
                    color: C.accent,
                  },
                  {
                    number: "2",
                    title: "Technical Cut-Over — Systems Audit",
                    body: "CRM routing rules must be updated before Day 1: inbound leads auto-route to the correct regional pod (Atlanta, Boston, New Orleans, LA) — no generic round-robin. ERP cost centers must be created per pod in NetSuite so localized travel, tools, and contractor spend are tracked accurately. Dashboard metrics are meaningless without clean cost-center attribution.",
                    color: C.teal,
                  },
                  {
                    number: "3",
                    title: "30-Day Dry Run — Shadow + Friction Audit",
                    body: "Before the new model is binding, run a full month in parallel: operate under pod structure but calculate payouts under the old system. Use this window to surface friction edge cases — e.g., enterprise customer HQ in Boston but implementation in Atlanta. Define who gets revenue credit for cross-city accounts before it impacts commissions. Document every edge case and resolve it in writing before cutover.",
                    color: C.green,
                  },
                  {
                    number: "4",
                    title: "Napkin Math Test — Simplicity Gate",
                    body: "Before finalizing any comp structure, have a BDR and an AE each calculate their own payout from a sample deal on paper. If either one struggles, the model is too complex and will lose motivational power. Simplify until any team member can self-calculate their commission without a spreadsheet.",
                    color: C.purple,
                  },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, padding: "16px 20px", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: item.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: item.color, flexShrink: 0 }}>
                      {item.number}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 5 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{item.body}</div>
                    </div>
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

            {/* 3 Pod Commitments */}
            <ForgeCard accent={C.accent}>
              <ForgeCardHeader><ForgeLabel color={C.accent}>The 3 Pod Accountability Numbers</ForgeLabel></ForgeCardHeader>
              <ForgeCardBody style={{ padding: 0 }}>
                {[
                  {
                    number: "1",
                    owner: "BDR",
                    metric: "Inbound Lead Speed-to-Lead",
                    sla: "30 minutes",
                    detail: "BDRs must follow up with high-intent inbound leads within 30 minutes during business hours. First outreach attempt logged in CRM. After-hours leads must be contacted by 9:30 AM next business day.",
                    color: C.accent,
                  },
                  {
                    number: "2",
                    owner: "AE",
                    metric: "Internal CRM Hygiene — Handover Brief",
                    sla: "24 hours",
                    detail: "AEs must complete the internal CRM handover brief within 24 hours of a deal closing. Brief covers: client context, key stakeholders, known risks, expansion signals, and open commitments. Incomplete briefs = comp risk flag.",
                    color: C.teal,
                  },
                  {
                    number: "3",
                    owner: "CSM",
                    metric: "Onboarding Kickoff Outreach",
                    sla: "48 hours",
                    detail: "CSMs must reach out to coordinate the onboarding kickoff meeting within 48 hours of the warm email introduction from the AE. The kickoff must be scheduled — not just contacted. Unscheduled accounts >48 hrs trigger Pod Leader review.",
                    color: C.green,
                  },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "16px 20px", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: item.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: item.color, flexShrink: 0 }}>
                      {item.number}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{item.metric}</span>
                        <ForgeBadge variant="neutral">{item.owner}</ForgeBadge>
                        <span style={{ fontSize: 13, fontWeight: 800, color: item.color }}>≤ {item.sla}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{item.detail}</div>
                    </div>
                  </div>
                ))}
              </ForgeCardBody>
            </ForgeCard>

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
              <ForgeCardHeader><ForgeLabel color={C.accent}>Weekly Operating Rhythm</ForgeLabel></ForgeCardHeader>
              <ForgeCardBody style={{ padding: 0 }}>
                {ASYNC_SYNC.map((row, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "160px 180px 1fr", gap: 14, alignItems: "start",
                    padding: "14px 20px",
                    borderBottom: i < ASYNC_SYNC.length - 1 ? `1px solid ${C.border}` : "none",
                    background: row.highlight ? C.accent + "08" : "transparent",
                    borderLeft: row.highlight ? `3px solid ${C.accent}` : "3px solid transparent",
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: row.highlight ? "#f1f5f9" : "#94a3b8" }}>{row.type}</div>
                      <div style={{ fontSize: 11, color: C.teal, marginTop: 2 }}>{row.cadence}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>{row.format}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{row.content}</div>
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
                    "SLA breach (30-min speed-to-lead, 24/48-hr handoff) → Pod Leader notified immediately",
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

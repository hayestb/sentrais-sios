// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody,
  ForgeLabel, ForgeBadge, ForgeGrid, ForgeAlert, C,
} from "../components/ui/forge";

// ─── Live date math ───────────────────────────────────────────────────────────
const TODAY = new Date(2026, 5, 13); // Jun 13, 2026
const diffDays = (d: Date) => Math.ceil((d.getTime() - TODAY.getTime()) / 86400000);

const DAYS_TO_GATE      = diffDays(new Date(2026, 11, 1));   // Dec 1 2026
const DAYS_TO_NFL       = diffDays(new Date(2026, 5, 30));   // Jun 30 2026
const DAYS_TO_83B       = diffDays(new Date(2026, 5, 28));   // Jun 28 2026
const DAYS_TO_LM_END    = diffDays(new Date(2026, 10, 30));  // Nov 30 2026
const DAYS_TO_M365      = diffDays(new Date(2026, 6, 7));    // Jul  7 2026

// ─── Data ─────────────────────────────────────────────────────────────────────
const CRITICAL_ITEMS = [
  { id: "B1", title: "83(b) Election — Certified Mail Filing", deadline: "Jun 28, 2026", daysLeft: DAYS_TO_83B, owner: "Tye + Counsel", urgency: "CRITICAL", area: "Governance", action: "File certified mail this week. No extensions exist. QSBS protection at risk.", resolved: false },
  { id: "B2", title: "SEG Subcontract Executed (Step-In Rights Active)", deadline: "Before Jun 30", daysLeft: DAYS_TO_NFL, owner: "Tye + Counsel", urgency: "CRITICAL", area: "Commercial", action: "Confirm execution status with counsel. Gates NFL GDA go-live.", resolved: false },
  { id: "B3", title: "NFL GDA Go-Live — EVERGAME Deployment", deadline: "Jun 30, 2026", daysLeft: DAYS_TO_NFL, owner: "Erin + Mikalina", urgency: "CRITICAL", area: "Delivery", action: "Pre-flight check T-7 days. $10K/day LD if missed.", resolved: false },
  { id: "B4", title: "BGI EIN Application Filed", deadline: "ASAP", daysLeft: 0, owner: "Counsel", urgency: "CRITICAL", area: "Nonprofit", action: "Blocks P3 (Workforce), P4 (Education), P5 (Economic Mobility) entirely.", resolved: false },
  { id: "B5", title: "M365 Tenant Isolation — Shared Accounts Eliminated", deadline: "Jul 7, 2026", daysLeft: DAYS_TO_M365, owner: "Erin + Zoie", urgency: "HIGH", area: "Infrastructure", action: "30-day deadline from Jun 7. All 8 test scenarios must pass.", resolved: false },
  { id: "B6", title: "NFL Q1 Invoice — $475K Submitted", deadline: "Jun 30, 2026", daysLeft: DAYS_TO_NFL, owner: "Tye + Finance", urgency: "HIGH", area: "Financial", action: "Prep invoice now so issues are resolved before go-live.", resolved: false },
];

const PROGRAM_SUMMARY = [
  { pillar: "P1", name: "Civic Resilience", status: "PARTIAL", programs: 10, active: 4, color: "#1B4F8A" },
  { pillar: "P2", name: "Innovation Equity", status: "PARTIAL", programs: 3, active: 2, color: "#6B21A8" },
  { pillar: "P3", name: "Future Workforce", status: "BLOCKED", programs: 5, active: 0, color: "#065F46" },
  { pillar: "P4", name: "Education", status: "BLOCKED", programs: 4, active: 0, color: "#92400E" },
  { pillar: "P5", name: "Economic Mobility", status: "BLOCKED", programs: 3, active: 1, color: "#B45309" },
  { pillar: "P6", name: "Sports / Culture", status: "AT-RISK", programs: 5, active: 3, color: "#0E7490" },
  { pillar: "P7", name: "Institutional Memory", status: "PARTIAL", programs: 5, active: 3, color: "#374151" },
];

const FINANCIAL_SNAPSHOT = [
  { label: "NFL Q1 AR", value: "$475K", note: "Due Jul 30 · Net 30 from Jun 30 invoice", color: C.teal },
  { label: "NFL Q2 AR", value: "$475K", note: "Sep 30 invoice · Oct 30 cash", color: "#64748b" },
  { label: "Q1 Burn Rate", value: "Est.", note: "CFO seat required for actuals", color: C.amber },
  { label: "Quarterly Cadence", value: "$475K", note: "Active recurring contract", color: C.green },
];

const ENTITY_STATUS = [
  { entity: "Sentrais Corp", status: "ACTIVE", items: ["NFL MSA live", "SEG subcontract pending", "83(b) due Jun 28", "M365 Tenant A configured"] },
  { entity: "NOVATELabs Inc", status: "ACTIVE", items: ["Name change complete", "NetSuite/ADP config Jul 1", "IRS affirmation letter pending", "16 docs updated"] },
  { entity: "BGI", status: "FORMATION", items: ["DE COI pending", "EIN application queued", "Director Seat 1 outreach", "3 pillars blocked"] },
];

// ─── Vertical Health Cards ────────────────────────────────────────────────────
const VERTICALS = [
  {
    name: "EVERGAME",
    code: "ERP-VRT-01",
    status: "LIVE",
    accent: C.accent,
    items: [
      "NFL GDA deployment — go-live Jun 30",
      "SEG subcontract gates step-in rights",
      "$475K Q1 AR invoice due at go-live",
    ],
  },
  {
    name: "CiviGrid",
    code: "ERP-VRT-02",
    status: "ACTIVE",
    accent: C.teal,
    items: [
      "AUOP Atlanta 360 operations live",
      "Multi-city expansion pipeline: 4 cities",
      "P1 Civic Resilience partial activation",
    ],
  },
  {
    name: "EntertainmentOS",
    code: "ERP-VRT-03",
    status: "PRE-DEPLOY",
    accent: C.purple,
    items: [
      "Platform architecture finalized",
      "P6 Sports/Culture at-risk — dependency on BGI",
      "Target deploy: Q3 2026 post BGI EIN",
    ],
  },
  {
    name: "SEARGrid",
    code: "ERP-VRT-04",
    status: "FORMATION",
    accent: C.red,
    items: [
      "BGI EIN required before activation",
      "P3/P4/P5 pillars fully blocked",
      "Director Seat 1 outreach in progress",
    ],
  },
];

// ─── 90-Day Runway (Jun 13 – Sep 13, 2026) ───────────────────────────────────
const RUNWAY = [
  // Week 1
  { week: 1, dates: "Jun 13–19", title: "83(b) certified mail — file this week", urgency: "URGENT", track: "Governance", owner: "Tye + Counsel" },
  { week: 1, dates: "Jun 13–19", title: "NFL GDA pre-flight check T-7 days", urgency: "URGENT", track: "Delivery", owner: "Erin + Mikalina" },
  { week: 1, dates: "Jun 13–19", title: "BGI EIN application filed", urgency: "URGENT", track: "Nonprofit", owner: "Counsel" },
  { week: 1, dates: "Jun 13–19", title: "NFL Q1 invoice prep — SNT-NFL-2026-Q1", urgency: "HIGH", track: "Financial", owner: "Tye + Finance" },
  // Week 2
  { week: 2, dates: "Jun 20–26", title: "SEG subcontract execution confirmed", urgency: "URGENT", track: "Commercial", owner: "Tye + Counsel" },
  { week: 2, dates: "Jun 20–26", title: "M365 tenant isolation — Phase 1 complete", urgency: "HIGH", track: "Infrastructure", owner: "Erin + Zoie" },
  // Week 3
  { week: 3, dates: "Jun 27 – Jul 3", title: "NFL GDA go-live (Jun 30)", urgency: "URGENT", track: "Delivery", owner: "Erin + Mikalina" },
  { week: 3, dates: "Jun 27 – Jul 3", title: "NFL Q1 invoice submitted ($475K)", urgency: "HIGH", track: "Financial", owner: "Tye + Finance" },
  { week: 3, dates: "Jun 27 – Jul 3", title: "Fractional CFO SOW executed", urgency: "HIGH", track: "Financial", owner: "Tye" },
  // Week 4
  { week: 4, dates: "Jul 4–10", title: "M365 tenant isolation complete — all 8 test scenarios", urgency: "HIGH", track: "Infrastructure", owner: "Erin + Zoie" },
  { week: 4, dates: "Jul 4–10", title: "NetSuite/ADP entity setup — NOVATELabs Inc", urgency: "HIGH", track: "Operations", owner: "Finance + IT" },
  // Week 5–6
  { week: 5, dates: "Jul 11–24", title: "BGI DE COI received — formation complete", urgency: "HIGH", track: "Nonprofit", owner: "Counsel" },
  { week: 6, dates: "Jul 25 – Aug 7", title: "NFL Q1 cash receipt — $475K AR Jul 30", urgency: "HIGH", track: "Financial", owner: "Finance" },
  { week: 6, dates: "Jul 25 – Aug 7", title: "CiviGrid multi-city pipeline — city 1 scoping", urgency: "NORMAL", track: "CiviGrid", owner: "Tye + Ops" },
  // Week 7–9
  { week: 7, dates: "Aug 8–21", title: "EntertainmentOS platform deploy readiness review", urgency: "NORMAL", track: "EntertainmentOS", owner: "Erin" },
  { week: 8, dates: "Aug 22 – Sep 4", title: "P3/P4/P5 pillar activation — BGI EIN received", urgency: "HIGH", track: "Nonprofit", owner: "BGI Board" },
  { week: 9, dates: "Sep 5–13", title: "NFL Q2 invoice prep — SNT-NFL-2026-Q2 ($475K)", urgency: "HIGH", track: "Financial", owner: "Tye + Finance" },
  // Week 10–13
  { week: 10, dates: "Sep 13+", title: "90-day operational review — all verticals", urgency: "NORMAL", track: "Governance", owner: "Tye" },
  { week: 11, dates: "Sep 13+", title: "Learning Mode review checkpoint (Nov 30 end)", urgency: "NORMAL", track: "Program", owner: "Tye + Team" },
  { week: 13, dates: "Sep 13+", title: "Gate Date planning — Dec 1 2026 readiness", urgency: "NORMAL", track: "Governance", owner: "Tye + Counsel" },
];

const TRACK_COLORS = {
  Governance: C.accent,
  Delivery: C.teal,
  Nonprofit: C.purple,
  Financial: C.green,
  Commercial: C.amber,
  Infrastructure: "#64748b",
  Operations: "#0e7490",
  CiviGrid: C.teal,
  EntertainmentOS: C.purple,
  Program: "#94a3b8",
};

// ─── Tabs & helpers ───────────────────────────────────────────────────────────
const TABS = ["Overview", "90-Day Runway", "Critical Path", "Program Status", "Financial Snapshot"];
const STATUS_VARIANT = { PARTIAL: "warning", BLOCKED: "danger", "AT-RISK": "warning", ACTIVE: "success", FORMATION: "info", LIVE: "success", "PRE-DEPLOY": "warning" };

const statColor = (v: number) => v <= 0 ? C.red : v <= 7 ? C.red : v <= 14 ? C.amber : C.green;

// ─── Component ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const [tab, setTab] = useState(0);
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const resolvedCount = Object.values(resolved).filter(Boolean).length;
  const criticalCount = CRITICAL_ITEMS.filter(i => i.urgency === "CRITICAL").length;

  // Group runway by week
  const runwayByWeek = RUNWAY.reduce((acc, item) => {
    const key = `W${item.week}`;
    if (!acc[key]) acc[key] = { label: `Week ${item.week} · ${item.dates}`, items: [] };
    acc[key].items.push(item);
    return acc;
  }, {} as Record<string, { label: string; items: typeof RUNWAY }>);

  return (
    <ForgePage>
      <ForgeHeader
        icon="⚡"
        title="FORGE Command Center"
        subtitle="Sentrais Operational Intelligence — 90-Day Forward View · Jun–Sep 2026"
        stats={[
          { label: "Days to Gate Date (Dec 1)", value: String(DAYS_TO_GATE) },
          { label: "Days to NFL Go-Live", value: DAYS_TO_NFL <= 0 ? `+${Math.abs(DAYS_TO_NFL)}d past` : String(DAYS_TO_NFL) },
          { label: "Verticals Active", value: "4" },
          { label: "Learning Mode Ends (Nov 30)", value: `${DAYS_TO_LM_END}d` },
        ]}
      />
      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />
      <ForgeContent>

        {/* ── Overview ── */}
        {tab === 0 && (
          <div>
            <ForgeAlert level="critical" title="Active Critical Deadlines">
              83(b) election certified mail must be filed by Jun 28 ({DAYS_TO_83B} days). NFL GDA go-live Jun 30 ({DAYS_TO_NFL} days) — SEG subcontract must be executed before go-live. BGI EIN blocks 3 pillars.
            </ForgeAlert>

            {/* Stats row — live date math */}
            <ForgeGrid cols={4} style={{ marginTop: 20, marginBottom: 24 }}>
              {[
                { label: "Days to Gate Date (Dec 1 2026)", value: String(DAYS_TO_GATE), color: statColor(DAYS_TO_GATE) },
                { label: "Days to NFL Go-Live (Jun 30)", value: DAYS_TO_NFL <= 0 ? `${Math.abs(DAYS_TO_NFL)}d past` : String(DAYS_TO_NFL), color: statColor(DAYS_TO_NFL) },
                { label: "Verticals Active", value: "4", color: C.green },
                { label: "Learning Mode Ends (Nov 30 2026)", value: `${DAYS_TO_LM_END}d`, color: statColor(DAYS_TO_LM_END) },
              ].map(s => (
                <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </ForgeGrid>

            {/* Vertical Health Cards */}
            <ForgeLabel style={{ marginBottom: 12 }}>Vertical Health</ForgeLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {VERTICALS.map(v => (
                <div key={v.code} style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderLeft: `4px solid ${v.accent}`,
                  borderRadius: 10,
                  padding: "16px 18px",
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                }}>
                  <div style={{ minWidth: 160 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: v.accent, marginBottom: 2 }}>{v.name}</div>
                    <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", marginBottom: 8 }}>{v.code}</div>
                    <ForgeBadge variant={STATUS_VARIANT[v.status] || "neutral"}>{v.status}</ForgeBadge>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                    {v.items.map(item => (
                      <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: v.accent, flexShrink: 0, marginTop: 1, fontSize: 11 }}>▸</span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Entity Status */}
            <ForgeLabel style={{ marginBottom: 12 }}>Entity Status</ForgeLabel>
            <ForgeGrid cols={3}>
              {ENTITY_STATUS.map(ent => (
                <ForgeCard key={ent.entity}>
                  <ForgeCardHeader
                    title={ent.entity}
                    badge={<ForgeBadge variant={STATUS_VARIANT[ent.status] || "neutral"}>{ent.status}</ForgeBadge>}
                  />
                  <ForgeCardBody>
                    {ent.items.map(item => (
                      <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                        <span style={{ color: C.accent, flexShrink: 0, marginTop: 1 }}>▸</span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{item}</span>
                      </div>
                    ))}
                  </ForgeCardBody>
                </ForgeCard>
              ))}
            </ForgeGrid>
          </div>
        )}

        {/* ── 90-Day Runway ── */}
        {tab === 1 && (
          <div>
            <ForgeAlert level="info" title="90-Day Forward View — Jun 13 to Sep 13, 2026">
              {RUNWAY.filter(r => r.urgency === "URGENT").length} urgent items · {RUNWAY.filter(r => r.urgency === "HIGH").length} high priority · {RUNWAY.length} total tracked items across 13 weeks.
            </ForgeAlert>

            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 20 }}>
              {Object.entries(runwayByWeek).map(([wk, group]) => (
                <div key={wk}>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase",
                    letterSpacing: "0.08em", marginBottom: 8, paddingBottom: 6,
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    {group.label}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {group.items.map((item, idx) => {
                      const isUrgent = item.urgency === "URGENT";
                      const isHigh   = item.urgency === "HIGH";
                      const leftColor = isUrgent ? C.red : isHigh ? C.amber : C.border;
                      const trackColor = TRACK_COLORS[item.track] || "#64748b";
                      return (
                        <div key={idx} style={{
                          background: C.surface,
                          border: `1px solid ${isUrgent ? "rgba(239,68,68,0.3)" : C.border}`,
                          borderLeft: `3px solid ${leftColor}`,
                          borderRadius: 8,
                          padding: "10px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}>
                          {/* Urgency pip */}
                          <div style={{
                            flexShrink: 0, width: 8, height: 8, borderRadius: "50%",
                            background: leftColor,
                          }} />
                          {/* Title */}
                          <div style={{ flex: 1, fontSize: 13, color: isUrgent ? "#e2e8f0" : "#94a3b8", fontWeight: isUrgent ? 600 : 400 }}>
                            {item.title}
                          </div>
                          {/* Track pill */}
                          <div style={{
                            flexShrink: 0,
                            fontSize: 10, fontWeight: 600, textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: trackColor,
                            background: `${trackColor}18`,
                            border: `1px solid ${trackColor}40`,
                            borderRadius: 4,
                            padding: "2px 7px",
                          }}>
                            {item.track}
                          </div>
                          {/* Owner */}
                          <div style={{ flexShrink: 0, fontSize: 11, color: "#475569", minWidth: 100, textAlign: "right" }}>
                            {item.owner}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Critical Path ── */}
        {tab === 2 && (
          <div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>Blocker Resolution Progress</span>
              <span style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>{resolvedCount} / {CRITICAL_ITEMS.length} resolved</span>
            </div>
            <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.accent}, ${C.teal})`, width: `${(resolvedCount / CRITICAL_ITEMS.length) * 100}%`, transition: "width 0.3s", borderRadius: 3 }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CRITICAL_ITEMS.map(item => {
                const isResolved = resolved[item.id];
                return (
                  <div key={item.id} style={{
                    background: isResolved ? "rgba(16,185,129,0.05)" : C.surface,
                    border: `1px solid ${isResolved ? C.green : item.urgency === "CRITICAL" ? "rgba(239,68,68,0.4)" : C.border}`,
                    borderLeft: `3px solid ${isResolved ? C.green : item.urgency === "CRITICAL" ? C.red : C.amber}`,
                    borderRadius: 10, padding: "14px 16px", opacity: isResolved ? 0.75 : 1,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                      <div onClick={() => setResolved(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                        style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0, cursor: "pointer", background: isResolved ? C.green : C.bg, border: `1px solid ${isResolved ? C.green : "#374151"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", marginTop: 2 }}>
                        {isResolved ? "✓" : ""}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: isResolved ? "#64748b" : "#e2e8f0", textDecoration: isResolved ? "line-through" : "none" }}>{item.title}</span>
                          <ForgeBadge variant={item.urgency === "CRITICAL" ? "danger" : "warning"}>{item.urgency}</ForgeBadge>
                          <ForgeBadge variant="neutral">{item.area}</ForgeBadge>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                          Deadline: {item.deadline}
                          {item.daysLeft > 0 && <span style={{ marginLeft: 8, color: statColor(item.daysLeft), fontWeight: 600 }}>{item.daysLeft}d remaining</span>}
                          {item.daysLeft <= 0 && item.daysLeft !== 0 && <span style={{ marginLeft: 8, color: C.red, fontWeight: 600 }}>OVERDUE</span>}
                          <span style={{ marginLeft: 12 }}>· Owner: {item.owner}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{item.action}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Program Status ── */}
        {tab === 3 && (
          <div>
            <ForgeGrid cols={2}>
              {PROGRAM_SUMMARY.map(p => {
                const pct = p.programs > 0 ? Math.round((p.active / p.programs) * 100) : 0;
                return (
                  <ForgeCard key={p.pillar} accent={p.color}>
                    <ForgeCardHeader
                      title={`${p.pillar} — ${p.name}`}
                      badge={<ForgeBadge variant={STATUS_VARIANT[p.status] || "neutral"}>{p.status}</ForgeBadge>}
                    />
                    <ForgeCardBody>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>
                        <span>{p.active} / {p.programs} programs active</span>
                        <span style={{ color: p.color }}>{pct}%</span>
                      </div>
                      <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: p.color, width: `${pct}%`, borderRadius: 2 }} />
                      </div>
                    </ForgeCardBody>
                  </ForgeCard>
                );
              })}
            </ForgeGrid>
          </div>
        )}

        {/* ── Financial Snapshot ── */}
        {tab === 4 && (
          <div>
            <ForgeAlert level="warning" title="Fractional CFO Required">
              All financial actuals require CFO SOW execution. P&L by entity, AR aging, and burn rate will be live in NetSuite/ADP after Week 1 CFO onboarding.
            </ForgeAlert>
            <ForgeGrid cols={2} style={{ marginTop: 20 }}>
              {FINANCIAL_SNAPSHOT.map(f => (
                <div key={f.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>{f.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: f.color, marginBottom: 6 }}>{f.value}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{f.note}</div>
                </div>
              ))}
            </ForgeGrid>

            <ForgeLabel style={{ marginTop: 24, marginBottom: 12 }}>Key Financial Actions This Week</ForgeLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { item: "Execute Fractional CFO SOW — W-9 on file before first payment", urgency: "CRITICAL" },
                { item: "NFL Q1 Invoice prep — SNT-NFL-2026-Q1 ($475K + infra passthrough)", urgency: "HIGH" },
                { item: "NetSuite/ADP entity setup — NOVATELabs Inc (new name)", urgency: "HIGH" },
                { item: "W-9 sweep — all active vendors before next payment cycle", urgency: "HIGH" },
                { item: "July 1 accounting cutover prep — entity split routing confirmation", urgency: "HIGH" },
              ].map(a => (
                <div key={a.item} style={{ background: C.surface, border: `1px solid ${a.urgency === "CRITICAL" ? "rgba(239,68,68,0.3)" : C.border}`, borderLeft: `3px solid ${a.urgency === "CRITICAL" ? C.red : C.amber}`, borderRadius: 8, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <ForgeBadge variant={a.urgency === "CRITICAL" ? "danger" : "warning"}>{a.urgency}</ForgeBadge>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>{a.item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </ForgeContent>
    </ForgePage>
  );
}

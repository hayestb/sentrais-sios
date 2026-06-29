// @ts-nocheck
// Executive summary view — same data as MasterCalendar, simplified for readability
import { useState } from "react";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody,
  ForgeLabel, ForgeBadge, ForgeGrid, ForgeAlert, C,
} from "../components/ui/forge";

// Same core data from MasterCalendar — abridged to critical/high items only
const WEEKS_SUMMARY = [
  { wk: 1, phase: 1, dates: "Jun 8–14", events: [
    { title: "83(b) election certified mail — HARD DEADLINE Jun 28", urgency: "CRITICAL", track: "GOVERNANCE", roles: ["TYE","COUNSEL"], sla: "File by Jun 28 — no extensions. QSBS protection at risk." },
    { title: "BGI independent counsel retainer — signed", urgency: "CRITICAL", track: "GOVERNANCE", roles: ["TYE","COUNSEL"], sla: "Gates all BGI formation steps." },
    { title: "NFL GDA Go-Live warranty — Jun 30 deadline", urgency: "CRITICAL", track: "COMMERCIAL", roles: ["ERIN","MIKALINA"], sla: "$10K/day LD above $150K cap if missed." },
    { title: "M365 tenant audit — all shared accounts", urgency: "HIGH", track: "INFRA", roles: ["ZOIE","ERIN"], sla: "30-day isolation deadline from Jun 7." },
    { title: "NFL Q1 invoice prep — $475K", urgency: "HIGH", track: "FINANCIAL", roles: ["TYE","FINANCE"], sla: "Invoice due Jun 30; Net 30 = cash Jul 30." },
  ]},
  { wk: 2, phase: 1, dates: "Jun 15–21", events: [
    { title: "BGI Delaware COI filed", urgency: "CRITICAL", track: "GOVERNANCE", roles: ["COUNSEL"], sla: "EIN application blocked until filed." },
    { title: "NetSuite/ADP entity setup — NOVATELabs Inc", urgency: "HIGH", track: "FINANCIAL", roles: ["FINANCE","ZOIE"], sla: "Jul 1 accounting cutover — 14 days." },
    { title: "BGI Director Seat 1 (Chair) — outreach", urgency: "HIGH", track: "PEOPLE", roles: ["TYE","COUNSEL"], sla: "Independence screen takes 5–10 days." },
  ]},
  { wk: 3, phase: 1, dates: "Jun 22–28", events: [
    { title: "83(b) HARD DEADLINE — certified mail Jun 28", urgency: "CRITICAL", track: "GOVERNANCE", roles: ["TYE","COUNSEL"], sla: "IRREVOCABLE — permanent loss of QSBS if missed." },
    { title: "Founders' stock split — 200K Series A + 600K Series B", urgency: "CRITICAL", track: "GOVERNANCE", roles: ["TYE","COUNSEL"], sla: "Coordinate with 83(b) this week." },
    { title: "NFL GDA pre-flight check — T-7 days", urgency: "CRITICAL", track: "COMMERCIAL", roles: ["ERIN","MIKALINA"], sla: "Go-live Jun 30 — all blockers resolved today." },
    { title: "July 1 accounting switch — final config check", urgency: "HIGH", track: "FINANCIAL", roles: ["FINANCE","ZOIE"], sla: "Hard cutover — no soft launch option." },
  ]},
  { wk: 4, phase: 1, dates: "Jun 29–Jul 5", events: [
    { title: "NFL GDA GO-LIVE — EVERGAME deployment live", urgency: "CRITICAL", track: "COMMERCIAL", roles: ["ERIN","MIKALINA","TYE"], sla: "$380K payment triggers on completion." },
    { title: "NFL Q1 invoice submitted — $475K", urgency: "CRITICAL", track: "FINANCIAL", roles: ["TYE","FINANCE"], sla: "Net 30 = cash Jul 30." },
    { title: "July 1 accounting cutover — NetSuite + ADP live", urgency: "HIGH", track: "FINANCIAL", roles: ["FINANCE"], sla: "Hard date — no delay." },
    { title: "BGI Director Seat 1 seated", urgency: "HIGH", track: "PEOPLE", roles: ["BGI_DIRS","COUNSEL"], sla: "Seats 2+3 recruitment accelerates." },
  ]},
  { wk: 5, phase: 2, dates: "Jul 7–13", events: [
    { title: "BGI EIN application filed (SS-4)", urgency: "CRITICAL", track: "NONPROFIT", roles: ["COUNSEL","BGI_DIRS"], sla: "Blocks P3/P4/P5 entirely. IRS processing 4–6 weeks." },
    { title: "NFL post-go-live SLA monitoring begins", urgency: "HIGH", track: "COMMERCIAL", roles: ["ERIN"], sla: "99.5% uptime / 4hr response / 24hr resolve." },
    { title: "FIFA 2026 Legacy Program — Host Committee outreach", urgency: "HIGH", track: "GTM", roles: ["MIKALINA","TYE"], sla: "9 months lead time for Q2 2027 activation." },
  ]},
  { wk: 6, phase: 2, dates: "Jul 14–20", events: [
    { title: "NFL Q1 payment receipt confirmed — $475K cash", urgency: "HIGH", track: "COMMERCIAL", roles: ["FINANCE","TYE"], sla: "Net 30 from Jun 30 = Jul 30. Escalate if not received." },
    { title: "BGI Seats 2+3 — candidate briefs sent", urgency: "HIGH", track: "NONPROFIT", roles: ["TYE","COUNSEL"], sla: "5–10 day review period before screen." },
    { title: "EVERGAME 30-day QBR prep", urgency: "HIGH", track: "COMMERCIAL", roles: ["ERIN","MIKALINA","TYE"], sla: "QBR output drives Year 2 scope." },
  ]},
  { wk: 7, phase: 2, dates: "Jul 21–27", events: [
    { title: "NFL 30-day post-go-live QBR", urgency: "HIGH", track: "COMMERCIAL", roles: ["ERIN","MIKALINA","TYE"], sla: "Client success review — drives Year 2." },
    { title: "IRC §482 transfer pricing Q1 true-up", urgency: "HIGH", track: "FINANCIAL", roles: ["FINANCE","COUNSEL"], sla: "Contemporaneous documentation before year-end." },
    { title: "BGI Director Seat 2 independence screen", urgency: "HIGH", track: "NONPROFIT", roles: ["COUNSEL"], sla: "Written opinion required before offer." },
  ]},
  { wk: 8, phase: 2, dates: "Jul 28–Aug 3", events: [
    { title: "BGI Seats 2+3 seated — full board governance signed", urgency: "CRITICAL", track: "NONPROFIT", roles: ["BGI_DIRS","COUNSEL"], sla: "Gates: Bylaws, COI Policy, Advisory Charter, Handbook drafting." },
    { title: "NFL Q1 payment booked — $475K", urgency: "HIGH", track: "FINANCIAL", roles: ["FINANCE"], sla: "Escalate if not received by Jul 30." },
    { title: "BGI Fellowship Handbook — drafting begins", urgency: "HIGH", track: "NONPROFIT", roles: ["BGI_DIRS"], sla: "60-day drafting cycle from Seat 3 seating." },
  ]},
  { wk: 9, phase: 3, dates: "Aug 4–10", events: [
    { title: "BGI EIN received (est.) — banking authorized", urgency: "HIGH", track: "NONPROFIT", roles: ["BGI_DIRS","FINANCE"], sla: "5-account segregated structure opens." },
    { title: "Atlanta Readiness Roundtable — Q3 launch", urgency: "HIGH", track: "GTM", roles: ["TYE","MIKALINA","DARRYL"], sla: "P1 Civic Resilience pilot activation." },
    { title: "NFL Q2 invoice prep — $475K", urgency: "HIGH", track: "COMMERCIAL", roles: ["FINANCE","TYE"], sla: "Q2 invoice due Sep 30; Net 30 = Oct 30 cash." },
  ]},
  { wk: 10, phase: 3, dates: "Aug 11–17", events: [
    { title: "BGI banking — 5-account segregated structure live", urgency: "HIGH", track: "NONPROFIT", roles: ["BGI_DIRS","FINANCE"], sla: "Treasurer only signatory; dual-sig above $5K." },
    { title: "MetaData 90-day delivery milestone review", urgency: "HIGH", track: "COMMERCIAL", roles: ["ERIN"], sla: "Guest access re-cert every 90 days." },
  ]},
  { wk: 11, phase: 3, dates: "Aug 18–24", events: [
    { title: "BGI Fellowship Handbook — board approval", urgency: "CRITICAL", track: "NONPROFIT", roles: ["BGI_DIRS"], sla: "Full board vote required before cohort announcement." },
    { title: "IRS Form 1023 filed — BGI", urgency: "CRITICAL", track: "NONPROFIT", roles: ["COUNSEL","BGI_DIRS"], sla: "IRS review 3–6 months. No BRIC references in narrative." },
    { title: "NFL Year 2 recertification scoping", urgency: "HIGH", track: "COMMERCIAL", roles: ["ERIN","MIKALINA"], sla: "Jan 2027 Year 2 renewal; 4-month lead." },
  ]},
  { wk: 12, phase: 3, dates: "Aug 25–31", events: [
    { title: "NFL Q2 invoice submitted — $475K", urgency: "CRITICAL", track: "COMMERCIAL", roles: ["TYE","FINANCE"], sla: "Net 30 = Oct 30 cash." },
    { title: "Barbara Geter Fellowship — Q4 cohort announced", urgency: "HIGH", track: "NONPROFIT", roles: ["BGI_DIRS","TYE"], sla: "After: EIN received, Handbook approved, 1023 filed." },
    { title: "Year-end tax planning — QSBS, §482, §4958 true-up", urgency: "HIGH", track: "FINANCIAL", roles: ["FINANCE","COUNSEL"], sla: "Dec 31 deadline; 4-month lead time." },
    { title: "Converge Atlanta — anchor sponsor commitment", urgency: "HIGH", track: "GTM", roles: ["MIKALINA","TYE"], sla: "FIFA Q2 2027; sponsor needed 6 months prior." },
  ]},
];

const TRACK_COLORS = {
  COMMERCIAL: "#2563EB", NONPROFIT: "#059669", GTM: "#D97706",
  FINANCIAL: "#7C3AED", GOVERNANCE: "#DC2626", INFRA: "#0891B2", PEOPLE: "#BE185D",
};

const URGENCY_VARIANT = { CRITICAL: "danger", HIGH: "warning", MEDIUM: "neutral" };
const PHASE_COLORS = { 1: C.accent, 2: C.teal, 3: C.purple };

const KEY_DATES = [
  { date: "Jun 28", label: "83(b) Election Deadline", urgency: "CRITICAL", note: "Certified mail — no extensions" },
  { date: "Jun 30", label: "NFL GDA Go-Live", urgency: "CRITICAL", note: "SEG subcontract must be executed first" },
  { date: "Jul 1", label: "Accounting Cutover", urgency: "HIGH", note: "NetSuite + ADP entity split live" },
  { date: "Jul 30", label: "NFL Q1 Cash Receipt Target", urgency: "HIGH", note: "$475K Net 30 from Jun 30 invoice" },
  { date: "Aug (est.)", label: "BGI EIN Received", urgency: "HIGH", note: "4–6 weeks after SS-4 filing" },
  { date: "Aug 18–24", label: "BGI Fellowship Handbook Board Approval", urgency: "CRITICAL", note: "Gates Q4 cohort announcement" },
  { date: "Aug 18–24", label: "IRS Form 1023 Filed", urgency: "CRITICAL", note: "§501(c)(3) determination — 3–6 month IRS review" },
  { date: "Sep 30", label: "NFL Q2 Invoice Due", urgency: "HIGH", note: "$475K recurring quarterly license" },
];

const TABS = ["Key Dates", "Phase Summary", "Month Overview", "Role Assignments"];

export default function MasterCalendarLight() {
  const [tab, setTab] = useState(0);
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

  const totalCritical = WEEKS_SUMMARY.flatMap(w => w.events).filter(e => e.urgency === "CRITICAL").length;

  return (
    <ForgePage>
      <ForgeHeader
        icon="📆"
        title="Master Calendar — Executive View"
        subtitle="Simplified 12-week summary · Critical dates · Phase milestones · Jun–Aug 2026"
        stats={[
          { label: "Critical Items", value: String(totalCritical) },
          { label: "Weeks", value: "12" },
          { label: "Key Dates", value: String(KEY_DATES.length) },
          { label: "Phases", value: "3" },
        ]}
      />
      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />
      <ForgeContent>

        {tab === 0 && (
          <div>
            <ForgeAlert level="critical" title="Time-Sensitive Actions">
              Two irrevocable deadlines in the next 21 days: 83(b) election (Jun 28) and NFL GDA go-live (Jun 30). Both require immediate action.
            </ForgeAlert>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
              {KEY_DATES.map((kd, i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${kd.urgency === "CRITICAL" ? "rgba(239,68,68,0.3)" : C.border}`, borderLeft: `4px solid ${kd.urgency === "CRITICAL" ? C.red : C.amber}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 100, fontSize: 14, fontWeight: 700, color: kd.urgency === "CRITICAL" ? C.red : C.amber, flexShrink: 0 }}>{kd.date}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 3 }}>{kd.label}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{kd.note}</div>
                  </div>
                  <ForgeBadge variant={URGENCY_VARIANT[kd.urgency] || "neutral"}>{kd.urgency}</ForgeBadge>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 1 && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {[1, 2, 3].map(p => (
                <button key={p} onClick={() => setSelectedPhase(selectedPhase === p ? null : p)} style={{ padding: "6px 16px", borderRadius: 6, fontSize: 13, cursor: "pointer", background: selectedPhase === p ? PHASE_COLORS[p] : C.surface, border: `1px solid ${selectedPhase === p ? PHASE_COLORS[p] : C.border}`, color: selectedPhase === p ? "#fff" : "#94a3b8" }}>
                  Phase {p}: {["Foundation", "Acceleration", "Momentum"][p-1]}
                </button>
              ))}
            </div>

            {WEEKS_SUMMARY.filter(w => !selectedPhase || w.phase === selectedPhase).map(wk => (
              <div key={wk.wk} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ background: PHASE_COLORS[wk.phase], color: "#fff", fontSize: 10, padding: "2px 10px", borderRadius: 3 }}>WK{wk.wk}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{wk.dates}</span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>· {wk.events.filter(e => e.urgency === "CRITICAL").length} critical · {wk.events.filter(e => e.urgency === "HIGH").length} high</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, paddingLeft: 12, borderLeft: `2px solid ${PHASE_COLORS[wk.phase]}44` }}>
                  {wk.events.filter(e => e.urgency === "CRITICAL" || e.urgency === "HIGH").map((ev, i) => (
                    <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${ev.urgency === "CRITICAL" ? C.red : C.amber}`, borderRadius: 8, padding: "8px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <ForgeBadge variant={URGENCY_VARIANT[ev.urgency] || "neutral"}>{ev.urgency}</ForgeBadge>
                        <span style={{ flex: 1, fontSize: 13, color: "#e2e8f0" }}>{ev.title}</span>
                        <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: `${TRACK_COLORS[ev.track] || "#64748b"}22`, color: TRACK_COLORS[ev.track] || "#64748b", flexShrink: 0 }}>{ev.track}</span>
                      </div>
                      {ev.sla && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{ev.sla}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 2 && (
          <div>
            <ForgeGrid cols={3}>
              {[
                { month: "June 2026", phase: "Foundation", weeks: "1–4", color: C.accent, critical: WEEKS_SUMMARY.filter(w => w.wk <= 4).flatMap(w => w.events).filter(e => e.urgency === "CRITICAL").length, highlights: ["83(b) election — Jun 28", "NFL GDA go-live — Jun 30", "BGI counsel retainer", "Accounting cutover Jul 1"] },
                { month: "July 2026", phase: "Acceleration", weeks: "5–8", color: C.teal, critical: WEEKS_SUMMARY.filter(w => w.wk >= 5 && w.wk <= 8).flatMap(w => w.events).filter(e => e.urgency === "CRITICAL").length, highlights: ["BGI EIN filed", "NFL Q1 cash receipt ($475K)", "Seats 2+3 seated", "NFL QBR + Year 2 scope"] },
                { month: "August 2026", phase: "Momentum", weeks: "9–12", color: C.purple, critical: WEEKS_SUMMARY.filter(w => w.wk >= 9).flatMap(w => w.events).filter(e => e.urgency === "CRITICAL").length, highlights: ["BGI EIN received", "Fellowship Handbook approved", "IRS Form 1023 filed", "Q4 cohort announcement"] },
              ].map(mo => (
                <ForgeCard key={mo.month} accent={mo.color}>
                  <ForgeCardHeader title={mo.month} subtitle={`Phase: ${mo.phase} · Weeks ${mo.weeks}`} badge={<ForgeBadge variant="danger">{mo.critical} critical</ForgeBadge>} />
                  <ForgeCardBody>
                    {mo.highlights.map(h => (
                      <div key={h} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
                        <span style={{ color: mo.color, flexShrink: 0 }}>▸</span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{h}</span>
                      </div>
                    ))}
                  </ForgeCardBody>
                </ForgeCard>
              ))}
            </ForgeGrid>
          </div>
        )}

        {tab === 3 && (
          <div>
            <ForgeAlert level="info" title="Role Accountability">
              Each role's primary ownership for the 12-week period. All critical items require CEO (Tye) awareness even when delegated.
            </ForgeAlert>
            <ForgeGrid cols={2} style={{ marginTop: 20 }}>
              {[
                { role: "Tye — CEO", owns: ["83(b) filing authorization", "NFL relationship stewardship", "BGI governance oversight", "T2+ spend approvals", "Strategic decisions < 15 min"], urgents: ["83(b) Jun 28", "SEG subcontract before Jun 30"] },
                { role: "Erin — CTO", owns: ["All platform releases (gated)", "NFL SLA monitoring (99.5%)", "MetaData delivery oversight", "Tech anchor partner alignment"], urgents: ["NFL go-live Jun 30", "M365 tenant isolation Jul 7"] },
                { role: "Finance — CFO", owns: ["Monthly P&L by entity", "NFL $475K AR cycle", "NetSuite royalty routing", "IRC §482 documentation"], urgents: ["Jul 1 accounting cutover", "NFL cash receipt Jul 30"] },
                { role: "Counsel", owns: ["83(b) filing execution", "BGI entity formation", "Independence opinions", "IRS Form 1023"], urgents: ["83(b) Jun 28", "BGI DE COI ASAP"] },
                { role: "Mikalina — Atlanta POC", owns: ["NFL/FIFA delivery", "Converge Atlanta activation", "Sports vertical pipeline"], urgents: ["NFL go-live Jun 30", "Converge anchor sponsor Nov 2026"] },
                { role: "Zoie — Operations", owns: ["M365 tenant migration", "PM tools (Monday.com)", "Document reference updates", "Partner onboarding"], urgents: ["M365 isolation Jul 7", "HubSpot/Monday label updates"] },
              ].map(r => (
                <ForgeCard key={r.role}>
                  <ForgeCardHeader title={r.role} />
                  <ForgeCardBody>
                    <ForgeLabel style={{ marginBottom: 6 }}>Primary Ownership</ForgeLabel>
                    {r.owns.map(o => (
                      <div key={o} style={{ fontSize: 12, color: "#94a3b8", padding: "2px 0", borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ color: C.accent }}>→ </span>{o}
                      </div>
                    ))}
                    <ForgeLabel style={{ marginTop: 12, marginBottom: 6, color: C.red }}>Urgent Items</ForgeLabel>
                    {r.urgents.map(u => (
                      <div key={u} style={{ fontSize: 12, color: "#fca5a5", padding: "2px 0" }}>⚠ {u}</div>
                    ))}
                  </ForgeCardBody>
                </ForgeCard>
              ))}
            </ForgeGrid>
          </div>
        )}

      </ForgeContent>
    </ForgePage>
  );
}

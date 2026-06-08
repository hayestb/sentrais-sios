// @ts-nocheck
import { useState } from "react";

const PILLARS = [
  {
    num: 1, code: "P1", name: "Civic Resilience",
    color: "#1B4F8A", light: "#EBF2FF",
    readiness: "PARTIAL",
    blocker: "Cascade360 structural split; BRIC submission not executed",
    programs: [
      { name: "Atlanta360 (CiviGrid + City of Atlanta)", entity: "Sentrais Corp", status: "Pilot Active", funding: "Commercial — municipal contract", gap: "Community wrappers must move to NOVATELabs/BGI ledger" },
      { name: "Cascade360 (Cascade UMC Resilience Hub)", entity: "Split Required", status: "BLOCKED", funding: "Commercial arm: Sentrais | Charitable arm: NOVATELabs", gap: "Structural decision required — commercial vs charitable vs blend" },
      { name: "Atlanta Readiness Roundtable", entity: "NOVATELabs Inc", status: "Pilot Active", funding: "Program Capital — $25K", gap: "BGI EIN required before grant-funded expansion" },
      { name: "CivicSync", entity: "Sentrais Corp", status: "Platform Active", funding: "Commercial", gap: "BRIC eligible via City applicant — submission in progress" },
      { name: "Host City Readiness (NFL/FIFA)", entity: "Sentrais Corp", status: "Active", funding: "Commercial", gap: "SEG subcontract execution required before Jun 30" },
      { name: "BRIC Grant Submission", entity: "City of Atlanta / Sentrais delivery", status: "In Pursuit", funding: "Federal — FEMA BRIC", gap: "Grant Funding Lead SOW must execute now. NO BGI references in narrative." },
      { name: "AURI", entity: "NOVATELabs / BGI", status: "Needs Routing", funding: "Charitable — needs-based selection only", gap: "Cannot be funded because Atl360 is deployed here — independent needs basis required" },
      { name: "Community Sovereignty Framework", entity: "NOVATELabs / BGI", status: "Needs Routing", funding: "Charitable", gap: "Same separation rule as AURI — separate ledgers required" },
      { name: "Junior Sentinels", entity: "BGI", status: "Needs Routing", funding: "Mission Capital", gap: "Blocked on BGI EIN" },
      { name: "NCICC Knowledge Center", entity: "NOVATELabs Inc", status: "Active", funding: "Research Capital", gap: "Confirm separate from BGI ledger" },
    ]
  },
  {
    num: 2, code: "P2", name: "Innovation Equity",
    color: "#6B21A8", light: "#F5F3FF",
    readiness: "PARTIAL",
    blocker: "BGI EIN; NOVATELabs sponsorship revenue stream not configured in NetSuite",
    programs: [
      { name: "NOVATELabs Innovation Hub", entity: "NOVATELabs Inc", status: "Development", funding: "Sponsorship Revenue", gap: "Sponsorship revenue stream not classified or tracked in NetSuite" },
      { name: "MEIX High School Track", entity: "BGI", status: "BLOCKED", funding: "WIOA / Mission Capital", gap: "Blocked on BGI EIN + 1023" },
      { name: "CivicGrid Community Deployment", entity: "Sentrais Corp", status: "Active", funding: "Commercial + Grant", gap: "Coincident-site conflict screen required when overlapping with NOVATELabs programs" },
    ]
  },
  {
    num: 3, code: "P3", name: "Future Workforce",
    color: "#065F46", light: "#ECFDF5",
    readiness: "BLOCKED",
    blocker: "BGI EIN — single gate that unlocks all of P3",
    programs: [
      { name: "Barbara Geter Civic Technology Fellowship", entity: "BGI", status: "BLOCKED", funding: "DOL WIOA / NSF / Corporate sponsorships", gap: "EIN, 1023, Handbook board-approval, Treasurer, bank accounts all required first" },
      { name: "KSU / Georgia State / Georgia Tech Academic Spine", entity: "BGI (partner)", status: "In Design", funding: "University partnership", gap: "MOU with academic partners not confirmed" },
      { name: "Undergraduate Internship Track ($22/hr)", entity: "BGI", status: "BLOCKED", funding: "WIOA / Mission Capital", gap: "BGI payroll cannot run until EIN received" },
      { name: "Summer Internship Program", entity: "BGI or Sentrais Academy", status: "Pre-launch", funding: "Mission Capital or Commercial", gap: "Host entity determination required — nonprofit host preferred for FLSA protection" },
      { name: "Industry Mentor Network", entity: "BGI", status: "Design", funding: "In-kind", gap: "No funding gap — requires director board activation" },
    ]
  },
  {
    num: 4, code: "P4", name: "Education",
    color: "#92400E", light: "#FEF3C7",
    readiness: "BLOCKED",
    blocker: "BGI board formation — Handbook + Screening Matrix cannot be built without board",
    programs: [
      { name: "MEIX High School Track (academic credit)", entity: "BGI", status: "BLOCKED", funding: "Academic credit / grant stipend", gap: "Parental consent process and background check protocol not yet designed" },
      { name: "Research Fellows Program", entity: "NOVATELabs Inc", status: "Design", funding: "NSF Education grants", gap: "Grant Funding Lead SOW must include NSF education grant pursuit" },
      { name: "Fellowship Handbook", entity: "BGI", status: "BLOCKED", funding: "N/A — governance doc", gap: "Board must approve before any fellow onboarding — blocked on board formation" },
      { name: "School Screening Matrix (APS, Fulton, DeKalb, Gwinnett, Clayton)", entity: "BGI", status: "Not Built", funding: "N/A", gap: "Required before cohort announcement" },
    ]
  },
  {
    num: 5, code: "P5", name: "Economic Mobility",
    color: "#B45309", light: "#FFFBEB",
    readiness: "BLOCKED",
    blocker: "BGI Treasurer not appointed; BGI bank account cannot open until EIN received",
    programs: [
      { name: "BGI Fellowship Stipend ($7,500 / 6-month cohort)", entity: "BGI", status: "BLOCKED", funding: "Mission Capital — WIOA / corporate", gap: "Dual-sig above $5K; BGI Treasurer must be independent director — not yet appointed" },
      { name: "NOVATE Financial Operating Model", entity: "Sentrais / NOVATELabs", status: "Built (FORGE)", funding: "Operating Capital", gap: "Payroll allocation model (L5) not configured in ADP" },
      { name: "Tiered Workforce Model", entity: "Sentrais / BGI", status: "Designed", funding: "Commercial + Mission Capital", gap: "FLSA classification confirmation by Chanise required per role before offer letters" },
    ]
  },
  {
    num: 6, code: "P6", name: "Sports / Culture / Events",
    color: "#0E7490", light: "#ECFEFF",
    readiness: "AT-RISK",
    blocker: "SEG subcontract must be executed before NFL GDA go-live Jun 30",
    programs: [
      { name: "EVERGAME (NFL GDA)", entity: "Sentrais Corp", status: "GO-LIVE JUN 30", funding: "Commercial — $475K Q1", gap: "SEG subcontract + Step-In Rights MUST be confirmed this week" },
      { name: "EntertainmentOS / eVenu", entity: "Sentrais Corp", status: "Active", funding: "Platform Subscription", gap: "Revenue classification not tagged in NetSuite" },
      { name: "NFL Year 2 Scope", entity: "Sentrais Corp", status: "Pursuit", funding: "Commercial renewal", gap: "Founder must be present — Sales Lead prepares, does not negotiate independently" },
      { name: "Sports Vertical Prospect Pipeline", entity: "Sentrais Corp", status: "In Development", funding: "GTM cost center", gap: "Sales Lead SOW must be executed; 5–10 qualified prospects by Week 8" },
      { name: "Atlanta 2076 Programs (Preserve/Prepare/Prosper)", entity: "ARI / NOVATELabs", status: "Design", funding: "Program Capital / Sponsorship", gap: "ARI map built in FORGE — no funding instruments executed yet" },
    ]
  },
  {
    num: 7, code: "P7", name: "Institutional Memory / Civic Intelligence",
    color: "#374151", light: "#F9FAFB",
    readiness: "PARTIAL",
    blocker: "Evidence Ledger not wired to Firestore; IRC §482 docs pending",
    programs: [
      { name: "Atlanta Oral History Project", entity: "NOVATELabs / BGI", status: "Design", funding: "Mission Capital / Foundation grants", gap: "Field volunteer protocol not designed; BGI EIN required for volunteer engagement" },
      { name: "SHA-256 Evidence Ledger", entity: "Sentrais Corp", status: "Built (FORGE)", funding: "Commercial / Overhead", gap: "Not yet wired to live Firestore data" },
      { name: "Document Version Control", entity: "Sentrais / NOVATELabs", status: "Built (FORGE)", funding: "Internal ops", gap: "11 system updates pending (HubSpot, Monday, NetSuite, Bank)" },
      { name: "SentraisOS / CivicGrid Data Layer", entity: "Sentrais Corp", status: "Active", funding: "Platform Subscription", gap: "IRC §482 transfer pricing documentation (RRH → Sentrais royalty) not completed" },
      { name: "NCICC Knowledge Center", entity: "NOVATELabs Inc", status: "Active", funding: "Research Capital", gap: "Funding stream not classified in NetSuite" },
    ]
  },
];

const BLOCKERS = [
  {
    rank: 1, id: "B1", level: "CRITICAL",
    title: "Fractional CFO Seated",
    deadline: "This week",
    owner: "Tye",
    action: "Execute CFO SOW — W-9 on file before first payment. 10 hrs/wk, Net-30.",
    unlocks: [
      "Revenue waterfall configuration (NetSuite L4)",
      "Cost center structure (NetSuite L3)",
      "Payroll allocation model (ADP L5)",
      "Vendor payment governance (L6)",
      "AR aging tracking — $475K NFL receipt Jul 30",
      "IRC §482 transfer pricing docs",
      "Monthly P&L by entity (first report end of Month 1)",
      "Tax reserve setup",
      "T2+ approval load removed from Founder",
    ],
    pillars: ["ALL"],
    color: "#DC2626",
  },
  {
    rank: 2, id: "B2", level: "CRITICAL",
    title: "SEG Subcontract Executed (Step-In Rights Active)",
    deadline: "Before Jun 30",
    owner: "Tye + Counsel",
    action: "Confirm execution status with counsel today. If not executed, execute before Jun 28.",
    unlocks: [
      "NFL GDA go-live (Jun 30)",
      "$475K Q1 invoice cycle",
      "EVERGAME commercial expansion",
      "NFL Year 2 conversation",
      "$10K/day LD enforcement mechanism active",
    ],
    pillars: ["P6"],
    color: "#DC2626",
  },
  {
    rank: 3, id: "B3", level: "CRITICAL",
    title: "83(b) Election Filed — Certified Mail",
    deadline: "Jun 28 — IRREVOCABLE",
    owner: "Tye + Counsel",
    action: "File certified mail this week. Confirm tracking number in hand. No extensions exist.",
    unlocks: [
      "Equity grant tax treatment locked in",
      "No downstream impact — but missing it is permanent",
    ],
    pillars: [],
    color: "#DC2626",
  },
  {
    rank: 4, id: "B4", level: "CRITICAL",
    title: "BGI EIN Received",
    deadline: "ASAP — blocks 3 pillars",
    owner: "Counsel",
    action: "Confirm filing status with counsel. If not filed, this is the next item after 83(b).",
    unlocks: [
      "P3 Future Workforce — unlocks entirely",
      "P4 Education — unlocks entirely",
      "P5 Economic Mobility — partially unlocks",
      "BGI bank accounts can open",
      "BGI Treasurer can be appointed",
      "DOL WIOA application (Week 8 target)",
      "NSF education grants",
      "BGI Fellowship cohort announcement",
      "Volunteer engagement compliance",
    ],
    pillars: ["P3", "P4", "P5"],
    color: "#DC2626",
  },
  {
    rank: 5, id: "B5", level: "HIGH",
    title: "Grant Funding Lead SOW Executed",
    deadline: "This week",
    owner: "Tye / Zoie",
    action: "Execute SOW — 20 hrs/wk, Net-30, W-9 first. BRIC submission is the critical first deliverable.",
    unlocks: [
      "BRIC submission (P1 lead program — Atlanta360)",
      "WIOA application post-EIN (P3/P5)",
      "NSF education grants (P4)",
      "2 CFR Part 200 federal compliance infrastructure",
      "Grant tracking system live in Monday.com",
    ],
    pillars: ["P1", "P3", "P4", "P5"],
    color: "#D97706",
  },
  {
    rank: 6, id: "B6", level: "HIGH",
    title: "Cascade360 Structural Decision",
    deadline: "This week",
    owner: "Tye + Counsel",
    action: "One decision: commercial CiviGrid deployment, Institute program, or blend? Tell counsel — they map the split.",
    unlocks: [
      "P1 completeness",
      "Operational Levee validation",
      "Demonstration firewall is real for funders/regulators",
      "Cascade360 as proof point for §501(c)(3) compliance",
    ],
    pillars: ["P1"],
    color: "#D97706",
  },
  {
    rank: 7, id: "B7", level: "HIGH",
    title: "W-9 Sweep + Vendor Master Build",
    deadline: "This week",
    owner: "Zoie",
    action: "Collect W-9 from all active vendors before next payment cycle. Build vendor master in NetSuite (entity / cost center / program / approval level).",
    unlocks: [
      "Comms Lead payments (15 hrs/wk)",
      "Sales Lead payments (15 hrs/wk)",
      "CFO payments (10 hrs/wk)",
      "Grant Lead payments (20 hrs/wk)",
      "MetaData milestone payments",
      "Qubika pass-through billing",
    ],
    pillars: ["ALL"],
    color: "#D97706",
  },
  {
    rank: 8, id: "B8", level: "MEDIUM",
    title: "NetSuite / ADP Configuration",
    deadline: "CFO Week 1–2 deliverable",
    owner: "Fractional CFO",
    action: "CFO must be seated first (B1). Deliverables: royalty split routing live, cost centers built, payroll allocation configured.",
    unlocks: [
      "Finance Blueprint L3–L8 fully operational",
      "Revenue tagging by type (Advisory/Platform/Grant/Licensing)",
      "Labor attribution by cost center",
      "True project profitability visible",
      "Federal indirect rates groundwork",
      "Investor reporting capability",
    ],
    pillars: ["ALL"],
    color: "#059669",
  },
];

const EXECUTION_SEQUENCE = [
  { week: "Jun 8–14", items: ["83(b) certified mail filed — tracking number confirmed", "SEG subcontract — counsel confirms execution + Step-In Rights active", "CFO SOW executed — W-9 in hand", "Grant Funding Lead SOW executed — W-9 in hand", "W-9 sweep — all active vendors (Comms, Sales, MetaData, Qubika)"] },
  { week: "Jun 14–28", items: ["BGI EIN filing confirmed in motion", "Cascade360 structural decision — Tye + Counsel one conversation", "CFO begins NetSuite configuration (royalty routing + cost centers)", "BRIC submission draft in progress (Grant Lead Week 1 deliverable)"] },
  { week: "Jun 30", items: ["NFL GDA go-live", "Accounting cutover live", "NetSuite royalty split routing active (10% → Sentrais IP)"] },
  { week: "Jul 1–30", items: ["First monthly P&L by entity (CFO deliverable)", "NFL Q1 invoice AR aging — $475K watch (due Jul 30)", "BGI independent director independence screens begin (pending EIN)", "DOL WIOA application package development begins (pending EIN)"] },
];

const READINESS_STYLE = {
  "BLOCKED": { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
  "AT-RISK": { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  "PARTIAL": { bg: "#FFF7ED", text: "#9A3412", border: "#FDBA74" },
  "ACTIVE": { bg: "#DCFCE7", text: "#166534", border: "#86EFAC" },
};

const LEVEL_STYLE = {
  CRITICAL: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
  HIGH: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  MEDIUM: { bg: "#DCFCE7", text: "#166534", border: "#86EFAC" },
};

const STATUS_COLOR = {
  "BLOCKED": "#DC2626",
  "GO-LIVE JUN 30": "#7C3AED",
  "AT-RISK": "#D97706",
  "Pilot Active": "#059669",
  "Active": "#059669",
  "Platform Active": "#059669",
  "Built (FORGE)": "#2563EB",
  "In Pursuit": "#D97706",
  "Needs Routing": "#D97706",
  "In Design": "#6B7280",
  "Design": "#6B7280",
  "Pre-launch": "#6B7280",
  "Development": "#6B7280",
  "Not Built": "#DC2626",
  "Split Required": "#DC2626",
};

export default function ProgramConverge() {
  const [view, setView] = useState("pillars");
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [expandedBlocker, setExpandedBlocker] = useState(null);
  const [resolved, setResolved] = useState({});
  const [pillarFilter, setPillarFilter] = useState("ALL");

  const toggleResolved = (id) => setResolved(prev => ({ ...prev, [id]: !prev[id] }));
  const resolvedCount = Object.values(resolved).filter(Boolean).length;

  const filteredBlockers = pillarFilter === "ALL"
    ? BLOCKERS
    : BLOCKERS.filter(b => b.pillars.includes(pillarFilter) || b.pillars.includes("ALL"));

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace", background: "#0A0F1E", minHeight: "100vh", color: "#E2E8F0" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0F1629 0%, #1A2744 50%, #0F1629 100%)", borderBottom: "1px solid #1E3A5F", padding: "20px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "10px", color: "#4a6080", letterSpacing: "2px", marginBottom: "4px" }}>ARI · SENTRAIS · NOVATELABS</div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#F1F5F9" }}>Program Converge Map</h1>
            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "3px" }}>7-Pillar ARI Mapping · Blocker Priority Stack · Execution Sequence · Jun 8, 2026</div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              { label: "Pillars Active", value: "2/7", color: "#10B981" },
              { label: "Pillars Blocked", value: "3/7", color: "#EF4444" },
              { label: "Critical Blockers", value: BLOCKERS.filter(b => b.level === "CRITICAL").length, color: "#EF4444" },
              { label: "Resolved", value: `${resolvedCount}/${BLOCKERS.length}`, color: resolvedCount > 0 ? "#10B981" : "#64748B" },
            ].map(s => (
              <div key={s.label} style={{ background: "#0D1526", border: `1px solid ${s.color}33`, borderRadius: "8px", padding: "8px 14px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: "800", color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "9px", color: "#64748B", marginTop: "2px", letterSpacing: "0.5px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pillar readiness strip */}
        <div style={{ display: "flex", gap: "6px", marginTop: "16px", flexWrap: "wrap" }}>
          {PILLARS.map(p => {
            const rs = READINESS_STYLE[p.readiness] || READINESS_STYLE["PARTIAL"];
            return (
              <div key={p.code} onClick={() => { setSelectedPillar(selectedPillar === p.num ? null : p.num); setView("pillars"); }}
                style={{ background: "#0D1526", border: `1px solid ${p.color}44`, borderTop: `2px solid ${p.color}`, borderRadius: "6px", padding: "6px 12px", cursor: "pointer", minWidth: "80px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: p.color }}>{p.code}</div>
                <div style={{ fontSize: "9px", color: "#94A3B8", marginTop: "1px" }}>{p.name.split(" ")[0]}</div>
                <div style={{ marginTop: "4px", background: rs.bg, color: rs.text, fontSize: "8px", padding: "1px 5px", borderRadius: "3px", display: "inline-block", fontFamily: "inherit" }}>{p.readiness}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #1E3A5F", padding: "0 28px", display: "flex" }}>
        {[
          { id: "pillars", label: "ARI Pillar Map" },
          { id: "blockers", label: "Blocker Priority Stack" },
          { id: "sequence", label: "Execution Sequence" },
        ].map(t => (
          <button key={t.id} onClick={() => setView(t.id)} style={{
            background: "none", border: "none", cursor: "pointer", padding: "12px 18px",
            fontSize: "12px", fontFamily: "inherit", letterSpacing: "0.5px",
            color: view === t.id ? "#60A5FA" : "#64748B",
            borderBottom: view === t.id ? "2px solid #3B82F6" : "2px solid transparent",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "20px 28px" }}>

        {/* ── PILLAR MAP ── */}
        {view === "pillars" && (
          <div>
            {selectedPillar === null ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "12px" }}>
                {PILLARS.map(p => {
                  const rs = READINESS_STYLE[p.readiness] || READINESS_STYLE["PARTIAL"];
                  const active = p.programs.filter(pr => !["BLOCKED", "Not Built", "Split Required"].includes(pr.status)).length;
                  return (
                    <div key={p.code} onClick={() => setSelectedPillar(p.num)}
                      style={{ background: "#0D1526", border: `1px solid ${p.color}44`, borderTop: `3px solid ${p.color}`, borderRadius: "8px", padding: "14px 16px", cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div>
                          <span style={{ fontSize: "10px", color: p.color, letterSpacing: "1px" }}>{p.code}</span>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: "#F1F5F9", marginTop: "2px" }}>{p.name}</div>
                        </div>
                        <span style={{ background: rs.bg, color: rs.text, fontSize: "9px", padding: "2px 7px", borderRadius: "4px", fontFamily: "inherit", flexShrink: 0 }}>{p.readiness}</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "8px" }}>{active}/{p.programs.length} programs active</div>
                      <div style={{ fontSize: "10px", color: "#EF4444", background: "#1C0A0A", border: "1px solid #7F1D1D", borderRadius: "4px", padding: "5px 8px" }}>
                        ⚠ {p.blocker}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (() => {
              const p = PILLARS.find(x => x.num === selectedPillar);
              if (!p) return null;
              return (
                <div>
                  <button onClick={() => setSelectedPillar(null)} style={{ background: "none", border: "1px solid #1E3A5F", borderRadius: "4px", padding: "5px 12px", color: "#64748B", cursor: "pointer", fontSize: "11px", fontFamily: "inherit", marginBottom: "16px" }}>← Back to all pillars</button>
                  <div style={{ background: "#0D1526", border: `1px solid ${p.color}44`, borderTop: `3px solid ${p.color}`, borderRadius: "10px", padding: "18px 20px", marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                      <div>
                        <span style={{ fontSize: "10px", color: p.color, letterSpacing: "2px" }}>{p.code} · ARI PILLAR</span>
                        <div style={{ fontSize: "20px", fontWeight: "700", color: "#F1F5F9", marginTop: "4px" }}>{p.name}</div>
                      </div>
                      <span style={{ background: READINESS_STYLE[p.readiness]?.bg, color: READINESS_STYLE[p.readiness]?.text, fontSize: "11px", padding: "3px 10px", borderRadius: "4px", fontFamily: "inherit" }}>{p.readiness}</span>
                    </div>
                    <div style={{ background: "#1C0A0A", border: "1px solid #7F1D1D", borderRadius: "5px", padding: "8px 12px", fontSize: "11px", color: "#FCA5A5" }}>
                      PRIMARY BLOCKER: {p.blocker}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {p.programs.map((prog, i) => {
                      const sc = STATUS_COLOR[prog.status] || "#64748B";
                      const isBlocked = prog.status === "BLOCKED" || prog.status === "Not Built" || prog.status === "Split Required";
                      return (
                        <div key={i} style={{ background: isBlocked ? "#110808" : "#0D1526", border: `1px solid ${isBlocked ? "#7F1D1D" : "#1E3A5F"}`, borderLeft: `3px solid ${sc}`, borderRadius: "6px", padding: "12px 14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px", marginBottom: "6px" }}>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#E2E8F0", flex: 1 }}>{prog.name}</div>
                            <span style={{ background: sc + "22", color: sc, fontSize: "9px", padding: "2px 7px", borderRadius: "3px", fontFamily: "inherit", flexShrink: 0 }}>{prog.status}</span>
                          </div>
                          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "10px", color: "#64748B", marginBottom: prog.gap ? "6px" : 0 }}>
                            <span>Entity: <span style={{ color: "#94A3B8" }}>{prog.entity}</span></span>
                            <span>Funding: <span style={{ color: "#94A3B8" }}>{prog.funding}</span></span>
                          </div>
                          {prog.gap && (
                            <div style={{ fontSize: "10px", color: "#FCD34D", background: "#1C1106", border: "1px solid #78350F", borderRadius: "3px", padding: "4px 8px", marginTop: "4px" }}>
                              → {prog.gap}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── BLOCKER STACK ── */}
        {view === "blockers" && (
          <div>
            {/* Filter by pillar */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" }}>
              <span style={{ fontSize: "10px", color: "#64748B", letterSpacing: "1px" }}>FILTER:</span>
              {["ALL", "P1", "P2", "P3", "P4", "P5", "P6", "P7"].map(f => (
                <button key={f} onClick={() => setPillarFilter(f)} style={{
                  background: pillarFilter === f ? "#1D4ED8" : "#0D1526",
                  border: `1px solid ${pillarFilter === f ? "#3B82F6" : "#1E3A5F"}`,
                  color: pillarFilter === f ? "#DBEAFE" : "#64748B",
                  borderRadius: "5px", padding: "4px 10px", fontSize: "10px", cursor: "pointer", fontFamily: "inherit"
                }}>{f}</button>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ background: "#0D1526", border: "1px solid #1E3A5F", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "6px" }}>
                <span style={{ color: "#94A3B8" }}>Blocker Resolution Progress</span>
                <span style={{ color: "#60A5FA" }}>{resolvedCount} / {BLOCKERS.length} resolved</span>
              </div>
              <div style={{ height: "5px", background: "#1F2937", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg, #3B82F6, #10B981)", width: `${(resolvedCount / BLOCKERS.length) * 100}%`, transition: "width 0.3s", borderRadius: "3px" }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredBlockers.map(b => {
                const ls = LEVEL_STYLE[b.level];
                const isResolved = resolved[b.id];
                const isExpanded = expandedBlocker === b.id;
                return (
                  <div key={b.id} style={{ background: isResolved ? "#071811" : "#0D1526", border: `1px solid ${isResolved ? "#10B981" : "#1E3A5F"}`, borderLeft: `3px solid ${isResolved ? "#10B981" : b.color}`, borderRadius: "8px", opacity: isResolved ? 0.75 : 1, transition: "all 0.2s" }}>
                    <div style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}
                      onClick={() => setExpandedBlocker(isExpanded ? null : b.id)}>

                      {/* Checkbox */}
                      <div onClick={(e) => { e.stopPropagation(); toggleResolved(b.id); }}
                        style={{ width: "20px", height: "20px", borderRadius: "4px", flexShrink: 0, background: isResolved ? "#10B981" : "#111827", border: `1px solid ${isResolved ? "#10B981" : "#374151"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "white", cursor: "pointer" }}>
                        {isResolved ? "✓" : ""}
                      </div>

                      {/* Rank */}
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: b.color + "22", color: b.color, fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{b.rank}</div>

                      {/* Level badge */}
                      <span style={{ background: ls.bg, color: ls.text, fontSize: "9px", padding: "2px 7px", borderRadius: "3px", fontFamily: "inherit", flexShrink: 0, textDecoration: isResolved ? "line-through" : "none" }}>{b.level}</span>

                      {/* Title */}
                      <div style={{ flex: 1, fontSize: "13px", fontWeight: "600", color: isResolved ? "#6B7280" : "#E2E8F0", textDecoration: isResolved ? "line-through" : "none" }}>{b.title}</div>

                      {/* Deadline */}
                      <span style={{ fontSize: "10px", color: b.deadline.includes("Jun 28") || b.deadline.includes("Jun 30") ? "#EF4444" : "#94A3B8", flexShrink: 0 }}>{b.deadline}</span>

                      {/* Unlock count */}
                      <span style={{ background: "#1F2937", color: "#60A5FA", fontSize: "9px", padding: "2px 7px", borderRadius: "3px", flexShrink: 0 }}>{b.unlocks.length} unlocks</span>

                      <span style={{ color: "#374151", fontSize: "10px" }}>{isExpanded ? "▲" : "▼"}</span>
                    </div>

                    {isExpanded && (
                      <div style={{ borderTop: "1px solid #1E3A5F", padding: "14px 16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                          <div>
                            <div style={{ fontSize: "9px", color: "#64748B", letterSpacing: "1px", marginBottom: "6px" }}>ACTION REQUIRED</div>
                            <div style={{ fontSize: "12px", color: "#CBD5E1", background: "#111827", borderRadius: "5px", padding: "8px 10px", border: "1px solid #1E3A5F" }}>{b.action}</div>
                            <div style={{ marginTop: "8px", fontSize: "10px", color: "#64748B" }}>Owner: <span style={{ color: "#94A3B8" }}>{b.owner}</span></div>
                            {b.pillars.length > 0 && b.pillars[0] !== "ALL" && (
                              <div style={{ marginTop: "6px", display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                {b.pillars.map(p => {
                                  const pillar = PILLARS.find(x => x.code === p);
                                  return pillar ? <span key={p} style={{ background: pillar.color + "22", color: pillar.color, fontSize: "9px", padding: "1px 6px", borderRadius: "3px", fontFamily: "inherit" }}>{p}</span> : null;
                                })}
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: "9px", color: "#64748B", letterSpacing: "1px", marginBottom: "6px" }}>WHAT THIS UNLOCKS ({b.unlocks.length})</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                              {b.unlocks.map((u, i) => (
                                <div key={i} style={{ fontSize: "10px", color: "#94A3B8", display: "flex", gap: "6px", padding: "2px 0", borderBottom: "1px solid #111827" }}>
                                  <span style={{ color: "#10B981", flexShrink: 0 }}>→</span>{u}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── EXECUTION SEQUENCE ── */}
        {view === "sequence" && (
          <div style={{ maxWidth: "800px" }}>
            <div style={{ background: "#0D1526", border: "1px solid #1E3A5F", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", fontSize: "11px", color: "#60A5FA" }}>
              Items are ordered by deadline and dependency chain. Critical items in red must be resolved before go-live Jun 30.
            </div>
            {EXECUTION_SEQUENCE.map((week, wi) => (
              <div key={wi} style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                {/* Timeline connector */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: wi === 0 ? "#EF4444" : wi === 2 ? "#7C3AED" : "#3B82F6", marginTop: "2px" }} />
                  {wi < EXECUTION_SEQUENCE.length - 1 && <div style={{ width: "1px", flex: 1, background: "#1E3A5F", marginTop: "4px" }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: wi === 2 ? "#A78BFA" : "#60A5FA", letterSpacing: "1px", marginBottom: "10px" }}>{week.week}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {week.items.map((item, ii) => {
                      const isCritical = item.toLowerCase().includes("83(b)") || item.toLowerCase().includes("seg") || item.toLowerCase().includes("go-live") || item.toLowerCase().includes("cutover");
                      return (
                        <div key={ii} style={{ background: isCritical ? "#110808" : "#0D1526", border: `1px solid ${isCritical ? "#7F1D1D" : "#1E3A5F"}`, borderLeft: `2px solid ${isCritical ? "#EF4444" : "#374151"}`, borderRadius: "5px", padding: "7px 10px", fontSize: "11px", color: isCritical ? "#FCA5A5" : "#CBD5E1", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                          <span style={{ color: isCritical ? "#EF4444" : "#374151", flexShrink: 0, marginTop: "1px" }}>{isCritical ? "⚑" : "◦"}</span>
                          {item}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #1E3A5F", padding: "12px 28px", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#374151", flexWrap: "wrap", gap: "8px" }}>
        <span>ARI Program Converge · 7 pillars · {BLOCKERS.length} blockers · {PILLARS.reduce((s, p) => s + p.programs.length, 0)} programs mapped</span>
        <span style={{ color: "#EF4444" }}>⚠ 83(b) Jun 28 · SEG + NFL go-live Jun 30 · BGI EIN blocks P3/P4/P5</span>
      </div>
    </div>
  );
}

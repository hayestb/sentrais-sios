// @ts-nocheck
import { useState } from "react";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody,
  ForgeLabel, ForgeBadge, ForgeGrid, ForgeAlert, C,
} from "../components/ui/forge";

const PILLARS = [
  {
    num: 1, code: "P1", name: "Civic Resilience", color: "#1B4F8A",
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
    num: 2, code: "P2", name: "Innovation Equity", color: "#6B21A8",
    readiness: "PARTIAL",
    blocker: "BGI EIN; NOVATELabs sponsorship revenue stream not configured in NetSuite",
    programs: [
      { name: "NOVATELabs Innovation Hub", entity: "NOVATELabs Inc", status: "Development", funding: "Sponsorship Revenue", gap: "Sponsorship revenue stream not classified or tracked in NetSuite" },
      { name: "MEIX High School Track", entity: "BGI", status: "BLOCKED", funding: "WIOA / Mission Capital", gap: "Blocked on BGI EIN + 1023" },
      { name: "CivicGrid Community Deployment", entity: "Sentrais Corp", status: "Active", funding: "Commercial + Grant", gap: "Coincident-site conflict screen required when overlapping with NOVATELabs programs" },
    ]
  },
  {
    num: 3, code: "P3", name: "Future Workforce", color: "#065F46",
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
    num: 4, code: "P4", name: "Education", color: "#92400E",
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
    num: 5, code: "P5", name: "Economic Mobility", color: "#B45309",
    readiness: "BLOCKED",
    blocker: "BGI Treasurer not appointed; BGI bank account cannot open until EIN received",
    programs: [
      { name: "BGI Fellowship Stipend ($7,500 / 6-month cohort)", entity: "BGI", status: "BLOCKED", funding: "Mission Capital — WIOA / corporate", gap: "Dual-sig above $5K; BGI Treasurer must be independent director — not yet appointed" },
      { name: "NOVATE Financial Operating Model", entity: "Sentrais / NOVATELabs", status: "Built (FORGE)", funding: "Operating Capital", gap: "Payroll allocation model (L5) not configured in ADP" },
      { name: "Tiered Workforce Model", entity: "Sentrais / BGI", status: "Designed", funding: "Commercial + Mission Capital", gap: "FLSA classification confirmation by Chanise required per role before offer letters" },
    ]
  },
  {
    num: 6, code: "P6", name: "Sports / Culture / Events", color: "#0E7490",
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
    num: 7, code: "P7", name: "Institutional Memory / Civic Intelligence", color: "#374151",
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
  { rank: 1, id: "B1", level: "CRITICAL", title: "Fractional CFO Seated", deadline: "This week", owner: "Tye", action: "Execute CFO SOW — W-9 on file before first payment. 10 hrs/wk, Net-30.", unlocks: ["Revenue waterfall configuration (NetSuite L4)", "Cost center structure (NetSuite L3)", "Payroll allocation model (ADP L5)", "Vendor payment governance (L6)", "AR aging tracking — $475K NFL receipt Jul 30", "IRC §482 transfer pricing docs", "Monthly P&L by entity (first report end of Month 1)", "Tax reserve setup", "T2+ approval load removed from Founder"], pillars: ["ALL"], color: C.red },
  { rank: 2, id: "B2", level: "CRITICAL", title: "SEG Subcontract Executed (Step-In Rights Active)", deadline: "Before Jun 30", owner: "Tye + Counsel", action: "Confirm execution status with counsel today. If not executed, execute before Jun 28.", unlocks: ["NFL GDA go-live (Jun 30)", "$475K Q1 invoice cycle", "EVERGAME commercial expansion", "NFL Year 2 conversation", "$10K/day LD enforcement mechanism active"], pillars: ["P6"], color: C.red },
  { rank: 3, id: "B3", level: "CRITICAL", title: "83(b) Election Filed — Certified Mail", deadline: "Jun 28 — IRREVOCABLE", owner: "Tye + Counsel", action: "File certified mail this week. Confirm tracking number in hand. No extensions exist.", unlocks: ["Equity grant tax treatment locked in", "No downstream impact — but missing it is permanent"], pillars: [], color: C.red },
  { rank: 4, id: "B4", level: "CRITICAL", title: "BGI EIN Received", deadline: "ASAP — blocks 3 pillars", owner: "Counsel", action: "Confirm filing status with counsel. If not filed, this is the next item after 83(b).", unlocks: ["P3 Future Workforce — unlocks entirely", "P4 Education — unlocks entirely", "P5 Economic Mobility — partially unlocks", "BGI bank accounts can open", "BGI Treasurer can be appointed", "DOL WIOA application (Week 8 target)", "NSF education grants", "BGI Fellowship cohort announcement", "Volunteer engagement compliance"], pillars: ["P3", "P4", "P5"], color: C.red },
  { rank: 5, id: "B5", level: "HIGH", title: "Grant Funding Lead SOW Executed", deadline: "This week", owner: "Tye / Zoie", action: "Execute SOW — 20 hrs/wk, Net-30, W-9 first. BRIC submission is the critical first deliverable.", unlocks: ["BRIC submission (P1 lead program — Atlanta360)", "WIOA application post-EIN (P3/P5)", "NSF education grants (P4)", "2 CFR Part 200 federal compliance infrastructure", "Grant tracking system live in Monday.com"], pillars: ["P1", "P3", "P4", "P5"], color: C.amber },
  { rank: 6, id: "B6", level: "HIGH", title: "Cascade360 Structural Decision", deadline: "This week", owner: "Tye + Counsel", action: "One decision: commercial CiviGrid deployment, Institute program, or blend? Tell counsel — they map the split.", unlocks: ["P1 completeness", "Operational Levee validation", "Demonstration firewall is real for funders/regulators", "Cascade360 as proof point for §501(c)(3) compliance"], pillars: ["P1"], color: C.amber },
  { rank: 7, id: "B7", level: "HIGH", title: "W-9 Sweep + Vendor Master Build", deadline: "This week", owner: "Zoie", action: "Collect W-9 from all active vendors before next payment cycle. Build vendor master in NetSuite.", unlocks: ["Comms Lead payments (15 hrs/wk)", "Sales Lead payments (15 hrs/wk)", "CFO payments (10 hrs/wk)", "Grant Lead payments (20 hrs/wk)", "MetaData milestone payments", "Qubika pass-through billing"], pillars: ["ALL"], color: C.amber },
  { rank: 8, id: "B8", level: "MEDIUM", title: "NetSuite / ADP Configuration", deadline: "CFO Week 1–2 deliverable", owner: "Fractional CFO", action: "CFO must be seated first (B1). Deliverables: royalty split routing live, cost centers built, payroll allocation configured.", unlocks: ["Finance Blueprint L3–L8 fully operational", "Revenue tagging by type (Advisory/Platform/Grant/Licensing)", "Labor attribution by cost center", "True project profitability visible", "Federal indirect rates groundwork", "Investor reporting capability"], pillars: ["ALL"], color: C.green },
];

const EXECUTION_SEQUENCE = [
  { week: "Jun 8–14", items: ["83(b) certified mail filed — tracking number confirmed", "SEG subcontract — counsel confirms execution + Step-In Rights active", "CFO SOW executed — W-9 in hand", "Grant Funding Lead SOW executed — W-9 in hand", "W-9 sweep — all active vendors (Comms, Sales, MetaData, Qubika)"] },
  { week: "Jun 14–28", items: ["BGI EIN filing confirmed in motion", "Cascade360 structural decision — Tye + Counsel one conversation", "CFO begins NetSuite configuration (royalty routing + cost centers)", "BRIC submission draft in progress (Grant Lead Week 1 deliverable)"] },
  { week: "Jun 30", items: ["NFL GDA go-live", "Accounting cutover live", "NetSuite royalty split routing active (10% → Sentrais IP)"] },
  { week: "Jul 1–30", items: ["First monthly P&L by entity (CFO deliverable)", "NFL Q1 invoice AR aging — $475K watch (due Jul 30)", "BGI independent director independence screens begin (pending EIN)", "DOL WIOA application package development begins (pending EIN)"] },
];

const STATUS_COLORS = {
  "BLOCKED": C.red, "GO-LIVE JUN 30": C.purple, "AT-RISK": C.amber,
  "Pilot Active": C.green, "Active": C.green, "Platform Active": C.green,
  "Built (FORGE)": C.accent, "In Pursuit": C.amber, "Needs Routing": C.amber,
  "In Design": "#64748b", "Design": "#64748b", "Pre-launch": "#64748b",
  "Development": "#64748b", "Not Built": C.red, "Split Required": C.red,
  "Pursuit": C.amber, "Designed": "#64748b",
};

const READINESS_VARIANT = { PARTIAL: "warning", BLOCKED: "danger", "AT-RISK": "warning", ACTIVE: "success" };

const TABS = ["ARI Pillar Map", "Blocker Priority Stack", "Execution Sequence"];

export default function ProgramConverge() {
  const [tab, setTab] = useState(0);
  const [selectedPillar, setSelectedPillar] = useState<number | null>(null);
  const [expandedBlocker, setExpandedBlocker] = useState<string | null>(null);
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  const [pillarFilter, setPillarFilter] = useState("ALL");

  const resolvedCount = Object.values(resolved).filter(Boolean).length;
  const filteredBlockers = pillarFilter === "ALL" ? BLOCKERS : BLOCKERS.filter(b => b.pillars.includes(pillarFilter) || b.pillars.includes("ALL"));

  return (
    <ForgePage>
      <ForgeHeader
        icon="🎯"
        title="Program Converge Map"
        subtitle="7-Pillar ARI Mapping · Blocker Priority Stack · Execution Sequence · Jun 8, 2026"
        stats={[
          { label: "Pillars Active", value: "2/7" },
          { label: "Pillars Blocked", value: "3/7" },
          { label: "Critical Blockers", value: String(BLOCKERS.filter(b => b.level === "CRITICAL").length) },
          { label: "Resolved", value: `${resolvedCount}/${BLOCKERS.length}` },
        ]}
      />

      {/* Pillar readiness strip */}
      <div style={{ padding: "12px 24px", background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {PILLARS.map(p => (
          <div key={p.code} onClick={() => { setSelectedPillar(selectedPillar === p.num ? null : p.num); setTab(0); }}
            style={{ background: C.bg, border: `1px solid ${p.color}44`, borderTop: `2px solid ${p.color}`, borderRadius: 6, padding: "6px 10px", cursor: "pointer", minWidth: 72 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.code}</div>
            <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{p.name.split(" ")[0]}</div>
            <div style={{ marginTop: 4 }}>
              <ForgeBadge variant={READINESS_VARIANT[p.readiness] || "neutral"} style={{ fontSize: 8, padding: "1px 5px" }}>{p.readiness}</ForgeBadge>
            </div>
          </div>
        ))}
      </div>

      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />
      <ForgeContent>

        {tab === 0 && (
          <div>
            {selectedPillar === null ? (
              <ForgeGrid cols={2}>
                {PILLARS.map(p => {
                  const active = p.programs.filter(pr => !["BLOCKED", "Not Built", "Split Required"].includes(pr.status)).length;
                  return (
                    <ForgeCard key={p.code} accent={p.color} style={{ cursor: "pointer" }} onClick={() => setSelectedPillar(p.num)}>
                      <ForgeCardHeader
                        title={`${p.code} — ${p.name}`}
                        badge={<ForgeBadge variant={READINESS_VARIANT[p.readiness] || "neutral"}>{p.readiness}</ForgeBadge>}
                      />
                      <ForgeCardBody>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{active}/{p.programs.length} programs active</div>
                        <div style={{ fontSize: 11, color: C.red, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "6px 10px" }}>
                          ⚠ {p.blocker}
                        </div>
                      </ForgeCardBody>
                    </ForgeCard>
                  );
                })}
              </ForgeGrid>
            ) : (() => {
              const p = PILLARS.find(x => x.num === selectedPillar);
              if (!p) return null;
              return (
                <div>
                  <button onClick={() => setSelectedPillar(null)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 12px", color: C.accent, cursor: "pointer", fontSize: 11, marginBottom: 16 }}>← All Pillars</button>
                  <ForgeCard accent={p.color} style={{ marginBottom: 16 }}>
                    <ForgeCardHeader
                      title={`${p.code} — ${p.name}`}
                      badge={<ForgeBadge variant={READINESS_VARIANT[p.readiness] || "neutral"}>{p.readiness}</ForgeBadge>}
                    />
                    <ForgeCardBody>
                      <div style={{ fontSize: 11, color: C.red, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "8px 12px" }}>
                        PRIMARY BLOCKER: {p.blocker}
                      </div>
                    </ForgeCardBody>
                  </ForgeCard>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {p.programs.map((prog, i) => {
                      const sc = STATUS_COLORS[prog.status] || "#64748b";
                      const isBlocked = ["BLOCKED", "Not Built", "Split Required"].includes(prog.status);
                      return (
                        <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${sc}`, borderRadius: 8, padding: "12px 14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", flex: 1 }}>{prog.name}</div>
                            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 3, background: `${sc}22`, color: sc, flexShrink: 0 }}>{prog.status}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b", marginBottom: prog.gap ? 6 : 0 }}>
                            Entity: {prog.entity} · Funding: {prog.funding}
                          </div>
                          {prog.gap && (
                            <div style={{ fontSize: 11, color: "#fcd34d", background: "rgba(251,191,36,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 5, padding: "4px 8px", marginTop: 4 }}>
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

        {tab === 1 && (
          <div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
              <ForgeLabel>Filter:</ForgeLabel>
              {["ALL", "P1", "P2", "P3", "P4", "P5", "P6", "P7"].map(f => (
                <button key={f} onClick={() => setPillarFilter(f)} style={{
                  padding: "4px 10px", borderRadius: 5, fontSize: 11, cursor: "pointer",
                  background: pillarFilter === f ? C.accent : C.surface,
                  border: `1px solid ${pillarFilter === f ? C.accent : C.border}`,
                  color: pillarFilter === f ? "#fff" : "#94a3b8",
                }}>{f}</button>
              ))}
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>Blocker Resolution Progress</span>
              <span style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>{resolvedCount} / {BLOCKERS.length} resolved</span>
            </div>
            <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.accent}, ${C.teal})`, width: `${(resolvedCount / BLOCKERS.length) * 100}%`, transition: "width 0.3s", borderRadius: 3 }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredBlockers.map(b => {
                const isResolved = resolved[b.id];
                const isExpanded = expandedBlocker === b.id;
                return (
                  <div key={b.id} style={{ background: isResolved ? "rgba(16,185,129,0.05)" : C.surface, border: `1px solid ${isResolved ? C.green : C.border}`, borderLeft: `3px solid ${isResolved ? C.green : b.color}`, borderRadius: 10, opacity: isResolved ? 0.75 : 1 }}>
                    <div style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }} onClick={() => setExpandedBlocker(isExpanded ? null : b.id)}>
                      <div onClick={(e) => { e.stopPropagation(); setResolved(prev => ({ ...prev, [b.id]: !prev[b.id] })); }}
                        style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0, background: isResolved ? C.green : C.bg, border: `1px solid ${isResolved ? C.green : "#374151"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", cursor: "pointer" }}>
                        {isResolved ? "✓" : ""}
                      </div>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${b.color}22`, color: b.color, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{b.rank}</div>
                      <ForgeBadge variant={b.level === "CRITICAL" ? "danger" : b.level === "HIGH" ? "warning" : "success"}>{b.level}</ForgeBadge>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: isResolved ? "#64748b" : "#e2e8f0", textDecoration: isResolved ? "line-through" : "none" }}>{b.title}</div>
                      <span style={{ fontSize: 11, color: b.deadline.includes("Jun 28") || b.deadline.includes("Jun 30") ? C.red : "#94a3b8", flexShrink: 0 }}>{b.deadline}</span>
                      <span style={{ background: "rgba(14,165,233,0.1)", color: C.accent, fontSize: 10, padding: "2px 7px", borderRadius: 3, flexShrink: 0 }}>{b.unlocks.length} unlocks</span>
                      <span style={{ color: "#4a6080", fontSize: 11 }}>{isExpanded ? "▲" : "▼"}</span>
                    </div>
                    {isExpanded && (
                      <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 16px" }}>
                        <ForgeGrid cols={2}>
                          <div>
                            <ForgeLabel style={{ marginBottom: 6 }}>Action Required</ForgeLabel>
                            <div style={{ fontSize: 12, color: "#cbd5e1", background: C.bg, borderRadius: 6, padding: "8px 10px", border: `1px solid ${C.border}`, marginBottom: 8 }}>{b.action}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>Owner: <span style={{ color: "#94a3b8" }}>{b.owner}</span></div>
                          </div>
                          <div>
                            <ForgeLabel style={{ marginBottom: 6 }}>What This Unlocks ({b.unlocks.length})</ForgeLabel>
                            {b.unlocks.map((u, i) => (
                              <div key={i} style={{ fontSize: 11, color: "#94a3b8", display: "flex", gap: 6, padding: "3px 0", borderBottom: `1px solid ${C.bg}` }}>
                                <span style={{ color: C.green, flexShrink: 0 }}>→</span>{u}
                              </div>
                            ))}
                          </div>
                        </ForgeGrid>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 2 && (
          <div style={{ maxWidth: 800 }}>
            <ForgeAlert level="info" title="Execution Order">
              Items are ordered by deadline and dependency chain. Critical items must be resolved before go-live Jun 30.
            </ForgeAlert>
            <div style={{ marginTop: 20 }}>
              {EXECUTION_SEQUENCE.map((wk, wi) => (
                <div key={wi} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: wi === 0 ? C.red : wi === 2 ? C.purple : C.accent, marginTop: 2 }} />
                    {wi < EXECUTION_SEQUENCE.length - 1 && <div style={{ width: 1, flex: 1, background: C.border, marginTop: 4 }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 8 }}>
                    <ForgeLabel style={{ marginBottom: 10, color: wi === 2 ? C.purple : C.accent }}>{wk.week}</ForgeLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {wk.items.map((item, ii) => {
                        const isCritical = item.toLowerCase().includes("83(b)") || item.toLowerCase().includes("seg") || item.toLowerCase().includes("go-live") || item.toLowerCase().includes("cutover");
                        return (
                          <div key={ii} style={{ background: isCritical ? "rgba(239,68,68,0.05)" : C.surface, border: `1px solid ${isCritical ? "rgba(239,68,68,0.3)" : C.border}`, borderLeft: `2px solid ${isCritical ? C.red : "#374151"}`, borderRadius: 6, padding: "7px 10px", fontSize: 12, color: isCritical ? "#fca5a5" : "#cbd5e1", display: "flex", gap: 8 }}>
                            <span style={{ color: isCritical ? C.red : "#374151", flexShrink: 0 }}>{isCritical ? "⚑" : "◦"}</span>
                            {item}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </ForgeContent>
    </ForgePage>
  );
}

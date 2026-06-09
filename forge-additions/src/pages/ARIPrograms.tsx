// @ts-nocheck
import { useState } from "react";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody,
  ForgeLabel, ForgeBadge, ForgeGrid, ForgeAlert, C,
} from "../components/ui/forge";

const PILLARS = [
  {
    code: "P1", name: "Civic Resilience", color: "#1B4F8A",
    readiness: "PARTIAL", programCount: 10, activeCount: 4,
    anchor: "Sentrais Corp + NOVATELabs",
    lead: "Darryl (SEAR/FEMA)",
    blocker: "Cascade360 structural split decision pending; BRIC submission not executed",
    desc: "City resilience infrastructure, BRIC grant pursuit, CivicGrid deployment, host city readiness for NFL/FIFA.",
    programs: [
      { name: "Atlanta360 (CivicGrid + City of Atlanta)", entity: "Sentrais Corp", status: "Pilot Active", funding: "Commercial — municipal contract" },
      { name: "Cascade360 (Cascade UMC Resilience Hub)", entity: "Split Required", status: "BLOCKED", funding: "Commercial + Charitable — structural decision pending" },
      { name: "Atlanta Readiness Roundtable", entity: "NOVATELabs Inc", status: "Pilot Active", funding: "Program Capital $25K" },
      { name: "CivicSync Platform", entity: "Sentrais Corp", status: "Platform Active", funding: "Commercial + BRIC eligible" },
      { name: "Host City Readiness (NFL/FIFA)", entity: "Sentrais Corp", status: "Active", funding: "Commercial — SEG subcontract required" },
      { name: "BRIC Grant Submission", entity: "City of Atlanta / Sentrais delivery", status: "In Pursuit", funding: "Federal — FEMA BRIC" },
      { name: "AURI", entity: "NOVATELabs / BGI", status: "Needs Routing", funding: "Charitable — needs-based selection" },
      { name: "Community Sovereignty Framework", entity: "NOVATELabs / BGI", status: "Needs Routing", funding: "Charitable" },
      { name: "Junior Sentinels", entity: "BGI", status: "BLOCKED", funding: "Mission Capital" },
      { name: "NCICC Knowledge Center", entity: "NOVATELabs Inc", status: "Active", funding: "Research Capital" },
    ]
  },
  {
    code: "P2", name: "Innovation Equity", color: "#6B21A8",
    readiness: "PARTIAL", programCount: 3, activeCount: 2,
    anchor: "NOVATELabs Inc",
    lead: "Tye (strategic lead)",
    blocker: "BGI EIN; NOVATELabs sponsorship revenue stream not configured in NetSuite",
    desc: "Innovation hub, MEIX high school program, CivicGrid community deployment with equity lens.",
    programs: [
      { name: "NOVATELabs Innovation Hub", entity: "NOVATELabs Inc", status: "Development", funding: "Sponsorship Revenue" },
      { name: "MEIX High School Track", entity: "BGI", status: "BLOCKED", funding: "WIOA / Mission Capital" },
      { name: "CivicGrid Community Deployment", entity: "Sentrais Corp", status: "Active", funding: "Commercial + Grant" },
    ]
  },
  {
    code: "P3", name: "Future Workforce", color: "#065F46",
    readiness: "BLOCKED", programCount: 5, activeCount: 0,
    anchor: "BGI",
    lead: "BGI Directors (pending) + Zoie",
    blocker: "BGI EIN — single gate that unlocks all of P3",
    desc: "Barbara Geter Civic Technology Fellowship, academic spine (KSU/GSU/GT), undergraduate internship track.",
    programs: [
      { name: "Barbara Geter Civic Technology Fellowship", entity: "BGI", status: "BLOCKED", funding: "DOL WIOA / NSF / Corporate sponsors" },
      { name: "KSU / Georgia State / Georgia Tech Academic Spine", entity: "BGI (partner)", status: "In Design", funding: "University partnership" },
      { name: "Undergraduate Internship Track ($22/hr)", entity: "BGI", status: "BLOCKED", funding: "WIOA / Mission Capital" },
      { name: "Summer Internship Program", entity: "BGI or Sentrais Academy", status: "Pre-launch", funding: "Mission Capital or Commercial" },
      { name: "Industry Mentor Network", entity: "BGI", status: "Design", funding: "In-kind" },
    ]
  },
  {
    code: "P4", name: "Education", color: "#92400E",
    readiness: "BLOCKED", programCount: 4, activeCount: 0,
    anchor: "BGI",
    lead: "BGI Academic Committee Director (Seat 3, pending)",
    blocker: "BGI board formation — Fellowship Handbook cannot be built without board approval",
    desc: "MEIX academic credit track, research fellows, fellowship handbook, school screening matrix.",
    programs: [
      { name: "MEIX High School Track (academic credit)", entity: "BGI", status: "BLOCKED", funding: "Academic credit / grant stipend" },
      { name: "Research Fellows Program", entity: "NOVATELabs Inc", status: "Design", funding: "NSF Education grants" },
      { name: "Fellowship Handbook", entity: "BGI", status: "BLOCKED", funding: "N/A — governance doc" },
      { name: "School Screening Matrix (APS, Fulton, DeKalb, Gwinnett, Clayton)", entity: "BGI", status: "Not Built", funding: "N/A" },
    ]
  },
  {
    code: "P5", name: "Economic Mobility", color: "#B45309",
    readiness: "BLOCKED", programCount: 3, activeCount: 1,
    anchor: "BGI + Sentrais",
    lead: "Finance Lead + BGI Treasurer (pending)",
    blocker: "BGI Treasurer not appointed; bank accounts blocked until EIN received",
    desc: "Fellowship stipends ($7,500/cohort), NOVATE financial operating model, tiered workforce.",
    programs: [
      { name: "BGI Fellowship Stipend ($7,500 / 6-month cohort)", entity: "BGI", status: "BLOCKED", funding: "Mission Capital — WIOA / corporate" },
      { name: "NOVATE Financial Operating Model", entity: "Sentrais / NOVATELabs", status: "Built (FORGE)", funding: "Operating Capital" },
      { name: "Tiered Workforce Model", entity: "Sentrais / BGI", status: "Designed", funding: "Commercial + Mission Capital" },
    ]
  },
  {
    code: "P6", name: "Sports / Culture / Events", color: "#0E7490",
    readiness: "AT-RISK", programCount: 5, activeCount: 3,
    anchor: "Sentrais Corp",
    lead: "Mikalina (Atlanta POC) + Free (Live Events)",
    blocker: "SEG subcontract must execute before NFL GDA go-live Jun 30",
    desc: "EVERGAME NFL deployment, EntertainmentOS, Converge Atlanta (FIFA 2026), sports vertical pipeline.",
    programs: [
      { name: "EVERGAME (NFL GDA)", entity: "Sentrais Corp", status: "GO-LIVE JUN 30", funding: "Commercial — $475K Q1" },
      { name: "EntertainmentOS / eVenu", entity: "Sentrais Corp", status: "Active", funding: "Platform Subscription" },
      { name: "NFL Year 2 Scope", entity: "Sentrais Corp", status: "Pursuit", funding: "Commercial renewal" },
      { name: "Sports Vertical Prospect Pipeline", entity: "Sentrais Corp", status: "In Development", funding: "GTM cost center" },
      { name: "Atlanta 2076 Programs (Preserve/Prepare/Prosper)", entity: "ARI / NOVATELabs", status: "Design", funding: "Program Capital / Sponsorship" },
    ]
  },
  {
    code: "P7", name: "Institutional Memory", color: "#374151",
    readiness: "PARTIAL", programCount: 5, activeCount: 3,
    anchor: "Sentrais Corp + NOVATELabs",
    lead: "Free (Civic Intelligence Fellows)",
    blocker: "Evidence Ledger not wired to Firestore; IRC §482 docs pending",
    desc: "Atlanta oral history, SHA-256 evidence ledger, document version control, CivicGrid data layer.",
    programs: [
      { name: "Atlanta Oral History Project", entity: "NOVATELabs / BGI", status: "Design", funding: "Mission Capital / Foundation grants" },
      { name: "SHA-256 Evidence Ledger", entity: "Sentrais Corp", status: "Built (FORGE)", funding: "Commercial / Overhead" },
      { name: "Document Version Control", entity: "Sentrais / NOVATELabs", status: "Built (FORGE)", funding: "Internal ops" },
      { name: "SentraisOS / CivicGrid Data Layer", entity: "Sentrais Corp", status: "Active", funding: "Platform Subscription" },
      { name: "NCICC Knowledge Center", entity: "NOVATELabs Inc", status: "Active", funding: "Research Capital" },
    ]
  },
];

const GRANT_PIPELINE = [
  { name: "FEMA BRIC", amount: "Up to $2M", entity: "City of Atlanta / Sentrais delivery", status: "In Pursuit", deadline: "Next submission window", pillar: "P1", lead: "Grant Funding Lead (SOW pending)", notes: "NO BGI references in narrative. City of Atlanta is applicant. Grant Lead SOW critical first deliverable." },
  { name: "DOL WIOA", amount: "$500K–$1.5M", entity: "BGI", status: "BLOCKED", deadline: "Post-EIN", pillar: "P3/P5", lead: "Grant Funding Lead", notes: "Requires BGI EIN. Application development begins Week 8 target." },
  { name: "NSF Education Grants", amount: "$200K–$800K", entity: "BGI / NOVATELabs", status: "Design", deadline: "Post-EIN", pillar: "P4", lead: "Grant Funding Lead", notes: "NSF education grants for Research Fellows and MEIX programs." },
  { name: "HUD Smart City", amount: "TBD", entity: "City of Atlanta / Sentrais", status: "Prospect", deadline: "2027 window", pillar: "P1", lead: "Darryl", notes: "Atlanta360/CivicGrid deployment as smart city infrastructure investment." },
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

const TABS = ["Program Map", "By Pillar", "Grant Pipeline", "BGI Formation"];

export function ARIPrograms() {
  const [tab, setTab] = useState(0);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  const totalPrograms = PILLARS.reduce((s, p) => s + p.programCount, 0);
  const totalActive = PILLARS.reduce((s, p) => s + p.activeCount, 0);
  const blocked = PILLARS.filter(p => p.readiness === "BLOCKED").length;

  return (
    <ForgePage>
      <ForgeHeader
        icon="🎯"
        title="ARI Programs"
        subtitle="Atlanta Resilience Institute — 7-Pillar Program Map · Jun 2026"
        stats={[
          { label: "Total Programs", value: String(totalPrograms) },
          { label: "Active", value: String(totalActive) },
          { label: "Pillars Blocked", value: String(blocked) },
          { label: "Grant Pipeline", value: String(GRANT_PIPELINE.length) },
        ]}
      />
      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />
      <ForgeContent>

        {tab === 0 && (
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {PILLARS.map(p => (
                <div key={p.code} onClick={() => { setSelectedPillar(p.code); setTab(1); }}
                  style={{ background: C.surface, border: `1px solid ${p.color}44`, borderTop: `3px solid ${p.color}`, borderRadius: 8, padding: "10px 14px", cursor: "pointer", minWidth: 130 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.code}</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", marginTop: 2 }}>{p.name}</div>
                  <div style={{ marginTop: 6 }}>
                    <ForgeBadge variant={READINESS_VARIANT[p.readiness] || "neutral"}>{p.readiness}</ForgeBadge>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>{p.activeCount}/{p.programCount} active</div>
                </div>
              ))}
            </div>

            <ForgeAlert level="warning" title="3 Pillars Blocked on BGI EIN">
              P3 (Future Workforce), P4 (Education), and P5 (Economic Mobility) are entirely blocked until BGI EIN is received. File SS-4 with IRS immediately after DE COI confirmation.
            </ForgeAlert>

            <ForgeLabel style={{ marginTop: 20, marginBottom: 12 }}>All Programs — Quick Status</ForgeLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {PILLARS.flatMap(p => p.programs.map(prog => ({ ...prog, pillar: p.code, pillarColor: p.color }))).map((prog, i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${STATUS_COLORS[prog.status] || "#64748b"}`, borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: prog.pillarColor, minWidth: 28 }}>{prog.pillar}</span>
                  <span style={{ flex: 1, fontSize: 13, color: "#e2e8f0" }}>{prog.name}</span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>{prog.entity}</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${STATUS_COLORS[prog.status] || "#64748b"}22`, color: STATUS_COLORS[prog.status] || "#64748b" }}>{prog.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 1 && (
          <div>
            {selectedPillar && (
              <button onClick={() => setSelectedPillar(null)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 12px", color: "#64748b", cursor: "pointer", fontSize: 11, marginBottom: 16, color: C.accent }}>
                ← All Pillars
              </button>
            )}
            {(selectedPillar ? PILLARS.filter(p => p.code === selectedPillar) : PILLARS).map(p => (
              <div key={p.code} style={{ marginBottom: 20 }}>
                <div onClick={() => setSelectedPillar(selectedPillar === p.code ? null : p.code)}
                  style={{ background: C.surface, border: `1px solid ${p.color}44`, borderTop: `3px solid ${p.color}`, borderRadius: 10, padding: "16px 18px", cursor: "pointer", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 11, color: p.color, letterSpacing: "1px" }}>{p.code}</span>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginTop: 2 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>Lead: {p.lead} · Anchor: {p.anchor}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <ForgeBadge variant={READINESS_VARIANT[p.readiness] || "neutral"}>{p.readiness}</ForgeBadge>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{p.activeCount}/{p.programCount} active</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>{p.desc}</div>
                  <div style={{ fontSize: 11, color: C.red, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "6px 10px" }}>
                    ⚠ {p.blocker}
                  </div>
                </div>

                {(selectedPillar === p.code || !selectedPillar) && selectedPillar && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 8, borderLeft: `2px solid ${p.color}44` }}>
                    {p.programs.map((prog, i) => {
                      const sc = STATUS_COLORS[prog.status] || "#64748b";
                      return (
                        <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${sc}`, borderRadius: 8, padding: "12px 14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{prog.name}</span>
                            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${sc}22`, color: sc }}>{prog.status}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>
                            <span>Entity: {prog.entity}</span>
                            <span style={{ marginLeft: 16 }}>Funding: {prog.funding}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 2 && (
          <div>
            <ForgeAlert level="warning" title="Grant Funding Lead SOW Required">
              BRIC is the critical first deliverable. Execute SOW this week — 20 hrs/wk, Net-30, W-9 first. Grant tracking in Monday.com goes live Week 1.
            </ForgeAlert>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
              {GRANT_PIPELINE.map(g => (
                <ForgeCard key={g.name}>
                  <ForgeCardHeader
                    title={g.name}
                    subtitle={g.entity}
                    badge={<ForgeBadge variant={g.status === "In Pursuit" ? "warning" : g.status === "BLOCKED" ? "danger" : "neutral"}>{g.status}</ForgeBadge>}
                  />
                  <ForgeCardBody>
                    <ForgeGrid cols={3}>
                      <div><ForgeLabel>Est. Amount</ForgeLabel><div style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginTop: 4 }}>{g.amount}</div></div>
                      <div><ForgeLabel>Pillar</ForgeLabel><div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>{g.pillar}</div></div>
                      <div><ForgeLabel>Deadline</ForgeLabel><div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>{g.deadline}</div></div>
                    </ForgeGrid>
                    <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>Lead: {g.lead}</div>
                    <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>{g.notes}</div>
                  </ForgeCardBody>
                </ForgeCard>
              ))}
            </div>
          </div>
        )}

        {tab === 3 && (
          <div>
            <ForgeAlert level="critical" title="BGI Formation Sequence">
              All BGI programs (P3/P4/P5 entirely, parts of P1/P2) are blocked until this sequence completes. BGI counsel retainer is the only active blocker — execute today.
            </ForgeAlert>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
              {[
                { step: 1, title: "BGI Independent Counsel Retainer — Signed", status: "GATE", urgency: "CRITICAL", unlocks: "All subsequent BGI formation steps", timing: "This week" },
                { step: 2, title: "Delaware Certificate of Incorporation Filed", status: "ACTION", urgency: "CRITICAL", unlocks: "EIN application, Tenant C provisioning", timing: "Week 2" },
                { step: 3, title: "Director Seat 1 (Chair) — Independence Screen + Seated", status: "ACTION", urgency: "HIGH", unlocks: "Seats 2+3 recruitment, governance package", timing: "Week 3–4" },
                { step: 4, title: "BGI EIN Filed (SS-4)", status: "GATE", urgency: "CRITICAL", unlocks: "P3/P4/P5 entirely, bank accounts, Treasurer appointment, WIOA application", timing: "Week 5 (post-DE COI)" },
                { step: 5, title: "Seats 2 + 3 Seated — Full Board Governance Package Signed", status: "MILESTONE", urgency: "CRITICAL", unlocks: "Bylaws, COI Policy, Advisory Charter, Fellowship Handbook drafting", timing: "Week 8" },
                { step: 6, title: "BGI EIN Received (IRS ~4–6 weeks)", status: "MILESTONE", urgency: "HIGH", unlocks: "Bank accounts, Treasurer, DOL WIOA application", timing: "Week 9 est." },
                { step: 7, title: "Fellowship Handbook — Board Approved", status: "GATE", urgency: "CRITICAL", unlocks: "Cohort announcement (Q4 target)", timing: "Week 11" },
                { step: 8, title: "IRS Form 1023 Filed", status: "GATE", urgency: "CRITICAL", unlocks: "§501(c)(3) determination letter (3–6 months IRS review)", timing: "Week 11" },
                { step: 9, title: "Barbara Geter Fellowship — Q4 Cohort Announced", status: "MILESTONE", urgency: "HIGH", unlocks: "Full P3 activation, public fellowship program", timing: "Week 12" },
              ].map(s => (
                <div key={s.step} style={{ background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${s.urgency === "CRITICAL" ? C.red : C.amber}`, borderRadius: 10, padding: "12px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: s.urgency === "CRITICAL" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)", color: s.urgency === "CRITICAL" ? C.red : C.amber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Timing: {s.timing}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Unlocks: {s.unlocks}</div>
                  </div>
                  <ForgeBadge variant={s.urgency === "CRITICAL" ? "danger" : "warning"}>{s.urgency}</ForgeBadge>
                </div>
              ))}
            </div>
          </div>
        )}

      </ForgeContent>
    </ForgePage>
  );
}

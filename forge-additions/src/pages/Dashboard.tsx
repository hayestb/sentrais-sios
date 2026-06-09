// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody,
  ForgeLabel, ForgeBadge, ForgeGrid, ForgeAlert, C,
} from "../components/ui/forge";

const CRITICAL_ITEMS = [
  { id: "B1", title: "83(b) Election — Certified Mail Filing", deadline: "Jun 28, 2026", owner: "Tye + Counsel", urgency: "CRITICAL", area: "Governance", action: "File certified mail this week. No extensions exist. QSBS protection at risk.", resolved: false },
  { id: "B2", title: "SEG Subcontract Executed (Step-In Rights Active)", deadline: "Before Jun 30", owner: "Tye + Counsel", urgency: "CRITICAL", area: "Commercial", action: "Confirm execution status with counsel. Gates NFL GDA go-live.", resolved: false },
  { id: "B3", title: "NFL GDA Go-Live — EVERGAME Deployment", deadline: "Jun 30, 2026", owner: "Erin + Mikalina", urgency: "CRITICAL", area: "Delivery", action: "Pre-flight check T-7 days. $10K/day LD if missed.", resolved: false },
  { id: "B4", title: "BGI EIN Application Filed", deadline: "ASAP", owner: "Counsel", urgency: "CRITICAL", area: "Nonprofit", action: "Blocks P3 (Workforce), P4 (Education), P5 (Economic Mobility) entirely.", resolved: false },
  { id: "B5", title: "M365 Tenant Isolation — Shared Accounts Eliminated", deadline: "Jul 7, 2026", owner: "Erin + Zoie", urgency: "HIGH", area: "Infrastructure", action: "30-day deadline from Jun 7. All 8 test scenarios must pass.", resolved: false },
  { id: "B6", title: "NFL Q1 Invoice — $475K Submitted", deadline: "Jun 30, 2026", owner: "Tye + Finance", urgency: "HIGH", area: "Financial", action: "Prep invoice now so issues are resolved before go-live.", resolved: false },
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

const QUICK_LINKS = [
  { label: "Master Calendar", path: "/calendar", icon: "📅", desc: "12-week unified schedule" },
  { label: "Program Converge", path: "/converge", icon: "🎯", desc: "7-pillar blocker stack" },
  { label: "Banking & Payments", path: "/banking", icon: "💳", desc: "Card + payment governance" },
  { label: "Financial Model", path: "/financial-model", icon: "📊", desc: "Revenue + cost model" },
  { label: "Evidence Ledger", path: "/evidence", icon: "🔐", desc: "SHA-256 document chain" },
  { label: "Atlanta 360", path: "/atlanta360", icon: "🏙️", desc: "AUOP operations playbook" },
  { label: "National Network", path: "/national-network", icon: "🌐", desc: "Civic innovation network" },
  { label: "City Readiness", path: "/city-readiness", icon: "🗺️", desc: "Multi-city deployment" },
];

const TABS = ["Overview", "Critical Path", "Program Status", "Financial Snapshot"];

const STATUS_VARIANT = { PARTIAL: "warning", BLOCKED: "danger", "AT-RISK": "warning", ACTIVE: "success", FORMATION: "info" };

export function Dashboard() {
  const [tab, setTab] = useState(0);
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const resolvedCount = Object.values(resolved).filter(Boolean).length;
  const criticalCount = CRITICAL_ITEMS.filter(i => i.urgency === "CRITICAL").length;

  return (
    <ForgePage>
      <ForgeHeader
        icon="⚡"
        title="FORGE Command Center"
        subtitle="Sentrais · NOVATELabs · BGI — Unified Operations Dashboard · Jun 2026"
        stats={[
          { label: "Critical Items", value: String(criticalCount) },
          { label: "Resolved", value: `${resolvedCount}/${CRITICAL_ITEMS.length}` },
          { label: "NFL Go-Live", value: "Jun 30" },
          { label: "Entities", value: "3" },
        ]}
      />
      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />
      <ForgeContent>

        {tab === 0 && (
          <div>
            <ForgeAlert level="critical" title="Active Critical Deadlines">
              83(b) election certified mail must be filed by Jun 28 (no extensions). NFL GDA go-live Jun 30 — SEG subcontract must be executed before go-live. BGI EIN blocks 3 pillars.
            </ForgeAlert>

            <ForgeGrid cols={4} style={{ marginTop: 20, marginBottom: 24 }}>
              {[
                { label: "Days to NFL Go-Live", value: "21", color: C.red },
                { label: "Days to 83(b) Deadline", value: "19", color: C.red },
                { label: "Programs Active", value: "13", color: C.green },
                { label: "Programs Blocked", value: "9", color: C.amber },
              ].map(s => (
                <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </ForgeGrid>

            <ForgeLabel style={{ marginBottom: 12 }}>Quick Navigation</ForgeLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8, marginBottom: 24 }}>
              {QUICK_LINKS.map(l => (
                <div key={l.path} onClick={() => navigate(l.path)}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", transition: "border-color 0.12s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = C.accent)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
                  <div style={{ fontSize: 18, marginBottom: 6 }}>{l.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 3 }}>{l.label}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{l.desc}</div>
                </div>
              ))}
            </div>

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

        {tab === 1 && (
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
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Deadline: {item.deadline} · Owner: {item.owner}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{item.action}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 2 && (
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

        {tab === 3 && (
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

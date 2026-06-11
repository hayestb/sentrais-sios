// @ts-nocheck
import { useState } from "react";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody,
  ForgeLabel, ForgeBadge, ForgeGrid, ForgeAlert, C,
} from "../components/ui/forge";

const INVOICES = [
  { id: "SNT-NFL-2026-Q1", client: "NFL GDA", amount: 475000, type: "License + Platform", issued: "Jun 30, 2026", due: "Jul 30, 2026", status: "PENDING", entity: "Sentrais Corp", notes: "Q1 license + infra passthrough. Triggers on go-live completion." },
  { id: "SNT-NFL-2026-Q2", client: "NFL GDA", amount: 475000, type: "License + Platform", issued: "Sep 30, 2026", due: "Oct 30, 2026", status: "SCHEDULED", entity: "Sentrais Corp", notes: "Q2 quarterly license. Recurring per MSA." },
  { id: "SNT-META-2026-M1", client: "MetaData", amount: 28000, type: "Delivery Milestone", issued: "Apr 15, 2026", due: "May 15, 2026", status: "PAID", entity: "Sentrais Corp", notes: "M1 delivery milestone. Tenant B sandbox isolation required." },
  { id: "SNT-META-2026-M2", client: "MetaData", amount: 28000, type: "Delivery Milestone", issued: "Jul 15, 2026", due: "Aug 14, 2026", status: "SCHEDULED", entity: "Sentrais Corp", notes: "90-day post-engagement review milestone." },
];

const COST_CENTERS = [
  { code: "CC-100", name: "Engineering & Product", type: "Operating", budget: 180000, ytd: 42000, entity: "Sentrais Corp", notes: "Platform dev, QA, infrastructure" },
  { code: "CC-200", name: "Go-to-Market", type: "Operating", budget: 90000, ytd: 18000, entity: "Sentrais Corp", notes: "Sales, partnerships, BD" },
  { code: "CC-300", name: "Program Delivery", type: "Operating", budget: 120000, ytd: 31000, entity: "NOVATELabs Inc", notes: "ARI 7-pillar programs, community" },
  { code: "CC-400", name: "Governance & Legal", type: "Operating", budget: 60000, ytd: 22000, entity: "Sentrais Corp", notes: "Counsel, compliance, entity admin" },
  { code: "CC-500", name: "People & Org", type: "Operating", budget: 75000, ytd: 14000, entity: "Sentrais Corp", notes: "HR, hiring, benefits" },
  { code: "CC-600", name: "BGI Mission Capital", type: "Mission", budget: 50000, ytd: 0, entity: "BGI", notes: "Blocked — EIN required before disbursement" },
  { code: "CC-700", name: "Research Capital", type: "Research", budget: 30000, ytd: 8000, entity: "NOVATELabs Inc", notes: "NCICC, academic partnerships" },
];

const ENTITIES = [
  {
    name: "Sentrais Corp", ein: "EIN pending 83(b)", type: "Commercial",
    revenue: "NFL MSA ($475K/qtr) · MetaData · Platform subscriptions",
    expenses: "Engineering, GTM, Governance",
    notes: "Primary commercial entity. IRC §482 royalty to RRH (10–25%). All client contracts routed here.",
    status: "ACTIVE", color: C.accent,
  },
  {
    name: "NOVATELabs Inc", ein: "39-4510998", type: "Program",
    revenue: "Sponsorship revenue · Research grants · Program fees",
    expenses: "Program delivery (CC-300), Research (CC-700)",
    notes: "Former NOVATEUS Foundation. Name change complete Jun 8. IRS affirmation letter outstanding.",
    status: "ACTIVE", color: C.teal,
  },
  {
    name: "BGI (Barbara Geter Institute)", ein: "PENDING", type: "Nonprofit §501(c)(3)",
    revenue: "DOL WIOA · NSF grants · Corporate sponsorships (pending)",
    expenses: "Fellowship stipends, program operations",
    notes: "Formation in progress. EIN blocks all operations. Zero commingling with commercial — §4958 prohibition.",
    status: "FORMATION", color: C.amber,
  },
];

const PAYROLL = [
  { role: "Fractional CFO", rate: "10 hrs/wk · Net-30", entity: "Sentrais Corp", status: "PENDING_SOW", notes: "SOW must execute this week. W-9 required before payment." },
  { role: "Grant Funding Lead", rate: "20 hrs/wk · Net-30", entity: "NOVATELabs Inc", status: "PENDING_SOW", notes: "BRIC submission is critical first deliverable. W-9 required." },
  { role: "Sales Lead", rate: "15 hrs/wk", entity: "Sentrais Corp", status: "ACTIVE", notes: "SOW executed. $475K NFL opportunity support." },
  { role: "Comms Lead", rate: "15 hrs/wk", entity: "NOVATELabs Inc", status: "ACTIVE", notes: "SOW executed. GTM content + partner communications." },
  { role: "MetaData (pass-through)", rate: "Project milestone", entity: "Sentrais Corp", status: "ACTIVE", notes: "Qubika pass-through billing. 90-day review milestone Jul 15." },
];

const TABS = ["AR & Invoices", "Cost Centers", "Entity Summary", "Payroll & Vendors", "Compliance"];

const STATUS_VARIANT = { PENDING: "warning", SCHEDULED: "neutral", PAID: "success", OVERDUE: "danger", ACTIVE: "success", FORMATION: "info", PENDING_SOW: "warning" };

export function FinancialOps() {
  const [tab, setTab] = useState(0);

  const totalAR = INVOICES.filter(i => i.status === "PENDING").reduce((s, i) => s + i.amount, 0);
  const totalScheduled = INVOICES.filter(i => i.status === "SCHEDULED").reduce((s, i) => s + i.amount, 0);

  return (
    <ForgePage>
      <ForgeHeader
        icon="💰"
        title="Financial Operations"
        subtitle="Multi-entity AR, cost centers, payroll, and compliance — Sentrais / NOVATELabs / BGI"
        stats={[
          { label: "AR Outstanding", value: `$${(totalAR / 1000).toFixed(0)}K` },
          { label: "Scheduled", value: `$${(totalScheduled / 1000).toFixed(0)}K` },
          { label: "Entities", value: "3" },
          { label: "Open Actions", value: "5" },
        ]}
      />
      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />
      <ForgeContent>

        {tab === 0 && (
          <div>
            <ForgeAlert level="info" title="NFL Q1 Invoice Trigger">
              The $475K Q1 invoice (SNT-NFL-2026-Q1) must be submitted on Jun 30 after go-live confirmation. Net 30 payment = Jul 30 cash receipt. Watch AR aging after submission.
            </ForgeAlert>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
              {INVOICES.map(inv => (
                <div key={inv.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{inv.client}</span>
                        <span style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace" }}>{inv.id}</span>
                        <ForgeBadge variant={STATUS_VARIANT[inv.status] || "neutral"}>{inv.status}</ForgeBadge>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                        {inv.type} · {inv.entity} · Issued: {inv.issued} · Due: {inv.due}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{inv.notes}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: inv.status === "PAID" ? C.green : inv.status === "PENDING" ? C.accent : "#64748b" }}>
                        ${inv.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 1 && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {COST_CENTERS.map(cc => {
                const pct = cc.budget > 0 ? Math.round((cc.ytd / cc.budget) * 100) : 0;
                return (
                  <div key={cc.code} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
                      <span style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace", flexShrink: 0, minWidth: 75 }}>{cc.code}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{cc.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{cc.entity} · {cc.type} · {cc.notes}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>${cc.ytd.toLocaleString()} <span style={{ fontSize: 11, color: "#4a6080" }}>/ ${cc.budget.toLocaleString()}</span></div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{pct}% used</div>
                      </div>
                    </div>
                    <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: pct > 80 ? C.red : pct > 60 ? C.amber : C.teal, width: `${pct}%`, borderRadius: 2, transition: "width 0.3s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 2 && (
          <div>
            <ForgeAlert level="warning" title="Entity Separation Required">
              BGI must maintain completely separate accounts, ledgers, and records. Zero commingling with Sentrais Corp or NOVATELabs Inc. §4958 private inurement prohibition applies.
            </ForgeAlert>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
              {ENTITIES.map(ent => (
                <ForgeCard key={ent.name} accent={ent.color}>
                  <ForgeCardHeader
                    title={ent.name}
                    subtitle={ent.type}
                    badge={<ForgeBadge variant={STATUS_VARIANT[ent.status] || "neutral"}>{ent.status}</ForgeBadge>}
                  />
                  <ForgeCardBody>
                    <ForgeGrid cols={2}>
                      <div>
                        <ForgeLabel style={{ marginBottom: 6 }}>Revenue Sources</ForgeLabel>
                        <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{ent.revenue}</div>
                      </div>
                      <div>
                        <ForgeLabel style={{ marginBottom: 6 }}>Expense Allocation</ForgeLabel>
                        <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{ent.expenses}</div>
                      </div>
                    </ForgeGrid>
                    <div style={{ marginTop: 12, fontSize: 12, color: "#64748b", borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                      <span style={{ color: "#4a6080" }}>EIN: </span>{ent.ein} · {ent.notes}
                    </div>
                  </ForgeCardBody>
                </ForgeCard>
              ))}
            </div>
          </div>
        )}

        {tab === 3 && (
          <div>
            <ForgeAlert level="warning" title="W-9 Sweep Required">
              Collect W-9 from all active vendors before the next payment cycle. No payment may be issued without W-9 on file.
            </ForgeAlert>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
              {PAYROLL.map(p => (
                <div key={p.role} style={{ background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${p.status === "ACTIVE" ? C.green : C.amber}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{p.role}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{p.rate} · {p.entity}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{p.notes}</div>
                  </div>
                  <ForgeBadge variant={STATUS_VARIANT[p.status] || "neutral"}>{p.status === "PENDING_SOW" ? "SOW Pending" : p.status}</ForgeBadge>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 4 && (
          <div>
            <ForgeGrid cols={2}>
              {[
                {
                  title: "IRC §482 Transfer Pricing",
                  color: C.accent,
                  items: [
                    "RRH → Sentrais royalty: 10–25% of gross revenue",
                    "Contemporaneous documentation required before year-end",
                    "Q1 true-up: Week 7 (Jul 21) deliverable",
                    "CFO owns documentation; Counsel reviews annually",
                  ]
                },
                {
                  title: "§4958 Private Inurement (BGI)",
                  color: C.red,
                  items: [
                    "ZERO commingling with commercial entities — absolute prohibition",
                    "BGI Treasurer only signatory on BGI accounts",
                    "Dual-signature required above $5K threshold",
                    "All transactions documented in separate BGI ledger",
                  ]
                },
                {
                  title: "2 CFR Part 200 (Federal Grants)",
                  color: C.teal,
                  items: [
                    "BRIC and WIOA grants subject to federal indirect cost rules",
                    "Grant Funding Lead owns compliance infrastructure",
                    "Tracking system: Monday.com (pending SOW execution)",
                    "Quarterly grant compliance reports to Finance",
                  ]
                },
                {
                  title: "QSBS / 83(b) Protection",
                  color: C.amber,
                  items: [
                    "83(b) election — certified mail DEADLINE Jun 28",
                    "No extensions exist — permanent loss if missed",
                    "Founders' stock split: 200K Series A + 600K Series B",
                    "Must coordinate with amended DE certificate this week",
                  ]
                },
              ].map(s => (
                <ForgeCard key={s.title} accent={s.color}>
                  <ForgeCardHeader title={s.title} />
                  <ForgeCardBody>
                    {s.items.map(item => (
                      <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 7 }}>
                        <span style={{ color: s.color, flexShrink: 0 }}>▸</span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{item}</span>
                      </div>
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

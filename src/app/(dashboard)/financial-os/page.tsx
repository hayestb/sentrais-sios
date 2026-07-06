"use client";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign, Building2, Users, ShieldCheck, AlertTriangle,
  Clock, TrendingUp,
} from "lucide-react";

// ── Data ────────────────────────────────────────────────────────────────────────────────

const INVOICES = [
  { id: "SNT-NFL-2026-Q1", client: "NFL GDA", amount: 475000, type: "License + Platform", issued: "Jun 30, 2026", due: "Jul 30, 2026", status: "PENDING", entity: "Sentrais Corp", notes: "Q1 license + infra passthrough. Triggers on go-live confirmation." },
  { id: "SNT-NFL-2026-Q2", client: "NFL GDA", amount: 475000, type: "License + Platform", issued: "Sep 30, 2026", due: "Oct 30, 2026", status: "SCHEDULED", entity: "Sentrais Corp", notes: "Q2 quarterly license. Recurring per MSA." },
  { id: "SNT-META-2026-M1", client: "MetaData", amount: 28000, type: "Delivery Milestone", issued: "Apr 15, 2026", due: "May 15, 2026", status: "PAID", entity: "Sentrais Corp", notes: "M1 delivery milestone. Tenant B sandbox isolation required." },
  { id: "SNT-META-2026-M2", client: "MetaData", amount: 28000, type: "Delivery Milestone", issued: "Jul 15, 2026", due: "Aug 14, 2026", status: "SCHEDULED", entity: "Sentrais Corp", notes: "90-day post-engagement review milestone." },
];

const COST_CENTERS = [
  { code: "CC-100", name: "Engineering & Product", type: "Operating", budget: 180000, ytd: 42000, entity: "Sentrais Corp", notes: "Platform dev, QA, infrastructure" },
  { code: "CC-200", name: "Go-to-Market", type: "Operating", budget: 90000, ytd: 18000, entity: "Sentrais Corp", notes: "Sales, partnerships, BD" },
  { code: "CC-300", name: "Program Delivery", type: "Operating", budget: 120000, ytd: 31000, entity: "NOVATELabs Inc", notes: "CONVERGE program, community engagement" },
  { code: "CC-400", name: "Governance & Legal", type: "Operating", budget: 60000, ytd: 22000, entity: "Sentrais Corp", notes: "Counsel, compliance, entity admin" },
  { code: "CC-500", name: "People & Org", type: "Operating", budget: 75000, ytd: 14000, entity: "Sentrais Corp", notes: "HR, hiring, benefits" },
  { code: "CC-600", name: "BGI Mission Capital", type: "Mission", budget: 50000, ytd: 0, entity: "BGI", notes: "Blocked — EIN required before disbursement" },
  { code: "CC-700", name: "Research Capital", type: "Research", budget: 30000, ytd: 8000, entity: "NOVATELabs Inc", notes: "NCICC, academic partnerships. Note: CONVERGE program has separate $10.3M grant pipeline tracked outside this cost center." },
];

const ENTITIES = [
  {
    name: "Sentrais Corp",
    ein: "39-4645168",
    type: "Commercial · Delaware C-Corp",
    status: "ACTIVE",
    statusVariant: "success" as const,
    revenue: "NFL MSA ($475K/qtr) · MetaData · Platform subscriptions",
    expenses: "Engineering (CC-100), GTM (CC-200), Governance (CC-400)",
    notes: "Primary commercial entity. IRC §482 royalty to RRH (10–25%). All client contracts routed here. Option A CONFIRMED (Jun 29): Sentrais Corp assumes direct Employer of Record function. ADP registration transfers from NOVATELabs EIN 39-4510998 to this EIN — Tyler coordinating ADP transfer this week to complete before Jul 1 payroll.",
    accentClass: "border-l-[#0EA5E9]",
  },
  {
    name: "NOVATELabs Inc",
    ein: "39-4510998",
    type: "Georgia §501(c)(3) Nonprofit · Sponsored Research Institution · fka N-OvateUS Foundation Inc",
    status: "ACTIVE",
    statusVariant: "success" as const,
    revenue: "Sponsored research fees (Sentrais) · Federal grants (40%) · Foundation grants (30%) · Corporate/event partners (15%) · Program revenue/NIN certification (10%) · Individual giving (5%) · Year 1 target: $2.1M · Year 5 target: $4.5M",
    expenses: "Program delivery (CC-300), Research (CC-700)",
    notes: "Georgia §501(c)(3) nonprofit. Incorporated Feb 6, 2024 as N-OvateUS Foundation Inc (GA Control No. 24030590); name amended to NOVATELabs Inc per Certificate of Amendment. Registered Agent: Valorie Salahuddin. Initial directors: Tye Hayes, René Chatfield, Valorie Salahuddin. Repositioning in progress (SNT-LEGAL-NLREPOS-2026-v1.0, Jun 21): transitioning from cost-plus services vendor → independent sponsored research institution. MISA-SI-NL-001 §2 amendment required: replace Cost-Plus Basis with Sponsored Research Fee (IRC §482 CUT standard). Option A CONFIRMED (Jun 29): EOR/payroll transfers to Sentrais Corp — ADP transfer in progress, targeting completion before Jul 1. §501(c)(3) status CONFIRMED — IRS Letter 947 (Definitive Ruling of Public Charity Status) issued Feb 2024 under N-OvateUS Foundation Inc name. IRS name-change notification pending: IRS record must be updated to reflect NOVATELabs Inc — file via Form 990 or written notification to IRS EO. Status is active; this is a records update, not a new determination. Flagship program: CONVERGE — signature applied resilience Living Lab embedded in SEAR 1 and SEAR 2 environments; four pillars: Community Resilience, Smart Cities/Critical Infrastructure, Responsible AI Governance, Education/Workforce Development. Converge operates within the Sentrais ecosystem via restricted-use licensing agreements — Sentrais Corp provides Intelligence Operating System, simulation runtime, evidence ledger, and real-time orchestration; NOVATELabs maintains research independence and nonprofit status. Research pipeline: “Orchestrating Resilience” 5-year $10.3M ($1.87M/yr) bi-coastal program (Atlanta + California hubs; FIFA 2026, Super Bowl LX/LXI, LA 2028 Olympics, Super Bowl 2029). Grant pipeline: NSF ExpandAI $2–4M · NSF Civic Innovation $1–2M · DHS/FEMA FIFA World Cup Grant $2–5M · DOT/FTA $1–2M · DOE $500K–2M · Ford Foundation $500K–1M · MacArthur $500K–1M · NFL Foundation $500K–1M · LA28 Legacy Fund $1–2M · Blank Family Foundation $250K–$500K. NFL Hackathon: Sentrais/NOVATE named execution partner (Ops, Field Ops, Ecosystem) — Gate 1 launched Nov 2025, Gate 5 Draft Showcase Apr 2026 Pittsburgh.",
    accentClass: "border-l-[#00D4AA]",
  },
  {
    name: "BGI (Barbara Geter Institute)",
    ein: "PENDING",
    type: "Nonprofit · §501(c)(3) Formation",
    status: "FORMATION",
    statusVariant: "warning" as const,
    revenue: "Philanthropic donations · DOL WIOA (workforce dev) · NSF education grants · Corporate philanthropy · City of Atlanta project-based contracts",
    expenses: "Fellowship stipends, program operations — blocked until EIN",
    notes: "Formation in progress. EIN blocks all operations. BRIC is NOT a BGI funding stream (BGI-BOP-BRIC-NOTICE-2026-v1.0). Zero commingling — §4958 prohibition.",
    accentClass: "border-l-amber-500",
  },
];

const PAYROLL = [
  { role: "Tyler Capson — Fractional CFO", rate: "$18,666/mo · bi-weekly invoice · Net-15", entity: "NOVATELabs Inc → Sentrais Corp (Option A)", status: "ACTIVE", notes: "SOW fully executed Jun 26, 2026 (both parties, Adobe Acrobat Sign). Contracting entity: NOVATELabs Inc. — SOW amendment or parallel Sentrais Corp engagement needed as Option A ADP transfer completes (flag for Chanise). Tyler authorized to begin all transition activities immediately. W-9 required before first 1099 payment. Day 1 (Jul 1): ADP payroll cutover + BofA account controls + NetSuite reconciliation. Day 7 (Jul 7): SimpliMeta payment + SAM.gov/UEI update. Day 15 (Jul 15): Finance Ops Transition Report." },
  { role: "Grant Funding Lead", rate: "20 hrs/wk · Net-30", entity: "NOVATELabs Inc", status: "PENDING_SOW", notes: "SOW + W-9 required. Next-cycle BRIC prep (FY2026-27) + 2 CFR Part 200 readiness. July 23 is not a hard hire deadline — hire for next cycle preparation." },
  { role: "Kevin McCann — Growth Strategy Lead", rate: "15 hrs/wk", entity: "Sentrais Corp", status: "ACTIVE", notes: "SOW executed. Positioning updated Jun 17: platform is delivery assurance + evidence infrastructure — not a BRIC standalone ask. NFL Go-Live (Jun 30) is commercial anchor for all new buyer conversations." },
  { role: "Comms Lead", rate: "15 hrs/wk", entity: "NOVATELabs Inc", status: "ACTIVE", notes: "SOW executed. GTM content + partner communications." },
  { role: "MetaData (pass-through)", rate: "Project milestone", entity: "Sentrais Corp", status: "ACTIVE", notes: "Qubika pass-through billing. 90-day review milestone Jul 15." },
];

const COMPLIANCE = [
  {
    title: "OVERDUE AP — Gartner Invoice #1GI00083955",
    accent: "border-red-500/40 bg-red-500/5",
    titleColor: "text-red-400",
    items: [
      "Invoice #1GI00083955 is 56 days past due as of Jun 22 — NACM reporting risk",
      "NACM report would damage Sentrais/NOVATELabs credit and trigger outside counsel escalation",
      "ACTION: Pay immediately; provide payment confirmation to Gartner account rep",
      "Owner: Accounting / Tye — do not allow further aging",
    ],
  },
  {
    title: "MISA-SI-NL-001 Repositioning (Jun 21, 2026)",
    accent: "border-amber-500/40 bg-amber-500/5",
    titleColor: "text-amber-400",
    items: [
      "§501(c)(3) status CONFIRMED — IRS Letter 947 (Definitive Ruling) issued Feb 2024 under N-OvateUS Foundation Inc. IRS name-change notification pending to update record to NOVATELabs Inc — this is a records update, not a new determination.",
      "NOVATELabs transitioning from cost-plus services vendor → Sponsored Research Institution (SNT-LEGAL-NLREPOS-2026-v1.0)",
      "MISA §2 amendment: replace Cost-Plus Basis with Sponsored Research Fee — IRC §482 CUT analysis required before execution",
      "Option A CONFIRMED (Jun 29): Sentrais Corp assumes Employer of Record; ADP registration transfers from EIN 39-4510998 → 39-4645168",
      "Tyler Capson coordinating ADP transfer this week — targeting completion before Jul 1 payroll run",
      "NetSuite Rule 2 reconfiguration: ‘R&D service fee routing’ → ‘Sponsored Research Fund routing’ upon MISA amendment execution",
      "GATE — Chanise: confirm MISA v1.0 execution status + Erin signing authority before drafting any NOVATELabs-side documents",
      "SOW sequencing (risk-minimizing path): (1) Execute new Sentrais Corp SOW with Tyler, effective date = ADP transfer completion date. (2) NOVATELabs SOW remains in force until Sentrais Corp SOW is live — no gap in coverage. (3) Formally terminate NOVATELabs SOW only after Sentrais Corp SOW is confirmed active. Do not terminate NOVATELabs SOW first.",
      "SOW entity note: executed SOW (Jun 26) names NOVATELabs Inc. — scope language (‘commercial revenue operations’) misaligns with repositioning; new Sentrais Corp SOW corrects this cleanly without amending the repositioning narrative",
    ],
  },
  {
    title: "IRC §482 Transfer Pricing",
    accent: "border-[#0EA5E9]/40 bg-[#0EA5E9]/5",
    titleColor: "text-[#0EA5E9]",
    items: [
      "RRH → Sentrais royalty: 10–25% of gross revenue",
      "Contemporaneous documentation required before year-end",
      "Q1 true-up: Week 7 (Jul 21) deliverable",
      "CFO owns documentation; Counsel reviews annually",
    ],
  },
  {
    title: "§4958 Private Inurement (BGI)",
    accent: "border-red-500/40 bg-red-500/5",
    titleColor: "text-red-400",
    items: [
      "ZERO commingling with commercial entities — absolute prohibition",
      "BGI Treasurer only signatory on BGI accounts",
      "Dual-signature required above $5K threshold",
      "All transactions documented in separate BGI ledger",
    ],
  },
  {
    title: "2 CFR Part 200 (Federal Grants)",
    accent: "border-[#00D4AA]/40 bg-[#00D4AA]/5",
    titleColor: "text-[#00D4AA]",
    items: [
      "WIOA grants subject to federal indirect cost rules (BGI)",
      "Grant Funding Lead owns compliance infrastructure — next-cycle prep",
      "CONVERGE program federal grant targets: DHS/FEMA FIFA World Cup Grant $2–5M (highest near-term priority), NSF ExpandAI $2–4M (HBCU/HSI focus), NSF Civic Innovation $1–2M, DOT/FTA SMART Grants $1–2M",
      "Tracking system: Monday.com (pending SOW execution)",
      "Quarterly grant compliance reports to Finance",
    ],
  },
  {
    title: "BRIC Posture — v2.0 (Jun 17, 2026)",
    accent: "border-[#00D4AA]/40 bg-[#00D4AA]/5",
    titleColor: "text-[#00D4AA]",
    items: [
      "July 23, 2026 is NOT a revenue target — state pre-app gates closed in spring",
      "Posture: Awareness → Pilot → Position for FY2026-27 cycle",
      "Sentrais attaches inside awarded infrastructure projects — never standalone",
      "BGI/Institute has zero BRIC connection per BGI-BOP-BRIC-NOTICE-2026-v1.0",
      "Revenue via management costs + infrastructure-tied capability-building lanes only",
    ],
  },
  {
    title: "QSBS / 83(b) Protection",
    accent: "border-amber-500/40 bg-amber-500/5",
    titleColor: "text-amber-400",
    items: [
      "83(b) election — certified mail DEADLINE Jun 28",
      "No extensions exist — permanent loss if missed",
      "Founders’ stock split: 200K Series A + 600K Series B",
      "Must coordinate with amended DE certificate this week",
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  PENDING:      { label: "Pending",   classes: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  SCHEDULED:    { label: "Scheduled", classes: "border-border bg-secondary text-muted-foreground" },
  PAID:         { label: "Paid",      classes: "border-green-500/30 bg-green-500/10 text-green-400" },
  OVERDUE:      { label: "Overdue",   classes: "border-red-500/30 bg-red-500/10 text-red-400" },
  ACTIVE:       { label: "Active",    classes: "border-green-500/30 bg-green-500/10 text-green-400" },
  FORMATION:    { label: "Formation", classes: "border-[#0EA5E9]/30 bg-[#0EA5E9]/10 text-[#0EA5E9]" },
  PENDING_SOW:  { label: "SOW Pending", classes: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] ?? { label: status, classes: "border-border bg-secondary text-muted-foreground" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

const TABS = [
  { id: "ar",         label: "AR & Invoices",    icon: DollarSign },
  { id: "costs",      label: "Cost Centers",     icon: TrendingUp },
  { id: "entities",   label: "Entity Summary",   icon: Building2 },
  { id: "payroll",    label: "Payroll & Vendors", icon: Users },
  { id: "compliance", label: "Compliance",       icon: ShieldCheck },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FinancialOSPage() {
  const [tab, setTab] = useState("ar");

  const totalAR = INVOICES.filter(i => i.status === "PENDING").reduce((s, i) => s + i.amount, 0);
  const totalScheduled = INVOICES.filter(i => i.status === "SCHEDULED").reduce((s, i) => s + i.amount, 0);
  const pendingSows = PAYROLL.filter(p => p.status === "PENDING_SOW").length;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Financial OS"
        subtitle="Multi-entity AR, cost centers, payroll & compliance — Sentrais / NOVATELabs / BGI"
        actions={
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {pendingSows > 0 && (
              <span className="flex items-center gap-1.5 text-amber-400">
                <AlertTriangle size={11} /> {pendingSows} SOW{pendingSows > 1 ? "s" : ""} pending
              </span>
            )}
          </div>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3 p-6 pb-0">
        {[
          { label: "AR Outstanding", value: `$${(totalAR / 1000).toFixed(0)}K`, sub: "Net-30 due Jul 30", color: "text-amber-400", icon: Clock },
          { label: "Scheduled",      value: `$${(totalScheduled / 1000).toFixed(0)}K`, sub: "Q2 + MetaData M2", color: "text-[#0EA5E9]", icon: TrendingUp },
          { label: "Entities",       value: "3", sub: "Corp · Inc · BGI", color: "text-foreground", icon: Building2 },
          { label: "Open Actions",   value: `${pendingSows + 2}`, sub: `${pendingSows} SOWs + 83(b) + BRIC scrub`, color: "text-red-400", icon: AlertTriangle },
        ].map(({ label, value, sub, color, icon: Icon }) => (
          <Card key={label} className="border-border">
            <CardContent className="p-4 flex items-start gap-3">
              <Icon size={16} className={`mt-0.5 shrink-0 ${color}`} />
              <div>
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 pb-0 border-b border-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t transition-colors border-b-2 -mb-px ${
              tab === id
                ? "border-[#0EA5E9] text-[#0EA5E9] bg-[#0EA5E9]/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={11} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">

        {/* AR & Invoices */}
        {tab === "ar" && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-[#0EA5E9]/20 bg-[#0EA5E9]/5 text-xs text-[#0EA5E9]">
              <span className="font-medium">NFL Q1 Invoice Trigger:</span> The $475K Q1 invoice (SNT-NFL-2026-Q1) must be submitted Jun 30 after go-live confirmation. Net-30 payment = Jul 30 cash receipt. Watch AR aging after submission.
            </div>
            {INVOICES.map(inv => (
              <div key={inv.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{inv.client}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{inv.id}</span>
                      <StatusPill status={inv.status} />
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {inv.type} · {inv.entity} · Issued: {inv.issued} · Due: {inv.due}
                    </div>
                    <div className="text-xs text-muted-foreground/70">{inv.notes}</div>
                  </div>
                  <div className={`text-2xl font-bold shrink-0 ${inv.status === "PAID" ? "text-green-400" : inv.status === "PENDING" ? "text-amber-400" : "text-muted-foreground"}`}>
                    ${inv.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cost Centers */}
        {tab === "costs" && (
          <div className="space-y-2">
            {COST_CENTERS.map(cc => {
              const pct = cc.budget > 0 ? Math.round((cc.ytd / cc.budget) * 100) : 0;
              const barColor = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-[#00D4AA]";
              return (
                <div key={cc.code} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3 flex-wrap">
                    <span className="text-[10px] font-mono text-muted-foreground min-w-[70px] mt-0.5">{cc.code}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{cc.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{cc.entity} · {cc.type} · {cc.notes}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-[#0EA5E9]">${cc.ytd.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">/ ${cc.budget.toLocaleString()}</span></div>
                      <div className="text-[10px] text-muted-foreground">{pct}% used</div>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Entity Summary */}
        {tab === "entities" && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs text-amber-400">
              <span className="font-medium">Entity Separation Required:</span> BGI must maintain completely separate accounts, ledgers, and records. Zero commingling with Sentrais Corp or NOVATELabs Inc. §4958 private inurement prohibition applies.
            </div>
            {ENTITIES.map(ent => (
              <Card key={ent.name} className={`border-l-2 ${ent.accentClass}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <CardTitle className="text-sm">{ent.name}</CardTitle>
                      <div className="text-xs text-muted-foreground mt-0.5">{ent.type}</div>
                    </div>
                    <StatusPill status={ent.status} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Revenue Sources</div>
                      <div className="text-xs text-muted-foreground/80 leading-relaxed">{ent.revenue}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Expense Allocation</div>
                      <div className="text-xs text-muted-foreground/80 leading-relaxed">{ent.expenses}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground/60 border-t border-border pt-3">
                    <span className="text-muted-foreground">EIN:</span> {ent.ein} · {ent.notes}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Payroll & Vendors */}
        {tab === "payroll" && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs text-amber-400">
              <span className="font-medium">W-9 Sweep Required:</span> Collect W-9 from all active vendors before the next payment cycle. No payment may be issued without W-9 on file.
            </div>
            {PAYROLL.map(p => (
              <div
                key={p.role}
                className={`bg-card border border-border rounded-lg p-4 flex items-center gap-4 flex-wrap border-l-2 ${p.status === "ACTIVE" ? "border-l-green-500" : "border-l-amber-500"}`}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground mb-0.5">{p.role}</div>
                  <div className="text-xs text-muted-foreground">{p.rate} · {p.entity}</div>
                  <div className="text-xs text-muted-foreground/70 mt-1">{p.notes}</div>
                </div>
                <StatusPill status={p.status} />
              </div>
            ))}
          </div>
        )}

        {/* Compliance */}
        {tab === "compliance" && (
          <div className="space-y-3">
          <div className="p-3 rounded-lg border border-[#00D4AA]/20 bg-[#00D4AA]/5 text-xs text-[#00D4AA]">
            <span className="font-semibold">BRIC v2.0 correction (Jun 17):</span> Remove all BRIC references from BGI/Institute documents, Form 1023, and ARI program files. Foundation Counsel leads scrub. BRIC is a Sentrais commercial positioning opportunity only — not a BGI/Institute matter.
          </div>
          <div className="grid grid-cols-2 gap-4">
            {COMPLIANCE.map(section => (
              <Card key={section.title} className={`border ${section.accent}`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm ${section.titleColor}`}>{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {section.items.map(item => (
                    <div key={item} className="flex items-start gap-2">
                      <span className={`shrink-0 mt-0.5 ${section.titleColor}`}>▸</span>
                      <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
          </div>
        )}

      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AlertTriangle, TrendingUp, Lock, Clock } from "lucide-react";

// ── Source of truth: SNT-CASH-DIRECTIVE-2026-v1.0 · SNT-BRIC-BRIEF-2026-v2.0
// Corrections applied Jun 17, 2026:
//   - BRIC is NOT a 90-day inflow this cycle (awareness→pilot→next cycle)
//   - SimpliMeta Settlement $11,850 added as Month 1 outflow (Jul 6-7)
//   - SEG Q1 disbursement ($332,500) held in Account 1040 — releases when NFL payment clears
//   - SEG/Knox Phillips and SimpliMeta are two separate transactions
//   - BGI $50K frozen — not operating capital
// Updates applied Jun 29, 2026:
//   - Tyler Capson SOW: EXECUTED Jun 26 — both parties signed via Adobe Acrobat Sign
//   - BGI BRIC scrub added: Foundation Counsel must remove federal grant language before Form 1023 filing
//   - AWS LOI added: must be countersigned before Jul 3 GenAIIC sprint start (Carly Castiner / AWS)
//   - Kevin McCann GTM Playbook update added (remove BRIC as standalone revenue; add NFL proof point)
//   - NFL Go-Live TOMORROW (Jun 30) — $475K Q1 invoice trigger
//   - Gartner Invoice #1GI00083955: 56 days overdue — NACM reporting risk + outside counsel escalation risk

// ── 30-day cash calendar ──────────────────────────────────────────────────────

const CASH_CALENDAR = [
  { date: "Jun 17", event: "Zoie: audit all outstanding vendor invoices", owner: "Zoie", impact: "AP visibility — no cash event", impactType: "neutral" },
  { date: "OVERDUE", event: "Gartner Invoice #1GI00083955 — 56 days past due", owner: "Accounting / Tye", impact: "NACM reporting risk: credit damage + outside counsel escalation. Pay immediately to prevent escalation.", impactType: "danger" },
  { date: "Jun 26", event: "Tyler Capson SOW — EXECUTED (both parties signed Jun 26, 2026)", owner: "Tye / Tyler", impact: "SOW fully executed via Adobe Acrobat Sign. Tyler authorized to begin transition activities. W-9 still required before first 1099 payment.", impactType: "positive" },
  { date: "Jun 28", event: "NFL invoice template + submission process confirmed", owner: "Tyler + Tye", impact: "Readiness check — no cash event", impactType: "neutral" },
  { date: "Jun 28", event: "83(b) election — certified mail DEADLINE", owner: "Tye + Counsel", impact: "PERMANENT QSBS loss if missed", impactType: "danger" },
  { date: "Jun 29", event: "Option A CONFIRMED — Sentrais Corp becomes direct employer (EIN 39-4510998 → 39-4645168)", owner: "Tyler Capson", impact: "ADP registration transfers from NOVATELabs EIN 39-4510998 to Sentrais Corp EIN 39-4645168. Tyler to coordinate ADP transfer with ADP this week to complete before Jul 1 payroll.", impactType: "positive" },
  { date: "Jun 29", event: "BGI BRIC scrub — Foundation Counsel removes all federal grant language", owner: "Foundation Counsel", impact: "Blocks IRS Form 1023 filing if not done — 3-6 month review at risk", impactType: "danger" },
  { date: "Jun 29", event: "AWS LOI — call with Carly Castiner; countersign before Jul 3", owner: "Tye", impact: "Blocks GenAIIC 4-week Bedrock sprint if LOI not in place by Jul 3", impactType: "danger" },
  { date: "Jun 29", event: "Kevin McCann GTM Playbook update (remove BRIC revenue, add NFL proof point)", owner: "Kevin McCann", impact: "No cash event — commercial narrative correction", impactType: "neutral" },
  { date: "Jun 30", event: "NFL GDA Go-Live confirmed + Q1 Invoice issued (SNT-NFL-2026-Q1)", owner: "Tye + Erin + SEG", impact: "+$475,000 AR created · Net-30 clock starts · cash expected ~Jul 30", impactType: "positive" },
  { date: "Jul 1", event: "ADP payroll cutover + BofA account controls configured", owner: "Tyler Capson", impact: "SOW executed Jun 26 — Tyler authorized. ADP EIN transfer (39-4510998 → 39-4645168) in progress under Option A.", impactType: "neutral" },
  { date: "Jul 1",  event: "NetSuite reconciliation confirmed as system of record", owner: "Tyler Capson", impact: "Must be clean before Jul 1 system changeover", impactType: "neutral" },
  { date: "Jul 3",  event: "AWS GenAIIC 4-week Bedrock hardening sprint begins", owner: "Tye / Carly Castiner", impact: "LOI must be countersigned — sprint cannot start without it", impactType: "neutral" },
  { date: "Jul 6-7", event: "SimpliMeta settlement wire", owner: "Tye + Counsel", impact: "–$11,850 · Execute per clean draft ACH/wire · Do NOT pay early", impactType: "outflow" },
  { date: "Jul 7",  event: "SEG/Knox settlement", owner: "Tye + Counsel", impact: "Amount TBD per counsel-approved terms · Separate from SimpliMeta · Separate counsel sign-off required", impactType: "outflow" },
  { date: "Jul 7",  event: "SAM.gov / UEI update — submit legal name update + revalidate UEI record", owner: "Tyler Capson", impact: "Federal registration must be active for any federal-adjacent contracts or grants. Tyler to confirm submission and provide status documentation.", impactType: "neutral" },
  { date: "Jul 15", event: "Finance Operations Transition Report (SOW deliverable)", owner: "Tyler Capson", impact: "Written onboarding summary: AP, AR, payroll, banking governance responsibilities assumed · open risks · pending dependencies · next steps. Required per executed SOW.", impactType: "neutral" },
  { date: "Jul 15", event: "SOW step-down: execute Sentrais Corp SOW with Tyler — then terminate NOVATELabs SOW", owner: "Tye + Chanise", impact: "Sentrais Corp SOW effective date = ADP transfer completion. NOVATELabs SOW must remain active until Sentrais Corp SOW is confirmed live. Do not terminate NOVATELabs SOW first.", impactType: "neutral" },
  { date: "~Jul 30", event: "NFL Q1 payment clears bank", owner: "Tyler Capson", impact: "+$475,000 cash received · SEG Q1 disbursement ($332,500) released from Account 1040", impactType: "positive" },
];

// ── Scenario data ─────────────────────────────────────────────────────────────

const SCENARIOS = {
  base: {
    label: "Base case — NFL closes + SEG 30/70",
    inflow: 855000,
    retained: 256000,
    net: "Populate AP outflows",
    netColor: "text-muted-foreground",
    confidence: { nfl: 85, diagnose: 70 },
    months: [
      {
        period: "Jun 15 – Jul 14",
        netLabel: "+$475K in",
        netColor: "text-green-400",
        inflows: [
          { label: "NFL contract execution (invoice Jun 30)", amount: 475000, flag: "locked" },
          { label: "Other services / retainers", amount: null },
        ],
        outflows: [
          { label: "SimpliMeta settlement (Jul 6-7)", amount: -11850, flag: "locked" },
          { label: "SEG/Knox Phillips settlement (Jul 7)", amount: null, flag: "watch" },
          { label: "SEG Q1 disbursement — HELD in Acct 1040", amount: 0, flag: "watch" },
          { label: "Qubika build team invoice", amount: null },
          { label: "Core team payroll (Jul 1)", amount: null },
          { label: "Tyler Capson retainer (Sentrais Corp — Option A)", amount: null },
          { label: "Other fractional retainers", amount: null },
          { label: "AWS / infrastructure", amount: null },
        ],
        retained: 142500,
        note: "NFL cash receipt ~Jul 30 (Net-30). SEG Q1 disbursement ($332,500) held in Account 1040 and released only after NFL payment clears.",
      },
      {
        period: "Jul 15 – Aug 14",
        netLabel: "$380K milestone",
        netColor: "text-amber-400",
        inflows: [
          { label: "NFL Diagnose complete (Gate 2)", amount: 380000, flag: "conditional" },
          { label: "Other services", amount: null },
        ],
        outflows: [
          { label: "SEG Q1 disbursement released (~Jul 30)", amount: -332500, flag: "watch" },
          { label: "SEG milestone disbursement (70% of Gate 2)", amount: -266000 },
          { label: "Core team payroll (Aug 1)", amount: null },
          { label: "Fractional retainers", amount: null },
          { label: "GenAIIC sprint (AWS, Jul 3 start)", amount: null },
        ],
        retained: 114000,
        note: "SEG Q1 disbursement releases here once NFL payment clears ~Jul 30.",
      },
      {
        period: "Aug 15 – Sep 15",
        netLabel: "$380K milestone",
        netColor: "text-amber-400",
        inflows: [
          { label: "NFL Design complete (Gate 3)", amount: 380000, flag: "conditional" },
          { label: "NFL preseason POC revenue (Aug)", amount: null },
        ],
        outflows: [
          { label: "SEG milestone disbursement (70% of Gate 3)", amount: -266000 },
          { label: "Core team payroll (Sep 1)", amount: null },
          { label: "Fractional retainers", amount: null },
          { label: "Platform / SaaS overhead", amount: null },
        ],
        retained: 114000,
        note: null,
      },
    ],
    chartColors: ["#185FA5", "#378ADD", "#85B7EB"],
  },
  delay: {
    label: "Delay case — NFL payment 45 days late",
    inflow: 475000,
    retained: 142000,
    net: "Cash gap risk — Month 1 zero",
    netColor: "text-red-400",
    confidence: { nfl: 40, diagnose: 40 },
    months: [
      {
        period: "Jun 15 – Jul 14",
        netLabel: "⚠ No NFL cash yet",
        netColor: "text-red-400",
        inflows: [
          { label: "NFL contract execution (delayed 45d)", amount: 0, flag: "watch" },
        ],
        outflows: [
          { label: "SimpliMeta settlement (Jul 6-7)", amount: -11850, flag: "locked" },
          { label: "SEG/Knox Phillips settlement (Jul 7)", amount: null, flag: "watch" },
          { label: "Core team payroll (Jul 1)", amount: null },
          { label: "Fractional retainers", amount: null },
        ],
        retained: 0,
        note: "Highest liquidity risk: SimpliMeta + SEG/Knox + payroll obligations hit before any NFL cash arrives.",
      },
      {
        period: "Jul 15 – Aug 14",
        netLabel: "+$475K (late)",
        netColor: "text-amber-400",
        inflows: [
          { label: "NFL contract execution (late receipt)", amount: 475000, flag: "watch" },
        ],
        outflows: [
          { label: "SEG Q1 disbursement released from Acct 1040", amount: -332500 },
          { label: "Core team payroll (Aug 1)", amount: null },
          { label: "Fractional retainers", amount: null },
        ],
        retained: 142500,
        note: null,
      },
      {
        period: "Aug 15 – Sep 15",
        netLabel: "$380K milestone",
        netColor: "text-amber-400",
        inflows: [
          { label: "NFL Design complete (Gate 3)", amount: 380000, flag: "conditional" },
        ],
        outflows: [
          { label: "SEG milestone disbursement (70% of Gate 3)", amount: -266000 },
          { label: "Core team payroll (Sep 1)", amount: null },
        ],
        retained: 114000,
        note: null,
      },
    ],
    chartColors: ["#E24B4A", "#F09595", "#85B7EB"],
  },
  clean: {
    label: "Best case — NFL full + no SEG split",
    inflow: 1235000,
    retained: 1235000,
    net: "Strong position",
    netColor: "text-green-400",
    confidence: { nfl: 95, diagnose: 80 },
    months: [
      {
        period: "Jun 15 – Jul 14",
        netLabel: "+$475K full",
        netColor: "text-green-400",
        inflows: [
          { label: "NFL contract execution (invoice Jun 30)", amount: 475000, flag: "locked" },
        ],
        outflows: [
          { label: "SimpliMeta settlement (Jul 6-7)", amount: -11850, flag: "locked" },
          { label: "SEG/Knox Phillips settlement (Jul 7)", amount: null, flag: "watch" },
          { label: "SEG split — no split applied", amount: 0, flag: "locked" },
          { label: "Core team payroll (Jul 1)", amount: null },
          { label: "Fractional retainers", amount: null },
        ],
        retained: 475000,
        note: null,
      },
      {
        period: "Jul 15 – Aug 14",
        netLabel: "+$380K full",
        netColor: "text-green-400",
        inflows: [
          { label: "NFL Diagnose complete (Gate 2)", amount: 380000, flag: "conditional" },
        ],
        outflows: [
          { label: "SEG split — no split applied", amount: 0 },
          { label: "Core team payroll (Aug 1)", amount: null },
        ],
        retained: 380000,
        note: null,
      },
      {
        period: "Aug 15 – Sep 15",
        netLabel: "+$380K full",
        netColor: "text-green-400",
        inflows: [
          { label: "NFL Design complete (Gate 3)", amount: 380000, flag: "conditional" },
        ],
        outflows: [
          { label: "SEG split — no split applied", amount: 0 },
          { label: "Core team payroll (Sep 1)", amount: null },
        ],
        retained: 380000,
        note: null,
      },
    ],
    chartColors: ["#0F6E56", "#1D9E75", "#5DCAA5"],
  },
} as const;

type ScenarioKey = keyof typeof SCENARIOS;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number | null, sign = false): string {
  if (n === null) return "[TBD]";
  if (n === 0) return "$0";
  const prefix = sign && n > 0 ? "+" : n < 0 ? "–" : "";
  return `${prefix}$${Math.abs(n).toLocaleString()}`;
}

function FlagPill({ flag }: { flag?: string }) {
  if (!flag) return null;
  const styles: Record<string, string> = {
    locked:     "bg-green-500/10 text-green-400 border-green-500/20",
    watch:      "bg-red-500/10 text-red-400 border-red-500/20",
    conditional:"bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  const labels: Record<string, string> = { locked: "locked", watch: "watch", conditional: "conditional" };
  return (
    <span className={`inline-flex items-center px-1.5 py-0 rounded text-[9px] font-medium border ml-1 ${styles[flag] ?? ""}`}>
      {labels[flag] ?? flag}
    </span>
  );
}

function ConfidenceBar({ label, pct, color, note }: { label: string; pct: number; color: string; note?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground min-w-[160px]">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold min-w-[34px] text-right" style={{ color }}>{pct}%</span>
      {note && <span className="text-[10px] text-muted-foreground italic min-w-[120px]">{note}</span>}
    </div>
  );
}

const IMPACT_COLORS: Record<string, string> = {
  positive: "text-green-400",
  outflow:  "text-red-400",
  danger:   "text-red-400 font-semibold",
  neutral:  "text-muted-foreground",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CashflowPage() {
  const [scenario, setScenario] = useState<ScenarioKey>("base");
  const [showCalendar, setShowCalendar] = useState(true);
  const s = SCENARIOS[scenario];

  const chartData = s.months.map((m, i) => ({
    name: m.period.split("–")[0].trim(),
    retained: s.months[i].retained / 1000,
  }));

  const totalRetained = s.months.reduce((acc, m) => acc + m.retained, 0);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="90-Day Cash Flow Runway"
        subtitle="Jun 15 – Sep 15, 2026 · NFL milestone inflows · SEG 30/70 split · v2.1 — updated Jun 29"
      />

      <div className="flex-1 p-6 space-y-5 overflow-y-auto">

        {/* 14-day directive banner */}
        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs text-amber-400">
          <span className="font-semibold">14-Day Cash Directive (SNT-CASH-DIRECTIVE-2026-v1.0 · Jun 29 update):</span> NFL Go-Live TOMORROW Jun 30 — $475K Q1 invoice trigger. Cash receipt ~Jul 30 (Net-30). Hold operating liquidity: SimpliMeta $11,850 on Jul 6-7, SEG/Knox on Jul 7 (separate transactions, separate counsel confirmations). Do NOT spend ahead of NFL receipt. SEG Q1 disbursement held in Account 1040 until NFL payment clears. <span className="font-semibold text-red-400">OPEN BLOCKERS: Tyler Capson SOW unsigned · BGI BRIC scrub not done · AWS LOI must countersign before Jul 3 GenAIIC sprint.</span>
        </div>

        {/* Scenario selector */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(SCENARIOS) as ScenarioKey[]).map(key => (
            <button
              key={key}
              onClick={() => setScenario(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                scenario === key
                  ? "border-[#0EA5E9]/50 bg-[#0EA5E9]/10 text-[#0EA5E9]"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {SCENARIOS[key].label}
            </button>
          ))}
        </div>

        {/* Summary metrics */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total Inflows (90d)", value: `$${(s.inflow / 1000).toFixed(0)}K`, sub: "NFL contract + milestones", color: "text-green-400", icon: TrendingUp },
            { label: "Known Outflows", value: "–$11,850+", sub: "SimpliMeta locked · AP TBD", color: "text-red-400", icon: AlertTriangle },
            { label: "Net Position (90d)", value: s.net, sub: "Before opening balance", color: s.netColor, icon: Clock },
            { label: "Retained (post-SEG, NFL only)", value: `$${(totalRetained / 1000).toFixed(0)}K`, sub: "Sentrais 30% of NFL milestones", color: "text-[#0EA5E9]", icon: Lock },
          ].map(({ label, value, sub, color, icon: Icon }) => (
            <Card key={label} className="border-border">
              <CardContent className="p-4 flex items-start gap-3">
                <Icon size={15} className={`mt-0.5 shrink-0 ${color}`} />
                <div>
                  <div className={`text-lg font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Confidence bars */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inflow Confidence — by source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ConfidenceBar label="NFL contract execution" pct={s.confidence.nfl} color="#185FA5" />
            <ConfidenceBar label="NFL Diagnose milestone (Gate 2)" pct={s.confidence.diagnose} color="#378ADD" />
            <ConfidenceBar label="Other services / retainers" pct={40} color="#888780" />
            <ConfidenceBar label="BRIC — next cycle only" pct={0} color="#475569" note="Not a 90-day inflow · awareness→pilot→FY2026-27" />
          </CardContent>
        </Card>

        {/* Month cards */}
        <div className="grid grid-cols-3 gap-4">
          {s.months.map((m, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-baseline justify-between">
                  <CardTitle className="text-xs">{m.period}</CardTitle>
                  <span className={`text-xs font-semibold ${m.netColor}`}>{m.netLabel}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider pt-1 pb-0.5">Inflows</div>
                {m.inflows.map((row, j) => (
                  <div key={j} className="flex items-baseline justify-between text-xs py-1 border-b border-border last:border-0">
                    <span className="text-muted-foreground leading-snug max-w-[55%]">
                      {row.label}
                      {"flag" in row && <FlagPill flag={row.flag} />}
                    </span>
                    <span className={`font-mono font-medium shrink-0 ${row.amount !== null && row.amount > 0 ? "text-green-400" : row.amount === 0 ? "text-muted-foreground" : "text-muted-foreground/50 italic"}`}>
                      {fmt(row.amount ?? null, true)}
                    </span>
                  </div>
                ))}
                <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider pt-2 pb-0.5">Outflows</div>
                {m.outflows.map((row, j) => (
                  <div key={j} className="flex items-baseline justify-between text-xs py-1 border-b border-border last:border-0">
                    <span className="text-muted-foreground leading-snug max-w-[55%]">
                      {row.label}
                      {"flag" in row && <FlagPill flag={row.flag} />}
                    </span>
                    <span className={`font-mono font-medium shrink-0 ${row.amount !== null && row.amount < 0 ? "text-red-400" : row.amount === 0 ? "text-muted-foreground/40" : "text-muted-foreground/50 italic"}`}>
                      {fmt(row.amount ?? null)}
                    </span>
                  </div>
                ))}
                <div className="flex items-baseline justify-between text-xs pt-2 border-t border-border mt-1">
                  <span className="text-muted-foreground font-medium">Sentrais retained (NFL 30%)</span>
                  <span className={`font-mono font-bold ${m.retained > 0 ? "text-[#0EA5E9]" : "text-muted-foreground"}`}>
                    {fmt(m.retained, true)}
                  </span>
                </div>
                {"note" in m && m.note && (
                  <div className="text-[10px] text-amber-400/80 italic pt-1 leading-snug">{m.note}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Waterfall chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Retained cash by period — NFL inflows only, before G&A and settlements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={60}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
                <Tooltip
                  contentStyle={{ background: "hsl(217,43%,15%)", border: "1px solid hsl(215,35%,22%)", borderRadius: 6, fontSize: 11 }}
                  formatter={(v: number) => [`$${v}K retained (NFL only, before G&A)`, ""]}
                />
                <Bar dataKey="retained" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={s.chartColors[i] ?? s.chartColors[0]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 30-day cash calendar */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                30-Day Cash Calendar (Jun 17 – Jul 30)
              </CardTitle>
              <button
                onClick={() => setShowCalendar(v => !v)}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCalendar ? "Collapse" : "Expand"}
              </button>
            </div>
          </CardHeader>
          {showCalendar && (
            <CardContent className="pt-0">
              <div className="space-y-0">
                {CASH_CALENDAR.map((row, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
                    <span className="text-[10px] font-mono text-muted-foreground min-w-[52px] mt-0.5 shrink-0">{row.date}</span>
                    <div className="flex-1">
                      <div className="text-xs text-foreground leading-snug">{row.event}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{row.owner}</div>
                    </div>
                    <span className={`text-[10px] text-right max-w-[200px] leading-snug shrink-0 ${IMPACT_COLORS[row.impactType] ?? "text-muted-foreground"}`}>
                      {row.impact}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Notes */}
        <div className="p-4 rounded-lg border border-border bg-card text-xs text-muted-foreground leading-relaxed space-y-2">
          <p>
            <span className="font-semibold text-foreground">SEG disbursement structure:</span> Under the 30/70 subcontractor structure, Sentrais retains 30% of NFL platform revenue. The SEG Q1 disbursement ($332,500) is held in Account 1040 and released only after the $475K NFL payment clears (~Jul 30). Do not release early. Gate 2 and Gate 3 SEG disbursements follow the same hold-and-release pattern.
          </p>
          <p>
            <span className="font-semibold text-foreground">BRIC posture (v2.0 — Jun 17, 2026):</span> BRIC is not a 90-day revenue event. July 23, 2026 is not a target this cycle — state pre-application gates closed in spring. The correct posture is Awareness → Pilot → Position for FY2026-27. BRIC does not appear as a cash inflow in any scenario. Any future BRIC-adjacent revenue attaches inside awarded jurisdiction infrastructure projects through management costs and infrastructure-tied capability-building — never as a standalone Sentrais line item.
          </p>
          <p>
            <span className="font-semibold text-foreground">Vendor routing:</span> Route outstanding engineering and software vendor invoices through GreenPages catalog where possible. Do not draw from core operating cash for vendor invoices until NFL payment clears ~Jul 30. Tyler Capson (Fractional CFO) builds AP/Outflows schema as Day 1 task once SOW is executed. Option A CONFIRMED (Jun 29): Tyler&apos;s retainer routes through Sentrais Corp (EIN 39-4645168). ADP registration transfer from NOVATELabs EIN 39-4510998 in progress — Tyler coordinating with ADP this week.
          </p>
        </div>

        {/* Assumptions */}
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Key Assumptions & Flags</div>
          <div className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
            {[
              { flag: "locked",      text: "NFL Year 1 total: $1,900,000 · Contract execution payment: $475,000 upon signing · Net-30 from invoice date per Schedule D §4.3 · Invoice trigger: Jun 30 go-live confirmation" },
              { flag: "locked",      text: "SimpliMeta settlement: $11,850 due Jul 6-7 · Execute ACH/wire per clean draft · Do not pay early — hold liquidity through Jul 1 payroll transition" },
              { flag: "watch",       text: "SEG/Knox Phillips settlement: amount TBD per counsel-approved terms · Due Jul 7 · Separate transaction from SimpliMeta — do not combine · Separate counsel confirmation required" },
              { flag: "watch",       text: "SEG Q1 disbursement ($332,500) held in Account 1040 — released only after NFL payment clears ~Jul 30. Do not release early." },
              { flag: "watch",       text: "Gate 2 (Diagnose, $380K) conditional on Week 7 completion — slippage delays cash 1-4 weeks" },
              { flag: "watch",       text: "Gate 3 (Design, $380K) conditional on Week 12 — assumes on-schedule Qubika delivery" },
              { flag: "watch",       text: "AP outflow rows (payroll, retainers, vendor bills) are TBD — runway incomplete until Tyler Capson builds AP schema post-SOW" },
              { flag: "conditional", text: "BGI $50,000 account is FROZEN — not operating capital. Do not access until EIN + formation complete." },
              { flag: "conditional", text: "BRIC is next-cycle positioning only (FY2026-27). Not modeled as a 90-day inflow in any scenario." },
              { flag: "conditional", text: "Opening cash balance not modeled — add current NOVATELabs bank balance to get true net position" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <FlagPill flag={a.flag} />
                <span>{a.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

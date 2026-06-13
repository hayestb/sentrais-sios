// @ts-nocheck
import { useState } from "react";
import { Lock, AlertTriangle, TrendingUp, DollarSign, Star, Zap, Shield, Clock } from "lucide-react";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody, ForgeLabel,
  ForgeBadge, ForgeAlert, ForgeGrid, C,
} from "../components/ui/forge";

const LEARNING_MODE = {
  base: "$140,000",
  period: "May 2026 – November 30, 2026",
  gateDate: "December 1, 2026",
  rationale: "Uniform base across all roles during the Learning Mode period. This creates a level field for performance assessment before role-differentiated compensation activates.",
  rules: [
    "All full-time roles receive identical $140K annualized base during Learning Mode",
    "No commission or variable pay paid against individual quotas during this period",
    "Performance tracked in shadow mode — data captured but not yet compensated",
    "Gate Date is hard: Dec 1, 2026. No extension without written board consent",
    "Any new hire joining before Gate Date enters at Learning Mode rate regardless of role",
  ],
};

const POST_GATE_BANDS = [
  {
    role: "Chief Executive Officer",
    base: "$275,000",
    trigger: "Post–Series A close",
    note: "Activates upon Series A funding close. Retains milestone bonus eligibility.",
    color: C.accent,
    equity: "Separate equity ratchet — see Equity tab",
  },
  {
    role: "C-Suite (COO / CFO / CTO / CMO)",
    base: "$250,000",
    trigger: "Gate Date (Dec 1, 2026)",
    note: "Role-differentiated post-gate. All C-suite roles normalized at this band initially.",
    color: C.teal,
    equity: "Standard executive equity grant",
  },
  {
    role: "Enabler Layer (VPs / Directors)",
    base: "$200,000",
    trigger: "Gate Date (Dec 1, 2026)",
    note: "Senior individual contributors and department heads activate at this band.",
    color: C.purple,
    equity: "Director-level equity grant",
  },
  {
    role: "Zoie (Designated Role)",
    base: "$140,000",
    trigger: "Gate Date (Dec 1, 2026)",
    note: "Continues at Learning Mode rate post-gate. Subject to separate review.",
    color: "#64748b",
    equity: "TBD per separate agreement",
  },
];

const EQUITY_RATCHET = {
  trigger: "100% of individual performance metrics at Gate Date",
  increment: "+25% equity acceleration",
  description: "At Gate Date, any executive who has hit 100% of their assigned performance metrics receives a +25% acceleration on their vesting schedule. This is a one-time ratchet, not recurring.",
  metrics: [
    "Revenue targets (pod-attributed ARR)",
    "Pipeline generation (segment-specific)",
    "Retention metrics (NRR for CS roles)",
    "Strategic milestones (board-approved OKRs)",
  ],
  notes: [
    "Ratchet is calculated against the unvested equity balance as of Gate Date",
    "Clawback: 24-month cliff applies to ratcheted acceleration tranche",
    "Partial credit: 90%–99% achievement = 50% of ratchet value",
    "Below 90% achievement = no ratchet, standard vesting continues",
  ],
};

const DEAL_CLOSE_TIERS = [
  {
    tier: "Tier 1",
    range: "Deals ≤ $50,000",
    commission: "Uncapped — standard rate",
    color: C.green,
    note: "Volume-focused deals. Standard commission rate applies with no ceiling.",
  },
  {
    tier: "Tier 2",
    range: "$50,001 – $250,000",
    commission: "Uncapped — elevated rate",
    color: C.teal,
    note: "Mid-market deals. Elevated commission rate activates at this threshold.",
  },
  {
    tier: "Tier 3",
    range: "$250,001 – $1,000,000",
    commission: "Uncapped — enterprise rate",
    color: C.accent,
    note: "Enterprise deals. Enterprise commission rate. CEO sign-off required at close.",
  },
  {
    tier: "Tier 4",
    range: "Deals > $1,000,000",
    commission: "Uncapped — strategic rate",
    color: C.amber,
    note: "Strategic / landmark deals. Board visibility required. Special incentive triggers may apply.",
  },
];

const CEO_MILESTONES = [
  {
    milestone: "Series A Close",
    bonus: "$150,000",
    trigger: "Executed term sheet + first tranche received",
    color: C.accent,
    cumulative: "$150,000",
  },
  {
    milestone: "First Anchor Partner Signed",
    bonus: "$75,000",
    trigger: "Executed MSA with Tier 1 anchor partner (Live Nation, NFL franchise, or equivalent)",
    color: C.teal,
    cumulative: "$225,000",
  },
  {
    milestone: "$5M ARR",
    bonus: "$75,000",
    trigger: "Trailing 90-day ARR run rate reaches $5M",
    color: C.purple,
    cumulative: "$300,000",
  },
  {
    milestone: "Series B / Growth Round",
    bonus: "$50,000",
    trigger: "Executed term sheet + first tranche received",
    color: C.amber,
    cumulative: "$350,000",
  },
];

const KNOX_SEG = {
  structure: "Knox / SEG Sports Entertainment Group",
  classification: "PRIVILEGED & CONFIDENTIAL — CEO + Legal Counsel only",
  terms: [
    { label: "Revenue Share", value: "70% of NFL contract revenue", detail: "Knox receives 70% of all revenue generated under NFL-contracted engagements. Sentrais retains 30%." },
    { label: "Quarterly Payout", value: "$332,500 / quarter", detail: "Guaranteed quarterly payout to Knox/SEG. Payable within 15 days of quarter-close." },
    { label: "Liquidated Damages", value: "$10,000 / day late", detail: "If quarterly payment is not made within 15 days of quarter-close, LD of $10K/day accrues from day 16." },
    { label: "Step-In Rights", value: "Activated at 2× missed payments", detail: "Knox/SEG may exercise Step-In Rights and assume operational control of the relevant contract upon 2 consecutive missed payments." },
    { label: "Call Option", value: "2× trailing 6-month revenue", detail: "Knox/SEG holds a call option to acquire the NFL contract portfolio at 2× the trailing 6-month revenue. Option window: [per separate agreement]." },
  ],
  alert: "This section is restricted to CEO and Legal Counsel. Do not distribute, share screen, or include in board decks without explicit written authorization.",
};

const TABS = [
  { id: "learning", label: "Learning Mode" },
  { id: "postgateex", label: "Post-Gate Bands" },
  { id: "equity", label: "Equity Ratchet" },
  { id: "dealclose", label: "Deal-Close Tiers" },
  { id: "milestones", label: "CEO Milestones" },
  { id: "knox", label: "Knox / SEG Terms" },
];

export default function ExecCompensation() {
  const [tab, setTab] = useState("learning");

  return (
    <ForgePage>
      <ForgeHeader
        title="Executive Compensation"
        subtitle="Performance Execution Plan — Sentrais Leadership"
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ForgeBadge variant="danger" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Lock size={10} /> PRIVILEGED & CONFIDENTIAL
            </ForgeBadge>
            <ForgeBadge style={{ background: `${C.amber}22`, color: C.amber }}>CEO + Legal Counsel Only</ForgeBadge>
          </div>
        }
      />

      <ForgeAlert level="error">
        <strong>Access Restriction:</strong> This page contains privileged and confidential compensation terms. Access is restricted to the CEO and Legal Counsel. Do not distribute, screenshot, or include in board presentations without explicit written authorization.
      </ForgeAlert>

      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />

      <ForgeContent>

        {/* LEARNING MODE */}
        {tab === "learning" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeCard style={{ borderLeft: `3px solid ${C.accent}` }}>
              <ForgeCardHeader title="Learning Mode — Uniform Base Period" />
              <ForgeCardBody>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 20 }}>
                  <div style={{ textAlign: "center", padding: "16px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: C.accent }}>{LEARNING_MODE.base}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Uniform Annual Base</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>All roles, all levels</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "16px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.teal }}>{LEARNING_MODE.period}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Active Period</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "16px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.amber}` }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: C.amber }}>{LEARNING_MODE.gateDate}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Gate Date — Hard Cutover</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>Post-gate bands activate</div>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <ForgeLabel>Rationale</ForgeLabel>
                  <div style={{ fontSize: 13, color: C.textMuted, marginTop: 6, lineHeight: 1.6 }}>{LEARNING_MODE.rationale}</div>
                </div>

                <ForgeLabel>Operating Rules</ForgeLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {LEARNING_MODE.rules.map((rule, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "10px 12px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}` }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${C.accent}22`, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <span style={{ fontSize: 13, color: C.text }}>{rule}</span>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>

            <ForgeCard>
              <ForgeCardHeader title="Timeline" />
              <ForgeCardBody>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
                  {[
                    { date: "May 2026", event: "Learning Mode Begins", detail: "$140K uniform base active", color: C.accent },
                    { date: "Nov 30, 2026", event: "Learning Mode Closes", detail: "Shadow performance data locked", color: C.teal },
                    { date: "Dec 1, 2026", event: "Gate Date", detail: "Post-gate comp bands activate", color: C.amber },
                    { date: "Post–Series A", event: "CEO Band Activates", detail: "$275K + milestone bonuses", color: C.purple },
                  ].map((item, i, arr) => (
                    <div key={item.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
                        <div style={{ flex: i === 0 ? "0 0 50%" : 1, height: 2, background: i === 0 ? "transparent" : C.border }} />
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                        <div style={{ flex: i === arr.length - 1 ? "0 0 50%" : 1, height: 2, background: i === arr.length - 1 ? "transparent" : C.border }} />
                      </div>
                      <div style={{ textAlign: "center", marginTop: 10, padding: "0 4px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: item.color }}>{item.date}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginTop: 3 }}>{item.event}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

        {/* POST-GATE BANDS */}
        {tab === "postgateex" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ForgeAlert level="info">
              Post-gate compensation bands activate December 1, 2026 (CEO band activates upon Series A close). All figures are annual base. Variable/commission is additive via the Universal Deal-Close Clause.
            </ForgeAlert>

            {POST_GATE_BANDS.map(band => (
              <ForgeCard key={band.role} style={{ borderLeft: `3px solid ${band.color}` }}>
                <ForgeCardBody>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>{band.role}</div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>{band.note}</div>
                      <div style={{ fontSize: 12, color: band.color }}>{band.equity}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: band.color }}>{band.base}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>Annual Base</div>
                      <div style={{ marginTop: 8 }}>
                        <ForgeBadge style={{ background: `${band.color}22`, color: band.color }}>{band.trigger}</ForgeBadge>
                      </div>
                    </div>
                  </div>
                </ForgeCardBody>
              </ForgeCard>
            ))}

            <ForgeCard>
              <ForgeCardHeader title="Band Comparison" />
              <ForgeCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {POST_GATE_BANDS.map(band => (
                    <div key={band.role} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 200, fontSize: 12, color: C.textMuted, flexShrink: 0 }}>{band.role}</div>
                      <div style={{ flex: 1, height: 10, background: C.border, borderRadius: 5 }}>
                        <div style={{
                          height: 10, borderRadius: 5, background: band.color,
                          width: `${(parseInt(band.base.replace(/\D/g, "")) / 275000) * 100}%`,
                        }} />
                      </div>
                      <div style={{ width: 80, fontSize: 13, fontWeight: 700, color: band.color, textAlign: "right", flexShrink: 0 }}>{band.base}</div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

        {/* EQUITY RATCHET */}
        {tab === "equity" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeCard style={{ borderTop: `3px solid ${C.accent}` }}>
              <ForgeCardHeader title="Equity Acceleration Ratchet" />
              <ForgeCardBody>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div style={{ textAlign: "center", padding: 20, background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: C.accent }}>+25%</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 6 }}>Equity Acceleration</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Trigger: 100% of performance metrics at Gate Date</div>
                  </div>
                  <div style={{ padding: "10px 0" }}>
                    <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>{EQUITY_RATCHET.description}</div>
                  </div>
                </div>
              </ForgeCardBody>
            </ForgeCard>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <ForgeCard>
                <ForgeCardHeader title="Performance Metrics (Ratchet Qualifying)" />
                <ForgeCardBody>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {EQUITY_RATCHET.metrics.map(m => (
                      <div key={m} style={{ display: "flex", gap: 10, padding: "8px 10px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}` }}>
                        <Star size={13} style={{ color: C.accent, flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 13, color: C.text }}>{m}</span>
                      </div>
                    ))}
                  </div>
                </ForgeCardBody>
              </ForgeCard>

              <ForgeCard>
                <ForgeCardHeader title="Ratchet Rules & Clawback" />
                <ForgeCardBody>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {EQUITY_RATCHET.notes.map((n, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, padding: "8px 10px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}` }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${C.teal}22`, color: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                        <span style={{ fontSize: 12, color: C.textMuted }}>{n}</span>
                      </div>
                    ))}
                  </div>
                </ForgeCardBody>
              </ForgeCard>
            </div>

            <ForgeCard>
              <ForgeCardHeader title="Achievement → Ratchet Outcome" />
              <ForgeCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { range: "100%+", outcome: "+25% equity acceleration", color: C.green, note: "Full ratchet — applied to unvested balance" },
                    { range: "90% – 99%", outcome: "+12.5% equity acceleration", color: C.teal, note: "Partial ratchet — 50% of full value" },
                    { range: "Below 90%", outcome: "No ratchet", color: C.red, note: "Standard vesting continues unchanged" },
                  ].map(row => (
                    <div key={row.range} style={{ display: "flex", gap: 16, padding: "12px 16px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, borderLeft: `3px solid ${row.color}` }}>
                      <div style={{ width: 100, flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.range}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{row.outcome}</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{row.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

        {/* DEAL-CLOSE TIERS */}
        {tab === "dealclose" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeAlert level="info">
              The Universal Deal-Close Clause applies to any team member who closes revenue regardless of role. Commissions are uncapped across all tiers. Rates are defined per role in the compensation agreement.
            </ForgeAlert>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {DEAL_CLOSE_TIERS.map(tier => (
                <ForgeCard key={tier.tier} style={{ borderTop: `3px solid ${tier.color}` }}>
                  <ForgeCardBody>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: tier.color }}>{tier.tier}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 4 }}>{tier.range}</div>
                      </div>
                      <ForgeBadge style={{ background: `${tier.color}22`, color: tier.color }}>Uncapped</ForgeBadge>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>{tier.commission}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{tier.note}</div>
                  </ForgeCardBody>
                </ForgeCard>
              ))}
            </div>

            <ForgeCard>
              <ForgeCardHeader title="Tier Escalation Map" />
              <ForgeCardBody>
                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  {DEAL_CLOSE_TIERS.map((tier, i, arr) => (
                    <div key={tier.tier} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
                        <div style={{ flex: i === 0 ? "0 0 50%" : 1, height: 3, background: i === 0 ? "transparent" : C.border }} />
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: tier.color, flexShrink: 0 }} />
                        <div style={{ flex: i === arr.length - 1 ? "0 0 50%" : 1, height: 3, background: i === arr.length - 1 ? "transparent" : C.border }} />
                      </div>
                      <div style={{ textAlign: "center", marginTop: 10, padding: "0 4px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: tier.color }}>{tier.tier}</div>
                        <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{tier.range}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, padding: "12px 16px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.accent, marginBottom: 6 }}>Key Principle: Zero Ceiling</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>
                    No commission tier has a cap. High performers closing Tier 3 and Tier 4 deals earn proportionally higher rates with no ceiling. This is a deliberate design choice to drive enterprise deal velocity.
                  </div>
                </div>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

        {/* CEO MILESTONES */}
        {tab === "milestones" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeCard style={{ borderTop: `3px solid ${C.amber}` }}>
              <ForgeCardHeader
                title="CEO Milestone Bonus Structure"
                actions={
                  <div style={{ display: "flex", gap: 8 }}>
                    <ForgeBadge style={{ background: `${C.amber}22`, color: C.amber }}>$350,000 Total</ForgeBadge>
                    <ForgeBadge variant="danger">CEO Only</ForgeBadge>
                  </div>
                }
              />
              <ForgeCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {CEO_MILESTONES.map((m, i) => (
                    <div key={m.milestone} style={{
                      display: "flex", gap: 16, padding: "16px", borderRadius: 8,
                      background: C.bg, border: `1px solid ${C.border}`,
                      borderLeft: `3px solid ${m.color}`,
                    }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${m.color}22`, color: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{m.milestone}</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.bonus}</div>
                        </div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{m.trigger}</div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>
                          Cumulative upon this milestone: <span style={{ color: C.text, fontWeight: 600 }}>{m.cumulative}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 20, padding: "14px 16px", background: `${C.amber}11`, borderRadius: 8, border: `1px solid ${C.amber}44` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Total Milestone Bonus Ceiling</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: C.amber }}>$350,000</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>
                    Paid upon achievement of each milestone trigger. Not contingent on Gate Date. Bonuses are non-recoverable once milestone conditions are verified by the board.
                  </div>
                </div>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

        {/* KNOX / SEG TERMS */}
        {tab === "knox" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeAlert level="error">
              <strong>PRIVILEGED & CONFIDENTIAL — ATTORNEY-CLIENT PROTECTED:</strong> The Knox/SEG commercial terms below are restricted to CEO and Legal Counsel only. This tab must not be displayed in board presentations, investor decks, or any external communication. Unauthorized disclosure may trigger contractual liability.
            </ForgeAlert>

            <ForgeCard style={{ border: `1px solid ${C.red}44` }}>
              <ForgeCardHeader
                title="Knox / SEG — Sports Entertainment Group"
                actions={
                  <div style={{ display: "flex", gap: 8 }}>
                    <ForgeBadge variant="danger" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Lock size={10} /> Restricted
                    </ForgeBadge>
                  </div>
                }
              />
              <ForgeCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {KNOX_SEG.terms.map(term => (
                    <div key={term.label} style={{
                      display: "grid", gridTemplateColumns: "160px 1fr 1fr", gap: 16,
                      padding: "14px 16px", borderRadius: 8,
                      background: C.bg, border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted }}>{term.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.red }}>{term.value}</div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>{term.detail}</div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>

            <ForgeCard>
              <ForgeCardHeader title="Risk Summary" />
              <ForgeCardBody>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { label: "LD Exposure", value: "$10K/day", sub: "from day 16 of late payment", color: C.red, icon: AlertTriangle },
                    { label: "Step-In Trigger", value: "2 missed payments", sub: "Knox may assume operational control", color: C.amber, icon: Shield },
                    { label: "Call Option", value: "2× trailing 6-mo rev", sub: "NFL contract portfolio acquisition right", color: C.purple, icon: TrendingUp },
                  ].map(risk => (
                    <div key={risk.label} style={{
                      padding: "16px", borderRadius: 8, background: C.bg,
                      border: `1px solid ${C.border}`, borderTop: `3px solid ${risk.color}`,
                      textAlign: "center",
                    }}>
                      <risk.icon size={18} style={{ color: risk.color, marginBottom: 8 }} />
                      <div style={{ fontSize: 16, fontWeight: 800, color: risk.color }}>{risk.value}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginTop: 6 }}>{risk.label}</div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{risk.sub}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, padding: "12px 16px", background: `${C.red}11`, borderRadius: 8, border: `1px solid ${C.red}33` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.red, marginBottom: 4 }}>Anti-Fraud Payment Protocol</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>
                    New or changed Knox/SEG payee bank details must be independently verified by phone with a known Knox contact before any payment is processed. No exceptions. Written confirmation alone is insufficient — verbal verification required per Sentrais anti-fraud policy.
                  </div>
                </div>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

      </ForgeContent>
    </ForgePage>
  );
}

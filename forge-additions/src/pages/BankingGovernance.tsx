// @ts-nocheck
import { useState } from "react";
import { CreditCard, Plane, Receipt, Shield, Building2, CheckCircle2 } from "lucide-react";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody, ForgeLabel,
  ForgeBadge, ForgeAlert, ForgeGrid, C,
} from "../components/ui/forge";

const CARD_POLICY = {
  eligible: [
    { role: "CEO", limit: "$5,000 / mo", approver: "Board Chair", notes: "Business expenses only" },
    { role: "Finance Lead", limit: "$2,500 / mo", approver: "CEO", notes: "Ops & vendor payments" },
    { role: "Ops Lead", limit: "$1,000 / mo", approver: "Finance Lead", notes: "Day-to-day ops only" },
  ],
  podCards: [
    { role: "Pod Leader", platform: "Brex / Ramp", limit: "$2,500 / mo", costCenter: "Pod cost-center code", locks: "Merchant category locked to business travel, software, client meals" },
    { role: "Account Executive (AE)", platform: "Brex / Ramp", limit: "$1,000 / mo", costCenter: "Pod cost-center code", locks: "Client meals + travel only; no software purchases" },
    { role: "Customer Success Manager (CSM)", platform: "Brex / Ramp", limit: "$750 / mo", costCenter: "Pod cost-center code", locks: "Client meals + light travel only" },
  ],
  podCardRules: [
    "All pod smart cards issued via Brex or Ramp — never standard corporate card",
    "Each transaction auto-tagged to pod cost-center code in ERP (NetSuite)",
    "Receipt matching required within 48 hours via Brex/Ramp receipt upload",
    "Merchant category codes (MCC) locked per role — system rejects out-of-policy charges",
    "Pod Leader reviews all pod card activity weekly; Finance Lead reviews monthly",
    "BDRs and Marketers use expense reimbursement — no card issued",
    "No contractor cards under any circumstances",
  ],
  ineligible: [
    "All 1099 contractors — no exceptions",
    "Fellows and interns",
    "Advisors and board members",
    "Vendors with active MSA/SOW (use ACH/check)",
    "BDRs and Marketers — use expense reimbursement instead",
  ],
  prohibited: [
    "Personal expenses of any kind",
    "Cash advances or ATM withdrawals",
    "Political donations",
    "Gifts over $50 without prior CEO approval",
    "Alcohol without prior approval (client entertainment exception only)",
    "Any BGI-entity expenses on commercial cards",
  ],
  reconciliation: [
    "Receipts required for all charges ≥ $25",
    "Pod smart cards: receipt matching within 48 hrs in Brex/Ramp",
    "Monthly reconciliation by Finance Lead before 5th of following month",
    "Unreconciled charges after 30 days charged to employee",
  ],
};

const TRAVEL_POLICY = [
  {
    category: "Booking Platform", icon: "🖥",
    rules: [
      "All travel booked via Navan — centralized corporate booking platform",
      "Navan auto-enforces policy limits; out-of-policy bookings require manager approval",
      "Client-facing AEs and CSMs: Navan account required before any travel",
      "Self-booking outside Navan requires Finance Lead pre-approval and documentation",
    ],
  },
  {
    category: "Air Travel", icon: "✈",
    rules: [
      "Economy class for domestic flights under 4 hours — Navan enforces",
      "Business class requires CEO pre-approval (international or >6 hr domestic)",
      "Book at least 7 days in advance when possible",
      "All airfare charged to pod cost-center code",
    ],
  },
  {
    category: "Hotel", icon: "🏨",
    rules: [
      "Atlanta / Southeast: $250/night max",
      "NYC / SF / Boston / LA: $350/night max",
      "International: $300/night max",
      "Exceptions require Finance Lead pre-approval with justification",
    ],
  },
  {
    category: "Ground Transportation", icon: "🚗",
    rules: [
      "Rideshare (Uber/Lyft) preferred for trips under $75",
      "Rental car requires Finance Lead approval",
      "Personal vehicle: IRS standard mileage rate",
      "Parking receipts required for reimbursement",
    ],
  },
  {
    category: "Per Diem", icon: "🍽",
    rules: [
      "$75/day domestic (meals + incidentals)",
      "$100/day international",
      "No receipts required for per diem; must document city and dates",
      "Per diem reduces proportionally for partial travel days",
    ],
  },
  {
    category: "Client Entertainment", icon: "🤝",
    rules: [
      "Meals under $200: Pod Leader approval",
      "Events/meals $200–$500: Finance Lead approval",
      "Events/meals over $500: CEO approval required",
      "Document: business purpose, attendees, client affiliation",
      "No alcohol on NOVATELabs or BGI budget codes",
    ],
  },
];

const EXPENSE_RULES = [
  { rule: "Receipt threshold", detail: "Required for all expenses ≥ $25" },
  { rule: "Submission window", detail: "30 days from transaction date; late submissions may be denied. Pod smart card receipts: 48 hrs via Brex/Ramp." },
  { rule: "Reimbursement cycle", detail: "14 business days after approved submission" },
  { rule: "Pod cost-center tagging", detail: "Every expense must be tagged to pod cost-center code in ERP. Finance will reject untagged submissions." },
  { rule: "Pre-approval required", detail: "Any single expense > $500 requires Pod Leader pre-approval; > $5K requires Exec GTM; > $25K requires CFO" },
  { rule: "Client entertainment", detail: "Meals/events with clients: document business purpose, attendees, client affiliation. Pod Leader approves under $200; Finance Lead $200–$500; CEO above $500." },
  { rule: "Team building", detail: "Pod team-building events: $50/person max per quarter. Pod Leader approval required. No alcohol on NOVATELabs/BGI codes." },
  { rule: "Personal card policy", detail: "Employees may use personal cards and request reimbursement. Pod smart card holders should use their card." },
  { rule: "International expenses", detail: "Submit in local currency with conversion rate noted; USD equivalent required" },
  { rule: "Split expenses", detail: "Never split a single purchase to avoid approval thresholds" },
  { rule: "Denied expenses", detail: "Personal, luxury, or policy-violating expenses denied without exception; repeat violations escalated to CEO" },
];

const PAYMENT_GOVERNANCE = [
  { trigger: "New vendor first payment", approvers: "Finance Lead + CEO", tier: "NEW", level: "warning", notes: "W-9 required; MSA/SOW executed; phone verification of bank details mandatory" },
  { trigger: "Invoice ≤ $1,000", approvers: "Budget owner", tier: "T0", level: "neutral", notes: "Auto-pay eligible after 3 on-time payments" },
  { trigger: "Invoice $1,001–$10,000", approvers: "Finance Lead", tier: "T1", level: "neutral", notes: "3-way match required (PO + receipt + invoice)" },
  { trigger: "Invoice $10,001–$50,000", approvers: "CEO", tier: "T2", level: "info", notes: "Board notification if recurring" },
  { trigger: "Invoice $50,001–$150,000", approvers: "CEO + Finance Lead (wet ink dual)", tier: "T3", level: "warning", notes: "Board notice required" },
  { trigger: "Invoice > $150,000", approvers: "Board approval required", tier: "T4", level: "danger", notes: "48-hour notice to full board" },
  { trigger: "Related-party transaction", approvers: "Independent board member required", tier: "RPT", level: "danger", notes: "No self-approval; conflict of interest disclosure on file" },
];

const ENTITY_ACCOUNTS = [
  { entity: "Sentrais Corp", type: "Commercial Operating", bank: "TBD", color: C.accent, signatories: ["CEO (Knox Phillips)", "Finance Lead"], note: "Primary commercial operating account. IP royalty (10%) disbursed monthly to Sentrais IP LLC." },
  { entity: "NOVATELabs Inc", type: "Nonprofit Research", bank: "TBD", color: C.teal, signatories: ["CEO / Executive Director", "Finance Lead"], note: "Separate nonprofit account. Grant funds received and disbursed here. No commingling with Sentrais Corp." },
  { entity: "BGI — Barbara Geter Institute", type: "Pending EIN / 501(c)(3)", bank: "BLOCKED — EIN pending", color: C.amber, blocked: true, signatories: ["Independent BGI Board only"], note: "Account cannot be opened until EIN confirmed. Zero funds from or to any commercial entity. §4958 private inurement prohibition." },
  { entity: "Sentrais IP LLC", type: "IP Royalty Holding", bank: "TBD", color: C.purple, signatories: ["CEO", "Legal Counsel"], note: "Receives 10% royalty from Sentrais Corp and Platform revenue. Holds and licenses all registered IP." },
];

const TABS = [
  { id: "cards", label: "Card Policy", icon: CreditCard },
  { id: "travel", label: "Travel Policy", icon: Plane },
  { id: "expense", label: "Expense Rules", icon: Receipt },
  { id: "payments", label: "Payment Governance", icon: Shield },
  { id: "accounts", label: "Entity Accounts", icon: Building2 },
];

export default function BankingGovernance() {
  const [tab, setTab] = useState("cards");

  return (
    <ForgePage>
      <ForgeHeader
        icon={CreditCard}
        title="Banking & Payment Governance"
        subtitle="Card policy · Travel · Expense rules · Approval tiers · Entity accounts"
        stats={[
          { label: "Approval Tiers", value: "T0–T4", color: C.accent },
          { label: "Card Holders", value: 3, color: C.green },
          { label: "Entity Accounts", value: 4, color: C.teal },
        ]}
      />
      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />

      <ForgeContent>

        {tab === "cards" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ForgeAlert level="high">
              No contractor cards under any circumstances. All 1099 contractors, fellows, and advisors are ineligible regardless of role or seniority.
            </ForgeAlert>
            <ForgeCard>
              <ForgeCardHeader><ForgeLabel color={C.accent}>Pod Smart Cards — Brex / Ramp</ForgeLabel></ForgeCardHeader>
              <ForgeCardBody style={{ padding: 0 }}>
                {CARD_POLICY.podCards.map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 18px", borderBottom: i < CARD_POLICY.podCards.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{r.role}</span>
                        <ForgeBadge variant="info">{r.platform}</ForgeBadge>
                        <ForgeBadge variant="success">{r.limit}</ForgeBadge>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>Cost center: {r.costCenter}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>MCC locks: {r.locks}</div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "12px 18px", background: C.bg + "80", borderTop: `1px solid ${C.border}` }}>
                  {CARD_POLICY.podCardRules.map((rule, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, color: "#64748b", marginBottom: 5 }}>
                      <div style={{ width: 3, height: 3, borderRadius: "50%", background: C.accent, flexShrink: 0, marginTop: 5 }} />{rule}
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>
            <ForgeGrid cols={2} gap={16}>
              <ForgeCard>
                <ForgeCardHeader><ForgeLabel color={C.green}>Executive Cardholders</ForgeLabel></ForgeCardHeader>
                <ForgeCardBody style={{ padding: 0 }}>
                  {CARD_POLICY.eligible.map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 18px", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{r.role}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Approved by: {r.approver} · {r.notes}</div>
                      </div>
                      <ForgeBadge variant="success">{r.limit}</ForgeBadge>
                    </div>
                  ))}
                </ForgeCardBody>
              </ForgeCard>

              <ForgeCard>
                <ForgeCardHeader><ForgeLabel color={C.red}>Ineligible (No Card)</ForgeLabel></ForgeCardHeader>
                <ForgeCardBody>
                  {CARD_POLICY.ineligible.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: C.textSecondary, marginBottom: 8 }}>
                      <span style={{ color: C.red, flexShrink: 0 }}>✕</span>{item}
                    </div>
                  ))}
                </ForgeCardBody>
              </ForgeCard>

              <ForgeCard>
                <ForgeCardHeader><ForgeLabel color={C.red}>Prohibited Uses</ForgeLabel></ForgeCardHeader>
                <ForgeCardBody>
                  {CARD_POLICY.prohibited.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: C.textSecondary, marginBottom: 8 }}>
                      <span style={{ color: C.red, flexShrink: 0 }}>⛔</span>{item}
                    </div>
                  ))}
                </ForgeCardBody>
              </ForgeCard>

              <ForgeCard>
                <ForgeCardHeader><ForgeLabel color={C.accent}>Reconciliation</ForgeLabel></ForgeCardHeader>
                <ForgeCardBody>
                  {CARD_POLICY.reconciliation.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: C.textSecondary, marginBottom: 8 }}>
                      <CheckCircle2 size={13} color={C.accent} style={{ flexShrink: 0, marginTop: 1 }} />{item}
                    </div>
                  ))}
                </ForgeCardBody>
              </ForgeCard>
            </ForgeGrid>
          </div>
        )}

        {tab === "travel" && (
          <ForgeGrid cols={2} gap={16}>
            {TRAVEL_POLICY.map((cat) => (
              <ForgeCard key={cat.category}>
                <ForgeCardHeader>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{cat.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{cat.category}</span>
                  </div>
                </ForgeCardHeader>
                <ForgeCardBody>
                  {cat.rules.map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: C.textSecondary, marginBottom: 8 }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.accent, flexShrink: 0, marginTop: 5 }} />
                      {r}
                    </div>
                  ))}
                </ForgeCardBody>
              </ForgeCard>
            ))}
          </ForgeGrid>
        )}

        {tab === "expense" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {EXPENSE_RULES.map((r, i) => (
              <ForgeCard key={i}>
                <ForgeCardBody style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: C.accent + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 700, color: C.accent }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>{r.rule}</div>
                    <div style={{ fontSize: 12, color: C.textSecondary }}>{r.detail}</div>
                  </div>
                </ForgeCardBody>
              </ForgeCard>
            ))}
          </div>
        )}

        {tab === "payments" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ForgeAlert level="critical">
              New payee bank details must ALWAYS be independently verified by phone before first payment — mandatory anti-fraud control. No exceptions.
            </ForgeAlert>
            {PAYMENT_GOVERNANCE.map((row, i) => (
              <ForgeCard key={i} accent={row.level === "danger" ? C.red : row.level === "warning" ? C.amber : undefined}>
                <ForgeCardBody style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <ForgeBadge variant={row.level as any}>{row.tier}</ForgeBadge>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 3 }}>{row.trigger}</div>
                    <div style={{ fontSize: 12, color: C.accent, marginBottom: 2 }}>Approver: {row.approvers}</div>
                    <div style={{ fontSize: 12, color: C.textSecondary }}>{row.notes}</div>
                  </div>
                </ForgeCardBody>
              </ForgeCard>
            ))}
          </div>
        )}

        {tab === "accounts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {ENTITY_ACCOUNTS.map((acct) => (
              <ForgeCard key={acct.entity} accent={acct.color}>
                <ForgeCardBody>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: acct.color }}>{acct.entity}</div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{acct.type}</div>
                    </div>
                    {acct.blocked && <ForgeBadge variant="warning">BLOCKED — EIN PENDING</ForgeBadge>}
                  </div>
                  <ForgeGrid cols={3} gap={12}>
                    <div>
                      <ForgeLabel>Bank</ForgeLabel>
                      <div style={{ fontSize: 12, color: acct.blocked ? C.amber : C.textSecondary }}>{acct.bank}</div>
                    </div>
                    <div>
                      <ForgeLabel>Authorized Signatories</ForgeLabel>
                      {acct.signatories.map((s, i) => (
                        <div key={i} style={{ fontSize: 12, color: C.textSecondary, marginBottom: 3 }}>· {s}</div>
                      ))}
                    </div>
                    <div>
                      <ForgeLabel>Compliance Note</ForgeLabel>
                      <div style={{ fontSize: 12, color: acct.blocked ? C.amber : C.textSecondary, lineHeight: 1.5 }}>{acct.note}</div>
                    </div>
                  </ForgeGrid>
                </ForgeCardBody>
              </ForgeCard>
            ))}
          </div>
        )}

      </ForgeContent>
    </ForgePage>
  );
}

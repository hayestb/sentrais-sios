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
  ineligible: [
    "All 1099 contractors — no exceptions",
    "Fellows and interns",
    "Advisors and board members",
    "Vendors with active MSA/SOW (use ACH/check)",
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
    "Receipts submitted in Expensify within 5 business days",
    "Monthly reconciliation by Finance Lead before 5th of following month",
    "Unreconciled charges after 30 days charged to employee",
  ],
};

const TRAVEL_POLICY = [
  {
    category: "Air Travel", icon: "✈",
    rules: [
      "Economy class for domestic flights under 4 hours",
      "Business class requires CEO pre-approval (international or >6 hr domestic)",
      "Book at least 7 days in advance when possible",
      "Use preferred booking portal or corporate card",
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
      "Meals under $200: Finance Lead approval",
      "Events/meals over $500: CEO approval required",
      "Document: business purpose, attendees, client affiliation",
      "No alcohol on NOVATELabs or BGI budget codes",
    ],
  },
];

const EXPENSE_RULES = [
  { rule: "Receipt threshold", detail: "Required for all expenses ≥ $25" },
  { rule: "Submission window", detail: "30 days from transaction date; late submissions may be denied" },
  { rule: "Reimbursement cycle", detail: "14 business days after approved submission" },
  { rule: "Pre-approval required", detail: "Any single expense > $500 requires Finance Lead pre-approval" },
  { rule: "Personal card policy", detail: "Employees may use personal cards and request reimbursement; corporate card holders should use corporate card" },
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
            <ForgeGrid cols={2} gap={16}>
              <ForgeCard>
                <ForgeCardHeader><ForgeLabel color={C.green}>Eligible Cardholders</ForgeLabel></ForgeCardHeader>
                <ForgeCardBody style={{ padding: 0 }}>
                  {CARD_POLICY.eligible.map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 18px", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{r.role}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Approved by: {r.approver} · {r.notes}</div>
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

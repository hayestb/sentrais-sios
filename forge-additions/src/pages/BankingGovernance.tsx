// @ts-nocheck
import { useState } from "react";

const CARD_POLICY = {
  eligible: [
    { role: "CEO / Founder", limit: "$5,000/month", notes: "Unrestricted within budget; monthly reconciliation required" },
    { role: "Finance Lead / CFO", limit: "$2,500/month", notes: "Operational expenses only; no personal charges" },
    { role: "Operations Lead (Zoie)", limit: "$1,000/month", notes: "Office supplies, tools, approved vendor payments only" },
  ],
  ineligible: [
    "All 1099 contractors — no company cards under any circumstances",
    "BGI Fellows, interns, volunteers",
    "New hires within first 30 days",
    "Any role not explicitly listed in eligible table above",
  ],
  prohibited: [
    "Personal expenses of any kind",
    "Cash advances or ATM withdrawals",
    "Alcohol (unless pre-approved for client entertainment with CEO sign-off)",
    "Political donations",
    "Gifts > $50 without Finance pre-approval",
    "Subscriptions > $500/mo without Finance + function head approval",
    "Any BGI-related expense on a commercial entity card",
  ],
  reconciliation: "All cardholders must submit receipts and categorization by the 5th of each month. Unreconciled charges after 10 days become personal liability.",
};

const TRAVEL_POLICY = [
  {
    category: "Air Travel",
    rule: "Economy class for domestic flights ≤ 4 hours. Economy/Premium Economy for >4 hours. Business class requires CEO approval.",
    booking: "Book ≥ 7 days in advance. Use approved travel tool or submit for Finance pre-approval.",
    limit: "No per-trip air cap — must be reasonable and pre-approved for T2+ amounts",
  },
  {
    category: "Hotel",
    rule: "≤ $250/night in standard markets. ≤ $350/night in high-cost markets (NYC, SF, DC, Boston). Exceptions require Finance approval.",
    booking: "Book same platform as air. Loyalty points belong to traveler.",
    limit: "$250–$350/night depending on market",
  },
  {
    category: "Ground Transportation",
    rule: "Rideshare (Uber/Lyft) for trips under $75. Rental car requires Finance pre-approval. Personal vehicle: IRS standard mileage rate.",
    booking: "Receipt required for all charges > $10.",
    limit: "No daily cap — reasonable and documented",
  },
  {
    category: "Per Diem (Meals)",
    rule: "Up to $75/day for full travel days. $50/day for partial days. Actuals with receipts preferred; per diem used when receipts unavailable.",
    booking: "No per diem for local travel (< 50 miles from home base).",
    limit: "$75/day full day | $50/day partial",
  },
  {
    category: "Client Entertainment",
    rule: "Must have legitimate business purpose documented. > $100 requires manager approval. > $500 requires CEO approval. No alcohol without CEO sign-off.",
    booking: "Receipt + attendee list + business purpose required.",
    limit: "> $100: manager | > $500: CEO",
  },
];

const EXPENSE_POLICY = [
  { rule: "Receipt threshold", detail: "Receipt required for ALL expenses > $25. No exceptions." },
  { rule: "Submission window", detail: "Expenses must be submitted within 30 days of incurrence. Expenses older than 60 days will not be reimbursed without CEO exception." },
  { rule: "Reimbursement timeline", detail: "Approved expenses reimbursed within 14 days of approval. Submitted via ADP expense module." },
  { rule: "Pre-approval required", detail: "Any unbudgeted expense > $500 requires pre-approval before incurrence. Post-hoc approvals denied unless emergency." },
  { rule: "Contractor expenses", detail: "1099 contractors bill expenses per SOW terms only. No reimbursement outside executed SOW. Must attach receipts to invoice." },
  { rule: "BGI expenses", detail: "Zero BGI expenses on commercial entity accounts. BGI Treasurer approves all BGI disbursements from BGI accounts only." },
  { rule: "Home office", detail: "Not reimbursable for contractors. W-2 employees: up to $50/month for internet with Finance approval." },
  { rule: "Software / subscriptions", detail: "New recurring subscription > $500/mo requires Finance + function head pre-approval. Annual subscriptions require T2 approval." },
];

const PAYMENT_GOVERNANCE = [
  { trigger: "ACH / wire transfer (any amount)", rule: "Dual-officer electronic sign-off. New payee bank details independently verified by phone before first payment — anti-fraud mandatory.", approver: "Finance Lead + CEO" },
  { trigger: "New vendor first payment", rule: "W-9 on file, executed agreement on file, Finance approval. Bank details verified independently.", approver: "Finance Lead" },
  { trigger: "Wire > $10,000", rule: "Dual control required. CEO must approve wire instructions in writing (email confirmation minimum).", approver: "Finance Lead + CEO" },
  { trigger: "International wire", rule: "CEO + Legal review required. Wire instructions verified via secure channel. 48-hour advance notice minimum.", approver: "CEO + Counsel" },
  { trigger: "BGI disbursement (any amount)", rule: "BGI accounts only. BGI Treasurer signs. Dual-sig above $5K. Zero commercial entity involvement.", approver: "BGI Treasurer (independent)" },
  { trigger: "Payroll run", rule: "Finance Lead reviews headcount and amounts before ADP submission. CEO notified of any change > $1,000 from prior period.", approver: "Finance Lead" },
  { trigger: "1099 contractor invoice", rule: "Invoice must reference SOW number and milestone. Finance approves against SOW deliverables before payment.", approver: "Finance Lead" },
];

const ENTITY_ACCOUNTS = [
  { entity: "Sentrais Corp", accounts: "Operating checking, payroll account, tax reserve", signatories: "CEO (primary), Finance Lead (secondary)", notes: "All commercial revenue deposits here first" },
  { entity: "NOVATELabs Inc", accounts: "Program capital account, research account", signatories: "CEO + Finance Lead (dual for > $5K)", notes: "Grant funds deposited here; no commercial revenue" },
  { entity: "BGI", accounts: "Mission capital account (pending EIN)", signatories: "BGI Treasurer (independent director) — NEVER commercial side", notes: "Cannot open until EIN received. Zero commingling." },
  { entity: "Sentrais IP LLC", accounts: "Royalty receipt account", signatories: "CEO", notes: "10% royalty routing from Sentrais Corp per IRC §482" },
];

export default function BankingGovernance() {
  const [view, setView] = useState("cards");

  const views = [
    { id: "cards", label: "Card Policy" },
    { id: "travel", label: "Travel Policy" },
    { id: "expense", label: "Expense Policy" },
    { id: "payments", label: "Payment Governance" },
    { id: "accounts", label: "Entity Accounts" },
  ];

  return (
    <div style={{ fontFamily: "Georgia, serif", background: "#F8F9FA", minHeight: "100vh", color: "#111827" }}>
      <div style={{ background: "white", borderBottom: "3px solid #1E3A8A", padding: "16px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#6B7280", fontFamily: "Arial, sans-serif", marginBottom: "4px" }}>SENTRAIS · NOVATELABS · BGI</div>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#1E3A8A" }}>Banking & Payment Governance</h1>
        <div style={{ color: "#6B7280", fontSize: "12px", marginTop: "2px", fontFamily: "Arial, sans-serif" }}>Card Policy · Travel Policy · Expense Policy · Payment Controls · Entity Accounts</div>
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "12px" }}>
          {views.map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              background: view === v.id ? "#1E3A8A" : "white",
              border: `1.5px solid ${view === v.id ? "#1E3A8A" : "#D1D5DB"}`,
              color: view === v.id ? "white" : "#374151",
              borderRadius: "6px", padding: "5px 12px", fontSize: "11px", cursor: "pointer", fontFamily: "Arial, sans-serif"
            }}>{v.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 28px", maxWidth: "1100px", margin: "0 auto" }}>

        {view === "cards" && (
          <div>
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", fontSize: "12px", color: "#991B1B", fontFamily: "Arial, sans-serif" }}>
              ⚠ No company cards for any 1099 contractor under any circumstances. Contractor expenses are billed per SOW terms only.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "10px" }}>Eligible Cardholders</div>
                {CARD_POLICY.eligible.map((e, i) => (
                  <div key={i} style={{ background: "white", border: "1px solid #E5E7EB", borderLeft: "3px solid #1E3A8A", borderRadius: "6px", padding: "10px 14px", marginBottom: "8px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{e.role}</div>
                    <div style={{ fontSize: "12px", color: "#1E3A8A", fontWeight: "700", marginTop: "2px" }}>Limit: {e.limit}</div>
                    <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "3px", fontFamily: "Arial, sans-serif" }}>{e.notes}</div>
                  </div>
                ))}
                <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "10px 14px", marginTop: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#374151", fontFamily: "Arial, sans-serif", marginBottom: "6px" }}>RECONCILIATION</div>
                  <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif" }}>{CARD_POLICY.reconciliation}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "10px" }}>Ineligible</div>
                {CARD_POLICY.ineligible.map((item, i) => (
                  <div key={i} style={{ fontSize: "12px", color: "#374151", padding: "5px 0", borderBottom: "1px solid #F3F4F6", display: "flex", gap: "8px" }}>
                    <span style={{ color: "#DC2626", flexShrink: 0 }}>✕</span>{item}
                  </div>
                ))}
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginTop: "16px", marginBottom: "10px" }}>Prohibited Uses</div>
                {CARD_POLICY.prohibited.map((item, i) => (
                  <div key={i} style={{ fontSize: "12px", color: "#374151", padding: "5px 0", borderBottom: "1px solid #F3F4F6", display: "flex", gap: "8px" }}>
                    <span style={{ color: "#DC2626", flexShrink: 0 }}>⊘</span>{item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === "travel" && (
          <div>
            <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", fontSize: "12px", color: "#1E3A8A", fontFamily: "Arial, sans-serif" }}>
              All travel must have a documented business purpose. T2+ travel spend requires Finance pre-approval. Receipts required for all charges.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {TRAVEL_POLICY.map((t, i) => (
                <div key={i} style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "14px 16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr 200px", gap: "12px", alignItems: "start" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#1E3A8A" }}>{t.category}</div>
                    <div style={{ fontSize: "12px", color: "#374151" }}>{t.rule}</div>
                    <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif" }}>{t.booking}</div>
                    <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "5px", padding: "4px 8px", fontSize: "11px", color: "#166534", fontFamily: "Arial, sans-serif", textAlign: "center" }}>{t.limit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "expense" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {EXPENSE_POLICY.map((e, i) => (
                <div key={i} style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "12px 16px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ minWidth: "200px", fontSize: "12px", fontWeight: "700", color: "#1E3A8A", fontFamily: "Arial, sans-serif" }}>{e.rule}</div>
                  <div style={{ fontSize: "12px", color: "#374151", flex: 1 }}>{e.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "payments" && (
          <div>
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", fontSize: "12px", color: "#991B1B", fontFamily: "Arial, sans-serif" }}>
              ⚠ ANTI-FRAUD: New payee bank details must ALWAYS be independently verified by phone before first payment. Never rely solely on emailed wire instructions.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {PAYMENT_GOVERNANCE.map((p, i) => (
                <div key={i} style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "12px 16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 200px", gap: "12px", alignItems: "start" }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#111827" }}>{p.trigger}</div>
                    <div style={{ fontSize: "12px", color: "#374151" }}>{p.rule}</div>
                    <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "5px", padding: "4px 8px", fontSize: "11px", color: "#1E3A8A", fontFamily: "Arial, sans-serif" }}>{p.approver}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "accounts" && (
          <div>
            <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", fontSize: "12px", color: "#92400E", fontFamily: "Arial, sans-serif" }}>
              ⚠ BGI accounts cannot be opened until EIN is received. Zero commingling between commercial and charitable accounts at any time.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {ENTITY_ACCOUNTS.map((a, i) => (
                <div key={i} style={{ background: "white", border: "1px solid #E5E7EB", borderLeft: "4px solid #1E3A8A", borderRadius: "8px", padding: "14px 16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 220px 1fr", gap: "12px", alignItems: "start" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#1E3A8A" }}>{a.entity}</div>
                    <div>
                      <div style={{ fontSize: "10px", color: "#6B7280", fontFamily: "Arial, sans-serif", marginBottom: "3px" }}>ACCOUNTS</div>
                      <div style={{ fontSize: "12px", color: "#374151" }}>{a.accounts}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: "#6B7280", fontFamily: "Arial, sans-serif", marginBottom: "3px" }}>SIGNATORIES</div>
                      <div style={{ fontSize: "12px", color: "#374151" }}>{a.signatories}</div>
                    </div>
                    <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif", background: "#F9FAFB", borderRadius: "4px", padding: "5px 8px" }}>{a.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px solid #E5E7EB", padding: "12px 28px", background: "white", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9CA3AF", flexWrap: "wrap", gap: "8px", fontFamily: "Arial, sans-serif" }}>
        <span>SENTRAIS-BPG-2026-v1.0 · Card policy · Travel policy · Expense policy · Payment governance · Entity accounts</span>
        <span style={{ color: "#DC2626", fontWeight: "600" }}>⚠ No contractor cards · BGI accounts pending EIN · New payee: verify by phone before payment</span>
      </div>
    </div>
  );
}

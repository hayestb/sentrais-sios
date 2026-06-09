// @ts-nocheck
import { useState } from "react";

// ─────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────

const PERSONA_TYPES = [
  {
    id: "W2_EXEC",
    label: "Employee — W-2 Executive / Leadership",
    badge: "W-2 EXEC",
    color: "#1E3A8A", bg: "#DBEAFE", border: "#93C5FD",
    taxForm: "W-2",
    payType: "Salary — bi-weekly payroll",
    benefits: true,
    fundingSource: "Sentrais Corp commercial revenue; Sentrais Federal (federal engagement revenue)",
    entity: "Sentrais, Inc.",
    legalInstruments: ["Offer letter", "I-9", "NDA / IP assignment", "Benefits enrollment"],
    flsaClass: "Exempt — duties test required per role",
    approvalTier: "T2–T4 depending on comp level",
    examples: ["CEO", "CTO (Erin)", "CISO", "General Counsel"],
    onboardingSteps: [
      "Counsel confirms FLSA exempt classification",
      "Offer letter executed with NDA + IP assignment",
      "ADP/NetSuite employee record created",
      "Benefits enrollment within 30 days of start",
      "Equity grant processed (83(b) if restricted stock — 30-day deadline)",
      "M365 Tenant B account provisioned",
      "Monday.com workspace access granted",
      "HubSpot CRM access provisioned",
      "Week 1 onboarding plan delivered by Zoie",
    ],
    paySchedule: "Bi-weekly; ADP payroll run 5 business days before pay date",
    capitalPool: "Operating Capital — Sentrais Corp P&L",
    risks: [{ level: "HIGH", desc: "Equity grant 83(b) election — 30-day IRREVOCABLE deadline from grant date" }],
  },
  {
    id: "W2_CORE",
    label: "Employee — W-2 Core Strategy Advisor",
    badge: "W-2 CORE",
    color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE",
    taxForm: "W-2",
    payType: "Equal compensation package + performance incentives",
    benefits: true,
    fundingSource: "Sentrais Corp commercial revenue; anchor partner research funding",
    entity: "Sentrais, Inc.",
    legalInstruments: ["Offer letter", "I-9", "NDA / IP assignment", "Performance incentive agreement"],
    flsaClass: "Exempt — confirm duties test per role (Bryson precedent applies)",
    approvalTier: "T2 (compensation changes require Finance + CEO)",
    examples: ["Erin (CTO)", "Mikalina (Sports)", "Val (Channels)", "Darryl (SEAR/FEMA)", "Free (Live Events)"],
    onboardingSteps: [
      "Role clarity confirmed in writing before first day",
      "Offer letter executed — equal comp package documented",
      "Workstream assignment memo sent (see SENTRAIS Operations & Founder Strategy)",
      "FLSA exempt classification confirmed by counsel",
      "NDA + IP assignment in offer letter",
      "ADP/NetSuite employee record created",
      "M365 Tenant B access provisioned",
      "Monday.com + HubSpot access granted",
      "Weekly 1-on-1 with Founder scheduled (30 min)",
      "First daily standup attended (9:15 AM)",
      "90-day success metrics documented and agreed",
    ],
    paySchedule: "Bi-weekly; equal rate across all core advisors until CFO adjusts",
    capitalPool: "Operating Capital — Sentrais Corp P&L",
    risks: [
      { level: "MEDIUM", desc: "Misclassification risk if duties test not confirmed — route to Chanise before offer" },
      { level: "MEDIUM", desc: "Finder-fee arrangements on government deals — keep out of standard offer; route to counsel" },
    ],
  },
  {
    id: "W2_OPS",
    label: "Employee — W-2 Operations / Support",
    badge: "W-2 OPS",
    color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC",
    taxForm: "W-2",
    payType: "Salary or hourly (non-exempt if <$684/week threshold)",
    benefits: true,
    fundingSource: "Sentrais Corp commercial revenue — G&A cost center",
    entity: "Sentrais, Inc.",
    legalInstruments: ["Offer letter", "I-9"],
    flsaClass: "May be non-exempt — overtime eligible; hours tracking required",
    approvalTier: "T1 (routine ops spend within approved budget)",
    examples: ["Zoie (Ops/Onboarding)", "Tionna (Ops Support)"],
    onboardingSteps: [
      "Offer letter executed",
      "FLSA exempt vs non-exempt confirmed",
      "Time tracking system configured if non-exempt",
      "ADP/NetSuite employee record created",
      "M365 Tenant B access provisioned",
      "Monday.com access granted (Ops workspace)",
      "PM tool training (Week 1)",
      "Access provisioning runbook handed to Zoie on Day 1",
    ],
    paySchedule: "Bi-weekly",
    capitalPool: "Operating Capital — G&A cost center",
    risks: [{ level: "MEDIUM", desc: "Non-exempt overtime exposure if hours exceed 40/week without tracking" }],
  },
  {
    id: "CONTRACTOR_FRACTIONAL",
    label: "Contractor — 1099 Fractional Support",
    badge: "1099 FRAC",
    color: "#7C3AED", bg: "#F5F3FF", border: "#C4B5FD",
    taxForm: "1099-NEC",
    payType: "Per SOW — fixed fee or hourly; Net-30 invoicing",
    benefits: false,
    fundingSource: "Sentrais Corp commercial revenue; grant funding where permissible",
    entity: "Sentrais, Inc. (or NOVATELabs Inc for grant-funded roles)",
    legalInstruments: ["MSA + SOW", "NDA", "W-9 on file", "Insurance certificate (if applicable)"],
    flsaClass: "Must pass IRS common-law test + state ABC test — counsel confirmation required",
    approvalTier: "T1–T2 depending on SOW value",
    examples: ["Comms Lead (15 hrs/wk)", "Grant Funding Lead (20 hrs/wk)", "Sales Lead (15 hrs/wk)", "CFO/Financial Advisor (10 hrs/wk)", "Kimberly Adams (GovTech counsel)", "Kevin Muriel (GTM architect)"],
    onboardingSteps: [
      "Independence test confirmed — own tools, other clients, project-based work",
      "W-9 collected before first payment",
      "MSA executed (governing terms)",
      "SOW executed (scope, deliverables, payment schedule)",
      "NDA executed",
      "No company card issued — expenses billed per SOW terms only",
      "M365 Tenant B guest account — scoped to project SharePoint site only",
      "Monday.com project access granted — no financial data access",
      "Invoice template provided; Net-30 payment terms confirmed",
      "Weekly check-in with function head scheduled",
      "Deliverable calendar mapped to SOW milestones",
    ],
    paySchedule: "Net-30 from invoice date; Finance reviews and approves invoices against SOW milestones",
    capitalPool: "Operating Capital (commercial) or Research/Program Capital (grant-funded roles)",
    risks: [
      { level: "HIGH", desc: "Misclassification risk if contractor controls are not maintained — no company card, no directed hours, no exclusive arrangement" },
      { level: "HIGH", desc: "GTM architect (Kevin) — contingent/finder-fee exposure on government deals; route terms to counsel before SOW execution" },
    ],
  },
  {
    id: "CONTRACTOR_SPECIALIST",
    label: "Contractor — 1099 Specialist Delivery",
    badge: "1099 SPEC",
    color: "#B45309", bg: "#FEF3C7", border: "#FDE68A",
    taxForm: "1099-NEC",
    payType: "Per SOW — deliverable-based; Net-30",
    benefits: false,
    fundingSource: "Project cost center; commercial revenue; federal grants (2 CFR Part 200 compliance required for federal work)",
    entity: "Sentrais, Inc. or Sentrais Federal, Inc.",
    legalInstruments: ["MSA + SOW", "NDA", "IP assignment (explicit in SOW)", "W-9"],
    flsaClass: "Same as fractional — IRS common-law test required",
    approvalTier: "T1–T3 depending on engagement value",
    examples: ["MetaData delivery team", "Qubika build team", "SEG (SEG-specific NFL subcontract)"],
    onboardingSteps: [
      "OCI check if any federal engagement (Sentrais Federal — route to Darryl + Kimberly Adams)",
      "MSA + SOW executed with IP assignment",
      "NDA executed",
      "W-9 collected",
      "Tenant B guest access — MetaData Sandbox/ only (HARD RULE)",
      "Delivery scope and milestone schedule confirmed",
      "Pass-through cost tracking configured in NetSuite",
      "NFL SLA pass-through terms confirmed (SEG: $10K/day LD cap $150K)",
      "90-day re-certification of access rights scheduled",
    ],
    paySchedule: "Milestone-based per SOW; pass-through infra billed at cost with receipts attached",
    capitalPool: "Delivery cost center — project-specific; pass-through tracked separately",
    risks: [
      { level: "CRITICAL", desc: "MetaData — zero access to Tenant A (IP Fortress) or Tenant C (BGI) under any circumstances" },
      { level: "HIGH", desc: "SEG — revenue split dispute risk; Step-In Rights clause in subcontract must be active" },
    ],
  },
  {
    id: "FELLOW",
    label: "Fellow — Barbara Geter Civic Technology Fellowship",
    badge: "FELLOW",
    color: "#065F46", bg: "#ECFDF5", border: "#6EE7B7",
    taxForm: "Varies — counsel determination required",
    payType: "Educational stipend — $7,500 per fellow per 6-month cohort",
    benefits: false,
    fundingSource: "BGI Mission Capital — DOL WIOA grants; NSF education grants; corporate fellowship sponsorships",
    entity: "Barbara Geter Institute (BGI)",
    legalInstruments: ["Fellowship agreement", "Stipend letter", "FERPA consent form", "Program participation agreement"],
    flsaClass: "Not an employment relationship — deliverables must be learning outcomes not production quotas",
    approvalTier: "BGI independent board approves all stipend disbursements; BGI Treasurer is signatory",
    examples: ["Barbara Geter Civic Technology Fellowship cohort (10–15 fellows per cohort)", "MEIX High School Track participants"],
    onboardingSteps: [
      "GATE: BGI EIN received before cohort announcement",
      "GATE: Fellowship Handbook board-approved before any fellow onboarding",
      "School Screening Matrix confirms eligibility (APS, Fulton, DeKalb, Gwinnett, Clayton)",
      "Fellowship agreement executed",
      "FERPA consent form signed",
      "Stipend schedule confirmed ($7,500 / 6-month term)",
      "Curriculum assigned (KSU / Georgia State / Georgia Tech academic spine)",
      "Mentor matched from Industry Mentor Network",
      "Tenant C access — student portfolio site only (Academic staff + BGI ED)",
      "Learning outcomes documented (NOT production quotas)",
      "Monthly stipend disbursement authorized by BGI Treasurer",
    ],
    paySchedule: "Monthly stipend disbursement from BGI accounts — dual-sig above $5K; BGI Treasurer only signatory",
    capitalPool: "Mission Capital — BGI charitable accounts; zero commercial funds",
    risks: [
      { level: "CRITICAL", desc: "No funds may flow from BGI to any Sentrais commercial entity — §4958 private inurement" },
      { level: "HIGH", desc: "Fellowship cannot begin until EIN received and 1023 filed — all pre-EIN cohort communications must include pending status disclosure" },
      { level: "HIGH", desc: "Stipend taxability — counsel must determine before first disbursement" },
    ],
  },
  {
    id: "INTERN",
    label: "Intern — Summer Internship Track",
    badge: "INTERN",
    color: "#0E7490", bg: "#CFFAFE", border: "#67E8F9",
    taxForm: "W-2 if paid (minimum wage); no form if unpaid + primary beneficiary test passed",
    payType: "Paid: $22/hour (undergraduate track); Unpaid: primary beneficiary test required",
    benefits: false,
    fundingSource: "BGI Mission Capital (nonprofit host); Sentrais Academy if commercial host (W-2 path)",
    entity: "Barbara Geter Institute (BGI) — nonprofit host preferred for FLSA protection",
    legalInstruments: ["Offer letter / stipend letter", "Background check authorization", "Parental consent (HS track)", "IP agreement"],
    flsaClass: "DOL primary beneficiary test — 7-factor test; learning > labor; counsel confirmation required",
    approvalTier: "BGI board approves program budget; individual offers within budget = BGI ED authority",
    examples: ["Undergraduate internship track (KSU, Georgia State, Georgia Tech pipeline)", "MEIX High School track (Grades 10–12 unpaid / academic credit)"],
    onboardingSteps: [
      "DOL primary beneficiary test confirmed by counsel for program structure",
      "Host entity confirmed (BGI vs Sentrais Academy)",
      "Background check completed (required for HS track)",
      "Parental consent for HS track",
      "Offer / stipend letter executed",
      "Hours logged contemporaneously (paid interns — overtime tracking)",
      "Curriculum and learning objectives assigned",
      "Mentor assigned",
      "Access: BGI Tenant C — program materials only",
      "Final presentation scheduled (required for program completion)",
    ],
    paySchedule: "HS track: academic-credit basis or grant-funded stipend; UG track: $22/hr bi-weekly from BGI payroll",
    capitalPool: "Mission Capital — BGI; WIOA workforce training funds where applicable",
    risks: [
      { level: "HIGH", desc: "Unpaid HS interns hosted by any for-profit entity fails primary beneficiary test — nonprofit host required" },
      { level: "MEDIUM", desc: "Hours tracking mandatory for paid interns — do not miss overtime threshold" },
    ],
  },
  {
    id: "VOLUNTEER",
    label: "Volunteer — Foundation / Community Programs",
    badge: "VOLUNTEER",
    color: "#BE185D", bg: "#FCE7F3", border: "#F9A8D4",
    taxForm: "None",
    payType: "Unpaid — expense reimbursement only (documented actuals: transport, meals)",
    benefits: false,
    fundingSource: "N/A — volunteer time may be counted as in-kind match for grant reporting",
    entity: "NOVATELabs Inc or Barbara Geter Institute (nonprofit only — NOT Sentrais commercial)",
    legalInstruments: ["Volunteer agreement", "Liability waiver", "Background check (vulnerable populations)"],
    flsaClass: "FLSA volunteer rules — nonprofit only; cannot displace paid staff",
    approvalTier: "BGI ED authorizes volunteer engagement; no spend approval needed unless expense reimbursement",
    examples: ["Community programming volunteers", "Event day support", "Atlanta Oral History Project field volunteers"],
    onboardingSteps: [
      "Confirm nonprofit entity host (BGI or NOVATELabs — NOT commercial Sentrais)",
      "Volunteer agreement + liability waiver signed",
      "Background check if working with minors or vulnerable populations",
      "Role briefing and orientation",
      "Hours logged (for grant in-kind match documentation)",
      "Expense reimbursement process explained (actuals only, receipts required)",
    ],
    paySchedule: "No pay; expense reimbursements processed within 14 days of submission with receipt",
    capitalPool: "Mission Capital — in-kind match; no budget line",
    risks: [{ level: "HIGH", desc: "Volunteer engaged by commercial Sentrais entity = FLSA violation; commercial benefit prohibition" }],
  },
  {
    id: "ADVISOR",
    label: "Advisor — Strategic / Vertical",
    badge: "ADVISOR",
    color: "#374151", bg: "#F9FAFB", border: "#D1D5DB",
    taxForm: "1099-NEC (if cash) or equity agreement",
    payType: "Equity (options/warrants) or cash retainer; advisor agreement governs",
    benefits: false,
    fundingSource: "Sentrais Corp (commercial advisors); BGI (Type 5 Advisory Council — uncompensated)",
    entity: "Sentrais, Inc. (commercial advisors); BGI Advisory Council (uncompensated only)",
    legalInstruments: ["Advisor agreement", "Equity grant agreement (if applicable)", "NDA"],
    flsaClass: "Not an employment relationship",
    approvalTier: "T3–T4 for equity grants (CEO + second officer); cash retainers per tier",
    examples: ["BGI Type 5 Advisory Council (Tye, Cassandra Goodwyn, Kevin Muriel — uncompensated)", "Commercial vertical advisors (League/Venue/Gov)"],
    onboardingSteps: [
      "Advisor agreement + NDA executed",
      "Equity vs. cash terms confirmed (equity = counsel review required)",
      "BGI Advisory Council: $0 compensation confirmed; §4958 impact statement filed",
      "Advisor added to relevant briefings and meeting invites",
      "No system access unless explicitly scoped in agreement",
    ],
    paySchedule: "Cash: per retainer schedule; Equity: per vesting schedule in grant agreement",
    capitalPool: "Operating Capital (cash retainers); Equity pool tracked separately",
    risks: [{ level: "MEDIUM", desc: "BGI Advisory Council members on commercial payroll — §4958 dual-role documentation required; $0 impact statement mandatory" }],
  },
];

const FRACTIONAL_ROLES = [
  {
    id: "COMMS",
    title: "Communications Lead",
    hours: "15 hrs/week",
    term: "90 days renewable",
    rate: "Per SOW",
    payTerms: "Net-30 monthly invoice",
    fundingSource: "Sentrais Corp operating — G&A/GTM cost center",
    scope: [
      "All external messaging and brand positioning",
      "Grant funder narrative drafting (Founder approves final)",
      "Anchor partner communications (Founder approves final)",
      "Internal communication protocol management",
      "Media and public relations",
      "Community messaging and storytelling",
      "Content calendar and social communications",
    ],
    deliverables: [
      { item: "Brand positioning deck", due: "Week 2", milestone: true },
      { item: "Grant funder narrative templates (FEMA BRIC, DOL WIOA)", due: "Week 3", milestone: true },
      { item: "Anchor partner outreach templates (Google, IBM, Microsoft, Amazon)", due: "Week 2", milestone: false },
      { item: "Internal communication protocol document", due: "Week 1", milestone: false },
      { item: "Community impact storytelling framework", due: "Week 4", milestone: false },
      { item: "5+ documented community impact stories", due: "Week 12", milestone: true },
    ],
    escalation: "Tye Hayes (Founder) — final approval on all external messaging",
    approvalTier: "T0 for routine content; T1 for paid media spend",
    risks: [{ level: "MEDIUM", desc: "Messaging misalignment with BGI entity separation — all BGI communications must reference pending 501(c)(3) status" }],
  },
  {
    id: "GRANT",
    title: "Grant Funding Lead",
    hours: "20 hrs/week",
    term: "90 days renewable",
    rate: "Per SOW",
    payTerms: "Net-30 monthly invoice",
    fundingSource: "Sentrais Corp operating; grant overhead allocation where permissible",
    scope: [
      "FEMA BRIC grant application management",
      "DOL WIOA workforce development grant pursuit",
      "NSF education research grant applications (BGI)",
      "Grant compliance tracking and reporting",
      "Quarterly grant reporting calendar",
      "Audit trail documentation for all grant-funded activities",
      "2 CFR Part 200 compliance for federal grants",
    ],
    deliverables: [
      { item: "FEMA BRIC submission (BRIC commercial track — NOT BGI)", due: "CRITICAL — ASAP", milestone: true },
      { item: "Grant compliance tracking system live in Monday.com", due: "Week 2", milestone: false },
      { item: "DOL WIOA application package (BGI — pending EIN)", due: "Week 8 (post BGI EIN)", milestone: true },
      { item: "Quarterly reporting calendar for all active grants", due: "Week 3", milestone: false },
      { item: "Federal cost principle compliance checklist (2 CFR Part 200)", due: "Week 2", milestone: false },
    ],
    escalation: "Tye Hayes (CEO) — all grant submissions require CEO sign-off; BGI grants require BGI board approval",
    approvalTier: "T1–T2 for grant-related spend; BGI grants = independent board authority",
    risks: [
      { level: "CRITICAL", desc: "BRIC references must NOT appear in BGI 1023 narrative — keep commercial BRIC entirely separate from BGI funding story" },
      { level: "HIGH", desc: "Grant funding cannot flow from BGI to Sentrais commercial entity — zero commingling" },
    ],
  },
  {
    id: "SALES",
    title: "Sales Lead",
    hours: "15 hrs/week",
    term: "90 days renewable",
    rate: "Per SOW + performance incentive on closed contracts",
    payTerms: "Net-30 base; incentive paid within 30 days of contract execution",
    fundingSource: "Sentrais Corp operating — GTM cost center",
    scope: [
      "Commercial opportunity identification and pipeline management",
      "Sports vertical prospect development (teams, leagues, venues)",
      "Enterprise sales support for EVERGAME and CivicSync",
      "NFL partnership expansion (post-go-live)",
      "HubSpot CRM pipeline management (COMMERCIAL sector only)",
      "SOW negotiation support",
      "QBR preparation with account teams",
    ],
    deliverables: [
      { item: "Qualified pipeline of 5–10 sports prospects", due: "Week 8", milestone: true },
      { item: "NFL Year 2 scope discussion initiated", due: "Week 7", milestone: true },
      { item: "HubSpot pipeline current and accurate", due: "Week 2 and ongoing", milestone: false },
      { item: "Sports vertical market analysis", due: "Week 4", milestone: false },
      { item: "First non-NFL commercial proposal submitted", due: "Week 10", milestone: true },
    ],
    escalation: "Tye Hayes (CEO) — all contracts T2+ require CEO approval; government deal finder-fee terms to Chanise",
    approvalTier: "T0–T1 for sales activities; contract commitments = T2+",
    risks: [
      { level: "HIGH", desc: "Finder-fee / contingent-fee arrangements on government deals — route to Chanise before any SOW includes these terms" },
      { level: "MEDIUM", desc: "NFL renewal scope conversation requires Founder present — Sales Lead prepares but does not negotiate independently" },
    ],
  },
  {
    id: "CFO",
    title: "Fractional CFO / Financial Advisor",
    hours: "10 hrs/week",
    term: "90 days renewable; likely to 6 months",
    rate: "Per SOW",
    payTerms: "Net-30 monthly invoice",
    fundingSource: "Sentrais Corp operating — G&A cost center",
    scope: [
      "Monthly P&L reporting by entity (Sentrais, NOVATELabs, BGI separate)",
      "Cash position, burn rate, and runway reporting",
      "Payroll and contractor payment operations",
      "NetSuite / ADP configuration and management",
      "AR aging tracking — NFL invoice cycle ($475K quarterly)",
      "IRC §482 transfer pricing documentation (RRH → Sentrais royalty)",
      "BGI grant accounting ledger (Tenant C — BGI Treasurer must be signatory)",
      "Year-end tax planning coordination with counsel",
      "Budget vs. actual reporting monthly to CEO",
    ],
    deliverables: [
      { item: "July 1 accounting cutover confirmed live", due: "Jun 30", milestone: true },
      { item: "NetSuite ERP split-routing rule live (10–25% royalty to RRH)", due: "Week 2", milestone: true },
      { item: "First monthly P&L by entity delivered to CEO", due: "End of Month 1", milestone: true },
      { item: "AR aging report — NFL Q1 invoice monitored ($475K due Jul 30)", due: "Ongoing", milestone: false },
      { item: "IRC §482 quarterly true-up documentation", due: "End of Q3", milestone: true },
      { item: "Year-end tax planning initiated with counsel", due: "Week 12", milestone: true },
    ],
    escalation: "Tye Hayes (CEO) — T2+ spend approvals; interim: CEO holds Finance-lead position until CFO fully seated",
    approvalTier: "T1 for routine finance operations; T2+ requires CEO sign-off (CEO holds Finance-lead until CFO seated)",
    risks: [
      { level: "HIGH", desc: "CEO holds T2 Finance-lead position until CFO is seated — every T2+ decision lands on Founder; CFO hire reduces this load" },
      { level: "HIGH", desc: "BGI accounting — CFO may NOT be BGI Treasurer; BGI Treasurer must be independent director; CFO provides back-office support only" },
    ],
  },
];

const APPROVAL_TIERS = [
  { tier: "T0", range: "≤ $1,000", approvers: "Budget owner (function head)", notes: "Within approved budget line; expense report", autoApprove: true, conditions: "Within approved budget line; not related-party; not new vendor" },
  { tier: "T1", range: "$1,001–$10,000", approvers: "Function head + Finance Lead", notes: "Expense report + PO required", autoApprove: false, conditions: "Auto-route to Finance Lead after function head approval in Monday.com" },
  { tier: "T2", range: "$10,001–$50,000", approvers: "Finance Lead + CEO", notes: "PO + Finance review; interim: CEO holds Finance-lead", autoApprove: false, conditions: "Dual electronic sign-off required; dual-control ACH/wire" },
  { tier: "T3", range: "$50,001–$150,000", approvers: "CEO + Second Officer", notes: "Wet-ink dual signature required", autoApprove: false, conditions: "Paper-based sign-off; no digital-only approval" },
  { tier: "T4", range: "> $150,000", approvers: "CEO + Board notice/approval", notes: "Strategic; board reporting required", autoApprove: false, conditions: "Board resolution or notice; 7-day advance notice minimum" },
  { tier: "SPECIAL", range: "Any amount", approvers: "Independent decision-maker (not conflicted party)", notes: "Conflict-of-interest carve-out — applies whenever officer is on both sides", autoApprove: false, conditions: "Conflicted officer recused; independent officer approves; documented contemporaneously" },
];

const SPECIAL_TRIGGERS = [
  { trigger: "New vendor onboarding", approval: "Director + Finance", docs: "W-9, insurance cert, signed agreement — before first payment" },
  { trigger: "BGI disbursement (any amount)", approval: "Independent BGI board — never commercial side", docs: "Board resolution; §4958 documentation; Foundation policy" },
  { trigger: "International wire transfer", approval: "Executive + Legal", docs: "Wire instructions; Legal review; dual-officer sign-off" },
  { trigger: "New contract commitment", approval: "Executive (T2+)", docs: "Executed agreement; SOW; counsel review for T3+" },
  { trigger: "Unbudgeted expense (any amount)", approval: "One tier above normal limit", docs: "Business justification memo; approval before commitment" },
  { trigger: "Related-party transaction", approval: "Independent officer — NOT the conflicted party", docs: "§4958 protocol documentation; comparability data" },
  { trigger: "New recurring subscription > $500/mo", approval: "Finance + function head", docs: "Business case; budget line confirmation" },
  { trigger: "Staff addition (any type)", approval: "Executive + workforce classification memo", docs: "Classification confirmation by counsel; offer letter or SOW" },
  { trigger: "Government deal finder/contingent fee", approval: "CEO + Counsel (Chanise)", docs: "Route to counsel before any SOW includes these terms" },
];

const RISK_REGISTER = [
  { id: "R1", level: "CRITICAL", category: "Legal / Tax", desc: "83(b) election deadline — Jun 28, 2026 — IRREVOCABLE", owner: "TYE / COUNSEL", founderSees: true, action: "File certified mail this week — no extensions" },
  { id: "R2", level: "CRITICAL", category: "Commercial Delivery", desc: "NFL GDA Go-Live — Jun 30 warranty — $10K/day LD above $150K cap", owner: "ERIN / MIKALINA", founderSees: true, action: "SEG readiness confirmed; pre-flight check T-7 days" },
  { id: "R3", level: "CRITICAL", category: "Nonprofit", desc: "BGI §4958 — any funds flowing from BGI to commercial entity = private inurement", owner: "BGI DIRS / COUNSEL", founderSees: true, action: "Firewall enforced; no commercial signatures on BGI accounts" },
  { id: "R4", level: "CRITICAL", category: "Nonprofit", desc: "BGI 1023 — BRIC references in narrative = potentially disqualifying", owner: "COUNSEL / DARRYL", founderSees: true, action: "Purge all BRIC from BGI program narrative before filing" },
  { id: "R5", level: "HIGH", category: "Worker Classification", desc: "Contractor misclassification — fractional roles + specialist delivery", owner: "FINANCE / COUNSEL", founderSees: true, action: "IRS common-law + state ABC test per role; counsel confirmation before engagement" },
  { id: "R6", level: "HIGH", category: "Financial", desc: "CEO holds T2 Finance-lead — every material spend lands on Founder until CFO seated", owner: "TYE", founderSees: true, action: "Prioritize CFO engagement; reduce founder bottleneck" },
  { id: "R7", level: "HIGH", category: "Commercial", desc: "MetaData — zero access to Tenant A (IP) or Tenant C (BGI) at any time", owner: "ERIN / ZOIE", founderSees: true, action: "Conditional Access policy enforced; 90-day re-cert active" },
  { id: "R8", level: "HIGH", category: "Governance", desc: "SEG subcontract — Step-In Rights clause must be active before go-live", owner: "TYE / COUNSEL", founderSees: true, action: "SEG subcontract execution confirmed with counsel" },
  { id: "R9", level: "HIGH", category: "Nonprofit", desc: "BGI stipend taxability — counsel must determine before first fellow disbursement", owner: "COUNSEL", founderSees: true, action: "Route to counsel as soon as EIN received" },
  { id: "R10", level: "HIGH", category: "Financial", desc: "NFL Q1 cash receipt — $475K due Jul 30 (Net 30 from Jun 30)", owner: "FINANCE", founderSees: true, action: "Watch AR aging; escalate to NFL AP contact if not received by Jul 30" },
  { id: "R11", level: "MEDIUM", category: "Worker Classification", desc: "FLSA exempt duties test — core team roles must be confirmed by counsel", owner: "FINANCE / COUNSEL", founderSees: false, action: "Chanise confirms exempt classification per role before offer letters finalized" },
  { id: "R12", level: "MEDIUM", category: "GTM", desc: "Finder-fee terms in government deal SOWs — separate exposure", owner: "COUNSEL / SALES", founderSees: false, action: "Keep out of standard SOW templates; route any contingent fee to Chanise" },
  { id: "R13", level: "MEDIUM", category: "Operations", desc: "HubSpot pipeline still labeled NovateUS Programs — CRM data accuracy", owner: "ZOIE", founderSees: false, action: "Update pipeline label to BGI Programs this week" },
];

const ONBOARDING_AREAS = [
  {
    area: "Commercial Employee (W-2)",
    icon: "👤",
    color: "#1D4ED8",
    steps: [
      "Pre-hire: classification confirmed by counsel",
      "Day 1: Offer letter + NDA + I-9",
      "Day 1: M365 Tenant B access provisioned",
      "Day 1: Monday.com + HubSpot access",
      "Week 1: ADP payroll record created",
      "Week 1: Benefits enrollment opened (30-day window)",
      "Week 1: 1-on-1 with Founder scheduled",
      "Week 1: Workstream assignment confirmed in writing",
      "Day 30: FLSA duties test documented",
      "Day 30: Equity grant processed if applicable (83(b) 30-day clock starts)",
    ]
  },
  {
    area: "Fractional Contractor (1099)",
    icon: "📋",
    color: "#7C3AED",
    steps: [
      "Pre-engagement: independence test confirmed",
      "Pre-payment: W-9 on file",
      "Day 1: MSA executed",
      "Day 1: SOW executed with milestones and payment schedule",
      "Day 1: NDA executed",
      "Day 1: Guest M365 Tenant B access (scoped to project site only)",
      "Day 1: Invoice template provided; Net-30 terms confirmed",
      "Week 1: No company card issued — expenses per SOW only",
      "Week 1: Deliverable calendar mapped to SOW",
      "Weekly: Check-in with functional owner",
      "Quarterly: Access rights re-certified; SOW renewal evaluated",
    ]
  },
  {
    area: "BGI Fellow",
    icon: "🎓",
    color: "#065F46",
    steps: [
      "GATE: BGI EIN received",
      "GATE: Fellowship Handbook board-approved",
      "GATE: 1023 filed (provisional status disclosed to fellows)",
      "Pre-cohort: school eligibility confirmed via screening matrix",
      "Day 1: Fellowship agreement executed",
      "Day 1: FERPA consent form signed",
      "Day 1: Mentor assigned",
      "Day 1: Curriculum delivered (KSU / Georgia State academic spine)",
      "Monthly: Stipend disbursement from BGI accounts ($625/mo for 12-month annual equiv.)",
      "Program end: Learning outcomes documented; final presentation delivered",
    ]
  },
  {
    area: "Vendor / External Partner",
    icon: "🤝",
    color: "#B45309",
    steps: [
      "New vendor trigger: Director + Finance approval required",
      "Pre-engagement: W-9 collected",
      "Pre-engagement: Insurance certificate on file (if applicable)",
      "Pre-engagement: Vendor agreement or MSA executed",
      "Pre-payment: All docs on file in Tenant B vendor folder",
      "SOW: Scope, deliverables, payment schedule, IP terms all explicit",
      "Payment: PO raised; Finance approves invoice against SOW milestones",
      "Payment: New payee bank details independently verified (anti-fraud)",
      "Quarterly: Vendor performance review; contract renewal or termination decision",
    ]
  },
  {
    area: "BGI Director (Independent Board)",
    icon: "⚖️",
    color: "#047857",
    steps: [
      "GATE: BGI counsel retainer signed",
      "GATE: Delaware Certificate of Incorporation filed",
      "Independence screen: BGI counsel administers (7-point checklist)",
      "Counsel issues written independence opinion",
      "Candidate acknowledges Director Brief in writing",
      "Director signs Independence Certification (Exhibit F)",
      "Board resolution seats the director",
      "M365 Tenant C access provisioned (governance sites only)",
      "First board meeting: Bylaws, Written Consent, COI Policy, Advisory Charter adopted",
      "Annual: Independence re-certification signed",
    ]
  },
  {
    area: "Client / Stadium Operator",
    icon: "🏟️",
    color: "#1E3A8A",
    steps: [
      "MSA executed (NFL MSA dated March 3, 2026 is template)",
      "SOW + Schedules (A–E) executed",
      "EVERGAME instance configured per stadium",
      "Gate 1: NOVATELabs issues System Certification Hash before go-live",
      "Gate 2: Sentrais Board issues commercialization release authorization",
      "Gate 3: Client agreement signed + investment verified",
      "Go-live: SLA monitoring begins (99.5% uptime / 4hr response / 24hr resolve)",
      "QBR: 30-day post-go-live client success review",
      "Quarterly: Invoice issued (Net-30); renewal discussion begins 6 months prior",
    ]
  },
];

const U_STYLE = {
  CRITICAL: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
  HIGH:     { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  MEDIUM:   { bg: "#FEF9C3", text: "#713F12", border: "#FEF08A" },
};

export default function FinancialOperatingModel() {
  const [view, setView] = useState("personas");
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [selectedFractional, setSelectedFractional] = useState(null);
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [approvalSimAmount, setApprovalSimAmount] = useState("");
  const [approvalSimType, setApprovalSimType] = useState("standard");
  const [onboardingArea, setOnboardingArea] = useState(0);

  const getApprovalRoute = () => {
    const amt = parseFloat(approvalSimAmount.replace(/,/g, ""));
    if (approvalSimType === "related_party") return APPROVAL_TIERS[5];
    if (approvalSimType === "bgi") return { tier: "BGI", range: "Any", approvers: "Independent BGI Board — NEVER commercial side", notes: "Foundation policy; §4958; never approved by Sentrais", autoApprove: false };
    if (!amt || isNaN(amt)) return null;
    if (amt <= 1000) return APPROVAL_TIERS[0];
    if (amt <= 10000) return APPROVAL_TIERS[1];
    if (amt <= 50000) return APPROVAL_TIERS[2];
    if (amt <= 150000) return APPROVAL_TIERS[3];
    return APPROVAL_TIERS[4];
  };

  const route = getApprovalRoute();
  const filteredRisks = riskFilter === "ALL" ? RISK_REGISTER : riskFilter === "FOUNDER" ? RISK_REGISTER.filter(r => r.founderSees) : RISK_REGISTER.filter(r => r.level === riskFilter);

  return (
    <div style={{ fontFamily: "Georgia, serif", background: "#F8F9FA", minHeight: "100vh", color: "#111827" }}>

      {/* HEADER */}
      <div style={{ background: "white", borderBottom: "3px solid #1E3A8A", padding: "16px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#6B7280", fontFamily: "Arial, sans-serif", marginBottom: "4px" }}>SENTRAIS · NOVATELabs · BGI — FINANCIAL OPERATING MODEL</div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#1E3A8A" }}>Integrated Financial Operating System</h1>
            <div style={{ color: "#6B7280", fontSize: "12px", marginTop: "2px", fontFamily: "Arial, sans-serif" }}>
              Persona Classification · Funding Sources · Vendor SOW · Fractional Roles · Approvals · Risk Routing · Onboarding
            </div>
          </div>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {[
              ["personas","Personas"],["fractional","Fractional Roles"],
              ["approvals","Approval Engine"],["risks","Risk Register"],["onboarding","Onboarding"],
              ["revenue","Revenue Segments"],["pods","Pod Revenue Model"]
            ].map(([v,l]) => (
              <button key={v} onClick={() => setView(v)} style={{
                background: view===v?"#1E3A8A":"white", border:`1.5px solid ${view===v?"#1E3A8A":"#D1D5DB"}`,
                color: view===v?"white":"#374151", borderRadius:"6px", padding:"5px 12px",
                fontSize:"11px", cursor:"pointer", fontFamily:"Arial, sans-serif", fontWeight: view===v?"600":"400"
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 28px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* ── PERSONAS ── */}
        {view === "personas" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px", marginBottom: "20px" }}>
              {PERSONA_TYPES.map(p => (
                <div key={p.id} onClick={() => setSelectedPersona(selectedPersona === p.id ? null : p.id)}
                  style={{ background: "white", border: `1.5px solid ${selectedPersona===p.id?p.color:p.border}`, borderTop: `3px solid ${p.color}`, borderRadius: "8px", padding: "12px 14px", cursor: "pointer", boxShadow: selectedPersona===p.id?"0 0 0 2px "+p.border:"0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <span style={{ background: p.bg, color: p.color, fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px", fontFamily: "Arial, sans-serif" }}>{p.badge}</span>
                    <span style={{ fontSize: "10px", color: "#6B7280", fontFamily: "Arial, sans-serif" }}>{p.taxForm}</span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "4px", lineHeight: 1.3 }}>{p.label}</div>
                  <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif" }}>{p.payType}</div>
                </div>
              ))}
            </div>

            {selectedPersona && (() => {
              const p = PERSONA_TYPES.find(x => x.id === selectedPersona);
              if (!p) return null;
              return (
                <div style={{ background: "white", border: `2px solid ${p.border}`, borderTop: `4px solid ${p.color}`, borderRadius: "10px", padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
                    <div>
                      <span style={{ background: p.bg, color: p.color, fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "10px", fontFamily: "Arial, sans-serif" }}>{p.badge}</span>
                      <div style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginTop: "6px" }}>{p.label}</div>
                    </div>
                    <button onClick={() => setSelectedPersona(null)} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "4px", padding: "4px 10px", cursor: "pointer", fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif" }}>Close ✕</button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                    {[
                      ["Tax Form", p.taxForm], ["Pay Type", p.payType], ["Entity", p.entity],
                      ["FLSA Class", p.flsaClass], ["Approval Tier", p.approvalTier], ["Capital Pool", p.capitalPool],
                    ].map(([k,v]) => (
                      <div key={k} style={{ background: "#F9FAFB", borderRadius: "6px", padding: "10px 12px" }}>
                        <div style={{ fontSize: "10px", color: "#6B7280", fontFamily: "Arial, sans-serif", fontWeight: "700", marginBottom: "3px" }}>{k.toUpperCase()}</div>
                        <div style={{ fontSize: "12px", color: "#111827" }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif", fontWeight: "700", marginBottom: "6px" }}>FUNDING SOURCE</div>
                      <div style={{ fontSize: "12px", color: "#374151", background: "#EFF6FF", borderRadius: "5px", padding: "8px 10px", border: "1px solid #BFDBFE" }}>{p.fundingSource}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif", fontWeight: "700", marginBottom: "6px" }}>LEGAL INSTRUMENTS REQUIRED</div>
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        {p.legalInstruments.map(li => <span key={li} style={{ background: "#F5F3FF", color: "#4C1D95", fontSize: "10px", padding: "2px 8px", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}>{li}</span>)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif", fontWeight: "700", marginBottom: "6px" }}>ONBOARDING STEPS</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        {p.onboardingSteps.map((s, i) => (
                          <div key={i} style={{ fontSize: "11px", display: "flex", gap: "6px", padding: "3px 0", borderBottom: "1px solid #F3F4F6" }}>
                            <span style={{ color: p.color, flexShrink: 0, fontFamily: "Arial, sans-serif" }}>{i + 1}.</span>
                            <span style={{ color: "#374151" }}>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#B91C1C", fontFamily: "Arial, sans-serif", fontWeight: "700", marginBottom: "6px" }}>RISKS</div>
                      {p.risks.map((r, i) => (
                        <div key={i} style={{ background: U_STYLE[r.level]?.bg||"#F9FAFB", border: `1px solid ${U_STYLE[r.level]?.border||"#E5E7EB"}`, borderRadius: "5px", padding: "7px 10px", marginBottom: "5px" }}>
                          <span style={{ fontSize: "10px", fontFamily: "Arial, sans-serif", fontWeight: "700", color: U_STYLE[r.level]?.text||"#374151" }}>{r.level} · </span>
                          <span style={{ fontSize: "11px", color: "#374151" }}>{r.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── FRACTIONAL ROLES ── */}
        {view === "fractional" && (
          <div>
            <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", fontSize: "12px", color: "#1E3A8A", fontFamily: "Arial, sans-serif" }}>
              All fractional roles are 1099 Contractors. MSA + SOW required before engagement. W-9 on file before first payment. No company cards. Net-30 invoicing against SOW milestones.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "16px" }}>
              {FRACTIONAL_ROLES.map(r => (
                <div key={r.id} onClick={() => setSelectedFractional(selectedFractional === r.id ? null : r.id)}
                  style={{ background: "white", border: `1.5px solid ${selectedFractional===r.id?"#7C3AED":"#E5E7EB"}`, borderLeft: `4px solid #7C3AED`, borderRadius: "8px", padding: "12px 14px", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>{r.title}</div>
                    <span style={{ background: "#F5F3FF", color: "#4C1D95", fontSize: "10px", padding: "2px 8px", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}>{r.hours}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif" }}>Term: {r.term} · {r.payTerms}</div>
                  <div style={{ fontSize: "11px", color: "#374151", marginTop: "4px" }}>Funding: {r.fundingSource}</div>
                </div>
              ))}
            </div>

            {selectedFractional && (() => {
              const r = FRACTIONAL_ROLES.find(x => x.id === selectedFractional);
              if (!r) return null;
              return (
                <div style={{ background: "white", border: "2px solid #C4B5FD", borderTop: "4px solid #7C3AED", borderRadius: "10px", padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                      <div style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>{r.title}</div>
                      <div style={{ fontSize: "12px", color: "#6B7280", fontFamily: "Arial, sans-serif" }}>{r.hours} · {r.term} · {r.payTerms}</div>
                    </div>
                    <button onClick={() => setSelectedFractional(null)} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "4px", padding: "4px 10px", cursor: "pointer", fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif" }}>Close ✕</button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif", fontWeight: "700", marginBottom: "6px" }}>SCOPE OF WORK</div>
                      {r.scope.map((s, i) => <div key={i} style={{ fontSize: "12px", padding: "4px 0", borderBottom: "1px solid #F3F4F6", display: "flex", gap: "6px" }}><span style={{ color: "#7C3AED" }}>→</span>{s}</div>)}
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif", fontWeight: "700", marginBottom: "6px" }}>DELIVERABLES & MILESTONES</div>
                      {r.deliverables.map((d, i) => (
                        <div key={i} style={{ display: "flex", gap: "8px", padding: "5px 0", borderBottom: "1px solid #F3F4F6", alignItems: "flex-start" }}>
                          <span style={{ background: d.milestone?"#7C3AED":"#E5E7EB", color: d.milestone?"white":"#6B7280", fontSize: "9px", padding: "1px 6px", borderRadius: "3px", fontFamily: "Arial, sans-serif", flexShrink: 0, marginTop: "1px" }}>{d.milestone?"MILESTONE":"TASK"}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "12px", color: "#111827" }}>{d.item}</div>
                            <div style={{ fontSize: "10px", color: d.due.includes("CRITICAL")?"#DC2626":"#6B7280", fontFamily: "Arial, sans-serif" }}>Due: {d.due}</div>
                          </div>
                        </div>
                      ))}
                      <div style={{ marginTop: "12px", background: "#EFF6FF", borderRadius: "5px", padding: "8px 10px" }}>
                        <div style={{ fontSize: "10px", color: "#1E3A8A", fontFamily: "Arial, sans-serif", fontWeight: "700", marginBottom: "2px" }}>ESCALATION</div>
                        <div style={{ fontSize: "11px", color: "#374151" }}>{r.escalation}</div>
                      </div>
                      {r.risks.map((rk, i) => (
                        <div key={i} style={{ background: U_STYLE[rk.level]?.bg, border: `1px solid ${U_STYLE[rk.level]?.border}`, borderRadius: "5px", padding: "6px 10px", marginTop: "6px" }}>
                          <span style={{ fontSize: "10px", fontFamily: "Arial, sans-serif", fontWeight: "700", color: U_STYLE[rk.level]?.text }}>{rk.level}: </span>
                          <span style={{ fontSize: "11px", color: "#374151" }}>{rk.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── APPROVAL ENGINE ── */}
        {view === "approvals" && (
          <div>
            {/* Simulator */}
            <div style={{ background: "white", border: "1.5px solid #E5E7EB", borderRadius: "10px", padding: "18px 22px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", marginBottom: "12px" }}>Approval Route Simulator</div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "#6B7280", fontFamily: "Arial, sans-serif", marginBottom: "4px" }}>AMOUNT ($)</div>
                  <input value={approvalSimAmount} onChange={e => setApprovalSimAmount(e.target.value)} placeholder="e.g. 25000"
                    style={{ border: "1.5px solid #D1D5DB", borderRadius: "6px", padding: "8px 12px", fontSize: "13px", width: "140px" }} />
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#6B7280", fontFamily: "Arial, sans-serif", marginBottom: "4px" }}>TRANSACTION TYPE</div>
                  <select value={approvalSimType} onChange={e => setApprovalSimType(e.target.value)}
                    style={{ border: "1.5px solid #D1D5DB", borderRadius: "6px", padding: "8px 12px", fontSize: "13px" }}>
                    <option value="standard">Standard expense / vendor</option>
                    <option value="related_party">Related-party / conflict of interest</option>
                    <option value="bgi">BGI Foundation disbursement</option>
                  </select>
                </div>
              </div>
              {route && (
                <div style={{ marginTop: "14px", background: route.autoApprove?"#ECFDF5":"#EFF6FF", border: `1px solid ${route.autoApprove?"#A7F3D0":"#BFDBFE"}`, borderRadius: "8px", padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ background: route.autoApprove?"#10B981":"#1D4ED8", color: "white", fontSize: "12px", fontWeight: "700", padding: "3px 12px", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}>{route.tier}</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>{route.range}</span>
                    {route.autoApprove && <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: "11px", padding: "2px 8px", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}>✓ AUTO-APPROVE if conditions met</span>}
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151", marginBottom: "6px" }}><strong>Approver(s):</strong> {route.approvers}</div>
                  <div style={{ fontSize: "12px", color: "#374151", marginBottom: "4px" }}><strong>Notes:</strong> {route.notes}</div>
                  <div style={{ fontSize: "12px", color: "#6B7280", background: "white", borderRadius: "4px", padding: "6px 10px", border: "1px solid #E5E7EB", fontFamily: "Arial, sans-serif" }}>
                    <strong style={{ color: route.autoApprove?"#065F46":"#1E3A8A" }}>Conditions:</strong> {route.conditions}
                  </div>
                </div>
              )}
            </div>

            {/* Tier table */}
            <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", overflow: "hidden", marginBottom: "20px" }}>
              <div style={{ background: "#1E3A8A", padding: "12px 16px" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "white", fontFamily: "Arial, sans-serif" }}>Approval Tier Matrix</div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "#F9FAFB" }}>
                    {["Tier","Spend Range","Approver(s)","Auto-Approve?","Conditions"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif", fontWeight: "700", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {APPROVAL_TIERS.map((t, i) => (
                    <tr key={t.tier} style={{ background: i % 2 === 0 ? "white" : "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "10px 12px", fontWeight: "700", color: t.tier === "SPECIAL" ? "#B91C1C" : "#111827", fontFamily: "Arial, sans-serif" }}>{t.tier}</td>
                      <td style={{ padding: "10px 12px", fontWeight: "600" }}>{t.range}</td>
                      <td style={{ padding: "10px 12px", color: "#374151" }}>{t.approvers}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ background: t.autoApprove ? "#D1FAE5" : "#FEE2E2", color: t.autoApprove ? "#065F46" : "#991B1B", fontSize: "10px", padding: "2px 8px", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}>
                          {t.autoApprove ? "YES — if conditions met" : "NO — manual required"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif" }}>{t.conditions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Special triggers */}
            <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ background: "#7F1D1D", padding: "12px 16px" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "white", fontFamily: "Arial, sans-serif" }}>Special Approval Triggers (any dollar amount)</div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "#FFF5F5" }}>
                    {["Trigger","Approval Required","Documentation Required"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif", fontWeight: "700", borderBottom: "1px solid #FECACA" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SPECIAL_TRIGGERS.map((st, i) => (
                    <tr key={st.trigger} style={{ background: i % 2 === 0 ? "white" : "#FFF5F5", borderBottom: "1px solid #FEE2E2" }}>
                      <td style={{ padding: "9px 12px", fontWeight: "600", color: "#111827" }}>{st.trigger}</td>
                      <td style={{ padding: "9px 12px", color: "#374151" }}>{st.approval}</td>
                      <td style={{ padding: "9px 12px", color: "#6B7280", fontFamily: "Arial, sans-serif", fontSize: "11px" }}>{st.docs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── RISK REGISTER ── */}
        {view === "risks" && (
          <div>
            {/* Filter bar */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif" }}>Filter:</span>
              {[["ALL","All Risks"],["FOUNDER","Founder Sees"],["CRITICAL","Critical"],["HIGH","High"],["MEDIUM","Medium"]].map(([v,l]) => (
                <button key={v} onClick={() => setRiskFilter(v)} style={{
                  background: riskFilter===v?"#1E3A8A":"white", border:`1.5px solid ${riskFilter===v?"#1E3A8A":"#D1D5DB"}`,
                  color: riskFilter===v?"white":"#374151", borderRadius:"20px", padding:"4px 12px",
                  fontSize:"11px", cursor:"pointer", fontFamily:"Arial, sans-serif"
                }}>{l}</button>
              ))}
              <span style={{ fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif" }}>({filteredRisks.length} risks)</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {filteredRisks.map(r => {
                const u = U_STYLE[r.level];
                return (
                  <div key={r.id} style={{ background: "white", border: `1px solid ${u?.border||"#E5E7EB"}`, borderLeft: `4px solid ${u?.text||"#374151"}`, borderRadius: "8px", padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ background: u?.bg, color: u?.text, fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}>{r.level}</span>
                        <span style={{ background: "#F3F4F6", color: "#374151", fontSize: "10px", padding: "1px 6px", borderRadius: "3px", fontFamily: "Arial, sans-serif" }}>{r.category}</span>
                        {r.founderSees && <span style={{ background: "#1E3A8A", color: "white", fontSize: "9px", padding: "1px 6px", borderRadius: "3px", fontFamily: "Arial, sans-serif" }}>FOUNDER SEES</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "5px" }}>{r.desc}</div>
                        <div style={{ fontSize: "12px", color: "#374151" }}><strong style={{ fontFamily: "Arial, sans-serif", color: "#6B7280", fontSize: "10px" }}>OWNER: </strong>{r.owner}</div>
                        <div style={{ fontSize: "12px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "4px", padding: "4px 8px", marginTop: "5px", color: "#78350F", fontFamily: "Arial, sans-serif" }}>
                          → {r.action}
                        </div>
                      </div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "Arial, sans-serif", flexShrink: 0 }}>{r.id}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ONBOARDING ── */}
        {view === "onboarding" && (
          <div>
            {/* Area selector */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
              {ONBOARDING_AREAS.map((a, i) => (
                <button key={a.area} onClick={() => setOnboardingArea(i)} style={{
                  background: onboardingArea===i?a.color:"white",
                  border: `1.5px solid ${onboardingArea===i?a.color:"#D1D5DB"}`,
                  color: onboardingArea===i?"white":"#374151",
                  borderRadius: "8px", padding: "6px 14px", fontSize: "11px", cursor: "pointer", fontFamily: "Arial, sans-serif",
                  display: "flex", alignItems: "center", gap: "5px"
                }}>
                  <span>{a.icon}</span>{a.area}
                </button>
              ))}
            </div>

            {(() => {
              const a = ONBOARDING_AREAS[onboardingArea];
              return (
                <div style={{ background: "white", border: `2px solid ${a.color}22`, borderTop: `4px solid ${a.color}`, borderRadius: "10px", padding: "20px 24px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
                    <span style={{ fontSize: "28px" }}>{a.icon}</span>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>{a.area} Onboarding Checklist</div>
                      <div style={{ fontSize: "12px", color: "#6B7280", fontFamily: "Arial, sans-serif" }}>Complete all steps in order — GATE items block downstream steps</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {a.steps.map((s, i) => {
                      const isGate = s.startsWith("GATE:");
                      const isDay1 = s.startsWith("Day 1:");
                      return (
                        <div key={i} style={{ display: "flex", gap: "10px", padding: "9px 12px", background: isGate?"#FEF2F2":isDay1?"#EFF6FF":"#F9FAFB", border: `1px solid ${isGate?"#FECACA":isDay1?"#BFDBFE":"#E5E7EB"}`, borderRadius: "6px", alignItems: "flex-start" }}>
                          <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: isGate?"#DC2626":a.color, color: "white", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "Arial, sans-serif", fontWeight: "700" }}>{i + 1}</div>
                          <div style={{ flex: 1 }}>
                            {isGate && <span style={{ background: "#DC2626", color: "white", fontSize: "9px", padding: "1px 6px", borderRadius: "3px", fontFamily: "Arial, sans-serif", marginRight: "6px" }}>GATE</span>}
                            {isDay1 && <span style={{ background: "#1D4ED8", color: "white", fontSize: "9px", padding: "1px 6px", borderRadius: "3px", fontFamily: "Arial, sans-serif", marginRight: "6px" }}>DAY 1</span>}
                            <span style={{ fontSize: "12px", color: "#111827" }}>{s.replace("GATE: ", "").replace("Day 1: ", "")}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* REVENUE SEGMENTS */}
      {view === "revenue" && (
        <div style={{ padding: "24px 28px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1E3A8A", marginBottom: "4px" }}>Revenue Segment Breakdown</h2>
          <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "20px", fontFamily: "Arial, sans-serif" }}>
            Three revenue categories: Professional Services · Platform & Product · Foundation Income. Each flows through a different entity and has distinct margin profiles, collection cycles, and IP royalty obligations.
          </p>

          {/* Segment Cards */}
          {[
            {
              id: "services",
              label: "Professional Services",
              entity: "Sentrais Corp",
              color: "#1E3A8A",
              bg: "#EFF6FF",
              border: "#BFDBFE",
              share: "~70%",
              arTarget: "$7.0M",
              margin: "55–65%",
              examples: ["City resilience engagements (ARI model)", "SEG subcontract revenue (70% share)", "Federal program delivery (Sentrais Federal Inc)", "Advisory retainers"],
              collections: "Net-30 invoices; milestone-triggered per gate passage",
              ipRoyalty: "10% of gross revenue flows to Sentrais IP LLC before P&L recognition",
              cogsDrivers: ["Labor (W-2 + 1099)", "Travel & client entertainment", "Platform hosting allocation", "Subcontractor pass-through (SEG)"],
              risks: [
                { level: "HIGH", text: "SEG subcontract — 70% revenue share cap; $10K/day LD if deliverables missed; Step-In Rights clause must be active before NFL GDA go-live Jun 30" },
                { level: "MEDIUM", text: "Over-concentration: Atlanta anchor represents >80% of current contract value — diversification required" },
              ],
            },
            {
              id: "platform",
              label: "Platform & Product",
              entity: "Sentrais Corp / Sentrais IP LLC",
              color: "#0EA5E9",
              bg: "#F0F9FF",
              border: "#BAE6FD",
              share: "~20%",
              arTarget: "$2.0M",
              margin: "70–80%",
              examples: ["SIOS platform SaaS licenses (CiviGrid modules)", "ARI program data subscriptions", "API access tiers for city partners", "White-label platform deployments (Boston, LA, NOLA)"],
              collections: "Monthly/annual SaaS subscriptions; auto-renewal; ACH preferred",
              ipRoyalty: "Royalties recognized directly by Sentrais IP LLC; commercial entities pay licensing fee",
              cogsDrivers: ["Cloud infrastructure (GCP/AWS)", "Engineering labor (W-2 tech team)", "Security & compliance", "Customer success allocation"],
              risks: [
                { level: "MEDIUM", text: "Multi-city architecture (LA 88-municipality scale) requires dedicated infra investment in 2026 to hit 2027 targets" },
                { level: "LOW", text: "SaaS churn risk minimal while Atlanta anchor active; renewal risk increases post year 2" },
              ],
            },
            {
              id: "foundation",
              label: "Foundation & Grant Income",
              entity: "NOVATELabs Inc / BGI (pending EIN)",
              color: "#10B981",
              bg: "#F0FDF4",
              border: "#BBF7D0",
              share: "~10%",
              arTarget: "$1.0M",
              margin: "N/A (nonprofit)",
              examples: ["NOVATELabs research grants (NSF, DARPA, private foundations)", "BGI programmatic grants (pending 501c3 determination)", "Fellowship sponsorships", "Endowment interest income (future)"],
              collections: "Grant drawdowns per award schedule; reimbursement vs advance basis varies by funder",
              ipRoyalty: "NOT APPLICABLE — foundation income must not flow to commercial entities. BGI §4958 private inurement prohibition. Zero commingling.",
              cogsDrivers: ["Program delivery labor (W-2 research staff)", "Fellow stipends", "Research materials & travel", "Indirect cost allocation (negotiated rate)"],
              risks: [
                { level: "HIGH", text: "BGI EIN not confirmed — BGI programmatic grants blocked until 501(c)(3) determination received. No BGI funds to commercial entities under any circumstances." },
                { level: "MEDIUM", text: "Foundation grants require separate accounting, restricted fund tracking, and board-approved disbursements — add-on to existing finance infrastructure" },
              ],
            },
          ].map((seg) => (
            <div key={seg.id} style={{ background: seg.bg, border: `1.5px solid ${seg.border}`, borderRadius: "10px", padding: "18px 20px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: seg.color }}>{seg.label}</div>
                  <div style={{ fontSize: "12px", color: "#6B7280", fontFamily: "Arial, sans-serif", marginTop: "2px" }}>Entity: {seg.entity}</div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  {[
                    { label: "Revenue Share", value: seg.share },
                    { label: "AR Target", value: seg.arTarget },
                    { label: "Gross Margin", value: seg.margin },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: "center", padding: "8px 14px", background: "white", border: `1px solid ${seg.border}`, borderRadius: "6px" }}>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: seg.color }}>{s.value}</div>
                      <div style={{ fontSize: "10px", color: "#6B7280", fontFamily: "Arial, sans-serif" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12px", fontFamily: "Arial, sans-serif" }}>
                <div>
                  <div style={{ fontWeight: "600", color: seg.color, marginBottom: "6px", textTransform: "uppercase", fontSize: "10px", letterSpacing: "1px" }}>Revenue Examples</div>
                  {seg.examples.map((e, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", color: "#374151", marginBottom: "4px" }}>
                      <span style={{ color: seg.color, flexShrink: 0 }}>→</span> {e}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontWeight: "600", color: seg.color, marginBottom: "6px", textTransform: "uppercase", fontSize: "10px", letterSpacing: "1px" }}>COGS Drivers</div>
                  {seg.cogsDrivers.map((d, i) => (
                    <div key={i} style={{ color: "#374151", marginBottom: "4px" }}>· {d}</div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "12px", padding: "8px 12px", background: "white", borderRadius: "6px", border: `1px solid ${seg.border}`, fontSize: "12px", fontFamily: "Arial, sans-serif" }}>
                <span style={{ fontWeight: "600", color: seg.color }}>IP Royalty / Fund Flow: </span>
                <span style={{ color: "#374151" }}>{seg.ipRoyalty}</span>
              </div>

              <div style={{ marginTop: "10px", padding: "8px 12px", background: "white", borderRadius: "6px", border: `1px solid ${seg.border}`, fontSize: "12px", fontFamily: "Arial, sans-serif" }}>
                <span style={{ fontWeight: "600", color: seg.color }}>Collections: </span>
                <span style={{ color: "#374151" }}>{seg.collections}</span>
              </div>

              <div style={{ marginTop: "10px" }}>
                {seg.risks.map((r, i) => (
                  <div key={i} style={{
                    display: "flex", gap: "8px", padding: "8px 10px", marginBottom: "6px",
                    background: r.level === "HIGH" ? "#FEF2F2" : r.level === "MEDIUM" ? "#FFFBEB" : "#F0FDF4",
                    border: `1px solid ${r.level === "HIGH" ? "#FECACA" : r.level === "MEDIUM" ? "#FDE68A" : "#BBF7D0"}`,
                    borderRadius: "5px", fontSize: "11px", fontFamily: "Arial, sans-serif",
                  }}>
                    <span style={{ fontWeight: "700", color: r.level === "HIGH" ? "#B91C1C" : r.level === "MEDIUM" ? "#92400E" : "#065F46", flexShrink: 0 }}>
                      ⚠ {r.level}
                    </span>
                    <span style={{ color: "#374151" }}>{r.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Waterfall summary */}
          <div style={{ background: "white", border: "1.5px solid #E5E7EB", borderRadius: "10px", padding: "16px 20px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#1E3A8A", marginBottom: "12px" }}>Revenue Waterfall — $10M ARR Target</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", fontFamily: "Arial, sans-serif", fontSize: "12px" }}>
              {[
                { step: "Gross Revenue", amount: "$10.0M", note: "All entities combined", color: "#1E3A8A" },
                { step: "IP Royalty (−10%)", amount: "−$700K", note: "Services + Platform only → Sentrais IP LLC", color: "#6B7280" },
                { step: "COGS & Direct Labor", amount: "−$3.5M", note: "Est. blended across segments", color: "#6B7280" },
                { step: "Gross Profit", amount: "$5.8M", note: "~58% blended gross margin", color: "#10B981" },
              ].map((w, i) => (
                <div key={i} style={{ padding: "12px", background: "#F9FAFB", borderRadius: "6px", border: "1px solid #E5E7EB" }}>
                  <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}>{w.step}</div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: w.color }}>{w.amount}</div>
                  <div style={{ fontSize: "10px", color: "#9CA3AF", marginTop: "2px" }}>{w.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* POD REVENUE MODEL */}
      {view === "pods" && (
        <div style={{ padding: "24px 28px", fontFamily: "Arial, sans-serif" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1E3A8A", marginBottom: "4px" }}>Pod Revenue Model</h2>
          <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "20px" }}>
            Revenue and expense attribution by GTM pod cost-center. Each pod owns its own P&L contribution. Core + Kicker comp model drives collective attainment.
          </p>

          {/* Revenue Streams by Pod */}
          <div style={{ background: "white", border: "1.5px solid #E5E7EB", borderRadius: "10px", padding: "16px 20px", marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#1E3A8A", marginBottom: "12px" }}>Revenue Streams — Pod Attribution</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "#F9FAFB", borderBottom: "1.5px solid #E5E7EB" }}>
                    {["Revenue Stream", "Attribution", "Pod Cost-Center", "ERP Code", "Collection Cycle"].map((h, i) => (
                      <th key={i} style={{ padding: "8px 12px", textAlign: "left", color: "#6B7280", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { stream: "Subscription (SaaS licenses)", attr: "Shared across pods proportional to ACV closed", costCenter: "Pod CC-XXX", erpCode: "REV-SUB", cycle: "Monthly/annual ARR" },
                    { stream: "Expansion Revenue (Upsell/Cross-sell)", attr: "CSM pod — 30% of CSM variable comp tied here", costCenter: "Pod CC-XXX (originating)", erpCode: "REV-EXP", cycle: "At renewal / add-on close" },
                    { stream: "Professional Services", attr: "AE pod at close; CSM pod at delivery", costCenter: "Engagement-specific CC", erpCode: "REV-SVC", cycle: "Milestone-triggered Net-30" },
                    { stream: "City Deployment Fees", attr: "City pod (ATL/NO/BOS/LA specific)", costCenter: "City pod CC", erpCode: "REV-CITY", cycle: "Per deployment gate" },
                    { stream: "Partner / Referral Revenue", attr: "Originating pod BDR/AE", costCenter: "Pod CC-XXX", erpCode: "REV-PART", cycle: "At contract execution" },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "10px 12px", fontWeight: "600", color: "#111827" }}>{row.stream}</td>
                      <td style={{ padding: "10px 12px", color: "#374151" }}>{row.attr}</td>
                      <td style={{ padding: "10px 12px", color: "#6B7280", fontFamily: "monospace", fontSize: "11px" }}>{row.costCenter}</td>
                      <td style={{ padding: "10px 12px", color: "#0EA5E9", fontFamily: "monospace", fontSize: "11px" }}>{row.erpCode}</td>
                      <td style={{ padding: "10px 12px", color: "#6B7280" }}>{row.cycle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expense Streams */}
          <div style={{ background: "white", border: "1.5px solid #E5E7EB", borderRadius: "10px", padding: "16px 20px", marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#1E3A8A", marginBottom: "12px" }}>Expense Streams — Pod Cost-Centers</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { category: "Sales & Marketing", items: ["AE + BDR salaries + variable", "Growth Marketer base + variable", "Pod smart card (Brex/Ramp) charges", "Client entertainment (Pod Leader approval)"], cac: "CAC tracked per pod — closed-won ÷ sales+marketing spend" },
                { category: "Customer Success", items: ["CSM salary + variable", "Travel for onsite QBRs (CSM + AE)", "Platform provisioning for new accounts", "Churn risk intervention budget"], cac: "Net Revenue Retention (NRR) is primary CSM cost efficiency metric" },
                { category: "Pod Operations", items: ["Pod Leader salary + management comp", "Pod team building ($50/person/quarter)", "Tools + software (per-seat SaaS)", "Training + enablement budget"], cac: "Overhead allocated proportional to pod headcount" },
                { category: "City Deployments", items: ["Local embedded team (min 1 FTE per local-ecosystem city)", "Field events and market entry costs", "Local partner onboarding (3–6 month co-design)", "Compliance + legal for new markets"], cac: "City-specific CAC amortized over contract lifetime value" },
              ].map((block, i) => (
                <div key={i} style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "12px 14px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#1E3A8A", marginBottom: "8px" }}>{block.category}</div>
                  {block.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", gap: "6px", fontSize: "11px", color: "#374151", marginBottom: "5px" }}>
                      <span style={{ color: "#9CA3AF" }}>·</span>{item}
                    </div>
                  ))}
                  <div style={{ marginTop: "8px", padding: "6px 8px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "4px", fontSize: "10px", color: "#1D4ED8", fontStyle: "italic" }}>
                    {block.cac}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Approval Matrix */}
          <div style={{ background: "white", border: "1.5px solid #E5E7EB", borderRadius: "10px", padding: "16px 20px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#1E3A8A", marginBottom: "12px" }}>Pod Spend Approval Matrix</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { tier: "Pod Leader", range: "Up to $4,999", approver: "Pod Leader self-approves", erpStep: "Log to pod cost-center; receipt via Brex/Ramp", color: "#10B981", bg: "#F0FDF4", border: "#BBF7D0" },
                { tier: "Exec GTM", range: "$5,000 – $24,999", approver: "Exec GTM (GTM leadership)", erpStep: "PO raised; Finance Lead notified; 3-way match", color: "#0EA5E9", bg: "#F0F9FF", border: "#BAE6FD" },
                { tier: "CFO", range: "$25,000 and above", approver: "CFO sign-off required", erpStep: "Board notification if recurring; dual-signature for >$50K", color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
                { tier: "Related Party", range: "Any amount", approver: "Independent board member required — no self-approval", erpStep: "Conflict of interest disclosure on file before any approval", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 14px", background: row.bg, border: `1px solid ${row.border}`, borderRadius: "8px" }}>
                  <div style={{ minWidth: "120px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: row.color }}>{row.tier}</div>
                    <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>{row.range}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "#111827", marginBottom: "3px" }}>{row.approver}</div>
                    <div style={{ fontSize: "11px", color: "#6B7280" }}>{row.erpStep}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid #E5E7EB", padding: "12px 28px", background: "white", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9CA3AF", flexWrap: "wrap", gap: "8px", fontFamily: "Arial, sans-serif" }}>
        <span>SENTRAIS-FOM-2026-v1.0 · 9 persona types · 4 fractional roles · T0–T4 approval matrix · 13 risks · 6 onboarding tracks</span>
        <span style={{ color: "#B91C1C", fontWeight: "600" }}>⚠ T2+ approval: CEO holds Finance-lead until CFO seated · BGI disbursements: independent board only</span>
      </div>
    </div>
  );
}

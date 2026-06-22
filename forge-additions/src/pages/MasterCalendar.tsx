import { useState } from "react";

// ─────────────────────────────────────────────
// DATA MODEL
// ─────────────────────────────────────────────

const TRACKS = {
  COMMERCIAL:  { id: "COMMERCIAL",  label: "Commercial Delivery",   color: "#2563EB", bg: "#EFF6FF" },
  NONPROFIT:   { id: "NONPROFIT",   label: "Nonprofit / BGI / ARI", color: "#059669", bg: "#ECFDF5" },
  GTM:         { id: "GTM",         label: "Go-to-Market",          color: "#D97706", bg: "#FFFBEB" },
  FINANCIAL:   { id: "FINANCIAL",   label: "Financial & Quarterly", color: "#7C3AED", bg: "#F5F3FF" },
  GOVERNANCE:  { id: "GOVERNANCE",  label: "Legal / Governance",    color: "#DC2626", bg: "#FEF2F2" },
  INFRA:       { id: "INFRA",       label: "Infrastructure & IT",   color: "#0891B2", bg: "#ECFEFF" },
  PEOPLE:      { id: "PEOPLE",      label: "People & Org",          color: "#BE185D", bg: "#FDF2F8" },
};

const ROLES = {
  TYE:      { id: "TYE",      label: "Tye Hayes — CEO / Founder",            color: "#1B3A6E" },
  ERIN:     { id: "ERIN",     label: "Erin — CTO / Delivery Gate",            color: "#1E40AF" },
  MIKALINA: { id: "MIKALINA", label: "Mikalina — Sports / Atlanta POC",       color: "#065F46" },
  VAL:      { id: "VAL",      label: "Val — Channel / Partnerships",           color: "#7C2D12" },
  DARRYL:   { id: "DARRYL",   label: "Darryl — SEAR / FEMA / Gov",            color: "#4C1D95" },
  FREE:     { id: "FREE",     label: "Free — Live Events / Strategic",         color: "#0E7490" },
  ZOIE:     { id: "ZOIE",     label: "Zoie — Operations / Onboarding",         color: "#701A75" },
  TIONNA:   { id: "TIONNA",   label: "Tionna — Operations Support",            color: "#92400E" },
  FINANCE:  { id: "FINANCE",  label: "Fractional CFO / Finance Lead",          color: "#374151" },
  COUNSEL:  { id: "COUNSEL",  label: "Chanise Anderson / BGI Counsel",         color: "#6B7280" },
  BGI_DIRS: { id: "BGI_DIRS", label: "BGI Independent Directors",              color: "#059669" },
};

const WEEKS = [
  // PHASE 1: FOUNDATION (Wk 1-4: Jun 8 – Jul 6)
  {
    wk: 1, phase: 1, phaseName: "Foundation", dates: "Jun 8–14",
    events: [
      { id:"w1-1", track:"GOVERNANCE", title:"83(b) election certified mail — HARD DEADLINE Jun 28", type:"DEADLINE", urgency:"CRITICAL", roles:["TYE","COUNSEL"], leadDays:20, deps:[], sla:"File by Jun 28 or lose QSBS protection — no cure", earlyWarn:"Already in warning zone — action today" },
      { id:"w1-2", track:"GOVERNANCE", title:"BGI independent counsel retainer — signed", type:"GATE", urgency:"CRITICAL", roles:["TYE","COUNSEL"], leadDays:0, deps:[], sla:"Gate to all BGI formation steps", earlyWarn:"Unblocks DE filing, director recruitment, EIN" },
      { id:"w1-3", track:"INFRA", title:"M365 tenant audit — inventory all shared accounts", type:"ACTION", urgency:"HIGH", roles:["ZOIE","ERIN"], leadDays:0, deps:[], sla:"30-day isolation deadline from Jun 7", earlyWarn:"Shared accounts create IP/§4958 risk daily" },
      { id:"w1-4", track:"COMMERCIAL", title:"NFL GDA Go-Live warranty — Jun 30 deadline", type:"DEADLINE", urgency:"CRITICAL", roles:["ERIN","MIKALINA"], leadDays:22, deps:[], sla:"SEG: $10K/day LD above $150K cap if missed", earlyWarn:"3 weeks to delivery — confirm SEG readiness today" },
      { id:"w1-5", track:"FINANCIAL", title:"Q1 financial baseline — P&L snapshot all entities", type:"RECURRING", urgency:"HIGH", roles:["FINANCE","TYE"], leadDays:0, deps:[], sla:"Monthly cadence — first snapshot this week", earlyWarn:"" },
      { id:"w1-6", track:"GTM", title:"NFL Q1 invoice prep — SNT-NFL-2026-Q1 ($475K)", type:"ACTION", urgency:"HIGH", roles:["TYE","FINANCE"], leadDays:7, deps:["w1-4"], sla:"Invoice due Jun 30; Net 30 = cash Jul 30", earlyWarn:"Prep now so invoice issues before go-live" },
    ]
  },
  {
    wk: 2, phase: 1, phaseName: "Foundation", dates: "Jun 15–21",
    events: [
      { id:"w2-1", track:"GOVERNANCE", title:"BGI Delaware Certificate of Incorporation filed", type:"GATE", urgency:"CRITICAL", roles:["COUNSEL","BGI_DIRS"], leadDays:0, deps:["w1-2"], sla:"EIN application blocked until this is filed", earlyWarn:"BGI counsel retainer is the only blocker" },
      { id:"w2-2", track:"PEOPLE", title:"BGI Director Seat 1 (Chair) — outreach initiated", type:"ACTION", urgency:"HIGH", roles:["TYE","COUNSEL"], leadDays:21, deps:["w1-2"], sla:"Directors must be seated before EIN filing; Chair first", earlyWarn:"Independence screen takes 5–10 days per candidate" },
      { id:"w2-3", track:"INFRA", title:"Tenant C (BGI) provisioned in M365 Admin Center", type:"ACTION", urgency:"HIGH", roles:["ZOIE","ERIN"], leadDays:0, deps:["w2-1"], sla:"Linked to DE filing — provision same week", earlyWarn:"" },
      { id:"w2-4", track:"COMMERCIAL", title:"MetaData sandbox isolation verified in Tenant B", type:"ACTION", urgency:"HIGH", roles:["ERIN","ZOIE"], leadDays:0, deps:[], sla:"Contractual condition in MetaData engagement agreement", earlyWarn:"" },
      { id:"w2-5", track:"GTM", title:"Anchor partner outreach cadence — Google, IBM, Microsoft", type:"RECURRING", urgency:"MEDIUM", roles:["TYE","ERIN"], leadDays:0, deps:[], sla:"Weekly cadence — Tue (Amazon/Google) + Wed (IBM/Microsoft)", earlyWarn:"" },
      { id:"w2-6", track:"FINANCIAL", title:"NetSuite/ADP entity setup — NOVATELabs Inc (new name)", type:"ACTION", urgency:"HIGH", roles:["FINANCE","ZOIE"], leadDays:0, deps:[], sla:"July 1 accounting switch deadline", earlyWarn:"14 days to July 1 — ERP config must start now" },
    ]
  },
  {
    wk: 3, phase: 1, phaseName: "Foundation", dates: "Jun 22–28",
    events: [
      { id:"w3-1", track:"GOVERNANCE", title:"83(b) HARD DEADLINE — Jun 28 certified mail filing", type:"DEADLINE", urgency:"CRITICAL", roles:["TYE","COUNSEL"], leadDays:0, deps:[], sla:"IRREVOCABLE — missed deadline = permanent loss of QSBS protection", earlyWarn:"File this week — no extensions exist" },
      { id:"w3-2", track:"GOVERNANCE", title:"Founders' stock split — 200K Series A + 600K Series B", type:"ACTION", urgency:"CRITICAL", roles:["TYE","COUNSEL"], leadDays:0, deps:[], sla:"Must coordinate with 83(b) filing — same week", earlyWarn:"Chanise confirms amended certificate filed with DE SOS" },
      { id:"w3-3", track:"COMMERCIAL", title:"NFL GDA Go-Live pre-flight check — T-7 days", type:"ACTION", urgency:"CRITICAL", roles:["ERIN","MIKALINA"], leadDays:7, deps:[], sla:"Go-live Jun 30 — $10K/day LD if missed", earlyWarn:"7 days out — resolve all open blockers today" },
      { id:"w3-4", track:"PEOPLE", title:"BGI Director Seat 1 candidate — independence screen complete", type:"GATE", urgency:"HIGH", roles:["COUNSEL","TYE"], leadDays:0, deps:["w2-2"], sla:"Seat offer only after written independence opinion", earlyWarn:"" },
      { id:"w3-5", track:"FINANCIAL", title:"July 1 accounting switch — final entity config check", type:"ACTION", urgency:"HIGH", roles:["FINANCE","ZOIE"], leadDays:7, deps:["w2-6"], sla:"Hard cutover Jul 1 — no soft launch option", earlyWarn:"7 days — confirm NetSuite + ADP both ready" },
      { id:"w3-6", track:"INFRA", title:"Tenant isolation test — 8-scenario test all three tenants", type:"ACTION", urgency:"HIGH", roles:["ERIN","ZOIE"], leadDays:0, deps:["w1-3"], sla:"30-day deadline Jun 7+30 = Jul 7", earlyWarn:"" },
    ]
  },
  {
    wk: 4, phase: 1, phaseName: "Foundation", dates: "Jun 29–Jul 6",
    events: [
      { id:"w4-1", track:"COMMERCIAL", title:"NFL GDA GO-LIVE — EVERGAME deployment live", type:"MILESTONE", urgency:"CRITICAL", roles:["ERIN","MIKALINA","TYE"], leadDays:0, deps:["w3-3"], sla:"Contract milestone — $380K payment triggers on completion", earlyWarn:"" },
      { id:"w4-2", track:"FINANCIAL", title:"NFL Q1 invoice submitted — $475K (+ infra passthrough)", type:"ACTION", urgency:"CRITICAL", roles:["TYE","FINANCE"], leadDays:0, deps:["w4-1"], sla:"Net 30 = cash receipt Jul 30", earlyWarn:"" },
      { id:"w4-3", track:"FINANCIAL", title:"July 1 accounting cutover — NetSuite + ADP live", type:"MILESTONE", urgency:"HIGH", roles:["FINANCE"], leadDays:0, deps:["w3-5"], sla:"Hard date — no delay", earlyWarn:"" },
      { id:"w4-4", track:"PEOPLE", title:"BGI Director Seat 1 seated — first written consent signed", type:"MILESTONE", urgency:"HIGH", roles:["BGI_DIRS","COUNSEL"], leadDays:0, deps:["w3-4"], sla:"Seat 2 + 3 recruitment can now accelerate", earlyWarn:"" },
      { id:"w4-5", track:"INFRA", title:"M365 3-tenant isolation — all shared accounts eliminated", type:"MILESTONE", urgency:"HIGH", roles:["ZOIE","ERIN"], leadDays:0, deps:["w3-6"], sla:"30-day hard deadline — CEO sign-off required", earlyWarn:"" },
      { id:"w4-6", track:"GTM", title:"Q2 pipeline review — commercial deals, grant status, NFL renewal scope", type:"RECURRING", urgency:"MEDIUM", roles:["TYE","VAL","FINANCE"], leadDays:0, deps:[], sla:"End-of-quarter review every quarter", earlyWarn:"" },
    ]
  },
  // PHASE 2: ACCELERATION (Wk 5-8: Jul 7 – Aug 3)
  {
    wk: 5, phase: 2, phaseName: "Acceleration", dates: "Jul 7–13",
    events: [
      { id:"w5-1", track:"NONPROFIT", title:"BGI EIN application filed (SS-4) — post DE confirmation", type:"GATE", urgency:"CRITICAL", roles:["COUNSEL","BGI_DIRS"], leadDays:0, deps:["w4-4","w2-1"], sla:"EIN required before any fellowship announcement or grant application", earlyWarn:"IRS processing: 4–6 weeks for EIN; Fellowship Handbook needs 30 days after — map backwards from Q4 cohort" },
      { id:"w5-2", track:"COMMERCIAL", title:"NFL post-go-live SLA monitoring begins — 99.5% uptime", type:"RECURRING", urgency:"HIGH", roles:["ERIN"], leadDays:0, deps:["w4-1"], sla:"NFL MSA SLA: 99.5% uptime / 4hr response / 24hr resolve", earlyWarn:"First 30 days post-go-live = highest risk window" },
      { id:"w5-3", track:"PEOPLE", title:"BGI Director Seats 2 + 3 — active outreach + independence screens", type:"ACTION", urgency:"HIGH", roles:["TYE","COUNSEL"], leadDays:21, deps:["w4-4"], sla:"Seats 2+3 needed before 1023 filing", earlyWarn:"Seat 3 (Academic) has 60-day deliverable — Fellowship Handbook blocks cohort" },
      { id:"w5-4", track:"GTM", title:"FIFA 2026 Legacy Program — outreach to Host Committee", type:"ACTION", urgency:"HIGH", roles:["MIKALINA","TYE"], leadDays:90, deps:[], sla:"FIFA activation window Q2 2027 — 9 months lead time required", earlyWarn:"Lead time to Converge launch = 9 months; start now" },
      { id:"w5-5", track:"FINANCIAL", title:"Q2 close prep — P&L by entity, AR aging, burn rate", type:"RECURRING", urgency:"HIGH", roles:["FINANCE","TYE"], leadDays:21, deps:[], sla:"Q2 close = Sep 30; prep begins 3 months prior", earlyWarn:"" },
      { id:"w5-6", track:"GOVERNANCE", title:"IRS affirmation letter follow-up — NOVATELabs Inc name change", type:"ACTION", urgency:"MEDIUM", roles:["COUNSEL"], leadDays:0, deps:[], sla:"EIN 39-4510998; letter outstanding since Feb 2026", earlyWarn:"Bank account name update blocked until letter received" },
    ]
  },
  {
    wk: 6, phase: 2, phaseName: "Acceleration", dates: "Jul 14–20",
    events: [
      { id:"w6-1", track:"COMMERCIAL", title:"NFL Q1 payment receipt confirmed — $475K cash", type:"MILESTONE", urgency:"HIGH", roles:["FINANCE","TYE"], leadDays:0, deps:["w4-2"], sla:"Net 30 from Jun 30 invoice = Jul 30 target", earlyWarn:"If not received by Jul 30, escalate to NFL AP contact" },
      { id:"w6-2", track:"NONPROFIT", title:"BGI Seats 2+3 — candidate acknowledgment briefs sent", type:"ACTION", urgency:"HIGH", roles:["TYE","COUNSEL"], leadDays:0, deps:["w5-3"], sla:"Director Brief sent; 5–10 day review period before screen", earlyWarn:"" },
      { id:"w6-3", track:"GTM", title:"Anchor partner deep-dive — quarterly research funding review", type:"RECURRING", urgency:"HIGH", roles:["TYE","ERIN"], leadDays:0, deps:[], sla:"Quarterly cadence — Google/Microsoft/AWS/IBM", earlyWarn:"" },
      { id:"w6-4", track:"INFRA", title:"Document reference updates — 16 files + HubSpot/Monday labels", type:"ACTION", urgency:"MEDIUM", roles:["ZOIE"], leadDays:0, deps:[], sla:"NOVATELabs Inc name updated in all 16 files (completed Jun 8); system tools pending", earlyWarn:"HubSpot pipeline label still reads 'NovateUS Programs'" },
      { id:"w6-5", track:"COMMERCIAL", title:"EVERGAME post-go-live QBR prep — NFL client success review", type:"ACTION", urgency:"HIGH", roles:["ERIN","MIKALINA","TYE"], leadDays:14, deps:["w5-2"], sla:"30-day post-go-live QBR standard", earlyWarn:"" },
      { id:"w6-6", track:"PEOPLE", title:"Economic Mobility Lead hire — JD posted, outreach begins", type:"ACTION", urgency:"MEDIUM", roles:["TYE","VAL"], leadDays:60, deps:[], sla:"P5 (Economic Mobility) gate-blocked without this hire", earlyWarn:"60-day hiring cycle — target Sep start" },
    ]
  },
  {
    wk: 7, phase: 2, phaseName: "Acceleration", dates: "Jul 21–27",
    events: [
      { id:"w7-1", track:"COMMERCIAL", title:"NFL 30-day post-go-live QBR — client success review", type:"RECURRING", urgency:"HIGH", roles:["ERIN","MIKALINA","TYE"], leadDays:0, deps:["w6-5"], sla:"QBR output drives Year 2 scope conversation", earlyWarn:"" },
      { id:"w7-2", track:"NONPROFIT", title:"BGI Director Seat 2 — independence screen + counsel opinion", type:"GATE", urgency:"HIGH", roles:["COUNSEL"], leadDays:0, deps:["w6-2"], sla:"Written independence opinion required before offer", earlyWarn:"" },
      { id:"w7-3", track:"GTM", title:"Converge Atlanta — event structure and venue LOI", type:"ACTION", urgency:"HIGH", roles:["MIKALINA","FREE"], leadDays:0, deps:["w5-4"], sla:"Q2 2027 activation; LOI 9 months prior", earlyWarn:"" },
      { id:"w7-4", track:"FINANCIAL", title:"IRC §482 transfer pricing Q1 true-up — RRH → Sentrais royalty", type:"RECURRING", urgency:"HIGH", roles:["FINANCE","COUNSEL"], leadDays:0, deps:[], sla:"Quarterly review; contemporaneous documentation before year-end", earlyWarn:"" },
      { id:"w7-5", track:"INFRA", title:"HubSpot pipeline label update — BGI Programs live", type:"ACTION", urgency:"MEDIUM", roles:["ZOIE"], leadDays:0, deps:["w6-4"], sla:"CRM accuracy required for Q2/Q3 grant tracking", earlyWarn:"" },
      { id:"w7-6", track:"COMMERCIAL", title:"NFL Year 2 scope discussion — recertification program", type:"ACTION", urgency:"MEDIUM", roles:["TYE","MIKALINA"], leadDays:180, deps:["w7-1"], sla:"Year 2 begins Jan 1, 2027; renewal discussion 6 months prior", earlyWarn:"" },
    ]
  },
  {
    wk: 8, phase: 2, phaseName: "Acceleration", dates: "Jul 28–Aug 3",
    events: [
      { id:"w8-1", track:"NONPROFIT", title:"BGI Seats 2+3 seated — all directors governance package signed", type:"MILESTONE", urgency:"CRITICAL", roles:["BGI_DIRS","COUNSEL"], leadDays:0, deps:["w7-2"], sla:"Full board gates: Bylaws, Written Consent, COI Policy, Advisory Charter", earlyWarn:"" },
      { id:"w8-2", track:"FINANCIAL", title:"NFL Q1 payment received and booked — $475K", type:"MILESTONE", urgency:"HIGH", roles:["FINANCE"], leadDays:0, deps:["w6-1"], sla:"If not received by Jul 30, escalate immediately", earlyWarn:"Watch AR aging report" },
      { id:"w8-3", track:"GTM", title:"Small Business Accelerator — curriculum development begins", type:"ACTION", urgency:"MEDIUM", roles:["MIKALINA","VAL"], leadDays:90, deps:[], sla:"Q1 2027 pilot launch; 20-week curriculum development cycle", earlyWarn:"" },
      { id:"w8-4", track:"COMMERCIAL", title:"Sentrais Federal — first government contracting opportunity scoped", type:"ACTION", urgency:"MEDIUM", roles:["DARRYL","TYE"], leadDays:0, deps:[], sla:"OCI firebreak must be confirmed before any federal engagement", earlyWarn:"" },
      { id:"w8-5", track:"PEOPLE", title:"Sports & Community Impact Lead — hire decision", type:"ACTION", urgency:"HIGH", roles:["TYE"], leadDays:0, deps:[], sla:"P6 (Sports/Culture) full activation blocked without this hire", earlyWarn:"Converge Atlanta gap — unblocks $75K pilot budget deployment" },
      { id:"w8-6", track:"NONPROFIT", title:"BGI Fellowship Handbook — Academic Committee drafting begins", type:"ACTION", urgency:"HIGH", roles:["BGI_DIRS"], leadDays:60, deps:["w8-1"], sla:"Handbook must be board-approved before cohort announcement; Q4 cohort needs Oct announcement", earlyWarn:"60-day drafting cycle from Seat 3 seating" },
    ]
  },
  // PHASE 3: MOMENTUM (Wk 9-12: Aug 4–31)
  {
    wk: 9, phase: 3, phaseName: "Momentum", dates: "Aug 4–10",
    events: [
      { id:"w9-1", track:"NONPROFIT", title:"BGI EIN received (est.) — bank account authorization triggered", type:"MILESTONE", urgency:"HIGH", roles:["BGI_DIRS","FINANCE"], leadDays:0, deps:["w5-1"], sla:"IRS EIN processing 4–6 weeks from filing; banking follows", earlyWarn:"" },
      { id:"w9-2", track:"COMMERCIAL", title:"NFL Q2 invoice prep — $475K quarterly license", type:"ACTION", urgency:"HIGH", roles:["FINANCE","TYE"], leadDays:14, deps:["w4-1"], sla:"Q2 invoice due Sep 30; Net 30 = Oct 30 cash", earlyWarn:"" },
      { id:"w9-3", track:"GTM", title:"Atlanta Readiness Roundtable — Q3 2026 launch", type:"MILESTONE", urgency:"HIGH", roles:["TYE","MIKALINA","DARRYL"], leadDays:0, deps:[], sla:"P1 Civic Resilience pilot activation", earlyWarn:"" },
      { id:"w9-4", track:"FINANCIAL", title:"Q3 budget review — all entities; capital pool allocation", type:"RECURRING", urgency:"HIGH", roles:["FINANCE","TYE"], leadDays:0, deps:[], sla:"Quarterly cadence — budget vs. actual; grant compliance report", earlyWarn:"" },
      { id:"w9-5", track:"GTM", title:"Community Innovation Lab — Cascade location LOI", type:"ACTION", urgency:"MEDIUM", roles:["MIKALINA","FREE"], leadDays:0, deps:[], sla:"P2 pilot — Q4 2026 target; LOI 10 weeks prior", earlyWarn:"" },
      { id:"w9-6", track:"PEOPLE", title:"Executive Director (ARI/BGI) — position spec + search firm brief", type:"ACTION", urgency:"MEDIUM", roles:["TYE","BGI_DIRS"], leadDays:120, deps:["w8-1"], sla:"Most critical hire for ARI; 4–6 month search; needed by early 2027", earlyWarn:"" },
    ]
  },
  {
    wk: 10, phase: 3, phaseName: "Momentum", dates: "Aug 11–17",
    events: [
      { id:"w10-1", track:"NONPROFIT", title:"BGI banking — 5-account segregated structure live", type:"MILESTONE", urgency:"HIGH", roles:["BGI_DIRS","FINANCE"], leadDays:0, deps:["w9-1"], sla:"Treasurer only signatory; dual-sig above $5K", earlyWarn:"" },
      { id:"w10-2", track:"NONPROFIT", title:"ARI §25M Founding Campaign — prospectus draft begins", type:"ACTION", urgency:"MEDIUM", roles:["TYE"], leadDays:0, deps:["w8-1"], sla:"Q3–Q4 fundraising prep; prospectus 6 weeks to complete", earlyWarn:"" },
      { id:"w10-3", track:"GTM", title:"Dual-Generation Digital Literacy — curriculum development begins", type:"ACTION", urgency:"MEDIUM", roles:["VAL","BGI_DIRS"], leadDays:0, deps:["w8-6"], sla:"P4 pilot Q1 2027; 20-week curriculum cycle", earlyWarn:"" },
      { id:"w10-4", track:"COMMERCIAL", title:"MetaData delivery milestone — 90-day post-engagement review", type:"RECURRING", urgency:"HIGH", roles:["ERIN"], leadDays:0, deps:[], sla:"MetaData guest access re-cert every 90 days", earlyWarn:"" },
      { id:"w10-5", track:"GOVERNANCE", title:"Annual director independence re-certification — all entities", type:"RECURRING", urgency:"HIGH", roles:["COUNSEL","BGI_DIRS"], leadDays:0, deps:[], sla:"Annual cycle; first cycle Oct 2026 for BGI post-seating", earlyWarn:"" },
      { id:"w10-6", track:"GTM", title:"Civic Intelligence Fellows — program design, academic partner outreach", type:"ACTION", urgency:"MEDIUM", roles:["FREE"], leadDays:0, deps:[], sla:"P7 pilot Q2 2027; academic partner agreements 6 months prior", earlyWarn:"" },
    ]
  },
  {
    wk: 11, phase: 3, phaseName: "Momentum", dates: "Aug 18–24",
    events: [
      { id:"w11-1", track:"NONPROFIT", title:"BGI Fellowship Handbook — board review + approval", type:"GATE", urgency:"CRITICAL", roles:["BGI_DIRS"], leadDays:0, deps:["w8-6"], sla:"Full board vote required; public cohort announcement blocked until approved", earlyWarn:"" },
      { id:"w11-2", track:"NONPROFIT", title:"IRS Form 1023 filing — BGI counsel leads", type:"GATE", urgency:"CRITICAL", roles:["COUNSEL","BGI_DIRS"], leadDays:0, deps:["w9-1","w11-1"], sla:"IRS review: 3–6 months; provisional operation pending determination letter", earlyWarn:"BRIC references must be purged before filing; funding described as DOL WIOA + NSF only" },
      { id:"w11-3", track:"COMMERCIAL", title:"NFL Year 2 recertification program scoping — GDA recert curriculum", type:"ACTION", urgency:"HIGH", roles:["ERIN","MIKALINA"], leadDays:120, deps:["w7-6"], sla:"Jan 2027 Year 2 renewal; 4-month lead time for curriculum prep", earlyWarn:"" },
      { id:"w11-4", track:"FINANCIAL", title:"Q3 financial reporting — P&L, cash position, burn, AR aging", type:"RECURRING", urgency:"HIGH", roles:["FINANCE","TYE"], leadDays:0, deps:[], sla:"Monthly delivery to CEO; quarterly board-level report", earlyWarn:"" },
      { id:"w11-5", track:"GTM", title:"Sentrais Federal — OCI analysis + first engagement scoped", type:"ACTION", urgency:"MEDIUM", roles:["DARRYL","TYE"], leadDays:0, deps:["w8-4"], sla:"Tenant B Federal_Practice/ OCI firebreak must be confirmed first", earlyWarn:"" },
      { id:"w11-6", track:"PEOPLE", title:"NOVATELabs program team — first staff hires scoped", type:"ACTION", urgency:"MEDIUM", roles:["TYE","BGI_DIRS"], leadDays:0, deps:["w8-1"], sla:"7-pillar program activation requires program leads by Q1 2027", earlyWarn:"" },
    ]
  },
  {
    wk: 12, phase: 3, phaseName: "Momentum", dates: "Aug 25–31",
    events: [
      { id:"w12-1", track:"COMMERCIAL", title:"NFL Q2 invoice submitted — $475K", type:"ACTION", urgency:"CRITICAL", roles:["TYE","FINANCE"], leadDays:0, deps:["w9-2"], sla:"Net 30 = Oct 30 cash", earlyWarn:"" },
      { id:"w12-2", track:"NONPROFIT", title:"Barbara Geter Fellowship — cohort announcement Q4", type:"MILESTONE", urgency:"HIGH", roles:["BGI_DIRS","TYE"], leadDays:0, deps:["w11-1","w11-2"], sla:"Public announcement only after: EIN received, Handbook approved, 1023 filed", earlyWarn:"" },
      { id:"w12-3", track:"GTM", title:"Q3 QBR — NFL + all active clients; pipeline review", type:"RECURRING", urgency:"HIGH", roles:["TYE","ERIN","VAL"], leadDays:0, deps:[], sla:"End of Q3 = Sep 30; QBR prep 2 weeks prior", earlyWarn:"" },
      { id:"w12-4", track:"FINANCIAL", title:"Year-end tax planning — QSBS, IRC §482, BGI §4958 true-up", type:"ACTION", urgency:"HIGH", roles:["FINANCE","COUNSEL"], leadDays:120, deps:[], sla:"Dec 31 deadline; 4-month lead time for complex multi-entity planning", earlyWarn:"" },
      { id:"w12-5", track:"GTM", title:"Converge Atlanta — first anchor sponsor commitment secured", type:"MILESTONE", urgency:"HIGH", roles:["MIKALINA","TYE"], leadDays:0, deps:["w7-3"], sla:"FIFA 2026 activation Q2 2027; anchor sponsor needed 6 months prior", earlyWarn:"" },
      { id:"w12-6", track:"PEOPLE", title:"90-day team retrospective — all roles; founder dependency score", type:"RECURRING", urgency:"HIGH", roles:["TYE"], leadDays:0, deps:[], sla:"Quarterly cadence; update Program Inventory Workbook Tab 9 (Founder Dependency)", earlyWarn:"" },
    ]
  },
];

// Role golden routes — each role's weekly focus map
const GOLDEN_ROUTES = {
  TYE: {
    dailyRhythm: "8–10 AM deep work (protected) · 9:15 AM standup · Tue/Wed anchor partner calls · Thu 1-on-1s",
    weeklyOwns: ["Anchor partner relationships (Amazon, Google, IBM, Microsoft)", "Final approval on all T2+ spend", "Strategic decisions <15 min", "NFL + FIFA relationship stewardship", "BGI governance oversight (advisory role only)"],
    keyDependencies: ["Erin: release gates", "Finance: cash position", "Counsel: legal filings", "BGI Directors: nonprofit governance"],
    earlyWarnings: ["83(b) deadline Jun 28 — already in warning zone", "NFL go-live Jun 30 — 3 weeks out", "BGI counsel retainer — unblocks all nonprofit formation"],
  },
  ERIN: {
    dailyRhythm: "Platform delivery stand-up · Tech anchor partner prep · Gate review before any release",
    weeklyOwns: ["All platform releases gated (no release without CTO approval)", "Anchor partner technical alignment", "MetaData delivery oversight", "NFL SLA monitoring (99.5% uptime)"],
    keyDependencies: ["Mikalina: client requirements", "Zoie: M365 tenant configs", "MetaData: delivery execution"],
    earlyWarnings: ["NFL go-live Jun 30 — confirm SEG readiness this week", "M365 tenant audit — shared accounts still exist"],
  },
  MIKALINA: {
    dailyRhythm: "Sports delivery daily · Atlanta POC progress check · Community partner touchpoints",
    weeklyOwns: ["Sports vertical delivery (NFL, FIFA prep)", "Atlanta POC charter execution", "Converge Atlanta activation", "FIFA Legacy Program outreach"],
    keyDependencies: ["Erin: platform delivery", "Val: channel partnerships", "BGI Directors: program governance for community programming"],
    earlyWarnings: ["Converge Atlanta needs anchor sponsor by Nov 2026 (FIFA Q2 2027)", "Small Business Accelerator needs curriculum start by Aug"],
  },
  VAL: {
    dailyRhythm: "Channel pipeline review · Partner touchpoints · Onboarding status check",
    weeklyOwns: ["Channel partner strategy", "Municipal partnerships (City of Atlanta primary)", "Onboarding accountability with Zoie", "Supplier diversity network for P5"],
    keyDependencies: ["Zoie: onboarding execution", "Mikalina: sports partnerships", "BGI Directors: community partner agreements"],
    earlyWarnings: ["HubSpot pipeline still labeled NovateUS Programs — update this week", "P5 Economic Mobility Lead hire unblocks supplier diversity programs"],
  },
  DARRYL: {
    dailyRhythm: "FEMA/SEAR daily brief · Multi-agency coordination · Grant compliance check",
    weeklyOwns: ["SEAR/FEMA vertical strategy and delivery", "Government grant lifecycle (WIOA, FEMA grants)", "Multi-agency coordination", "Sentrais Federal opportunity scoping"],
    keyDependencies: ["Counsel: OCI clearance for federal engagements", "Erin: SIPE/FORGE compliance for government deployments", "Finance: grant accounting"],
    earlyWarnings: ["BRIC references must be removed from BGI 1023 narrative — coordinate with counsel", "Sentrais Federal OCI firebreak must be confirmed before any federal engagement"],
  },
  FREE: {
    dailyRhythm: "Live events pipeline review · Strategic recruitment support · Community Innovation Lab progress",
    weeklyOwns: ["Live events vertical (EntertainmentOS, LiveNation360)", "Interim sports support (through Jun 30)", "Community Innovation Lab siting and partnerships", "Civic Intelligence Fellows program design"],
    keyDependencies: ["Mikalina: sports handoff after Jun 30", "BGI Directors: nonprofit program approval for community labs"],
    earlyWarnings: ["Sports interim support ends Jun 30 — handoff to Mikalina fully confirmed?", "Community Innovation Lab Q4 target — LOI needed by Sep"],
  },
  ZOIE: {
    dailyRhythm: "Operations standup · PM tool dashboard review · Onboarding status update",
    weeklyOwns: ["PM tool management (Monday.com)", "M365 tenant isolation migration", "Partner/client onboarding", "Document reference updates (16 files + HubSpot/Monday labels)"],
    keyDependencies: ["Erin: IT Admin coordination for M365", "Val: onboarding standards"],
    earlyWarnings: ["M365 30-day isolation deadline Jul 7 — inventory audit must complete this week", "Document reference updates: HubSpot, Monday.com labels still stale"],
  },
  FINANCE: {
    dailyRhythm: "AR aging review · Entity P&L update · Capital pool allocation check",
    weeklyOwns: ["Monthly P&L by entity (Sentrais, NOVATELabs, BGI separate)", "Cash position and burn/runway", "NFL invoice cycle ($475K quarterly)", "NetSuite ERP split-routing rule (10–25% royalty to RRH)", "Transfer pricing documentation (IRC §482)"],
    keyDependencies: ["TYE: T2+ spend approvals", "Counsel: §4958 documentation", "BGI Directors: grant accounting governance"],
    earlyWarnings: ["July 1 accounting switch — 14 days — NetSuite/ADP config must complete", "NFL Q1 cash receipt due Jul 30 — watch AR aging", "Year-end tax planning 4-month lead time — start now"],
  },
};

const URGENCY_STYLE = {
  CRITICAL: { bg: "#FEF2F2", text: "#DC2626", dot: "#EF4444", border: "#FCA5A5" },
  HIGH:     { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316", border: "#FED7AA" },
  MEDIUM:   { bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B", border: "#FDE68A" },
  LOW:      { bg: "#F0FDF4", text: "#166534", dot: "#22C55E", border: "#BBF7D0" },
};

const EVENT_TYPE_ICON = {
  DEADLINE:  "⏰",
  GATE:      "🚧",
  MILESTONE: "🏁",
  ACTION:    "→",
  RECURRING: "↻",
};

const PHASE_COLORS = {
  1: { color: "#1B4F8A", light: "#EBF2FF", label: "Phase 1: Foundation" },
  2: { color: "#276749", light: "#E6FFFA", label: "Phase 2: Acceleration" },
  3: { color: "#7C2D12", light: "#FFF7ED", label: "Phase 3: Momentum" },
};

export default function MasterCalendar() {
  const [view, setView] = useState("timeline");
  const [selectedRole, setSelectedRole] = useState("TYE");
  const [selectedTrack, setSelectedTrack] = useState("ALL");
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);

  const filteredWeeks = WEEKS.map(wk => ({
    ...wk,
    events: wk.events.filter(e =>
      (selectedTrack === "ALL" || e.track === selectedTrack)
    )
  })).filter(wk => wk.events.length > 0);

  const allCritical = WEEKS.flatMap(w => w.events).filter(e => e.urgency === "CRITICAL");
  const roleRoute = GOLDEN_ROUTES[selectedRole];

  const roleEvents = WEEKS.flatMap(w =>
    w.events
      .filter(e => e.roles.includes(selectedRole))
      .map(e => ({ ...e, wk: w.wk, dates: w.dates, phase: w.phase }))
  );

  return (
    <div style={{ fontFamily: "'Courier New', monospace", background: "#08090E", minHeight: "100vh", color: "#E2E8F0" }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(180deg, #0D1117 0%, #111827 100%)", borderBottom: "1px solid #1F2937", padding: "20px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#4B5563", marginBottom: "6px" }}>SENTRAIS · NOVATELabs · BGI</div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px", color: "#F9FAFB", fontFamily: "'Courier New', monospace" }}>
              UNIFIED MASTER CALENDAR
            </h1>
            <div style={{ color: "#6B7280", fontSize: "11px", marginTop: "4px" }}>
              Sequencing Engine · 12-Week · Jun 2026 – Aug 2026 · 3 Tracks · 9 Roles · Early Warning System
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[["timeline","Timeline"], ["critical","🔴 Critical Path"], ["golden","Golden Route"], ["dependencies","Dependencies"]].map(([v,l]) => (
              <button key={v} onClick={() => setView(v)} style={{
                background: view === v ? "#DC2626" : "#111827",
                border: `1px solid ${view === v ? "#DC2626" : "#1F2937"}`,
                color: view === v ? "white" : "#9CA3AF",
                borderRadius: "4px", padding: "6px 12px", fontSize: "10px",
                cursor: "pointer", fontFamily: "inherit", letterSpacing: "1px"
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Warning strip */}
        <div style={{ background: "#7F1D1D", borderRadius: "4px", padding: "8px 16px", marginTop: "14px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {allCritical.slice(0, 4).map(e => (
            <span key={e.id} style={{ fontSize: "11px", color: "#FCA5A5", fontFamily: "inherit" }}>
              ⚠ {e.title.length > 45 ? e.title.slice(0, 42) + "..." : e.title}
            </span>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 28px" }}>

        {/* ── TIMELINE VIEW ── */}
        {view === "timeline" && (
          <div>
            {/* Track filter */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
              <button onClick={() => setSelectedTrack("ALL")} style={{ background: selectedTrack === "ALL" ? "#374151" : "transparent", border: "1px solid #374151", color: selectedTrack === "ALL" ? "white" : "#6B7280", borderRadius: "4px", padding: "4px 12px", fontSize: "10px", cursor: "pointer", fontFamily: "inherit" }}>ALL TRACKS</button>
              {Object.values(TRACKS).map(t => (
                <button key={t.id} onClick={() => setSelectedTrack(t.id)} style={{
                  background: selectedTrack === t.id ? t.color : "transparent",
                  border: `1px solid ${t.color}66`,
                  color: selectedTrack === t.id ? "white" : t.color,
                  borderRadius: "4px", padding: "4px 10px", fontSize: "10px", cursor: "pointer", fontFamily: "inherit"
                }}>{t.label}</button>
              ))}
            </div>

            {/* Phase groups */}
            {[1, 2, 3].map(phase => {
              const phaseWeeks = filteredWeeks.filter(w => w.phase === phase);
              if (!phaseWeeks.length) return null;
              const pc = PHASE_COLORS[phase];
              return (
                <div key={phase} style={{ marginBottom: "28px" }}>
                  <div style={{ borderLeft: `3px solid ${pc.color}`, paddingLeft: "12px", marginBottom: "14px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: pc.color, letterSpacing: "2px" }}>{pc.label.toUpperCase()}</div>
                    <div style={{ fontSize: "10px", color: "#6B7280" }}>{phaseWeeks[0]?.dates} – {phaseWeeks[phaseWeeks.length - 1]?.dates}</div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {phaseWeeks.map(wk => (
                      <div key={wk.wk}>
                        <div onClick={() => setExpandedWeek(expandedWeek === wk.wk ? null : wk.wk)}
                          style={{ background: "#111827", border: `1px solid ${expandedWeek === wk.wk ? pc.color : "#1F2937"}`, borderRadius: "6px", padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px" }}>
                          <span style={{ background: pc.color, color: "white", fontSize: "10px", padding: "2px 8px", borderRadius: "3px", fontFamily: "inherit", flexShrink: 0 }}>WK{wk.wk}</span>
                          <span style={{ color: "#6B7280", fontSize: "11px", flexShrink: 0 }}>{wk.dates}</span>
                          <div style={{ display: "flex", gap: "6px", flex: 1, flexWrap: "wrap" }}>
                            {wk.events.filter(e => e.urgency === "CRITICAL").map(e => (
                              <span key={e.id} style={{ background: "#7F1D1D", color: "#FCA5A5", fontSize: "10px", padding: "1px 6px", borderRadius: "3px", fontFamily: "inherit" }}>🔴 {e.title.length > 35 ? e.title.slice(0,32)+"..." : e.title}</span>
                            ))}
                            {wk.events.filter(e => e.urgency === "HIGH").slice(0,2).map(e => (
                              <span key={e.id} style={{ background: "#1C1407", color: "#FDE68A", fontSize: "10px", padding: "1px 6px", borderRadius: "3px", fontFamily: "inherit" }}>{e.title.length > 30 ? e.title.slice(0,27)+"..." : e.title}</span>
                            ))}
                          </div>
                          <span style={{ color: "#374151", fontSize: "11px", flexShrink: 0 }}>{expandedWeek === wk.wk ? "▲" : "▼"} {wk.events.length} events</span>
                        </div>

                        {expandedWeek === wk.wk && (
                          <div style={{ marginLeft: "14px", borderLeft: `1px solid ${pc.color}44`, paddingLeft: "14px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "4px" }}>
                            {wk.events.map(ev => {
                              const u = URGENCY_STYLE[ev.urgency];
                              const t = TRACKS[ev.track];
                              const isEx = expandedEvent === ev.id;
                              return (
                                <div key={ev.id} onClick={() => setExpandedEvent(isEx ? null : ev.id)}
                                  style={{ background: "#0D1117", border: `1px solid ${isEx ? t.color : "#1F2937"}`, borderRadius: "4px", padding: "8px 12px", cursor: "pointer" }}>
                                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                                    <span style={{ fontSize: "13px", flexShrink: 0 }}>{EVENT_TYPE_ICON[ev.type]}</span>
                                    <span style={{ background: t.color + "22", color: t.color, fontSize: "9px", padding: "1px 6px", borderRadius: "3px", fontFamily: "inherit", flexShrink: 0 }}>{t.label}</span>
                                    <span style={{ flex: 1, fontSize: "12px", color: "#E5E7EB" }}>{ev.title}</span>
                                    <span style={{ background: u.bg, color: u.text, fontSize: "9px", padding: "1px 7px", borderRadius: "3px", fontFamily: "inherit", flexShrink: 0 }}>{ev.urgency}</span>
                                    <span style={{ color: "#4B5563", fontSize: "9px", flexShrink: 0 }}>{ev.roles.join(" · ")}</span>
                                  </div>
                                  {isEx && (
                                    <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #1F2937", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                      {ev.sla && <div style={{ fontSize: "11px" }}><span style={{ color: "#7C3AED" }}>SLA: </span><span style={{ color: "#D1D5DB" }}>{ev.sla}</span></div>}
                                      {ev.leadDays > 0 && <div style={{ fontSize: "11px" }}><span style={{ color: "#0891B2" }}>Lead time: </span><span style={{ color: "#D1D5DB" }}>{ev.leadDays} days</span></div>}
                                      {ev.earlyWarn && <div style={{ fontSize: "11px", gridColumn: "1 / -1" }}><span style={{ color: "#D97706" }}>⚠ Early Warning: </span><span style={{ color: "#FDE68A" }}>{ev.earlyWarn}</span></div>}
                                      {ev.deps.length > 0 && <div style={{ fontSize: "11px" }}><span style={{ color: "#6B7280" }}>Deps: </span><span style={{ color: "#D1D5DB" }}>{ev.deps.join(", ")}</span></div>}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CRITICAL PATH ── */}
        {view === "critical" && (
          <div>
            <div style={{ fontSize: "11px", color: "#EF4444", letterSpacing: "2px", marginBottom: "16px" }}>CRITICAL PATH — ALL DEADLINES, GATES, AND MILESTONES THAT BLOCK DOWNSTREAM WORK</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {WEEKS.flatMap(w => w.events.filter(e => e.urgency === "CRITICAL" || e.type === "GATE" || e.type === "MILESTONE").map(e => ({ ...e, wk: w.wk, dates: w.dates, phase: w.phase }))).map(ev => {
                const u = URGENCY_STYLE[ev.urgency];
                const t = TRACKS[ev.track];
                const pc = PHASE_COLORS[ev.phase];
                return (
                  <div key={ev.id} style={{ background: "#0D1117", border: `1px solid ${ev.urgency === "CRITICAL" ? "#EF4444" : "#374151"}`, borderLeft: `3px solid ${ev.urgency === "CRITICAL" ? "#EF4444" : t.color}`, borderRadius: "6px", padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
                      <span style={{ background: pc.color, color: "white", fontSize: "9px", padding: "2px 8px", borderRadius: "3px", fontFamily: "inherit", flexShrink: 0, marginTop: "2px" }}>WK{ev.wk} · {ev.dates}</span>
                      <span style={{ fontSize: "14px", flexShrink: 0 }}>{EVENT_TYPE_ICON[ev.type]}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", color: "#F9FAFB", fontWeight: "700", marginBottom: "4px" }}>{ev.title}</div>
                        {ev.sla && <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "2px" }}>SLA: {ev.sla}</div>}
                        {ev.earlyWarn && <div style={{ fontSize: "11px", color: "#FDE68A" }}>⚠ {ev.earlyWarn}</div>}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ background: u.bg, color: u.text, fontSize: "9px", padding: "2px 8px", borderRadius: "3px", fontFamily: "inherit", marginBottom: "4px" }}>{ev.urgency}</div>
                        <div style={{ fontSize: "9px", color: "#4B5563" }}>{ev.roles.join(" · ")}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── GOLDEN ROUTE VIEW ── */}
        {view === "golden" && (
          <div>
            {/* Role selector */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
              {Object.values(ROLES).map(r => (
                <button key={r.id} onClick={() => setSelectedRole(r.id)} style={{
                  background: selectedRole === r.id ? r.color : "transparent",
                  border: `1px solid ${r.color}66`, color: selectedRole === r.id ? "white" : r.color,
                  borderRadius: "4px", padding: "4px 10px", fontSize: "10px", cursor: "pointer", fontFamily: "inherit"
                }}>{r.id}</button>
              ))}
            </div>

            {/* Role card */}
            <div style={{ background: "#0D1117", border: `1px solid ${ROLES[selectedRole].color}`, borderRadius: "8px", padding: "18px 22px", marginBottom: "20px" }}>
              <div style={{ fontSize: "10px", color: ROLES[selectedRole].color, letterSpacing: "2px", marginBottom: "8px" }}>GOLDEN ROUTE</div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#F9FAFB", marginBottom: "12px" }}>{ROLES[selectedRole].label}</div>
              {roleRoute && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "#6B7280", marginBottom: "6px", letterSpacing: "1px" }}>DAILY RHYTHM</div>
                    <div style={{ fontSize: "12px", color: "#D1D5DB", lineHeight: 1.6 }}>{roleRoute.dailyRhythm}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "#6B7280", marginBottom: "6px", letterSpacing: "1px" }}>THIS ROLE OWNS</div>
                    {roleRoute.weeklyOwns.map((o, i) => <div key={i} style={{ fontSize: "11px", color: "#D1D5DB", padding: "2px 0", borderBottom: "1px solid #1F2937" }}><span style={{ color: ROLES[selectedRole].color }}>→ </span>{o}</div>)}
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "#6B7280", marginBottom: "6px", letterSpacing: "1px" }}>KEY DEPENDENCIES</div>
                    {roleRoute.keyDependencies.map((d, i) => <div key={i} style={{ fontSize: "11px", color: "#9CA3AF", padding: "2px 0" }}><span style={{ color: "#7C3AED" }}>⟶ </span>{d}</div>)}
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "#EF4444", marginBottom: "6px", letterSpacing: "1px" }}>EARLY WARNINGS</div>
                    {roleRoute.earlyWarnings.map((w, i) => <div key={i} style={{ fontSize: "11px", color: "#FCA5A5", padding: "2px 0" }}>⚠ {w}</div>)}
                  </div>
                </div>
              )}
            </div>

            {/* Role-specific events */}
            <div style={{ fontSize: "10px", color: "#6B7280", letterSpacing: "2px", marginBottom: "12px" }}>CALENDAR EVENTS FOR THIS ROLE — WEEKS 1–12</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {roleEvents.map(ev => {
                const u = URGENCY_STYLE[ev.urgency];
                const t = TRACKS[ev.track];
                const pc = PHASE_COLORS[ev.phase];
                return (
                  <div key={ev.id} style={{ background: "#0D1117", border: `1px solid #1F2937`, borderLeft: `2px solid ${t.color}`, borderRadius: "4px", padding: "8px 12px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ background: pc.color + "33", color: pc.color, fontSize: "9px", padding: "1px 7px", borderRadius: "3px", fontFamily: "inherit", flexShrink: 0 }}>WK{ev.wk} · {ev.dates}</span>
                    <span style={{ fontSize: "12px" }}>{EVENT_TYPE_ICON[ev.type]}</span>
                    <span style={{ flex: 1, fontSize: "12px", color: "#E5E7EB" }}>{ev.title}</span>
                    <span style={{ background: u.bg, color: u.text, fontSize: "9px", padding: "1px 7px", borderRadius: "3px", fontFamily: "inherit", flexShrink: 0 }}>{ev.urgency}</span>
                    {ev.leadDays > 0 && <span style={{ fontSize: "9px", color: "#0891B2", flexShrink: 0 }}>+{ev.leadDays}d lead</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── DEPENDENCIES VIEW ── */}
        {view === "dependencies" && (
          <div>
            <div style={{ fontSize: "11px", color: "#7C3AED", letterSpacing: "2px", marginBottom: "16px" }}>DEPENDENCY MAP — WHAT BLOCKS WHAT</div>
            {WEEKS.flatMap(w => w.events.filter(e => e.deps.length > 0).map(e => ({ ...e, wk: w.wk, dates: w.dates, phase: w.phase }))).map(ev => {
              const t = TRACKS[ev.track];
              return (
                <div key={ev.id} style={{ background: "#0D1117", border: "1px solid #1F2937", borderRadius: "6px", padding: "10px 14px", marginBottom: "6px" }}>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                    <span style={{ background: t.color + "22", color: t.color, fontSize: "9px", padding: "1px 7px", borderRadius: "3px", fontFamily: "inherit" }}>WK{ev.wk} · {ev.dates}</span>
                    <span style={{ flex: 1, fontSize: "12px", color: "#F9FAFB", fontWeight: "600" }}>{ev.title}</span>
                    <span style={{ fontSize: "9px", color: "#6B7280" }}>{URGENCY_STYLE[ev.urgency] && <span style={{ color: URGENCY_STYLE[ev.urgency].text }}>{ev.urgency}</span>}</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingLeft: "8px" }}>
                    <span style={{ fontSize: "10px", color: "#7C3AED" }}>REQUIRES:</span>
                    {ev.deps.map(d => {
                      const dep = WEEKS.flatMap(w => w.events).find(e => e.id === d);
                      return dep ? (
                        <span key={d} style={{ background: "#1C1A2E", color: "#A78BFA", fontSize: "10px", padding: "2px 8px", borderRadius: "3px", fontFamily: "inherit" }}>
                          {dep.title.length > 40 ? dep.title.slice(0, 37) + "..." : dep.title}
                        </span>
                      ) : null;
                    })}
                  </div>
                  {ev.leadDays > 0 && <div style={{ fontSize: "10px", color: "#0891B2", marginTop: "4px", paddingLeft: "8px" }}>Lead time required: {ev.leadDays} days before event date</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid #1F2937", padding: "12px 28px", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#374151", flexWrap: "wrap", gap: "8px", fontFamily: "inherit" }}>
        <span>SENTRAIS-CAL-2026-v1.0 · 12 weeks · {WEEKS.flatMap(w=>w.events).length} events · {allCritical.length} critical · 9 roles · backward-mapped from strategy targets</span>
        <span style={{ color: "#DC2626" }}>⚠ 83(b) DEADLINE: Jun 28 · NFL GO-LIVE: Jun 30 · BGI FORMATION ACTIVE</span>
      </div>
    </div>
  );
}

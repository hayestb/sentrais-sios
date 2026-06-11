// @ts-nocheck
import { useState } from "react";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody,
  ForgeLabel, ForgeBadge, ForgeGrid, ForgeAlert, C,
} from "../components/ui/forge";

// ─── DATA ───────────────────────────────────────────────────────────────────

const TRACKS = {
  COMMERCIAL:  { id: "COMMERCIAL",  label: "Commercial Delivery",   color: "#2563EB" },
  NONPROFIT:   { id: "NONPROFIT",   label: "Nonprofit / BGI / ARI", color: "#059669" },
  GTM:         { id: "GTM",         label: "Go-to-Market",          color: "#D97706" },
  FINANCIAL:   { id: "FINANCIAL",   label: "Financial & Quarterly", color: "#7C3AED" },
  GOVERNANCE:  { id: "GOVERNANCE",  label: "Legal / Governance",    color: "#DC2626" },
  INFRA:       { id: "INFRA",       label: "Infrastructure & IT",   color: "#0891B2" },
  PEOPLE:      { id: "PEOPLE",      label: "People & Org",          color: "#BE185D" },
};

const ROLES = {
  TYE:      { id: "TYE",      label: "Tye Hayes — CEO / Founder",            color: "#1B3A6E" },
  ERIN:     { id: "ERIN",     label: "Erin — CTO / Delivery Gate",           color: "#1E40AF" },
  MIKALINA: { id: "MIKALINA", label: "Mikalina — Sports / Atlanta POC",      color: "#065F46" },
  VAL:      { id: "VAL",      label: "Val — Channel / Partnerships",          color: "#7C2D12" },
  DARRYL:   { id: "DARRYL",   label: "Darryl — SEAR / FEMA / Gov",           color: "#4C1D95" },
  FREE:     { id: "FREE",     label: "Free — Live Events / Strategic",        color: "#0E7490" },
  ZOIE:     { id: "ZOIE",     label: "Zoie — Operations / Onboarding",        color: "#701A75" },
  TIONNA:   { id: "TIONNA",   label: "Tionna — Operations Support",           color: "#92400E" },
  FINANCE:  { id: "FINANCE",  label: "Fractional CFO / Finance Lead",         color: "#374151" },
  COUNSEL:  { id: "COUNSEL",  label: "Chanise Anderson / BGI Counsel",        color: "#6B7280" },
  BGI_DIRS: { id: "BGI_DIRS", label: "BGI Independent Directors",             color: "#059669" },
};

const WEEKS = [
  { wk: 1, phase: 1, phaseName: "Foundation", dates: "Jun 8–14", events: [
    { id:"w1-1", track:"GOVERNANCE", title:"83(b) election certified mail — HARD DEADLINE Jun 28", type:"DEADLINE", urgency:"CRITICAL", roles:["TYE","COUNSEL"], leadDays:20, sla:"File by Jun 28 or lose QSBS protection — no cure", earlyWarn:"Already in warning zone — action today" },
    { id:"w1-2", track:"GOVERNANCE", title:"BGI independent counsel retainer — signed", type:"GATE", urgency:"CRITICAL", roles:["TYE","COUNSEL"], leadDays:0, sla:"Gate to all BGI formation steps", earlyWarn:"Unblocks DE filing, director recruitment, EIN" },
    { id:"w1-3", track:"INFRA", title:"M365 tenant audit — inventory all shared accounts", type:"ACTION", urgency:"HIGH", roles:["ZOIE","ERIN"], leadDays:0, sla:"30-day isolation deadline from Jun 7", earlyWarn:"Shared accounts create IP/§4958 risk daily" },
    { id:"w1-4", track:"COMMERCIAL", title:"NFL GDA Go-Live warranty — Jun 30 deadline", type:"DEADLINE", urgency:"CRITICAL", roles:["ERIN","MIKALINA"], leadDays:22, sla:"SEG: $10K/day LD above $150K cap if missed", earlyWarn:"3 weeks to delivery — confirm SEG readiness today" },
    { id:"w1-5", track:"FINANCIAL", title:"Q1 financial baseline — P&L snapshot all entities", type:"RECURRING", urgency:"HIGH", roles:["FINANCE","TYE"], leadDays:0, sla:"Monthly cadence — first snapshot this week", earlyWarn:"" },
    { id:"w1-6", track:"GTM", title:"NFL Q1 invoice prep — SNT-NFL-2026-Q1 ($475K)", type:"ACTION", urgency:"HIGH", roles:["TYE","FINANCE"], leadDays:7, sla:"Invoice due Jun 30; Net 30 = cash Jul 30", earlyWarn:"Prep now so invoice issues before go-live" },
  ]},
  { wk: 2, phase: 1, phaseName: "Foundation", dates: "Jun 15–21", events: [
    { id:"w2-1", track:"GOVERNANCE", title:"BGI Delaware Certificate of Incorporation filed", type:"GATE", urgency:"CRITICAL", roles:["COUNSEL","BGI_DIRS"], leadDays:0, sla:"EIN application blocked until this is filed", earlyWarn:"BGI counsel retainer is the only blocker" },
    { id:"w2-2", track:"PEOPLE", title:"BGI Director Seat 1 (Chair) — outreach initiated", type:"ACTION", urgency:"HIGH", roles:["TYE","COUNSEL"], leadDays:21, sla:"Directors must be seated before EIN filing; Chair first", earlyWarn:"Independence screen takes 5–10 days per candidate" },
    { id:"w2-3", track:"INFRA", title:"Tenant C (BGI) provisioned in M365 Admin Center", type:"ACTION", urgency:"HIGH", roles:["ZOIE","ERIN"], leadDays:0, sla:"Linked to DE filing — provision same week", earlyWarn:"" },
    { id:"w2-4", track:"COMMERCIAL", title:"MetaData sandbox isolation verified in Tenant B", type:"ACTION", urgency:"HIGH", roles:["ERIN","ZOIE"], leadDays:0, sla:"Contractual condition in MetaData engagement agreement", earlyWarn:"" },
    { id:"w2-5", track:"GTM", title:"Anchor partner outreach cadence — Google, IBM, Microsoft", type:"RECURRING", urgency:"MEDIUM", roles:["TYE","ERIN"], leadDays:0, sla:"Weekly cadence — Tue (Amazon/Google) + Wed (IBM/Microsoft)", earlyWarn:"" },
    { id:"w2-6", track:"FINANCIAL", title:"NetSuite/ADP entity setup — NOVATELabs Inc (new name)", type:"ACTION", urgency:"HIGH", roles:["FINANCE","ZOIE"], leadDays:0, sla:"July 1 accounting switch deadline", earlyWarn:"14 days to July 1 — ERP config must start now" },
  ]},
  { wk: 3, phase: 1, phaseName: "Foundation", dates: "Jun 22–28", events: [
    { id:"w3-1", track:"GOVERNANCE", title:"83(b) HARD DEADLINE — Jun 28 certified mail filing", type:"DEADLINE", urgency:"CRITICAL", roles:["TYE","COUNSEL"], leadDays:0, sla:"IRREVOCABLE — missed deadline = permanent loss of QSBS protection", earlyWarn:"File this week — no extensions exist" },
    { id:"w3-2", track:"GOVERNANCE", title:"Founders' stock split — 200K Series A + 600K Series B", type:"ACTION", urgency:"CRITICAL", roles:["TYE","COUNSEL"], leadDays:0, sla:"Must coordinate with 83(b) filing — same week", earlyWarn:"Chanise confirms amended certificate filed with DE SOS" },
    { id:"w3-3", track:"COMMERCIAL", title:"NFL GDA Go-Live pre-flight check — T-7 days", type:"ACTION", urgency:"CRITICAL", roles:["ERIN","MIKALINA"], leadDays:7, sla:"Go-live Jun 30 — $10K/day LD if missed", earlyWarn:"7 days out — resolve all open blockers today" },
    { id:"w3-4", track:"PEOPLE", title:"BGI Director Seat 1 candidate — independence screen complete", type:"GATE", urgency:"HIGH", roles:["COUNSEL","TYE"], leadDays:0, sla:"Seat offer only after written independence opinion", earlyWarn:"" },
    { id:"w3-5", track:"FINANCIAL", title:"July 1 accounting switch — final entity config check", type:"ACTION", urgency:"HIGH", roles:["FINANCE","ZOIE"], leadDays:7, sla:"Hard cutover Jul 1 — no soft launch option", earlyWarn:"7 days — confirm NetSuite + ADP both ready" },
    { id:"w3-6", track:"INFRA", title:"Tenant isolation test — 8-scenario test all three tenants", type:"ACTION", urgency:"HIGH", roles:["ERIN","ZOIE"], leadDays:0, sla:"30-day deadline Jun 7+30 = Jul 7", earlyWarn:"" },
  ]},
  { wk: 4, phase: 1, phaseName: "Foundation", dates: "Jun 29–Jul 5", events: [
    { id:"w4-1", track:"COMMERCIAL", title:"NFL GDA GO-LIVE — EVERGAME deployment live", type:"MILESTONE", urgency:"CRITICAL", roles:["ERIN","MIKALINA","TYE"], leadDays:0, sla:"Contract milestone — $380K payment triggers on completion", earlyWarn:"" },
    { id:"w4-2", track:"FINANCIAL", title:"NFL Q1 invoice submitted — $475K (+ infra passthrough)", type:"ACTION", urgency:"CRITICAL", roles:["TYE","FINANCE"], leadDays:0, sla:"Net 30 = cash receipt Jul 30", earlyWarn:"" },
    { id:"w4-3", track:"FINANCIAL", title:"July 1 accounting cutover — NetSuite + ADP live", type:"MILESTONE", urgency:"HIGH", roles:["FINANCE"], leadDays:0, sla:"Hard date — no delay", earlyWarn:"" },
    { id:"w4-4", track:"PEOPLE", title:"BGI Director Seat 1 seated — first written consent signed", type:"MILESTONE", urgency:"HIGH", roles:["BGI_DIRS","COUNSEL"], leadDays:0, sla:"Seat 2 + 3 recruitment can now accelerate", earlyWarn:"" },
    { id:"w4-5", track:"INFRA", title:"M365 3-tenant isolation — all shared accounts eliminated", type:"MILESTONE", urgency:"HIGH", roles:["ZOIE","ERIN"], leadDays:0, sla:"30-day hard deadline — CEO sign-off required", earlyWarn:"" },
    { id:"w4-6", track:"GTM", title:"Q2 pipeline review — commercial deals, grant status, NFL renewal scope", type:"RECURRING", urgency:"MEDIUM", roles:["TYE","VAL","FINANCE"], leadDays:0, sla:"End-of-quarter review every quarter", earlyWarn:"" },
  ]},
  { wk: 5, phase: 2, phaseName: "Acceleration", dates: "Jul 7–13", events: [
    { id:"w5-1", track:"NONPROFIT", title:"BGI EIN application filed (SS-4) — post DE confirmation", type:"GATE", urgency:"CRITICAL", roles:["COUNSEL","BGI_DIRS"], leadDays:0, sla:"EIN required before any fellowship announcement or grant application", earlyWarn:"IRS processing: 4–6 weeks for EIN; Fellowship Handbook needs 30 days after — map backwards from Q4 cohort" },
    { id:"w5-2", track:"COMMERCIAL", title:"NFL post-go-live SLA monitoring begins — 99.5% uptime", type:"RECURRING", urgency:"HIGH", roles:["ERIN"], leadDays:0, sla:"NFL MSA SLA: 99.5% uptime / 4hr response / 24hr resolve", earlyWarn:"First 30 days post-go-live = highest risk window" },
    { id:"w5-3", track:"PEOPLE", title:"BGI Director Seats 2 + 3 — active outreach + independence screens", type:"ACTION", urgency:"HIGH", roles:["TYE","COUNSEL"], leadDays:21, sla:"Seats 2+3 needed before 1023 filing", earlyWarn:"Seat 3 (Academic) has 60-day deliverable — Fellowship Handbook blocks cohort" },
    { id:"w5-4", track:"GTM", title:"FIFA 2026 Legacy Program — outreach to Host Committee", type:"ACTION", urgency:"HIGH", roles:["MIKALINA","TYE"], leadDays:90, sla:"FIFA activation window Q2 2027 — 9 months lead time required", earlyWarn:"Lead time to Converge launch = 9 months; start now" },
    { id:"w5-5", track:"FINANCIAL", title:"Q2 close prep — P&L by entity, AR aging, burn rate", type:"RECURRING", urgency:"HIGH", roles:["FINANCE","TYE"], leadDays:21, sla:"Q2 close = Sep 30; prep begins 3 months prior", earlyWarn:"" },
    { id:"w5-6", track:"GOVERNANCE", title:"IRS affirmation letter follow-up — NOVATELabs Inc name change", type:"ACTION", urgency:"MEDIUM", roles:["COUNSEL"], leadDays:0, sla:"EIN 39-4510998; letter outstanding since Feb 2026", earlyWarn:"Bank account name update blocked until letter received" },
  ]},
  { wk: 6, phase: 2, phaseName: "Acceleration", dates: "Jul 14–20", events: [
    { id:"w6-1", track:"COMMERCIAL", title:"NFL Q1 payment receipt confirmed — $475K cash", type:"MILESTONE", urgency:"HIGH", roles:["FINANCE","TYE"], leadDays:0, sla:"Net 30 from Jun 30 invoice = Jul 30 target", earlyWarn:"If not received by Jul 30, escalate to NFL AP contact" },
    { id:"w6-2", track:"NONPROFIT", title:"BGI Seats 2+3 — candidate acknowledgment briefs sent", type:"ACTION", urgency:"HIGH", roles:["TYE","COUNSEL"], leadDays:0, sla:"Director Brief sent; 5–10 day review period before screen", earlyWarn:"" },
    { id:"w6-3", track:"GTM", title:"Anchor partner deep-dive — quarterly research funding review", type:"RECURRING", urgency:"HIGH", roles:["TYE","ERIN"], leadDays:0, sla:"Quarterly cadence — Google/Microsoft/AWS/IBM", earlyWarn:"" },
    { id:"w6-4", track:"INFRA", title:"Document reference updates — HubSpot/Monday labels", type:"ACTION", urgency:"MEDIUM", roles:["ZOIE"], leadDays:0, sla:"NOVATELabs Inc name updated in all 16 files (completed Jun 8); system tools pending", earlyWarn:"HubSpot pipeline label still reads 'NovateUS Programs'" },
    { id:"w6-5", track:"COMMERCIAL", title:"EVERGAME post-go-live QBR prep — NFL client success review", type:"ACTION", urgency:"HIGH", roles:["ERIN","MIKALINA","TYE"], leadDays:14, sla:"30-day post-go-live QBR standard", earlyWarn:"" },
    { id:"w6-6", track:"PEOPLE", title:"Economic Mobility Lead hire — JD posted, outreach begins", type:"ACTION", urgency:"MEDIUM", roles:["TYE","VAL"], leadDays:60, sla:"P5 (Economic Mobility) gate-blocked without this hire", earlyWarn:"60-day hiring cycle — target Sep start" },
  ]},
  { wk: 7, phase: 2, phaseName: "Acceleration", dates: "Jul 21–27", events: [
    { id:"w7-1", track:"COMMERCIAL", title:"NFL 30-day post-go-live QBR — client success review", type:"RECURRING", urgency:"HIGH", roles:["ERIN","MIKALINA","TYE"], leadDays:0, sla:"QBR output drives Year 2 scope conversation", earlyWarn:"" },
    { id:"w7-2", track:"NONPROFIT", title:"BGI Director Seat 2 — independence screen + counsel opinion", type:"GATE", urgency:"HIGH", roles:["COUNSEL"], leadDays:0, sla:"Written independence opinion required before offer", earlyWarn:"" },
    { id:"w7-3", track:"GTM", title:"Converge Atlanta — event structure and venue LOI", type:"ACTION", urgency:"HIGH", roles:["MIKALINA","FREE"], leadDays:0, sla:"Q2 2027 activation; LOI 9 months prior", earlyWarn:"" },
    { id:"w7-4", track:"FINANCIAL", title:"IRC §482 transfer pricing Q1 true-up — RRH → Sentrais royalty", type:"RECURRING", urgency:"HIGH", roles:["FINANCE","COUNSEL"], leadDays:0, sla:"Quarterly review; contemporaneous documentation before year-end", earlyWarn:"" },
    { id:"w7-5", track:"INFRA", title:"HubSpot pipeline label update — BGI Programs live", type:"ACTION", urgency:"MEDIUM", roles:["ZOIE"], leadDays:0, sla:"CRM accuracy required for Q2/Q3 grant tracking", earlyWarn:"" },
    { id:"w7-6", track:"COMMERCIAL", title:"NFL Year 2 scope discussion — recertification program", type:"ACTION", urgency:"MEDIUM", roles:["TYE","MIKALINA"], leadDays:180, sla:"Year 2 begins Jan 1, 2027; renewal discussion 6 months prior", earlyWarn:"" },
  ]},
  { wk: 8, phase: 2, phaseName: "Acceleration", dates: "Jul 28–Aug 3", events: [
    { id:"w8-1", track:"NONPROFIT", title:"BGI Seats 2+3 seated — all directors governance package signed", type:"MILESTONE", urgency:"CRITICAL", roles:["BGI_DIRS","COUNSEL"], leadDays:0, sla:"Full board gates: Bylaws, Written Consent, COI Policy, Advisory Charter", earlyWarn:"" },
    { id:"w8-2", track:"FINANCIAL", title:"NFL Q1 payment received and booked — $475K", type:"MILESTONE", urgency:"HIGH", roles:["FINANCE"], leadDays:0, sla:"If not received by Jul 30, escalate immediately", earlyWarn:"Watch AR aging report" },
    { id:"w8-3", track:"GTM", title:"Small Business Accelerator — curriculum development begins", type:"ACTION", urgency:"MEDIUM", roles:["MIKALINA","VAL"], leadDays:90, sla:"Q1 2027 pilot launch; 20-week curriculum development cycle", earlyWarn:"" },
    { id:"w8-4", track:"COMMERCIAL", title:"Sentrais Federal — first government contracting opportunity scoped", type:"ACTION", urgency:"MEDIUM", roles:["DARRYL","TYE"], leadDays:0, sla:"OCI firebreak must be confirmed before any federal engagement", earlyWarn:"" },
    { id:"w8-5", track:"PEOPLE", title:"Sports & Community Impact Lead — hire decision", type:"ACTION", urgency:"HIGH", roles:["TYE"], leadDays:0, sla:"P6 (Sports/Culture) full activation blocked without this hire", earlyWarn:"Converge Atlanta gap — unblocks $75K pilot budget deployment" },
    { id:"w8-6", track:"NONPROFIT", title:"BGI Fellowship Handbook — Academic Committee drafting begins", type:"ACTION", urgency:"HIGH", roles:["BGI_DIRS"], leadDays:60, sla:"Handbook must be board-approved before cohort announcement; Q4 cohort needs Oct announcement", earlyWarn:"60-day drafting cycle from Seat 3 seating" },
  ]},
  { wk: 9, phase: 3, phaseName: "Momentum", dates: "Aug 4–10", events: [
    { id:"w9-1", track:"NONPROFIT", title:"BGI EIN received (est.) — bank account authorization triggered", type:"MILESTONE", urgency:"HIGH", roles:["BGI_DIRS","FINANCE"], leadDays:0, sla:"IRS EIN processing 4–6 weeks from filing; banking follows", earlyWarn:"" },
    { id:"w9-2", track:"COMMERCIAL", title:"NFL Q2 invoice prep — $475K quarterly license", type:"ACTION", urgency:"HIGH", roles:["FINANCE","TYE"], leadDays:14, sla:"Q2 invoice due Sep 30; Net 30 = Oct 30 cash", earlyWarn:"" },
    { id:"w9-3", track:"GTM", title:"Atlanta Readiness Roundtable — Q3 2026 launch", type:"MILESTONE", urgency:"HIGH", roles:["TYE","MIKALINA","DARRYL"], leadDays:0, sla:"P1 Civic Resilience pilot activation", earlyWarn:"" },
    { id:"w9-4", track:"FINANCIAL", title:"Q3 budget review — all entities; capital pool allocation", type:"RECURRING", urgency:"HIGH", roles:["FINANCE","TYE"], leadDays:0, sla:"Quarterly cadence — budget vs. actual; grant compliance report", earlyWarn:"" },
    { id:"w9-5", track:"GTM", title:"Community Innovation Lab — Cascade location LOI", type:"ACTION", urgency:"MEDIUM", roles:["MIKALINA","FREE"], leadDays:0, sla:"P2 pilot — Q4 2026 target; LOI 10 weeks prior", earlyWarn:"" },
    { id:"w9-6", track:"PEOPLE", title:"Executive Director (ARI/BGI) — position spec + search firm brief", type:"ACTION", urgency:"MEDIUM", roles:["TYE","BGI_DIRS"], leadDays:120, sla:"Most critical hire for ARI; 4–6 month search; needed by early 2027", earlyWarn:"" },
  ]},
  { wk: 10, phase: 3, phaseName: "Momentum", dates: "Aug 11–17", events: [
    { id:"w10-1", track:"NONPROFIT", title:"BGI banking — 5-account segregated structure live", type:"MILESTONE", urgency:"HIGH", roles:["BGI_DIRS","FINANCE"], leadDays:0, sla:"Treasurer only signatory; dual-sig above $5K", earlyWarn:"" },
    { id:"w10-2", track:"NONPROFIT", title:"ARI §25M Founding Campaign — prospectus draft begins", type:"ACTION", urgency:"MEDIUM", roles:["TYE"], leadDays:0, sla:"Q3–Q4 fundraising prep; prospectus 6 weeks to complete", earlyWarn:"" },
    { id:"w10-3", track:"GTM", title:"Dual-Generation Digital Literacy — curriculum development begins", type:"ACTION", urgency:"MEDIUM", roles:["VAL","BGI_DIRS"], leadDays:0, sla:"P4 pilot Q1 2027; 20-week curriculum cycle", earlyWarn:"" },
    { id:"w10-4", track:"COMMERCIAL", title:"MetaData delivery milestone — 90-day post-engagement review", type:"RECURRING", urgency:"HIGH", roles:["ERIN"], leadDays:0, sla:"MetaData guest access re-cert every 90 days", earlyWarn:"" },
    { id:"w10-5", track:"GOVERNANCE", title:"Annual director independence re-certification — all entities", type:"RECURRING", urgency:"HIGH", roles:["COUNSEL","BGI_DIRS"], leadDays:0, sla:"Annual cycle; first cycle Oct 2026 for BGI post-seating", earlyWarn:"" },
    { id:"w10-6", track:"GTM", title:"Civic Intelligence Fellows — program design, academic partner outreach", type:"ACTION", urgency:"MEDIUM", roles:["FREE"], leadDays:0, sla:"P7 pilot Q2 2027; academic partner agreements 6 months prior", earlyWarn:"" },
  ]},
  { wk: 11, phase: 3, phaseName: "Momentum", dates: "Aug 18–24", events: [
    { id:"w11-1", track:"NONPROFIT", title:"BGI Fellowship Handbook — board review + approval", type:"GATE", urgency:"CRITICAL", roles:["BGI_DIRS"], leadDays:0, sla:"Full board vote required; public cohort announcement blocked until approved", earlyWarn:"" },
    { id:"w11-2", track:"NONPROFIT", title:"IRS Form 1023 filing — BGI counsel leads", type:"GATE", urgency:"CRITICAL", roles:["COUNSEL","BGI_DIRS"], leadDays:0, sla:"IRS review: 3–6 months; provisional operation pending determination letter", earlyWarn:"BRIC references must be purged before filing; funding described as DOL WIOA + NSF only" },
    { id:"w11-3", track:"COMMERCIAL", title:"NFL Year 2 recertification program scoping — GDA recert curriculum", type:"ACTION", urgency:"HIGH", roles:["ERIN","MIKALINA"], leadDays:120, sla:"Jan 2027 Year 2 renewal; 4-month lead time for curriculum prep", earlyWarn:"" },
    { id:"w11-4", track:"FINANCIAL", title:"Q3 financial reporting — P&L, cash position, burn, AR aging", type:"RECURRING", urgency:"HIGH", roles:["FINANCE","TYE"], leadDays:0, sla:"Monthly delivery to CEO; quarterly board-level report", earlyWarn:"" },
    { id:"w11-5", track:"GTM", title:"Sentrais Federal — OCI analysis + first engagement scoped", type:"ACTION", urgency:"MEDIUM", roles:["DARRYL","TYE"], leadDays:0, sla:"Tenant B Federal_Practice/ OCI firebreak must be confirmed first", earlyWarn:"" },
    { id:"w11-6", track:"PEOPLE", title:"NOVATELabs program team — first staff hires scoped", type:"ACTION", urgency:"MEDIUM", roles:["TYE","BGI_DIRS"], leadDays:0, sla:"7-pillar program activation requires program leads by Q1 2027", earlyWarn:"" },
  ]},
  { wk: 12, phase: 3, phaseName: "Momentum", dates: "Aug 25–31", events: [
    { id:"w12-1", track:"COMMERCIAL", title:"NFL Q2 invoice submitted — $475K", type:"ACTION", urgency:"CRITICAL", roles:["TYE","FINANCE"], leadDays:0, sla:"Net 30 = Oct 30 cash", earlyWarn:"" },
    { id:"w12-2", track:"NONPROFIT", title:"Barbara Geter Fellowship — cohort announcement Q4", type:"MILESTONE", urgency:"HIGH", roles:["BGI_DIRS","TYE"], leadDays:0, sla:"Public announcement only after: EIN received, Handbook approved, 1023 filed", earlyWarn:"" },
    { id:"w12-3", track:"GTM", title:"Q3 QBR — NFL + all active clients; pipeline review", type:"RECURRING", urgency:"HIGH", roles:["TYE","ERIN","VAL"], leadDays:0, sla:"End of Q3 = Sep 30; QBR prep 2 weeks prior", earlyWarn:"" },
    { id:"w12-4", track:"FINANCIAL", title:"Year-end tax planning — QSBS, IRC §482, BGI §4958 true-up", type:"ACTION", urgency:"HIGH", roles:["FINANCE","COUNSEL"], leadDays:120, sla:"Dec 31 deadline; 4-month lead time for complex multi-entity planning", earlyWarn:"" },
    { id:"w12-5", track:"GTM", title:"Converge Atlanta — first anchor sponsor commitment secured", type:"MILESTONE", urgency:"HIGH", roles:["MIKALINA","TYE"], leadDays:0, sla:"FIFA 2026 activation Q2 2027; anchor sponsor needed 6 months prior", earlyWarn:"" },
    { id:"w12-6", track:"PEOPLE", title:"90-day team retrospective — all roles; founder dependency score", type:"RECURRING", urgency:"HIGH", roles:["TYE"], leadDays:0, sla:"Quarterly cadence; update Program Inventory Workbook Tab 9 (Founder Dependency)", earlyWarn:"" },
  ]},
];

const GOLDEN_ROUTES = {
  TYE:      { dailyRhythm: "8–10 AM deep work (protected) · 9:15 AM standup · Tue/Wed anchor partner calls · Thu 1-on-1s", weeklyOwns: ["Anchor partner relationships (Amazon, Google, IBM, Microsoft)", "Final approval on all T2+ spend", "Strategic decisions <15 min", "NFL + FIFA relationship stewardship", "BGI governance oversight (advisory role only)"], keyDependencies: ["Erin: release gates", "Finance: cash position", "Counsel: legal filings", "BGI Directors: nonprofit governance"], earlyWarnings: ["83(b) deadline Jun 28 — already in warning zone", "NFL go-live Jun 30 — 3 weeks out", "BGI counsel retainer — unblocks all nonprofit formation"] },
  ERIN:     { dailyRhythm: "Platform delivery stand-up · Tech anchor partner prep · Gate review before any release", weeklyOwns: ["All platform releases gated (no release without CTO approval)", "Anchor partner technical alignment", "MetaData delivery oversight", "NFL SLA monitoring (99.5% uptime)"], keyDependencies: ["Mikalina: client requirements", "Zoie: M365 tenant configs", "MetaData: delivery execution"], earlyWarnings: ["NFL go-live Jun 30 — confirm SEG readiness this week", "M365 tenant audit — shared accounts still exist"] },
  MIKALINA: { dailyRhythm: "Sports delivery daily · Atlanta POC progress check · Community partner touchpoints", weeklyOwns: ["Sports vertical delivery (NFL, FIFA prep)", "Atlanta POC charter execution", "Converge Atlanta activation", "FIFA Legacy Program outreach"], keyDependencies: ["Erin: platform delivery", "Val: channel partnerships", "BGI Directors: program governance for community programming"], earlyWarnings: ["Converge Atlanta needs anchor sponsor by Nov 2026 (FIFA Q2 2027)", "Small Business Accelerator needs curriculum start by Aug"] },
  VAL:      { dailyRhythm: "Channel pipeline review · Partner touchpoints · Onboarding status check", weeklyOwns: ["Channel partner strategy", "Municipal partnerships (City of Atlanta primary)", "Onboarding accountability with Zoie", "Supplier diversity network for P5"], keyDependencies: ["Zoie: onboarding execution", "Mikalina: sports partnerships", "BGI Directors: community partner agreements"], earlyWarnings: ["HubSpot pipeline still labeled NovateUS Programs — update this week", "P5 Economic Mobility Lead hire unblocks supplier diversity programs"] },
  DARRYL:   { dailyRhythm: "FEMA/SEAR daily brief · Multi-agency coordination · Grant compliance check", weeklyOwns: ["SEAR/FEMA vertical strategy and delivery", "Government grant lifecycle (WIOA, FEMA grants)", "Multi-agency coordination", "Sentrais Federal opportunity scoping"], keyDependencies: ["Counsel: OCI clearance for federal engagements", "Erin: SIPE/FORGE compliance for government deployments", "Finance: grant accounting"], earlyWarnings: ["BRIC references must be removed from BGI 1023 narrative", "Sentrais Federal OCI firebreak must be confirmed before any federal engagement"] },
  FREE:     { dailyRhythm: "Live events pipeline review · Strategic recruitment support · Community Innovation Lab progress", weeklyOwns: ["Live events vertical (EntertainmentOS, LiveNation360)", "Community Innovation Lab siting and partnerships", "Civic Intelligence Fellows program design"], keyDependencies: ["Mikalina: sports handoff after Jun 30", "BGI Directors: nonprofit program approval for community labs"], earlyWarnings: ["Sports interim support ends Jun 30 — handoff to Mikalina confirmed?", "Community Innovation Lab Q4 target — LOI needed by Sep"] },
  ZOIE:     { dailyRhythm: "Operations standup · PM tool dashboard review · Onboarding status update", weeklyOwns: ["PM tool management (Monday.com)", "M365 tenant isolation migration", "Partner/client onboarding", "Document reference updates (16 files + HubSpot/Monday labels)"], keyDependencies: ["Erin: IT Admin coordination for M365", "Val: onboarding standards"], earlyWarnings: ["M365 30-day isolation deadline Jul 7 — inventory audit must complete this week", "Document reference updates: HubSpot, Monday.com labels still stale"] },
  FINANCE:  { dailyRhythm: "AR aging review · Entity P&L update · Capital pool allocation check", weeklyOwns: ["Monthly P&L by entity (Sentrais, NOVATELabs, BGI separate)", "Cash position and burn/runway", "NFL invoice cycle ($475K quarterly)", "NetSuite ERP split-routing rule (10–25% royalty to RRH)", "Transfer pricing documentation (IRC §482)"], keyDependencies: ["TYE: T2+ spend approvals", "Counsel: §4958 documentation", "BGI Directors: grant accounting governance"], earlyWarnings: ["July 1 accounting switch — 14 days — NetSuite/ADP config must complete", "NFL Q1 cash receipt due Jul 30 — watch AR aging", "Year-end tax planning 4-month lead time — start now"] },
};

// Week start dates for calendar mapping
const WEEK_STARTS = { 1:new Date(2026,5,8), 2:new Date(2026,5,15), 3:new Date(2026,5,22), 4:new Date(2026,5,29), 5:new Date(2026,6,7), 6:new Date(2026,6,14), 7:new Date(2026,6,21), 8:new Date(2026,6,28), 9:new Date(2026,7,4), 10:new Date(2026,7,11), 11:new Date(2026,7,18), 12:new Date(2026,7,25) };

function getWeekNumForDate(d) {
  let found = null;
  for (let wk = 12; wk >= 1; wk--) {
    if (d >= WEEK_STARTS[wk]) { found = wk; break; }
  }
  return found;
}

function getEventsForDate(y, m, day) {
  const d = new Date(y, m, day);
  const wk = getWeekNumForDate(d);
  if (!wk) return [];
  return (WEEKS.find(w => w.wk === wk)?.events || []);
}

function getCalendarDays(y, m) {
  const first = new Date(y, m, 1);
  const days = new Date(y, m + 1, 0).getDate();
  const startCol = (first.getDay() + 6) % 7; // Mon=0
  const cells = Array(startCol).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const PHASE_COLORS = { 1: C.accent, 2: C.teal, 3: C.purple };
const TYPE_ICON = { DEADLINE: "⏰", GATE: "🚧", MILESTONE: "🏁", ACTION: "→", RECURRING: "↻" };
const URGENCY_VARIANT = { CRITICAL: "danger", HIGH: "warning", MEDIUM: "neutral", LOW: "success" };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CALENDAR_MONTHS = [[2026, 5], [2026, 6], [2026, 7]]; // Jun, Jul, Aug 2026

const VIEW_TABS = ["Month", "Week", "Day", "Timeline", "Critical Path", "Golden Route", "Dependencies"];

export default function MasterCalendar() {
  const [view, setView] = useState(0); // 0=Month, 1=Week, 2=Day, 3=Timeline, 4=Critical, 5=Golden, 6=Deps
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 5, 9)); // Jun 9 today
  const [selectedWeekNum, setSelectedWeekNum] = useState(1);
  const [selectedRole, setSelectedRole] = useState("TYE");
  const [selectedTrack, setSelectedTrack] = useState("ALL");
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const allCritical = WEEKS.flatMap(w => w.events).filter(e => e.urgency === "CRITICAL");
  const weekData = WEEKS.find(w => w.wk === selectedWeekNum);
  const selectedWeekNum2 = getWeekNumForDate(selectedDate) || 1;
  const dayWeekData = WEEKS.find(w => w.wk === selectedWeekNum2);

  const filteredWeeks = WEEKS.map(wk => ({
    ...wk,
    events: wk.events.filter(e => selectedTrack === "ALL" || e.track === selectedTrack)
  })).filter(wk => wk.events.length > 0);

  function MonthGrid({ year, month }) {
    const cells = getCalendarDays(year, month);
    const today = new Date(2026, 5, 9);
    return (
      <div>
        <div style={{ textAlign: "center", marginBottom: 8, color: C.accent, fontWeight: 700, fontSize: 13 }}>
          {MONTHS[month]} {year}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} style={{ fontSize: 10, color: "#64748b", textAlign: "center", padding: "4px 0", fontWeight: 600 }}>{d}</div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={i} style={{ height: 46 }} />;
            const d = new Date(year, month, day);
            const events = getEventsForDate(year, month, day);
            const isToday = d.toDateString() === today.toDateString();
            const isSel = selectedDate && d.toDateString() === selectedDate.toDateString();
            const hasCrit = events.some(e => e.urgency === "CRITICAL");
            const hasHigh = events.some(e => e.urgency === "HIGH");
            return (
              <div key={i} onClick={() => { setSelectedDate(new Date(year, month, day)); if (view === 0) setView(2); }}
                style={{ height: 46, borderRadius: 6, cursor: events.length ? "pointer" : "default", padding: "4px 2px", textAlign: "center", background: isSel ? C.accent : isToday ? "rgba(14,165,233,0.2)" : "transparent", border: `1px solid ${isToday ? C.accent : "transparent"}` }}>
                <div style={{ fontSize: 12, color: isSel ? "#fff" : "#e2e8f0" }}>{day}</div>
                {events.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 3 }}>
                    {hasCrit && <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.red }} />}
                    {hasHigh && <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.amber }} />}
                    {!hasCrit && !hasHigh && events.length > 0 && <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.teal }} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <ForgePage>
      <ForgeHeader
        icon="📅"
        title="Unified Master Calendar"
        subtitle="Sentrais · NOVATELabs · BGI — 12-Week Schedule · Jun–Aug 2026 · 9 Roles · Early Warning System"
        stats={[
          { label: "Total Events", value: String(WEEKS.flatMap(w => w.events).length) },
          { label: "Critical", value: String(allCritical.length) },
          { label: "Weeks", value: "12" },
          { label: "Roles", value: "9" },
        ]}
      />

      {/* Critical warning strip */}
      <div style={{ padding: "8px 24px", background: "rgba(239,68,68,0.1)", borderBottom: `1px solid rgba(239,68,68,0.2)`, display: "flex", gap: 20, flexWrap: "wrap", overflowX: "auto" }}>
        {allCritical.slice(0, 4).map(e => (
          <span key={e.id} style={{ fontSize: 11, color: "#fca5a5", whiteSpace: "nowrap" }}>
            ⚠ {e.title.length > 50 ? e.title.slice(0, 47) + "..." : e.title}
          </span>
        ))}
      </div>

      <ForgeTabs tabs={VIEW_TABS} active={view} onChange={setView} />
      <ForgeContent>

        {/* ── MONTH VIEW ── */}
        {view === 0 && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#64748b" }}>
                <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: C.red, marginRight: 4 }} />Critical</span>
                <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: C.amber, marginRight: 4 }} />High</span>
                <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: C.teal, marginRight: 4 }} />Other</span>
                <span style={{ color: C.accent }}>Click a date to view day detail</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {CALENDAR_MONTHS.map(([y, m]) => (
                <div key={`${y}-${m}`} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px" }}>
                  <MonthGrid year={y} month={m} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WEEK VIEW ── */}
        {view === 1 && (
          <div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {WEEKS.map(w => (
                <button key={w.wk} onClick={() => setSelectedWeekNum(w.wk)} style={{
                  padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                  background: selectedWeekNum === w.wk ? PHASE_COLORS[w.phase] : C.surface,
                  border: `1px solid ${selectedWeekNum === w.wk ? PHASE_COLORS[w.phase] : C.border}`,
                  color: selectedWeekNum === w.wk ? "#fff" : "#94a3b8",
                }}>Wk{w.wk} <span style={{ fontSize: 10, opacity: 0.7 }}>{w.dates.split("–")[0]}</span></button>
              ))}
            </div>

            {weekData && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 3, height: 36, background: PHASE_COLORS[weekData.phase], borderRadius: 2 }} />
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>Week {weekData.wk} — {weekData.dates}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Phase {weekData.phase}: {weekData.phaseName}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {weekData.events.map(ev => {
                    const t = TRACKS[ev.track];
                    const isEx = expandedEvent === ev.id;
                    return (
                      <div key={ev.id} onClick={() => setExpandedEvent(isEx ? null : ev.id)}
                        style={{ background: C.surface, border: `1px solid ${isEx ? t.color : C.border}`, borderLeft: `3px solid ${t.color}`, borderRadius: 10, overflow: "hidden", cursor: "pointer" }}>
                        <div style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14, flexShrink: 0 }}>{TYPE_ICON[ev.type]}</span>
                          <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 4, background: `${t.color}22`, color: t.color, flexShrink: 0 }}>{t.label}</span>
                          <span style={{ flex: 1, fontSize: 13, color: "#e2e8f0" }}>{ev.title}</span>
                          <ForgeBadge variant={URGENCY_VARIANT[ev.urgency] || "neutral"}>{ev.urgency}</ForgeBadge>
                          <span style={{ fontSize: 11, color: "#4a6080" }}>{ev.roles.join(" · ")}</span>
                        </div>
                        {isEx && (
                          <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            {ev.sla && <div style={{ fontSize: 11 }}><span style={{ color: C.purple }}>SLA: </span><span style={{ color: "#94a3b8" }}>{ev.sla}</span></div>}
                            {ev.leadDays > 0 && <div style={{ fontSize: 11 }}><span style={{ color: C.accent }}>Lead time: </span><span style={{ color: "#94a3b8" }}>{ev.leadDays} days</span></div>}
                            {ev.earlyWarn && <div style={{ fontSize: 11, gridColumn: "1 / -1" }}><span style={{ color: C.amber }}>⚠ Early Warning: </span><span style={{ color: "#fde68a" }}>{ev.earlyWarn}</span></div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DAY VIEW ── */}
        {view === 2 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate()-1); setSelectedDate(d); }} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 14px", color: "#94a3b8", cursor: "pointer", fontSize: 13 }}>← Prev</button>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </div>
                {dayWeekData && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Week {dayWeekData.wk} ({dayWeekData.dates}) · Phase {dayWeekData.phase}: {dayWeekData.phaseName}</div>}
              </div>
              <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate()+1); setSelectedDate(d); }} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 14px", color: "#94a3b8", cursor: "pointer", fontSize: 13 }}>Next →</button>
            </div>

            {dayWeekData ? (
              <div>
                <ForgeAlert level="info" title={`Week ${dayWeekData.wk} Context`}>
                  This date falls in {dayWeekData.dates} (Phase {dayWeekData.phase}: {dayWeekData.phaseName}). Showing all {dayWeekData.events.length} events for this week.
                </ForgeAlert>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                  {dayWeekData.events.map(ev => {
                    const t = TRACKS[ev.track];
                    return (
                      <div key={ev.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${t.color}`, borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontSize: 14 }}>{TYPE_ICON[ev.type]}</span>
                          <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 4, background: `${t.color}22`, color: t.color }}>{t.label}</span>
                          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{ev.title}</span>
                          <ForgeBadge variant={URGENCY_VARIANT[ev.urgency] || "neutral"}>{ev.urgency}</ForgeBadge>
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>Roles: {ev.roles.join(" · ")} {ev.leadDays > 0 && `· Lead time: ${ev.leadDays} days`}</div>
                        {ev.sla && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>SLA: {ev.sla}</div>}
                        {ev.earlyWarn && <div style={{ fontSize: 11, color: "#fde68a", marginTop: 4 }}>⚠ {ev.earlyWarn}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <ForgeAlert level="info" title="No Events">
                No scheduled events for this date. The calendar covers Jun 8 – Aug 31, 2026.
              </ForgeAlert>
            )}
          </div>
        )}

        {/* ── TIMELINE VIEW ── */}
        {view === 3 && (
          <div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              <button onClick={() => setSelectedTrack("ALL")} style={{ padding: "4px 12px", borderRadius: 5, fontSize: 11, cursor: "pointer", background: selectedTrack === "ALL" ? C.surface : "transparent", border: `1px solid ${C.border}`, color: selectedTrack === "ALL" ? "#e2e8f0" : "#64748b" }}>ALL TRACKS</button>
              {Object.values(TRACKS).map(t => (
                <button key={t.id} onClick={() => setSelectedTrack(t.id)} style={{ padding: "4px 10px", borderRadius: 5, fontSize: 11, cursor: "pointer", background: selectedTrack === t.id ? `${t.color}33` : "transparent", border: `1px solid ${t.color}66`, color: selectedTrack === t.id ? t.color : `${t.color}88` }}>{t.label}</button>
              ))}
            </div>

            {[1, 2, 3].map(phase => {
              const phaseWeeks = filteredWeeks.filter(w => w.phase === phase);
              if (!phaseWeeks.length) return null;
              const pc = PHASE_COLORS[phase];
              const phaseNames = { 1: "Phase 1: Foundation", 2: "Phase 2: Acceleration", 3: "Phase 3: Momentum" };
              return (
                <div key={phase} style={{ marginBottom: 28 }}>
                  <div style={{ borderLeft: `3px solid ${pc}`, paddingLeft: 12, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: pc, letterSpacing: "2px" }}>{phaseNames[phase].toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{phaseWeeks[0]?.dates} – {phaseWeeks[phaseWeeks.length - 1]?.dates}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {phaseWeeks.map(wk => (
                      <div key={wk.wk}>
                        <div onClick={() => setExpandedWeek(expandedWeek === wk.wk ? null : wk.wk)}
                          style={{ background: C.surface, border: `1px solid ${expandedWeek === wk.wk ? pc : C.border}`, borderRadius: 8, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ background: pc, color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 3, flexShrink: 0 }}>WK{wk.wk}</span>
                          <span style={{ color: "#64748b", fontSize: 11, flexShrink: 0 }}>{wk.dates}</span>
                          <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
                            {wk.events.filter(e => e.urgency === "CRITICAL").map(e => (
                              <span key={e.id} style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5", fontSize: 10, padding: "1px 6px", borderRadius: 3 }}>🔴 {e.title.length > 35 ? e.title.slice(0,32)+"..." : e.title}</span>
                            ))}
                            {wk.events.filter(e => e.urgency === "HIGH").slice(0,2).map(e => (
                              <span key={e.id} style={{ background: "rgba(245,158,11,0.1)", color: "#fde68a", fontSize: 10, padding: "1px 6px", borderRadius: 3 }}>{e.title.length > 30 ? e.title.slice(0,27)+"..." : e.title}</span>
                            ))}
                          </div>
                          <span style={{ color: "#4a6080", fontSize: 11, flexShrink: 0 }}>{expandedWeek === wk.wk ? "▲" : "▼"} {wk.events.length}</span>
                        </div>
                        {expandedWeek === wk.wk && (
                          <div style={{ marginLeft: 14, borderLeft: `1px solid ${pc}44`, paddingLeft: 14, marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                            {wk.events.map(ev => {
                              const t = TRACKS[ev.track];
                              const isEx = expandedEvent === ev.id;
                              return (
                                <div key={ev.id} onClick={() => setExpandedEvent(isEx ? null : ev.id)}
                                  style={{ background: C.bg, border: `1px solid ${isEx ? t.color : C.border}`, borderRadius: 6, padding: "8px 12px", cursor: "pointer" }}>
                                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 12 }}>{TYPE_ICON[ev.type]}</span>
                                    <span style={{ background: `${t.color}22`, color: t.color, fontSize: 9, padding: "1px 6px", borderRadius: 3 }}>{t.label}</span>
                                    <span style={{ flex: 1, fontSize: 12, color: "#e2e8f0" }}>{ev.title}</span>
                                    <ForgeBadge variant={URGENCY_VARIANT[ev.urgency] || "neutral"}>{ev.urgency}</ForgeBadge>
                                    <span style={{ color: "#4a6080", fontSize: 9 }}>{ev.roles.join(" · ")}</span>
                                  </div>
                                  {isEx && (
                                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                      {ev.sla && <div style={{ fontSize: 11 }}><span style={{ color: C.purple }}>SLA: </span><span style={{ color: "#94a3b8" }}>{ev.sla}</span></div>}
                                      {ev.leadDays > 0 && <div style={{ fontSize: 11 }}><span style={{ color: C.accent }}>Lead: </span><span style={{ color: "#94a3b8" }}>{ev.leadDays}d</span></div>}
                                      {ev.earlyWarn && <div style={{ fontSize: 11, gridColumn: "1 / -1" }}><span style={{ color: C.amber }}>⚠ </span><span style={{ color: "#fde68a" }}>{ev.earlyWarn}</span></div>}
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
        {view === 4 && (
          <div>
            <ForgeAlert level="critical" title="Critical Path">
              All deadlines, gates, and milestones that block downstream work. Resolve in order.
            </ForgeAlert>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
              {WEEKS.flatMap(w => w.events.filter(e => e.urgency === "CRITICAL" || e.type === "GATE" || e.type === "MILESTONE").map(e => ({ ...e, wk: w.wk, dates: w.dates, phase: w.phase }))).map(ev => {
                const t = TRACKS[ev.track];
                const pc = PHASE_COLORS[ev.phase];
                return (
                  <div key={ev.id} style={{ background: C.surface, border: `1px solid ${ev.urgency === "CRITICAL" ? "rgba(239,68,68,0.4)" : C.border}`, borderLeft: `3px solid ${ev.urgency === "CRITICAL" ? C.red : t.color}`, borderRadius: 10, padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                      <span style={{ background: pc, color: "#fff", fontSize: 9, padding: "2px 8px", borderRadius: 3, flexShrink: 0, marginTop: 2 }}>WK{ev.wk} · {ev.dates}</span>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{TYPE_ICON[ev.type]}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{ev.title}</div>
                        {ev.sla && <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>SLA: {ev.sla}</div>}
                        {ev.earlyWarn && <div style={{ fontSize: 11, color: "#fde68a" }}>⚠ {ev.earlyWarn}</div>}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <ForgeBadge variant={URGENCY_VARIANT[ev.urgency] || "neutral"}>{ev.urgency}</ForgeBadge>
                        <div style={{ fontSize: 9, color: "#4a6080", marginTop: 4 }}>{ev.roles.join(" · ")}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── GOLDEN ROUTE ── */}
        {view === 5 && (
          <div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {Object.values(ROLES).map(r => (
                <button key={r.id} onClick={() => setSelectedRole(r.id)} style={{ padding: "4px 10px", borderRadius: 5, fontSize: 11, cursor: "pointer", background: selectedRole === r.id ? r.color : C.surface, border: `1px solid ${selectedRole === r.id ? r.color : C.border}`, color: selectedRole === r.id ? "#fff" : "#94a3b8" }}>{r.id}</button>
              ))}
            </div>

            {GOLDEN_ROUTES[selectedRole] && (
              <div>
                <ForgeCard accent={ROLES[selectedRole].color} style={{ marginBottom: 20 }}>
                  <ForgeCardHeader title={ROLES[selectedRole].label} subtitle="Golden Route" />
                  <ForgeCardBody>
                    <div style={{ marginBottom: 12, fontSize: 13, color: "#94a3b8" }}>{GOLDEN_ROUTES[selectedRole].dailyRhythm}</div>
                    <ForgeGrid cols={2}>
                      <div>
                        <ForgeLabel style={{ marginBottom: 8 }}>This Role Owns</ForgeLabel>
                        {GOLDEN_ROUTES[selectedRole].weeklyOwns.map((o, i) => (
                          <div key={i} style={{ fontSize: 12, color: "#94a3b8", padding: "3px 0", borderBottom: `1px solid ${C.border}` }}>
                            <span style={{ color: ROLES[selectedRole].color }}>→ </span>{o}
                          </div>
                        ))}
                      </div>
                      <div>
                        <ForgeLabel style={{ marginBottom: 8 }}>Key Dependencies</ForgeLabel>
                        {GOLDEN_ROUTES[selectedRole].keyDependencies.map((d, i) => (
                          <div key={i} style={{ fontSize: 12, color: "#94a3b8", padding: "2px 0" }}>
                            <span style={{ color: C.purple }}>⟶ </span>{d}
                          </div>
                        ))}
                        <ForgeLabel style={{ marginTop: 12, marginBottom: 8, color: C.red }}>Early Warnings</ForgeLabel>
                        {GOLDEN_ROUTES[selectedRole].earlyWarnings.map((w, i) => (
                          <div key={i} style={{ fontSize: 12, color: "#fca5a5", padding: "2px 0" }}>⚠ {w}</div>
                        ))}
                      </div>
                    </ForgeGrid>
                  </ForgeCardBody>
                </ForgeCard>

                <ForgeLabel style={{ marginBottom: 12 }}>Events for {selectedRole} — Weeks 1–12</ForgeLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {WEEKS.flatMap(w => w.events.filter(e => e.roles.includes(selectedRole)).map(e => ({ ...e, wk: w.wk, dates: w.dates, phase: w.phase }))).map(ev => {
                    const t = TRACKS[ev.track];
                    const pc = PHASE_COLORS[ev.phase];
                    return (
                      <div key={ev.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderLeft: `2px solid ${t.color}`, borderRadius: 8, padding: "8px 12px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 3, background: `${pc}33`, color: pc, flexShrink: 0 }}>WK{ev.wk}</span>
                        <span style={{ fontSize: 12 }}>{TYPE_ICON[ev.type]}</span>
                        <span style={{ flex: 1, fontSize: 12, color: "#e2e8f0" }}>{ev.title}</span>
                        <ForgeBadge variant={URGENCY_VARIANT[ev.urgency] || "neutral"}>{ev.urgency}</ForgeBadge>
                        {ev.leadDays > 0 && <span style={{ fontSize: 10, color: C.accent }}>+{ev.leadDays}d lead</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DEPENDENCIES ── */}
        {view === 6 && (
          <div>
            <ForgeAlert level="info" title="Dependency Map">
              Events with explicit upstream dependencies. Upstream item must complete before downstream can begin.
            </ForgeAlert>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {WEEKS.flatMap(w => w.events.filter(e => e.deps?.length > 0).map(e => ({ ...e, wk: w.wk, dates: w.dates, phase: w.phase }))).map(ev => {
                const t = TRACKS[ev.track];
                return (
                  <div key={ev.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                      <span style={{ background: `${t.color}22`, color: t.color, fontSize: 9, padding: "1px 7px", borderRadius: 3 }}>WK{ev.wk} · {ev.dates}</span>
                      <span style={{ flex: 1, fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{ev.title}</span>
                      <ForgeBadge variant={URGENCY_VARIANT[ev.urgency] || "neutral"}>{ev.urgency}</ForgeBadge>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingLeft: 8 }}>
                      <span style={{ fontSize: 11, color: C.purple }}>REQUIRES:</span>
                      {(ev.deps || []).map(d => {
                        const dep = WEEKS.flatMap(w => w.events).find(e => e.id === d);
                        return dep ? (
                          <span key={d} style={{ background: `${C.purple}22`, color: "#a78bfa", fontSize: 11, padding: "2px 8px", borderRadius: 4 }}>
                            {dep.title.length > 40 ? dep.title.slice(0, 37) + "..." : dep.title}
                          </span>
                        ) : null;
                      })}
                    </div>
                    {ev.leadDays > 0 && <div style={{ fontSize: 10, color: C.accent, marginTop: 4, paddingLeft: 8 }}>Lead time required: {ev.leadDays} days</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </ForgeContent>
    </ForgePage>
  );
}

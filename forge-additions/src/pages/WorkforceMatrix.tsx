// @ts-nocheck
import { useState } from "react";
import { Users, UserCheck, BookOpen, Briefcase, Heart, ShieldOff, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody, ForgeLabel,
  ForgeBadge, ForgeAlert, ForgeGrid, C,
} from "../components/ui/forge";

const WORKER_TYPES = [
  {
    id: "employee",
    label: "Employee",
    badge: "W-2",
    icon: UserCheck,
    color: C.accent,
    subtypes: ["Full-Time (FT)", "Part-Time (PT)"],
    description: "Core team members on payroll with full benefits, equity eligibility, and corporate resource access. Subject to FLSA, I-9, and standard HR policies.",
    benefits: {
      health: true, dental: true, vision: true, equity: true,
      corpCard: true, laptop: true, m365: true, crm: true, monday: true,
    },
    taxForm: "W-2",
    payMethod: "Bi-weekly payroll (ADP)",
    legalDocs: ["Offer letter", "I-9 verification", "NDA + IP assignment", "Benefits enrollment", "83(b) election if equity granted"],
    onboarding: [
      "FLSA classification confirmed by counsel before offer",
      "Offer letter executed (NDA + IP assignment included)",
      "ADP/NetSuite employee record created",
      "M365 Tenant B account provisioned",
      "HubSpot CRM + Monday.com access granted",
      "Benefits enrollment opened (30-day window)",
      "Equity grant + 83(b) election if applicable (30-day IRREVOCABLE deadline)",
      "Week 1 onboarding plan from Zoie",
      "Weekly 1-on-1 with direct supervisor scheduled",
    ],
    restrictions: [],
    warnings: [
      "83(b) equity election — 30-day irrevocable deadline from grant date",
      "Part-time < 30 hrs/week may not qualify for benefits — confirm before offer",
    ],
  },
  {
    id: "contractor",
    label: "Contractor",
    badge: "1099",
    icon: Briefcase,
    color: C.purple,
    subtypes: ["SOW-Based Fractional", "Project-Based"],
    description: "Independent contractors engaged via Master Service Agreement (MSA) and Statements of Work (SOW). No benefits, no corporate cards, no payroll. Paid Net-30 on approved invoice.",
    benefits: {
      health: false, dental: false, vision: false, equity: false,
      corpCard: false, laptop: false, m365: "guest only", crm: false, monday: "scoped only",
    },
    taxForm: "1099-NEC (if ≥ $600/yr)",
    payMethod: "Net-30 invoice — ACH or check",
    legalDocs: ["W-9 on file before first payment", "MSA executed", "SOW with scope, milestones, payment schedule", "NDA", "IP assignment clause in SOW"],
    onboarding: [
      "Independence test confirmed — behavioral + financial control",
      "W-9 collected before any payment",
      "MSA executed (covers all engagements)",
      "SOW executed — scope, milestones, payment terms explicit",
      "NDA executed",
      "Guest M365 access provisioned (scoped to project site only)",
      "Invoice template provided; Net-30 terms confirmed",
      "NO company card issued under any circumstances",
      "Quarterly: access rights re-certified, SOW renewal evaluated",
    ],
    restrictions: [
      "No corporate card — ever",
      "No benefits enrollment",
      "No equity grants",
      "No direct client relationship without Founder present",
      "No government deal finder-fee terms — route to counsel",
    ],
    warnings: [
      "Misclassification risk if behavioral/financial control test fails — route to counsel",
      "New payee bank details must be independently verified by phone before first payment",
    ],
  },
  {
    id: "fellow",
    label: "Fellow",
    badge: "FELLOW",
    icon: BookOpen,
    color: C.teal,
    subtypes: ["Civic Tech Fellow (NOVATELabs)", "Resilience Ops Fellow (Sentrais Corp)", "BGI Community Associate (pending EIN)"],
    description: "Fixed-term strategic contributors embedded in active GTM pods or city initiatives. Stipend-based. Not employees or contractors. IP assignment required. BGI fellows fully blocked until EIN confirmed.",
    benefits: {
      health: false, dental: false, vision: false, equity: false,
      corpCard: false, laptop: "program-provided", m365: "scoped", crm: false, monday: "limited",
    },
    taxForm: "1099-NEC if stipend ≥ $600",
    payMethod: "Monthly stipend disbursement",
    legalDocs: ["Fellowship agreement", "NDA", "IP assignment clause", "W-9 / tax form", "BGI: FERPA consent + IRB compliance where applicable"],
    onboarding: [
      "Fellowship agreement executed before Day 1",
      "IP assignment clause in agreement — all work product is org property",
      "NDA signed before any access granted",
      "Mentor assigned (senior pod member or program lead)",
      "Weekly 1-on-1 with mentor — mandatory",
      "Scoped M365 access provisioned",
      "Stipend schedule confirmed in writing",
      "BGI fellows: GATE — EIN must be confirmed before program launch",
    ],
    restrictions: [
      "No corporate card",
      "No standard employee benefits",
      "BGI fellows: zero access to Sentrais Corp or NOVATELabs systems — BGI accounts only",
      "No access to proprietary commercial CRM data",
    ],
    warnings: [
      "BGI Community Associates BLOCKED — EIN not yet confirmed. Zero funds from commercial entity.",
      "All stipends may require 1099-NEC if ≥ $600 cumulative — confirm with CFO",
    ],
  },
  {
    id: "intern",
    label: "Intern",
    badge: "INTERN",
    icon: BookOpen,
    color: C.amber,
    subtypes: ["Paid Intern (college-level)", "Future Workforce Apprentice (HS 16–18)"],
    description: "Educational contributors on a fixed growth timeline. Mentorship is mandatory. For HS-age apprentices (16–18): parental consent, school MOU, and background check required before offer letters.",
    benefits: {
      health: false, dental: false, vision: false, equity: false,
      corpCard: false, laptop: "loaner", m365: "scoped", crm: false, monday: "scoped",
    },
    taxForm: "W-2 if paid by payroll; 1099-NEC if stipend ≥ $600",
    payMethod: "Stipend or hourly (bi-weekly)",
    legalDocs: ["Intern offer letter / agreement", "NDA", "IP assignment", "W-9 or I-9 depending on pay method", "Minors: parental consent form", "Minors: school district MOU"],
    onboarding: [
      "For ages 16–18: parental consent form signed by guardian",
      "For ages 16–18: school district MOU executed before offer",
      "Background check (required for minors — run via HR)",
      "Intern agreement executed (NDA + IP assignment)",
      "Mentor assigned — mandatory weekly 1-on-1",
      "Scoped system access provisioned",
      "Orientation week: workplace safety, tech intro, mentor meet-and-greet",
      "Success criteria documented before program start",
    ],
    restrictions: [
      "No corporate card",
      "No access to sensitive financial or legal data",
      "Minors: no unsupervised client contact",
      "No government contract deliverable ownership",
    ],
    warnings: [
      "School District MOU must be executed BEFORE intern offer letters for Future Workforce track",
      "Background check required for all minor participants — non-negotiable",
    ],
  },
  {
    id: "volunteer",
    label: "Volunteer",
    badge: "VOL",
    icon: Heart,
    color: C.green,
    subtypes: ["Community-Facing Volunteer", "Event Support Volunteer"],
    description: "Community contributors supporting public-facing initiatives. No compensation, no proprietary data access, no CRM access. Strictly limited to community-visible activities.",
    benefits: {
      health: false, dental: false, vision: false, equity: false,
      corpCard: false, laptop: false, m365: false, crm: false, monday: false,
    },
    taxForm: "None — no compensation",
    payMethod: "None",
    legalDocs: ["Volunteer agreement", "Liability waiver", "Confidentiality acknowledgment (public info only)"],
    onboarding: [
      "Volunteer agreement + liability waiver signed before first day",
      "Orientation: scope of role explained — community-facing only",
      "NO access to any internal systems (M365, CRM, Monday.com, etc.)",
      "NO access to proprietary data, client data, or financial records",
      "Point-of-contact assigned for questions — not a direct supervisor",
    ],
    restrictions: [
      "ZERO access to proprietary data or CRM",
      "ZERO access to BGI Tenant C systems",
      "No corporate card, no reimbursement without Founder pre-approval",
      "No representation as Sentrais employee or agent",
      "No signing authority of any kind",
    ],
    warnings: [
      "Volunteers may NOT have access to any internal platforms — MetaData zero-access rule applies",
      "Do not allow volunteers to handle any client-facing deliverables without explicit CEO sign-off",
    ],
  },
];

const ACCESS_MATRIX = [
  { resource: "Corporate Card", employee: true, contractor: false, fellow: false, intern: false, volunteer: false },
  { resource: "Health / Dental / Vision", employee: true, contractor: false, fellow: false, intern: false, volunteer: false },
  { resource: "Equity (Options/Restricted)", employee: true, contractor: false, fellow: false, intern: false, volunteer: false },
  { resource: "M365 Tenant B (Full)", employee: true, contractor: "guest", fellow: "scoped", intern: "scoped", volunteer: false },
  { resource: "HubSpot CRM", employee: true, contractor: false, fellow: false, intern: false, volunteer: false },
  { resource: "Monday.com", employee: true, contractor: "scoped", fellow: "limited", intern: "scoped", volunteer: false },
  { resource: "Proprietary Data / IP", employee: true, contractor: "NDA only", fellow: "NDA only", intern: "NDA only", volunteer: false },
  { resource: "Client Relationship Ownership", employee: true, contractor: "supervised", fellow: false, intern: false, volunteer: false },
  { resource: "BGI Tenant C Access", employee: false, contractor: false, fellow: false, intern: false, volunteer: false },
  { resource: "Payroll (W-2)", employee: true, contractor: false, fellow: false, intern: "if hourly", volunteer: false },
  { resource: "Stipend / Invoice", employee: false, contractor: true, fellow: true, intern: true, volunteer: false },
];

const TABS = [
  { id: "matrix", label: "Classification Matrix", icon: Users },
  { id: "access", label: "Access & Benefits", icon: ShieldOff },
];

function AccessCell({ val }: { val: any }) {
  if (val === true) return <CheckCircle2 size={15} color={C.green} />;
  if (val === false) return <XCircle size={15} color="#334155" />;
  return <span style={{ fontSize: 10, color: C.amber, fontWeight: 600 }}>{val}</span>;
}

export default function WorkforceMatrix() {
  const [tab, setTab] = useState("matrix");
  const [selected, setSelected] = useState("employee");
  const worker = WORKER_TYPES.find((w) => w.id === selected);

  return (
    <ForgePage>
      <ForgeHeader
        icon={Users}
        title="Benefits & Workforce Classification Matrix"
        subtitle="Worker type · Benefits eligibility · Access rights · Onboarding gates"
        stats={[
          { label: "Worker Types", value: 5, color: C.accent },
          { label: "Card-Eligible", value: "Employees Only", color: C.green },
          { label: "BGI Status", value: "EIN Pending", color: C.amber },
        ]}
      />
      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />

      <ForgeContent>

        {tab === "matrix" && (
          <div style={{ display: "flex", gap: 20 }}>
            {/* Type Selector */}
            <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {WORKER_TYPES.map((w) => {
                const Icon = w.icon;
                const isActive = selected === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setSelected(w.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                      background: isActive ? C.surface : "transparent",
                      border: isActive ? `1px solid ${w.color}50` : `1px solid ${C.border}`,
                    }}
                  >
                    <Icon size={14} color={w.color} style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? "#f1f5f9" : "#94a3b8" }}>{w.label}</div>
                      <div style={{ fontSize: 10, color: w.color, marginTop: 1 }}>{w.badge}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Detail Panel */}
            {worker && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                <ForgeCard accent={worker.color}>
                  <ForgeCardBody>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: worker.color, marginBottom: 4 }}>{worker.label}</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {worker.subtypes.map((s, i) => (
                            <span key={i} style={{ fontSize: 10, padding: "2px 8px", background: worker.color + "20", color: worker.color, border: `1px solid ${worker.color}40`, borderRadius: 4 }}>{s}</span>
                          ))}
                        </div>
                      </div>
                      <ForgeBadge variant="neutral">{worker.taxForm}</ForgeBadge>
                    </div>
                    <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>{worker.description}</p>
                  </ForgeCardBody>
                </ForgeCard>

                <ForgeGrid cols={2} gap={14}>
                  <ForgeCard>
                    <ForgeCardHeader><ForgeLabel color={worker.color}>Onboarding Gates</ForgeLabel></ForgeCardHeader>
                    <ForgeCardBody style={{ padding: "8px 18px 14px" }}>
                      {worker.onboarding.map((step, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#94a3b8", marginBottom: 7, lineHeight: 1.4 }}>
                          <div style={{ width: 18, flexShrink: 0, fontSize: 10, fontWeight: 700, color: worker.color, marginTop: 1 }}>{i + 1}.</div>
                          {step}
                        </div>
                      ))}
                    </ForgeCardBody>
                  </ForgeCard>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <ForgeCard>
                      <ForgeCardHeader><ForgeLabel color={worker.color}>Required Documents</ForgeLabel></ForgeCardHeader>
                      <ForgeCardBody style={{ padding: "8px 18px 14px" }}>
                        {worker.legalDocs.map((d, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                            <CheckCircle2 size={12} color={worker.color} style={{ flexShrink: 0, marginTop: 2 }} />
                            {d}
                          </div>
                        ))}
                      </ForgeCardBody>
                    </ForgeCard>

                    {worker.restrictions.length > 0 && (
                      <ForgeCard>
                        <ForgeCardHeader><ForgeLabel color={C.red}>Restrictions</ForgeLabel></ForgeCardHeader>
                        <ForgeCardBody style={{ padding: "8px 18px 14px" }}>
                          {worker.restrictions.map((r, i) => (
                            <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                              <XCircle size={12} color={C.red} style={{ flexShrink: 0, marginTop: 2 }} />
                              {r}
                            </div>
                          ))}
                        </ForgeCardBody>
                      </ForgeCard>
                    )}

                    {worker.warnings.length > 0 && (
                      <ForgeCard>
                        <ForgeCardHeader><ForgeLabel color={C.amber}>Compliance Flags</ForgeLabel></ForgeCardHeader>
                        <ForgeCardBody style={{ padding: "8px 18px 14px" }}>
                          {worker.warnings.map((w, i) => (
                            <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                              <AlertCircle size={12} color={C.amber} style={{ flexShrink: 0, marginTop: 2 }} />
                              {w}
                            </div>
                          ))}
                        </ForgeCardBody>
                      </ForgeCard>
                    )}
                  </div>
                </ForgeGrid>
              </div>
            )}
          </div>
        )}

        {tab === "access" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ForgeAlert level="critical">
              BGI Tenant C: zero access under any circumstances for any worker type. MetaData policy enforced at infrastructure level.
            </ForgeAlert>
            <ForgeCard>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Resource / Benefit</th>
                      {WORKER_TYPES.map((w) => (
                        <th key={w.id} style={{ padding: "10px 16px", textAlign: "center", fontSize: 11, fontWeight: 600, color: w.color }}>{w.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ACCESS_MATRIX.map((row, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : C.bg + "40" }}>
                        <td style={{ padding: "11px 16px", fontSize: 12, color: "#e2e8f0", fontWeight: 500 }}>{row.resource}</td>
                        <td style={{ padding: "11px 16px", textAlign: "center" }}><AccessCell val={row.employee} /></td>
                        <td style={{ padding: "11px 16px", textAlign: "center" }}><AccessCell val={row.contractor} /></td>
                        <td style={{ padding: "11px 16px", textAlign: "center" }}><AccessCell val={row.fellow} /></td>
                        <td style={{ padding: "11px 16px", textAlign: "center" }}><AccessCell val={row.intern} /></td>
                        <td style={{ padding: "11px 16px", textAlign: "center" }}><AccessCell val={row.volunteer} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ForgeCard>
          </div>
        )}

      </ForgeContent>
    </ForgePage>
  );
}

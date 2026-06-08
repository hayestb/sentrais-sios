// @ts-nocheck
import { useState } from "react";
import {
  GraduationCap, Users, Calendar, ClipboardList, Star, BookOpen,
  CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, Building2
} from "lucide-react";
import { ForgePage, ForgeHeader, ForgeTabs, ForgeContent } from "../components/ui/forge";

const TRACKS = [
  {
    id: "civic-tech",
    name: "Civic Tech Fellow",
    entity: "NOVATELabs Inc",
    pillar: "P2 Innovation Equity",
    color: "#0EA5E9",
    duration: "8 weeks",
    stipend: "$4,000",
    seats: 4,
    description: "Fellows embed with the NOVATELabs research team to build open-source civic tools, contribute to platform modules, and publish at least one policy brief or technical white paper.",
    eligibility: ["Current college junior/senior or recent grad (≤1 yr)", "Computer science, data science, public policy, or urban planning focus", "Demonstrated interest in civic technology or social impact"],
    deliverables: [
      { week: "1–2", title: "Onboarding & Scoping", description: "Platform orientation, mentor assignment, project scoping document submitted" },
      { week: "3–4", title: "Research Sprint", description: "Literature review, stakeholder interviews (min 3), preliminary findings memo" },
      { week: "5–6", title: "Build Phase", description: "Working prototype or research artifact; mid-program presentation to team" },
      { week: "7", title: "Validation & Refinement", description: "User testing or peer review; revisions incorporated" },
      { week: "8", title: "Capstone", description: "Final deliverable submitted; public-facing presentation or blog post" },
    ],
    mentors: ["Research Director (NOVATELabs)", "Platform Engineer (Sentrais Corp)", "Community Partner Lead"],
    fundingNote: "Stipend funded by NOVATELabs program budget. BGI grant funding may supplement once EIN is confirmed and 1023 approved — zero BGI funds to commercial entities.",
  },
  {
    id: "resilience-ops",
    name: "Resilience Operations Fellow",
    entity: "Sentrais Corp (billable)",
    pillar: "P1 Civic Resilience",
    color: "#14B8A6",
    duration: "10 weeks",
    stipend: "$5,000",
    seats: 3,
    description: "Operational fellows support client engagements and internal SIOS platform rollout under direct supervision. Work product is client-billable; fellows gain exposure to enterprise civic infrastructure deployment.",
    eligibility: ["Rising senior or graduate student", "Operations, public administration, or project management background", "Able to commit 30+ hrs/week during program window"],
    deliverables: [
      { week: "1", title: "Intake & Role Assignment", description: "Client NDA executed, access provisioned, orientation complete" },
      { week: "2–4", title: "Shadow & Support", description: "Attend client calls, draft meeting notes, support PM tasks" },
      { week: "5–7", title: "Lead Tasks", description: "Own one defined work stream; deliverable TBD per engagement" },
      { week: "8–9", title: "Documentation Sprint", description: "SOP documentation, playbook contributions, runbook updates" },
      { week: "10", title: "Transition & Evaluation", description: "Handoff package completed; evaluation form submitted by mentor" },
    ],
    mentors: ["Engagement Lead (Sentrais Corp)", "Finance Lead", "Operations Director"],
    fundingNote: "Stipend paid from Sentrais Corp operating budget. Fellow work product may be incorporated into client deliverables — IP assignment clause in offer letter is mandatory.",
  },
  {
    id: "bgi-community",
    name: "BGI Community Research Associate",
    entity: "BGI – Barbara Geter Institute",
    pillar: "P5 Economic Mobility",
    color: "#F59E0B",
    duration: "12 weeks",
    stipend: "$3,600 (pending BGI EIN)",
    seats: 6,
    description: "Community-embedded research associates work alongside BGI faculty and neighborhood partners to document lived experience, co-design interventions, and build longitudinal community data sets. Program is contingent on BGI EIN confirmation and 501(c)(3) determination.",
    eligibility: ["Open to all — prioritize community members without 4-year degree", "Residents of target neighborhoods strongly preferred", "No prior research experience required; training provided"],
    deliverables: [
      { week: "1–2", title: "Research Methods Training", description: "Qualitative interview training, IRB basics, data privacy orientation" },
      { week: "3–5", title: "Community Fieldwork", description: "Conduct structured interviews (min 10 residents); field notes submitted weekly" },
      { week: "6–8", title: "Data Synthesis", description: "Thematic coding workshop; preliminary findings shared with community partners" },
      { week: "9–10", title: "Co-Design Sprint", description: "Facilitate one community co-design session; action recommendations drafted" },
      { week: "11–12", title: "Community Presentation", description: "Present findings back to community; final report submitted to BGI board" },
    ],
    mentors: ["BGI Faculty Lead", "Community Liaison", "Data Systems Support (NOVATELabs)"],
    fundingNote: "BLOCKED — BGI EIN not yet confirmed. Stipend budget is $21,600 total (6 seats × $3,600). BGI funds flow to associates directly from BGI accounts only. Zero commingling with Sentrais Corp or NOVATELabs.",
    blocked: true,
  },
  {
    id: "future-workforce",
    name: "Future Workforce Apprentice",
    entity: "Sentrais Corp / NOVATELabs",
    pillar: "P3 Future Workforce",
    color: "#8B5CF6",
    duration: "6 weeks",
    stipend: "$2,400",
    seats: 8,
    description: "High school juniors and seniors (ages 16–18) from partner schools receive structured exposure to careers in civic technology, data science, and social entrepreneurship. ARI-aligned workforce pipeline.",
    eligibility: ["High school junior or senior (ages 16–18)", "Enrolled in ARI partner school district", "Parental/guardian consent required; background check for school-age participants"],
    deliverables: [
      { week: "1", title: "Orientation Week", description: "Workplace safety training, tech stack intro, mentor meet-and-greet" },
      { week: "2–3", title: "Skill Sprints", description: "Rotating 3-day skill workshops: data literacy, design thinking, civic communication" },
      { week: "4–5", title: "Mini Project", description: "Team-based project (2–3 apprentices per team) with defined brief and output" },
      { week: "6", title: "Demo Day", description: "Present mini project to panel; certificate of completion; FAFSA resources provided" },
    ],
    mentors: ["Workforce Development Lead", "School Liaison", "Peer Mentor (college fellow)"],
    fundingNote: "May qualify for workforce development grants and DOL apprenticeship incentives. School district partnership MOU required before program launch.",
  },
];

const COHORT_SCHEDULE = [
  { period: "Jun 16 – Jun 23", event: "Applications Open", status: "upcoming", tracks: ["civic-tech", "resilience-ops", "future-workforce"] },
  { period: "Jun 24 – Jun 28", event: "Application Review & Selection", status: "upcoming", tracks: ["civic-tech", "resilience-ops", "future-workforce"] },
  { period: "Jun 30", event: "Offer Letters Issued", status: "upcoming", tracks: ["civic-tech", "resilience-ops", "future-workforce"] },
  { period: "Jul 7", event: "Cohort 1 Kickoff", status: "upcoming", tracks: ["civic-tech", "resilience-ops", "future-workforce"] },
  { period: "Jul 7 – Aug 29", event: "Program Window (Civic Tech & Resilience Ops)", status: "upcoming", tracks: ["civic-tech", "resilience-ops"] },
  { period: "Jul 7 – Aug 15", event: "Program Window (Future Workforce Apprentice)", status: "upcoming", tracks: ["future-workforce"] },
  { period: "Aug 29", event: "Capstone Presentations", status: "upcoming", tracks: ["civic-tech", "resilience-ops"] },
  { period: "Sep (TBD)", event: "BGI Community Associates — pending EIN", status: "blocked", tracks: ["bgi-community"] },
];

const EVAL_RUBRIC = [
  { category: "Technical Delivery", weight: 30, criteria: "Quality, completeness, and on-time submission of assigned deliverables" },
  { category: "Communication", weight: 20, criteria: "Written memos, verbal updates, and stakeholder-facing presentation quality" },
  { category: "Initiative", weight: 20, criteria: "Proactive problem identification, asking good questions, going beyond minimum scope" },
  { category: "Collaboration", weight: 15, criteria: "Teamwork, responsiveness, and integration with mentor/supervisor feedback" },
  { category: "Mission Alignment", weight: 15, criteria: "Demonstrated understanding of ARI pillars, community impact, and civic purpose" },
];

const COMPLIANCE_ITEMS = [
  { item: "IP Assignment Clause", required: true, applies: ["civic-tech", "resilience-ops"], note: "All work product is organization property" },
  { item: "NDA / Confidentiality Agreement", required: true, applies: ["civic-tech", "resilience-ops", "bgi-community"], note: "Signed before Day 1" },
  { item: "Background Check", required: true, applies: ["future-workforce"], note: "Required for minors; run via HR" },
  { item: "Parental Consent Form", required: true, applies: ["future-workforce"], note: "Signed by parent/guardian" },
  { item: "IRB Compliance", required: true, applies: ["bgi-community"], note: "All human subjects research must be IRB-reviewed" },
  { item: "School District MOU", required: true, applies: ["future-workforce"], note: "Executed before apprentice offer letters" },
  { item: "BGI EIN Confirmation", required: true, applies: ["bgi-community"], note: "BLOCKER — program cannot launch without EIN" },
  { item: "W-9 / Tax Forms", required: true, applies: ["civic-tech", "resilience-ops", "bgi-community", "future-workforce"], note: "All stipend recipients; 1099 if ≥$600" },
];

const TRACK_COLORS: Record<string, string> = {
  "civic-tech": "#0EA5E9",
  "resilience-ops": "#14B8A6",
  "bgi-community": "#F59E0B",
  "future-workforce": "#8B5CF6",
};

export default function FellowshipFramework() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedTrack, setExpandedTrack] = useState<string | null>("civic-tech");

  const tabs = [
    { id: "overview", label: "Program Tracks", icon: GraduationCap },
    { id: "schedule", label: "Cohort Schedule", icon: Calendar },
    { id: "evaluation", label: "Evaluation Rubric", icon: Star },
    { id: "compliance", label: "Compliance Checklist", icon: ClipboardList },
  ];

  const totalSeats = TRACKS.reduce((s, t) => s + t.seats, 0);
  const blockedSeats = TRACKS.filter((t) => t.blocked).reduce((s, t) => s + t.seats, 0);
  const activeSeats = totalSeats - blockedSeats;

  return (
    <ForgePage>
      <ForgeHeader
        icon={GraduationCap}
        title="Summer Fellowship & Internship Framework"
        subtitle="ARI workforce pipeline · 4 program tracks · Cohort 1 kickoff Jul 7"
        stats={[
          { label: "Total Seats", value: totalSeats },
          { label: "Active Seats", value: activeSeats, color: "#10b981" },
          { label: "Pending EIN", value: blockedSeats, color: "#f59e0b" },
        ]}
      />
      <ForgeTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      <ForgeContent>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {TRACKS.map((track) => (
              <div
                key={track.id}
                style={{
                  background: "#0d1f3c",
                  border: `1px solid ${track.blocked ? "#f59e0b40" : track.color + "30"}`,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {/* Track Header */}
                <button
                  onClick={() => setExpandedTrack(expandedTrack === track.id ? null : track.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer",
                    color: "#e2e8f0", textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 4, height: 40, background: track.color, borderRadius: 2 }} />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>{track.name}</span>
                        {track.blocked && (
                          <span style={{ fontSize: 10, padding: "2px 8px", background: "#f59e0b20", color: "#f59e0b", border: "1px solid #f59e0b40", borderRadius: 4 }}>
                            BLOCKED — EIN PENDING
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        {track.entity} · {track.pillar} · {track.duration} · {track.stipend} · {track.seats} seats
                      </div>
                    </div>
                  </div>
                  {expandedTrack === track.id ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                </button>

                {expandedTrack === track.id && (
                  <div style={{ padding: "0 20px 20px", borderTop: "1px solid #1e3a5f" }}>
                    <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 16, lineHeight: 1.6 }}>{track.description}</p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 16 }}>
                      {/* Eligibility */}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: track.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                          Eligibility
                        </div>
                        {track.eligibility.map((e, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                            <CheckCircle2 size={12} color={track.color} style={{ marginTop: 2, flexShrink: 0 }} />
                            {e}
                          </div>
                        ))}
                      </div>

                      {/* Mentors */}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: track.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                          Mentors / Supervisors
                        </div>
                        {track.mentors.map((m, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                            <Users size={12} color={track.color} style={{ marginTop: 2, flexShrink: 0 }} />
                            {m}
                          </div>
                        ))}
                      </div>

                      {/* Funding Note */}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: track.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                          Funding & Compliance
                        </div>
                        <div style={{ fontSize: 12, color: track.blocked ? "#f59e0b" : "#94a3b8", lineHeight: 1.5 }}>
                          {track.fundingNote}
                        </div>
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: track.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                        Deliverable Schedule
                      </div>
                      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                        {track.deliverables.map((d, i) => (
                          <div
                            key={i}
                            style={{
                              flexShrink: 0, width: 180, padding: "12px 14px",
                              background: "#0a1628", border: `1px solid ${track.color}20`,
                              borderRadius: 8,
                            }}
                          >
                            <div style={{ fontSize: 10, color: track.color, fontWeight: 600, marginBottom: 4 }}>Week {d.week}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{d.title}</div>
                            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>{d.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SCHEDULE */}
        {activeTab === "schedule" && (
          <div>
            <div style={{ background: "#0d1f3c", border: "1px solid #1e3a5f", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e3a5f" }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Cohort 1 — Summer 2026</h3>
              </div>
              <div>
                {COHORT_SCHEDULE.map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", gap: 16,
                      padding: "14px 20px",
                      borderBottom: i < COHORT_SCHEDULE.length - 1 ? "1px solid #1e3a5f" : "none",
                      background: row.status === "blocked" ? "#1a0a00" : "transparent",
                    }}
                  >
                    <div style={{ width: 130, flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", fontFamily: "monospace" }}>{row.period}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, color: row.status === "blocked" ? "#f59e0b" : "#e2e8f0" }}>{row.event}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {row.tracks.map((tid) => (
                        <span
                          key={tid}
                          style={{
                            fontSize: 10, padding: "2px 8px", borderRadius: 4,
                            background: TRACK_COLORS[tid] + "20",
                            color: TRACK_COLORS[tid],
                            border: `1px solid ${TRACK_COLORS[tid]}30`,
                          }}
                        >
                          {TRACKS.find((t) => t.id === tid)?.name.split(" ").slice(0, 2).join(" ")}
                        </span>
                      ))}
                    </div>
                    <div>
                      {row.status === "blocked"
                        ? <AlertCircle size={14} color="#f59e0b" />
                        : <Clock size={14} color="#64748b" />
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EVALUATION */}
        {activeTab === "evaluation" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#0d1f3c", border: "1px solid #1e3a5f", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e3a5f" }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Evaluation Rubric — All Tracks</h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                  Mentor completes evaluation form in final week. Scores are 1–5 per category. Weighted total determines completion status and eligibility for return offer / network referral.
                </p>
              </div>
              <div>
                {EVAL_RUBRIC.map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", gap: 16,
                      padding: "14px 20px",
                      borderBottom: i < EVAL_RUBRIC.length - 1 ? "1px solid #1e3a5f" : "none",
                    }}
                  >
                    <div style={{ width: 40, flexShrink: 0, textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#0EA5E9" }}>{row.weight}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{row.category}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{row.criteria}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#0d1f3c", border: "1px solid #1e3a5f", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 12 }}>Completion Thresholds</div>
              {[
                { score: "≥ 90%", outcome: "Certificate + Network Referral + Return Offer eligible", color: "#10b981" },
                { score: "75–89%", outcome: "Certificate of Completion", color: "#0EA5E9" },
                { score: "60–74%", outcome: "Participation Record — no certificate", color: "#f59e0b" },
                { score: "< 60%", outcome: "No completion record; performance memo on file", color: "#ef4444" },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: row.color, width: 70 }}>{row.score}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{row.outcome}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPLIANCE */}
        {activeTab === "compliance" && (
          <div style={{ background: "#0d1f3c", border: "1px solid #1e3a5f", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e3a5f" }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Pre-Launch Compliance Checklist</h3>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>All items must be complete before offer letters are issued for the applicable track.</p>
            </div>
            <div>
              {COMPLIANCE_ITEMS.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 16,
                    padding: "14px 20px",
                    borderBottom: i < COMPLIANCE_ITEMS.length - 1 ? "1px solid #1e3a5f" : "none",
                    background: item.item === "BGI EIN Confirmation" ? "#1a0a00" : "transparent",
                  }}
                >
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    {item.item === "BGI EIN Confirmation"
                      ? <AlertCircle size={16} color="#f59e0b" />
                      : <ClipboardList size={16} color="#0EA5E9" />
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: item.item === "BGI EIN Confirmation" ? "#f59e0b" : "#e2e8f0" }}>
                      {item.item}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{item.note}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {item.applies.map((tid) => (
                      <span
                        key={tid}
                        style={{
                          fontSize: 10, padding: "2px 6px", borderRadius: 3,
                          background: (TRACK_COLORS[tid] ?? "#94a3b8") + "20",
                          color: TRACK_COLORS[tid] ?? "#94a3b8",
                        }}
                      >
                        {TRACKS.find((t) => t.id === tid)?.name.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ForgeContent>
    </ForgePage>
  );
}

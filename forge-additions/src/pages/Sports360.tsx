// @ts-nocheck
import { useState } from "react";
import { Shield, Activity, BarChart2, Users, CheckCircle2, Clock, AlertCircle, Zap, Target, Star } from "lucide-react";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody, ForgeLabel,
  ForgeBadge, ForgeAlert, ForgeGrid, C,
} from "../components/ui/forge";

const LEAGUES = [
  { id: "nfl", label: "NFL", color: C.red, roi: "$3.2M", gates: 18, vri: 94 },
  { id: "nba", label: "NBA", color: C.accent, roi: "$2.8M", gates: 16, vri: 91 },
  { id: "mlb", label: "MLB", color: C.green, roi: "$2.1M", gates: 15, vri: 88 },
  { id: "nhl", label: "NHL", color: "#60a5fa", roi: "$1.9M", gates: 15, vri: 87 },
  { id: "mls", label: "MLS", color: C.teal, roi: "$1.4M", gates: 14, vri: 85 },
  { id: "ncaa", label: "NCAA", color: C.amber, roi: "$1.1M", gates: 13, vri: 82 },
];

const GATES = [
  { id: "G-01", name: "Site Assessment & Venue Audit", phase: 1, category: "Discovery", critical: true, description: "Physical venue walk-through, infrastructure capacity survey, ingress/egress mapping, and anchor point identification." },
  { id: "G-02", name: "Stakeholder & Authority Mapping", phase: 1, category: "Discovery", critical: true, description: "Identify all decision authorities — venue ops, league rep, security chief, local law enforcement liaison." },
  { id: "G-03", name: "Risk Register & Threat Model", phase: 1, category: "Discovery", critical: true, description: "Document all known risk categories: crowd density, weather exposure, access control gaps, medical response gaps." },
  { id: "G-04", name: "Baseline Data & Intelligence Intake", phase: 1, category: "Discovery", critical: false, description: "Ingest historical incident data, prior deployment reports, fan demographic data, and event-specific attendance projections." },
  { id: "G-05", name: "Diagnostic Report & Gap Analysis", phase: 2, category: "Diagnose", critical: true, description: "Synthesize audit data into a structured gap report. Map each gap to a remediation priority (P1/P2/P3)." },
  { id: "G-06", name: "VRI Baseline Score", phase: 2, category: "Diagnose", critical: true, description: "Compute initial Venue Readiness Index score (0–100) across 4 dimensions: Safety, Operations, Technology, Fan Experience." },
  { id: "G-07", name: "Staffing Demand Model", phase: 2, category: "Diagnose", critical: true, description: "Model staffing requirements using GDA engine: attendance × zone density × event type = staffing matrix." },
  { id: "G-08", name: "Budget & Resource Authorization", phase: 2, category: "Diagnose", critical: false, description: "Secure formal authorization for deployment budget, resource pool, and vendor contracts." },
  { id: "G-09", name: "Deployment Architecture Sign-Off", phase: 3, category: "Design", critical: true, description: "Finalize GDA zone layout, command post placement, communication tree, and contingency protocols." },
  { id: "G-10", name: "Technology Integration Plan", phase: 3, category: "Design", critical: true, description: "Map all technology touchpoints: access control systems, comms infrastructure, real-time data feeds, command dashboard." },
  { id: "G-11", name: "Training & Certification Plan", phase: 3, category: "Design", critical: true, description: "Define all staff training requirements, certification tracks, and pre-event readiness testing." },
  { id: "G-12", name: "Simulation & Tabletop Exercise", phase: 3, category: "Design", critical: false, description: "Run scenario simulations for top-5 risk events identified in Gate G-03. Document gaps found." },
  { id: "G-13", name: "Staff Deployment & On-Site Activation", phase: 4, category: "Deploy", critical: true, description: "Full staff mobilization, zone assignments active, command post operational, all comms channels live." },
  { id: "G-14", name: "Real-Time Operations Dashboard Live", phase: 4, category: "Deploy", critical: true, description: "All data feeds active in executive command view. VRI score updating in real-time against live conditions." },
  { id: "G-15", name: "Event-Day Safety & Ops Execution", phase: 4, category: "Deploy", critical: true, description: "Active incident management, real-time crowd monitoring, medical response on standby, command escalation active." },
  { id: "G-16", name: "Revenue & Guest Intelligence Capture", phase: 4, category: "Deploy", critical: false, description: "Fan behavior data, concession revenue patterns, access bottleneck data captured for debrief." },
  { id: "G-17", name: "Post-Event Debrief & After-Action Report", phase: 5, category: "Debrief", critical: true, description: "Structured debrief covering: what worked, what failed, near-misses, VRI delta (pre vs. post), and NIN learnings." },
  { id: "G-18", name: "Debrief Sign-Off & Intelligence Feed", phase: 5, category: "Debrief", critical: true, description: "Formal sign-off by venue ops and league rep. Learnings fed into the Federated Learning Network (NIN Layer 6)." },
];

const NIN_PHASES = [
  {
    id: "discover", label: "Discover", icon: "🔍", color: C.accent,
    description: "Site-level intelligence gathering. Map the physical environment, identify all stakeholders, and build the risk register.",
    outputs: ["Site Assessment Report", "Stakeholder Authority Map", "Risk Register v1", "Baseline Data Package"],
    gates: ["G-01", "G-02", "G-03", "G-04"],
  },
  {
    id: "diagnose", label: "Diagnose", icon: "📊", color: C.teal,
    description: "Convert raw intelligence into structured analysis. Compute the VRI baseline and model the staffing demand.",
    outputs: ["Diagnostic Gap Report", "VRI Baseline Score", "Staffing Demand Model", "Budget Authorization"],
    gates: ["G-05", "G-06", "G-07", "G-08"],
  },
  {
    id: "design", label: "Design", icon: "🏗️", color: C.purple,
    description: "Architect the full deployment. Define GDA zone layout, technology integration, staff training, and simulation exercises.",
    outputs: ["GDA Architecture Plan", "Tech Integration Blueprint", "Training & Cert Plan", "Tabletop Simulation Report"],
    gates: ["G-09", "G-10", "G-11", "G-12"],
  },
  {
    id: "deploy", label: "Deploy", icon: "⚡", color: C.green,
    description: "Execute the plan. Full staff mobilization, real-time command dashboard active, live incident management.",
    outputs: ["Staff Activation Report", "Command Dashboard Live", "Event Operations Log", "Revenue & Guest Data"],
    gates: ["G-13", "G-14", "G-15", "G-16"],
  },
  {
    id: "debrief", label: "Debrief", icon: "📝", color: C.amber,
    description: "Structured after-action review. VRI delta analysis, NIN intelligence feed, formal sign-off, and next-cycle recommendations.",
    outputs: ["After-Action Report", "VRI Delta Analysis", "NIN Learning Feed", "Signed Debrief"],
    gates: ["G-17", "G-18"],
  },
];

const VRI_DIMENSIONS = [
  { label: "Safety", weight: "35%", description: "Access control, incident response, medical coverage, crowd density management, evacuation readiness", color: C.red },
  { label: "Operations", weight: "30%", description: "Staff deployment accuracy, command communications, logistics timing, vendor coordination", color: C.accent },
  { label: "Technology", weight: "20%", description: "Systems uptime, data feed integrity, command dashboard accuracy, integration reliability", color: C.teal },
  { label: "Fan Experience", weight: "15%", description: "Ingress/egress flow, concession availability, wayfinding clarity, resolution speed for fan issues", color: C.amber },
];

const GDA_ENGINE = [
  { label: "Zone Mapping", description: "Venue divided into functional zones (Gates, Concourse, Field Level, Premium, Back-of-House, Command). Each zone gets a density ceiling and staffing floor." },
  { label: "Assignment Optimization", description: "GDA engine allocates staff by zone × role × shift. Factors in: event type, expected attendance, historical incident density, and local law enforcement density." },
  { label: "Surge Protocol", description: "Automated reallocation triggers when any zone exceeds 80% of density ceiling. Staff repositioned from lower-activity zones in real-time." },
  { label: "Federated Learning", description: "Post-event, all zone data feeds into NIN Layer 6. Assignment accuracy and incident correlation improves each deployment cycle." },
];

const EXEC_VIEWS = [
  { id: "venue-ops", label: "Venue Operations", icon: "🏟️", description: "Zone-by-zone staffing status, density live metrics, access control throughput, command escalation queue." },
  { id: "safety", label: "Safety Command", icon: "🛡️", description: "Incident log (real-time), medical response status, law enforcement liaison, evacuation trigger readiness." },
  { id: "staffing", label: "Staffing & GDA", icon: "👥", description: "Staff deployment accuracy vs. plan, surge protocol status, certification compliance by zone." },
  { id: "revenue", label: "Revenue & Fan", icon: "💰", description: "Concession revenue velocity, fan satisfaction signals, access bottleneck alerts, premium asset utilization." },
  { id: "debrief", label: "Debrief & NIN", icon: "📡", description: "Post-event VRI delta, after-action report status, NIN learning feed confirmation, next-cycle recommendations." },
];

const PHASE_COLORS = { 1: C.accent, 2: C.teal, 3: C.purple, 4: C.green, 5: C.amber };
const PHASE_LABELS = { 1: "Discover", 2: "Diagnose", 3: "Design", 4: "Deploy", 5: "Debrief" };
const CAT_COLORS = { Discovery: C.accent, Diagnose: C.teal, Design: C.purple, Deploy: C.green, Debrief: C.amber };

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "nin", label: "NIN Methodology" },
  { id: "gates", label: "18 Gate Certifications" },
  { id: "vri", label: "VRI Scoring" },
  { id: "gda", label: "GDA Engine" },
  { id: "leagues", label: "League Profiles" },
];

export default function Sports360() {
  const [tab, setTab] = useState("overview");
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState("nfl");

  const league = LEAGUES.find(l => l.id === selectedLeague);

  return (
    <ForgePage>
      <ForgeHeader
        title="SPORTS360"
        subtitle="Unified Venue Operations & Deployment Orchestration"
        actions={
          <ForgeBadge variant="accent">League-Agnostic Framework</ForgeBadge>
        }
      />

      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />

      <ForgeContent>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeAlert level="info">
              SPORTS360 is Sentrais's league-agnostic sports venue orchestration playbook — applicable across NFL, NBA, MLB, NHL, MLS, and NCAA. Every deployment follows the NIN 5-phase methodology and must satisfy all applicable Gate Certifications before event-day activation.
            </ForgeAlert>

            {/* League ROI Cards */}
            <div>
              <ForgeLabel>ROI by League — Deployed Value</ForgeLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 10 }}>
                {LEAGUES.map(l => (
                  <ForgeCard key={l.id} onClick={() => { setSelectedLeague(l.id); setTab("leagues"); }} style={{ cursor: "pointer", borderLeft: `3px solid ${l.color}` }}>
                    <ForgeCardBody>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: l.color }}>{l.label}</div>
                          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{l.gates} Gate Certifications</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{l.roi}</div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>Deployed ROI</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: C.textMuted }}>VRI Target</span>
                          <span style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{l.vri}/100</span>
                        </div>
                        <div style={{ height: 4, background: C.border, borderRadius: 2 }}>
                          <div style={{ height: 4, background: l.color, borderRadius: 2, width: `${l.vri}%` }} />
                        </div>
                      </div>
                    </ForgeCardBody>
                  </ForgeCard>
                ))}
              </div>
            </div>

            {/* Architecture Summary */}
            <ForgeCard>
              <ForgeCardHeader title="SPORTS360 Architecture" />
              <ForgeCardBody>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.accent, marginBottom: 10 }}>Framework Components</div>
                    {[
                      { label: "NIN Methodology", detail: "5-phase deployment lifecycle: Discover → Diagnose → Design → Deploy → Debrief" },
                      { label: "18 Gate Certifications", detail: "Universal gates G-01 through G-18 — required for event-day activation" },
                      { label: "Venue Readiness Index (VRI)", detail: "Scored 0–100 across Safety (35%), Operations (30%), Technology (20%), Fan Experience (15%)" },
                      { label: "GDA Engine", detail: "Ground Deployment Architecture — AI-assisted staff assignment optimization by zone" },
                    ].map(item => (
                      <div key={item.label} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{item.detail}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.teal, marginBottom: 10 }}>Command Intelligence Stack</div>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
                      {[
                        { layer: "L6", label: "Federated Learning Network (NIN)", color: C.purple },
                        { layer: "L5", label: "Guest & Revenue Intelligence", color: C.amber },
                        { layer: "L4", label: "Artist / Talent Intelligence", color: C.accent },
                        { layer: "L3", label: "Venue Execution Command", color: C.green },
                        { layer: "L2", label: "Regional Operations Cluster", color: C.teal },
                        { layer: "L1", label: "Global Event Control", color: C.red },
                      ].map((item, i) => (
                        <div key={item.layer} style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "6px 8px",
                          background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                          borderRadius: 4,
                        }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: item.color, width: 20 }}>{item.layer}</span>
                          <span style={{ fontSize: 12, color: C.text }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 8, fontStyle: "italic" }}>
                      Each layer feeds intelligence upward and learnings downward through NIN.
                    </div>
                  </div>
                </div>
              </ForgeCardBody>
            </ForgeCard>

            {/* Super Cycle Alert */}
            <ForgeAlert level="warning">
              <strong>Super Cycle Activation:</strong> FIFA World Cup → Super Bowl → NCAA Championship represents a compound deployment opportunity — 3 consecutive major events sharing the same Sentrais SPORTS360 infrastructure. Intelligence compounds across each phase via NIN Layer 6.
            </ForgeAlert>
          </div>
        )}

        {/* NIN METHODOLOGY */}
        {tab === "nin" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeAlert level="info">
              The NIN Methodology (Discover → Diagnose → Design → Deploy → Debrief) is the operating backbone of every SPORTS360 deployment. No deployment may proceed to a later phase without completing all Gate Certifications in the prior phase.
            </ForgeAlert>

            {/* Phase Flow */}
            <div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
              {NIN_PHASES.map((phase, i) => (
                <div key={phase.id} style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}
                    style={{
                      flex: 1, padding: "16px 12px", borderRadius: 8, cursor: "pointer",
                      background: selectedPhase === phase.id ? `${phase.color}22` : C.surface,
                      border: `1px solid ${selectedPhase === phase.id ? phase.color : C.border}`,
                      textAlign: "center", transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{phase.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: phase.color }}>{phase.label}</div>
                    <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>{phase.gates.length} Gates</div>
                  </div>
                  {i < NIN_PHASES.length - 1 && (
                    <div style={{ color: C.textMuted, fontSize: 16, flexShrink: 0 }}>→</div>
                  )}
                </div>
              ))}
            </div>

            {/* Phase Detail */}
            {NIN_PHASES.map(phase => (
              <ForgeCard key={phase.id} style={selectedPhase === phase.id ? { border: `1px solid ${phase.color}` } : {}}>
                <ForgeCardHeader
                  title={`${phase.icon} ${phase.label}`}
                  actions={<ForgeBadge style={{ background: `${phase.color}22`, color: phase.color }}>{phase.gates.join(" · ")}</ForgeBadge>}
                />
                <ForgeCardBody>
                  <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>{phase.description}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: phase.color, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Phase Outputs</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {phase.outputs.map(o => (
                          <div key={o} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: phase.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: C.text }}>{o}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: phase.color, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Gate Requirements</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {GATES.filter(g => phase.gates.includes(g.id)).map(g => (
                          <div key={g.id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: phase.color, minWidth: 32 }}>{g.id}</span>
                            <span style={{ fontSize: 12, color: C.textMuted }}>{g.name}</span>
                            {g.critical && <span style={{ fontSize: 9, background: `${C.red}22`, color: C.red, padding: "1px 5px", borderRadius: 3, flexShrink: 0 }}>CRITICAL</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ForgeCardBody>
              </ForgeCard>
            ))}
          </div>
        )}

        {/* 18 GATES */}
        {tab === "gates" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeAlert level="warning">
              All 18 Gate Certifications must be completed in sequence before event-day activation. Gates marked CRITICAL are mandatory blockers — no phase advancement without sign-off.
            </ForgeAlert>

            {[1, 2, 3, 4, 5].map(phase => (
              <ForgeCard key={phase}>
                <ForgeCardHeader
                  title={`Phase ${phase}: ${PHASE_LABELS[phase]}`}
                  actions={
                    <div style={{ display: "flex", gap: 6 }}>
                      <ForgeBadge style={{ background: `${PHASE_COLORS[phase]}22`, color: PHASE_COLORS[phase] }}>
                        {GATES.filter(g => g.phase === phase).length} Gates
                      </ForgeBadge>
                      <ForgeBadge variant="danger">
                        {GATES.filter(g => g.phase === phase && g.critical).length} Critical
                      </ForgeBadge>
                    </div>
                  }
                />
                <ForgeCardBody>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {GATES.filter(g => g.phase === phase).map(gate => (
                      <div key={gate.id} style={{
                        display: "flex", gap: 14, padding: "12px 14px", borderRadius: 8,
                        background: C.bg, border: `1px solid ${C.border}`,
                        borderLeft: gate.critical ? `3px solid ${C.red}` : `3px solid ${PHASE_COLORS[phase]}`,
                      }}>
                        <div style={{ textAlign: "center", flexShrink: 0, paddingTop: 2 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: PHASE_COLORS[phase] }}>{gate.id}</div>
                          {gate.critical && (
                            <div style={{ fontSize: 9, color: C.red, marginTop: 2, fontWeight: 600 }}>CRITICAL</div>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{gate.name}</div>
                          <div style={{ fontSize: 12, color: C.textMuted }}>{gate.description}</div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          <ForgeBadge style={{ background: `${CAT_COLORS[gate.category] || C.accent}22`, color: CAT_COLORS[gate.category] || C.accent }}>
                            {gate.category}
                          </ForgeBadge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ForgeCardBody>
              </ForgeCard>
            ))}
          </div>
        )}

        {/* VRI SCORING */}
        {tab === "vri" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeCard>
              <ForgeCardHeader title="Venue Readiness Index (VRI)" />
              <ForgeCardBody>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}>
                      The VRI is a composite score (0–100) calculated at Gate G-06 as a baseline and updated continuously during deployment. A VRI below 70 triggers a mandatory hold at Gate G-13.
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {VRI_DIMENSIONS.map(d => (
                        <div key={d.label}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: d.color }}>{d.label}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{d.weight}</span>
                          </div>
                          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{d.description}</div>
                          <div style={{ height: 4, background: C.border, borderRadius: 2 }}>
                            <div style={{ height: 4, background: d.color, borderRadius: 2, width: d.weight }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.accent, marginBottom: 12 }}>VRI Threshold Definitions</div>
                    {[
                      { range: "90–100", label: "Elite Readiness", color: C.green, description: "All dimensions performing above benchmark. Full deployment authorized. NIN intelligence fully active." },
                      { range: "80–89", label: "Deployment Ready", color: C.teal, description: "Minor gaps present. Deployment authorized with active monitoring. Surge protocol on standby." },
                      { range: "70–79", label: "Conditional", color: C.amber, description: "Material gaps identified. Deployment requires executive sign-off and compensating controls." },
                      { range: "60–69", label: "Elevated Risk", color: C.red, description: "Significant gaps. Gate G-13 hold triggered. Remediation required before activation." },
                      { range: "< 60", label: "No-Go", color: "#dc2626", description: "Deployment blocked. Mandatory escalation to venue ops and league rep. Full re-certification required." },
                    ].map(t => (
                      <div key={t.range} style={{
                        display: "flex", gap: 12, padding: "10px 12px", borderRadius: 6,
                        marginBottom: 8, background: C.bg, border: `1px solid ${C.border}`,
                        borderLeft: `3px solid ${t.color}`,
                      }}>
                        <div style={{ flexShrink: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: t.color }}>{t.range}</div>
                          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{t.label}</div>
                        </div>
                        <div style={{ fontSize: 12, color: C.textMuted }}>{t.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </ForgeCardBody>
            </ForgeCard>

            <ForgeCard>
              <ForgeCardHeader title="League VRI Benchmarks" />
              <ForgeCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {LEAGUES.map(l => (
                    <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 44, fontSize: 13, fontWeight: 700, color: l.color }}>{l.label}</div>
                      <div style={{ flex: 1, height: 8, background: C.border, borderRadius: 4 }}>
                        <div style={{ height: 8, background: l.color, borderRadius: 4, width: `${l.vri}%`, position: "relative" }}>
                          <div style={{
                            position: "absolute", right: 0, top: -18,
                            fontSize: 11, fontWeight: 700, color: l.color,
                          }}>{l.vri}</div>
                        </div>
                      </div>
                      <div style={{ width: 30, fontSize: 11, color: C.textMuted }}>/100</div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>

            <ForgeCard>
              <ForgeCardHeader title="5 Executive Dashboard Views" />
              <ForgeCardBody>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                  {EXEC_VIEWS.map(v => (
                    <div key={v.id} style={{
                      padding: "14px 12px", borderRadius: 8, background: C.bg,
                      border: `1px solid ${C.border}`, textAlign: "center",
                    }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{v.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>{v.label}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{v.description}</div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

        {/* GDA ENGINE */}
        {tab === "gda" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeAlert level="info">
              The Ground Deployment Architecture (GDA) engine is SPORTS360's AI-assisted staff assignment system. It converts venue topology + event data into an optimized staffing matrix and triggers real-time reallocation during live events.
            </ForgeAlert>

            <ForgeCard>
              <ForgeCardHeader title="GDA Engine Components" />
              <ForgeCardBody>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {GDA_ENGINE.map((item, i) => (
                    <div key={item.label} style={{
                      padding: "16px", borderRadius: 8, background: C.bg,
                      border: `1px solid ${C.border}`,
                      borderTop: `3px solid ${[C.accent, C.teal, C.purple, C.green][i]}`,
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>{item.description}</div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>

            <ForgeCard>
              <ForgeCardHeader title="Staffing Demand Formula" />
              <ForgeCardBody>
                <div style={{ background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, padding: 20, marginBottom: 16 }}>
                  <div style={{ fontFamily: "monospace", fontSize: 15, color: C.accent, textAlign: "center", marginBottom: 8 }}>
                    Staffing Requirement = Attendance × Zone Density Factor × Event Type Multiplier
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, textAlign: "center" }}>
                    Computed per zone at Gate G-07 and updated in real-time during deployment.
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { label: "Zone Types", items: ["Gates (Ingress/Egress)", "Concourse", "Field / Court Level", "Premium / Club", "Back-of-House", "Mobile Command"] },
                    { label: "Event Type Multipliers", items: ["Championship / Playoff: 1.4×", "Regular Season: 1.0×", "Pre-Season: 0.8×", "College: 1.1×", "Neutral Site: 1.25×", "International: 1.35×"] },
                    { label: "Surge Triggers", items: ["Zone > 80% density ceiling", "Incident log rate > baseline", "Weather escalation flag", "VRI drop > 5 points", "Command escalation issued", "League rep request"] },
                  ].map(col => (
                    <div key={col.label}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{col.label}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {col.items.map(item => (
                          <div key={item} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.accent, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: C.textMuted }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>

            <ForgeCard>
              <ForgeCardHeader title="Multi-City Deployment Sequence" />
              <ForgeCardBody>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>
                  GDA intelligence compounds across sequential deployments. Each city's debrief feeds the next city's baseline.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  {["Atlanta", "Dallas", "Chicago", "Los Angeles"].map((city, i, arr) => (
                    <div key={city} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        padding: "10px 16px", borderRadius: 8, background: C.bg,
                        border: `1px solid ${[C.accent, C.teal, C.purple, C.amber][i]}`,
                        textAlign: "center",
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: [C.accent, C.teal, C.purple, C.amber][i] }}>{city}</div>
                        <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>Deployment {i + 1}</div>
                        <div style={{ fontSize: 10, color: C.textMuted }}>NIN L6 Feed {i > 0 ? `(+${i} prior)` : "(Baseline)"}</div>
                      </div>
                      {i < arr.length - 1 && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: C.textMuted }}>
                          <div style={{ fontSize: 16 }}>→</div>
                          <div style={{ fontSize: 10, color: C.teal }}>NIN feed</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

        {/* LEAGUE PROFILES */}
        {tab === "leagues" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {LEAGUES.map(l => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLeague(l.id)}
                  style={{
                    padding: "8px 16px", borderRadius: 6, cursor: "pointer",
                    border: selectedLeague === l.id ? `1px solid ${l.color}` : `1px solid ${C.border}`,
                    background: selectedLeague === l.id ? `${l.color}22` : C.surface,
                    color: selectedLeague === l.id ? l.color : C.textMuted,
                    fontSize: 13, fontWeight: selectedLeague === l.id ? 700 : 400,
                    transition: "all 0.12s",
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {league && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <ForgeCard style={{ borderLeft: `3px solid ${league.color}` }}>
                  <ForgeCardBody>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                      {[
                        { label: "Deployed ROI", value: league.roi, sub: "per event cycle" },
                        { label: "Gate Certifications", value: league.gates, sub: "required gates" },
                        { label: "VRI Target", value: `${league.vri}/100`, sub: "minimum readiness" },
                        { label: "NIN Phase", value: "5-Phase", sub: "full NIN deployment" },
                      ].map(m => (
                        <div key={m.label} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 22, fontWeight: 700, color: league.color }}>{m.value}</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginTop: 4 }}>{m.label}</div>
                          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{m.sub}</div>
                        </div>
                      ))}
                    </div>
                  </ForgeCardBody>
                </ForgeCard>

                {/* League-specific gates — showing applicable gates */}
                <ForgeCard>
                  <ForgeCardHeader title={`${league.label} Gate Certification Track`} />
                  <ForgeCardBody>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {GATES.slice(0, league.gates).map(gate => (
                        <div key={gate.id} style={{
                          display: "flex", alignItems: "center", gap: 12, padding: "8px 10px",
                          borderRadius: 6, background: C.bg, border: `1px solid ${C.border}`,
                        }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: league.color, width: 36, flexShrink: 0 }}>{gate.id}</span>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 12, color: C.text }}>{gate.name}</span>
                          </div>
                          <ForgeBadge style={{ background: `${PHASE_COLORS[gate.phase]}22`, color: PHASE_COLORS[gate.phase] }}>
                            {PHASE_LABELS[gate.phase]}
                          </ForgeBadge>
                          {gate.critical && <ForgeBadge variant="danger">Critical</ForgeBadge>}
                        </div>
                      ))}
                    </div>
                  </ForgeCardBody>
                </ForgeCard>
              </div>
            )}
          </div>
        )}

      </ForgeContent>
    </ForgePage>
  );
}

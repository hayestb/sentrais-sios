// @ts-nocheck
import { useState } from "react";
import { Building2, Shield, Layers, Cpu, BarChart3, Plane, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { ForgePage, ForgeHeader, ForgeTabs, ForgeContent, ForgeCard, ForgeCardHeader, ForgeCardBody, ForgeLabel, ForgeBadge, ForgeAlert, ForgeGrid, C } from "../components/ui/forge";

const GOVERNANCE_LAYERS = [
  {
    layer: "Layer 1",
    name: "Atlanta Executive Steering Council",
    cadence: "Annual + as needed",
    color: C.accent,
    responsibilities: ["Strategic priorities & investments", "Risk acceptance", "Annual goals & performance targets"],
    members: ["Mayor", "Airport Leadership", "APD / AFRD", "Emergency Management", "Transportation / MARTA", "Utilities", "Private Sector", "Universities"],
  },
  {
    layer: "Layer 2",
    name: "Regional Operations Council",
    cadence: "Monthly operational review",
    color: C.teal,
    responsibilities: ["Readiness & risk review", "Upcoming events planning", "Infrastructure status", "Emerging threats", "Resource allocation"],
    members: ["Standing coordination body — all domain leads"],
    note: "Atlanta's standing operational coordination body. Meets monthly regardless of active incidents.",
  },
  {
    layer: "Layer 3",
    name: "Operational Command",
    cadence: "Activated for major events / emergencies",
    color: C.amber,
    responsibilities: ["FIFA World Cup operations", "Super Bowl activation", "Emergency response", "Severe weather events", "Large civic events"],
    members: ["Incident Commander", "Domain leads (all 7)", "AeroGrid ops", "NCICC cyber"],
    note: "Uses Incident Command principles extended beyond emergency management. Single unified command for any activation.",
  },
];

const DOMAINS = [
  {
    num: 1, name: "Mobility & Transportation", color: "#3B82F6",
    sub: ["AeroGrid (Airport, Airspace, Cargo)", "MARTA · GDOT · Roads · Parking", "Event transportation (stadium / fan movement)"],
    kpis: ["Travel time", "Throughput", "Delays"],
    platform: "AeroGrid",
  },
  {
    num: 2, name: "Public Safety", color: "#EF4444",
    sub: ["APD · AFRD · GSP · Federal Partners", "Threat & crowd management", "Investigations & intelligence"],
    kpis: ["Incident response", "Clearance times", "Event safety metrics"],
    platform: "CivicSync",
  },
  {
    num: 3, name: "Critical Infrastructure", color: "#F59E0B",
    sub: ["Power · Water · Telecom · Fuel", "Data centers", "Monitoring, restoration, resilience planning"],
    kpis: ["Uptime", "Restoration speed", "Dependency risk"],
    platform: "CivicSync",
  },
  {
    num: 4, name: "Cyber & Digital Operations", color: "#8B5CF6",
    sub: ["OT security · SCADA security", "Aviation systems protection", "AI governance — NCICC principles"],
    kpis: ["Cyber readiness", "Vulnerability remediation", "Recovery time"],
    platform: "NCICC",
  },
  {
    num: 5, name: "Community & Human Services", color: "#10B981",
    sub: ["Schools · Hospitals · Shelters", "Nonprofit networks", "Vulnerable populations · Recovery"],
    kpis: ["Service continuity", "Community engagement"],
    platform: "CivicSync",
  },
  {
    num: 6, name: "Economic & Innovation Ecosystem", color: "#14B8A6",
    sub: ["Universities · Startups · Corporate partners", "Innovation pilots", "Workforce development · Investment attraction"],
    kpis: ["Jobs", "Investment", "Pilot success"],
    platform: "Sentrais Core",
  },
  {
    num: 7, name: "Event & Venue Operations", color: "#F97316",
    sub: ["FIFA · Mercedes-Benz Stadium", "Conventions · Festivals", "Readiness · Logistics · Fan experience"],
    kpis: ["Operational performance", "Stakeholder satisfaction"],
    platform: "EverGame",
  },
  {
    num: 8, name: "AeroGrid Atlanta™", color: "#0EA5E9",
    sub: ["Airport Operations Digital Twin", "Coordinated Traffic & Mobility Command", "Aviation Emergency Management Center", "Smart Infrastructure & Predictive Maintenance", "Airport Cyber Resilience Program"],
    kpis: ["Airport throughput", "Delay rate", "Cyber readiness score"],
    platform: "AeroGrid",
    isPillar8: true,
    tagline: "Future-Ready Aviation, Mobility, and Operational Resilience",
  },
];

const PLAYBOOKS = [
  { num: 1, name: "Daily Operations", trigger: "Normal operations", status: "active" },
  { num: 2, name: "Major Event", trigger: "Sports / Concerts / Conventions", status: "active" },
  { num: 3, name: "FIFA World Cup", trigger: "Mega-event dedicated framework", status: "active" },
  { num: 4, name: "Airport Surge", trigger: "Peak travel / Weather / Mass disruption", status: "active" },
  { num: 5, name: "Severe Weather", trigger: "Tornado / Flooding / Winter Storm", status: "draft" },
  { num: 6, name: "Critical Infrastructure Failure", trigger: "Power / Water / Telecom", status: "draft" },
  { num: 7, name: "Cyber Incident", trigger: "NCICC-derived model", status: "draft" },
  { num: 8, name: "Public Safety Incident", trigger: "Major incidents", status: "draft" },
  { num: 9, name: "Public Health", trigger: "Pandemic / Mass casualty", status: "draft" },
  { num: 10, name: "Civil Unrest", trigger: "Lessons learned from prior activations", status: "draft" },
  { num: 11, name: "Recovery & Continuity", trigger: "Recovery phase", status: "draft" },
  { num: 12, name: "Economic Stabilization", trigger: "Business continuity / Economic recovery", status: "draft" },
];

const TECH_STACK = [
  { name: "Sentrais Core", role: "Operational orchestration & strategic governance", layer: "Platform", color: C.accent },
  { name: "AeroGrid", role: "Airport, airspace, mobility, and aviation resilience", layer: "Mobility", color: "#3B82F6" },
  { name: "CivicSync", role: "City resilience, infrastructure, public safety", layer: "City Ops", color: C.teal },
  { name: "EverGame", role: "Event and venue operations management", layer: "Events", color: "#F97316" },
  { name: "NCICC", role: "Cyber coordination and digital operations", layer: "Cyber", color: "#8B5CF6" },
];

const INDICES = [
  { name: "Readiness Index", color: C.accent, measures: ["Preparedness", "Staffing", "Training", "Technology", "Exercises"], score: 74 },
  { name: "Resilience Index", color: C.green, measures: ["Recovery capability", "Infrastructure resilience", "Cyber resilience", "Community resilience"], score: 68 },
  { name: "Mobility Index", color: "#3B82F6", measures: ["Movement efficiency", "Airport throughput", "Event transportation"], score: 81 },
  { name: "Innovation Index", color: C.purple, measures: ["Pilots", "Startups", "Workforce development", "Capital investment"], score: 55 },
];

const AEROGRID_COMPONENTS = [
  {
    num: 1, name: "Airport Operations Digital Twin",
    desc: "Real-time operational model covering airside, landside, ground transportation, terminal flow, cargo, and public safety operations.",
    capabilities: ["Predictive congestion modeling", "Resource optimization", "Delay forecasting", "Incident simulation", "Operational readiness scoring"],
  },
  {
    num: 2, name: "Coordinated Traffic & Mobility Command",
    desc: "Integrated mobility management replacing 6 independently-operating systems (Airport, City, MARTA, GDOT, Rideshare, Venues).",
    capabilities: ["Airport + FIFA transportation coordination", "Major event traffic management", "Freight movement", "Emergency rerouting"],
  },
  {
    num: 3, name: "Aviation Emergency Management Center",
    desc: "National model for airport resilience built on NCICC and Host City frameworks. Handles aircraft incidents, severe weather, cyber attacks, mass casualty events.",
    capabilities: ["Airport Operations Center integration", "Emergency Operations Center", "Transportation Management", "Cyber Operations", "Weather Monitoring"],
  },
  {
    num: 4, name: "Smart Infrastructure & Predictive Maintenance",
    desc: "AI and sensor-driven monitoring of runways, bridges, power, fuel, HVAC, baggage, and rail systems.",
    capabilities: ["Reduced outages", "Lower maintenance costs", "Increased uptime", "Improved safety"],
  },
  {
    num: 5, name: "Airport Cyber Resilience Program",
    desc: "Atlanta can lead nationally. Target: Atlanta Aviation Cyber Center of Excellence.",
    capabilities: ["OT / SCADA security", "Aviation systems protection", "Supply chain security", "Cyber incident response"],
  },
];

const P3_REVENUE = [
  { stream: "Innovation Sandbox", desc: "Airport provides test environments, data access, operational use cases. Private sector provides investment, pilot funding, grants.", participants: ["Airlines", "Aerospace firms", "AI providers", "Mobility providers", "Universities"] },
  { stream: "Aviation Innovation District", desc: "Around-airport ecosystem development: lease revenue, economic development, job creation.", participants: ["Aviation startups", "Aerospace firms", "Logistics companies", "Smart mobility providers", "AI developers"] },
  { stream: "Data & Analytics Services", desc: "Airport-generated operational insights as products: passenger flow, logistics, event readiness intelligence, transportation optimization.", participants: ["Airlines", "Vendors", "Host cities", "Event operators"] },
  { stream: "Resilience-as-a-Service", desc: "Atlanta airport as living laboratory. Export capabilities nationally and globally — mirrors EverGame and CivicSync model.", participants: ["Other airports", "Seaports", "Host cities", "Transit agencies"] },
];

const TABS = [
  { id: "governance", label: "Governance Layers", icon: Building2 },
  { id: "domains", label: "7 Domains + AeroGrid", icon: Layers },
  { id: "playbooks", label: "12 Playbooks", icon: Shield },
  { id: "aerogrid", label: "AeroGrid Pillar 8", icon: Plane },
  { id: "tech", label: "Technology Stack", icon: Cpu },
  { id: "measurement", label: "Measurement", icon: BarChart3 },
];

export default function Atlanta360() {
  const [tab, setTab] = useState("governance");

  return (
    <ForgePage>
      <ForgeHeader
        icon={Building2}
        title="Atlanta360 — Unified Operations Playbook"
        subtitle="AUOP · One city operating system · AeroGrid Pillar 8 · FIFA & mega-event backbone"
        stats={[
          { label: "Domains", value: "7+AeroGrid", color: C.accent },
          { label: "Playbooks", value: 12, color: C.teal },
          { label: "Platform Modules", value: 5, color: C.purple },
        ]}
      />
      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />

      <ForgeContent>

        {/* GOVERNANCE */}
        {tab === "governance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ padding: "12px 16px", background: C.accent + "10", border: `1px solid ${C.accent}30`, borderRadius: 8, fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}>
              <strong style={{ color: C.accent }}>Core Design Principle:</strong> Do not build separate playbooks for transportation, airport, public safety, events, resilience, and economic development. Build a single operating model with specialized modules. Failures rarely occur within a single agency — they occur in the seams between agencies.
            </div>
            {GOVERNANCE_LAYERS.map((layer) => (
              <ForgeCard key={layer.layer} accent={layer.color}>
                <ForgeCardBody>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 11, color: layer.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{layer.layer}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, marginTop: 2 }}>{layer.name}</div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{layer.cadence}</div>
                    </div>
                    <ForgeBadge variant={layer.layer === "Layer 3" ? "warning" : layer.layer === "Layer 1" ? "info" : "success"}>
                      {layer.layer === "Layer 3" ? "Event-Activated" : layer.layer === "Layer 1" ? "Strategic" : "Standing"}
                    </ForgeBadge>
                  </div>
                  <ForgeGrid cols={3} gap={12}>
                    <div>
                      <ForgeLabel color={layer.color}>Responsibilities</ForgeLabel>
                      {layer.responsibilities.map((r, i) => (
                        <div key={i} style={{ fontSize: 12, color: C.textSecondary, marginBottom: 4, display: "flex", gap: 6 }}>
                          <span style={{ color: layer.color }}>→</span>{r}
                        </div>
                      ))}
                    </div>
                    <div>
                      <ForgeLabel color={layer.color}>Membership</ForgeLabel>
                      {layer.members.map((m, i) => (
                        <div key={i} style={{ fontSize: 12, color: C.textSecondary, marginBottom: 4 }}>· {m}</div>
                      ))}
                    </div>
                    {layer.note && (
                      <div>
                        <ForgeLabel>Operational Note</ForgeLabel>
                        <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.5 }}>{layer.note}</div>
                      </div>
                    )}
                  </ForgeGrid>
                </ForgeCardBody>
              </ForgeCard>
            ))}
          </div>
        )}

        {/* DOMAINS */}
        {tab === "domains" && (
          <ForgeGrid cols={2} gap={14}>
            {DOMAINS.map((d) => (
              <ForgeCard key={d.num} accent={d.color}>
                <ForgeCardBody>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: d.color, background: d.color + "20", padding: "2px 8px", borderRadius: 4 }}>
                          {d.isPillar8 ? "PILLAR 8" : `DOMAIN ${d.num}`}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{d.name}</span>
                      </div>
                      {d.tagline && <div style={{ fontSize: 11, color: d.color, marginTop: 4, fontStyle: "italic" }}>{d.tagline}</div>}
                    </div>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: C.surface, color: C.textMuted, border: `1px solid ${C.border}` }}>{d.platform}</span>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    {d.sub.map((s, i) => (
                      <div key={i} style={{ fontSize: 12, color: C.textSecondary, marginBottom: 3, display: "flex", gap: 6 }}>
                        <div style={{ width: 3, height: 3, borderRadius: "50%", background: d.color, flexShrink: 0, marginTop: 6 }} />{s}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {d.kpis.map((k, i) => (
                      <span key={i} style={{ fontSize: 10, padding: "2px 8px", background: d.color + "15", color: d.color, borderRadius: 4 }}>{k}</span>
                    ))}
                  </div>
                </ForgeCardBody>
              </ForgeCard>
            ))}
          </ForgeGrid>
        )}

        {/* PLAYBOOKS */}
        {tab === "playbooks" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>
              12 standardized playbooks maintained by the city. All use the same underlying operational model — single framework, specialized activation procedures.
            </div>
            {PLAYBOOKS.map((pb) => (
              <ForgeCard key={pb.num}>
                <ForgeCardBody style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: C.accent + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent, flexShrink: 0 }}>
                    {pb.num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{pb.name} Playbook</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 1 }}>{pb.trigger}</div>
                  </div>
                  {pb.status === "active"
                    ? <ForgeBadge variant="success">Active</ForgeBadge>
                    : <ForgeBadge variant="neutral">Draft</ForgeBadge>
                  }
                </ForgeCardBody>
              </ForgeCard>
            ))}
          </div>
        )}

        {/* AEROGRID */}
        {tab === "aerogrid" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ForgeCard accent={C.accent}>
              <ForgeCardBody>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.accent, marginBottom: 6 }}>AeroGrid Atlanta™ — Pillar 8</div>
                <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
                  A next-generation aviation and mobility resilience platform designed to transform Atlanta's airport ecosystem into the world's most connected, efficient, and resilient transportation hub. AeroGrid extends Atlanta360 from a city resilience framework into a true regional operating system.
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>
                  "The end state is: Atlanta becomes the world's first fully integrated Resilient Mobility Region."
                </div>
              </ForgeCardBody>
            </ForgeCard>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {AEROGRID_COMPONENTS.map((comp) => (
                <ForgeCard key={comp.num}>
                  <ForgeCardBody>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: C.accent + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent, flexShrink: 0 }}>
                        {comp.num}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>{comp.name}</div>
                        <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.5, marginBottom: 10 }}>{comp.desc}</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {comp.capabilities.map((cap, i) => (
                            <span key={i} style={{ fontSize: 11, padding: "2px 10px", background: C.accent + "15", color: C.accent, borderRadius: 4 }}>{cap}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ForgeCardBody>
                </ForgeCard>
              ))}
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, marginBottom: 12 }}>P3 Revenue Streams</div>
              <ForgeGrid cols={2} gap={12}>
                {P3_REVENUE.map((r, i) => (
                  <ForgeCard key={i}>
                    <ForgeCardBody>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.accent, marginBottom: 6 }}>{r.stream}</div>
                      <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.5, marginBottom: 10 }}>{r.desc}</div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {r.participants.map((p, j) => (
                          <span key={j} style={{ fontSize: 10, padding: "2px 6px", background: C.surfaceAlt, color: C.textMuted, borderRadius: 3, border: `1px solid ${C.border}` }}>{p}</span>
                        ))}
                      </div>
                    </ForgeCardBody>
                  </ForgeCard>
                ))}
              </ForgeGrid>
            </div>
          </div>
        )}

        {/* TECH STACK */}
        {tab === "tech" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>
              All five modules feed a common operational environment — one city operating picture, not five separate dashboards.
            </div>
            {TECH_STACK.map((t) => (
              <ForgeCard key={t.name} accent={t.color}>
                <ForgeCardBody style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 80, flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.color }}>{t.name}</div>
                    <span style={{ fontSize: 10, padding: "2px 6px", background: t.color + "20", color: t.color, borderRadius: 3 }}>{t.layer}</span>
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: C.textSecondary }}>{t.role}</div>
                </ForgeCardBody>
              </ForgeCard>
            ))}
          </div>
        )}

        {/* MEASUREMENT */}
        {tab === "measurement" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>
              Annual output: <strong style={{ color: C.textPrimary }}>State of Atlanta Operations Report</strong> — equivalent to a corporate annual report. Includes readiness score, resilience score, mobility score, innovation score, economic impact, and future risks.
            </div>
            <ForgeGrid cols={2} gap={14}>
              {INDICES.map((idx) => (
                <ForgeCard key={idx.name} accent={idx.color}>
                  <ForgeCardBody>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: idx.color }}>{idx.name}</div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: idx.color }}>{idx.score}</div>
                        <div style={{ fontSize: 10, color: C.textMuted }}>/ 100</div>
                      </div>
                    </div>
                    <div style={{ height: 4, background: C.border, borderRadius: 2, marginBottom: 12, overflow: "hidden" }}>
                      <div style={{ width: `${idx.score}%`, height: "100%", background: idx.color, borderRadius: 2 }} />
                    </div>
                    <ForgeLabel color={idx.color}>Measures</ForgeLabel>
                    {idx.measures.map((m, i) => (
                      <div key={i} style={{ fontSize: 12, color: C.textSecondary, marginBottom: 3, display: "flex", gap: 6 }}>
                        <div style={{ width: 3, height: 3, borderRadius: "50%", background: idx.color, flexShrink: 0, marginTop: 6 }} />{m}
                      </div>
                    ))}
                  </ForgeCardBody>
                </ForgeCard>
              ))}
            </ForgeGrid>
          </div>
        )}

      </ForgeContent>
    </ForgePage>
  );
}

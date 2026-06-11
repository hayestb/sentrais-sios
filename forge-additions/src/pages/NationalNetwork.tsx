// @ts-nocheck
import { useState } from "react";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody,
  ForgeLabel, ForgeBadge, ForgeGrid, ForgeAlert, C,
} from "../components/ui/forge";

const TABS = [
  "Overview & Vision",
  "Platform Layers",
  "City Network",
  "New Orleans Lab",
  "Innovation Commons",
  "Revenue & Fund",
];

const PHASES = [
  {
    phase: "Phase 1", label: "NCICC", years: "2024–2025",
    desc: "National Civic Innovation Command Center — Atlanta proof-of-concept. Establish governance framework, deploy Sentrais Core, validate CivicGrid™ across city agencies.",
    color: C.accent,
  },
  {
    phase: "Phase 2", label: "Atlanta 360", years: "2025–2026",
    desc: "Full Atlanta deployment integrating AeroGrid™ (Hartsfield-Jackson), SpectraGrid™ (FIFA 2026), and EverGame platform. First P3 revenue streams operational.",
    color: C.teal,
  },
  {
    phase: "Phase 3", label: "Regional Network", years: "2026–2028",
    desc: "Expand to New Orleans (festival/resilience lab), Nashville (music/health corridor), Miami (port/climate hub), Charlotte (banking/mobility node), Boston (research anchor).",
    color: C.purple,
  },
  {
    phase: "Phase 4", label: "National Civic Innovation Network", years: "2028+",
    desc: "Full national civic operating system. Shared Innovation Fund active. Innovation Commons (GT/MIT/Tulane/GSU) producing replicable city-ready modules.",
    color: C.amber,
  },
];

const PLATFORMS = [
  {
    name: "CivicGrid™",
    tagline: "Civic Operations Layer",
    color: C.accent,
    desc: "Real-time city operations platform. Integrates public safety dispatch, infrastructure monitoring, permitting workflows, and inter-agency data sharing across all network cities.",
    capabilities: [
      "Real-time situational awareness dashboard",
      "Cross-agency incident coordination",
      "Predictive infrastructure maintenance",
      "Permit & compliance automation",
      "Equity analytics & community reporting",
    ],
    deployments: ["Atlanta (live)", "New Orleans (pilot)", "Nashville (planned)", "Miami (planned)"],
  },
  {
    name: "SpectraGrid™",
    tagline: "Events & Spectacle Layer",
    color: C.teal,
    desc: "Large-scale event operations platform. Manages crowd flow, venue logistics, broadcast infrastructure, sponsor activation, and public safety for marquee civic events.",
    capabilities: [
      "Digital twin crowd simulation",
      "Multi-venue transport orchestration",
      "Broadcast & media infrastructure routing",
      "Sponsor & vendor activation management",
      "Real-time public safety integration",
    ],
    deployments: ["FIFA 2026 Atlanta", "Mardi Gras / Jazz Fest NO", "Super Bowl LIX NO", "Essence Festival NO"],
  },
  {
    name: "EntertainmentOS™",
    tagline: "Culture & Economy Layer",
    color: C.purple,
    desc: "Cultural economy activation platform. Connects artists, venues, promoters, and local businesses into a managed creative ecosystem with revenue-sharing and impact tracking.",
    capabilities: [
      "Artist & venue marketplace",
      "Cultural corridor economic modeling",
      "Tourism & hospitality integration",
      "Community revenue distribution",
      "EverGame sports partnership layer",
    ],
    deployments: ["Atlanta creative districts", "New Orleans music economy", "Nashville artist corridors"],
  },
];

const CITIES = [
  {
    city: "Atlanta", state: "GA", role: "Governance Hub",
    status: "active", color: C.accent,
    platforms: ["CivicGrid™", "SpectraGrid™", "EntertainmentOS™"],
    keyAssets: ["Hartsfield-Jackson (AeroGrid™)", "FIFA 2026 host", "NCICC headquarters", "GT Innovation Commons anchor"],
    phase: "Phase 1–2",
  },
  {
    city: "New Orleans", state: "LA", role: "Festival & Resilience Lab",
    status: "pilot", color: C.teal,
    platforms: ["CivicGrid™", "SpectraGrid™", "EntertainmentOS™"],
    keyAssets: ["Mardi Gras / Jazz Fest", "Super Bowl LIX (2025)", "Essence Festival", "Tulane Innovation Commons node"],
    phase: "Phase 3",
  },
  {
    city: "Boston", state: "MA", role: "Research Anchor",
    status: "pipeline", color: C.purple,
    platforms: ["CivicGrid™"],
    keyAssets: ["MIT Innovation Commons node", "Academic R&D pipeline", "Smart city research integration"],
    phase: "Phase 3",
  },
  {
    city: "Nashville", state: "TN", role: "Music & Health Corridor",
    status: "pipeline", color: C.amber,
    platforms: ["CivicGrid™", "EntertainmentOS™"],
    keyAssets: ["Music industry economy", "Health innovation corridor", "Regional transit integration"],
    phase: "Phase 3",
  },
  {
    city: "Miami", state: "FL", role: "Port & Climate Hub",
    status: "pipeline", color: "#06b6d4",
    platforms: ["CivicGrid™", "SpectraGrid™"],
    keyAssets: ["PortMiami logistics", "Climate resilience modeling", "International gateway"],
    phase: "Phase 3",
  },
  {
    city: "Charlotte", state: "NC", role: "Banking & Mobility Node",
    status: "pipeline", color: "#84cc16",
    platforms: ["CivicGrid™"],
    keyAssets: ["Financial services corridor", "I-85 mobility spine", "Regional logistics hub"],
    phase: "Phase 3",
  },
];

const NEW_ORLEANS_EVENTS = [
  { name: "Mardi Gras", scale: "1.4M+ visitors", platform: "SpectraGrid™", domains: ["Crowd management", "Route optimization", "Vendor coordination", "Public safety"] },
  { name: "Jazz & Heritage Festival", scale: "475K+ attendees", platform: "SpectraGrid™ + EntertainmentOS™", domains: ["Stage logistics", "Artist ops", "Revenue tracking", "Media broadcast"] },
  { name: "Essence Festival", scale: "500K+ attendees", platform: "EntertainmentOS™", domains: ["Cultural activation", "Artist marketplace", "Economic impact reporting", "Community revenue"] },
  { name: "Super Bowl LIX (2025)", scale: "~150K visitors", platform: "All 3 layers", domains: ["CivicGrid security", "SpectraGrid venue ops", "EntertainmentOS hospitality economy"] },
  { name: "Sugar Bowl", scale: "~75K attendees", platform: "SpectraGrid™", domains: ["Venue logistics", "Transport orchestration", "Fan experience"] },
];

const INNOVATION_COMMONS = [
  {
    institution: "Georgia Tech", city: "Atlanta", abbr: "GT",
    color: C.accent,
    focus: "Smart city infrastructure, AI/ML urban systems, AeroGrid research partnership",
    programs: ["Digital twin development", "Transportation AI", "Equity data analytics", "NCICC technical staff pipeline"],
  },
  {
    institution: "MIT", city: "Boston", abbr: "MIT",
    color: C.purple,
    focus: "Urban systems research, climate resilience modeling, civic technology policy",
    programs: ["Climate adaptation modules", "Civic tech policy lab", "Boston node anchor", "Cross-network research protocols"],
  },
  {
    institution: "Tulane University", city: "New Orleans", abbr: "TU",
    color: C.teal,
    focus: "Disaster resilience, cultural economy research, festival operations science",
    programs: ["Post-disaster civic recovery", "Cultural corridor economics", "SpectraGrid festival research", "New Orleans living lab"],
  },
  {
    institution: "Georgia State University", city: "Atlanta", abbr: "GSU",
    color: C.amber,
    focus: "Workforce development, community equity programs, urban health corridors",
    programs: ["Civic fellowship pipeline", "Community equity analysis", "Public health data integration", "Atlanta workforce training"],
  },
];

const REVENUE = [
  { stream: "SaaS Licensing", desc: "Annual city platform subscriptions — CivicGrid™, SpectraGrid™, EntertainmentOS™", est: "$2.4M–$8M / city / year", badge: "recurring" },
  { stream: "Event Operations Contracts", desc: "Per-event deployment fees for marquee activations (Super Bowl, FIFA, Mardi Gras)", est: "$500K–$3M / event", badge: "project" },
  { stream: "P3 Infrastructure Revenue Share", desc: "AeroGrid digital infrastructure revenue share at participating airports", est: "4–7% gross concession revenue", badge: "recurring" },
  { stream: "Innovation Commons Grants", desc: "Federal and foundation grants routed through university partnerships", est: "$1M–$5M / year", badge: "grant" },
  { stream: "Shared Innovation Fund Returns", desc: "Returns distributed to network cities from commercialized platform modules", est: "Revenue share post-2028", badge: "fund" },
  { stream: "EntertainmentOS™ Marketplace", desc: "Transaction fees from artist/venue marketplace and sponsor activations", est: "3–6% GMV", badge: "recurring" },
];

export default function NationalNetwork() {
  const [tab, setTab] = useState(0);

  return (
    <ForgePage>
      <ForgeHeader
        icon="🌐"
        title="National Civic Innovation Network"
        subtitle="Four-phase evolution from Atlanta proof-of-concept to national civic operating system"
        stats={[
          { label: "Cities", value: "6" },
          { label: "Platform Layers", value: "3" },
          { label: "Phase", value: "Atlanta 360" },
          { label: "Anchor Universities", value: "4" },
        ]}
      />
      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />
      <ForgeContent>

        {/* ── TAB 0: Overview ── */}
        {tab === 0 && (
          <div>
            <ForgeAlert level="info" title="Strategic Vision">
              The National Civic Innovation Network (NCIN) is a replicable civic operating system — first proven in Atlanta, then scaled across peer cities — delivering integrated governance, event operations, and cultural economy infrastructure under a single interoperable platform architecture.
            </ForgeAlert>

            <ForgeLabel style={{ marginTop: 28, marginBottom: 16 }}>Four-Phase Evolution</ForgeLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PHASES.map((p) => (
                <div key={p.phase} style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderLeft: `4px solid ${p.color}`, borderRadius: 10, padding: "16px 20px",
                  display: "flex", alignItems: "flex-start", gap: 20,
                }}>
                  <div style={{ minWidth: 100 }}>
                    <div style={{ fontSize: 11, color: p.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>{p.phase}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginTop: 2 }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{p.years}</div>
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, paddingTop: 4 }}>{p.desc}</div>
                </div>
              ))}
            </div>

            <ForgeLabel style={{ marginTop: 28, marginBottom: 16 }}>Network Architecture Principles</ForgeLabel>
            <ForgeGrid cols={3}>
              {[
                { title: "Interoperability First", body: "All city deployments share the same platform API surface. Local configuration wraps a common core — no forks, no bespoke builds per city." },
                { title: "Proven Before Replicated", body: "Each platform layer must demonstrate measurable civic ROI in Atlanta before being offered to network cities. No vaporware deployments." },
                { title: "Shared Innovation Fund", body: "A portion of each city's platform fees flows into a network-wide fund that finances R&D and subsidizes onboarding for underresourced cities." },
                { title: "University Anchors", body: "GT, MIT, Tulane, and GSU provide research continuity, technical talent pipelines, and independent impact verification at each city node." },
                { title: "P3 Revenue Model", body: "Public-private partnerships ensure cities don't bear full platform cost. Airport, venue, and event operators co-fund infrastructure as revenue-generating assets." },
                { title: "Cultural Sovereignty", body: "EntertainmentOS™ is designed to keep cultural economy revenue local — artist and community revenue-share is a structural platform requirement, not an add-on." },
              ].map((c) => (
                <ForgeCard key={c.title}>
                  <ForgeCardHeader title={c.title} />
                  <ForgeCardBody><p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{c.body}</p></ForgeCardBody>
                </ForgeCard>
              ))}
            </ForgeGrid>
          </div>
        )}

        {/* ── TAB 1: Platform Layers ── */}
        {tab === 1 && (
          <div>
            <ForgeAlert level="info" title="Three-Layer Architecture">
              Every network city deploys some combination of these three platforms. Atlanta runs all three. Smaller cities may begin with CivicGrid™ alone and layer in SpectraGrid™ and EntertainmentOS™ as event and cultural assets are activated.
            </ForgeAlert>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>
              {PLATFORMS.map((p) => (
                <ForgeCard key={p.name} accent={p.color}>
                  <ForgeCardHeader
                    title={p.name}
                    subtitle={p.tagline}
                    badge={<ForgeBadge variant="info">{p.deployments.length} deployments</ForgeBadge>}
                  />
                  <ForgeCardBody>
                    <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{p.desc}</p>
                    <ForgeGrid cols={2}>
                      <div>
                        <ForgeLabel style={{ marginBottom: 10 }}>Core Capabilities</ForgeLabel>
                        {p.capabilities.map((c) => (
                          <div key={c} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7 }}>
                            <span style={{ color: p.color, marginTop: 1, flexShrink: 0 }}>▸</span>
                            <span style={{ fontSize: 13, color: "#94a3b8" }}>{c}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <ForgeLabel style={{ marginBottom: 10 }}>Active Deployments</ForgeLabel>
                        {p.deployments.map((d) => (
                          <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                            <span style={{ color: p.color }}>●</span>
                            <span style={{ fontSize: 13, color: "#94a3b8" }}>{d}</span>
                          </div>
                        ))}
                      </div>
                    </ForgeGrid>
                  </ForgeCardBody>
                </ForgeCard>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 2: City Network ── */}
        {tab === 2 && (
          <div>
            <ForgeGrid cols={2}>
              {CITIES.map((city) => (
                <ForgeCard key={city.city} accent={city.color}>
                  <ForgeCardHeader
                    title={`${city.city}, ${city.state}`}
                    subtitle={city.role}
                    badge={
                      <ForgeBadge variant={city.status === "active" ? "success" : city.status === "pilot" ? "info" : "neutral"}>
                        {city.status === "active" ? "Active" : city.status === "pilot" ? "Pilot" : "Pipeline"}
                      </ForgeBadge>
                    }
                  />
                  <ForgeCardBody>
                    <div style={{ marginBottom: 12 }}>
                      <ForgeLabel style={{ marginBottom: 6 }}>Platforms</ForgeLabel>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {city.platforms.map((pl) => (
                          <span key={pl} style={{
                            fontSize: 11, padding: "3px 8px", borderRadius: 5,
                            background: "rgba(14,165,233,0.1)", color: C.accent,
                            border: `1px solid rgba(14,165,233,0.2)`,
                          }}>{pl}</span>
                        ))}
                      </div>
                    </div>
                    <ForgeLabel style={{ marginBottom: 6 }}>Key Assets</ForgeLabel>
                    {city.keyAssets.map((a) => (
                      <div key={a} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 5 }}>
                        <span style={{ color: city.color, flexShrink: 0, marginTop: 1 }}>▸</span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{a}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 10, fontSize: 11, color: "#4a6080" }}>Timeline: {city.phase}</div>
                  </ForgeCardBody>
                </ForgeCard>
              ))}
            </ForgeGrid>
          </div>
        )}

        {/* ── TAB 3: New Orleans Lab ── */}
        {tab === 3 && (
          <div>
            <ForgeAlert level="success" title="Living Laboratory Designation">
              New Orleans is the network's primary festival and resilience living laboratory. Its uniquely dense calendar of major civic events — operating at scale and under logistical extremes — makes it the ideal second city for proving SpectraGrid™ and EntertainmentOS™ before national expansion.
            </ForgeAlert>

            <ForgeLabel style={{ marginTop: 24, marginBottom: 16 }}>Platform Layer Activation</ForgeLabel>
            <ForgeGrid cols={3}>
              {[
                { name: "CivicGrid™", role: "City Resilience Operations", desc: "Post-disaster recovery coordination, infrastructure monitoring, cross-agency data sharing across NOPD, NOFD, utilities, and emergency management.", color: C.accent },
                { name: "SpectraGrid™", role: "Festival & Event Operations", desc: "Crowd flow modeling, multi-venue logistics orchestration, broadcast infrastructure, and real-time public safety integration for Mardi Gras, Jazz Fest, Super Bowl, and Sugar Bowl.", color: C.teal },
                { name: "EntertainmentOS™", role: "Cultural Economy Engine", desc: "Music economy marketplace, artist revenue distribution, Essence Festival activation, and cultural corridor economic impact tracking for the most culturally dense city in the network.", color: C.purple },
              ].map((pl) => (
                <ForgeCard key={pl.name} accent={pl.color}>
                  <ForgeCardHeader title={pl.name} subtitle={pl.role} />
                  <ForgeCardBody>
                    <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>{pl.desc}</p>
                  </ForgeCardBody>
                </ForgeCard>
              ))}
            </ForgeGrid>

            <ForgeLabel style={{ marginTop: 28, marginBottom: 16 }}>Major Event Calendar</ForgeLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {NEW_ORLEANS_EVENTS.map((ev) => (
                <div key={ev.name} style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: "14px 18px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{ev.name}</span>
                      <span style={{ fontSize: 12, color: "#64748b", marginLeft: 12 }}>{ev.scale}</span>
                    </div>
                    <span style={{
                      fontSize: 11, padding: "3px 9px", borderRadius: 5,
                      background: "rgba(20,184,166,0.1)", color: C.teal,
                      border: `1px solid rgba(20,184,166,0.2)`,
                    }}>{ev.platform}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ev.domains.map((d) => (
                      <span key={d} style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 4,
                        background: "rgba(100,116,139,0.15)", color: "#94a3b8",
                      }}>{d}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <ForgeLabel style={{ marginTop: 28, marginBottom: 16 }}>Tulane University Integration</ForgeLabel>
            <ForgeCard accent={C.teal}>
              <ForgeCardBody>
                <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 12 }}>
                  Tulane anchors the Innovation Commons node in New Orleans, providing disaster resilience research, cultural economy science, and festival operations study to the NCIN platform team. Tulane's post-Katrina institutional expertise in urban recovery makes it a uniquely qualified research partner for the resilience pillar.
                </p>
                <ForgeGrid cols={2}>
                  {[
                    "Post-disaster civic recovery research",
                    "Cultural corridor economics lab",
                    "SpectraGrid festival operations research",
                    "Community equity impact measurement",
                    "New Orleans living lab program management",
                    "Cross-network resilience protocol development",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: C.teal, flexShrink: 0 }}>▸</span>
                      <span style={{ fontSize: 13, color: "#94a3b8" }}>{item}</span>
                    </div>
                  ))}
                </ForgeGrid>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

        {/* ── TAB 4: Innovation Commons ── */}
        {tab === 4 && (
          <div>
            <ForgeAlert level="info" title="Innovation Commons Mission">
              Four anchor universities form the research and talent backbone of the NCIN. Each institution is co-located with a network city node, provides independent impact verification, and maintains a research pipeline that feeds replicable civic modules back into the shared platform.
            </ForgeAlert>
            <ForgeGrid cols={2} style={{ marginTop: 20 }}>
              {INNOVATION_COMMONS.map((inst) => (
                <ForgeCard key={inst.abbr} accent={inst.color}>
                  <ForgeCardHeader
                    title={inst.institution}
                    subtitle={inst.city}
                    badge={<ForgeBadge variant="neutral">{inst.abbr}</ForgeBadge>}
                  />
                  <ForgeCardBody>
                    <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 14 }}>{inst.focus}</p>
                    <ForgeLabel style={{ marginBottom: 8 }}>Programs</ForgeLabel>
                    {inst.programs.map((p) => (
                      <div key={p} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                        <span style={{ color: inst.color, flexShrink: 0 }}>▸</span>
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>{p}</span>
                      </div>
                    ))}
                  </ForgeCardBody>
                </ForgeCard>
              ))}
            </ForgeGrid>

            <ForgeCard style={{ marginTop: 20 }}>
              <ForgeCardHeader title="Shared Research Protocols" subtitle="Cross-institution coordination" />
              <ForgeCardBody>
                <ForgeGrid cols={3}>
                  {[
                    { title: "Impact Verification", body: "Each city deployment is independently measured by the local university node. Data is shared across the network via a common metrics API." },
                    { title: "Module Certification", body: "Platform modules developed at one node are reviewed by at least two other university partners before being published to the shared platform library." },
                    { title: "Talent Pipeline", body: "Civic fellowship cohorts cycle through NCICC rotations, with fellowships co-administered by GT and GSU for Atlanta, and Tulane for New Orleans." },
                  ].map((c) => (
                    <div key={c.title}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>{c.title}</div>
                      <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>{c.body}</p>
                    </div>
                  ))}
                </ForgeGrid>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

        {/* ── TAB 5: Revenue & Fund ── */}
        {tab === 5 && (
          <div>
            <ForgeAlert level="info" title="Shared Innovation Fund">
              A portion of every city's annual platform fee flows into the NCIN Shared Innovation Fund. The fund finances onboarding for new cities, R&D for platform modules, and distributes returns to network participants based on usage and contribution metrics.
            </ForgeAlert>

            <ForgeLabel style={{ marginTop: 24, marginBottom: 16 }}>Revenue Streams</ForgeLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {REVENUE.map((r) => (
                <div key={r.stream} style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{r.stream}</span>
                      <ForgeBadge variant={
                        r.badge === "recurring" ? "success" :
                        r.badge === "grant" ? "info" :
                        r.badge === "fund" ? "purple" : "neutral"
                      }>{r.badge}</ForgeBadge>
                    </div>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>{r.desc}</p>
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: C.accent,
                    whiteSpace: "nowrap", minWidth: 180, textAlign: "right",
                  }}>{r.est}</div>
                </div>
              ))}
            </div>

            <ForgeGrid cols={2} style={{ marginTop: 24 }}>
              <ForgeCard accent={C.amber}>
                <ForgeCardHeader title="Shared Innovation Fund" subtitle="Structure & governance" />
                <ForgeCardBody>
                  {[
                    "10% of annual city SaaS fees contribute to fund pool",
                    "Fund governed by Innovation Commons advisory board",
                    "New city onboarding subsidized up to 50% via fund",
                    "R&D grants disbursed quarterly to university partners",
                    "Net returns distributed to cities post-2028 based on platform contribution score",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                      <span style={{ color: C.amber, flexShrink: 0 }}>▸</span>
                      <span style={{ fontSize: 13, color: "#94a3b8" }}>{item}</span>
                    </div>
                  ))}
                </ForgeCardBody>
              </ForgeCard>
              <ForgeCard accent={C.teal}>
                <ForgeCardHeader title="P3 Financial Model" subtitle="Public-private partnership structure" />
                <ForgeCardBody>
                  {[
                    "City pays 40–60% of platform cost via public budget",
                    "Venue/airport operators co-fund as infrastructure capex",
                    "Event organizers fund SpectraGrid™ deployments as operational line",
                    "Revenue share from commercial activations flows back to city",
                    "Federal grants (Smart City, DOT, HUD) fill onboarding gap",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                      <span style={{ color: C.teal, flexShrink: 0 }}>▸</span>
                      <span style={{ fontSize: 13, color: "#94a3b8" }}>{item}</span>
                    </div>
                  ))}
                </ForgeCardBody>
              </ForgeCard>
            </ForgeGrid>
          </div>
        )}

      </ForgeContent>
    </ForgePage>
  );
}

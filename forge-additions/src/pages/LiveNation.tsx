// @ts-nocheck
import { useState } from "react";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody, ForgeLabel,
  ForgeBadge, ForgeAlert, C,
} from "../components/ui/forge";

const LAYERS = [
  {
    id: "l1", layer: "L1", name: "Global Event Control",
    color: C.red,
    icon: "🌐",
    description: "Top-level command for multi-city tour planning, compound event routing (FIFA → Super Bowl → NCAA), and executive visibility across all active deployments.",
    capabilities: [
      "Multi-city tour calendar and sequencing (ATL → DAL → CHI → LA)",
      "Compound event routing — Super Cycle activation (FIFA + Super Bowl + NCAA)",
      "Cross-event resource allocation and redeployment planning",
      "Executive command dashboard — CEO/SVP-level live tour status",
      "Revenue forecast vs. actuals across all active markets",
    ],
    dataFeeds: ["Tour calendar data", "Market revenue projections", "Executive KPI dashboard"],
    ninRole: "Receives aggregated intelligence from L2–L5. Issues deployment directives downward.",
  },
  {
    id: "l2", layer: "L2", name: "Regional Operations Cluster",
    color: "#f97316",
    icon: "🗺️",
    description: "City-level operational management. Coordinates all venue clusters within a market, manages regional vendor relationships, and monitors market-specific risk factors.",
    capabilities: [
      "Venue cluster management within each city market",
      "Regional vendor contract management and staffing coordination",
      "Market-specific risk monitoring (weather, local events, labor)",
      "City-to-city intelligence handoff (ATL debrief → DAL briefing)",
      "Local law enforcement and municipal liaison management",
    ],
    dataFeeds: ["Venue cluster status", "Regional vendor performance", "Local risk signals"],
    ninRole: "Aggregates venue-level data upward to L1. Translates global directives into city-level action.",
  },
  {
    id: "l3", layer: "L3", name: "Venue Execution Command",
    color: C.amber,
    icon: "🏟️",
    description: "Day-of venue operations. Real-time command over staffing zones, access control, incident response, and operational execution against the GDA deployment plan.",
    capabilities: [
      "GDA zone activation — staffing deployment against the approved plan",
      "Real-time access control throughput monitoring",
      "Incident log management and command escalation",
      "VRI live scoring — updating in real-time against active conditions",
      "Medical response coordination and vendor floor management",
    ],
    dataFeeds: ["Zone density live feed", "Access control throughput", "Incident log stream", "VRI real-time score"],
    ninRole: "Primary operational data source. Sends live event data up to L2 and L4/L5 simultaneously.",
  },
  {
    id: "l4", layer: "L4", name: "Artist & Talent Intelligence",
    color: C.green,
    icon: "🎤",
    description: "Talent logistics, rider fulfillment, and artist experience management. Ensures all contractual obligations to artists and talent are met on-site and on time.",
    capabilities: [
      "Rider fulfillment tracking — all artist requirements logged and confirmed",
      "Talent logistics coordination (transportation, load-in/load-out timing)",
      "Green room and hospitality management by artist tier",
      "Performance schedule management and contingency timing",
      "Artist security and access credential management",
    ],
    dataFeeds: ["Rider fulfillment status", "Talent logistics schedule", "Artist access credentials"],
    ninRole: "Feeds artist experience quality data into L5 (guest intelligence) and debrief models at L6.",
  },
  {
    id: "l5", layer: "L5", name: "Guest & Revenue Intelligence",
    color: C.teal,
    icon: "💰",
    description: "Real-time fan behavior analytics and revenue capture. Monitors spend velocity, access bottlenecks, concession performance, and fan satisfaction signals.",
    capabilities: [
      "Real-time concession revenue velocity by zone and category",
      "Fan access bottleneck detection and routing optimization",
      "Premium asset utilization (VIP, suites, club areas)",
      "Fan satisfaction signals — NPS proxy from wait times and issue resolution speed",
      "Merchandise revenue capture and inventory alerts",
    ],
    dataFeeds: ["Concession POS stream", "Access throughput by gate", "Premium zone occupancy", "Fan NPS proxy"],
    ninRole: "Revenue and fan behavior data feeds directly into the Federated Learning Network at L6 post-event.",
  },
  {
    id: "l6", layer: "L6", name: "Federated Learning Network (NIN)",
    color: C.accent,
    icon: "📡",
    description: "The intelligence compounding layer. Post-event, all data from L1–L5 is federated into the SentraisOS core. Learnings improve GDA models, VRI baselines, and deployment cost efficiency for every future event.",
    capabilities: [
      "Cross-event pattern recognition — safety incidents, revenue peaks, staffing gaps",
      "GDA model improvement — assignment accuracy compounds per deployment",
      "VRI baseline recalibration from live vs. predicted delta",
      "Debrief data structuring and after-action report generation",
      "Intelligence export to SentraisOS core for all-vertical learning",
    ],
    dataFeeds: ["Aggregated L1–L5 data post-event", "VRI delta (predicted vs. actual)", "Incident pattern analysis"],
    ninRole: "Terminal intelligence layer. Feeds SentraisOS sovereign core. Improves all future deployments across every vertical.",
  },
];

const TOUR_SEQUENCE = [
  { city: "Atlanta", market: "Southeast Anchor", venues: ["State Farm Arena", "Mercedes-Benz Stadium", "Truist Park"], erpCode: "SNTR-EG", color: C.accent, ninFeed: "Baseline — establishes all L1–L5 benchmarks for the tour" },
  { city: "Dallas", market: "South Central", venues: ["American Airlines Center", "AT&T Stadium", "Globe Life Field"], erpCode: "SNTR-EG", color: C.teal, ninFeed: "Inherits ATL baseline. GDA accuracy improves from ATL staffing data" },
  { city: "Chicago", market: "Midwest Hub", venues: ["United Center", "Soldier Field", "Wrigley Field"], erpCode: "SNTR-EG", color: C.purple, ninFeed: "Inherits ATL + DAL. Fan behavior patterns sharpen. Revenue models recalibrated" },
  { city: "Los Angeles", market: "West Coast Anchor", venues: ["Crypto.com Arena", "SoFi Stadium", "Dodger Stadium"], erpCode: "SNTR-EG", color: C.amber, ninFeed: "Full 3-city intelligence base. Highest GDA accuracy and lowest deployment friction of the tour" },
];

const EXEC_VIEWS = [
  {
    id: "venue-ops", label: "Venue Operations", icon: "🏟️", layer: "L3",
    description: "Zone-by-zone staffing status, density live metrics, access control throughput, command escalation queue.",
    kpis: ["Staff deployment accuracy vs. plan (%)", "Zone density vs. ceiling (%)", "Gate throughput (fans/hr)", "Active incidents"],
  },
  {
    id: "safety", label: "Safety Command", icon: "🛡️", layer: "L1+L3",
    description: "Incident log (real-time), medical response status, law enforcement liaison, evacuation trigger readiness.",
    kpis: ["Open incidents (P1/P2/P3)", "Medical response time (min)", "Evacuation readiness score", "VRI safety dimension score"],
  },
  {
    id: "staffing", label: "Staffing & GDA", icon: "👥", layer: "L2+L3",
    description: "Staff deployment accuracy vs. plan, surge protocol status, certification compliance by zone.",
    kpis: ["Deployment accuracy (%)", "Surge triggers activated", "Certification compliance (%)", "GDA reallocation events"],
  },
  {
    id: "revenue", label: "Revenue & Fan", icon: "💰", layer: "L5",
    description: "Concession revenue velocity, fan satisfaction signals, access bottleneck alerts, premium asset utilization.",
    kpis: ["Concession rev velocity ($/hr)", "Premium occupancy (%)", "Fan NPS proxy score", "Access bottleneck alerts"],
  },
  {
    id: "tour", label: "Tour Intelligence", icon: "📊", layer: "L1+L6",
    description: "Cross-city tour metrics, NIN learning feed status, GDA model improvement tracking, forecast vs. actual.",
    kpis: ["Tour rev vs. forecast (%)", "GDA accuracy delta (city-over-city)", "NIN feed status", "Deployment cost vs. plan (%)"],
  },
];

const SUPER_CYCLE = {
  events: [
    { name: "FIFA World Cup", year: "2026", host: "Atlanta + 15 US cities", color: C.accent, erpCode: "SNTR-EG" },
    { name: "Super Bowl", year: "2027", host: "TBD", color: C.red, erpCode: "SNTR-EG" },
    { name: "NCAA Championship", year: "2027", host: "TBD", color: C.amber, erpCode: "SNTR-EG" },
  ],
  rationale: "Three consecutive Tier-4 events sharing the same Sentrais deployment infrastructure. Intelligence compounds across each phase — FIFA builds the model, Super Bowl sharpens it, NCAA maximizes efficiency. The Super Cycle is the primary Live Nation anchor partnership argument.",
  pressTiming: "Press release and public activation gated on anchor partner signature. No outbound until MSA is executed.",
};

const TABS = [
  { id: "overview", label: "6-Layer Stack" },
  { id: "layers", label: "Layer Detail" },
  { id: "tour", label: "Multi-City Tour Model" },
  { id: "exec", label: "Executive Dashboard" },
  { id: "supercycle", label: "Super Cycle" },
];

export default function LiveNation() {
  const [tab, setTab] = useState("overview");
  const [selectedLayer, setSelectedLayer] = useState("l1");
  const layer = LAYERS.find(l => l.id === selectedLayer);

  return (
    <ForgePage>
      <ForgeHeader
        title="Live Nation Intelligence Architecture"
        subtitle="6-Layer Intelligence Grid on Sentrais Base 360"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <ForgeBadge variant="accent">EntertainmentOS</ForgeBadge>
            <ForgeBadge style={{ background: `${C.amber}22`, color: C.amber, fontFamily: "monospace" }}>SNTR-AG</ForgeBadge>
          </div>
        }
      />

      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />

      <ForgeContent>

        {/* 6-LAYER STACK OVERVIEW */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeAlert level="info">
              The Live Nation Intelligence Grid is a 6-layer deployment architecture built on Sentrais Base 360. Each layer captures a distinct class of operational intelligence, feeding upward through the stack and compounding into the Federated Learning Network (NIN Layer 6) post-event.
            </ForgeAlert>

            <ForgeCard>
              <ForgeCardHeader title="Intelligence Stack Architecture" />
              <ForgeCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {[...LAYERS].reverse().map((l, i, arr) => (
                    <div
                      key={l.id}
                      onClick={() => { setSelectedLayer(l.id); setTab("layers"); }}
                      style={{
                        display: "flex", gap: 16, padding: "14px 16px",
                        borderRadius: i === 0 ? "8px 8px 0 0" : i === arr.length - 1 ? "0 0 8px 8px" : 0,
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderBottom: i < arr.length - 1 ? "none" : `1px solid ${C.border}`,
                        borderLeft: `4px solid ${l.color}`,
                        cursor: "pointer", transition: "background 0.12s",
                      }}
                    >
                      <div style={{ flexShrink: 0, width: 36, textAlign: "center" }}>
                        <div style={{ fontSize: 18 }}>{l.icon}</div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: l.color, marginTop: 2 }}>{l.layer}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: l.color }}>{l.name}</div>
                          <div style={{ fontSize: 11, color: C.textMuted, fontStyle: "italic", maxWidth: 300, textAlign: "right" }}>{l.ninRole.split(".")[0]}.</div>
                        </div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{l.description.split(".")[0]}.</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{ fontSize: 11, color: C.teal }}>↑ Data flows upward to L6</div>
                    <div style={{ fontSize: 11, color: C.accent }}>↓ Directives flow downward from L1</div>
                    <div style={{ fontSize: 11, color: C.purple }}>⟲ NIN compounding feeds all future deployments</div>
                  </div>
                </div>
              </ForgeCardBody>
            </ForgeCard>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                { label: "Intelligence Layers", value: "6", sub: "L1 Global → L6 NIN", color: C.accent },
                { label: "Executive Views", value: "5", sub: "Venue / Safety / Staffing / Revenue / Tour", color: C.teal },
                { label: "NIN Learning Cycles", value: "∞", sub: "Compounds per deployment", color: C.purple },
              ].map(m => (
                <div key={m.label} style={{ padding: "16px", textAlign: "center", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, borderTop: `3px solid ${m.color}` }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 6 }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LAYER DETAIL */}
        {tab === "layers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {LAYERS.map(l => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLayer(l.id)}
                  style={{
                    padding: "7px 14px", borderRadius: 6, cursor: "pointer", flex: 1,
                    border: selectedLayer === l.id ? `1px solid ${l.color}` : `1px solid ${C.border}`,
                    background: selectedLayer === l.id ? `${l.color}22` : C.surface,
                    color: selectedLayer === l.id ? l.color : C.textMuted,
                    fontSize: 12, fontWeight: selectedLayer === l.id ? 700 : 400,
                    transition: "all 0.12s", textAlign: "center",
                  }}
                >
                  <div>{l.icon}</div>
                  <div style={{ marginTop: 2 }}>{l.layer}</div>
                </button>
              ))}
            </div>

            {layer && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <ForgeCard style={{ borderLeft: `4px solid ${layer.color}` }}>
                  <ForgeCardBody>
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div style={{ fontSize: 36, flexShrink: 0 }}>{layer.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <ForgeBadge style={{ background: `${layer.color}22`, color: layer.color, fontWeight: 800 }}>{layer.layer}</ForgeBadge>
                          <span style={{ fontSize: 18, fontWeight: 800, color: layer.color }}>{layer.name}</span>
                        </div>
                        <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7, marginBottom: 12 }}>{layer.description}</div>
                        <div style={{ padding: "10px 14px", background: `${layer.color}11`, borderRadius: 8, border: `1px solid ${layer.color}33` }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: layer.color, marginBottom: 4 }}>NIN Role</div>
                          <div style={{ fontSize: 12, color: C.text }}>{layer.ninRole}</div>
                        </div>
                      </div>
                    </div>
                  </ForgeCardBody>
                </ForgeCard>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <ForgeCard>
                    <ForgeCardHeader title="Capabilities" />
                    <ForgeCardBody>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {layer.capabilities.map(c => (
                          <div key={c} style={{ display: "flex", gap: 10, padding: "8px 12px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}` }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: layer.color, flexShrink: 0, marginTop: 4 }} />
                            <span style={{ fontSize: 12, color: C.text }}>{c}</span>
                          </div>
                        ))}
                      </div>
                    </ForgeCardBody>
                  </ForgeCard>

                  <ForgeCard>
                    <ForgeCardHeader title="Data Feeds" />
                    <ForgeCardBody>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {layer.dataFeeds.map(f => (
                          <div key={f} style={{ display: "flex", gap: 10, padding: "10px 14px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}` }}>
                            <span style={{ fontSize: 11, color: layer.color, fontWeight: 700, flexShrink: 0 }}>→</span>
                            <span style={{ fontSize: 12, color: C.textMuted }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    </ForgeCardBody>
                  </ForgeCard>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MULTI-CITY TOUR MODEL */}
        {tab === "tour" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeAlert level="info">
              Each city in the tour sequence inherits intelligence from all prior cities via NIN Layer 6. The final city (LA) operates with the highest GDA accuracy and lowest deployment friction of the tour.
            </ForgeAlert>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {TOUR_SEQUENCE.map((city, i) => (
                <div key={city.city} style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
                  {/* Step indicator */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 48, flexShrink: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${city.color}22`, border: `2px solid ${city.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: city.color }}>{i + 1}</div>
                    {i < TOUR_SEQUENCE.length - 1 && <div style={{ width: 2, flex: 1, background: C.border, margin: "4px 0" }} />}
                  </div>

                  {/* Card */}
                  <div style={{ flex: 1, marginLeft: 12, padding: "16px", borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${city.color}`, marginBottom: i < TOUR_SEQUENCE.length - 1 ? 0 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: city.color }}>{city.city}</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{city.market}</div>
                      </div>
                      <ForgeBadge style={{ fontFamily: "monospace", background: `${city.color}22`, color: city.color }}>{city.erpCode}</ForgeBadge>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Venues</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {city.venues.map(v => (
                          <div key={v} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: C.bg, border: `1px solid ${C.border}`, color: C.textMuted }}>{v}</div>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: "10px 12px", background: `${city.color}11`, borderRadius: 6, border: `1px solid ${city.color}33` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: city.color, marginBottom: 4 }}>NIN Intelligence Feed</div>
                      <div style={{ fontSize: 12, color: C.text }}>{city.ninFeed}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <ForgeCard>
              <ForgeCardHeader title="Tour Intelligence Compounding Effect" />
              <ForgeCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { metric: "GDA Staffing Accuracy", atl: "Baseline", dal: "+8%", chi: "+15%", la: "+22%", color: C.accent },
                    { metric: "Deployment Cost Efficiency", atl: "Baseline", dal: "+5%", chi: "+12%", la: "+19%", color: C.green },
                    { metric: "Fan Experience Score (VRI)", atl: "Baseline", dal: "+3 pts", chi: "+7 pts", la: "+11 pts", color: C.teal },
                    { metric: "Incident Response Time", atl: "Baseline", dal: "-11%", chi: "-18%", la: "-24%", color: C.purple },
                  ].map(row => (
                    <div key={row.metric} style={{ display: "grid", gridTemplateColumns: "180px repeat(4, 1fr)", gap: 12, padding: "10px 14px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}`, alignItems: "center" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted }}>{row.metric}</div>
                      {["atl", "dal", "chi", "la"].map((c, i) => (
                        <div key={c} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2 }}>{["ATL", "DAL", "CHI", "LA"][i]}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? C.textMuted : row.color }}>{row[c]}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

        {/* EXECUTIVE DASHBOARD */}
        {tab === "exec" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeAlert level="info">
              Five executive dashboard views surface the most critical intelligence at each management level. All views are live during active deployments and draw from the corresponding intelligence layers.
            </ForgeAlert>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {EXEC_VIEWS.map((v, i) => (
                <ForgeCard key={v.id} style={{ borderLeft: `3px solid ${LAYERS[i]?.color || C.accent}` }}>
                  <ForgeCardBody>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 20 }}>{v.icon}</span>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{v.label}</div>
                            <ForgeBadge style={{ background: `${LAYERS[i]?.color || C.accent}22`, color: LAYERS[i]?.color || C.accent, fontSize: 10, marginTop: 4 }}>Layer {v.layer}</ForgeBadge>
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: C.textMuted }}>{v.description}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Key Metrics</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {v.kpis.map(kpi => (
                            <div key={kpi} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <div style={{ width: 5, height: 5, borderRadius: "50%", background: LAYERS[i]?.color || C.accent, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: C.text }}>{kpi}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ForgeCardBody>
                </ForgeCard>
              ))}
            </div>
          </div>
        )}

        {/* SUPER CYCLE */}
        {tab === "supercycle" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeAlert level="warning">
              <strong>Press Release Gate:</strong> No public announcement or outbound communications until anchor partner MSA is executed. Announcing before the deal is signed weakens the negotiating position.
            </ForgeAlert>

            <ForgeCard style={{ borderTop: `3px solid ${C.accent}` }}>
              <ForgeCardHeader title="Super Cycle — Compound Event Activation" />
              <ForgeCardBody>
                <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20, lineHeight: 1.7 }}>{SUPER_CYCLE.rationale}</div>

                <div style={{ display: "flex", alignItems: "stretch", gap: 0, marginBottom: 20 }}>
                  {SUPER_CYCLE.events.map((ev, i, arr) => (
                    <div key={ev.name} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                      <div style={{ flex: 1, padding: "18px 16px", borderRadius: i === 0 ? "8px 0 0 8px" : i === arr.length - 1 ? "0 8px 8px 0" : 0, background: `${ev.color}18`, border: `1px solid ${ev.color}44`, borderRight: i < arr.length - 1 ? "none" : `1px solid ${ev.color}44`, textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: ev.color }}>{ev.name}</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{ev.year}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{ev.host}</div>
                        <ForgeBadge style={{ fontFamily: "monospace", background: `${ev.color}22`, color: ev.color, marginTop: 8 }}>{ev.erpCode}</ForgeBadge>
                      </div>
                      {i < arr.length - 1 && (
                        <div style={{ fontSize: 18, color: C.textMuted, padding: "0 4px", zIndex: 1 }}>→</div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { label: "FIFA Activation", detail: "Establishes the full 6-layer intelligence stack across 15+ US cities. Creates the largest NIN dataset in Sentrais history.", color: C.accent },
                    { label: "Super Bowl Compound", detail: "Inherits FIFA intelligence. GDA models are fully calibrated. The highest-stakes single-event deployment in the Super Cycle.", color: C.red },
                    { label: "NCAA Optimization", detail: "Maximum intelligence maturity. Lowest deployment cost. Highest VRI scores. Proof of compounding ROI to renew and expand the Live Nation partnership.", color: C.amber },
                  ].map(item => (
                    <div key={item.label} style={{ padding: "14px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, borderTop: `3px solid ${item.color}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: item.color, marginBottom: 8 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>{item.detail}</div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>

            <ForgeCard>
              <ForgeCardHeader title="Anchor Partner Strategy" />
              <ForgeCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { step: "1", label: "Execute Anchor MSA", detail: "Live Nation or equivalent Tier-1 anchor partner. MSA must be signed before any public announcement or press outreach.", color: C.accent },
                    { step: "2", label: "Activate Press Release", detail: "Once MSA is signed, press release announcing the Super Cycle deployment goes live. Positions Sentrais as the operational intelligence layer for the 2026–2027 event season.", color: C.teal },
                    { step: "3", label: "LinkedIn Content Ecosystem", detail: "3-pillar content authority program launches post-announcement: Operations intelligence, Technology platform, Leadership/vision. Builds inbound pipeline.", color: C.purple },
                    { step: "4", label: "FIFA Pre-Deployment", detail: "Full 6-layer stack activated for FIFA 2026 Atlanta and additional US cities. NIN baseline established.", color: C.amber },
                  ].map((step, i, arr) => (
                    <div key={step.step} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${step.color}22`, border: `2px solid ${step.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: step.color }}>{step.step}</div>
                        {i < arr.length - 1 && <div style={{ width: 2, height: 20, background: C.border }} />}
                      </div>
                      <div style={{ flex: 1, paddingBottom: i < arr.length - 1 ? 12 : 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{step.label}</div>
                        <div style={{ fontSize: 12, color: C.textMuted }}>{step.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

      </ForgeContent>
    </ForgePage>
  );
}

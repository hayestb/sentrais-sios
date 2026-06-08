// @ts-nocheck
import { useState } from "react";
import { MapPin, Building2, CheckCircle2, AlertCircle, Clock, Zap, Users, Globe, TrendingUp, ArrowRight } from "lucide-react";

const CITIES = [
  {
    id: "atlanta",
    name: "Atlanta, GA",
    region: "Southeast",
    status: "active",
    tier: "Anchor Market",
    color: "#0EA5E9",
    population: "506K city / 6.1M metro",
    readinessScore: 82,
    platformType: "standard",
    anchor: "ARI — Atlanta Resilient Institute",
    primaryContact: "Knox Phillips",
    goLiveTarget: "Jul 1, 2026",
    verticals: ["Civic Infrastructure", "Workforce", "Education", "Economic Mobility"],
    gates: [
      { label: "Stakeholder MOU", status: "passed" },
      { label: "Data Partnership", status: "passed" },
      { label: "Platform Config", status: "active" },
      { label: "Pilot Cohort", status: "locked" },
      { label: "Full Launch", status: "locked" },
    ],
    blockers: [
      { text: "SEG subcontract execution required before NFL GDA go-live Jun 30", severity: "critical" },
      { text: "BGI EIN pending — BGI programs (P5) on hold", severity: "high" },
    ],
    ecosystem: {
      partners: ["City of Atlanta Office of Resilience", "Atlanta Public Schools", "ARC (Atlanta Regional Commission)", "Invest Atlanta"],
      funders: ["Wells Fargo Foundation (prospect)", "Robert W. Woodruff Foundation", "ARI Launch Partners"],
    },
    revenue: { contractValue: 850000, invoiced: 212500, collected: 212500 },
  },
  {
    id: "new-orleans",
    name: "New Orleans, LA",
    region: "Gulf South",
    status: "prospect",
    tier: "Expansion Market",
    color: "#14B8A6",
    population: "383K city / 1.3M metro",
    readinessScore: 41,
    platformType: "local-ecosystem",
    anchor: "Prospect — Cultural Resilience angle",
    primaryContact: "TBD — intro via Emerald Cities",
    goLiveTarget: "Q1 2027",
    verticals: ["Climate Resilience", "Culture & Events", "Economic Mobility"],
    gates: [
      { label: "Stakeholder MOU", status: "active" },
      { label: "Data Partnership", status: "locked" },
      { label: "Platform Config", status: "locked" },
      { label: "Pilot Cohort", status: "locked" },
      { label: "Full Launch", status: "locked" },
    ],
    blockers: [
      { text: "No signed MOU — intro meeting needed with City of New Orleans", severity: "high" },
      { text: "Local data ecosystem mapping incomplete", severity: "medium" },
    ],
    ecosystem: {
      partners: ["City of New Orleans (prospect)", "Xavier University", "Gulf South Funders Network"],
      funders: ["W.K. Kellogg Foundation (Gulf South program)", "JPMorgan PRO Neighborhoods (prospect)"],
    },
    localDiff: "Requires heavy local ecosystem customization — Jazz & Heritage cultural data layer, FEMA flood risk module, HBCU partnership track (Xavier, Dillard, Southern). Standard CiviGrid modules insufficient alone.",
    revenue: { contractValue: 0, invoiced: 0, collected: 0 },
  },
  {
    id: "boston",
    name: "Boston, MA",
    region: "Northeast",
    status: "prospect",
    tier: "Innovation Hub",
    color: "#8B5CF6",
    population: "675K city / 4.9M metro",
    readinessScore: 55,
    platformType: "standard",
    anchor: "MIT Media Lab / Kendall Square ecosystem",
    primaryContact: "TBD — Kevin McCann intro",
    goLiveTarget: "Q2 2027",
    verticals: ["Innovation Equity", "Workforce", "Education"],
    gates: [
      { label: "Stakeholder MOU", status: "active" },
      { label: "Data Partnership", status: "locked" },
      { label: "Platform Config", status: "locked" },
      { label: "Pilot Cohort", status: "locked" },
      { label: "Full Launch", status: "locked" },
    ],
    blockers: [
      { text: "Requires academic partnership anchoring — MIT or Harvard engagement needed", severity: "high" },
      { text: "P3 Future Workforce play requires local workforce board alignment", severity: "medium" },
    ],
    ecosystem: {
      partners: ["City of Boston (prospect)", "MIT Media Lab (prospect)", "Boston Public Schools", "Commonwealth Corporation"],
      funders: ["JPMorgan Chase AdvancingCities", "Barr Foundation", "Eastern Bank Foundation"],
    },
    localDiff: "Standard platform modules applicable. Local differentiation through university innovation corridor angle — ResearchBridge module extension recommended for Kendall Square data partnerships.",
    revenue: { contractValue: 0, invoiced: 0, collected: 0 },
  },
  {
    id: "los-angeles",
    name: "Los Angeles, CA",
    region: "West Coast",
    status: "pipeline",
    tier: "Scale Market",
    color: "#F59E0B",
    population: "3.9M city / 13.2M metro",
    readinessScore: 28,
    platformType: "local-ecosystem",
    anchor: "LA28 Olympics — Sports, Culture & Events pillar",
    primaryContact: "TBD — sports/events lead required",
    goLiveTarget: "2028 (Olympics alignment)",
    verticals: ["Sports / Culture / Events", "Civic Infrastructure", "Economic Mobility"],
    gates: [
      { label: "Stakeholder MOU", status: "locked" },
      { label: "Data Partnership", status: "locked" },
      { label: "Platform Config", status: "locked" },
      { label: "Pilot Cohort", status: "locked" },
      { label: "Full Launch", status: "locked" },
    ],
    blockers: [
      { text: "No entry contact — requires sports/events industry intro at LA28 level", severity: "critical" },
      { text: "Scale complexity: 88 municipalities in LA County require multi-tenant architecture", severity: "high" },
      { text: "Timeline anchored to LA28 — 2+ year runway but requires 2026 groundwork", severity: "medium" },
    ],
    ecosystem: {
      partners: ["LA28 Organizing Committee (prospect)", "City of Los Angeles", "LA County", "AEG / Crypto.com Arena (prospect)"],
      funders: ["Annenberg Foundation", "California Endowment", "Wells Fargo (West Coast program)"],
    },
    localDiff: "Multi-tenant architecture required. Local ecosystem far more complex than standard CiviGrid — 88 cities, LAUSD (600K students), LACCD (9 campuses). Requires dedicated LA implementation team. LA28 creates a forcing function for P6 Sports/Culture/Events launch.",
    revenue: { contractValue: 0, invoiced: 0, collected: 0 },
  },
];

const PLATFORM_COMPARISON = [
  {
    feature: "Core CiviGrid Modules",
    standard: "Full suite — Civic Resilience, Workforce, Education, Economic Mobility",
    local: "Full suite + custom local data layer integration",
  },
  {
    feature: "Data Partnerships",
    standard: "National datasets + city open data",
    local: "Custom local data ecosystem mapping required pre-launch",
  },
  {
    feature: "Partner Onboarding",
    standard: "Standardized MOU template — 4-6 week process",
    local: "Custom partnership structure — 3-6 month co-design",
  },
  {
    feature: "Staffing Model",
    standard: "Remote implementation team + local engagement lead",
    local: "On-the-ground embedded team required (min 1 FTE local)",
  },
  {
    feature: "Contract Value Range",
    standard: "$500K–$1.2M per city",
    local: "$800K–$2.5M per city (complexity premium)",
  },
  {
    feature: "Time to Revenue",
    standard: "6–12 months anchor to first invoice",
    local: "12–24 months anchor to first invoice",
  },
];

const STATUS_CONFIG = {
  active: { color: "#10b981", label: "Active", icon: CheckCircle2 },
  prospect: { color: "#0EA5E9", label: "Prospect", icon: Clock },
  pipeline: { color: "#f59e0b", label: "Pipeline", icon: TrendingUp },
};

const GATE_STATUS_COLORS = {
  passed: "#10b981",
  active: "#0EA5E9",
  locked: "#1e3a5f",
  blocked: "#ef4444",
};

export default function CityReadiness() {
  const [activeCity, setActiveCity] = useState("atlanta");
  const [activeTab, setActiveTab] = useState("portfolio");

  const city = CITIES.find((c) => c.id === activeCity);
  const totalPipeline = CITIES.reduce((s, c) => s + c.revenue.contractValue, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#0a1628", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "24px 32px", borderBottom: "1px solid #1e3a5f" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Globe size={22} color="#0EA5E9" />
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>City Readiness Portfolio</h1>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              Multi-city deployment map · Standard platform vs local ecosystem differentiation
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Cities Tracked", value: CITIES.length, color: "#0EA5E9" },
              { label: "Active Markets", value: CITIES.filter((c) => c.status === "active").length, color: "#10b981" },
              { label: "Pipeline Value", value: `$${(totalPipeline / 1000000).toFixed(1)}M`, color: "#f59e0b" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center", padding: "10px 16px", background: "#0d1f3c", border: "1px solid #1e3a5f", borderRadius: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Nav */}
        <div style={{ display: "flex", gap: 4, marginTop: 20 }}>
          {[
            { id: "portfolio", label: "Portfolio Map", icon: MapPin },
            { id: "comparison", label: "Platform Comparison", icon: Building2 },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 6, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 500,
                background: activeTab === t.id ? "#0EA5E9" : "#0d1f3c",
                color: activeTab === t.id ? "#fff" : "#94a3b8",
              }}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 32px" }}>

        {/* PORTFOLIO MAP */}
        {activeTab === "portfolio" && (
          <div style={{ display: "flex", gap: 20 }}>
            {/* City List */}
            <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {CITIES.map((c) => {
                const sc = STATUS_CONFIG[c.status];
                const isActive = activeCity === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCity(c.id)}
                    style={{
                      width: "100%", textAlign: "left", padding: "14px 16px",
                      background: isActive ? "#0d1f3c" : "transparent",
                      border: isActive ? `1px solid ${c.color}50` : "1px solid #1e3a5f",
                      borderRadius: 10, cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{c.name}</span>
                    </div>
                    <div style={{ display: "flex", items: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "#64748b" }}>{c.tier}</span>
                      <span style={{ fontSize: 11, color: sc.color }}>{sc.label}</span>
                    </div>
                    {/* Readiness bar */}
                    <div style={{ marginTop: 8, height: 3, background: "#1e3a5f", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${c.readinessScore}%`, height: "100%", background: c.color, borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>{c.readinessScore}% readiness</div>
                  </button>
                );
              })}
            </div>

            {/* City Detail */}
            {city && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* City Header */}
                <div style={{ background: "#0d1f3c", border: `1px solid ${city.color}30`, borderRadius: 12, padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <MapPin size={18} color={city.color} />
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>{city.name}</h2>
                        <span style={{
                          fontSize: 11, padding: "2px 8px", borderRadius: 4,
                          background: city.color + "20", color: city.color,
                          border: `1px solid ${city.color}40`,
                        }}>{city.tier}</span>
                        <span style={{
                          fontSize: 11, padding: "2px 8px", borderRadius: 4,
                          background: city.platformType === "standard" ? "#10b98120" : "#f59e0b20",
                          color: city.platformType === "standard" ? "#10b981" : "#f59e0b",
                          border: `1px solid ${city.platformType === "standard" ? "#10b98140" : "#f59e0b40"}`,
                        }}>
                          {city.platformType === "standard" ? "Standard Platform" : "Local Ecosystem"}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>
                        {city.region} · Pop {city.population} · Target: {city.goLiveTarget}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: city.color }}>{city.readinessScore}%</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>Readiness Score</div>
                    </div>
                  </div>

                  {/* Gate Progress */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {city.gates.map((g, i) => (
                      <div key={i} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{
                          height: 6, borderRadius: 3,
                          background: GATE_STATUS_COLORS[g.status] ?? "#1e3a5f",
                          marginBottom: 6,
                        }} />
                        <div style={{ fontSize: 10, color: "#64748b" }}>{g.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {/* Anchor & Verticals */}
                  <div style={{ background: "#0d1f3c", border: "1px solid #1e3a5f", borderRadius: 12, padding: "16px 20px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: city.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                      Anchor & Verticals
                    </div>
                    <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <Building2 size={14} color={city.color} style={{ marginTop: 2, flexShrink: 0 }} />
                      {city.anchor}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {city.verticals.map((v, i) => (
                        <span key={i} style={{
                          fontSize: 11, padding: "3px 8px", borderRadius: 4,
                          background: "#0a1628", color: "#94a3b8",
                          border: "1px solid #1e3a5f",
                        }}>{v}</span>
                      ))}
                    </div>
                    {city.primaryContact && (
                      <div style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>
                        <Users size={12} style={{ display: "inline", marginRight: 4 }} />
                        {city.primaryContact}
                      </div>
                    )}
                  </div>

                  {/* Revenue */}
                  <div style={{ background: "#0d1f3c", border: "1px solid #1e3a5f", borderRadius: 12, padding: "16px 20px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: city.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                      Revenue Status
                    </div>
                    {[
                      { label: "Contract Value", value: city.revenue.contractValue, color: "#f1f5f9" },
                      { label: "Invoiced", value: city.revenue.invoiced, color: "#f59e0b" },
                      { label: "Collected", value: city.revenue.collected, color: "#10b981" },
                    ].map((r) => (
                      <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: "#64748b" }}>{r.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: r.value > 0 ? r.color : "#1e3a5f" }}>
                          {r.value > 0 ? `$${r.value.toLocaleString()}` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Ecosystem */}
                  <div style={{ background: "#0d1f3c", border: "1px solid #1e3a5f", borderRadius: 12, padding: "16px 20px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: city.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                      Ecosystem Partners
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>Implementation Partners</div>
                      {city.ecosystem.partners.map((p, i) => (
                        <div key={i} style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 4, height: 4, borderRadius: "50%", background: city.color, flexShrink: 0 }} />
                          {p}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>Funders / Prospects</div>
                      {city.ecosystem.funders.map((f, i) => (
                        <div key={i} style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Blockers */}
                  <div style={{ background: "#0d1f3c", border: "1px solid #1e3a5f", borderRadius: 12, padding: "16px 20px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#ef4444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                      Active Blockers
                    </div>
                    {city.blockers.length === 0 ? (
                      <div style={{ fontSize: 12, color: "#64748b" }}>No active blockers.</div>
                    ) : (
                      city.blockers.map((b, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                          <AlertCircle
                            size={14}
                            color={b.severity === "critical" ? "#ef4444" : b.severity === "high" ? "#f59e0b" : "#64748b"}
                            style={{ marginTop: 2, flexShrink: 0 }}
                          />
                          <span style={{
                            fontSize: 12, color: "#94a3b8", lineHeight: 1.4,
                          }}>{b.text}</span>
                        </div>
                      ))
                    )}
                    {city.localDiff && (
                      <div style={{ marginTop: 12, padding: "10px 12px", background: "#f59e0b10", border: "1px solid #f59e0b20", borderRadius: 6 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#f59e0b", marginBottom: 4 }}>LOCAL DIFFERENTIATION NOTE</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>{city.localDiff}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PLATFORM COMPARISON */}
        {activeTab === "comparison" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { type: "standard", label: "Standard Platform Deployment", color: "#10b981", cities: CITIES.filter((c) => c.platformType === "standard").map((c) => c.name) },
                { type: "local-ecosystem", label: "Local Ecosystem Deployment", color: "#f59e0b", cities: CITIES.filter((c) => c.platformType === "local-ecosystem").map((c) => c.name) },
              ].map((t) => (
                <div key={t.type} style={{ background: "#0d1f3c", border: `1px solid ${t.color}30`, borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.color, marginBottom: 8 }}>{t.label}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {t.cities.map((c) => (
                      <span key={c} style={{ fontSize: 12, padding: "3px 10px", background: t.color + "15", color: t.color, border: `1px solid ${t.color}30`, borderRadius: 4 }}>{c}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "#0d1f3c", border: "1px solid #1e3a5f", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#0a1628", padding: "12px 20px", borderBottom: "1px solid #1e3a5f" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Feature</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#10b981", textTransform: "uppercase" }}>Standard Platform</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#f59e0b", textTransform: "uppercase" }}>Local Ecosystem</div>
              </div>
              {PLATFORM_COMPARISON.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                    padding: "14px 20px",
                    borderBottom: i < PLATFORM_COMPARISON.length - 1 ? "1px solid #1e3a5f" : "none",
                    background: i % 2 === 0 ? "transparent" : "#0a162820",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{row.feature}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", paddingRight: 16 }}>{row.standard}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{row.local}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

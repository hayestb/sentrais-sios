// @ts-nocheck
import { useState } from "react";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody, ForgeLabel,
  ForgeBadge, ForgeAlert, C,
} from "../components/ui/forge";

const VERTICALS = [
  {
    id: "evergame",
    code: "SNTR-EG",
    name: "EVERGAME",
    subtitle: "Sports & Entertainment Venue Operations",
    tam: "$500B+",
    tamLabel: "Sports & Live Events TAM",
    color: C.accent,
    icon: "🏟️",
    description: "League-agnostic venue orchestration platform. Deploys across NFL, NBA, MLB, NHL, MLS, and NCAA. Powers the SPORTS360 playbook.",
    capabilities: [
      "SPORTS360 deployment framework (18-gate NIN methodology)",
      "Ground Deployment Architecture (GDA) with AI staffing optimization",
      "Venue Readiness Index (VRI) real-time scoring",
      "Multi-city tour intelligence via NIN Layer 6",
    ],
    flywheel: "Each venue deployment generates safety, staffing, and fan behavior data that improves GDA accuracy across all future EVERGAME deployments.",
    erpCode: "SNTR-EG",
    anchorMarket: "NFL / Live Nation",
  },
  {
    id: "entertainmentos",
    code: "SNTR-AG",
    name: "EntertainmentOS",
    subtitle: "Live Events & Touring Intelligence",
    tam: "$200B+",
    tamLabel: "Live Events & Touring TAM",
    color: C.purple,
    icon: "🎤",
    description: "End-to-end intelligence platform for large-scale touring and live entertainment. Designed around the Live Nation 6-layer architecture.",
    capabilities: [
      "Global Tour Control (multi-city planning, compound event routing)",
      "Artist & Talent Intelligence (rider fulfillment, logistics)",
      "Guest & Revenue Intelligence (real-time fan spend + behavior)",
      "Federated Learning Network (NIN) — post-event data feeds core",
    ],
    flywheel: "Tour data from each city (ATL → DAL → CHI → LA) compounds into a richer intelligence model, reducing per-event deployment cost while increasing revenue capture.",
    erpCode: "SNTR-AG",
    anchorMarket: "Live Nation / FIFA / Super Bowl",
  },
  {
    id: "civigrid",
    code: "SNTR-CG",
    name: "CiviGrid",
    subtitle: "Smart Cities & Civic Infrastructure",
    tam: "$1T+",
    tamLabel: "Smart Cities TAM",
    color: C.teal,
    icon: "🏙️",
    description: "Civic operational intelligence for municipal governments, emergency management agencies, and urban infrastructure operators.",
    capabilities: [
      "City Readiness Portfolio (Atlanta, New Orleans, Boston, LA)",
      "Emergency management integration (GEMA, FEMA, NOLA Ready)",
      "ARI (Accelerated Readiness Initiative) program framework",
      "CiviGrid demo track — mayor's office / emergency management",
    ],
    flywheel: "Each city deployment builds a replicable playbook. Municipal data shared (anonymized) across the CiviGrid network improves response models for all cities.",
    erpCode: "SNTR-CG",
    anchorMarket: "Atlanta Mayor's Office / GEMA",
  },
  {
    id: "seargrid",
    code: "SNTR-SG",
    name: "SEARGrid / CrisisGrid",
    subtitle: "Federal & Emergency Response",
    tam: "$10B+",
    tamLabel: "Federal / Emergency Response TAM",
    color: C.red,
    icon: "🛡️",
    description: "Federal and emergency response intelligence platform. Designed for FEMA, DHS, and large-scale crisis coordination.",
    capabilities: [
      "Crisis coordination and multi-agency command integration",
      "SEG Subcontract structure (Knox/SEG NFL revenue share)",
      "Step-In Rights and operational continuity protocols",
      "Federal procurement pipeline",
    ],
    flywheel: "Emergency response data (incident types, resource gaps, response times) feeds CiviGrid and EVERGAME safety models — strengthening all verticals from crisis learnings.",
    erpCode: "SNTR-SG",
    anchorMarket: "FEMA / DHS / Knox SEG",
  },
];

const CORE = {
  name: "SentraisOS",
  subtitle: "Sovereign Operational Intelligence Infrastructure",
  erpCode: "SNTR-IG",
  description: "The sovereign core is not a product — it is the infrastructure layer that every vertical runs on. It provides the shared intelligence, data architecture, workflow orchestration, and IP protection that compounds across all four distribution channels.",
  principles: [
    {
      label: "Operational Intelligence Infrastructure",
      detail: "SentraisOS provides the foundational data models, API layer, and NIN (Networked Intelligence Node) architecture that all verticals consume. No vertical owns the core — each licenses it.",
    },
    {
      label: "Zero Founder Dependency",
      detail: "The Golden Decision Filter: every structural decision is evaluated against 'does this create or reduce founder dependency?' Systems, IP, and contracts must be executable without any single person.",
    },
    {
      label: "Modular Capital Structure",
      detail: "Each vertical can be capitalized independently (separate funding rounds, joint ventures, or partnerships) without diluting the core entity or cross-contaminating IP ownership.",
    },
    {
      label: "IP Fortress (Tenant A)",
      detail: "Core IP is ring-fenced in a separate entity. Zero access to Tenant A data or systems for any worker type outside of designated IP custodians. No exceptions.",
    },
  ],
};

const FLYWHEEL = [
  { step: 1, label: "Deploy", detail: "Vertical deploys Sentrais platform for a client (venue, city, tour, federal agency)", color: C.accent },
  { step: 2, label: "Capture", detail: "NIN Layer 6 captures operational intelligence: incidents, staffing patterns, fan behavior, resource gaps", color: C.teal },
  { step: 3, label: "Federate", detail: "Intelligence feeds back into SentraisOS core — anonymized and cross-referenced across all active deployments", color: C.purple },
  { step: 4, label: "Improve", detail: "Core models improve: GDA accuracy up, VRI baselines sharpen, city readiness playbooks updated", color: C.green },
  { step: 5, label: "Compound", detail: "Next deployment starts smarter. Each vertical benefits from all other verticals' learnings", color: C.amber },
  { step: 6, label: "Expand", detail: "Lower deployment cost + higher outcome quality = more deal velocity + stronger retention across all verticals", color: C.accent },
];

const DAY1_CHECKLIST = [
  { item: "Modified Sole Director Written Consent executed", category: "Legal", done: false, critical: true },
  { item: "ERP code SNTR-EG (EVERGAME) activated in NetSuite", category: "Finance", done: false, critical: true },
  { item: "ERP code SNTR-CG (CiviGrid) activated in NetSuite", category: "Finance", done: false, critical: true },
  { item: "ERP code SNTR-AG (ARI/EntertainmentOS) activated in NetSuite", category: "Finance", done: false, critical: false },
  { item: "ERP code SNTR-SG (SEARGrid) activated in NetSuite", category: "Finance", done: false, critical: false },
  { item: "ERP code SNTR-IG (Intelligence Core) activated in NetSuite", category: "Finance", done: false, critical: true },
  { item: "HubSpot properties remapped to vertical taxonomy", category: "Systems", done: false, critical: true },
  { item: "Monday.com board hierarchy restructured to pod model", category: "Systems", done: false, critical: false },
  { item: "M365 SharePoint site naming conventions updated by vertical", category: "Systems", done: false, critical: false },
  { item: "ARI bylaws updated to embed BGI as interior talent program", category: "Legal", done: false, critical: true },
  { item: "BGI accounts confirmed fully separated from commercial entity", category: "Finance", done: false, critical: true },
  { item: "Knox/SEG payout schedule confirmed with Legal Counsel", category: "Legal", done: false, critical: true },
];

const CAT_COLORS = { Legal: C.red, Finance: C.amber, Systems: C.teal };

const TABS = [
  { id: "overview", label: "Architecture Overview" },
  { id: "verticals", label: "4 Verticals" },
  { id: "core", label: "Sovereign Core" },
  { id: "flywheel", label: "Intelligence Flywheel" },
  { id: "day1", label: "Day 1 Checklist" },
];

export default function CorporateArchitecture() {
  const [tab, setTab] = useState("overview");
  const [selectedVertical, setSelectedVertical] = useState("evergame");
  const [checklist, setChecklist] = useState(DAY1_CHECKLIST.map(i => ({ ...i })));

  const toggleItem = (idx) => {
    setChecklist(prev => prev.map((item, i) => i === idx ? { ...item, done: !item.done } : item));
  };

  const vertical = VERTICALS.find(v => v.id === selectedVertical);
  const doneCount = checklist.filter(i => i.done).length;
  const criticalDone = checklist.filter(i => i.critical && i.done).length;
  const criticalTotal = checklist.filter(i => i.critical).length;

  return (
    <ForgePage>
      <ForgeHeader
        title="Corporate Architecture"
        subtitle="SentraisOS Sovereign Core — 4-Vertical Distribution Model"
        actions={<ForgeBadge variant="accent">Operational Intelligence Infrastructure</ForgeBadge>}
      />

      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />

      <ForgeContent>

        {/* ARCHITECTURE OVERVIEW */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeAlert level="info">
              Sentrais operates as a sovereign operational intelligence infrastructure. The four verticals (EVERGAME, EntertainmentOS, CiviGrid, SEARGrid) are distribution channels — each serves a distinct market while drawing from and feeding back into the SentraisOS core.
            </ForgeAlert>

            {/* Architecture Diagram */}
            <ForgeCard>
              <ForgeCardHeader title="Entity Architecture" />
              <ForgeCardBody>
                {/* Core */}
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{
                    display: "inline-block", padding: "16px 40px", borderRadius: 10,
                    background: `${C.accent}18`, border: `2px solid ${C.accent}`,
                  }}>
                    <div style={{ fontSize: 10, letterSpacing: "3px", color: C.accent, textTransform: "uppercase" }}>Sovereign Core</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginTop: 4 }}>SentraisOS</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Operational Intelligence Infrastructure</div>
                    <div style={{ fontSize: 10, color: C.accent, marginTop: 6, fontFamily: "monospace" }}>ERP: SNTR-IG</div>
                  </div>
                </div>

                {/* Connector lines */}
                <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 0 }}>
                  {VERTICALS.map((v, i) => (
                    <div key={v.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 2, height: 30, background: v.color, opacity: 0.4 }} />
                    </div>
                  ))}
                </div>

                {/* Verticals */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  {VERTICALS.map(v => (
                    <div
                      key={v.id}
                      onClick={() => { setSelectedVertical(v.id); setTab("verticals"); }}
                      style={{
                        padding: "14px", borderRadius: 8, cursor: "pointer",
                        background: C.bg, border: `1px solid ${v.color}66`,
                        borderTop: `3px solid ${v.color}`, textAlign: "center",
                        transition: "background 0.12s",
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{v.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: v.color }}>{v.name}</div>
                      <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3 }}>{v.subtitle}</div>
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{v.tam}</div>
                        <div style={{ fontSize: 10, color: C.textMuted }}>TAM</div>
                      </div>
                      <div style={{ marginTop: 8, fontSize: 9, fontFamily: "monospace", color: v.color }}>{v.erpCode}</div>
                    </div>
                  ))}
                </div>

                {/* NIN Feedback Arrow */}
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    padding: "8px 20px", borderRadius: 20,
                    background: `${C.purple}11`, border: `1px solid ${C.purple}44`,
                  }}>
                    <div style={{ fontSize: 11, color: C.purple }}>NIN Layer 6 — Federated Intelligence Feed</div>
                    <div style={{ fontSize: 12, color: C.purple }}>↑↓</div>
                    <div style={{ fontSize: 11, color: C.purple }}>Each vertical feeds and draws from SentraisOS core</div>
                  </div>
                </div>
              </ForgeCardBody>
            </ForgeCard>

            {/* TAM Summary */}
            <ForgeCard>
              <ForgeCardHeader title="Total Addressable Market by Vertical" />
              <ForgeCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {VERTICALS.map(v => (
                    <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ fontSize: 16 }}>{v.icon}</div>
                      <div style={{ width: 130, fontSize: 12, fontWeight: 600, color: v.color, flexShrink: 0 }}>{v.name}</div>
                      <div style={{ flex: 1, height: 8, background: C.border, borderRadius: 4 }}>
                        <div style={{
                          height: 8, borderRadius: 4, background: v.color,
                          width: v.id === "civigrid" ? "100%" : v.id === "evergame" ? "50%" : v.id === "entertainmentos" ? "20%" : "10%",
                        }} />
                      </div>
                      <div style={{ width: 60, fontSize: 14, fontWeight: 800, color: v.color, textAlign: "right", flexShrink: 0 }}>{v.tam}</div>
                      <div style={{ width: 100, fontSize: 11, color: C.textMuted, flexShrink: 0 }}>{v.tamLabel}</div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>

            {/* Modular Capital */}
            <ForgeCard>
              <ForgeCardHeader title="Modular Capital Structure" />
              <ForgeCardBody>
                <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>
                  Each vertical can be capitalized independently without diluting the SentraisOS core or cross-contaminating IP. This structure enables vertical-specific venture capital, strategic partnerships, and joint ventures.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { label: "Independent Capitalization", detail: "Each vertical holds its own cap table. Series A in EVERGAME does not dilute CiviGrid equity holders.", color: C.accent },
                    { label: "IP Ring-Fencing", detail: "SentraisOS core IP lives in Tenant A (IP Fortress). Verticals license the core — they do not own it.", color: C.teal },
                    { label: "BGI Separation", detail: "BGI (Tenant C) accounts are completely separate. Zero commingling with commercial operations. §4958 private inurement prohibition enforced.", color: C.purple },
                  ].map(item => (
                    <div key={item.label} style={{ padding: "14px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, borderTop: `3px solid ${item.color}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: item.color, marginBottom: 6 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>{item.detail}</div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

        {/* VERTICALS */}
        {tab === "verticals" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {VERTICALS.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVertical(v.id)}
                  style={{
                    padding: "8px 16px", borderRadius: 6, cursor: "pointer",
                    border: selectedVertical === v.id ? `1px solid ${v.color}` : `1px solid ${C.border}`,
                    background: selectedVertical === v.id ? `${v.color}22` : C.surface,
                    color: selectedVertical === v.id ? v.color : C.textMuted,
                    fontSize: 13, fontWeight: selectedVertical === v.id ? 700 : 400,
                    transition: "all 0.12s",
                  }}
                >
                  {v.icon} {v.name}
                </button>
              ))}
            </div>

            {vertical && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <ForgeCard style={{ borderLeft: `3px solid ${vertical.color}` }}>
                  <ForgeCardBody>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 28 }}>{vertical.icon}</span>
                          <div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: vertical.color }}>{vertical.name}</div>
                            <div style={{ fontSize: 13, color: C.textMuted }}>{vertical.subtitle}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>{vertical.description}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: vertical.color }}>{vertical.tam}</div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>TAM</div>
                        <div style={{ marginTop: 8 }}>
                          <ForgeBadge style={{ background: `${vertical.color}22`, color: vertical.color, fontFamily: "monospace" }}>{vertical.erpCode}</ForgeBadge>
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <ForgeBadge variant="default">{vertical.anchorMarket}</ForgeBadge>
                        </div>
                      </div>
                    </div>
                  </ForgeCardBody>
                </ForgeCard>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <ForgeCard>
                    <ForgeCardHeader title="Core Capabilities" />
                    <ForgeCardBody>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {vertical.capabilities.map(c => (
                          <div key={c} style={{ display: "flex", gap: 10, padding: "9px 12px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}` }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: vertical.color, flexShrink: 0, marginTop: 4 }} />
                            <span style={{ fontSize: 12, color: C.text }}>{c}</span>
                          </div>
                        ))}
                      </div>
                    </ForgeCardBody>
                  </ForgeCard>

                  <ForgeCard>
                    <ForgeCardHeader title="Intelligence Flywheel Contribution" />
                    <ForgeCardBody>
                      <div style={{ padding: "16px", background: `${vertical.color}11`, borderRadius: 8, border: `1px solid ${vertical.color}33` }}>
                        <div style={{ fontSize: 12, color: vertical.color, fontWeight: 600, marginBottom: 8 }}>How {vertical.name} feeds the core:</div>
                        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{vertical.flywheel}</div>
                      </div>
                    </ForgeCardBody>
                  </ForgeCard>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SOVEREIGN CORE */}
        {tab === "core" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeCard style={{ borderTop: `3px solid ${C.accent}` }}>
              <ForgeCardHeader
                title="SentraisOS — Sovereign Core"
                actions={<ForgeBadge style={{ fontFamily: "monospace", background: `${C.accent}22`, color: C.accent }}>SNTR-IG</ForgeBadge>}
              />
              <ForgeCardBody>
                <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7, marginBottom: 20 }}>{CORE.description}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {CORE.principles.map((p, i) => (
                    <div key={p.label} style={{
                      display: "flex", gap: 16, padding: "14px 16px", borderRadius: 8,
                      background: C.bg, border: `1px solid ${C.border}`,
                      borderLeft: `3px solid ${[C.accent, C.teal, C.purple, C.red][i]}`,
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{p.label}</div>
                        <div style={{ fontSize: 12, color: C.textMuted }}>{p.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>

            <ForgeCard>
              <ForgeCardHeader title="Tenant Architecture" />
              <ForgeCardBody>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    {
                      label: "Tenant A — IP Fortress",
                      access: "Zero access — IP custodians only",
                      color: C.red,
                      description: "All core SentraisOS IP is ring-fenced here. No worker type — including employees — has access except designated IP custodians. MetaData and core algorithmic assets live here.",
                      badge: "RESTRICTED",
                    },
                    {
                      label: "Tenant B — Commercial Operations",
                      access: "Role-based access per Workforce Matrix",
                      color: C.teal,
                      description: "All four verticals operate here. Standard RBAC applies per worker type (Employee / Contractor / Fellow / Intern / Volunteer). Pod structure, CRM, ERP, and operational systems.",
                      badge: "OPERATIONAL",
                    },
                    {
                      label: "Tenant C — BGI",
                      access: "Zero access — zero commingling",
                      color: C.amber,
                      description: "BGI (philanthropic entity) accounts are completely separate from commercial. §4958 private inurement prohibition. No contractor, fellow, intern, or volunteer has any access under any circumstances.",
                      badge: "SEPARATE ENTITY",
                    },
                  ].map(t => (
                    <div key={t.label} style={{ padding: "14px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, borderTop: `3px solid ${t.color}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.label}</div>
                        <ForgeBadge style={{ background: `${t.color}22`, color: t.color, fontSize: 9 }}>{t.badge}</ForgeBadge>
                      </div>
                      <div style={{ fontSize: 11, color: C.accent, marginBottom: 8, fontWeight: 600 }}>{t.access}</div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>{t.description}</div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>

            <ForgeAlert level="warning">
              <strong>Golden Decision Filter:</strong> Every structural, systems, or hiring decision must pass this test — "Does this create or reduce founder dependency?" Any action that makes the business less executable without a single person is a structural risk. This filter applies to all Day 1 corporate overhaul actions.
            </ForgeAlert>
          </div>
        )}

        {/* INTELLIGENCE FLYWHEEL */}
        {tab === "flywheel" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeAlert level="info">
              The Compounding Intelligence Flywheel is the core competitive moat. Each vertical deployment generates operational data that improves the SentraisOS core — which improves every subsequent deployment across all verticals. The flywheel accelerates with scale.
            </ForgeAlert>

            <ForgeCard>
              <ForgeCardHeader title="Flywheel Cycle" />
              <ForgeCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {FLYWHEEL.map((step, i) => (
                    <div key={step.step} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: `${step.color}22`, border: `2px solid ${step.color}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, fontWeight: 800, color: step.color,
                        }}>{step.step}</div>
                        {i < FLYWHEEL.length - 1 && (
                          <div style={{ width: 2, height: 20, background: C.border, marginTop: 4 }} />
                        )}
                      </div>
                      <div style={{ flex: 1, paddingTop: 6, paddingBottom: i < FLYWHEEL.length - 1 ? 14 : 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: step.color, marginBottom: 4 }}>{step.label}</div>
                        <div style={{ fontSize: 13, color: C.textMuted }}>{step.detail}</div>
                      </div>
                    </div>
                  ))}
                  {/* Loop arrow */}
                  <div style={{ textAlign: "center", marginTop: 8 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 20, background: `${C.accent}11`, border: `1px solid ${C.accent}33` }}>
                      <span style={{ fontSize: 14, color: C.accent }}>↩</span>
                      <span style={{ fontSize: 12, color: C.accent }}>Cycle repeats — intelligence compounds with each deployment</span>
                    </div>
                  </div>
                </div>
              </ForgeCardBody>
            </ForgeCard>

            <ForgeCard>
              <ForgeCardHeader title="Cross-Vertical Intelligence Flow" />
              <ForgeCardBody>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                  {[
                    { from: "EVERGAME", to: "CiviGrid", flow: "Safety incident patterns and crowd management data from venue deployments improve city emergency response models.", color: C.accent },
                    { from: "CiviGrid", to: "SEARGrid", flow: "Municipal crisis data (natural disaster response, infrastructure failures) strengthens federal emergency protocols.", color: C.teal },
                    { from: "SEARGrid", to: "EVERGAME", flow: "Federal-grade threat intelligence and mass-casualty response protocols elevate EVERGAME venue safety standards.", color: C.red },
                    { from: "EntertainmentOS", to: "EVERGAME", flow: "Touring audience behavioral data (spend patterns, ingress timing) directly improves venue fan experience scoring.", color: C.purple },
                  ].map(flow => (
                    <div key={`${flow.from}-${flow.to}`} style={{ padding: "14px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <ForgeBadge style={{ background: `${flow.color}22`, color: flow.color }}>{flow.from}</ForgeBadge>
                        <span style={{ color: C.textMuted, fontSize: 14 }}>→</span>
                        <ForgeBadge variant="default">{flow.to}</ForgeBadge>
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>{flow.flow}</div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

        {/* DAY 1 CHECKLIST */}
        {tab === "day1" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeCard>
              <ForgeCardBody>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  <div style={{ textAlign: "center", padding: "12px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: C.accent }}>{doneCount}/{checklist.length}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Items Complete</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "12px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.red}` }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: C.red }}>{criticalDone}/{criticalTotal}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Critical Items Done</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "12px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                    <div style={{ height: 8, background: C.border, borderRadius: 4, marginBottom: 8 }}>
                      <div style={{ height: 8, borderRadius: 4, background: C.green, width: `${(doneCount / checklist.length) * 100}%`, transition: "width 0.3s" }} />
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.green }}>{Math.round((doneCount / checklist.length) * 100)}%</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>Overall Progress</div>
                  </div>
                </div>
              </ForgeCardBody>
            </ForgeCard>

            {["Legal", "Finance", "Systems"].map(cat => (
              <ForgeCard key={cat}>
                <ForgeCardHeader
                  title={cat}
                  actions={<ForgeBadge style={{ background: `${CAT_COLORS[cat]}22`, color: CAT_COLORS[cat] }}>{checklist.filter(i => i.category === cat).length} items</ForgeBadge>}
                />
                <ForgeCardBody>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {checklist.map((item, idx) => item.category !== cat ? null : (
                      <div
                        key={idx}
                        onClick={() => toggleItem(idx)}
                        style={{
                          display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                          borderRadius: 8, cursor: "pointer",
                          background: item.done ? `${C.green}11` : C.bg,
                          border: `1px solid ${item.done ? C.green + "44" : C.border}`,
                          borderLeft: `3px solid ${item.done ? C.green : item.critical ? C.red : CAT_COLORS[cat]}`,
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                          background: item.done ? C.green : "transparent",
                          border: `2px solid ${item.done ? C.green : C.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {item.done && <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>✓</span>}
                        </div>
                        <div style={{ flex: 1, fontSize: 13, color: item.done ? C.textMuted : C.text, textDecoration: item.done ? "line-through" : "none" }}>
                          {item.item}
                        </div>
                        {item.critical && !item.done && (
                          <ForgeBadge variant="danger" style={{ fontSize: 9 }}>Critical</ForgeBadge>
                        )}
                      </div>
                    ))}
                  </div>
                </ForgeCardBody>
              </ForgeCard>
            ))}

            <ForgeAlert level="warning">
              The Modified Sole Director Written Consent is the legal trigger for all downstream Day 1 changes. ERP codes, HubSpot remapping, and ARI bylaw updates cannot be actioned until this document is executed.
            </ForgeAlert>
          </div>
        )}

      </ForgeContent>
    </ForgePage>
  );
}

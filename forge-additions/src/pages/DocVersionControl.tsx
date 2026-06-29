// @ts-nocheck
import { useState } from "react";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody,
  ForgeLabel, ForgeBadge, ForgeAlert, C,
} from "../components/ui/forge";

const CHANGE_LOG = [
  { file: "ARI_NOVATEUS.docx", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "ARI / Strategy", totalReplacements: 6, replacements: [{ from: "NOVATEUS Foundation", to: "NOVATELabs Inc", count: 3 }, { from: "NovateUS (standalone)", to: "NOVATELabs Inc", count: 3 }] },
  { file: "ARI_3_Legacy_Functions.docx", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "ARI / Strategy", totalReplacements: 2, replacements: [{ from: "NOVATEUS Foundation", to: "NOVATELabs Inc", count: 2 }] },
  { file: "ARI_Financial_Architecture.docx", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "ARI / Strategy", totalReplacements: 1, replacements: [{ from: "NOVATEUS Foundation", to: "NOVATELabs Inc", count: 1 }] },
  { file: "ARI_Foundational_Artifacts.docx", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "ARI / Strategy", totalReplacements: 1, replacements: [{ from: "NOVATEUS Foundation", to: "NOVATELabs Inc", count: 1 }] },
  { file: "ARI_Strategic_Design_Decisions.docx", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "ARI / Strategy", totalReplacements: 1, replacements: [{ from: "NOVATEUS Foundation", to: "NOVATELabs Inc", count: 1 }] },
  { file: "ARI_FRAME_Overlay.docx", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "ARI / Strategy", totalReplacements: 1, replacements: [{ from: "NovateUS (standalone)", to: "NOVATELabs Inc", count: 1 }] },
  { file: "ARI_FRAME_Overlay__1_.docx", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "ARI / Strategy", totalReplacements: 1, replacements: [{ from: "NovateUS (standalone)", to: "NOVATELabs Inc", count: 1 }] },
  { file: "NOVATE_Financial_Operating_Model.docx", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "Finance / Ops", totalReplacements: 1, replacements: [{ from: "NOVATEUS Foundation", to: "NOVATELabs Inc", count: 1 }] },
  { file: "NOVATE_Internship_Fellowship_Framework.docx", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "Finance / Ops", totalReplacements: 2, replacements: [{ from: "NOVATEUS Foundation", to: "NOVATELabs Inc", count: 2 }] },
  { file: "Fee_Structure.docx", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "Finance / Ops", totalReplacements: 1, replacements: [{ from: "NovateUS (standalone)", to: "NOVATELabs Inc", count: 1 }] },
  { file: "2_Banking_Payment_Governance.md", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "Finance / Ops", totalReplacements: 1, replacements: [{ from: "NovateUS Foundation", to: "NOVATELabs Inc", count: 1 }] },
  { file: "3_Workforce_Classification_Matrix.md", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "Workforce / HR", totalReplacements: 1, replacements: [{ from: "NovateUS Foundation", to: "NOVATELabs Inc", count: 1 }] },
  { file: "4_Summer_Internship_Fellowship_Framework.md", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "Workforce / HR", totalReplacements: 1, replacements: [{ from: "NovateUS Foundation", to: "NOVATELabs Inc", count: 1 }] },
  { file: "Recommended_Summer_Org.docx", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "Workforce / HR", totalReplacements: 1, replacements: [{ from: "NovateUS (standalone)", to: "NOVATELabs Inc", count: 1 }] },
  { file: "Tiered_Workforce.docx", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "Workforce / HR", totalReplacements: 1, replacements: [{ from: "NovateUS (standalone)", to: "NOVATELabs Inc", count: 1 }] },
  { file: "Phase_4_Execution__BGI_.docx", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "BGI / Governance", totalReplacements: 1, replacements: [{ from: "NovateUS (standalone)", to: "NOVATELabs Inc", count: 1 }] },
];

const PENDING_SYSTEMS = [
  { system: "HubSpot", item: "Company record name", from: "N-OvateUS Foundation Inc", to: "NOVATELabs Inc", owner: "CRM Admin", priority: "HIGH" },
  { system: "HubSpot", item: "Pipeline D label", from: "NovateUS Programs", to: "BGI Programs", owner: "CRM Admin", priority: "HIGH" },
  { system: "HubSpot", item: "Entity field (all objects)", from: "NOVATEUS Foundation", to: "NOVATELabs Inc", owner: "CRM Admin", priority: "HIGH" },
  { system: "Monday.com", item: "Workspace name", from: "NovateUS Programs", to: "NOVATELabs Programs / BGI Programs", owner: "Ops Lead", priority: "HIGH" },
  { system: "Monday.com", item: "Entity columns", from: "NOVATEUS Foundation", to: "NOVATELabs Inc", owner: "Ops Lead", priority: "HIGH" },
  { system: "Microsoft 365", item: "Tenant B display name", from: "NovateUS Foundation (if set)", to: "NOVATELabs Inc", owner: "IT Admin", priority: "MED" },
  { system: "Microsoft 365", item: "Tenant C (BGI)", from: "Does not exist", to: "Create: Barbara Geter Institute", owner: "IT Admin", priority: "HIGH" },
  { system: "NetSuite", item: "Entity / vendor record", from: "N-OvateUS Foundation Inc", to: "NOVATELabs Inc", owner: "Finance", priority: "HIGH" },
  { system: "NetSuite", item: "Chart of accounts label", from: "NOVATEUS Foundation segment", to: "NOVATELabs Inc segment", owner: "Finance", priority: "HIGH" },
  { system: "Bank", item: "Account legal name", from: "N-OvateUS Foundation Inc", to: "NOVATELabs Inc", owner: "Finance + Legal", priority: "HIGH" },
  { system: "Email / Letterhead", item: "Signature blocks", from: "NOVATEUS Foundation", to: "NOVATELabs Inc", owner: "Operations", priority: "MED" },
];

const PRESERVED_FILES = [
  { file: "AFFIRMATION_REQUEST.docx / .pdf", reason: "Filed IRS letter — preserve as-is. Awaiting response." },
  { file: "ARTICLES_OF_AMENDMENT__NOVATELABS.pdf", reason: "Official state filing — legal record, never alter." },
  { file: "_Tax_Exempt_Notice__NOVATEUSFOUNDATIONINC.pdf", reason: "Original IRS tax-exempt notice — historical legal record." },
  { file: "Final__Articles_of_Incorporation_GA_NOvateUs.pdf", reason: "GA incorporation record — do not alter." },
  { file: "NONPROFIT_CORPORATE_BYLAWS_NOvateUS.pdf", reason: "Executed document — preserve original." },
  { file: "NOvate__*.pdf (all executed agreements)", reason: "Fully executed legal instruments — preserve all originals." },
];

const CATEGORY_COLORS = {
  "ARI / Strategy":  C.accent,
  "Finance / Ops":   C.green,
  "Workforce / HR":  C.amber,
  "BGI / Governance": C.purple,
};

const SUBSTITUTIONS = [
  ["N-OvateUS Foundation Inc", "NOVATELabs Inc"],
  ["NOVATEUS Foundation", "NOVATELabs Inc"],
  ["NovateUS Foundation", "NOVATELabs Inc"],
  ["NovateUS Programs", "BGI Programs"],
  ["NovateUS (standalone)", "NOVATELabs Inc"],
];

const ERP_CODES = [
  { code: "SNTR-EG", vertical: "EVERGAME", description: "Sports & Entertainment Venue Operations — all EVERGAME revenue, costs, and deployment expenses", color: C.accent, status: "PENDING" },
  { code: "SNTR-CG", vertical: "CiviGrid", description: "Smart Cities & Civic Infrastructure — all CiviGrid municipal contracts, ARI program costs, city deployments", color: C.teal, status: "PENDING" },
  { code: "SNTR-AG", vertical: "EntertainmentOS / ARI", description: "EntertainmentOS touring, Live Nation, ARI program operations, and government affairs", color: C.purple, status: "PENDING" },
  { code: "SNTR-SG", vertical: "SEARGrid / CrisisGrid", description: "Federal and emergency response contracts — FEMA, DHS, and Knox/SEG NFL revenue share", color: C.red, status: "PENDING" },
  { code: "SNTR-IG", vertical: "Intelligence Core", description: "SentraisOS core infrastructure — platform licensing, shared technology costs, IP maintenance", color: C.amber, status: "PENDING" },
];

const HUBSPOT_REMAPPING = [
  { object: "Company Records", field: "Entity", from: "NOVATELabs Inc (flat)", to: "Vertical taxonomy (EVERGAME / CiviGrid / EntertainmentOS / SEARGrid)", owner: "CRM Admin", priority: "HIGH" },
  { object: "Deals", field: "Pipeline", from: "Single pipeline (all revenue)", to: "Vertical-specific pipelines mapped to ERP code", owner: "CRM Admin", priority: "HIGH" },
  { object: "Deals", field: "Cost Center", from: "Not set", to: "SNTR-EG / SNTR-CG / SNTR-AG / SNTR-SG / SNTR-IG per deal type", owner: "CRM Admin", priority: "HIGH" },
  { object: "Contacts", field: "Vertical Tag", from: "Not set", to: "Tag all contacts to primary vertical", owner: "CRM Admin", priority: "MED" },
  { object: "Activities", field: "Pod Attribution", from: "Not set", to: "Tag activities to GTM pod (pod name + ERP code)", owner: "RevOps", priority: "MED" },
  { object: "Reports", field: "Revenue Dashboard", from: "Company-level only", to: "Split by vertical ERP code + pod", owner: "RevOps", priority: "HIGH" },
];

const MONDAY_TAXONOMY = [
  { workspace: "EVERGAME Operations", boards: ["SPORTS360 Deployments", "Venue Gate Tracker (G-01–G-18)", "GDA Staffing Plans", "League Account Management"], erpCode: "SNTR-EG", color: C.accent },
  { workspace: "CiviGrid / ARI", boards: ["City Readiness Portfolio", "ARI Program Management", "Municipal Partner Pipeline", "BGI Fellowship Tracker"], erpCode: "SNTR-CG", color: C.teal },
  { workspace: "EntertainmentOS", boards: ["Live Nation Intelligence", "Tour Deployment Planning", "Artist & Venue Accounts", "Event Revenue Tracking"], erpCode: "SNTR-AG", color: C.purple },
  { workspace: "SEARGrid", boards: ["Federal Contract Pipeline", "Knox/SEG Revenue Tracking", "Crisis Response Protocols", "Compliance & Certifications"], erpCode: "SNTR-SG", color: C.red },
  { workspace: "Core Operations", boards: ["GTM Pod Structure", "Exec Comp Milestones", "Day 1 Corporate Overhaul", "Workforce & HR"], erpCode: "SNTR-IG", color: C.amber },
];

const M365_SITES = [
  { site: "EVERGAME", path: "/sites/sentrais-evergame", erpCode: "SNTR-EG", description: "SPORTS360 playbooks, venue ops, GDA documentation, league contracts", color: C.accent },
  { site: "CiviGrid", path: "/sites/sentrais-civigrid", erpCode: "SNTR-CG", description: "City readiness docs, ARI program artifacts, municipal partnership agreements", color: C.teal },
  { site: "EntertainmentOS", path: "/sites/sentrais-entertainmentos", erpCode: "SNTR-AG", description: "Live Nation architecture, tour intelligence docs, event operations", color: C.purple },
  { site: "SEARGrid", path: "/sites/sentrais-seargrid", erpCode: "SNTR-SG", description: "Federal contracts, Knox/SEG agreement (restricted), crisis protocols", color: C.red },
  { site: "Core — IP & Legal", path: "/sites/sentrais-core", erpCode: "SNTR-IG", description: "SentraisOS architecture, IP documentation, legal instruments, board records", color: C.amber },
  { site: "BGI (Tenant C)", path: "/sites/bgi-programs", erpCode: "BGI", description: "Barbara Geter Institute — completely separate tenant. Zero commingling with commercial sites.", color: C.purple },
];

const TABS = ["Document Changes", "System Updates", "ERP & Systems Taxonomy", "Preserved / Archived"];

export default function DocVersionControl() {
  const [tab, setTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [systemStatuses, setSystemStatuses] = useState<Record<string, boolean>>({});

  const totalReplacements = CHANGE_LOG.reduce((s, f) => s + f.totalReplacements, 0);
  const categories = ["All", ...Array.from(new Set(CHANGE_LOG.map(f => f.category)))];
  const filtered = selectedCategory === "All" ? CHANGE_LOG : CHANGE_LOG.filter(f => f.category === selectedCategory);
  const pendingHigh = PENDING_SYSTEMS.filter(s => s.priority === "HIGH" && !systemStatuses[`${s.system}-${s.item}`]).length;
  const systemsDone = Object.values(systemStatuses).filter(Boolean).length;

  return (
    <ForgePage>
      <ForgeHeader
        icon="📋"
        title="Document Version Control"
        subtitle={`Entity Reference Migration · Change Set: BGI-REF-UPDATE-2026-v2.0 · Run: 2026-06-08`}
        stats={[
          { label: "Files Updated", value: String(CHANGE_LOG.length) },
          { label: "Replacements", value: String(totalReplacements) },
          { label: "Systems Pending", value: String(pendingHigh) },
          { label: "Preserved", value: String(PRESERVED_FILES.length) },
        ]}
      />

      {/* Substitution rule banner */}
      <div style={{ margin: "0 0 0 0", padding: "12px 24px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <ForgeLabel style={{ marginBottom: 8 }}>Applied Substitution Rules</ForgeLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SUBSTITUTIONS.map(([from, to]) => (
            <div key={from} style={{ display: "flex", alignItems: "center", gap: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 11 }}>
              <span style={{ color: C.red, textDecoration: "line-through" }}>{from}</span>
              <span style={{ color: "#4a6080" }}>→</span>
              <span style={{ color: C.green }}>{to}</span>
            </div>
          ))}
        </div>
      </div>

      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />
      <ForgeContent>

        {tab === 0 && (
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                  padding: "5px 13px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                  background: selectedCategory === cat ? C.accent : C.surface,
                  border: `1px solid ${selectedCategory === cat ? C.accent : C.border}`,
                  color: selectedCategory === cat ? "#fff" : "#94a3b8",
                }}>{cat}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map(doc => {
                const catColor = CATEGORY_COLORS[doc.category] || C.accent;
                const isEx = expandedFile === doc.file;
                return (
                  <div key={doc.file} onClick={() => setExpandedFile(isEx ? null : doc.file)}
                    style={{ background: C.surface, border: `1px solid ${isEx ? C.accent : C.border}`, borderRadius: 10, overflow: "hidden", cursor: "pointer" }}>
                    <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
                      <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
                        <span style={{ background: "rgba(100,116,139,0.15)", color: "#64748b", fontSize: 10, padding: "2px 6px", borderRadius: 3 }}>{doc.prevVersion}</span>
                        <span style={{ color: "#4a6080", fontSize: 10 }}>→</span>
                        <span style={{ background: "rgba(16,185,129,0.1)", color: C.green, fontSize: 10, padding: "2px 6px", borderRadius: 3 }}>{doc.version}</span>
                      </div>
                      <div style={{ flex: 1, fontSize: 13, color: "#cbd5e1", wordBreak: "break-word" }}>{doc.file}</div>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${catColor}22`, color: catColor, flexShrink: 0 }}>{doc.category}</span>
                      <span style={{ background: "rgba(245,158,11,0.1)", color: C.amber, fontSize: 11, padding: "2px 8px", borderRadius: 4, flexShrink: 0 }}>{doc.totalReplacements} change{doc.totalReplacements !== 1 ? "s" : ""}</span>
                      <span style={{ color: "#4a6080", fontSize: 11, flexShrink: 0 }}>{isEx ? "▲" : "▼"}</span>
                    </div>
                    {isEx && (
                      <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 16px", background: "#06101f" }}>
                        <ForgeLabel style={{ marginBottom: 8 }}>Change Detail</ForgeLabel>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {doc.replacements.map((r, j) => (
                            <div key={j} style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 12, flexWrap: "wrap" }}>
                              <span style={{ color: C.red, textDecoration: "line-through", flex: 1 }}>{r.from}</span>
                              <span style={{ color: "#4a6080" }}>→</span>
                              <span style={{ color: C.green, flex: 1 }}>{r.to}</span>
                              <span style={{ color: C.amber, fontWeight: 600, flexShrink: 0 }}>{r.count}×</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 10, fontSize: 11, color: "#4a6080" }}>Processed: {doc.timestamp}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 1 && (
          <div>
            <ForgeAlert level="warning" title="Manual Updates Required">
              These system updates require action by the designated owner. Click to mark complete.
            </ForgeAlert>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", margin: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>System Update Progress</span>
              <span style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>{systemsDone} / {PENDING_SYSTEMS.length} complete</span>
            </div>
            <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.accent}, ${C.teal})`, width: `${(systemsDone / PENDING_SYSTEMS.length) * 100}%`, transition: "width 0.3s", borderRadius: 3 }} />
            </div>

            {Array.from(new Set(PENDING_SYSTEMS.map(s => s.system))).map(sys => (
              <div key={sys} style={{ marginBottom: 20 }}>
                <ForgeLabel style={{ marginBottom: 10 }}>{sys}</ForgeLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {PENDING_SYSTEMS.filter(s => s.system === sys).map(item => {
                    const key = `${item.system}-${item.item}`;
                    const done = systemStatuses[key];
                    return (
                      <div key={key} onClick={() => setSystemStatuses(prev => ({ ...prev, [key]: !prev[key] }))}
                        style={{ background: done ? "rgba(16,185,129,0.05)" : C.surface, border: `1px solid ${done ? C.green : C.border}`, borderLeft: `3px solid ${done ? C.green : item.priority === "HIGH" ? C.red : C.amber}`, borderRadius: 8, padding: "11px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", opacity: done ? 0.75 : 1 }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, background: done ? C.green : C.bg, border: `1px solid ${done ? C.green : "#374151"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white" }}>
                          {done ? "✓" : ""}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: done ? "#64748b" : "#cbd5e1", textDecoration: done ? "line-through" : "none", marginBottom: 3 }}>{item.item}</div>
                          <div style={{ fontSize: 11, color: "#64748b", display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ color: C.red }}>"{item.from}"</span>
                            <span>→</span>
                            <span style={{ color: C.green }}>"{item.to}"</span>
                          </div>
                        </div>
                        <span style={{ fontSize: 11, color: "#64748b" }}>{item.owner}</span>
                        <ForgeBadge variant={done ? "success" : item.priority === "HIGH" ? "danger" : "warning"}>{done ? "DONE" : item.priority}</ForgeBadge>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ForgeAlert level="warning">
              The 5 ERP codes below must be activated in NetSuite before any vertical revenue or cost is recorded. HubSpot, Monday.com, and M365 remapping follows. The Modified Sole Director Written Consent is the legal trigger for all of these actions.
            </ForgeAlert>

            {/* ERP Codes */}
            <ForgeCard>
              <ForgeCardHeader title="NetSuite ERP Codes — Vertical Cost Centers" />
              <ForgeCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {ERP_CODES.map(e => (
                    <div key={e.code} style={{ display: "flex", gap: 16, padding: "12px 16px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, borderLeft: `3px solid ${e.color}` }}>
                      <div style={{ flexShrink: 0, textAlign: "center", width: 80 }}>
                        <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: e.color }}>{e.code}</div>
                        <ForgeBadge variant="warning" style={{ marginTop: 6, fontSize: 9 }}>{e.status}</ForgeBadge>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{e.vertical}</div>
                        <div style={{ fontSize: 12, color: C.textMuted }}>{e.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>

            {/* HubSpot Remapping */}
            <ForgeCard>
              <ForgeCardHeader
                title="HubSpot — Vertical Taxonomy Remapping"
                actions={<ForgeBadge variant="danger">{HUBSPOT_REMAPPING.filter(r => r.priority === "HIGH").length} HIGH priority</ForgeBadge>}
              />
              <ForgeCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {HUBSPOT_REMAPPING.map((r, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 80px 60px", gap: 12, padding: "10px 14px", borderRadius: 6, background: C.bg, border: `1px solid ${C.border}`, alignItems: "start" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.accent }}>{r.object}</div>
                      <div>
                        <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 2 }}>FROM</div>
                        <div style={{ fontSize: 12, color: C.red }}>{r.from}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 2 }}>TO</div>
                        <div style={{ fontSize: 12, color: C.green }}>{r.to}</div>
                      </div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{r.owner}</div>
                      <ForgeBadge variant={r.priority === "HIGH" ? "danger" : "warning"}>{r.priority}</ForgeBadge>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>

            {/* Monday.com */}
            <ForgeCard>
              <ForgeCardHeader title="Monday.com — Workspace Taxonomy" />
              <ForgeCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {MONDAY_TAXONOMY.map(ws => (
                    <div key={ws.workspace} style={{ padding: "14px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, borderLeft: `3px solid ${ws.color}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: ws.color }}>{ws.workspace}</div>
                        <ForgeBadge style={{ fontFamily: "monospace", background: `${ws.color}22`, color: ws.color }}>{ws.erpCode}</ForgeBadge>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {ws.boards.map(b => (
                          <div key={b} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: C.surface, border: `1px solid ${C.border}`, color: C.textMuted }}>{b}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ForgeCardBody>
            </ForgeCard>

            {/* M365 SharePoint */}
            <ForgeCard>
              <ForgeCardHeader title="Microsoft 365 — SharePoint Site Naming" />
              <ForgeCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {M365_SITES.map(s => (
                    <div key={s.site} style={{ display: "flex", gap: 14, padding: "12px 14px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, borderLeft: `3px solid ${s.color}` }}>
                      <div style={{ flexShrink: 0, width: 110 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.site}</div>
                        <div style={{ fontFamily: "monospace", fontSize: 10, color: C.textMuted, marginTop: 3 }}>{s.path}</div>
                      </div>
                      <div style={{ flex: 1, fontSize: 12, color: C.textMuted }}>{s.description}</div>
                      <ForgeBadge style={{ fontFamily: "monospace", background: `${s.color}22`, color: s.color, flexShrink: 0 }}>{s.erpCode}</ForgeBadge>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: "10px 14px", background: `${C.amber}11`, borderRadius: 8, border: `1px solid ${C.amber}33` }}>
                  <div style={{ fontSize: 12, color: C.amber, fontWeight: 600, marginBottom: 4 }}>BGI Tenant Separation</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>BGI (Tenant C) must be provisioned as a fully separate M365 tenant — not a SharePoint site under the commercial tenant. Zero shared permissions between Tenant B (commercial) and Tenant C (BGI).</div>
                </div>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

        {tab === 3 && (
          <div>
            <ForgeAlert level="info" title="Preservation Rule">
              These files contain stale entity names but must NOT be modified. They are executed legal instruments or official government filings.
            </ForgeAlert>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
              {PRESERVED_FILES.map((pf, i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid rgba(139,92,246,0.3)`, borderLeft: `3px solid ${C.purple}`, borderRadius: 10, padding: "14px 16px", display: "flex", gap: 14 }}>
                  <div style={{ fontSize: 20, flexShrink: 0 }}>🔒</div>
                  <div>
                    <div style={{ fontSize: 13, color: "#c4b5fd", fontWeight: 500, marginBottom: 4 }}>{pf.file}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{pf.reason}</div>
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

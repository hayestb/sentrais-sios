import { useState } from "react";

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
  { file: "Phase_4_Execution__Structural_Nonprofit_Architecture__Barbara_Geter_Institute_.docx", version: "v2.0", prevVersion: "v1.0", timestamp: "2026-06-08 13:33:28", status: "UPDATED", category: "BGI / Governance", totalReplacements: 1, replacements: [{ from: "NovateUS (standalone)", to: "NOVATELabs Inc", count: 1 }] },
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
  { file: "ARTICLES_OF_AMEDMENT__NOVATELABS.pdf", reason: "Official state filing — legal record, never alter." },
  { file: "_Tax_Exempt_Notice__NOVATEUSFOUNDATIONINC.pdf", reason: "Original IRS tax-exempt notice — historical legal record." },
  { file: "Final__Articles_of_Incorporation_GA_NOvateUs_s.pdf", reason: "GA incorporation record — do not alter." },
  { file: "NONPROFIT_CORPORATE_BYLAWS_NOvateUS.pdf", reason: "Executed document — preserve original." },
  { file: "NOvate__*.pdf (all executed agreements)", reason: "Fully executed legal instruments — preserve all originals." },
];

const CATEGORY_COLORS = {
  "ARI / Strategy": { bg: "#EFF6FF", border: "#3B82F6", badge: "#1D4ED8", text: "#1E40AF" },
  "Finance / Ops": { bg: "#F0FDF4", border: "#22C55E", badge: "#15803D", text: "#166534" },
  "Workforce / HR": { bg: "#FFF7ED", border: "#F97316", badge: "#C2410C", text: "#9A3412" },
  "BGI / Governance": { bg: "#F5F3FF", border: "#8B5CF6", badge: "#6D28D9", text: "#4C1D95" },
};

const PRIORITY_COLORS = {
  HIGH: { bg: "#FEF2F2", text: "#DC2626", border: "#FCA5A5" },
  MED: { bg: "#FFFBEB", text: "#D97706", border: "#FCD34D" },
  LOW: { bg: "#F0FDF4", text: "#16A34A", border: "#86EFAC" },
};

export default function DocVersionControl() {
  const [activeTab, setActiveTab] = useState("documents");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedFile, setExpandedFile] = useState(null);
  const [systemStatuses, setSystemStatuses] = useState({});

  const totalReplacements = CHANGE_LOG.reduce((s, f) => s + f.totalReplacements, 0);
  const categories = ["All", ...Array.from(new Set(CHANGE_LOG.map(f => f.category)))];
  const filtered = selectedCategory === "All" ? CHANGE_LOG : CHANGE_LOG.filter(f => f.category === selectedCategory);
  const pendingSystemsHigh = PENDING_SYSTEMS.filter(s => s.priority === "HIGH" && !systemStatuses[`${s.system}-${s.item}`]).length;

  const toggleSystem = (key) => setSystemStatuses(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace", background: "#0A0F1E", minHeight: "100vh", color: "#E2E8F0", padding: "0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0F1629 0%, #1A2744 50%, #0F1629 100%)", borderBottom: "1px solid #1E3A5F", padding: "24px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
              <span style={{ color: "#64748B", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase" }}>Sentrais / NOVATELabs / BGI</span>
            </div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#F1F5F9", letterSpacing: "-0.5px" }}>
              Document Version Control
            </h1>
            <div style={{ color: "#64748B", fontSize: "12px", marginTop: "4px" }}>
              Entity Reference Migration · Run: 2026-06-08 13:33:28 · Change Set: BGI-REF-UPDATE-2026-v2.0
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { label: "Files Updated", value: CHANGE_LOG.length, color: "#3B82F6" },
              { label: "Replacements", value: totalReplacements, color: "#10B981" },
              { label: "Systems Pending", value: pendingSystemsHigh, color: pendingSystemsHigh > 0 ? "#F59E0B" : "#10B981" },
              { label: "Preserved", value: PRESERVED_FILES.length, color: "#8B5CF6" },
            ].map(stat => (
              <div key={stat.label} style={{ background: "#0D1526", border: `1px solid ${stat.color}33`, borderRadius: "8px", padding: "10px 16px", textAlign: "center", minWidth: "80px" }}>
                <div style={{ fontSize: "24px", fontWeight: "800", color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: "10px", color: "#64748B", marginTop: "3px", letterSpacing: "0.5px" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Substitution Rule Banner */}
        <div style={{ marginTop: "20px", background: "#0D1526", border: "1px solid #1E3A5F", borderRadius: "8px", padding: "12px 16px" }}>
          <div style={{ fontSize: "10px", color: "#64748B", letterSpacing: "1px", marginBottom: "8px" }}>APPLIED SUBSTITUTION RULES (ordered by specificity)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              ["N-OvateUS Foundation Inc", "NOVATELabs Inc"],
              ["NOVATEUS Foundation", "NOVATELabs Inc"],
              ["NovateUS Foundation", "NOVATELabs Inc"],
              ["NovateUS Programs", "BGI Programs"],
              ["NovateUS (standalone)", "NOVATELabs Inc"],
            ].map(([from, to]) => (
              <div key={from} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#111827", border: "1px solid #1F2937", borderRadius: "4px", padding: "4px 8px", fontSize: "11px" }}>
                <span style={{ color: "#EF4444", textDecoration: "line-through" }}>{from}</span>
                <span style={{ color: "#64748B" }}>→</span>
                <span style={{ color: "#10B981" }}>{to}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #1E3A5F", background: "#0A0F1E", padding: "0 32px", display: "flex", gap: "0" }}>
        {[
          { id: "documents", label: "Document Changes", count: CHANGE_LOG.length },
          { id: "systems", label: "System Updates", count: PENDING_SYSTEMS.length },
          { id: "preserved", label: "Preserved / Archived", count: PRESERVED_FILES.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "14px 20px",
              fontSize: "12px", letterSpacing: "0.5px",
              color: activeTab === tab.id ? "#60A5FA" : "#64748B",
              borderBottom: activeTab === tab.id ? "2px solid #3B82F6" : "2px solid transparent",
              fontFamily: "inherit", display: "flex", alignItems: "center", gap: "8px"
            }}
          >
            {tab.label}
            <span style={{ background: activeTab === tab.id ? "#1D4ED8" : "#1F2937", color: activeTab === tab.id ? "#93C5FD" : "#475569", borderRadius: "10px", padding: "1px 7px", fontSize: "10px" }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div style={{ padding: "24px 32px" }}>

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div>
            {/* Category filter */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: selectedCategory === cat ? "#1D4ED8" : "#0D1526",
                    border: `1px solid ${selectedCategory === cat ? "#3B82F6" : "#1E3A5F"}`,
                    color: selectedCategory === cat ? "#DBEAFE" : "#64748B",
                    borderRadius: "6px", padding: "6px 14px", fontSize: "11px",
                    cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.5px"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* File list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filtered.map((doc, i) => {
                const catStyle = CATEGORY_COLORS[doc.category] || CATEGORY_COLORS["ARI / Strategy"];
                const isExpanded = expandedFile === doc.file;
                return (
                  <div
                    key={doc.file}
                    style={{
                      background: isExpanded ? "#0D1526" : "#0D1526",
                      border: `1px solid ${isExpanded ? "#3B82F6" : "#1E3A5F"}`,
                      borderRadius: "8px", overflow: "hidden",
                      transition: "border-color 0.15s"
                    }}
                  >
                    <div
                      onClick={() => setExpandedFile(isExpanded ? null : doc.file)}
                      style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}
                    >
                      {/* Status dot */}
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", flexShrink: 0 }} />

                      {/* Version badge */}
                      <div style={{ display: "flex", gap: "4px", alignItems: "center", flexShrink: 0 }}>
                        <span style={{ background: "#1F2937", color: "#6B7280", fontSize: "10px", padding: "2px 6px", borderRadius: "3px", fontFamily: "inherit" }}>{doc.prevVersion}</span>
                        <span style={{ color: "#374151", fontSize: "10px" }}>→</span>
                        <span style={{ background: "#064E3B", color: "#6EE7B7", fontSize: "10px", padding: "2px 6px", borderRadius: "3px", fontFamily: "inherit" }}>{doc.version}</span>
                      </div>

                      {/* Filename */}
                      <div style={{ flex: 1, fontSize: "13px", color: "#CBD5E1", fontWeight: "500", wordBreak: "break-word" }}>
                        {doc.file}
                      </div>

                      {/* Category */}
                      <span style={{
                        background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}`,
                        fontSize: "10px", padding: "2px 8px", borderRadius: "4px", flexShrink: 0,
                        fontFamily: "inherit"
                      }}>
                        {doc.category}
                      </span>

                      {/* Count */}
                      <span style={{ background: "#1F2937", color: "#F59E0B", fontSize: "11px", padding: "2px 8px", borderRadius: "4px", flexShrink: 0, fontFamily: "inherit" }}>
                        {doc.totalReplacements} change{doc.totalReplacements !== 1 ? "s" : ""}
                      </span>

                      {/* Expand */}
                      <span style={{ color: "#374151", fontSize: "12px", flexShrink: 0 }}>{isExpanded ? "▲" : "▼"}</span>
                    </div>

                    {isExpanded && (
                      <div style={{ borderTop: "1px solid #1E3A5F", padding: "16px" }}>
                        <div style={{ fontSize: "10px", color: "#64748B", letterSpacing: "1px", marginBottom: "10px" }}>CHANGE DETAIL</div>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                          <thead>
                            <tr style={{ background: "#111827" }}>
                              {["Stale Reference Found", "Canonical Replacement", "Count"].map(h => (
                                <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#64748B", borderBottom: "1px solid #1E3A5F", fontWeight: "600", fontSize: "10px", letterSpacing: "0.5px" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {doc.replacements.map((r, j) => (
                              <tr key={j} style={{ borderBottom: "1px solid #111827" }}>
                                <td style={{ padding: "8px 12px", color: "#EF4444", fontFamily: "inherit" }}>
                                  <span style={{ textDecoration: "line-through" }}>{r.from}</span>
                                </td>
                                <td style={{ padding: "8px 12px", color: "#10B981", fontFamily: "inherit" }}>{r.to}</td>
                                <td style={{ padding: "8px 12px", color: "#F59E0B", fontFamily: "inherit" }}>{r.count}×</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{ marginTop: "10px", fontSize: "11px", color: "#475569" }}>
                          Processed: {doc.timestamp} · Output: updated_docs/{doc.file}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SYSTEMS TAB */}
        {activeTab === "systems" && (
          <div>
            <div style={{ background: "#1C1106", border: "1px solid #92400E", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", fontSize: "12px", color: "#FCD34D" }}>
              ⚠ These are manual updates that require action by system owners. Click to mark as complete.
            </div>

            {Array.from(new Set(PENDING_SYSTEMS.map(s => s.system))).map(sys => (
              <div key={sys} style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#64748B", marginBottom: "10px", textTransform: "uppercase" }}>{sys}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {PENDING_SYSTEMS.filter(s => s.system === sys).map(item => {
                    const key = `${item.system}-${item.item}`;
                    const done = systemStatuses[key];
                    const priStyle = PRIORITY_COLORS[item.priority];
                    return (
                      <div
                        key={key}
                        onClick={() => toggleSystem(key)}
                        style={{
                          background: done ? "#071811" : "#0D1526",
                          border: `1px solid ${done ? "#10B981" : "#1E3A5F"}`,
                          borderRadius: "6px", padding: "12px 16px", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap",
                          opacity: done ? 0.7 : 1, transition: "all 0.15s"
                        }}
                      >
                        <div style={{
                          width: "18px", height: "18px", borderRadius: "4px", flexShrink: 0,
                          background: done ? "#10B981" : "#111827",
                          border: `1px solid ${done ? "#10B981" : "#374151"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "11px", color: done ? "#fff" : "transparent"
                        }}>✓</div>

                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "12px", color: done ? "#6B7280" : "#CBD5E1", fontWeight: "500", textDecoration: done ? "line-through" : "none" }}>
                            {item.item}
                          </div>
                          <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ color: "#EF4444" }}>"{item.from}"</span>
                            <span>→</span>
                            <span style={{ color: "#10B981" }}>"{item.to}"</span>
                          </div>
                        </div>

                        <div style={{ fontSize: "11px", color: "#64748B" }}>Owner: {item.owner}</div>

                        <span style={{
                          background: done ? "#064E3B" : priStyle.bg,
                          color: done ? "#6EE7B7" : priStyle.text,
                          border: `1px solid ${done ? "#10B981" : priStyle.border}`,
                          fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
                          fontFamily: "inherit", flexShrink: 0
                        }}>
                          {done ? "DONE" : item.priority}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Progress */}
            <div style={{ marginTop: "24px", background: "#0D1526", border: "1px solid #1E3A5F", borderRadius: "8px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px" }}>
                <span style={{ color: "#94A3B8" }}>System Update Progress</span>
                <span style={{ color: "#60A5FA" }}>{Object.values(systemStatuses).filter(Boolean).length} / {PENDING_SYSTEMS.length} complete</span>
              </div>
              <div style={{ height: "6px", background: "#1F2937", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: "3px", background: "linear-gradient(90deg, #3B82F6, #10B981)",
                  width: `${(Object.values(systemStatuses).filter(Boolean).length / PENDING_SYSTEMS.length) * 100}%`,
                  transition: "width 0.3s"
                }} />
              </div>
            </div>
          </div>
        )}

        {/* PRESERVED TAB */}
        {activeTab === "preserved" && (
          <div>
            <div style={{ background: "#0D0A1F", border: "1px solid #4C1D95", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", fontSize: "12px", color: "#A78BFA" }}>
              🔒 These files contain stale entity names but must NOT be modified. They are executed legal instruments or official government filings. Preserve originals permanently.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {PRESERVED_FILES.map((pf, i) => (
                <div key={i} style={{ background: "#0D1526", border: "1px solid #2D1B69", borderRadius: "8px", padding: "14px 16px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "16px", flexShrink: 0 }}>🔒</div>
                  <div>
                    <div style={{ fontSize: "13px", color: "#C4B5FD", fontWeight: "500", marginBottom: "4px" }}>{pf.file}</div>
                    <div style={{ fontSize: "11px", color: "#6B7280" }}>{pf.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #1E3A5F", padding: "16px 32px", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#374151", flexWrap: "wrap", gap: "8px" }}>
        <span>Change Set: BGI-REF-UPDATE-2026-v2.0 · Scan Engine: Python regex · Files scanned: all project docs</span>
        <span style={{ color: "#10B981" }}>16 files updated · 23 replacements · 0 errors · 6 preserved</span>
      </div>
    </div>
  );
}

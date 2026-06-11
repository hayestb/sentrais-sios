// @ts-nocheck
import { useState } from "react";
import {
  ForgePage, ForgeHeader, ForgeTabs, ForgeContent,
  ForgeCard, ForgeCardHeader, ForgeCardBody,
  ForgeLabel, ForgeBadge, ForgeGrid, ForgeAlert, C,
} from "../components/ui/forge";

const RECORDS = [
  { id: "EVD-2026-0041", hash: "a3f9c2e1b7d84056f23a91c6e5d47b820f1e3c94a7d2b6e8f01c5943d27a8b4e", file: "SEG_Subcontract_v3_FINAL.pdf", entity: "Sentrais Corp", category: "Contract", size: "2.4 MB", ts: "2026-06-08 09:14:22", status: "VERIFIED", uploader: "TYE", notes: "SEG subcontract with step-in rights clause. CEO + Counsel only." },
  { id: "EVD-2026-0040", hash: "7b2d9e4f1a6c83075e24b10d7f86c3a9e5f2d814b9c6e20a3f47d5c81b02e9f3", file: "NFL_GDA_MSA_Executed.pdf", entity: "Sentrais Corp", category: "Contract", size: "5.1 MB", ts: "2026-05-22 14:33:07", status: "VERIFIED", uploader: "TYE", notes: "Master Services Agreement — NFL General Data Analytics. $475K Q1." },
  { id: "EVD-2026-0039", hash: "c8e5a3f2b9d70164g35a02e8b7f54c1d6e3f925a8b1c4d70e2f96a3b5c8d12e7", file: "BGI_Certificate_of_Incorporation_DE.pdf", entity: "BGI", category: "Formation", size: "312 KB", ts: "2026-06-09 11:02:44", status: "PENDING", uploader: "COUNSEL", notes: "Delaware COI — pending filing confirmation from registered agent." },
  { id: "EVD-2026-0038", hash: "f1b4d7e9c2a5086f43b2e9d7c15a8f4b6d23e891c7f50a2b4d6e8f01c3a5b7d9", file: "83b_Election_CertifiedMail_Receipt.pdf", entity: "Sentrais Corp", category: "Tax Filing", size: "145 KB", ts: "2026-06-28 00:00:00", status: "REQUIRED", uploader: "", notes: "⚠ IRREVOCABLE DEADLINE Jun 28. Must be filed certified mail." },
  { id: "EVD-2026-0037", hash: "9d2e5b8a1c4f7063e2a5b8d1c4f70630a1d4g7b0e3f6c9a2d5e8b1c4f7063e2a", file: "MetaData_Engagement_Agreement_v2.pdf", entity: "Sentrais Corp", category: "Contract", size: "1.8 MB", ts: "2026-05-15 16:47:39", status: "VERIFIED", uploader: "ERIN", notes: "Tenant B sandbox isolation — contractual condition active." },
  { id: "EVD-2026-0036", hash: "4a7e1b9f3c6d2085b4e7a1c9f2d5083b4e7a0c9f2d5086b4e7a1c8f3d5082b4e", file: "NOVATELabs_Articles_Amendment_DE.pdf", entity: "NOVATELabs Inc", category: "Formation", size: "278 KB", ts: "2026-04-03 10:22:15", status: "VERIFIED", uploader: "COUNSEL", notes: "PRESERVE — official state filing. Legal record, never alter." },
  { id: "EVD-2026-0035", hash: "b3d6e9a2c5f8014d3b6e9a2c5f8017d4b7e0a3c6f9014d2b5e8a1c4f7013d2b5", file: "IRS_EIN_Affirmation_NOVATELabs.pdf", entity: "NOVATELabs Inc", category: "Tax Filing", size: "89 KB", ts: "2026-02-14 09:55:30", status: "PENDING_RESPONSE", uploader: "COUNSEL", notes: "EIN 39-4510998. IRS affirmation letter outstanding since Feb 2026 — name change from NovateUS." },
  { id: "EVD-2026-0034", hash: "e2a5d8b1c4f7093e2a5d8b1c4f7096e2a5d8b0c4f7095e2a5d8b1c3f7092e2a5", file: "Founders_Stock_Split_200K_600K.pdf", entity: "Sentrais Corp", category: "Equity", size: "203 KB", ts: "2026-06-22 00:00:00", status: "SCHEDULED", uploader: "COUNSEL", notes: "200K Series A + 600K Series B. Coordinate with 83(b) — same week." },
  { id: "EVD-2026-0033", hash: "c1d4g7a0b3e6f9012c1d4g7a0b3e6f9015c2d5h8a1b4e7f0013c1d4g7a0b3e6f9", file: "M365_Tenant_Isolation_Test_Report.pdf", entity: "Sentrais Corp", category: "Compliance", size: "547 KB", ts: "2026-07-07 00:00:00", status: "REQUIRED", uploader: "ERIN", notes: "30-day isolation deadline. All 8 test scenarios must pass." },
  { id: "EVD-2026-0032", hash: "f0e3b6a9d2c5081f0e3b6a9d2c5084f1e4b7a0d3c6082f0e3b6a9d1c5080f0e3", file: "BGI_Independence_Opinion_Director1.pdf", entity: "BGI", category: "Governance", size: "156 KB", ts: "2026-07-01 00:00:00", status: "PENDING", uploader: "COUNSEL", notes: "Written independence opinion required before Director Seat 1 offer." },
];

const VERIFICATIONS = [
  { id: "VER-2026-0089", evidenceId: "EVD-2026-0041", ts: "2026-06-08 09:15:03", verifier: "SYSTEM", result: "MATCH", note: "Hash computed at upload. SHA-256 integrity confirmed." },
  { id: "VER-2026-0088", evidenceId: "EVD-2026-0040", ts: "2026-05-22 14:33:45", verifier: "SYSTEM", result: "MATCH", note: "Hash computed at upload." },
  { id: "VER-2026-0087", evidenceId: "EVD-2026-0036", ts: "2026-06-01 08:00:00", verifier: "TYE", result: "MATCH", note: "Manual re-verification. Preserved document integrity confirmed." },
  { id: "VER-2026-0086", evidenceId: "EVD-2026-0035", ts: "2026-05-20 11:30:00", verifier: "COUNSEL", result: "MATCH", note: "EIN affirmation letter integrity check." },
];

const CATEGORIES = ["All", "Contract", "Formation", "Tax Filing", "Equity", "Compliance", "Governance"];

const STATUS_META = {
  VERIFIED:         { label: "Verified",          variant: "success" },
  PENDING:          { label: "Pending",            variant: "warning" },
  REQUIRED:         { label: "Action Required",   variant: "danger" },
  PENDING_RESPONSE: { label: "Awaiting Response", variant: "info" },
  SCHEDULED:        { label: "Scheduled",         variant: "neutral" },
};

const TABS = ["Evidence Records", "Verification Log", "Chain of Custody", "Upload Queue"];

export function EvidenceLedger() {
  const [tab, setTab] = useState(0);
  const [category, setCategory] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = category === "All" ? RECORDS : RECORDS.filter(r => r.category === category);
  const verified = RECORDS.filter(r => r.status === "VERIFIED").length;
  const required = RECORDS.filter(r => r.status === "REQUIRED").length;

  return (
    <ForgePage>
      <ForgeHeader
        icon="🔐"
        title="Evidence Ledger"
        subtitle="SHA-256 document integrity chain — Sentrais / NOVATELabs / BGI"
        stats={[
          { label: "Records", value: String(RECORDS.length) },
          { label: "Verified", value: String(verified) },
          { label: "Action Required", value: String(required) },
          { label: "Verifications", value: String(VERIFICATIONS.length) },
        ]}
      />
      <ForgeTabs tabs={TABS} active={tab} onChange={setTab} />
      <ForgeContent>

        {tab === 0 && (
          <div>
            {required > 0 && (
              <ForgeAlert level="critical" title={`${required} record(s) require immediate action`}>
                Time-sensitive filings must be executed before their deadlines. Review items marked "Action Required" below.
              </ForgeAlert>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16, marginBottom: 20 }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} style={{
                  padding: "5px 13px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                  background: category === cat ? C.accent : C.surface,
                  border: `1px solid ${category === cat ? C.accent : C.border}`,
                  color: category === cat ? "#fff" : "#94a3b8",
                }}>{cat}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map(rec => {
                const sm = STATUS_META[rec.status] || STATUS_META.PENDING;
                const isEx = expanded === rec.id;
                return (
                  <div key={rec.id} onClick={() => setExpanded(isEx ? null : rec.id)}
                    style={{
                      background: C.surface, border: `1px solid ${isEx ? C.accent : C.border}`,
                      borderRadius: 10, overflow: "hidden", cursor: "pointer",
                    }}>
                    <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: rec.status === "VERIFIED" ? C.green : rec.status === "REQUIRED" ? C.red : C.amber, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace", flexShrink: 0 }}>{rec.id}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{rec.file}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                          {rec.entity} · {rec.category} · {rec.size}
                        </div>
                      </div>
                      <ForgeBadge variant={sm.variant}>{sm.label}</ForgeBadge>
                      <span style={{ fontSize: 11, color: "#4a6080" }}>{isEx ? "▲" : "▼"}</span>
                    </div>
                    {isEx && (
                      <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 16px", background: "#06101f" }}>
                        <div style={{ marginBottom: 10 }}>
                          <ForgeLabel style={{ marginBottom: 4 }}>SHA-256 Hash</ForgeLabel>
                          <div style={{ fontFamily: "monospace", fontSize: 11, color: C.teal, background: C.bg, padding: "8px 12px", borderRadius: 6, wordBreak: "break-all", border: `1px solid ${C.border}` }}>
                            {rec.hash}
                          </div>
                        </div>
                        <ForgeGrid cols={3}>
                          <div><ForgeLabel>Timestamp</ForgeLabel><div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{rec.ts}</div></div>
                          <div><ForgeLabel>Uploaded By</ForgeLabel><div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{rec.uploader || "—"}</div></div>
                          <div><ForgeLabel>Entity</ForgeLabel><div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{rec.entity}</div></div>
                        </ForgeGrid>
                        {rec.notes && (
                          <div style={{ marginTop: 10, fontSize: 12, color: rec.status === "REQUIRED" ? "#fbbf24" : "#64748b", background: rec.status === "REQUIRED" ? "rgba(251,191,36,0.05)" : "transparent", padding: rec.status === "REQUIRED" ? "8px 10px" : 0, borderRadius: 6, border: rec.status === "REQUIRED" ? `1px solid rgba(251,191,36,0.2)` : "none" }}>
                            {rec.notes}
                          </div>
                        )}
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
            <ForgeAlert level="info" title="Verification Protocol">
              All documents are SHA-256 hashed at upload. System-level verifications run automatically. Manual verifications require the uploader's authorization code.
            </ForgeAlert>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
              {VERIFICATIONS.map(v => {
                const rec = RECORDS.find(r => r.id === v.evidenceId);
                return (
                  <div key={v.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: v.result === "MATCH" ? C.green : C.red, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace", flexShrink: 0 }}>{v.id}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "#e2e8f0" }}>{rec?.file || v.evidenceId}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{v.ts} · Verifier: {v.verifier}</div>
                    </div>
                    <ForgeBadge variant={v.result === "MATCH" ? "success" : "danger"}>{v.result}</ForgeBadge>
                    <div style={{ fontSize: 11, color: "#64748b", maxWidth: 220, textAlign: "right" }}>{v.note}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 2 && (
          <div>
            <ForgeAlert level="info" title="Chain of Custody">
              Documents flow through: Upload → Hash Generation → Entity Assignment → Verification → Archival. Each step is timestamped and attributed.
            </ForgeAlert>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 20 }}>
              {RECORDS.map(rec => (
                <div key={rec.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace", flexShrink: 0, minWidth: 130 }}>{rec.id}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#e2e8f0" }}>{rec.file}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
                      {["Upload", "Hash", "Assign", "Verify"].map((step, i) => (
                        <span key={step} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{
                            fontSize: 10, padding: "2px 8px", borderRadius: 4,
                            background: (rec.status === "VERIFIED" || i < 3) ? "rgba(16,185,129,0.1)" : "rgba(100,116,139,0.1)",
                            color: (rec.status === "VERIFIED" || i < 3) ? C.green : "#64748b",
                            border: `1px solid ${(rec.status === "VERIFIED" || i < 3) ? "rgba(16,185,129,0.2)" : "rgba(100,116,139,0.2)"}`,
                          }}>{step}</span>
                          {i < 3 && <span style={{ color: "#4a6080", fontSize: 10 }}>→</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{rec.ts}</div>
                    <div style={{ fontSize: 11, color: "#4a6080", marginTop: 2 }}>{rec.entity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 3 && (
          <div>
            <ForgeAlert level="warning" title="Upload Queue">
              Documents pending hash generation and entity assignment. Firestore integration required for live submissions.
            </ForgeAlert>
            <ForgeCard style={{ marginTop: 20 }}>
              <ForgeCardBody>
                <div style={{ textAlign: "center", padding: "40px 0", color: "#4a6080" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔗</div>
                  <div style={{ fontSize: 14, color: "#64748b" }}>Firestore upload integration pending</div>
                  <div style={{ fontSize: 12, color: "#4a6080", marginTop: 6 }}>Connect Firebase Storage to enable drag-and-drop document hashing</div>
                </div>
              </ForgeCardBody>
            </ForgeCard>
          </div>
        )}

      </ForgeContent>
    </ForgePage>
  );
}

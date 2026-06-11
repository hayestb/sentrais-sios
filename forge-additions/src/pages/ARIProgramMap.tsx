import { useState } from "react";

const PILLARS = [
  {
    num: 1, code: "P1", name: "Civic Resilience", pct: 70,
    color: "#1B4F8A", light: "#EBF2FF", accent: "#2B6CB0",
    mission: "Increase Atlanta's ability to prepare for, withstand, respond to, and recover from disruption at the city, neighborhood, and institutional level.",
    pilot: "Atlanta Readiness Roundtable", pilotBudget: "$25,000", pilotTiming: "Q3 2026",
    atl2076: ["Prepare"],
    programs: [
      { name: "Atlanta Readiness Roundtable", entity: "NOVATELabs Inc", status: "Pilot — Active", priority: "Critical", pool: "Program Capital" },
      { name: "City Readiness Program", entity: "NOVATELabs Inc", status: "Development", priority: "High", pool: "Program Capital" },
      { name: "CivicSync", entity: "Sentrais Corp", status: "Platform Active", priority: "Critical", pool: "Commercial" },
      { name: "NCICC Knowledge Center", entity: "NOVATELabs Inc", status: "Active", priority: "High", pool: "Research Capital" },
      { name: "Host City Readiness", entity: "Sentrais Corp", status: "Active — NFL/FIFA", priority: "Critical", pool: "Commercial" },
      { name: "Critical Infrastructure Coalition", entity: "NOVATELabs Inc", status: "Planned", priority: "High", pool: "Program Capital" },
      { name: "Atlanta360 Community Resilience", entity: "BGI / NOVATELabs", status: "Concept", priority: "Medium", pool: "Mission Capital" },
    ],
    kpis: ["Community Readiness Score", "50+ Roundtable orgs by Yr 2", "4 simulation exercises/yr", "15% response time improvement"],
    funding: ["FEMA Preparedness Grants", "Municipal contracts", "Delta / UPS / Cox sponsorships", "Blank Family Foundation"],
    assets: ["NCICC playbook", "CivicGrid platform", "EVERGAME platform", "NFL readiness methodology"],
    gaps: "Civic Resilience Lead hire; Atlanta Readiness Roundtable formal launch",
  },
  {
    num: 2, code: "P2", name: "Innovation Equity", pct: 60,
    color: "#276749", light: "#E6FFFA", accent: "#2F855A",
    mission: "Ensure every Atlanta resident — regardless of neighborhood, income, age, or circumstance — can participate in, benefit from, and contribute to the innovation economy.",
    pilot: "Community Innovation Lab — Cascade / partner location", pilotBudget: "$30,000", pilotTiming: "Q4 2026",
    atl2076: ["Prosper"],
    programs: [
      { name: "NOVATELabs Innovation Lab", entity: "NOVATELabs Inc", status: "Concept — Priority", priority: "High", pool: "Research Capital" },
      { name: "Community Innovation Labs", entity: "NOVATELabs Inc", status: "Planned — Q4", priority: "High", pool: "Research Capital" },
      { name: "Responsible AI Initiative", entity: "NOVATELabs Inc", status: "Active", priority: "Critical", pool: "Research Capital" },
      { name: "Emerging Technology Fellows", entity: "BGI / NOVATELabs", status: "Planned", priority: "High", pool: "Mission Capital" },
      { name: "Innovation Equity Research", entity: "NOVATELabs Inc", status: "Development", priority: "Medium", pool: "Research Capital" },
      { name: "AI Literacy for Communities", entity: "BGI", status: "Pilot — see P4", priority: "High", pool: "Mission Capital" },
      { name: "Digital Equity Access Program", entity: "NOVATELabs Inc", status: "Planned", priority: "Medium", pool: "Research Capital" },
    ],
    kpis: ["500 lab participants/yr by Yr 2", "2 AI frameworks published/yr", "10 Emerging Tech Fellows/yr", "3 lab locations by Yr 3"],
    funding: ["Microsoft Philanthropies", "Google.org", "AWS Community Fund", "NSF BPC Grants", "IBM Corporate Citizenship"],
    assets: ["APS curriculum relationships", "Responsible AI frameworks", "NOVATELabs brand", "SIPE/FORGE research application"],
    gaps: "Community Innovation Lab physical location; Responsible AI published framework",
  },
  {
    num: 3, code: "P3", name: "Future Workforce", pct: 80,
    color: "#7B3F00", light: "#FFFAF0", accent: "#C05621",
    mission: "Build structured pathways from learning to employment for Atlanta's next generation of technology workers. Most developed pillar — shovel-ready pending BGI board seating and EIN.",
    pilot: "Barbara Geter Civic Technology Fellowship — 10–15 fellows", pilotBudget: "$186,000 (stipends + leadership)", pilotTiming: "Q4 2026 — pending BGI EIN",
    atl2076: ["Prosper"],
    programs: [
      { name: "Barbara Geter Civic Tech Fellowship", entity: "BGI", status: "Active — Forming", priority: "Critical", pool: "Mission Capital" },
      { name: "MEIX High School Track", entity: "BGI", status: "Planned — Grades 10–12", priority: "High", pool: "Mission Capital" },
      { name: "Undergraduate Internship Track", entity: "BGI", status: "Active framework", priority: "High", pool: "Mission Capital" },
      { name: "Industry Mentor Network", entity: "BGI / NOVATELabs", status: "Development", priority: "High", pool: "Mission Capital" },
      { name: "Workforce Placement Program", entity: "BGI", status: "Planned", priority: "Medium", pool: "Mission Capital" },
      { name: "Summer Cohort Operations", entity: "BGI", status: "Framework complete", priority: "Critical", pool: "Mission Capital" },
      { name: "Employer Readiness Pipeline", entity: "NOVATELabs Inc", status: "Planned", priority: "Medium", pool: "Program Capital" },
    ],
    kpis: ["85% fellow placement within 6 mo", "20 undergrad interns/summer by Yr 2", "50 HS students/yr by Yr 2", "100+ mentor network members"],
    funding: ["DOL WIOA Title I", "Microsoft / Google / Delta sponsorships", "Blank Family Foundation", "NSF Education Research"],
    assets: ["Fellowship framework — complete", "FLSA analysis done", "BGI governance package complete", "Option D curriculum model approved"],
    gaps: "🔴 GATE: BGI board seating + EIN required before first cohort announced",
  },
  {
    num: 4, code: "P4", name: "Education & Lifelong Learning", pct: 50,
    color: "#553C9A", light: "#FAF5FF", accent: "#6B46C1",
    mission: "Create lifelong learning opportunities for every generation of Atlanta residents, with a focus on digital equity, AI literacy, and leadership development. The Dual-Generation Digital Literacy pilot is the strongest community impact story across all seven pillars.",
    pilot: "Dual-Generation Digital Literacy — students + seniors paired", pilotBudget: "$40,000", pilotTiming: "Q1 2027",
    atl2076: ["Prosper", "Preserve"],
    programs: [
      { name: "Student Digital Literacy Program", entity: "BGI / NOVATELabs", status: "Planned", priority: "High", pool: "Mission Capital" },
      { name: "Senior Digital Literacy Program", entity: "BGI / NOVATELabs", status: "Planned", priority: "High", pool: "Mission Capital" },
      { name: "Dual-Generation Digital Literacy", entity: "BGI", status: "Pilot — Q1 2027", priority: "High", pool: "Mission Capital" },
      { name: "AI Literacy for Communities", entity: "BGI / NOVATELabs", status: "Development", priority: "High", pool: "Research Capital" },
      { name: "Leadership Development Institute", entity: "NOVATELabs Inc", status: "Planned", priority: "Medium", pool: "Program Capital" },
      { name: "Community Learning Series", entity: "NOVATELabs Inc", status: "Planned", priority: "Medium", pool: "Mission Capital" },
      { name: "ARI Certification Pathway", entity: "NOVATELabs Inc", status: "Concept", priority: "Low", pool: "Program Capital" },
    ],
    kpis: ["1,000 digital literacy participants/yr by Yr 3", "50 Dual-Gen pairs in Yr 1", "200 AI literacy completions/yr by Yr 2", "25% senior digital equity improvement"],
    funding: ["Title IV Education grants", "AT&T / Comcast digital equity", "AARP Foundation", "GA Broadband Strategy grants", "Community Foundation for Greater Atlanta"],
    assets: ["APS curriculum experience", "Sentrais Certification Framework (donated at $0 cost)", "NOVATELabs Academy frameworks", "Multigenerational program design concepts"],
    gaps: "Workforce & Education Lead hire; Dual-Gen Digital Literacy curriculum development",
  },
  {
    num: 5, code: "P5", name: "Economic Mobility", pct: 40,
    color: "#B7410E", light: "#FFF5F5", accent: "#C53030",
    mission: "Increase wealth creation, ownership, and economic participation for Atlanta's underrepresented communities. Most underdeveloped pillar (40%) with highest transformative potential when linked to Converge and major event economic activation.",
    pilot: "Atlanta Small Business Readiness Accelerator", pilotBudget: "$50,000", pilotTiming: "Q1 2027 — pre-FIFA supplier window",
    atl2076: ["Prosper"],
    programs: [
      { name: "Small Business Accelerator", entity: "NOVATELabs Inc", status: "Pilot Planned — Q1 2027", priority: "High", pool: "Program Capital" },
      { name: "Supplier Readiness Program", entity: "NOVATELabs Inc", status: "Development", priority: "High", pool: "Program Capital" },
      { name: "Entrepreneurship Academy", entity: "NOVATELabs Inc", status: "Planned", priority: "Medium", pool: "Program Capital" },
      { name: "Community Ownership Research", entity: "NOVATELabs Inc", status: "Planned", priority: "Medium", pool: "Research Capital" },
      { name: "Economic Mobility Dashboard", entity: "NOVATELabs Inc", status: "Concept", priority: "Medium", pool: "Research Capital" },
      { name: "Converge Atlanta (P5/P6)", entity: "BGI / NOVATELabs", status: "Active Pilot", priority: "Critical", pool: "Program Capital" },
      { name: "Supplier Diversity Clearinghouse", entity: "NOVATELabs Inc", status: "Concept", priority: "Low", pool: "Program Capital" },
    ],
    kpis: ["50 businesses accelerated/yr by Yr 2", "25 supplier certifications/yr", "$2M+ revenue impact by Yr 3", "10+ FIFA 2026 contracts won"],
    funding: ["SBA 7(j) Technical Assistance", "HUD CDBG grants", "Invest Atlanta", "Delta / UPS / Coca-Cola supplier diversity", "FIFA Host Committee Community Fund"],
    assets: ["Converge Atlanta concept and activation framework", "Supplier diversity engagement experience", "Innovation hub and entrepreneurship program concepts"],
    gaps: "🔴 Economic Mobility Lead hire required; Small Business Accelerator curriculum; corporate supplier diversity partnerships",
  },
  {
    num: 6, code: "P6", name: "Sports, Culture & Major Events", pct: 85,
    color: "#1A5276", light: "#EBF5FB", accent: "#2874A6",
    mission: "Use Atlanta's position as a global sports and entertainment capital to catalyze community transformation, economic inclusion, and civic pride. Most commercially connected pillar — bridge between ARI's civic mission and commercial revenue ecosystem.",
    pilot: "Converge Atlanta — FIFA readiness + cultural activation", pilotBudget: "$75,000", pilotTiming: "Q2 2027 — aligned to FIFA 2026 window",
    atl2076: ["Preserve", "Prosper"],
    programs: [
      { name: "Converge Atlanta", entity: "BGI / NOVATELabs", status: "Active — pilot stage", priority: "Critical", pool: "Program Capital" },
      { name: "FIFA 2026 Legacy Program", entity: "NOVATELabs Inc / BGI", status: "Active planning", priority: "Critical", pool: "Program Capital" },
      { name: "NFL Community Programs", entity: "NOVATELabs Inc", status: "Active (via Sentrais)", priority: "Critical", pool: "Commercial + Program Capital" },
      { name: "Sports Workforce Pipeline", entity: "BGI", status: "Planned", priority: "High", pool: "Mission Capital" },
      { name: "Cultural Innovation Series", entity: "NOVATELabs Inc", status: "Planned", priority: "Medium", pool: "Program Capital" },
      { name: "Major Event Readiness Lab", entity: "NOVATELabs / Sentrais", status: "Active", priority: "Critical", pool: "Research + Commercial" },
      { name: "Super Bowl Legacy Program", entity: "NOVATELabs Inc / BGI", status: "Pipeline (future)", priority: "High", pool: "Program Capital" },
    ],
    kpis: ["5,000 Converge attendees/event by Yr 2", "100+ community businesses activated by FIFA", "50 sports workforce placements/yr", "$500K+ legacy commitments by Yr 3"],
    funding: ["NFL Foundation", "FIFA Foundation", "Delta / Coca-Cola / AT&T", "FIFA Host Committee", "Blank Family Foundation", "City of Atlanta legacy funding"],
    assets: ["EVERGAME platform (commercial IP)", "NFL engagement history + methodology", "FIFA host city frameworks", "Converge Atlanta brand", "Sentrais SIPE/FORGE operational intelligence"],
    gaps: "🔴 Sports & Community Impact Lead hire; Converge Atlanta formal event structure",
  },
  {
    num: 7, code: "P7", name: "Institutional Memory & Civic Intelligence", pct: 30,
    color: "#4A235A", light: "#FAF5FF", accent: "#6B46C1",
    mission: "Preserve Atlanta's knowledge, history, and institutional wisdom for future generations — and generate civic intelligence for better decision-making. Least developed pillar but may become ARI's most differentiated and irreplaceable asset.",
    pilot: "Atlanta Oral History Project — civil rights, Olympics, COVID, NCICC histories", pilotBudget: "$40,000 (100–150 archivist hours)", pilotTiming: "Q2 2027",
    atl2076: ["Preserve"],
    programs: [
      { name: "Atlanta Resilience Archive", entity: "NOVATELabs Inc", status: "Pilot Planned — Q2 2027", priority: "High", pool: "Research Capital" },
      { name: "Civic Intelligence Repository", entity: "NOVATELabs Inc", status: "Development", priority: "High", pool: "Research Capital" },
      { name: "Atlanta Oral History Project", entity: "NOVATELabs Inc", status: "Pilot Planned — Q2 2027", priority: "High", pool: "Research Capital" },
      { name: "Atlanta Lessons Learned Program", entity: "NOVATELabs Inc", status: "Development", priority: "Medium", pool: "Research Capital" },
      { name: "Civic Intelligence Fellows", entity: "BGI", status: "Planned", priority: "Medium", pool: "Mission Capital" },
      { name: "ARI Evidence Ledger", entity: "NOVATELabs / Sentrais", status: "Active (commercial IP)", priority: "High", pool: "Research Capital" },
      { name: "Atlanta 2076 State of City Report", entity: "NOVATELabs Inc", status: "Annual — Yr 1 Priority", priority: "Critical", pool: "Research Capital" },
    ],
    kpis: ["50 oral histories in Yr 1; 200 by Yr 3", "500 archive items by Yr 2", "1 State of City report/yr", "4 major events documented/yr"],
    funding: ["NEH oral history grants", "IMLS community archive programs", "Woodruff Foundation", "Atlanta History Center partnership", "University research partnerships"],
    assets: ["FORGE Evidence Ledger technology (licensed from RRH)", "NCICC documentation", "Founder playbooks and methodologies", "Sentrais crisis-response methodologies"],
    gaps: "External archivist contract required; archive platform; Atlanta Oral History Project formal launch",
  },
];

const STATUS_COLORS = {
  "Critical": { bg: "#FEF2F2", text: "#DC2626", border: "#FCA5A5" },
  "High": { bg: "#FFF7ED", text: "#D97706", border: "#FCD34D" },
  "Medium": { bg: "#F0FDF4", text: "#16A34A", border: "#86EFAC" },
  "Low": { bg: "#F9FAFB", text: "#6B7280", border: "#D1D5DB" },
};

const ENTITY_COLORS = {
  "NOVATELabs Inc": "#1B4F8A",
  "BGI": "#C05621",
  "BGI / NOVATELabs": "#7B3F00",
  "Sentrais Corp": "#1A5276",
  "NOVATELabs Inc / BGI": "#553C9A",
  "NOVATELabs / Sentrais": "#276749",
  "BGI / NOVATELabs Inc": "#7B3F00",
  "Commercial Services": "#374151",
};

const ATL_COLORS = {
  "Preserve": { bg: "#FEF9EC", text: "#92400E", border: "#F59E0B" },
  "Prepare": { bg: "#EBF4FF", text: "#1E40AF", border: "#3B82F6" },
  "Prosper": { bg: "#ECFDF5", text: "#065F46", border: "#10B981" },
};

export default function ARIProgramMap() {
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [view, setView] = useState("overview"); // overview | detail | matrix
  const [filterEntity, setFilterEntity] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const pillar = selectedPillar !== null ? PILLARS[selectedPillar] : null;

  const allPrograms = PILLARS.flatMap(p => p.programs.map(prog => ({ ...prog, pillar: p })));
  const entities = ["All", ...Array.from(new Set(allPrograms.map(p => p.entity)))];
  const statuses = ["All", "Critical", "High", "Medium", "Low"];

  const filteredPrograms = allPrograms.filter(p =>
    (filterEntity === "All" || p.entity === filterEntity) &&
    (filterStatus === "All" || p.priority === filterStatus)
  );

  const totalPrograms = allPrograms.length;
  const criticalCount = allPrograms.filter(p => p.priority === "Critical").length;

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#F8F7F4", minHeight: "100vh", color: "#1A1A2E" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1B3A6E 0%, #2C5282 60%, #1B4F8A 100%)", color: "white", padding: "28px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#93C5FD", marginBottom: "6px", fontFamily: "Arial, sans-serif" }}>ATLANTA RESILIENCE INSTITUTE</div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "700", letterSpacing: "-0.5px" }}>Seven Pillar Program Map</h1>
            <div style={{ color: "#BFDBFE", fontSize: "13px", marginTop: "4px", fontFamily: "Arial, sans-serif" }}>
              Preserve · Prepare · Prosper · Atlanta 2076 · ARI-PROG-MAP-2026-v1.0
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              { label: "Pillars", val: 7 }, { label: "Programs", val: totalPrograms },
              { label: "Critical", val: criticalCount }, { label: "Cross-Pillar", val: 3 }
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: "8px", padding: "10px 16px", textAlign: "center", minWidth: "64px" }}>
                <div style={{ fontSize: "22px", fontWeight: "800", lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: "10px", color: "#BFDBFE", fontFamily: "Arial, sans-serif", marginTop: "2px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* View tabs */}
        <div style={{ display: "flex", gap: "4px", marginTop: "20px" }}>
          {[["overview", "Pillar Overview"], ["detail", "Program Detail"], ["matrix", "Program Matrix"]].map(([v, label]) => (
            <button key={v} onClick={() => { setView(v); setSelectedPillar(null); }}
              style={{ background: view === v ? "rgba(255,255,255,0.2)" : "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "white", padding: "6px 14px", fontSize: "12px", cursor: "pointer", fontFamily: "Arial, sans-serif", fontWeight: view === v ? "600" : "400" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 32px" }}>

        {/* ── OVERVIEW ── */}
        {view === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
              {PILLARS.map((p, i) => (
                <div key={p.num} onClick={() => { setSelectedPillar(i); setView("detail"); }}
                  style={{ background: "white", borderRadius: "12px", border: `1px solid ${p.color}33`, overflow: "hidden", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
                >
                  {/* Card top stripe */}
                  <div style={{ background: p.color, padding: "14px 16px" }}>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", fontFamily: "Arial, sans-serif", letterSpacing: "2px", marginBottom: "4px" }}>PILLAR {p.num}</div>
                    <div style={{ color: "white", fontWeight: "700", fontSize: "16px", fontFamily: "Arial, sans-serif" }}>{p.name}</div>
                  </div>

                  <div style={{ padding: "14px 16px" }}>
                    {/* Readiness bar */}
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#6B7280", marginBottom: "4px", fontFamily: "Arial, sans-serif" }}>
                        <span>Asset Readiness</span><span style={{ color: p.color, fontWeight: "700" }}>{p.pct}%</span>
                      </div>
                      <div style={{ height: "5px", background: "#E5E7EB", borderRadius: "3px" }}>
                        <div style={{ height: "100%", width: `${p.pct}%`, background: p.color, borderRadius: "3px", transition: "width 0.5s" }} />
                      </div>
                    </div>

                    {/* Programs count */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                      <span style={{ background: p.light, color: p.color, fontSize: "11px", padding: "2px 8px", borderRadius: "4px", fontFamily: "Arial, sans-serif", fontWeight: "600" }}>
                        {p.programs.length} programs
                      </span>
                      {p.programs.filter(pr => pr.priority === "Critical").length > 0 && (
                        <span style={{ background: "#FEF2F2", color: "#DC2626", fontSize: "11px", padding: "2px 8px", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}>
                          {p.programs.filter(pr => pr.priority === "Critical").length} critical
                        </span>
                      )}
                      {p.atl2076.map(a => (
                        <span key={a} style={{ background: ATL_COLORS[a].bg, color: ATL_COLORS[a].text, fontSize: "11px", padding: "2px 8px", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}>{a}</span>
                      ))}
                    </div>

                    {/* Pilot */}
                    <div style={{ fontSize: "12px", color: "#6B7280", fontStyle: "italic", borderTop: "1px solid #F3F4F6", paddingTop: "8px" }}>
                      Pilot: {p.pilot}
                    </div>

                    {/* Gap flag */}
                    {p.gaps.includes("🔴") && (
                      <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "4px", padding: "6px 10px", marginTop: "8px", fontSize: "11px", color: "#DC2626", fontFamily: "Arial, sans-serif" }}>
                        {p.gaps.replace("🔴 ", "")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Cross-pillar */}
            <div style={{ marginTop: "24px", background: "white", borderRadius: "12px", border: "1px solid #E5E7EB", padding: "20px 24px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#1B3A6E", fontFamily: "Arial, sans-serif", marginBottom: "12px" }}>CROSS-PILLAR PROGRAMS</div>
              {[
                { name: "NOVATELabs Inc (Research Engine)", pillars: "P1 · P2 · P5 · P6 · P7", entity: "NOVATELabs Inc", note: "ARI's research and innovation operating arm — not a program but the infrastructure through which multiple pillars execute" },
                { name: "Barbara Geter Civic Technology Fellowship", pillars: "P2 · P3 · P4 · P5", entity: "BGI", note: "Flagship workforce program — innovation skills (P2), credentials (P3), learning (P4), economic mobility (P5). Gate: BGI EIN required." },
                { name: "Converge Atlanta", pillars: "P1 · P3 · P5 · P6", entity: "BGI / NOVATELabs", note: "Civic activation platform — turns every major Atlanta event into community transformation. $75K pilot budget. FIFA 2026 anchor." },
              ].map(cp => (
                <div key={cp.name} style={{ display: "flex", gap: "14px", padding: "12px 0", borderBottom: "1px solid #F3F4F6", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "3px", fontFamily: "Arial, sans-serif" }}>{cp.name}</div>
                    <div style={{ fontSize: "12px", color: "#6B7280", fontStyle: "italic" }}>{cp.note}</div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <div style={{ background: "#EBF2FF", color: "#1B4F8A", fontSize: "11px", padding: "2px 8px", borderRadius: "4px", fontFamily: "Arial, sans-serif", marginBottom: "4px" }}>{cp.pillars}</div>
                    <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "Arial, sans-serif" }}>{cp.entity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DETAIL ── */}
        {view === "detail" && (
          <div>
            {/* Pillar selector */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
              {PILLARS.map((p, i) => (
                <button key={p.num} onClick={() => setSelectedPillar(i)}
                  style={{ background: selectedPillar === i ? p.color : "white", color: selectedPillar === i ? "white" : p.color, border: `2px solid ${p.color}`, borderRadius: "8px", padding: "6px 14px", fontSize: "12px", cursor: "pointer", fontFamily: "Arial, sans-serif", fontWeight: "600", transition: "all 0.15s" }}>
                  P{p.num}
                </button>
              ))}
            </div>

            {pillar ? (
              <div>
                {/* Pillar header */}
                <div style={{ background: pillar.color, color: "white", borderRadius: "12px", padding: "20px 24px", marginBottom: "20px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "2px", color: "rgba(255,255,255,0.7)", fontFamily: "Arial, sans-serif", marginBottom: "4px" }}>PILLAR {pillar.num} · {pillar.pct}% READY</div>
                  <div style={{ fontSize: "24px", fontWeight: "700", fontFamily: "Arial, sans-serif", marginBottom: "8px" }}>{pillar.name}</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>{pillar.mission}</div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                    {pillar.atl2076.map(a => <span key={a} style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: "11px", padding: "2px 10px", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}>Atlanta 2076: {a}</span>)}
                    <span style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: "11px", padding: "2px 10px", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}>Pilot Budget: {pillar.pilotBudget}</span>
                    <span style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: "11px", padding: "2px 10px", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}>Timing: {pillar.pilotTiming}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  {/* Funding */}
                  <div style={{ background: "white", borderRadius: "10px", border: "1px solid #E5E7EB", padding: "16px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "1px", color: "#6B7280", fontFamily: "Arial, sans-serif", marginBottom: "10px" }}>FUNDING SOURCES</div>
                    {pillar.funding.map(f => <div key={f} style={{ fontSize: "13px", padding: "4px 0", borderBottom: "1px solid #F9FAFB", display: "flex", alignItems: "center", gap: "6px" }}><span style={{ color: pillar.accent }}>•</span>{f}</div>)}
                  </div>
                  {/* KPIs */}
                  <div style={{ background: "white", borderRadius: "10px", border: "1px solid #E5E7EB", padding: "16px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "1px", color: "#6B7280", fontFamily: "Arial, sans-serif", marginBottom: "10px" }}>IMPACT KPIs</div>
                    {pillar.kpis.map(k => <div key={k} style={{ fontSize: "13px", padding: "4px 0", borderBottom: "1px solid #F9FAFB", display: "flex", alignItems: "center", gap: "6px" }}><span style={{ color: pillar.accent }}>✓</span>{k}</div>)}
                  </div>
                </div>

                {/* Programs table */}
                <div style={{ background: "white", borderRadius: "10px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
                  <div style={{ background: pillar.light, padding: "12px 16px", borderBottom: "1px solid #E5E7EB" }}>
                    <div style={{ fontWeight: "700", fontSize: "13px", color: pillar.color, fontFamily: "Arial, sans-serif" }}>Programs ({pillar.programs.length})</div>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#F9FAFB" }}>
                        {["Program", "Entity", "Status", "Priority", "Capital Pool"].map(h => (
                          <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#6B7280", fontWeight: "600", fontSize: "11px", letterSpacing: "0.5px", borderBottom: "1px solid #E5E7EB", fontFamily: "Arial, sans-serif" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pillar.programs.map((prog, i) => {
                        const pc = STATUS_COLORS[prog.priority] || STATUS_COLORS["Low"];
                        return (
                          <tr key={prog.name} style={{ background: i % 2 === 0 ? "white" : "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                            <td style={{ padding: "10px 12px", fontWeight: "500" }}>{prog.name}</td>
                            <td style={{ padding: "10px 12px" }}>
                              <span style={{ background: "#EBF4FF", color: "#1B4F8A", fontSize: "11px", padding: "2px 7px", borderRadius: "3px", fontFamily: "Arial, sans-serif" }}>{prog.entity}</span>
                            </td>
                            <td style={{ padding: "10px 12px", color: "#6B7280", fontSize: "12px" }}>{prog.status}</td>
                            <td style={{ padding: "10px 12px" }}>
                              <span style={{ background: pc.bg, color: pc.text, fontSize: "11px", padding: "2px 7px", borderRadius: "3px", fontFamily: "Arial, sans-serif" }}>{prog.priority}</span>
                            </td>
                            <td style={{ padding: "10px 12px", fontSize: "12px", color: "#6B7280" }}>{prog.pool}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pilot + Gap */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                  <div style={{ background: pillar.light, border: `1px solid ${pillar.color}33`, borderRadius: "10px", padding: "16px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "1px", color: pillar.accent, fontFamily: "Arial, sans-serif", marginBottom: "8px" }}>PILOT ACTIVATION</div>
                    <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "4px", fontFamily: "Arial, sans-serif" }}>{pillar.pilot}</div>
                    <div style={{ fontSize: "12px", color: "#4B5563" }}>Budget: {pillar.pilotBudget} · Timing: {pillar.pilotTiming}</div>
                  </div>
                  <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "10px", padding: "16px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "1px", color: "#92400E", fontFamily: "Arial, sans-serif", marginBottom: "8px" }}>READINESS GAP</div>
                    <div style={{ fontSize: "13px", color: "#78350F" }}>{pillar.gaps}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: "#F3F4F6", borderRadius: "12px", padding: "40px", textAlign: "center", color: "#6B7280" }}>
                Select a pillar above to view detail
              </div>
            )}
          </div>
        )}

        {/* ── MATRIX ── */}
        {view === "matrix" && (
          <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
              <div style={{ fontSize: "12px", color: "#6B7280", fontFamily: "Arial, sans-serif" }}>Filter by:</div>
              <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)}
                style={{ border: "1px solid #D1D5DB", borderRadius: "6px", padding: "6px 10px", fontSize: "12px", fontFamily: "Arial, sans-serif", background: "white" }}>
                {entities.map(e => <option key={e}>{e}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ border: "1px solid #D1D5DB", borderRadius: "6px", padding: "6px 10px", fontSize: "12px", fontFamily: "Arial, sans-serif", background: "white" }}>
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
              <span style={{ fontSize: "12px", color: "#6B7280", fontFamily: "Arial, sans-serif" }}>{filteredPrograms.length} of {totalPrograms} programs</span>
            </div>

            <div style={{ background: "white", borderRadius: "10px", border: "1px solid #E5E7EB", overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#1B3A6E" }}>
                    {["Pillar", "Program", "Entity", "Status", "Priority", "Capital Pool", "Atlanta 2076"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "white", fontWeight: "600", fontSize: "11px", letterSpacing: "0.5px", fontFamily: "Arial, sans-serif", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPrograms.map((prog, i) => {
                    const pc = STATUS_COLORS[prog.priority] || STATUS_COLORS["Low"];
                    return (
                      <tr key={`${prog.pillar.num}-${prog.name}`} style={{ background: i % 2 === 0 ? "white" : "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>
                          <span style={{ background: prog.pillar.light, color: prog.pillar.color, fontSize: "11px", padding: "2px 8px", borderRadius: "4px", fontFamily: "Arial, sans-serif", fontWeight: "700" }}>P{prog.pillar.num}</span>
                        </td>
                        <td style={{ padding: "9px 12px", fontWeight: "500", maxWidth: "240px" }}>{prog.name}</td>
                        <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>
                          <span style={{ background: "#EBF4FF", color: "#1B4F8A", fontSize: "11px", padding: "2px 7px", borderRadius: "3px", fontFamily: "Arial, sans-serif" }}>{prog.entity}</span>
                        </td>
                        <td style={{ padding: "9px 12px", fontSize: "12px", color: "#6B7280", maxWidth: "160px" }}>{prog.status}</td>
                        <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>
                          <span style={{ background: pc.bg, color: pc.text, fontSize: "11px", padding: "2px 7px", borderRadius: "3px", fontFamily: "Arial, sans-serif" }}>{prog.priority}</span>
                        </td>
                        <td style={{ padding: "9px 12px", fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>{prog.pool}</td>
                        <td style={{ padding: "9px 12px" }}>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {prog.pillar.atl2076.map(a => <span key={a} style={{ background: ATL_COLORS[a].bg, color: ATL_COLORS[a].text, fontSize: "10px", padding: "1px 6px", borderRadius: "3px", fontFamily: "Arial, sans-serif" }}>{a}</span>)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #E5E7EB", padding: "14px 32px", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9CA3AF", fontFamily: "Arial, sans-serif", flexWrap: "wrap", gap: "8px" }}>
        <span>ARI-PROG-MAP-2026-v1.0 · 7 Pillars · {totalPrograms} Programs · 3 Cross-Pillar · $25M Founding Campaign Target</span>
        <span>Atlanta 2076 — Preserve · Prepare · Prosper</span>
      </div>
    </div>
  );
}

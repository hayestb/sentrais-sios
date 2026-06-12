import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import {
  LayoutDashboard, DollarSign, BookOpen, MapPin, Shield,
  ClipboardList, Bot, FileKey, Calendar, SunMedium, GitCompare,
  FileText, Target, LogOut, CreditCard, GraduationCap, Globe, Network, Building2,
  Layers, UserSquare2, Trophy,
} from "lucide-react";

const NAV = [
  { to: "/dashboard",       icon: LayoutDashboard, label: "Command Center" },
  { to: "/calendar",        icon: Calendar,        label: "Master Calendar" },
  { to: "/calendar-light",  icon: SunMedium,       label: "Calendar (Light)" },
  { to: "/financial-model", icon: DollarSign,      label: "Financial Model" },
  { to: "/financial-ops",   icon: FileText,        label: "Financial Ops" },
  { to: "/pod-structure",   icon: Layers,          label: "GTM Pod Structure" },
  { to: "/sports360",       icon: Trophy,          label: "SPORTS360" },
  { to: "/ari-map",         icon: MapPin,          label: "ARI Program Map" },
  { to: "/ari",             icon: BookOpen,        label: "ARI Programs" },
  { to: "/converge",        icon: Target,          label: "Program Converge" },
  { to: "/banking",         icon: CreditCard,      label: "Banking & Payments" },
  { to: "/workforce",       icon: UserSquare2,     label: "Workforce Matrix" },
  { to: "/fellowship",      icon: GraduationCap,   label: "Fellowship Framework" },
  { to: "/city-readiness",  icon: Globe,           label: "City Readiness" },
  { to: "/atlanta360",      icon: Building2,       label: "Atlanta 360" },
  { to: "/national-network",icon: Network,         label: "National Network" },
  { to: "/doc-control",     icon: GitCompare,      label: "Doc Version Control" },
  { to: "/evidence",        icon: Shield,          label: "Evidence Ledger" },
  { to: "/claims",          icon: ClipboardList,   label: "Claims Register" },
  { to: "/agents",          icon: Bot,             label: "FORGE Agents" },
  { to: "/seg",             icon: FileKey,         label: "SEG Subcontract" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);
  const [signOutHovered, setSignOutHovered] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <aside style={{
      width: 220, flexShrink: 0, display: "flex", flexDirection: "column",
      background: "#0a1628", borderRight: "1px solid #1e2d45",
      height: "100vh", overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: "16px 16px 14px", borderBottom: "1px solid #1e2d45" }}>
        <div style={{ fontSize: 10, letterSpacing: "3px", color: "#4a6080", textTransform: "uppercase" }}>Sentrais</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#f0a500", marginTop: 2 }}>FORGE</div>
        <div style={{ fontSize: 11, color: "#4a6080", marginTop: 1 }}>Command Center</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onMouseEnter={() => setHovered(to)}
            onMouseLeave={() => setHovered(null)}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10,
              padding: "7px 10px", borderRadius: 7,
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? "#fff" : hovered === to ? "#c8d8e8" : "#7a9ab5",
              background: isActive ? "rgba(255,255,255,0.1)" : hovered === to ? "rgba(255,255,255,0.05)" : "transparent",
              textDecoration: "none", transition: "background 0.12s, color 0.12s",
            })}
          >
            <Icon size={14} style={{ flexShrink: 0 }} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div style={{ padding: "8px", borderTop: "1px solid #1e2d45" }}>
        <button
          onClick={handleSignOut}
          onMouseEnter={() => setSignOutHovered(true)}
          onMouseLeave={() => setSignOutHovered(false)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "7px 10px", borderRadius: 7,
            fontSize: 13, cursor: "pointer", border: "none",
            background: signOutHovered ? "rgba(239,68,68,0.1)" : "transparent",
            color: signOutHovered ? "#ef4444" : "#7a9ab5",
            transition: "background 0.12s, color 0.12s",
          }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

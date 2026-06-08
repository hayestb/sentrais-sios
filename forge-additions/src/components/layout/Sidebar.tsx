import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import {
  LayoutDashboard,
  DollarSign,
  BookOpen,
  MapPin,
  Shield,
  ClipboardList,
  Bot,
  FileKey,
  Calendar,
  SunMedium,
  GitCompare,
  FileText,
  Target,
  LogOut,
} from "lucide-react";

const NAV = [
  { to: "/dashboard",        icon: LayoutDashboard, label: "Command Center" },
  { to: "/calendar",         icon: Calendar,        label: "Master Calendar" },
  { to: "/calendar-light",   icon: SunMedium,       label: "Calendar (Light)" },
  { to: "/financial-model",  icon: DollarSign,      label: "Financial Model" },
  { to: "/financial-ops",    icon: FileText,        label: "Financial Ops" },
  { to: "/ari-map",          icon: MapPin,          label: "ARI Program Map" },
  { to: "/ari",              icon: BookOpen,        label: "ARI Programs" },
  { to: "/converge",         icon: Target,          label: "Program Converge" },
  { to: "/doc-control",      icon: GitCompare,      label: "Doc Version Control" },
  { to: "/evidence",         icon: Shield,          label: "Evidence Ledger" },
  { to: "/claims",           icon: ClipboardList,   label: "Claims Register" },
  { to: "/agents",           icon: Bot,             label: "FORGE Agents" },
  { to: "/seg",              icon: FileKey,         label: "SEG Subcontract" },
];

const active = "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-white/10 text-white";
const inactive = "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: "#0a1628", borderRight: "1px solid #1e2d45" }}>
      <div className="p-4 border-b" style={{ borderColor: "#1e2d45" }}>
        <div className="text-xs tracking-widest uppercase" style={{ color: "#4a6080" }}>Sentrais</div>
        <div className="text-lg font-bold mt-0.5" style={{ color: "#f0a500" }}>FORGE</div>
        <div className="text-xs mt-0.5" style={{ color: "#4a6080" }}>Command Center</div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => isActive ? active : inactive}
          >
            <Icon size={15} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: "#1e2d45" }}>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

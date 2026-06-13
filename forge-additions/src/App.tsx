import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { AppShell } from "./components/layout/AppShell";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { FinancialOps } from "./pages/FinancialOps";
import FinancialOperatingSystem from "./pages/FinancialOperatingSystem";
import { ARIPrograms } from "./pages/ARIPrograms";
import ARIProgramMap from "./pages/ARIProgramMap";
import { EvidenceLedger } from "./pages/EvidenceLedger";
import MasterCalendar from "./pages/MasterCalendar";
import MasterCalendarLight from "./pages/MasterCalendarLight";
import DocVersionControl from "./pages/DocVersionControl";
import ProgramConverge from "./pages/ProgramConverge";
import BankingGovernance from "./pages/BankingGovernance";
import FellowshipFramework from "./pages/FellowshipFramework";
import CityReadiness from "./pages/CityReadiness";
import Atlanta360 from "./pages/Atlanta360";
import NationalNetwork from "./pages/NationalNetwork";
import WorkforceMatrix from "./pages/WorkforceMatrix";
import PodStructure from "./pages/PodStructure";
import Sports360 from "./pages/Sports360";
import ExecCompensation from "./pages/ExecCompensation";
import CorporateArchitecture from "./pages/CorporateArchitecture";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0a1628", color: "#94a3b8", fontFamily: "monospace" }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="financial-ops" element={<FinancialOps />} />
          <Route path="financial-model" element={<FinancialOperatingSystem />} />
          <Route path="ari" element={<ARIPrograms />} />
          <Route path="ari-map" element={<ARIProgramMap />} />
          <Route path="evidence" element={<EvidenceLedger />} />
          <Route path="calendar" element={<MasterCalendar />} />
          <Route path="calendar-light" element={<MasterCalendarLight />} />
          <Route path="doc-control" element={<DocVersionControl />} />
          <Route path="converge" element={<ProgramConverge />} />
          <Route path="banking" element={<BankingGovernance />} />
          <Route path="fellowship" element={<FellowshipFramework />} />
          <Route path="city-readiness" element={<CityReadiness />} />
          <Route path="atlanta360" element={<Atlanta360 />} />
          <Route path="national-network" element={<NationalNetwork />} />
          <Route path="workforce" element={<WorkforceMatrix />} />
          <Route path="pod-structure" element={<PodStructure />} />
          <Route path="sports360" element={<Sports360 />} />
          <Route path="exec-comp" element={<ExecCompensation />} />
          <Route path="corp-architecture" element={<CorporateArchitecture />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

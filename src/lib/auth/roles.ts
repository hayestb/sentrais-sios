export type UserRole = "sysadmin" | "admin" | "consultant" | "client_executive" | "analyst";

// Routes each role can access (prefix matching). Sysadmin gets everything.
const ROLE_ROUTES: Record<UserRole, string[]> = {
  sysadmin: ["/"],
  admin: [
    "/executive", "/command-center", "/advisory", "/governance",
    "/engagements", "/gates", "/sprint", "/raci", "/pmo", "/kpi", "/remediation",
    "/sipe", "/agents", "/chat", "/lab", "/crm", "/invoices", "/budget", "/vendors",
    "/ledger", "/reports", "/feed", "/calendar", "/client",
  ],
  consultant: [
    "/command-center", "/advisory", "/governance",
    "/engagements", "/gates", "/sprint", "/raci", "/pmo", "/kpi", "/remediation",
    "/sipe", "/agents", "/chat", "/lab", "/crm", "/invoices", "/budget", "/vendors",
    "/ledger", "/reports", "/feed", "/calendar", "/executive",
  ],
  client_executive: [
    "/executive", "/kpi", "/feed", "/client", "/calendar",
  ],
  analyst: [
    "/command-center", "/gates", "/kpi", "/ledger", "/feed", "/reports", "/calendar",
    "/engagements", "/sprint",
  ],
};

// Where to redirect each role after login
export const ROLE_HOME: Record<UserRole, string> = {
  sysadmin: "/command-center",
  admin: "/command-center",
  consultant: "/command-center",
  client_executive: "/executive",
  analyst: "/command-center",
};

export function canAccess(role: UserRole, pathname: string): boolean {
  if (role === "sysadmin") return true;
  const allowed = ROLE_ROUTES[role] ?? [];
  return allowed.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/") || pathname.startsWith(prefix + "?"));
}

export function roleHome(role: UserRole): string {
  return ROLE_HOME[role] ?? "/command-center";
}

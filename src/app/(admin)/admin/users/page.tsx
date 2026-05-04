"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, RefreshCw, Shield, CheckCircle2, XCircle } from "lucide-react";

type UserRole = "sysadmin" | "admin" | "consultant" | "client_executive" | "analyst";

interface Profile {
  id: string;
  clerkId: string | null;
  email: string;
  fullName: string;
  role: UserRole;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLE_COLORS: Record<UserRole, string> = {
  sysadmin: "border-red-500/30 text-red-400",
  admin: "border-amber-400/30 text-amber-400",
  consultant: "border-primary/30 text-primary",
  client_executive: "border-[#00D4AA]/30 text-[#00D4AA]",
  analyst: "border-border text-muted-foreground",
};

const ROLES: UserRole[] = ["sysadmin", "admin", "consultant", "client_executive", "analyst"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState({ email: "", fullName: "", role: "analyst" as UserRole });
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const inviteUser = async () => {
    if (!invite.email || !invite.fullName) return;
    setSaving(true);
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invite),
    });
    await load();
    setShowInvite(false);
    setInvite({ email: "", fullName: "", role: "analyst" });
    setSaving(false);
  };

  const changeRole = async (id: string, role: UserRole) => {
    setChanging(id);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    setChanging(null);
  };

  const toggleActive = async (id: string, active: boolean) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, active } : u));
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users size={18} className="text-primary" /> User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team members, roles, and access</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </Button>
          <Button size="sm" variant="forge" onClick={() => setShowInvite(true)}>
            <Plus size={12} className="mr-1" /> Invite User
          </Button>
        </div>
      </div>

      {showInvite && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <input value={invite.fullName} onChange={(e) => setInvite((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Full name *" className="h-9 px-3 text-sm rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <input value={invite.email} onChange={(e) => setInvite((p) => ({ ...p, email: e.target.value }))}
                placeholder="Email address *" type="email" className="h-9 px-3 text-sm rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <select value={invite.role} onChange={(e) => setInvite((p) => ({ ...p, role: e.target.value as UserRole }))}
                className="h-9 px-3 text-sm rounded border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="forge" onClick={inviteUser} disabled={saving || !invite.email || !invite.fullName}>
                {saving ? "Inviting…" : "Send Invite"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{users.length} team members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/50">
            {users.map((user) => (
              <div key={user.id} className={`flex items-center gap-4 py-3 ${!user.active ? "opacity-50" : ""}`}>
                <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-foreground">{user.fullName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{user.fullName}</span>
                    {!user.active && <Badge variant="outline" className="text-[9px] h-4 border-red-500/30 text-red-400">Deactivated</Badge>}
                    {!user.clerkId && <Badge variant="outline" className="text-[9px] h-4 border-amber-400/30 text-amber-400">Pending invite</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value as UserRole)}
                    disabled={changing === user.id}
                    className={`text-xs h-7 px-2 rounded border bg-card focus:outline-none focus:ring-1 focus:ring-primary ${ROLE_COLORS[user.role]}`}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button
                    onClick={() => toggleActive(user.id, !user.active)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title={user.active ? "Deactivate" : "Activate"}
                  >
                    {user.active ? <CheckCircle2 size={14} className="text-[#00D4AA]" /> : <XCircle size={14} className="text-red-400" />}
                  </button>
                </div>
                {user.lastLoginAt && (
                  <div className="text-[10px] text-muted-foreground w-28 text-right shrink-0">
                    Last: {new Date(user.lastLoginAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
            {users.length === 0 && !loading && (
              <p className="text-xs text-muted-foreground text-center py-6">No users yet. Invite your team.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package, Plus, AlertTriangle, CheckCircle2, Clock, RefreshCw,
  Mail, DollarSign, FileText, Shield,
} from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  category: string;
  status: string;
  contactName: string | null;
  contactEmail: string | null;
  contractValue: number | null;
  contractEnd: string | null;
  complianceScore: number | null;
  notes: string | null;
  engagementId: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  active: "border-[#00D4AA]/30 bg-[#00D4AA]/10 text-[#00D4AA]",
  inactive: "border-border bg-secondary text-muted-foreground",
  under_review: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  offboarded: "border-red-500/30 bg-red-500/5 text-red-400",
};

const CATEGORIES = ["Technology", "Legal", "Consulting", "Infrastructure", "Security", "Marketing", "Finance", "Other"];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Technology", contactEmail: "", contractValue: "", contractEnd: "" });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/vendors");
    const data = await res.json();
    setVendors(data.vendors ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createVendor = async () => {
    if (!form.name) return;
    setSaving(true);
    await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        contactEmail: form.contactEmail || undefined,
        contractValue: form.contractValue ? parseFloat(form.contractValue) : undefined,
        contractEnd: form.contractEnd || undefined,
      }),
    });
    await load();
    setShowForm(false);
    setForm({ name: "", category: "Technology", contactEmail: "", contractValue: "", contractEnd: "" });
    setSaving(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/vendors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setVendors((prev) => prev.map((v) => v.id === id ? { ...v, status } : v));
  };

  const filtered = filter === "all" ? vendors : vendors.filter((v) => v.status === filter);
  const expiringSoon = vendors.filter((v) => {
    if (!v.contractEnd) return false;
    const diff = new Date(v.contractEnd).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  });

  return (
    <div className="flex flex-col h-full">
      <Header title="Vendor Management" subtitle="Registry · Document vault · Contract monitoring · Compliance scores" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Vendors", value: vendors.length, icon: Package, color: "text-primary" },
            { label: "Active", value: vendors.filter((v) => v.status === "active").length, icon: CheckCircle2, color: "text-[#00D4AA]" },
            { label: "Under Review", value: vendors.filter((v) => v.status === "under_review").length, icon: Clock, color: "text-amber-400" },
            { label: "Expiring Soon", value: expiringSoon.length, icon: AlertTriangle, color: "text-red-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <Icon size={20} className={color} />
                <div>
                  <div className="text-lg font-bold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Expiry alerts */}
        {expiringSoon.length > 0 && (
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 flex items-center gap-3">
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            <span className="text-xs text-amber-400">
              {expiringSoon.map((v) => v.name).join(", ")} — contract{expiringSoon.length > 1 ? "s" : ""} expiring within 30 days
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {["all", "active", "under_review", "inactive"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${filter === s ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {s === "all" ? "All" : s.replace("_", " ")}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </Button>
            <Button size="sm" variant="forge" onClick={() => setShowForm(true)}>
              <Plus size={12} className="mr-1" /> Add Vendor
            </Button>
          </div>
        </div>

        {/* Add form */}
        {showForm && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">New Vendor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Vendor name *" className="h-9 px-3 text-sm rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="h-9 px-3 text-sm rounded-md border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <input value={form.contactEmail} onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))} placeholder="Contact email" className="h-9 px-3 text-sm rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <input value={form.contractValue} onChange={(e) => setForm((p) => ({ ...p, contractValue: e.target.value }))} placeholder="Contract value ($)" type="number" className="h-9 px-3 text-sm rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <input value={form.contractEnd} onChange={(e) => setForm((p) => ({ ...p, contractEnd: e.target.value }))} type="date" className="h-9 px-3 text-sm rounded-md border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="forge" onClick={createVendor} disabled={saving || !form.name}>{saving ? "Saving…" : "Save Vendor"}</Button>
                <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vendor grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((vendor) => {
            const daysToExpiry = vendor.contractEnd
              ? Math.ceil((new Date(vendor.contractEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;
            return (
              <Card key={vendor.id} className="border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{vendor.name}</div>
                      <div className="text-xs text-muted-foreground">{vendor.category}</div>
                    </div>
                    <Badge className={`text-[10px] ${STATUS_COLORS[vendor.status] ?? STATUS_COLORS.inactive}`}>
                      {vendor.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    {vendor.contactEmail && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail size={10} /> {vendor.contactEmail}
                      </div>
                    )}
                    {vendor.contractValue && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <DollarSign size={10} /> ${vendor.contractValue.toLocaleString()}
                      </div>
                    )}
                    {daysToExpiry != null && (
                      <div className={`flex items-center gap-1.5 text-xs ${daysToExpiry < 30 ? "text-amber-400" : "text-muted-foreground"}`}>
                        <Clock size={10} />
                        {daysToExpiry > 0 ? `Expires in ${daysToExpiry}d` : "Expired"}
                      </div>
                    )}
                    {vendor.complianceScore != null && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Shield size={10} /> Compliance: {vendor.complianceScore}%
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 pt-1 border-t border-border">
                    {["active", "under_review", "inactive"].filter((s) => s !== vendor.status).map((s) => (
                      <button key={s} onClick={() => updateStatus(vendor.id, s)} className="flex-1 h-6 text-[9px] rounded border border-border text-muted-foreground hover:text-foreground transition-colors">
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && !loading && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No vendors found. Add one to get started.
          </div>
        )}
      </div>
    </div>
  );
}

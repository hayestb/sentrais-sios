"use client";
import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign, Clock, CheckCircle2, Send, AlertTriangle,
  RefreshCw, TrendingUp, FileText,
} from "lucide-react";

interface InvoiceRow {
  invoice: {
    id: string;
    invoiceNumber: string;
    triggerGate: number;
    invoiceType: string;
    amountDue: number;
    status: "pending" | "sent" | "paid" | "overdue";
    sentAt: string | null;
    paidAt: string | null;
    createdAt: string;
  };
  clientName: string;
  vertical: string;
}

interface Totals {
  total: number;
  pending: number;
  sent: number;
  paid: number;
  overdue: number;
}

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", icon: Clock },
  sent: { label: "Sent", color: "text-[#0EA5E9]", bg: "bg-[#0EA5E9]/10 border-[#0EA5E9]/20", icon: Send },
  paid: { label: "Paid", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", icon: CheckCircle2 },
  overdue: { label: "Overdue", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", icon: AlertTriangle },
};

const INVOICE_TYPE_LABELS: Record<string, string> = {
  deposit_25: "25% Deposit",
  balance_50: "50% Balance",
  caas: "CaaS Subscription",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function InvoicesPage() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [totals, setTotals] = useState<Totals>({ total: 0, pending: 0, sent: 0, paid: 0, overdue: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/invoices?${params}`);
    const data = await res.json();
    setRows(data.invoices ?? []);
    setTotals(data.totals ?? { total: 0, pending: 0, sent: 0, paid: 0, overdue: 0 });
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await fetchInvoices();
    setUpdating(null);
  };

  const FILTERS = ["", "pending", "sent", "paid", "overdue"];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Invoice Management"
        subtitle="Gate-triggered billing · Financial Trigger Agent · CaaS activation"
      />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3">
          {(["pending", "sent", "paid", "overdue"] as const).map((s) => {
            const cfg = STATUS_CONFIG[s];
            const Icon = cfg.icon;
            return (
              <div key={s} className={`p-4 rounded-lg border ${cfg.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} className={cfg.color} />
                  <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
                <div className={`text-xl font-bold ${cfg.color}`}>{formatCurrency(totals[s])}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {rows.filter((r) => r.invoice.status === s).length} invoice{rows.filter((r) => r.invoice.status === s).length !== 1 ? "s" : ""}
                </div>
              </div>
            );
          })}
        </div>

        {/* ARR Progress */}
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp size={14} className="text-[#0EA5E9]" />
              <span className="text-xs font-semibold">Revenue Collected vs. Billed</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {formatCurrency(totals.paid)} paid of {formatCurrency(totals.total)} total
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: totals.total > 0 ? `${(totals.paid / totals.total) * 100}%` : "0%" }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Filters + Table */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText size={14} className="text-muted-foreground" />
                Invoice Register
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-secondary rounded-md border border-border">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`px-2.5 py-1 text-[10px] rounded transition-colors ${
                        statusFilter === f
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f ? STATUS_CONFIG[f as keyof typeof STATUS_CONFIG].label : "All"}
                    </button>
                  ))}
                </div>
                <button
                  onClick={fetchInvoices}
                  className="h-7 w-7 flex items-center justify-center rounded border border-border bg-secondary text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-24 text-muted-foreground text-xs">
                <RefreshCw size={12} className="animate-spin mr-2" /> Loading…
              </div>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center px-6">
                <DollarSign size={24} className="text-muted-foreground mb-2 opacity-30" />
                <p className="text-xs text-muted-foreground">No invoices yet. Gate-triggered invoices are created automatically when gates 2, 4, and 5 pass.</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {["Invoice #", "Client", "Gate", "Type", "Amount", "Status", "Dates", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ invoice, clientName }) => {
                    const cfg = STATUS_CONFIG[invoice.status];
                    const Icon = cfg.icon;
                    return (
                      <tr key={invoice.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-[10px] text-muted-foreground">{invoice.invoiceNumber}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground">{clientName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary border border-border">
                            Gate {invoice.triggerGate}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {INVOICE_TYPE_LABELS[invoice.invoiceType] ?? invoice.invoiceType}
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-foreground">
                          {formatCurrency(invoice.amountDue)}
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.color}`}>
                            <Icon size={9} />
                            {cfg.label}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-[10px]">
                          {invoice.sentAt ? (
                            <div>Sent: {formatDate(invoice.sentAt)}</div>
                          ) : null}
                          {invoice.paidAt ? (
                            <div>Paid: {formatDate(invoice.paidAt)}</div>
                          ) : null}
                          {!invoice.sentAt && !invoice.paidAt && (
                            <span>Created: {formatDate(invoice.createdAt)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {invoice.status === "pending" && (
                              <button
                                onClick={() => updateStatus(invoice.id, "sent")}
                                disabled={updating === invoice.id}
                                className="px-2 py-1 text-[10px] rounded border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 text-[#0EA5E9] hover:bg-[#0EA5E9]/20 transition-colors disabled:opacity-50"
                              >
                                {updating === invoice.id ? "…" : "Mark Sent"}
                              </button>
                            )}
                            {invoice.status === "sent" && (
                              <button
                                onClick={() => updateStatus(invoice.id, "paid")}
                                disabled={updating === invoice.id}
                                className="px-2 py-1 text-[10px] rounded border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                              >
                                {updating === invoice.id ? "…" : "Mark Paid"}
                              </button>
                            )}
                            {(invoice.status === "pending" || invoice.status === "sent") && (
                              <button
                                onClick={() => updateStatus(invoice.id, "overdue")}
                                disabled={updating === invoice.id}
                                className="px-2 py-1 text-[10px] rounded border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                              >
                                Overdue
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

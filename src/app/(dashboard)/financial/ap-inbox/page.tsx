"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";

type InvoiceStatus = "pending" | "approved" | "paid" | "rejected" | "on_hold";

interface APInvoice {
  id: string;
  vendor_name: string;
  invoice_number: string | null;
  amount: number;
  capital_pool: string;
  entity: string;
  engagement_id: string | null;
  status: InvoiceStatus;
  due_date: string | null;
  paid_at: string | null;
  project_code: string | null;
  billcom_id: string | null;
  notes: string | null;
  created_at: string;
  engagements: { name: string } | null;
}

interface LedgerEntry {
  id: string;
  entryType: string;
  subject: string;
  createdAt: string;
  authorHuman: string | null;
  payload: Record<string, unknown>;
}

interface NewInvoiceForm {
  vendor_name: string;
  invoice_number: string;
  amount: string;
  project_code: string;
  capital_pool: string;
  entity: string;
  engagement_id: string;
  due_date: string;
  notes: string;
}

const VALID_PROJECT_CODES = [
  "NFL/SEG", "FIFA Readiness", "BRIC", "Miami Expo", "Atlanta POC", "ARI Programming",
];

const EMPTY_FORM: NewInvoiceForm = {
  vendor_name: "",
  invoice_number: "",
  amount: "",
  project_code: "",
  capital_pool: "operating",
  entity: "sentrais_inc",
  engagement_id: "",
  due_date: "",
  notes: "",
};

function fmt$(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function extractFlags(notes: string | null): { flags: string[]; cleanNotes: string } {
  if (!notes) return { flags: [], cleanNotes: "" };
  const marker = "AUTO-FLAGS:";
  const idx = notes.indexOf(marker);
  if (idx === -1) return { flags: [], cleanNotes: notes.trim() };
  const cleanNotes = notes.slice(0, idx).trim();
  const flagBlock = notes.slice(idx + marker.length).trim();
  const flags = flagBlock.split("\n").map((f) => f.trim()).filter(Boolean);
  return { flags, cleanNotes };
}

const STATUS_STYLES: Record<InvoiceStatus, { label: string; style: string }> = {
  pending: { label: "Pending", style: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  approved: { label: "Approved", style: "bg-green-500/10 text-green-400 border-green-500/30" },
  paid: { label: "Paid", style: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  rejected: { label: "Rejected", style: "bg-red-500/10 text-red-400 border-red-500/30" },
  on_hold: { label: "On Hold", style: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { label, style } = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-mono font-bold ${style}`}>
      {label}
    </span>
  );
}

function InvoiceRow({
  invoice,
  onAction,
  onMarkPaid,
}: {
  invoice: APInvoice;
  onAction: (id: string, action: "approved" | "rejected") => Promise<void>;
  onMarkPaid: (id: string, billcomId: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [billcomId, setBillcomId] = useState(invoice.billcom_id ?? "");
  const [loading, setLoading] = useState(false);
  const { flags, cleanNotes } = extractFlags(invoice.notes);
  const isOverdue =
    invoice.due_date &&
    new Date(invoice.due_date) < new Date() &&
    invoice.status === "pending";
  const needsDualOfficer = invoice.amount > 10000;

  return (
    <div className={`rounded-lg border transition-colors ${
      isOverdue ? "border-red-500/40 bg-red-500/5" : "border-border bg-secondary/20"
    }`}>
      <div
        className="flex items-center gap-4 px-4 py-3.5 cursor-pointer select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        <span className="text-muted-foreground text-xs w-4 shrink-0">{expanded ? "▼" : "▶"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground truncate">{invoice.vendor_name}</span>
            {invoice.invoice_number && (
              <span className="text-muted-foreground text-xs font-mono shrink-0">#{invoice.invoice_number}</span>
            )}
            {flags.length > 0 && (
              <span className="shrink-0 rounded border border-red-500/40 px-1.5 py-0.5 text-[10px] font-mono bg-red-500/10 text-red-300">
                {flags.length} FLAG{flags.length > 1 ? "S" : ""}
              </span>
            )}
            {isOverdue && (
              <span className="shrink-0 rounded border border-red-500/40 px-1.5 py-0.5 text-[10px] font-mono bg-red-500/10 text-red-400">
                OVERDUE
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {invoice.project_code && (
              <span className="text-[11px] text-muted-foreground font-mono">{invoice.project_code}</span>
            )}
            {invoice.engagements && (
              <span className="text-[11px] text-muted-foreground/60">{invoice.engagements.name}</span>
            )}
          </div>
        </div>
        <span className={`font-mono font-bold shrink-0 ${invoice.amount > 10000 ? "text-amber-400" : "text-foreground"}`}>
          {fmt$(invoice.amount)}
        </span>
        <span className={`text-xs font-mono shrink-0 w-24 text-right ${isOverdue ? "text-red-400" : "text-muted-foreground"}`}>
          {fmtDate(invoice.due_date)}
        </span>
        <div className="shrink-0 w-24 flex justify-end">
          <StatusBadge status={invoice.status} />
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
          {flags.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Auto-Flags</p>
              <div className="space-y-1">
                {flags.map((f, i) => {
                  const isHard = f.startsWith("AUTO_REJECT") || f.startsWith("HOLD_");
                  return (
                    <div key={i} className={`rounded border px-3 py-1.5 text-xs font-mono leading-snug ${
                      isHard ? "border-red-500/40 bg-red-500/5 text-red-300" : "border-amber-500/30 bg-amber-500/5 text-amber-400"
                    }`}>
                      {f}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {cleanNotes && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{cleanNotes}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 text-xs font-mono text-muted-foreground">
            <div><span className="text-muted-foreground/50 block">Entity</span>{invoice.entity}</div>
            <div><span className="text-muted-foreground/50 block">Pool</span>{invoice.capital_pool}</div>
            <div><span className="text-muted-foreground/50 block">Created</span>{fmtDate(invoice.created_at)}</div>
          </div>

          {needsDualOfficer && invoice.status === "pending" && (
            <div className="rounded border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-400 font-mono">
              DUAL-OFFICER REQUIRED — ACH/wire over $10,000. Both approvers must confirm before dispatch.
            </div>
          )}

          {invoice.status === "approved" && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Bill.com ID (optional)"
                value={billcomId}
                onChange={(e) => setBillcomId(e.target.value)}
                className="flex-1 rounded border border-border bg-secondary px-3 py-1.5 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                onClick={async () => { setLoading(true); await onMarkPaid(invoice.id, billcomId); setLoading(false); }}
                disabled={loading}
                className="rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-40 px-4 py-1.5 text-sm font-semibold text-white transition-colors"
              >
                {loading ? "Marking…" : "Mark Paid"}
              </button>
            </div>
          )}

          {invoice.status === "pending" && (
            <div className="flex gap-2">
              <button
                onClick={async () => { setLoading(true); await onAction(invoice.id, "approved"); setLoading(false); }}
                disabled={loading}
                className="rounded bg-green-700 hover:bg-green-600 disabled:opacity-40 px-4 py-1.5 text-sm font-semibold text-white transition-colors"
              >
                {loading ? "Saving…" : "Approve"}
              </button>
              <button
                onClick={async () => { setLoading(true); await onAction(invoice.id, "rejected"); setLoading(false); }}
                disabled={loading}
                className="rounded border border-border hover:border-foreground/30 disabled:opacity-40 px-4 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddInvoiceForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<NewInvoiceForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [flags, setFlags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof NewInvoiceForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFlags([]);

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) { setError("Enter a valid invoice amount."); return; }

    setLoading(true);
    const res = await fetch("/api/financial/ap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor_name: form.vendor_name,
        invoice_number: form.invoice_number || null,
        amount,
        project_code: form.project_code,
        capital_pool: form.capital_pool,
        entity: form.entity,
        engagement_id: form.engagement_id || null,
        due_date: form.due_date || null,
        notes: form.notes || null,
        status: "pending",
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Failed to submit invoice."); return; }
    if (data.flags?.length > 0) setFlags(data.flags);
    setForm(EMPTY_FORM);
    onSuccess();
  };

  const inputCls = "w-full rounded border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-mono";
  const labelCls = "block text-[10px] text-muted-foreground uppercase tracking-wider mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Vendor Name *</label>
          <input required value={form.vendor_name} onChange={set("vendor_name")} placeholder="Vendor or payee name" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Invoice Number</label>
          <input value={form.invoice_number} onChange={set("invoice_number")} placeholder="INV-0001" className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Amount ($) *</label>
          <input required type="number" step="0.01" min="0.01" value={form.amount} onChange={set("amount")} placeholder="0.00" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Due Date</label>
          <input type="date" value={form.due_date} onChange={set("due_date")} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Project Code * (billback required)</label>
          <select required value={form.project_code} onChange={set("project_code")} className={inputCls}>
            <option value="">— Select code —</option>
            {VALID_PROJECT_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Capital Pool</label>
          <select value={form.capital_pool} onChange={set("capital_pool")} className={inputCls}>
            <option value="operating">Operating (Sentrais commercial)</option>
            <option value="mission">Mission (ARI programs)</option>
            <option value="research">Research (NOVATELabs/ARI)</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Entity</label>
          <select value={form.entity} onChange={set("entity")} className={inputCls}>
            <option value="sentrais_inc">Sentrais, Inc.</option>
            <option value="novatelabs_inc">NOVATELabs, Inc.</option>
            <option value="ari">Atlanta Resilience Institute</option>
            <option value="rrh">Resilient Reach Holdings</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Engagement ID (optional)</label>
          <input value={form.engagement_id} onChange={set("engagement_id")} placeholder="UUID" className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Notes</label>
        <textarea value={form.notes} onChange={set("notes")} rows={3} placeholder="Context, restrictions, or payment instructions…" className={`${inputCls} resize-none`} />
      </div>

      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-400 font-mono">{error}</div>
      )}
      {flags.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">Invoice submitted with auto-flags:</p>
          {flags.map((f, i) => (
            <div key={i} className="rounded border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 text-xs font-mono text-amber-400">{f}</div>
          ))}
        </div>
      )}
      <button type="submit" disabled={loading} className="w-full rounded bg-secondary hover:bg-secondary/80 disabled:opacity-40 py-2 text-sm font-semibold text-foreground transition-colors border border-border">
        {loading ? "Submitting…" : "Submit Invoice"}
      </button>
    </form>
  );
}

export default function APInboxPage() {
  const [invoices, setInvoices] = useState<APInvoice[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<InvoiceStatus | "all">("all");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      const [apRes, ledgerRes] = await Promise.all([
        fetch("/api/financial/ap"),
        fetch("/api/financial/ledger?type=ap_invoice_created&limit=20"),
      ]);
      if (!apRes.ok) throw new Error("Failed to load AP queue");
      const { invoices: inv } = await apRes.json();
      setInvoices(inv ?? []);
      if (ledgerRes.ok) {
        const { entries } = await ledgerRes.json();
        setLedger(entries ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load AP data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    const res = await fetch(`/api/financial/ap/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action }),
    });
    const data = await res.json();
    if (res.ok) { showToast(`Invoice ${action}.`); fetchData(); }
    else showToast(data.error ?? "Action failed.", "err");
  };

  const handleMarkPaid = async (id: string, billcomId: string) => {
    const res = await fetch(`/api/financial/ap/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", billcom_id: billcomId || null }),
    });
    if (res.ok) { showToast("Invoice marked paid."); fetchData(); }
    else showToast("Failed to mark paid.", "err");
  };

  const totalPending = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalApproved = invoices.filter((i) => i.status === "approved").reduce((s, i) => s + i.amount, 0);
  const flaggedCount = invoices.filter((i) => i.notes?.includes("AUTO-FLAGS:")).length;
  const overdueCount = invoices.filter(
    (i) => i.due_date && new Date(i.due_date) < new Date() && i.status === "pending"
  ).length;

  const filtered = activeFilter === "all" ? invoices : invoices.filter((i) => i.status === activeFilter);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="AP Inbox"
        subtitle="Vendor payables queue · Auto-flag engine · Dual-officer guard · Evidence Ledger"
      />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Pending AP", value: fmt$(totalPending), sub: `${invoices.filter((i) => i.status === "pending").length} invoices`, accent: false },
            { label: "Approved (unpaid)", value: fmt$(totalApproved), sub: `${invoices.filter((i) => i.status === "approved").length} invoices`, accent: false },
            { label: "Auto-Flagged", value: String(flaggedCount), sub: "require review", accent: flaggedCount > 0 },
            { label: "Overdue", value: String(overdueCount), sub: "past due date", accent: overdueCount > 0 },
          ].map((s) => (
            <div key={s.label} className={`rounded-lg border p-4 ${s.accent ? "border-red-500/40 bg-red-500/5" : "border-border bg-secondary/20"}`}>
              <div className={`text-xl font-bold font-mono ${s.accent ? "text-red-400" : "text-foreground"}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              <div className="text-[11px] text-muted-foreground/60 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Add invoice */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm((f) => !f)}
            className="rounded border border-border bg-secondary/40 hover:bg-secondary px-4 py-2 text-sm font-semibold transition-colors"
          >
            {showAddForm ? "Cancel" : "+ Add Invoice"}
          </button>
        </div>

        {showAddForm && (
          <div className="rounded-lg border border-border bg-secondary/20 p-5">
            <p className="text-sm font-semibold mb-4">Submit New Invoice</p>
            <AddInvoiceForm onSuccess={() => { setShowAddForm(false); fetchData(); showToast("Invoice submitted."); }} />
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1 flex-wrap border-b border-border pb-0">
          {(["all", "pending", "approved", "paid", "rejected", "on_hold"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-2 text-xs font-mono font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                activeFilter === f
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all"
                ? `All (${invoices.length})`
                : `${f.replace("_", " ")} (${invoices.filter((i) => i.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Invoice list */}
        {loading && <div className="text-sm text-muted-foreground">Loading AP queue…</div>}
        {error && <div className="rounded border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400 font-mono">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground font-mono text-sm">
            {activeFilter === "all" ? "No invoices in queue." : `No ${activeFilter.replace("_", " ")} invoices.`}
          </div>
        )}
        <div className="space-y-2">
          {filtered.map((inv) => (
            <InvoiceRow key={inv.id} invoice={inv} onAction={handleAction} onMarkPaid={handleMarkPaid} />
          ))}
        </div>

        {/* Ledger feed */}
        {ledger.length > 0 && (
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Recent Ledger Activity</p>
            <div className="rounded-lg border border-border divide-y divide-border">
              {ledger.map((e) => (
                <div key={e.id} className="px-4 py-2.5 flex items-center gap-3 text-xs font-mono">
                  <span className="text-muted-foreground/50 w-36 shrink-0">
                    {new Date(e.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-muted-foreground flex-1 truncate">{e.subject}</span>
                  <span className="text-muted-foreground/40 shrink-0">{e.authorHuman ?? "System"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 rounded-lg px-4 py-3 text-sm font-mono shadow-lg ${
          toast.type === "ok"
            ? "bg-green-900/80 border border-green-700 text-green-200"
            : "bg-red-900/80 border border-red-700 text-red-200"
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

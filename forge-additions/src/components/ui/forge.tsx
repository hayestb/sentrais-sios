import React from "react";

// ─── Design tokens ────────────────────────────────────────────────
export const C = {
  bg:         "#0a1628",
  surface:    "#0d1f3c",
  surfaceAlt: "#0a1628",
  border:     "#1e3a5f",
  accent:     "#0EA5E9",
  teal:       "#14B8A6",
  amber:      "#f59e0b",
  red:        "#ef4444",
  green:      "#10b981",
  purple:     "#8B5CF6",
  textPrimary:   "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted:     "#64748b",
};

// ─── Page shell ───────────────────────────────────────────────────
export function ForgePage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.textPrimary,
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      {children}
    </div>
  );
}

// ─── Page header ──────────────────────────────────────────────────
interface StatChip { label: string; value: string | number; color?: string; }

export function ForgeHeader({
  icon: Icon,
  title,
  subtitle,
  stats = [],
}: {
  icon?: React.ElementType;
  title: string;
  subtitle?: string;
  stats?: StatChip[];
}) {
  return (
    <div style={{
      padding: "20px 28px 0",
      borderBottom: `1px solid ${C.border}`,
      background: C.bg,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            {Icon && <Icon size={18} color={C.accent} />}
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.textPrimary }}>{title}</h1>
          </div>
          {subtitle && <p style={{ margin: 0, fontSize: 12, color: C.textMuted }}>{subtitle}</p>}
        </div>
        {stats.length > 0 && (
          <div style={{ display: "flex", gap: 10 }}>
            {stats.map((s) => (
              <div key={s.label} style={{
                textAlign: "center", padding: "8px 14px",
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color ?? C.accent }}>{s.value}</div>
                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab bar (attached to header) ─────────────────────────────────
interface Tab { id: string; label: string; icon?: React.ElementType; }

export function ForgeTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 4, padding: "12px 28px 0" }}>
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: "6px 6px 0 0",
              border: "none", cursor: "pointer", fontSize: 13, fontWeight: isActive ? 600 : 400,
              background: isActive ? C.surface : "transparent",
              color: isActive ? C.textPrimary : C.textSecondary,
              borderTop: isActive ? `2px solid ${C.accent}` : "2px solid transparent",
              transition: "all 0.12s",
            }}
          >
            {t.icon && <t.icon size={13} />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Content area ─────────────────────────────────────────────────
export function ForgeContent({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto", ...style }}>
      {children}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────
export function ForgeCard({
  children,
  style,
  accent,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accent?: string;
}) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${accent ? accent + "40" : C.border}`,
      borderRadius: 10,
      ...(accent ? { borderLeft: `3px solid ${accent}` } : {}),
      ...style,
    }}>
      {children}
    </div>
  );
}

export function ForgeCardHeader({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, ...style }}>
      {children}
    </div>
  );
}

export function ForgeCardBody({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ padding: "14px 18px", ...style }}>
      {children}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────
export function ForgeLabel({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, letterSpacing: "1px",
      textTransform: "uppercase" as const, color: color ?? C.textMuted,
      marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────
type BadgeVariant = "success" | "info" | "warning" | "danger" | "neutral" | "purple";
const BADGE_COLORS: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  success: { bg: "#10b98120", text: "#10b981", border: "#10b98140" },
  info:    { bg: "#0EA5E920", text: "#0EA5E9", border: "#0EA5E940" },
  warning: { bg: "#f59e0b20", text: "#f59e0b", border: "#f59e0b40" },
  danger:  { bg: "#ef444420", text: "#ef4444", border: "#ef444440" },
  neutral: { bg: "#1e3a5f",   text: "#94a3b8", border: "#1e3a5f" },
  purple:  { bg: "#8B5CF620", text: "#8B5CF6", border: "#8B5CF640" },
};

export function ForgeBadge({ variant = "neutral", children }: { variant?: BadgeVariant; children: React.ReactNode }) {
  const s = BADGE_COLORS[variant];
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
    }}>
      {children}
    </span>
  );
}

// ─── Row (key/value) ──────────────────────────────────────────────
export function ForgeRow({
  label,
  value,
  valueColor,
  border = true,
}: {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
  border?: boolean;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 0",
      borderBottom: border ? `1px solid ${C.border}` : "none",
    }}>
      <span style={{ fontSize: 12, color: C.textMuted }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: valueColor ?? C.textPrimary }}>{value}</span>
    </div>
  );
}

// ─── Alert box ────────────────────────────────────────────────────
type AlertLevel = "critical" | "high" | "medium" | "low" | "info";
const ALERT_COLORS: Record<AlertLevel, { bg: string; border: string; text: string; icon: string }> = {
  critical: { bg: "#ef444410", border: "#ef444430", text: "#ef4444", icon: "⛔" },
  high:     { bg: "#f59e0b10", border: "#f59e0b30", text: "#f59e0b", icon: "⚠" },
  medium:   { bg: "#0EA5E910", border: "#0EA5E930", text: "#0EA5E9", icon: "ℹ" },
  low:      { bg: "#10b98110", border: "#10b98130", text: "#10b981", icon: "✓" },
  info:     { bg: "#8B5CF610", border: "#8B5CF630", text: "#8B5CF6", icon: "◆" },
};

export function ForgeAlert({ level = "medium", children }: { level?: AlertLevel; children: React.ReactNode }) {
  const s = ALERT_COLORS[level];
  return (
    <div style={{
      display: "flex", gap: 10, padding: "10px 12px",
      background: s.bg, border: `1px solid ${s.border}`, borderRadius: 6,
      fontSize: 12, color: C.textSecondary, lineHeight: 1.5,
    }}>
      <span style={{ color: s.text, flexShrink: 0, fontSize: 13 }}>{s.icon}</span>
      <div>
        <span style={{ fontWeight: 700, color: s.text, marginRight: 6, textTransform: "uppercase" as const, fontSize: 10 }}>
          {level}
        </span>
        {children}
      </div>
    </div>
  );
}

// ─── Grid helpers ─────────────────────────────────────────────────
export function ForgeGrid({ cols = 2, gap = 16, children }: { cols?: number; gap?: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}>
      {children}
    </div>
  );
}

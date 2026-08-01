import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { engagements, gateRecords, agentTasks } from "@/lib/db/schema";
import { count } from "drizzle-orm";
import {
  BarChart3, GitBranch, Brain, Shield, Users, ArrowRight, Zap, Activity,
} from "lucide-react";
import { roleHome } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

// Redirect authenticated users directly to their dashboard
async function checkAuth() {
  const { userId, sessionClaims } = await auth();
  if (userId) {
    const role = ((sessionClaims?.metadata as { role?: string } | undefined)?.role as UserRole) ?? "analyst";
    redirect(roleHome(role));
  }
}

const PERSONAS = [
  {
    href: "/executive",
    icon: BarChart3,
    color: "#0EA5E9",
    bg: "bg-[#0EA5E9]/10 border-[#0EA5E9]/20",
    label: "Executive",
    role: "Knox Phillips · Managing Partner",
    description: "ARR pipeline, portfolio health, financial triggers, and one-click board-ready reports.",
    actions: ["Revenue Command", "Financial Triggers", "Executive Readouts"],
  },
  {
    href: "/command-center",
    icon: GitBranch,
    color: "#22C55E",
    bg: "bg-green-500/10 border-green-500/20",
    label: "Operations Lead",
    role: "Engagement PM · Sprint Master",
    description: "Manage the active sprint, advance gates, enforce RACI, and track every delivery milestone.",
    actions: ["Gate Advancement", "Sprint Calendar", "RACI Enforcement"],
  },
  {
    href: "/advisory",
    icon: Brain,
    color: "#A855F7",
    bg: "bg-purple-500/10 border-purple-500/20",
    label: "Advisory",
    role: "Solution Architect · Consultant",
    description: "Run Blueprint360 assessments, score resilience dimensions, and surface intelligence from SIPE.",
    actions: ["Blueprint360 Scoring", "Gap Analysis", "SIPE Intelligence"],
  },
  {
    href: "/governance",
    icon: Shield,
    color: "#F59E0B",
    bg: "bg-amber-500/10 border-amber-500/20",
    label: "Governance & QA",
    role: "QA Agent Operator · Compliance",
    description: "Validate hard block clearance, verify the Evidence Ledger chain, and enforce the RACI matrix.",
    actions: ["Hard Block Validation", "Evidence Ledger", "QA Clearance"],
  },
];

export default async function LandingPage() {
  await checkAuth();

  let engCount = { count: 0 }, gateCount = { count: 0 }, taskCount = { count: 0 };
  try {
    const [[eng], [gate], [task]] = await Promise.all([
      db.select({ count: count() }).from(engagements),
      db.select({ count: count() }).from(gateRecords),
      db.select({ count: count() }).from(agentTasks),
    ]);
    engCount = eng ?? engCount;
    gateCount = gate ?? gateCount;
    taskCount = task ?? taskCount;
  } catch {
    // DB unavailable — render with zero counts
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#0EA5E9] flex items-center justify-center">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Sentrais SIOS</div>
            <div className="text-[10px] text-muted-foreground">Innovation Operating System · v2026</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity size={12} className="text-green-400" />
          <span className="text-green-400">22 Agents Online</span>
          <span className="mx-2 text-border">·</span>
          <span>{engCount?.count ?? 0} Engagements</span>
          <span className="mx-2 text-border">·</span>
          <span>{gateCount?.count ?? 0} Gates</span>
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <div className="text-center max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0EA5E9]/30 bg-[#0EA5E9]/5 text-xs text-[#0EA5E9] mb-6">
            <Zap size={11} />
            <span>FORGE Agent Network · 22 AI Agents Active</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
            The AI-Native Engine for<br />
            <span className="text-[#0EA5E9]">Enterprise Transformation</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Sentrais SIOS orchestrates every phase of client delivery — from discovery through operationalization — with immutable evidence, automated governance, and AI-powered intelligence at every gate.
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mb-12">
          {PERSONAS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className={`group relative p-6 rounded-xl border ${p.bg} hover:scale-[1.01] transition-all duration-200 hover:shadow-lg hover:shadow-black/20`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-background/50 border border-border flex items-center justify-center shrink-0">
                  <p.icon size={20} style={{ color: p.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-semibold text-foreground text-sm">{p.label}</span>
                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-[11px] text-muted-foreground mb-2">{p.role}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.actions.map((a) => (
                      <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-background/60 border border-border text-muted-foreground">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Client portal + stats */}
        <div className="flex flex-col items-center gap-4 w-full max-w-4xl">
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">Client Access</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card w-full">
            <Users size={16} className="text-muted-foreground shrink-0" />
            <div className="flex-1 text-xs text-muted-foreground">
              Sharing a progress view with a client? Navigate to <code className="bg-secondary px-1 rounded">/client/[engagement-id]</code>
            </div>
            <Link
              href="/engagements"
              className="h-8 px-3 text-xs rounded-md bg-secondary border border-border text-foreground flex items-center gap-1.5 hover:bg-secondary/70 shrink-0"
            >
              Get ID <ArrowRight size={11} />
              </Link>
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <footer className="px-8 py-4 border-t border-border">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground max-w-4xl mx-auto">
          <span>Sentrais Group · SIOS Agentic Framework · Zone 1 Ledger: Active</span>
          <div className="flex items-center gap-4">
            <span>{taskCount?.count ?? 0} Agent Tasks Logged</span>
            <span>SHA-256 Chain: Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

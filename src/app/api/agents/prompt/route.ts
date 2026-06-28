import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { agentConfigs, evidenceEntries } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { writeToLedger } from "@/lib/ledger/evidence";
import type { AgentName } from "@/lib/workflow/types";

const REQUIRED_CLAUSES = [
  {
    key: "sovereign_lock",
    check: (p: string) =>
      p.toLowerCase().includes("sovereign lock") &&
      (p.toLowerCase().includes("you never sign") || p.toLowerCase().includes("never sign")),
    error:
      "SOVEREIGN LOCK clause missing. Every system prompt must instruct the agent that it never signs, pays, transfers, files, or closes without explicit human authorization.",
  },
  {
    key: "ledger_mandate",
    check: (p: string) =>
      p.toLowerCase().includes("evidence ledger") &&
      (p.toLowerCase().includes("log") || p.toLowerCase().includes("sha-256") || p.toLowerCase().includes("hash")),
    error:
      "Evidence Ledger mandate missing. Every system prompt must instruct the agent to log findings to the Evidence Ledger with SHA-256 hash.",
  },
];

function bumpVersion(current: string): string {
  const [major, minor] = current.split(".").map(Number);
  if (minor >= 9) return `${major + 1}.0`;
  return `${major}.${minor + 1}`;
}

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (profile.role !== "sysadmin" && profile.role !== "admin") {
    return NextResponse.json({ error: "Prompt editor access is restricted to admins." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const agentName = searchParams.get("agent_name") as AgentName | null;
  if (!agentName) return NextResponse.json({ error: "agent_name required" }, { status: 400 });

  const [config] = await db
    .select()
    .from(agentConfigs)
    .where(eq(agentConfigs.agentName, agentName))
    .limit(1);

  if (!config) {
    return NextResponse.json({ error: `Agent "${agentName}" not found.` }, { status: 404 });
  }

  const history = await db
    .select()
    .from(evidenceEntries)
    .where(eq(evidenceEntries.entryType, "prompt_change"))
    .orderBy(desc(evidenceEntries.createdAt))
    .limit(5);

  return NextResponse.json({ config, history });
}

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (profile.role !== "sysadmin" && profile.role !== "admin") {
    return NextResponse.json({ error: "Prompt saves are restricted to admins." }, { status: 403 });
  }

  const body = await request.json();
  const { agent_name, system_prompt, model_tier, is_active, changelog } = body as {
    agent_name: AgentName;
    system_prompt: string;
    model_tier?: string;
    is_active?: boolean;
    changelog?: string;
  };

  if (!agent_name || !system_prompt) {
    return NextResponse.json({ error: "agent_name and system_prompt are required." }, { status: 400 });
  }

  if (!changelog || changelog.trim().length < 10) {
    return NextResponse.json(
      { error: "A changelog note (minimum 10 characters) is required before saving a prompt change." },
      { status: 400 }
    );
  }

  for (const clause of REQUIRED_CLAUSES) {
    if (!clause.check(system_prompt)) {
      return NextResponse.json({ error: clause.error, clause: clause.key }, { status: 422 });
    }
  }

  const [current] = await db
    .select()
    .from(agentConfigs)
    .where(eq(agentConfigs.agentName, agent_name))
    .limit(1);

  if (!current) {
    return NextResponse.json({ error: `Agent "${agent_name}" not found.` }, { status: 404 });
  }

  const newVersion = bumpVersion(current.version);

  const [updated] = await db
    .update(agentConfigs)
    .set({
      systemPrompt: system_prompt,
      version: newVersion,
      ...(model_tier !== undefined ? { modelTier: model_tier } : {}),
      ...(is_active !== undefined ? { isActive: is_active } : {}),
      updatedAt: new Date(),
    })
    .where(eq(agentConfigs.id, current.id))
    .returning();

  const ledgerEntry = await writeToLedger({
    entryType: "prompt_change",
    subject: `Prompt updated for ${agent_name} → v${newVersion}`,
    authorAgent: agent_name,
    authorHuman: profile.fullName,
    payload: {
      agent_name,
      changelog,
      previous_version: current.version,
      new_version: newVersion,
      previous_prompt: current.systemPrompt,
      new_prompt: system_prompt,
      changed_by: profile.fullName,
      model_tier: model_tier ?? current.modelTier,
    },
  });

  return NextResponse.json({
    agent: updated,
    new_version: newVersion,
    ledger_entry_id: ledgerEntry.id,
    sha256_hash: ledgerEntry.sha256Hash,
    timestamp: ledgerEntry.createdAt,
    message: `Prompt saved at v${newVersion}. Logged to Evidence Ledger.`,
  });
}

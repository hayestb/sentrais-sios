import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { agentConfigs, evidenceEntries } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth/current-user";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (profile.role !== "sysadmin" && profile.role !== "admin" && profile.role !== "consultant") {
    return NextResponse.json({ error: "Restricted." }, { status: 403 });
  }

  const [configs, recentRuns] = await Promise.all([
    db.select().from(agentConfigs).orderBy(agentConfigs.agentName),
    db
      .select()
      .from(evidenceEntries)
      .where(eq(evidenceEntries.entryType, "agent_run"))
      .orderBy(desc(evidenceEntries.createdAt))
      .limit(50),
  ]);

  // Attach last run per agent (matched by authorAgent field)
  const enriched = configs.map((cfg) => {
    const lastRun = recentRuns.find(
      (r) => (r.payload as Record<string, unknown>)?.agent_name === cfg.agentName
    );
    const payload = lastRun?.payload as Record<string, unknown> | undefined;
    return {
      ...cfg,
      last_run_at: lastRun?.createdAt ?? null,
      last_verdict: payload?.verdict ?? null,
      last_task: payload?.task ?? null,
      last_triggered_by: payload?.triggered_by ?? null,
    };
  });

  return NextResponse.json({
    agents: enriched,
    recent_runs: recentRuns.slice(0, 20),
  });
}

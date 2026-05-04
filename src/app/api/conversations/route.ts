import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { agentConversations } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { generateText } from "ai";

export const dynamic = "force-dynamic";

// Routes through Vercel AI Gateway via OIDC — no provider API key needed
const AGENT_MODEL = "anthropic/claude-sonnet-4.6";

export async function GET(req: NextRequest) {
  const engagementId = req.nextUrl.searchParams.get("engagementId");
  const rows = engagementId
    ? await db.select().from(agentConversations).where(eq(agentConversations.engagementId, engagementId)).orderBy(desc(agentConversations.updatedAt))
    : await db.select().from(agentConversations).orderBy(desc(agentConversations.updatedAt)).limit(20);
  return NextResponse.json({ conversations: rows });
}

const AgentNames = [
  "governance", "discovery", "intake", "assessment", "architecture",
  "design", "delivery", "qa", "financial", "transition", "learning",
  "communications", "portfolio", "client_success", "legal", "sipe",
  "risk", "compliance", "knowledge", "escalation", "reporting", "integration",
] as const;

const MessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  engagementId: z.string().uuid().optional(),
  agentName: z.enum(AgentNames),
  message: z.string(),
  context: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = MessageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { conversationId, engagementId, agentName, message, context } = parsed.data;

  let conv = conversationId
    ? (await db.select().from(agentConversations).where(eq(agentConversations.id, conversationId)))[0]
    : null;

  if (!conv) {
    const [created] = await db
      .insert(agentConversations)
      .values({ engagementId, agentName, title: message.slice(0, 60), messages: [] })
      .returning();
    conv = created;
  }

  type Msg = { role: "user" | "assistant"; content: string; ts: string };
  const history = (conv.messages ?? []) as Msg[];
  history.push({ role: "user", content: message, ts: new Date().toISOString() });

  const systemPrompt = `You are the ${agentName} FORGE agent within the SIOS (Sentrais Innovation Operating System).${context ? `\nEngagement context: ${JSON.stringify(context)}` : ""}
Provide expert, concise, actionable responses aligned with the Sentrais delivery methodology.`;

  const { text, usage } = await generateText({
    model: AGENT_MODEL,
    system: systemPrompt,
    messages: history.map(({ role, content }) => ({ role, content })),
    providerOptions: {
      gateway: { tags: [`agent:${agentName}`, "feature:forge-chat"] },
    },
  });

  const totalTokens = (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0);
  history.push({ role: "assistant", content: text, ts: new Date().toISOString() });

  const [updated] = await db
    .update(agentConversations)
    .set({
      messages: history,
      tokensTotal: (conv.tokensTotal ?? 0) + totalTokens,
      updatedAt: new Date(),
    })
    .where(eq(agentConversations.id, conv.id))
    .returning();

  return NextResponse.json({
    conversationId: updated.id,
    reply: text,
    tokensUsed: totalTokens,
    messageCount: history.length,
  });
}

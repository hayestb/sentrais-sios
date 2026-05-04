"use client";
import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Send, Plus, Loader2, User, ChevronRight } from "lucide-react";

type AgentName =
  | "governance" | "discovery" | "intake" | "assessment" | "architecture"
  | "design" | "delivery" | "qa" | "financial" | "transition" | "learning"
  | "communications" | "portfolio" | "risk" | "sipe";

interface Message { role: "user" | "assistant"; content: string; ts: string; }
interface Conversation { id: string; agentName: AgentName; title: string | null; messages: Message[]; updatedAt: string; }
interface Engagement { id: string; clientName: string; }

const AGENTS: { name: AgentName; label: string; color: string }[] = [
  { name: "governance", label: "Governance", color: "text-amber-400" },
  { name: "architecture", label: "Architecture", color: "text-purple-400" },
  { name: "delivery", label: "Delivery", color: "text-primary" },
  { name: "qa", label: "QA", color: "text-red-400" },
  { name: "risk", label: "Risk", color: "text-orange-400" },
  { name: "learning", label: "Learning", color: "text-[#00D4AA]" },
  { name: "financial", label: "Financial", color: "text-green-400" },
  { name: "sipe", label: "SIPE", color: "text-pink-400" },
  { name: "assessment", label: "Assessment", color: "text-indigo-400" },
  { name: "discovery", label: "Discovery", color: "text-sky-400" },
  { name: "communications", label: "Comms", color: "text-teal-400" },
  { name: "portfolio", label: "Portfolio", color: "text-violet-400" },
];

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentName>("governance");
  const [selectedEngId, setSelectedEngId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([fetch("/api/conversations"), fetch("/api/engagements")]).then(async ([cRes, eRes]) => {
      const [cData, eData] = await Promise.all([cRes.json(), eRes.json()]);
      setConversations(cData.conversations ?? []);
      setEngagements(eData.engagements ?? []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const msg = input;
    setInput("");

    // Optimistic update
    const optimisticMsg: Message = { role: "user", content: msg, ts: new Date().toISOString() };
    if (activeConv) {
      setActiveConv((c) => c ? { ...c, messages: [...(c.messages ?? []), optimisticMsg] } : c);
    }

    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: activeConv?.id,
        engagementId: selectedEngId ?? undefined,
        agentName: activeConv?.agentName ?? selectedAgent,
        message: msg,
        context: selectedEngId ? { engagementId: selectedEngId } : undefined,
      }),
    });
    const data = await res.json();

    const convRes = await fetch("/api/conversations");
    const convData = await convRes.json();
    const updated = (convData.conversations ?? []).find((c: Conversation) => c.id === (activeConv?.id ?? data.conversationId));
    if (updated) {
      setActiveConv(updated);
      setConversations(convData.conversations ?? []);
    }
    setSending(false);
  };

  const newConversation = () => {
    setActiveConv(null);
  };

  const agentColor = (name: AgentName) => AGENTS.find((a) => a.name === name)?.color ?? "text-muted-foreground";

  return (
    <div className="flex flex-col h-full">
      <Header title="FORGE Agent Chat" subtitle="Persistent conversation history · All 22 agents · Context-aware" />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 shrink-0 border-r border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <Button size="sm" variant="forge" className="w-full gap-2" onClick={newConversation}>
              <Plus size={12} /> New Chat
            </Button>
          </div>

          {/* Agent selector for new chat */}
          {!activeConv && (
            <div className="p-3 border-b border-border space-y-2">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Select Agent</div>
              <div className="grid grid-cols-2 gap-1">
                {AGENTS.map((a) => (
                  <button
                    key={a.name}
                    onClick={() => setSelectedAgent(a.name)}
                    className={`text-[10px] px-2 py-1.5 rounded border transition-colors text-left ${
                      selectedAgent === a.name ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Engagement</div>
              <select
                value={selectedEngId ?? ""}
                onChange={(e) => setSelectedEngId(e.target.value || null)}
                className="w-full h-7 px-2 text-xs rounded border border-border bg-card text-foreground focus:outline-none"
              >
                <option value="">None</option>
                {engagements.map((e) => <option key={e.id} value={e.id}>{e.clientName}</option>)}
              </select>
            </div>
          )}

          {/* Conversation history */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={`w-full text-left p-2 rounded text-xs transition-colors ${
                  activeConv?.id === conv.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Bot size={10} className={agentColor(conv.agentName)} />
                  <span className={`text-[10px] font-medium ${agentColor(conv.agentName)}`}>{conv.agentName}</span>
                </div>
                <div className="text-[10px] leading-snug truncate">{conv.title ?? "Conversation"}</div>
              </button>
            ))}
            {conversations.length === 0 && !loading && (
              <p className="text-[10px] text-muted-foreground px-2 pt-2">No conversations yet.</p>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <Bot size={16} className={activeConv ? agentColor(activeConv.agentName) : agentColor(selectedAgent)} />
            <span className="text-sm font-medium text-foreground">
              {activeConv ? `${activeConv.agentName} Agent` : `${selectedAgent} Agent`}
            </span>
            {activeConv && (
              <Badge variant="outline" className="text-[10px] h-4 ml-auto">
                {(activeConv.messages ?? []).length} messages
              </Badge>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!activeConv && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <Bot size={40} className="text-muted-foreground/40" />
                <div className="text-sm text-muted-foreground">Start a conversation with the {selectedAgent} agent</div>
                <div className="text-xs text-muted-foreground/60">Context-aware · Persistent history · Evidence-linked</div>
              </div>
            )}

            {(activeConv?.messages ?? []).map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={12} className={agentColor(activeConv!.agentName)} />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm"
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <div className="text-[9px] opacity-50 mt-1">{new Date(msg.ts).toLocaleTimeString()}</div>
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                    <User size={12} className="text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center">
                  <Loader2 size={12} className="animate-spin text-muted-foreground" />
                </div>
                <div className="bg-secondary rounded-xl px-4 py-2.5 text-sm text-muted-foreground">Thinking…</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder={`Message ${activeConv?.agentName ?? selectedAgent} agent…`}
                className="flex-1 h-10 px-4 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={sending}
              />
              <Button variant="forge" size="sm" onClick={send} disabled={sending || !input.trim()} className="h-10 px-4">
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </Button>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1.5 px-1">Press Enter to send · Shift+Enter for newline</div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { db } from "@/lib/db/client";
import { auditLog, profiles } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export const dynamic = "force-dynamic";

const ACTION_COLORS: Record<string, string> = {
  "user.created": "border-[#00D4AA]/30 text-[#00D4AA]",
  "user.updated": "border-primary/30 text-primary",
  "user.deleted": "border-red-500/30 text-red-400",
  "role.changed": "border-amber-400/30 text-amber-400",
  "user.deactivated": "border-red-500/30 text-red-400",
  "user.activated": "border-green-400/30 text-green-400",
};

export default async function AuditLogPage() {
  const entries = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      targetType: auditLog.targetType,
      targetId: auditLog.targetId,
      payload: auditLog.payload,
      createdAt: auditLog.createdAt,
      actorClerkId: auditLog.actorClerkId,
    })
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(100);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield size={18} className="text-amber-400" /> Audit Log
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Immutable record of all system and user actions</p>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{entries.length} recent events</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No audit events recorded yet.</p>
          ) : (
            <div className="divide-y divide-border/50">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 py-3">
                  <Badge variant="outline" className={`text-[9px] h-5 px-2 shrink-0 mt-0.5 ${ACTION_COLORS[entry.action] ?? "border-border text-muted-foreground"}`}>
                    {entry.action}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {entry.targetType && (
                        <span className="text-xs text-foreground capitalize">{entry.targetType}</span>
                      )}
                      {entry.targetId && (
                        <span className="text-[10px] text-muted-foreground font-mono">{entry.targetId.slice(0, 12)}…</span>
                      )}
                    </div>
                    {entry.payload && Object.keys(entry.payload).length > 0 && (
                      <div className="text-[10px] text-muted-foreground mt-0.5 font-mono truncate">
                        {JSON.stringify(entry.payload)}
                      </div>
                    )}
                    {entry.actorClerkId && (
                      <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                        Actor: {entry.actorClerkId.slice(0, 14)}…
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground/60 shrink-0 text-right">
                    <div>{new Date(entry.createdAt).toLocaleDateString()}</div>
                    <div>{new Date(entry.createdAt).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

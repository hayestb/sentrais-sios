import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Globe, Key, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  const envVars = [
    { key: "DATABASE_URL", set: !!process.env.DATABASE_URL, sensitive: true },
    { key: "CLERK_SECRET_KEY", set: !!process.env.CLERK_SECRET_KEY, sensitive: true },
    { key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", set: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, sensitive: false },
    { key: "CLERK_WEBHOOK_SECRET", set: !!process.env.CLERK_WEBHOOK_SECRET, sensitive: true },
    { key: "CALENDAR_ENCRYPTION_KEY", set: !!process.env.CALENDAR_ENCRYPTION_KEY, sensitive: true },
  ];

  const platformInfo = [
    { label: "Platform", value: "SIOS v2026" },
    { label: "Framework", value: "Next.js 15 (App Router)" },
    { label: "Database", value: "Neon Postgres (Drizzle ORM)" },
    { label: "Auth", value: "Clerk v7 (Core 3)" },
    { label: "AI Provider", value: "Vercel AI Gateway → Anthropic" },
    { label: "Model", value: "claude-sonnet-4.6" },
    { label: "Deployment", value: "Vercel (Fluid Compute)" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Settings size={18} className="text-primary" /> System Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Platform configuration and environment status</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Key size={13} className="text-amber-400" /> Environment Variables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {envVars.map(({ key, set, sensitive }) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${set ? "bg-[#00D4AA]" : "bg-red-400"}`} />
                  <span className="text-xs font-mono text-foreground flex-1 truncate">{key}</span>
                  <Badge variant="outline" className={`text-[9px] h-4 px-1.5 ${set ? "border-[#00D4AA]/30 text-[#00D4AA]" : "border-red-500/30 text-red-400"}`}>
                    {set ? (sensitive ? "set ●●●" : "set") : "missing"}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-3">
              Manage env vars via Vercel dashboard or <code className="bg-secondary px-0.5 rounded">vercel env add</code>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe size={13} className="text-primary" /> Platform Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {platformInfo.map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground w-28 shrink-0">{label}</span>
                  <span className="text-foreground font-medium">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database size={13} className="text-primary" /> Webhook Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Configure your Clerk webhook to sync user events to this platform.
          </p>
          <div className="p-3 rounded border border-border bg-secondary/30 space-y-2">
            <div className="text-xs font-medium text-foreground">Clerk Webhook Endpoint</div>
            <code className="text-xs text-primary block">{process.env.NEXT_PUBLIC_APP_URL ?? "https://your-domain.vercel.app"}/api/webhooks/clerk</code>
            <div className="text-[10px] text-muted-foreground">Subscribe to: <code className="bg-secondary px-0.5 rounded">user.created</code> <code className="bg-secondary px-0.5 rounded">user.updated</code> <code className="bg-secondary px-0.5 rounded">user.deleted</code></div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Set <code className="bg-secondary px-0.5 rounded text-[9px]">CLERK_WEBHOOK_SECRET</code> to the signing secret from the Clerk dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

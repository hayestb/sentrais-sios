"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SIOS Admin Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
        <AlertTriangle size={20} className="text-red-400" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-sm font-semibold text-foreground">Admin Error</h2>
        <p className="text-xs text-muted-foreground max-w-sm">{error.message}</p>
        {error.digest && <p className="text-[10px] font-mono text-muted-foreground/60">Digest: {error.digest}</p>}
      </div>
      <Button size="sm" variant="outline" onClick={reset} className="gap-1.5">
        <RefreshCw size={12} /> Retry
      </Button>
    </div>
  );
}

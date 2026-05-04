"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SIOS Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertTriangle size={20} className="text-red-400" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-sm font-semibold text-foreground">Something went wrong</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          {error.message || "An unexpected error occurred loading this page."}
        </p>
        {error.digest && (
          <p className="text-[10px] text-muted-foreground/60 font-mono">Digest: {error.digest}</p>
        )}
      </div>
      <Button size="sm" variant="outline" onClick={reset} className="gap-1.5">
        <RefreshCw size={12} /> Try again
      </Button>
    </div>
  );
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function truncateHash(hash: string, chars = 12): string {
  return `${hash.slice(0, chars)}...${hash.slice(-4)}`;
}

export function gateStatusColor(status: string): string {
  switch (status) {
    case "passed": return "text-green-500";
    case "active": return "text-forge-blue";
    case "blocked": return "text-red-500";
    case "failed": return "text-red-400";
    case "locked": return "text-muted-foreground";
    default: return "text-muted-foreground";
  }
}

export function agentStatusColor(status: string): string {
  switch (status) {
    case "running": return "bg-forge-blue";
    case "completed": return "bg-forge-green";
    case "failed": return "bg-destructive";
    case "escalated": return "bg-forge-amber";
    default: return "bg-muted";
  }
}

import { Bell, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-10">
      <div className="flex-1">
        <h1 className="text-sm font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-secondary rounded-md px-3 py-1.5 text-xs text-muted-foreground w-48">
        <Search size={12} />
        <span>Search engagements...</span>
      </div>

      {/* Alerts */}
      <div className="relative">
        <Bell size={16} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
        <Badge
          variant="destructive"
          className="absolute -top-1.5 -right-1.5 w-4 h-4 p-0 flex items-center justify-center text-[9px]"
        >
          2
        </Badge>
      </div>

      {/* Actions slot */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}

      {/* Identity */}
      <div className="flex items-center gap-2 pl-2 border-l border-border">
        <div className="w-7 h-7 rounded-full bg-[#0EA5E9]/20 border border-[#0EA5E9]/40 flex items-center justify-center">
          <span className="text-[#0EA5E9] text-xs font-bold">K</span>
        </div>
        <div className="hidden md:block">
          <div className="text-xs font-medium">Knox Phillips</div>
          <div className="text-[10px] text-muted-foreground">CPO / CRO</div>
        </div>
      </div>
    </header>
  );
}

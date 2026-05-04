import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        passed: "border-transparent bg-green-500/20 text-green-400 border-green-500/30",
        active: "border-transparent bg-[#0EA5E9]/20 text-[#0EA5E9] border-[#0EA5E9]/30",
        locked: "border-transparent bg-muted text-muted-foreground",
        blocked: "border-transparent bg-red-500/20 text-red-400 border-red-500/30",
        amber: "border-transparent bg-amber-500/20 text-amber-400 border-amber-500/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

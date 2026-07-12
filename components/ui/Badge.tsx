import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "subtle";
  size?: "sm" | "md";
}

export function Badge({
  className,
  children,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        size === "sm" && "text-xs px-2.5 py-0.5",
        size === "md" && "text-sm px-3 py-1",
        variant === "default" && "bg-surface-secondary text-foreground",
        variant === "outline" && "border border-border text-foreground-secondary",
        variant === "subtle" && "bg-accent/10 text-accent",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

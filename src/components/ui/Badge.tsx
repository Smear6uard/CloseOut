import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  color?: "gray" | "red" | "amber" | "green" | "blue" | "purple";
  className?: string;
}

const colorStyles = {
  gray: "bg-slate-100 text-slate-700",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
};

export function Badge({ children, color = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorStyles[color],
        className
      )}
    >
      {children}
    </span>
  );
}

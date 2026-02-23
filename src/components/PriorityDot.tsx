import { cn } from "../lib/utils";
import type { Priority } from "../lib/constants";

const dotColors: Record<Priority, string> = {
  low: "bg-slate-400",
  medium: "bg-amber-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

const labels: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function PriorityDot({
  priority,
  showLabel = false,
}: {
  priority: Priority;
  showLabel?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("inline-block h-2 w-2 rounded-full", dotColors[priority])} />
      {showLabel && (
        <span className="text-sm text-slate-600">{labels[priority]}</span>
      )}
    </span>
  );
}

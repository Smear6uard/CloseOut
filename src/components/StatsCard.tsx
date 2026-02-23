import { Card } from "./ui/Card";
import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
}

export function StatsCard({ icon: Icon, label, value, trend }: StatsCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="rounded-lg bg-brand-50 p-2.5">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
      </div>
      {trend && (
        <p
          className={cn(
            "mt-2 text-sm font-medium",
            trend.positive ? "text-green-600" : "text-red-600"
          )}
        >
          {trend.value}
        </p>
      )}
    </Card>
  );
}

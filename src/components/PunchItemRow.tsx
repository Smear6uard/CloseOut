import { Link } from "@tanstack/react-router";
import { StatusBadge } from "./StatusBadge";
import { PriorityDot } from "./PriorityDot";
import { TradeBadge } from "./TradeBadge";
import { formatDate } from "../lib/utils";
import type { ItemStatus, Priority, Trade } from "../lib/constants";

interface PunchItemRowProps {
  id: string;
  title: string;
  status: ItemStatus;
  priority: Priority;
  trade: Trade;
  location?: string;
  assignedTo?: string;
  dueDate?: number;
  createdAt: number;
}

export function PunchItemRow({
  id,
  title,
  status,
  priority,
  trade,
  location,
  assignedTo,
  dueDate,
  createdAt,
}: PunchItemRowProps) {
  return (
    <Link
      to="/items/$itemId"
      params={{ itemId: id }}
      className="block border-b border-slate-100 last:border-0"
    >
      <div className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50">
        <PriorityDot priority={priority} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-900">{title}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
            {location && <span>{location}</span>}
            {assignedTo && (
              <>
                <span>-</span>
                <span>{assignedTo}</span>
              </>
            )}
          </div>
        </div>
        <TradeBadge trade={trade} />
        <StatusBadge status={status} />
        <span className="hidden text-sm text-slate-500 sm:block">
          {dueDate ? formatDate(dueDate) : formatDate(createdAt)}
        </span>
      </div>
    </Link>
  );
}

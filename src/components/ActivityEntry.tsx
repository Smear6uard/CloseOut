import { timeAgo } from "../lib/utils";

interface ActivityEntryProps {
  action: string;
  details?: string;
  userName?: string;
  createdAt: number;
}

export function ActivityEntry({
  action,
  details,
  userName,
  createdAt,
}: ActivityEntryProps) {
  return (
    <div className="flex gap-3 py-3">
      <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-900">
          {userName && (
            <span className="font-medium">{userName} </span>
          )}
          {action}
        </p>
        {details && (
          <p className="mt-0.5 text-sm text-slate-500">{details}</p>
        )}
        <p className="mt-0.5 text-xs text-slate-400">{timeAgo(createdAt)}</p>
      </div>
    </div>
  );
}

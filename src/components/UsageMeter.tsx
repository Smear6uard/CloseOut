import { ProgressBar } from "./ui/ProgressBar";

interface UsageMeterProps {
  label: string;
  used: number;
  limit: number;
}

export function UsageMeter({ label, used, limit }: UsageMeterProps) {
  const isUnlimited = !isFinite(limit);
  const percentage = isUnlimited ? 0 : (used / limit) * 100;
  const color = percentage > 90 ? "red" : percentage > 70 ? "amber" : "blue";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm text-slate-500">
          {used} / {isUnlimited ? "Unlimited" : limit}
        </span>
      </div>
      {!isUnlimited && (
        <ProgressBar value={used} max={limit} color={color} />
      )}
    </div>
  );
}

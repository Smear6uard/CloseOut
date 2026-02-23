import { Badge } from "./ui/Badge";
import type { ItemStatus } from "../lib/constants";

const statusConfig: Record<ItemStatus, { label: string; color: "red" | "amber" | "blue" | "green" }> = {
  open: { label: "Open", color: "red" },
  in_progress: { label: "In Progress", color: "amber" },
  complete: { label: "Complete", color: "blue" },
  verified: { label: "Verified", color: "green" },
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  const config = statusConfig[status];
  return <Badge color={config.color}>{config.label}</Badge>;
}

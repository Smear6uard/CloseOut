import { Badge } from "./ui/Badge";
import type { Trade } from "../lib/constants";

const tradeColors: Partial<Record<Trade, "gray" | "blue" | "amber" | "green" | "purple" | "red">> = {
  Electrical: "amber",
  Plumbing: "blue",
  HVAC: "green",
  Painting: "purple",
  "Fire Protection": "red",
};

export function TradeBadge({ trade }: { trade: Trade }) {
  const color = tradeColors[trade] || "gray";
  return <Badge color={color}>{trade}</Badge>;
}

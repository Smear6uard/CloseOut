// Shared enums, color maps, and plan limits

export const PROJECT_STATUSES = ["active", "completed", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const ITEM_STATUSES = ["open", "in_progress", "complete", "verified"] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const PRIORITIES = ["low", "medium", "high", "critical"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const TRADES = [
  "General",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Painting",
  "Flooring",
  "Drywall",
  "Roofing",
  "Landscaping",
  "Carpentry",
  "Masonry",
  "Fire Protection",
  "Elevator",
  "Other",
] as const;
export type Trade = (typeof TRADES)[number];

export const STATUS_COLORS: Record<ItemStatus, string> = {
  open: "#EF4444",
  in_progress: "#F59E0B",
  complete: "#3B82F6",
  verified: "#10B981",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "#6B7280",
  medium: "#F59E0B",
  high: "#F97316",
  critical: "#EF4444",
};

export const PLAN_LIMITS = {
  free: {
    punchItemsPerMonth: 25,
    projectsLimit: 2,
    aiEnabled: false,
  },
  pro: {
    punchItemsPerMonth: 500,
    projectsLimit: 50,
    aiEnabled: true,
  },
  team: {
    punchItemsPerMonth: Infinity,
    projectsLimit: Infinity,
    aiEnabled: true,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export const VALID_STATUS_TRANSITIONS: Record<ItemStatus, ItemStatus[]> = {
  open: ["in_progress", "complete"],
  in_progress: ["complete"],
  complete: ["verified", "open"],
  verified: ["open"],
};

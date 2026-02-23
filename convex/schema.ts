import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    plan: v.string(), // "free" | "pro" | "team"
    punchItemLimit: v.number(),
    punchItemsCreatedThisMonth: v.number(),
    currentPeriodStart: v.number(),
    polarCustomerId: v.optional(v.string()),
    polarSubscriptionId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_polar_customer", ["polarCustomerId"]),

  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    address: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.string(), // "active" | "completed" | "archived"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"]),

  punchItems: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // "open" | "in_progress" | "complete" | "verified"
    priority: v.string(), // "low" | "medium" | "high" | "critical"
    trade: v.string(),
    location: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    defectPhotoId: v.optional(v.id("_storage")),
    completionPhotoId: v.optional(v.id("_storage")),
    aiTags: v.optional(v.array(v.string())),
    aiComparisonResult: v.optional(
      v.object({
        match: v.boolean(),
        confidence: v.number(),
        summary: v.string(),
      })
    ),
    completedAt: v.optional(v.number()),
    verifiedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_status", ["projectId", "status"])
    .index("by_project_trade", ["projectId", "trade"])
    .index("by_project_priority", ["projectId", "priority"]),

  activityLog: defineTable({
    projectId: v.id("projects"),
    punchItemId: v.optional(v.id("punchItems")),
    userId: v.id("users"),
    action: v.string(),
    details: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_punch_item", ["punchItemId"])
    .index("by_user", ["userId"]),
});

import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  QueryCtx,
  MutationCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { VALID_STATUS_TRANSITIONS } from "../src/lib/constants";
import { Id } from "./_generated/dataModel";

async function getAuthUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
  if (!user) throw new Error("User not found");

  return user;
}

async function verifyProjectOwnership(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  userId: Id<"users">
) {
  const project = await ctx.db.get(projectId);
  if (!project) throw new Error("Project not found");
  if (project.userId !== userId) throw new Error("Not authorized");
  return project;
}

export const listByProject = query({
  args: {
    projectId: v.id("projects"),
    status: v.optional(v.string()),
    trade: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await verifyProjectOwnership(ctx, args.projectId, user._id);

    let items = await ctx.db
      .query("punchItems")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Filter in handler — Convex doesn't support compound inequality filters
    if (args.status) {
      items = items.filter((i) => i.status === args.status);
    }
    if (args.trade) {
      items = items.filter((i) => i.trade === args.trade);
    }
    if (args.priority) {
      items = items.filter((i) => i.priority === args.priority);
    }
    if (args.assignedTo) {
      items = items.filter((i) => i.assignedTo === args.assignedTo);
    }

    // Sort descending by createdAt
    items.sort((a, b) => b.createdAt - a.createdAt);

    return items;
  },
});

export const get = query({
  args: { punchItemId: v.id("punchItems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.punchItemId);
    if (!item) throw new Error("Punch item not found");

    return item;
  },
});

export const getRecent = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const allItems: any[] = [];

    for (const project of projects) {
      const items = await ctx.db
        .query("punchItems")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();
      allItems.push(...items);
    }

    // Sort descending by createdAt and take 10
    allItems.sort((a, b) => b.createdAt - a.createdAt);
    return allItems.slice(0, 10);
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.string(),
    trade: v.string(),
    location: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    defectPhotoId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await verifyProjectOwnership(ctx, args.projectId, user._id);

    const now = Date.now();

    const itemId = await ctx.db.insert("punchItems", {
      projectId: args.projectId,
      userId: user._id,
      title: args.title,
      description: args.description,
      status: "open",
      priority: args.priority,
      trade: args.trade,
      location: args.location,
      assignedTo: args.assignedTo,
      dueDate: args.dueDate,
      defectPhotoId: args.defectPhotoId,
      createdAt: now,
      updatedAt: now,
    });

    // Log creation
    await ctx.db.insert("activityLog", {
      projectId: args.projectId,
      punchItemId: itemId,
      userId: user._id,
      action: "created",
      details: `Created punch item: ${args.title}`,
      createdAt: now,
    });

    // Increment monthly usage counter
    await ctx.db.patch(user._id, {
      punchItemsCreatedThisMonth: user.punchItemsCreatedThisMonth + 1,
      updatedAt: now,
    });

    return itemId;
  },
});

export const update = mutation({
  args: {
    punchItemId: v.id("punchItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    trade: v.optional(v.string()),
    location: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const item = await ctx.db.get(args.punchItemId);
    if (!item) throw new Error("Punch item not found");
    await verifyProjectOwnership(ctx, item.projectId, user._id);

    const { punchItemId, ...fields } = args;
    const updates: Record<string, any> = { updatedAt: Date.now() };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }

    await ctx.db.patch(args.punchItemId, updates);

    await ctx.db.insert("activityLog", {
      projectId: item.projectId,
      punchItemId: args.punchItemId,
      userId: user._id,
      action: "updated",
      details: `Updated fields: ${Object.keys(fields).filter((k) => fields[k as keyof typeof fields] !== undefined).join(", ")}`,
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    punchItemId: v.id("punchItems"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const item = await ctx.db.get(args.punchItemId);
    if (!item) throw new Error("Punch item not found");
    await verifyProjectOwnership(ctx, item.projectId, user._id);

    const currentStatus = item.status as keyof typeof VALID_STATUS_TRANSITIONS;
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
    if (!allowedTransitions?.includes(args.status as any)) {
      throw new Error(
        `Invalid status transition: ${item.status} -> ${args.status}`
      );
    }

    const now = Date.now();
    const updates: Record<string, any> = {
      status: args.status,
      updatedAt: now,
    };

    if (args.status === "complete") {
      updates.completedAt = now;
    }
    if (args.status === "verified") {
      updates.verifiedAt = now;
    }
    if (args.status === "open") {
      updates.completedAt = undefined;
      updates.verifiedAt = undefined;
    }

    await ctx.db.patch(args.punchItemId, updates);

    await ctx.db.insert("activityLog", {
      projectId: item.projectId,
      punchItemId: args.punchItemId,
      userId: user._id,
      action: "status_changed",
      details: `Status changed: ${item.status} → ${args.status}`,
      createdAt: now,
    });
  },
});

export const assignTo = mutation({
  args: {
    punchItemId: v.id("punchItems"),
    assignedTo: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const item = await ctx.db.get(args.punchItemId);
    if (!item) throw new Error("Punch item not found");
    await verifyProjectOwnership(ctx, item.projectId, user._id);

    await ctx.db.patch(args.punchItemId, {
      assignedTo: args.assignedTo,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("activityLog", {
      projectId: item.projectId,
      punchItemId: args.punchItemId,
      userId: user._id,
      action: "assigned",
      details: `Assigned to: ${args.assignedTo}`,
      createdAt: Date.now(),
    });
  },
});

export const addCompletionPhoto = mutation({
  args: {
    punchItemId: v.id("punchItems"),
    completionPhotoId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const item = await ctx.db.get(args.punchItemId);
    if (!item) throw new Error("Punch item not found");
    await verifyProjectOwnership(ctx, item.projectId, user._id);

    await ctx.db.patch(args.punchItemId, {
      completionPhotoId: args.completionPhotoId,
      updatedAt: Date.now(),
    });

    // If defect photo exists, trigger AI comparison
    if (item.defectPhotoId) {
      await ctx.scheduler.runAfter(0, internal.classify.comparePhotos, {
        punchItemId: args.punchItemId,
        defectPhotoId: item.defectPhotoId,
        completionPhotoId: args.completionPhotoId,
      });
    }

    await ctx.db.insert("activityLog", {
      projectId: item.projectId,
      punchItemId: args.punchItemId,
      userId: user._id,
      action: "completion_photo_added",
      details: "Completion photo uploaded",
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { punchItemId: v.id("punchItems") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const item = await ctx.db.get(args.punchItemId);
    if (!item) throw new Error("Punch item not found");
    await verifyProjectOwnership(ctx, item.projectId, user._id);

    // Delete activity log entries for this item
    const logs = await ctx.db
      .query("activityLog")
      .withIndex("by_punch_item", (q) => q.eq("punchItemId", args.punchItemId))
      .collect();
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }

    await ctx.db.delete(args.punchItemId);
  },
});

// Internal mutations called by AI actions
export const updateAiTags = internalMutation({
  args: {
    punchItemId: v.id("punchItems"),
    aiTags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.punchItemId, {
      aiTags: args.aiTags,
      updatedAt: Date.now(),
    });
  },
});

export const updateAiComparison = internalMutation({
  args: {
    punchItemId: v.id("punchItems"),
    aiComparisonResult: v.object({
      match: v.boolean(),
      confidence: v.number(),
      summary: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.punchItemId, {
      aiComparisonResult: args.aiComparisonResult,
      updatedAt: Date.now(),
    });
  },
});

import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";

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
  projectId: string,
  userId: string
) {
  const project = await ctx.db.get(projectId as any);
  if (!project) throw new Error("Project not found");
  if (project.userId !== userId) throw new Error("Not authorized");
  return project;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Compute counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const items = await ctx.db
          .query("punchItems")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        const total = items.length;
        const open = items.filter((i) => i.status === "open").length;
        const inProgress = items.filter((i) => i.status === "in_progress").length;
        const completed = items.filter(
          (i) => i.status === "complete" || i.status === "verified"
        ).length;

        return { ...project, total, open, inProgress, completed };
      })
    );

    return projectsWithCounts;
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const project = await verifyProjectOwnership(ctx, args.projectId, user._id);
    return project;
  },
});

export const getStats = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await verifyProjectOwnership(ctx, args.projectId, user._id);

    const items = await ctx.db
      .query("punchItems")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const byStatus: Record<string, number> = {};
    const byTrade: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    for (const item of items) {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
      byTrade[item.trade] = (byTrade[item.trade] || 0) + 1;
      byPriority[item.priority] = (byPriority[item.priority] || 0) + 1;
    }

    return {
      total: items.length,
      byStatus,
      byTrade,
      byPriority,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    address: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const now = Date.now();

    return await ctx.db.insert("projects", {
      userId: user._id,
      name: args.name,
      address: args.address,
      description: args.description,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await verifyProjectOwnership(ctx, args.projectId, user._id);

    const { projectId, ...fields } = args;
    const updates: Record<string, any> = { updatedAt: Date.now() };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }

    await ctx.db.patch(args.projectId, updates);
  },
});

export const remove = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await verifyProjectOwnership(ctx, args.projectId, user._id);

    // Cascade: delete all punch items for this project
    const items = await ctx.db
      .query("punchItems")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    // Cascade: delete all activity log entries for this project
    const logs = await ctx.db
      .query("activityLog")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }

    // Delete the project itself
    await ctx.db.delete(args.projectId);
  },
});

import { v } from "convex/values";
import { query, QueryCtx } from "./_generated/server";

async function getAuthUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
  if (!user) throw new Error("User not found");

  return user;
}

export const getProjectReport = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (project.userId !== user._id) throw new Error("Not authorized");

    const items = await ctx.db
      .query("punchItems")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const activityLogs = await ctx.db
      .query("activityLog")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Group items by status then by trade
    const byStatus: Record<string, typeof items> = {};
    const byTrade: Record<string, typeof items> = {};

    for (const item of items) {
      if (!byStatus[item.status]) byStatus[item.status] = [];
      byStatus[item.status].push(item);

      if (!byTrade[item.trade]) byTrade[item.trade] = [];
      byTrade[item.trade].push(item);
    }

    const total = items.length;
    const open = items.filter((i) => i.status === "open").length;
    const inProgress = items.filter((i) => i.status === "in_progress").length;
    const complete = items.filter((i) => i.status === "complete").length;
    const verified = items.filter((i) => i.status === "verified").length;

    return {
      project,
      summary: {
        total,
        open,
        inProgress,
        complete,
        verified,
        completionPercentage:
          total === 0
            ? 0
            : Math.round(((complete + verified) / total) * 100),
      },
      itemsByStatus: byStatus,
      itemsByTrade: byTrade,
      activityLog: activityLogs.sort((a, b) => b.createdAt - a.createdAt),
    };
  },
});

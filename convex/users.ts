import { v } from "convex/values";
import { query, mutation, internalMutation, QueryCtx, MutationCtx } from "./_generated/server";
import { PLAN_LIMITS } from "../src/lib/constants";

/** Reusable auth helper — returns the authenticated user or throws. */
async function getAuthUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  return { identity, user };
}

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    return user;
  },
});

export const getUsage = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await getAuthUser(ctx);
    if (!user) return null;

    // Reset counter if we're in a new billing period
    const now = Date.now();
    const periodStart = user.currentPeriodStart;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;

    const currentCount =
      now - periodStart > oneMonth ? 0 : user.punchItemsCreatedThisMonth;

    return {
      punchItemsCreatedThisMonth: currentCount,
      punchItemLimit: user.punchItemLimit,
    };
  },
});

export const createOrUpdate = mutation({
  args: {
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      plan: "free",
      punchItemLimit: PLAN_LIMITS.free.punchItemsPerMonth,
      punchItemsCreatedThisMonth: 0,
      currentPeriodStart: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update a user's billing info from Polar webhook events.
 * This is an internalMutation so it can be called from HTTP actions
 * without requiring an auth context.
 */
export const updateBilling = internalMutation({
  args: {
    userId: v.id("users"),
    plan: v.string(),
    polarCustomerId: v.optional(v.string()),
    polarSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const planKey = args.plan as keyof typeof PLAN_LIMITS;
    const limits = PLAN_LIMITS[planKey];
    if (!limits) throw new Error(`Invalid plan: ${args.plan}`);

    const now = Date.now();

    await ctx.db.patch(args.userId, {
      plan: args.plan,
      punchItemLimit: limits.punchItemsPerMonth,
      polarCustomerId: args.polarCustomerId,
      polarSubscriptionId: args.polarSubscriptionId,
      updatedAt: now,
    });
  },
});


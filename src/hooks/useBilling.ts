import { useMemo } from "react";
import { useEnsureUser } from "./useEnsureUser";
import { POLAR_PRODUCTS, buildCheckoutUrl, buildPortalUrl } from "../lib/polar";
import { PLAN_LIMITS, type PlanType } from "../lib/constants";

const APP_URL = import.meta.env.VITE_APP_URL as string;

/**
 * Returns a Polar checkout URL for the given plan, or null if user isn't loaded.
 */
export function useCheckoutUrl(plan: "pro" | "team") {
  const { user } = useEnsureUser();

  return useMemo(() => {
    if (!user) return null;

    const productId = POLAR_PRODUCTS[plan];
    if (!productId) return null;

    return buildCheckoutUrl({
      productId,
      customerEmail: user.email,
      successUrl: `${APP_URL}/settings?checkout=success`,
      metadata: { convexUserId: user._id },
    });
  }, [user, plan]);
}

/**
 * Returns a Polar customer portal URL, or null if user has no subscription.
 */
export function usePortalUrl() {
  const { user } = useEnsureUser();

  return useMemo(() => {
    if (!user?.polarCustomerId) return null;
    return buildPortalUrl(user.polarCustomerId);
  }, [user]);
}

/**
 * Returns the current plan, feature flags, and limits for the authenticated user.
 */
export function usePlanAccess() {
  const { user, isLoading } = useEnsureUser();

  return useMemo(() => {
    const plan = (user?.plan ?? "free") as PlanType;
    const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

    return {
      plan,
      isLoading,
      isPro: plan === "pro" || plan === "team",
      isTeam: plan === "team",
      canUseAI: limits.aiEnabled,
      canExportPDF: plan !== "free",
      punchItemsPerMonth: limits.punchItemsPerMonth,
      projectsLimit: limits.projectsLimit,
    };
  }, [user, isLoading]);
}

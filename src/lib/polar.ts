/**
 * Polar product configuration and URL builders.
 * Client-side only — uses VITE_ env vars available in the browser.
 */

export const POLAR_PRODUCTS = {
  pro: import.meta.env.VITE_POLAR_PRO_PRODUCT_ID ?? "",
  team: import.meta.env.VITE_POLAR_TEAM_PRODUCT_ID ?? "",
};

/**
 * Builds a Polar hosted checkout URL.
 * Uses Polar's documented query parameters: `products`, `customer_email`, `success_url`.
 */
export function buildCheckoutUrl(params: {
  productId: string;
  customerEmail: string;
  successUrl: string;
  metadata?: Record<string, string>;
}): string {
  const checkoutUrl = new URL("https://polar.sh/checkout");
  checkoutUrl.searchParams.set("products", params.productId);
  checkoutUrl.searchParams.set("customer_email", params.customerEmail);
  checkoutUrl.searchParams.set("success_url", params.successUrl);
  if (params.metadata) {
    for (const [key, value] of Object.entries(params.metadata)) {
      checkoutUrl.searchParams.set(`metadata[${key}]`, value);
    }
  }
  return checkoutUrl.toString();
}

/**
 * Builds a Polar customer portal URL.
 */
export function buildPortalUrl(customerId: string): string {
  return `https://polar.sh/customer-portal?customerId=${encodeURIComponent(customerId)}`;
}

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

/**
 * Verify Polar webhook signature using the Standard Webhooks spec.
 * Polar uses the `webhook-id`, `webhook-timestamp`, `webhook-signature` headers.
 * The signature is an HMAC-SHA256 of `${webhookId}.${timestamp}.${body}` using the secret.
 */
async function verifyWebhookSignature(
  body: string,
  headers: {
    webhookId: string;
    timestamp: string;
    signature: string;
  },
  secret: string
): Promise<boolean> {
  // Polar prefixes the secret with "whsec_" and base64-encodes it
  const secretBytes = base64Decode(
    secret.startsWith("whsec_") ? secret.slice(6) : secret
  );

  const signedContent = `${headers.webhookId}.${headers.timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent)
  );
  const expectedSig = `v1,${base64Encode(signatureBytes)}`;

  // The header may contain multiple signatures separated by spaces
  const signatures = headers.signature.split(" ");
  return signatures.some((sig) => sig === expectedSig);
}

function base64Decode(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64Encode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Polar webhook handler.
 *
 * Receives subscription events from Polar and updates user billing in Convex.
 * Validates the webhook signature using Standard Webhooks HMAC-SHA256.
 *
 * Webhook URL to configure in Polar dashboard:
 *   https://<your-convex-deployment>.convex.cloud/api/webhook/polar
 */
http.route({
  path: "/api/webhook/polar",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const webhookId = request.headers.get("webhook-id");
    const timestamp = request.headers.get("webhook-timestamp");
    const webhookSignature = request.headers.get("webhook-signature");

    if (!webhookId || !timestamp || !webhookSignature) {
      return new Response("Missing webhook headers", { status: 400 });
    }

    // Reject timestamps older than 5 minutes to prevent replay attacks
    const now = Math.floor(Date.now() / 1000);
    const tsNum = parseInt(timestamp, 10);
    if (isNaN(tsNum) || Math.abs(now - tsNum) > 300) {
      return new Response("Timestamp too old or invalid", { status: 400 });
    }

    const body = await request.text();

    // Verify cryptographic signature
    const isValid = await verifyWebhookSignature(
      body,
      { webhookId, timestamp, signature: webhookSignature },
      webhookSecret
    );
    if (!isValid) {
      return new Response("Invalid signature", { status: 403 });
    }

    let event: {
      type: string;
      data: {
        id: string;
        product_id: string;
        customer_id: string;
        status: string;
        metadata?: Record<string, string>;
      };
    };

    try {
      event = JSON.parse(body);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const proProductId = process.env.POLAR_PRO_PRODUCT_ID;
    const teamProductId = process.env.POLAR_TEAM_PRODUCT_ID;

    function planFromProductId(productId: string): string {
      if (productId === proProductId) return "pro";
      if (productId === teamProductId) return "team";
      return "free";
    }

    try {
      switch (event.type) {
        case "subscription.created":
        case "subscription.updated": {
          const sub = event.data;
          const convexUserId = sub.metadata?.convexUserId;
          if (!convexUserId) {
            console.error("No convexUserId in subscription metadata");
            return new Response("Missing convexUserId metadata", {
              status: 400,
            });
          }

          const plan =
            sub.status === "active"
              ? planFromProductId(sub.product_id)
              : "free";

          await ctx.runMutation(internal.users.updateBilling, {
            userId: convexUserId as Id<"users">,
            plan,
            polarCustomerId: sub.customer_id,
            polarSubscriptionId: sub.id,
          });
          break;
        }

        case "subscription.canceled":
        case "subscription.revoked": {
          const sub = event.data;
          const convexUserId = sub.metadata?.convexUserId;
          if (!convexUserId) {
            console.error("No convexUserId in subscription metadata");
            return new Response("Missing convexUserId metadata", {
              status: 400,
            });
          }

          await ctx.runMutation(internal.users.updateBilling, {
            userId: convexUserId as Id<"users">,
            plan: "free",
            polarCustomerId: sub.customer_id,
            polarSubscriptionId: undefined,
          });
          break;
        }

        default:
          // Unhandled event type — acknowledge receipt
          break;
      }
    } catch (error) {
      console.error("Webhook handler error:", error);
      return new Response("Internal error", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;

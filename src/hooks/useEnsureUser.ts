import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Syncs the Clerk identity → Convex `users` table on first login.
 * Returns the Convex user record (null while loading/syncing).
 *
 * The tokenIdentifier format Convex generates from Clerk JWTs is:
 *   `<issuerDomain>|<clerkUserId>`
 * e.g. "https://your-app.clerk.accounts.dev|user_2abc123"
 */
export function useEnsureUser() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const convexUser = useQuery(api.users.getMe);
  const createOrUpdate = useMutation(api.users.createOrUpdate);
  const syncing = useRef(false);
  const [syncError, setSyncError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isClerkLoaded || !clerkUser || convexUser !== null || syncing.current)
      return;

    syncing.current = true;
    setSyncError(null);

    const issuerDomain = import.meta.env.VITE_CLERK_ISSUER_DOMAIN as string;
    const tokenIdentifier = `${issuerDomain}|${clerkUser.id}`;

    createOrUpdate({
      tokenIdentifier,
      email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
      name: clerkUser.fullName ?? undefined,
      imageUrl: clerkUser.imageUrl ?? undefined,
    })
      .catch((err: unknown) => {
        setSyncError(
          err instanceof Error ? err : new Error("Failed to sync user")
        );
      })
      .finally(() => {
        syncing.current = false;
      });
  }, [isClerkLoaded, clerkUser, convexUser, createOrUpdate]);

  return {
    user: convexUser,
    isLoading:
      !isClerkLoaded || (clerkUser !== null && convexUser === undefined),
    syncError,
  };
}

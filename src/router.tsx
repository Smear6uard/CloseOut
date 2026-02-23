import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import type { ReactNode } from "react";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string;

export function createRouter() {
  let convexClient: ConvexReactClient | undefined;
  let queryClient: QueryClient | undefined;

  if (CONVEX_URL) {
    convexClient = new ConvexReactClient(CONVEX_URL);
    const convexQueryClient = new ConvexQueryClient(convexClient);

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          queryKeyHashFn: convexQueryClient.hashFn(),
          queryFn: convexQueryClient.queryFn(),
        },
      },
    });
    convexQueryClient.connect(queryClient);
  }

  const router = createTanStackRouter({
    routeTree,
    context: {},
    Wrap: ({ children }: { children: ReactNode }) => {
      if (convexClient && queryClient) {
        return (
          <ConvexProvider client={convexClient}>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </ConvexProvider>
        );
      }
      return <>{children}</>;
    },
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

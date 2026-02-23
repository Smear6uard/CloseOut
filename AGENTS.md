# AGENTS.md — CloseOut Multi-Agent Coordination

## File Ownership

### Agent 1 (Backend)
- `convex/schema.ts` — database schema
- `convex/users.ts` — user CRUD + billing mutations
- `convex/projects.ts` — project CRUD
- `convex/punchItems.ts` — punch item CRUD + status machine
- `convex/photos.ts` — file storage
- `convex/classify.ts` — AI actions (OpenAI)
- `convex/reports.ts` — report data queries
- `src/lib/constants.ts` — shared enums, plan limits

### Agent 2 (UI)
- `src/routes/**` — all route components
- `src/components/**` — all React components
- `src/router.tsx` — router + provider setup
- `src/lib/utils.ts` — UI utilities
- `src/lib/types.ts` — type re-exports
- `src/app.css` — global styles
- `tailwind.config.ts` — Tailwind theme

### Agent 3 (Integration)
- `convex/auth.config.ts` — Clerk JWT config
- `convex/http.ts` — HTTP actions (webhook)
- `src/lib/auth.ts` — Clerk re-exports
- `src/lib/convex-provider.tsx` — ConvexClerkProvider wrapper
- `src/lib/polar.ts` — Polar client + URL builders
- `src/lib/generateReport.tsx` — PDF generation
- `src/lib/email.ts` — email templates
- `src/hooks/useEnsureUser.ts` — Clerk→Convex user sync
- `src/hooks/useBilling.ts` — billing hooks
- `.env.example` — environment variable template

---

## Dev Commands

```bash
npm run dev          # Start Vite dev server
npx convex dev       # Start Convex dev server (watch mode)
npx tsc --noEmit     # Type-check all files
```

---

## Key Patterns

### Data Fetching
All data flows through Convex:
```tsx
const projects = useQuery(api.projects.list);
const createProject = useMutation(api.projects.create);
```

### Authentication
Clerk handles auth; Convex validates JWTs automatically:
- `ClerkProvider` → `ConvexProviderWithClerk` (in `src/lib/convex-provider.tsx`)
- `useEnsureUser()` syncs Clerk identity to Convex `users` table on first login
- Backend functions use `ctx.auth.getUserIdentity()` for auth checks

### Billing (Polar)
- Checkout: `useCheckoutUrl("pro")` returns a Polar hosted checkout URL
- Portal: `usePortalUrl()` returns customer portal URL (null if no subscription)
- Plan access: `usePlanAccess()` returns current plan + feature flags
- Webhook: Polar → `convex/http.ts` → `updateBilling` mutation

### Server Functions
This is a Vite SPA (not TanStack Start). There are no server functions.
Server-side logic lives in Convex:
- **Queries/Mutations**: `convex/*.ts` functions
- **HTTP Actions**: `convex/http.ts` for external webhooks
- **Node Actions**: For npm packages that need Node.js (e.g., Resend email)

### PDF Reports
Reports generate client-side using `@react-pdf/renderer`:
```tsx
import { downloadReportPdf } from "../lib/generateReport";
const reportData = useQuery(api.reports.getProjectReport, { projectId });
await downloadReportPdf(reportData);
```

---

## Agent 1 Must-Fix Items

1. **Schema done** (Agent 3 updated): `stripeCustomerId` → `polarCustomerId`, `stripeSubscriptionId` → `polarSubscriptionId`, `by_stripe_customer` → `by_polar_customer`

2. **users.ts done** (Agent 3 updated): `updatePlan` → `updateBilling` (now an `internalMutation`), args use Polar fields, callable without auth context

3. **constants.ts done** (Agent 3 updated): `enterprise` → `team` in `PLAN_LIMITS`

4. **Remaining**: If any other files reference `stripeCustomerId`, `stripeSubscriptionId`, `enterprise` plan, or `updatePlan` — update them to use the new names.

## Agent 2 Must-Fix Items

1. **router.tsx**: Replace `ConvexProvider` with `ConvexClerkProvider` from `src/lib/convex-provider`:
   ```tsx
   import { ConvexClerkProvider } from "./lib/convex-provider";
   // In the Wrap function:
   <ConvexClerkProvider convexClient={convexClient}>
     <QueryClientProvider client={queryClient}>
       {children}
     </QueryClientProvider>
   </ConvexClerkProvider>
   ```

2. **_authed.tsx**: Add `useEnsureUser()` call and auth guard:
   ```tsx
   import { useEnsureUser } from "../hooks/useEnsureUser";
   import { SignedIn, SignedOut } from "../lib/auth";
   // Guard: redirect to /login if not signed in
   ```

3. **login.tsx**: Replace placeholder with Clerk `<SignIn />` component:
   ```tsx
   import { SignIn } from "../lib/auth";
   ```

4. **settings.tsx**: Wire upgrade/manage billing buttons:
   ```tsx
   import { useCheckoutUrl, usePortalUrl, usePlanAccess } from "../hooks/useBilling";
   // Upgrade: window.location.href = checkoutUrl
   // Manage: window.location.href = portalUrl
   // Replace "enterprise" references with "team"
   ```

---

## Testing Checklist

- [ ] `npx convex dev` — auth.config.ts deploys without errors
- [ ] `npx tsc --noEmit` — all files compile
- [ ] `npm run dev` — app starts, no runtime errors
- [ ] Sign in via Clerk → user record created in Convex
- [ ] `useEnsureUser()` syncs Clerk user on first login
- [ ] Checkout URL redirects to Polar sandbox
- [ ] Polar webhook fires → `updateBilling` updates user plan
- [ ] `usePlanAccess()` reflects correct plan after upgrade
- [ ] PDF report downloads for Pro/Team users
- [ ] Free users cannot generate PDF reports

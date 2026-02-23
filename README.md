# CloseOut

AI-powered construction punch list management app.

## Tech Stack

- **Frontend**: React 19 + Vite + TanStack Router (file-based routing) + Tailwind CSS
- **Backend**: [Convex](https://convex.dev) (database, real-time queries, file storage, HTTP actions)
- **Auth**: [Clerk](https://clerk.com) (JWT-based, synced to Convex via `useEnsureUser` hook)
- **Billing**: [Polar](https://polar.sh) (hosted checkout, customer portal, subscription webhooks)
- **AI**: OpenAI GPT-4o Vision (defect photo classification, before/after comparison)
- **PDF**: [@react-pdf/renderer](https://react-pdf.org) (client-side report generation)

## Prerequisites

- Node.js 18+
- npm
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) account
- A [Polar](https://polar.sh) account (for billing)
- An [OpenAI](https://platform.openai.com) API key (for AI features)

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in all values in .env (see Environment Variables below)

# Start Convex dev server (in a separate terminal)
npx convex dev

# Start Vite dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `VITE_CONVEX_URL` | Client | Convex deployment URL |
| `VITE_CLERK_PUBLISHABLE_KEY` | Client | Clerk publishable key |
| `CLERK_SECRET_KEY` | Convex | Clerk secret key |
| `CLERK_JWT_ISSUER_DOMAIN` | Convex | Clerk JWT issuer (e.g. `https://your-app.clerk.accounts.dev`) |
| `VITE_CLERK_ISSUER_DOMAIN` | Client | Same as above, for client-side user sync |
| `POLAR_ACCESS_TOKEN` | Convex | Polar API access token |
| `POLAR_WEBHOOK_SECRET` | Convex | Polar webhook signing secret |
| `POLAR_PRO_PRODUCT_ID` | Convex | Polar product ID for Pro plan |
| `POLAR_TEAM_PRODUCT_ID` | Convex | Polar product ID for Team plan |
| `VITE_POLAR_PRO_PRODUCT_ID` | Client | Same Pro product ID, client-accessible |
| `VITE_POLAR_TEAM_PRODUCT_ID` | Client | Same Team product ID, client-accessible |
| `VITE_APP_URL` | Client | App base URL (e.g. `http://localhost:5173`) |
| `OPENAI_API_KEY` | Convex | OpenAI API key (for AI features) |

**Client** vars use the `VITE_` prefix and are available in the browser.
**Convex** vars are set in the [Convex dashboard](https://dashboard.convex.dev) and available in backend functions.

## Clerk Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. In the Clerk dashboard, go to **JWT Templates** and create a template named `convex`
3. Copy the Issuer URL — this is your `CLERK_JWT_ISSUER_DOMAIN`
4. Set the publishable key and secret key in your env vars

## Polar Setup

1. Create a Polar organization at [polar.sh](https://polar.sh)
2. Create two products: **Pro** and **Team** with your desired pricing
3. Copy the product IDs to your env vars
4. Set up a webhook pointing to your Convex HTTP endpoint:
   `https://<deployment>.convex.cloud/api/webhook/polar`
5. Select subscription events: `subscription.created`, `subscription.updated`, `subscription.canceled`, `subscription.revoked`

## Project Structure

```
├── convex/              # Backend (Convex functions + schema)
│   ├── schema.ts        # Database schema
│   ├── auth.config.ts   # Clerk JWT provider config
│   ├── http.ts          # HTTP actions (Polar webhook)
│   ├── users.ts         # User CRUD + billing
│   ├── projects.ts      # Project CRUD
│   ├── punchItems.ts    # Punch item CRUD + status machine
│   ├── photos.ts        # File storage
│   ├── classify.ts      # AI actions (GPT-4o Vision)
│   └── reports.ts       # Report data queries
├── src/
│   ├── routes/          # File-based routes (TanStack Router)
│   ├── components/      # React components
│   ├── hooks/           # Custom hooks (useEnsureUser, useBilling)
│   ├── lib/             # Utilities (auth, billing, PDF, email, constants)
│   └── router.tsx       # Router + provider setup
└── .env.example         # Required environment variables
```

## Deployment

### Convex

```bash
npx convex deploy
```

Set all non-`VITE_` env vars in the [Convex dashboard](https://dashboard.convex.dev).

### Frontend (Vercel / Netlify)

1. Connect your Git repo
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add all `VITE_*` environment variables
5. Deploy

## Plans

| Feature | Free | Pro | Team |
|---------|------|-----|------|
| Punch items/month | 25 | 500 | Unlimited |
| Projects | 2 | 50 | Unlimited |
| AI classification | No | Yes | Yes |
| PDF reports | No | Yes | Yes |

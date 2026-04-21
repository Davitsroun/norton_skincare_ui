# Nature Leaf Frontend

Modern Next.js frontend for an e-commerce-style CBD/wellness app, including:

- Public auth pages (`/`, `/register`, `/forgot-password`)
- Dashboard experience (`/home`, `/shop`, `/cart`, `/favorites`, `/history`, `/profile`, `/about`)
- Admin area (`/admin/*`)
- Custom loading, not-found, and error pages

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui + Radix UI + Lucide icons
- NextAuth (mock credentials + Keycloak mode)

## Prerequisites

- Node.js 18+ (recommended: Node 20+)
- npm (project currently uses `package-lock.json`)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy the example file and set values:

```bash
cp .env.local.example .env.local
```

Required vars (`.env.local.example`):

- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_AUTH_MODE` (`mock` or non-mock auth flow)
- `KEYCLOAK_ISSUER`
- `KEYCLOAK_CLIENT_ID`
- `KEYCLOAK_CLIENT_SECRET`

## Auth Modes

Auth is configured in `auth.ts`:

- **Mock mode** (`NEXT_PUBLIC_AUTH_MODE=mock`)
  - Uses credentials provider and users from mock data.
- **Keycloak mode**
  - Uses Keycloak provider via NextAuth environment variables.

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Project Structure (high level)

```text
app/                  # Next.js App Router pages/layouts
  (dashboard)/        # authenticated user pages
  (admin)/            # admin pages
  api/auth/[...nextauth]/
components/           # shared UI + feature components
  ui/                 # shadcn/ui components
lib/                  # contexts, auth helpers, mock-data
public/               # static assets (images, svg, gif)
auth.ts               # NextAuth options/config
```

## Main Routes

### Public

- `/` - login page
- `/login` - redirects to `/`
- `/register`
- `/forgot-password`

### Dashboard

- `/home`
- `/shop`
- `/shop/[productId]`
- `/cart`
- `/favorites`
- `/history`
- `/profile`
- `/about`

### Admin

- `/admin`
- `/admin/orders`
- `/admin/products`
- `/admin/users`
- `/admin/offers`
- `/admin/profile`
- `/admin/settings`
- `/admin/statistics`
- `/admin/stock`

## UI / Styling Notes

- Global color tokens and theme variables are in `app/globals.css`.
- shadcn aliases are defined in `components.json`.
- Path alias `@/*` is configured in `tsconfig.json`.

## Error and Fallback Pages

- `app/loading.tsx` - global loading UI
- `app/not-found.tsx` - 404 page
- `app/error.tsx` - route-level error boundary UI
- `app/global-error.tsx` - root/global error boundary UI

## Build Check

```bash
npm run build
```

If build succeeds, routes and error/loading boundaries are wired correctly.

# SMP Vendor Portal

Vendor-facing dashboard for OTP login, deal management, and lead tracking.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- Zustand (persisted auth store)
- Lucide icons

## Prerequisites

- Node.js 20+
- npm 10+

## Environment Variables

Create a `.env` file in the project root:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

Notes:
- `NEXT_PUBLIC_API_BASE_URL` is required.
- All API requests are built from this value in `lib/api/client.ts`.

## Local Development

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev`: run local development server
- `npm run build`: production build
- `npm run start`: run production server
- `npm run lint`: run ESLint

## App Architecture

### Routing

- `app/(auth)/*`: authentication pages
- `app/(dashboard)/*`: protected vendor dashboard pages

### Route Protection

- Server-side protection is handled by `proxy.ts`.
- Protected routes:
  - `/`
  - `/my-deals` and nested routes
  - `/leads` and nested routes
  - `/earnings` and nested routes
- Unauthenticated users are redirected to `/login?redirect=<path>`.

### Auth Flow

- OTP APIs:
  - `POST /api/v1/auth/vendor/login`
  - `POST /api/v1/auth/vendor/verify`
- Auth state is stored in Zustand (`lib/store/authStore.ts`) and persisted to `localStorage`.
- A lightweight cookie (`vendor_authenticated=1`) is set for server-side route gating.

### API Layer

- Shared request client: `lib/api/client.ts`
  - Adds JSON headers
  - Adds Bearer token automatically for authenticated endpoints
  - Normalizes API errors
- Feature APIs:
  - `lib/api/auth.ts`
  - `lib/api/deals.ts`
  - `lib/api/leads.ts`

## API Expectations

The frontend expects JSON responses in this shape for most endpoints:

```ts
{
  success: boolean;
  message: string;
  error: string | null;
  data: unknown;
}
```

Token source:
- Access token is read from `vendor-storage` (Zustand persist key) in browser storage.

Required capabilities from backend:
- Send OTP and verify OTP for vendor login
- Fetch deals by `vendor_id`
- Create deal with tier configuration and image payloads
- Fetch paid users/leads, optionally filtered by `ad_id`

## Important Files

- `proxy.ts`: server-side route guard
- `lib/api/client.ts`: shared API request wrapper
- `lib/store/authStore.ts`: persisted auth/session state
- `app/(auth)/login/page.tsx`: OTP login screen
- `app/(dashboard)/my-deals/page.tsx`: deals list
- `app/(dashboard)/my-deals/[id]/page.tsx`: deal details + joined customers
- `components/CreatePoolModal.tsx`: deal creation form

## Troubleshooting

- `NEXT_PUBLIC_API_BASE_URL is not configured`
  - Ensure `.env` exists and variable is set.
- `Unauthorized. Please login again.`
  - Session token is missing/expired in local storage.
- API returns non-JSON / HTML error pages
  - Check API base URL and upstream gateway/proxy configuration.

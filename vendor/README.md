# SMP Vendor Portal

Vendor-facing portal for OTP-based authentication, deal creation, deal monitoring, paid user tracking, and profile management.

## What This App Does

This project is the vendor dashboard for Save My Pay. A vendor can:

- login with email or phone number using OTP
- access a protected dashboard after authentication
- create new deals with images and discount tiers
- view and manage existing deals
- inspect joined customers for a deal
- track paid users / leads
- view dashboard summary metrics
- view and update their profile

The app uses client-side route protection. Dashboard routes stay inaccessible to unauthenticated users because the persisted auth state is checked in the dashboard layout, and expired sessions are cleared automatically when the API returns `401`.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Zustand for persisted auth state
- Lucide React icons

## Requirements

- Node.js 20+
- npm 10+

## Environment Variables

Create a `.env` file in the project root:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

Notes:

- `NEXT_PUBLIC_API_BASE_URL` is required.
- All frontend API requests are built from this value in [lib/api/client.ts](/home/tagore/Desktop/siva%20workspace/smp-vendor/lib/api/client.ts).

## Getting Started

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Scripts

- `npm run dev`: start development server
- `npm run build`: create production build
- `npm run start`: run production build locally
- `npm run lint`: run ESLint

## Project Structure

### Route Groups

- `app/(auth)/*`
  - public authentication screens
- `app/(dashboard)/*`
  - authenticated vendor dashboard screens

### Main Pages

- `/login`
  - OTP login for vendors
- `/`
  - dashboard overview
- `/my-deals`
  - vendor deal listing
- `/my-deals/new`
  - dedicated deal creation page
- `/my-deals/[id]`
  - deal details, tier progress, joined customers
- `/leads`
  - paid users / leads list
- `/earnings`
  - earnings summary page
- `/profile`
  - vendor profile view and update page

## Authentication Flow

### Login

1. Vendor enters email or mobile number.
2. OTP is sent using the auth API.
3. OTP is verified.
4. Access token, refresh token, and vendor profile are stored in Zustand.
5. Zustand state is persisted to `localStorage` under `vendor-storage`.
6. User is redirected into the dashboard.

### Route Guarding

- Dashboard protection is handled in [app/(dashboard)/layout.tsx](/home/tagore/Desktop/siva%20workspace/smp-vendor/app/(dashboard)/layout.tsx).
- This is client-side protection only.
- If `isAuthenticated` is false after hydration, the user is redirected to `/login`.

### Session Expiry Handling

- The shared API client reads the access token from persisted Zustand storage.
- If no token exists, or if the backend returns `401`, the app:
  - clears auth state
  - removes persisted storage
  - removes the auth cookie
  - redirects to `/login`
  - shows a one-time session-expired message on the login page

Relevant files:

- [lib/store/authStore.ts](/home/tagore/Desktop/siva%20workspace/smp-vendor/lib/store/authStore.ts)
- [lib/api/client.ts](/home/tagore/Desktop/siva%20workspace/smp-vendor/lib/api/client.ts)
- [app/(auth)/login/page.tsx](/home/tagore/Desktop/siva%20workspace/smp-vendor/app/(auth)/login/page.tsx)

## Deals Module

### Deal Creation

Deal creation lives on a full page, not in a modal.

Main file:

- [components/CreateDealForm.tsx](/home/tagore/Desktop/siva%20workspace/smp-vendor/components/CreateDealForm.tsx)

Features:

- basic deal information
- price and token amount
- total quantity / min buyers
- cumulative discount tiers
- start and end dates
- description and terms
- image upload with multipart form submission

### Image Upload Rules

The deal creation form enforces backend upload constraints:

- maximum `5` images
- total uploaded image size must be less than `1 MB`
- images are compressed client-side before upload
- form is submitted as `multipart/form-data`

### Deal Listing and Details

- `/my-deals` supports server-side status filtering
- `/my-deals/[id]` shows:
  - deal gallery
  - pricing and token details
  - discount journey
  - progress toward total quantity
  - joined customers / paid users

Relevant files:

- [app/(dashboard)/my-deals/page.tsx](/home/tagore/Desktop/siva%20workspace/smp-vendor/app/(dashboard)/my-deals/page.tsx)
- [app/(dashboard)/my-deals/new/page.tsx](/home/tagore/Desktop/siva%20workspace/smp-vendor/app/(dashboard)/my-deals/new/page.tsx)
- [app/(dashboard)/my-deals/[id]/page.tsx](/home/tagore/Desktop/siva%20workspace/smp-vendor/app/(dashboard)/my-deals/[id]/page.tsx)
- [lib/api/deals.ts](/home/tagore/Desktop/siva%20workspace/smp-vendor/lib/api/deals.ts)

## Leads Module

The app uses `/api/v1/payments/paid-users` for paid users / leads.

Current response is paginated from the backend, but the frontend normalizes it into a flat `Lead[]` in the shared API layer so the UI can consume it consistently.

Relevant file:

- [lib/api/leads.ts](/home/tagore/Desktop/siva%20workspace/smp-vendor/lib/api/leads.ts)

Used in:

- overview recent notifications card
- leads page
- joined customers section inside deal details

## Profile Module

The vendor profile page supports:

- fetching profile details
- updating vendor name, email, and phone number

Relevant files:

- [app/(dashboard)/profile/page.tsx](/home/tagore/Desktop/siva%20workspace/smp-vendor/app/(dashboard)/profile/page.tsx)
- [lib/api/profile.ts](/home/tagore/Desktop/siva%20workspace/smp-vendor/lib/api/profile.ts)

## Shared API Layer

All API calls go through [lib/api/client.ts](/home/tagore/Desktop/siva%20workspace/smp-vendor/lib/api/client.ts).

Responsibilities:

- build request URLs from `NEXT_PUBLIC_API_BASE_URL`
- attach auth headers automatically for protected routes
- support both JSON and `FormData`
- normalize unauthorized session handling
- throw readable errors for failed requests

Feature API modules:

- [lib/api/auth.ts](/home/tagore/Desktop/siva%20workspace/smp-vendor/lib/api/auth.ts)
- [lib/api/dashboard.ts](/home/tagore/Desktop/siva%20workspace/smp-vendor/lib/api/dashboard.ts)
- [lib/api/deals.ts](/home/tagore/Desktop/siva%20workspace/smp-vendor/lib/api/deals.ts)
- [lib/api/leads.ts](/home/tagore/Desktop/siva%20workspace/smp-vendor/lib/api/leads.ts)
- [lib/api/profile.ts](/home/tagore/Desktop/siva%20workspace/smp-vendor/lib/api/profile.ts)

## Deployment Notes

The app builds successfully for production with:

```bash
npm run build
```

Vercel notes:

- set `NEXT_PUBLIC_API_BASE_URL` in project environment variables
- build is expected to pass if env vars are configured correctly
- runtime API failures are usually caused by backend auth, CORS, or wrong base URL configuration, not by the frontend build itself

## Important Files

- [app/(auth)/login/page.tsx](/home/tagore/Desktop/siva%20workspace/smp-vendor/app/(auth)/login/page.tsx)
- [app/(dashboard)/layout.tsx](/home/tagore/Desktop/siva%20workspace/smp-vendor/app/(dashboard)/layout.tsx)
- [app/(dashboard)/page.tsx](/home/tagore/Desktop/siva%20workspace/smp-vendor/app/(dashboard)/page.tsx)
- [components/CreateDealForm.tsx](/home/tagore/Desktop/siva%20workspace/smp-vendor/components/CreateDealForm.tsx)
- [components/VendorNavbar.tsx](/home/tagore/Desktop/siva%20workspace/smp-vendor/components/VendorNavbar.tsx)
- [components/VendorSidebar.tsx](/home/tagore/Desktop/siva%20workspace/smp-vendor/components/VendorSidebar.tsx)
- [lib/api/client.ts](/home/tagore/Desktop/siva%20workspace/smp-vendor/lib/api/client.ts)
- [lib/store/authStore.ts](/home/tagore/Desktop/siva%20workspace/smp-vendor/lib/store/authStore.ts)

## Troubleshooting

### `NEXT_PUBLIC_API_BASE_URL is not configured`

Add the env variable in `.env` or Vercel project settings.

### User stays on dashboard but APIs fail

This usually means the backend token expired. The current app now clears the session and redirects to `/login` automatically on `401`.

### Deal creation fails with `413 Content Too Large`

Backend limit requires:

- maximum `5` images
- total image size below `1 MB`

The frontend compresses and validates images before submission, but extremely large inputs may still need backend confirmation.

### Paid users API shape changes

If `/api/v1/payments/paid-users` changes again, update [lib/api/leads.ts](/home/tagore/Desktop/siva%20workspace/smp-vendor/lib/api/leads.ts) first. That file is the normalization layer used by the dashboard, leads page, and deal detail screen.

# SaveMyPay Admin Dashboard

Internal admin dashboard for the SaveMyPay marketplace.

This project is built with Next.js App Router and provides the operational interface for:
- deal review and publishing
- vendor and customer management
- payment monitoring
- marketplace overview analytics

## Tech Stack

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Zustand
- Radix UI
- Recharts

## Core Modules

- `Overview`
  - dashboard metrics
  - revenue trend
  - customer/vendor onboarding trend
  - approval queue
  - recent payments
- `Deals`
  - deal listing with status filters
  - deal detail review
  - publish / reject actions for draft deals
  - admin deal creation with image upload
- `Vendors`
  - vendor list
  - vendor revenue and ads detail
- `Customers`
  - customer list
  - customer transaction history
- `Payments`
  - payment listing with status and customer filters
- `Profile`
  - read-only admin profile view

## Project Structure

```text
app/
  (auth)/login
  (dashboard)/
    page.tsx
    deals/
    vendors/
    customers/
    payments/
    profile/
    settings/
    support/
components/
  admin/
  ui/
lib/
  admin/
  hooks/
```

## Environment

Create a `.env` file with:

```env
NEXT_PUBLIC_API_BASE_URL="https://api.savemypay.xyz"
```

## Local Development

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Lint:

```bash
npm run lint
```

Production build:

```bash
npm run build
```

## Authentication

The app currently uses a simple single-admin flow:

- login with `username/email + password`
- backend login API returns tokens
- auth state is stored in persisted Zustand
- protected API calls use the stored `access_token`
- unauthorized responses trigger logout

Relevant files:
- [auth-store.ts](/home/tagore/Desktop/siva%20workspace/smp-admin-dashboard/lib/admin/auth-store.ts)
- [auth.ts](/home/tagore/Desktop/siva%20workspace/smp-admin-dashboard/lib/admin/auth.ts)
- [LoginForm.tsx](/home/tagore/Desktop/siva%20workspace/smp-admin-dashboard/app/(auth)/login/LoginForm.tsx)

## Main API Integrations

Current backend integrations include:

- `POST /api/v1/auth/admin/login`
- `GET /api/v1/analytics/dashboard-overview`
- `GET /api/v1/analytics/ads-by-category`
- `GET /api/v1/analytics/user-onboarding-trend`
- `GET /api/v1/analytics/transactions-trend`
- `GET /api/v1/ads`
- `GET /api/v1/ads/{ad_id}`
- `POST /api/v1/ads/{ad_id}/publish`
- `POST /api/v1/ads/{ad_id}/reject`
- `POST /api/v1/ads/with-images`
- `GET /api/v1/categories`
- `GET /api/v1/auth/admin/users`
- `GET /api/v1/auth/admin/vendors/{vendor_id}/ads-revenue`
- `GET /api/v1/payments/paid-users`
- `GET /api/v1/payments/customer-transactions`

See:
- [api.ts](/home/tagore/Desktop/siva%20workspace/smp-admin-dashboard/lib/admin/api.ts)
- [types.ts](/home/tagore/Desktop/siva%20workspace/smp-admin-dashboard/lib/admin/types.ts)

## Deal Creation

Admin deal creation is aligned with the vendor portal contract:

- vendor is selected from admin users API
- category is loaded from categories API
- images are uploaded as multipart `FormData`
- tiers are sent as serialized JSON
- new deals are created in draft flow and reviewed from the deals page

## UI Notes

- sidebar and table action links use `prefetch={false}` to avoid unnecessary route prefetch traffic
- shared dropdown styling is customized in the Radix select wrapper
- overview charts use Recharts

## Deployment

Recommended deployment target: Vercel.

Build command:

```bash
npm run build
```

Before deploying, ensure:
- `NEXT_PUBLIC_API_BASE_URL` is set in Vercel environment variables
- the backend allows requests from the deployed admin domain

## Notes

- this is currently a single-admin dashboard, not a multi-admin role system
- some placeholder routes like `content`, `settings`, and `support` are present for future expansion

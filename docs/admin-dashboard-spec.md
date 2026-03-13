# SMP Admin Dashboard Product Spec

## Purpose

The admin dashboard should be the back-office operating system for SaveMyPay.

Its job is to help internal teams:

- control deal quality before deals go live
- monitor marketplace performance across vendors, customers, and payments
- resolve operational, finance, and support issues quickly
- manage platform risk, fraud, and compliance
- create and promote deals when the business needs direct control

This is not just a reporting dashboard. It is an operations product.

## Business Context

Current product landscape:

- `save-my-pay`: customer portal
- `smp-vendor`: vendor portal
- `smp-admin-dashboard`: admin portal to be built

The admin app should sit above the customer and vendor apps and provide full operational visibility across both.

## Admin Users and Roles

Recommended admin roles:

### 1. Super Admin

Full access to everything, including admin management, settings, approvals, finance actions, and audit logs.

### 2. Operations Admin

Access to:

- deals
- vendors
- customers
- support queues
- basic analytics

No access to sensitive finance configuration or admin user management.

### 3. Finance Admin

Access to:

- payments
- refunds
- settlements
- payout review
- finance analytics

Read-only access to deals, vendors, and customers unless explicitly granted.

### 4. Support Admin

Access to:

- customer profiles
- vendor profiles
- complaints
- tickets
- payment issue visibility

No approval or finance configuration rights.

### 5. Marketing / Growth Admin

Access to:

- analytics
- featured deals
- homepage merchandising
- campaign visibility

No vendor suspension, payout, or admin-user permissions.

## Authentication and Security

Recommended approach:

- email + password login
- optional 2FA / OTP for admins
- role-based access control
- session expiry and forced re-login after inactivity
- password reset flow
- audit log for every sensitive action

Sensitive actions that must be logged:

- deal approval
- deal rejection
- deal pause / close
- vendor suspension
- refund approval
- payout status update
- admin role change
- settings change

## Primary Navigation

Recommended sidebar:

1. Overview
2. Deals
3. Vendors
4. Customers
5. Payments
6. Analytics
7. Support
8. Content
9. Audit Logs
10. Admins
11. Settings

Top bar:

- global search
- notifications / alerts
- quick actions
- current admin identity
- profile menu

## Product Modules

## 1. Overview

Purpose:

Give leadership and ops a real-time view of platform health.

Widgets:

- total live deals
- deals pending approval
- deals closing today
- active vendors
- new vendors this week
- new customers this week
- total collections today
- failed payments today
- refunds requested
- top categories
- top vendors
- deal conversion snapshot

Alerts:

- unusually high payment failures
- deals pending review beyond SLA
- suspicious vendor activity
- unusual referral spikes
- low-performing featured deals

## 2. Deals

Purpose:

This is the most important admin module. It controls the lifecycle of marketplace inventory.

### Deal Status Model

Use explicit states:

- `Draft`
- `Pending Review`
- `Needs Changes`
- `Approved`
- `Scheduled`
- `Live`
- `Paused`
- `Closed`
- `Rejected`
- `Archived`

### Deal List View

Columns:

- deal id
- title
- vendor
- category
- status
- created date
- scheduled date
- live date
- interested users
- paid users
- revenue
- approval owner

Filters:

- status
- vendor
- category
- created date range
- live date range
- revenue range
- payment conversion range
- city / region if supported by backend

Bulk actions:

- approve
- reject
- assign reviewer
- pause
- archive
- feature

### Deal Detail View

Sections:

- deal summary
- product details
- pricing tiers
- images and media
- terms and conditions
- vendor details
- performance metrics
- payment metrics
- customer participation
- approval comments
- audit timeline

Admin actions:

- approve
- reject with reason
- request changes
- edit non-sensitive metadata
- pause / resume
- close early
- duplicate
- mark as featured
- change ordering priority

### Deal Creation

Admins should be able to create deals directly.

Use cases:

- house-managed deals
- vendor-assisted onboarding
- urgent launch scenarios where ops creates deal on behalf of vendor

Creation form should support:

- vendor selection
- category
- title
- description
- pricing
- original price
- token amount
- quantity / slots
- tier pricing
- validity period
- images
- terms
- payout settings
- publish mode: draft / submit / approve and schedule

## 3. Vendors

Purpose:

Manage vendor quality, onboarding, and commercial performance.

### Vendor List View

Columns:

- vendor id
- business name
- owner name
- phone / email
- KYC status
- onboarding status
- active deals
- total deals
- total revenue
- refund ratio
- complaint count
- account status

Filters:

- onboarding status
- KYC status
- category
- active / suspended
- revenue bands
- complaint count

### Vendor Detail View

Sections:

- business profile
- contact details
- KYC / verification documents
- deals created
- live performance
- payout and revenue summary
- customer complaints
- internal notes
- risk flags
- audit history

Admin actions:

- approve vendor
- request KYC changes
- suspend / reactivate
- blacklist
- impersonation-safe login assist tools if later needed
- assign account manager

### Suggested Vendor KPIs

- active deals count
- avg deal conversion
- total GMV
- payment success rate
- refund rate
- average time to approval
- complaint rate

## 4. Customers

Purpose:

Provide support, abuse monitoring, and customer lifecycle visibility.

### Customer List View

Columns:

- customer id
- name
- phone / email
- joined date
- total orders
- total spend
- rewards earned
- referrals made
- account status

Filters:

- signup date
- total spend
- total orders
- referral usage
- flagged / suspicious status

### Customer Detail View

Sections:

- basic profile
- order history
- active interests
- payment history
- rewards / cashback
- referrals
- support cases
- fraud / abuse flags
- notes and timeline

Admin actions:

- view full account history
- flag account
- freeze rewards if fraud is suspected
- assist with profile corrections
- inspect referral misuse

## 5. Payments

Purpose:

This is the finance operations center.

### Payments Dashboard

Widgets:

- collections today
- success rate
- failed transactions
- pending settlements
- refunds pending
- refunded amount
- top revenue deals

### Payment Transactions List

Columns:

- transaction id
- deal id
- deal title
- customer
- vendor
- amount
- token amount
- payment gateway status
- internal status
- created at

Filters:

- success / failed / pending / refunded
- deal
- vendor
- customer
- date range
- amount range

### Payment Detail View

Sections:

- transaction metadata
- deal linkage
- customer linkage
- vendor linkage
- gateway response
- internal event timeline
- refund / settlement history

Admin actions:

- mark for finance review
- approve refund
- add internal notes
- export data

### Recommended Finance Extensions

- settlement tracking to vendors
- payout due dashboard
- reconciliation status
- refund approval workflow

## 6. Analytics

Purpose:

Turn marketplace activity into decision support.

### Deal Funnel Analytics

For each deal:

- impressions
- clicks
- interest count
- started payment count
- successful payment count
- conversion rate
- abandonment rate
- revenue

### Vendor Analytics

- top vendors by revenue
- top vendors by conversion
- low-performing vendors
- repeat vendor success
- deal approval turnaround

### Customer Analytics

- new customers
- repeat buyers
- referral contribution
- reward utilization
- average spend per customer
- top categories by customer interest

### Finance Analytics

- daily / weekly / monthly GMV
- payment success rate trends
- refund rate trends
- settlement trends

### Suggested Charts

- GMV over time
- deals by status
- category performance
- interest to payment funnel
- vendor leaderboard
- customer acquisition cohorts

## 7. Support

Purpose:

Centralize operational issues instead of handling them ad hoc.

Case types:

- payment failed
- refund request
- missing cashback
- referral dispute
- vendor complaint
- deal issue

Case fields:

- ticket id
- entity type: customer / vendor / deal / payment
- priority
- status
- owner
- SLA timer
- internal notes

Statuses:

- open
- in progress
- waiting on customer
- waiting on vendor
- resolved
- closed

## 8. Content

Purpose:

Give the business control over merchandising and communication.

Suggested controls:

- featured deals
- homepage banners
- category ordering
- promotional tags like `Trending`, `Ending Soon`, `Top Saving`
- FAQ content
- support content

## 9. Audit Logs

Purpose:

Track every critical administrative action.

Log fields:

- actor
- role
- action
- entity type
- entity id
- before value summary
- after value summary
- timestamp
- ip / device if available

Must support search and filters.

## 10. Admins

Purpose:

Manage internal users and access.

Features:

- admin user list
- invite admin
- assign role
- deactivate admin
- reset password
- view last login

## 11. Settings

Purpose:

Centralize business-level configuration.

Suggested settings:

- reward percentage defaults
- approval SLA thresholds
- payout cycle config
- fraud thresholds
- default featured-deal logic
- content defaults

## Global Search

Add one search input across the app that can find:

- deals
- vendors
- customers
- payments
- support tickets

Search by:

- id
- name
- email
- phone
- deal title
- transaction id

## Cross-Entity Workflows

## Workflow 1: Vendor Creates Deal

1. Vendor submits deal from vendor portal
2. Deal enters `Pending Review`
3. Admin reviews pricing, media, terms, quantity, vendor quality
4. Admin approves, rejects, or requests changes
5. Approved deal moves to `Scheduled` or `Live`

## Workflow 2: Deal Underperforms or Becomes Risky

1. Admin sees poor conversion or complaint spikes
2. Opens deal detail page
3. Reviews vendor history, payment metrics, complaints
4. Pauses or edits deal merchandising
5. Leaves internal notes and logs action

## Workflow 3: Payment Issue

1. Support or finance identifies failed / disputed payment
2. Admin opens payment detail page
3. Checks transaction status, deal, customer, and vendor linkage
4. Approves refund or marks for reconciliation
5. Logs notes for future audit

## Workflow 4: Vendor Risk Review

1. Vendor shows high refund rate or complaint count
2. Admin opens vendor profile
3. Reviews deal history, support history, and payout summary
4. Marks vendor under review, suspends, or requests compliance action

## Workflow 5: Customer Fraud / Referral Abuse

1. Admin notices unusual referrals or suspicious ordering pattern
2. Opens customer profile
3. Reviews referral history, payment history, device or account overlaps if available
4. Flags or limits account actions
5. Escalates if needed

## Core Data Entities

The admin app should be modeled around these entities:

### Deal

- id
- title
- description
- vendor_id
- category
- status
- original_price
- token_amount
- total_qty
- slots_sold
- tiers
- valid_from
- valid_to
- featured_flag
- approval fields

### Vendor

- id
- business_name
- owner_name
- email
- phone_number
- category
- kyc_status
- status
- created_at

### Customer

- id
- name
- email
- phone_number
- joined_at
- referral_code
- account_status

### Payment

- id
- order_id
- deal_id
- vendor_id
- customer_id
- amount
- currency
- status
- gateway_status
- created_at

### Support Ticket

- id
- type
- entity_type
- entity_id
- priority
- status
- owner_id
- notes

### Admin User

- id
- name
- email
- role
- status
- last_login_at

## Suggested API Requirements

The admin dashboard will likely need backend endpoints beyond the current customer/vendor portals.

Recommended admin API groups:

- `/api/v1/admin/auth/*`
- `/api/v1/admin/deals/*`
- `/api/v1/admin/vendors/*`
- `/api/v1/admin/customers/*`
- `/api/v1/admin/payments/*`
- `/api/v1/admin/analytics/*`
- `/api/v1/admin/support/*`
- `/api/v1/admin/audit-logs/*`
- `/api/v1/admin/settings/*`

## MVP Scope

Recommended Phase 1 MVP:

1. Admin authentication
2. Overview dashboard
3. Deal list + deal detail + approve / reject / pause
4. Vendor list + vendor detail
5. Customer list + customer detail
6. Payment list + payment detail
7. Admin profile page
8. Basic analytics
9. Audit log

Why this MVP:

- it covers daily operations
- it supports launch governance
- it gives business visibility
- it avoids building advanced tooling too early

## Phase 2 Scope

Build after MVP:

- support ticketing
- settlements and payout operations
- content / merchandising controls
- alerts center
- advanced cohorts and funnel analytics
- fraud scoring
- admin invitation and advanced permissions

## Recommended Page Sitemap

### Public / Auth

- `/login`
- `/forgot-password`
- `/reset-password`

### App

- `/`
- `/deals`
- `/deals/new`
- `/deals/[id]`
- `/vendors`
- `/vendors/[id]`
- `/customers`
- `/customers/[id]`
- `/payments`
- `/payments/[id]`
- `/analytics`
- `/support`
- `/support/[id]`
- `/content`
- `/audit-logs`
- `/admins`
- `/admins/[id]`
- `/settings`
- `/profile`

## Recommended UI Patterns

- data tables with server-side filtering and pagination
- saved filters for repeated admin workflows
- detail drawers for quick inspection
- full-page entity detail views for deep work
- status chips for lifecycle clarity
- timeline components for audit and activity history
- side panels for notes and action history

## Recommended Design Principles

- prioritize clarity over decoration
- surface high-risk items first
- reduce decision time for approvals
- always show status, owner, and last updated time
- never hide critical actions without confirmation and audit
- make cross-linking between deal, vendor, customer, and payment pages easy

## Technical Recommendation For This Repo

Recommended frontend architecture:

- Next.js App Router
- route groups for `auth` and `dashboard`
- reusable admin shell layout
- server-driven tables where possible
- typed API layer grouped by domain
- role-aware navigation rendering
- audit-friendly action modals

Suggested route structure:

- `app/(auth)/login/page.tsx`
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/page.tsx`
- `app/(dashboard)/deals/page.tsx`
- `app/(dashboard)/deals/[id]/page.tsx`
- `app/(dashboard)/vendors/page.tsx`
- `app/(dashboard)/vendors/[id]/page.tsx`
- `app/(dashboard)/customers/page.tsx`
- `app/(dashboard)/customers/[id]/page.tsx`
- `app/(dashboard)/payments/page.tsx`
- `app/(dashboard)/payments/[id]/page.tsx`
- `app/(dashboard)/analytics/page.tsx`
- `app/(dashboard)/audit-logs/page.tsx`
- `app/(dashboard)/profile/page.tsx`

## Implementation Order

Recommended build order:

1. auth and admin shell
2. navigation and role guards
3. overview page
4. deals module
5. vendors module
6. customers module
7. payments module
8. profile page
9. analytics
10. audit logs

This order is aligned with operational importance.

## Immediate Next Step

The next practical step is to convert this spec into:

1. page-by-page wireframe requirements
2. frontend route scaffold for this repo
3. mock data contracts for admin APIs
4. MVP implementation tasks

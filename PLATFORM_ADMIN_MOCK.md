# EZQueue Platform Admin — Mock Structure

Updated: 2026-10-26

## Purpose

This mock defines a separate platform-administration surface for EZQueue. It is not the existing shop-owner `System` module and it does not call administrator APIs yet.

- Platform Admin: operates across all shops (tenants).
- Shop Owner: manages only their own shop, branches, staff, queue rules, tags, and audit records.
- Staff/Manager: operates within permissions granted by their shop.
- Customer: books services and tracks queue status.

## Mock routes

| Route | Purpose | Current state |
| --- | --- | --- |
| `/[locale]/admin` | Cross-tenant health and activity overview | Static mock data |
| `/[locale]/admin/shops` | Shop lifecycle, verification, suspension, branches | Static mock data |
| `/[locale]/admin/users` | Global account lookup and admin access | Static mock data |
| `/[locale]/admin/operations` | Queue traffic, jobs, integrations, incidents | Static mock data |
| `/[locale]/admin/audit-log` | Trace platform-level privileged actions | Static mock data |
| `/[locale]/admin/settings` | Global policy, feature flags, maintenance | Static mock data |

The Admin mock is protected by an isolated `PlatformAdminMock` session. Open `/[locale]/admin-access` and use the prefilled local credentials:

- Email: `admin@ezqueue.local`
- Password: `Admin@1234`
- Session lifetime: 4 hours in an HTTP-only, same-site cookie

The mock role grants only the seven UI permission labels defined in `Frontend/src/config/admin-mock.ts`. These labels do not authorize any real API or database operation. **This is not `system.admin` and is not production security.** Do not deploy it as a real backoffice.

## Proposed production boundary

1. Add a dedicated platform-admin authorization policy. A shop owner must never inherit this policy.
2. Validate the policy on every admin API endpoint; hiding navigation is not security.
3. Use separate `/api/admin/*` endpoints and cross-tenant query services. Existing shop-scoped services should remain tenant-scoped.
4. Require step-up authentication/MFA for suspension, role grants, global settings, exports, and impersonation (if impersonation is approved later).
5. Record immutable platform audit events with actor, target, reason, before/after field names, request ID, timestamp, and result. Do not log passwords, tokens, or tenant secrets.
6. Require a reason and confirmation for destructive or service-impacting actions. Prefer reversible status changes over deletion.
7. Provision the first administrator through an explicit controlled process. The mock intentionally creates no admin account.
8. Remove the mock credentials, mock route handlers, and mock cookie when real authorization is enabled.

## Data/API work still required

- Aggregate dashboard metrics and service-health source.
- Tenant list/detail, verification, suspension/reactivation workflows.
- Global user search and carefully scoped access management.
- Incident and background-job monitoring integration.
- Platform audit schema/API, independent from shop audit views.
- Versioned global settings and feature flags with rollout scope.
- Pagination, filtering, export jobs, rate limits, and automated authorization tests.

Payment, invoice, and subscription administration remain out of scope because those product areas are currently hidden.

## Mock source files

- `Frontend/src/app/[locale]/(admin)/admin/` — route tree.
- `Frontend/src/components/admin/admin-shell.tsx` — independent admin navigation/layout.
- `Frontend/src/components/admin/admin-mock-data.ts` — clearly isolated mock records and module definitions.
- `Frontend/src/components/admin/admin-module-page.tsx` — reusable table prototype.
- `Frontend/src/app/[locale]/(admin-auth)/admin-access/` — isolated mock login.
- `Frontend/src/app/api/admin/mock-login/` and `mock-logout/` — local mock-session handlers.
- `Frontend/src/config/admin-mock.ts` — mock role, credential, and permission definitions.


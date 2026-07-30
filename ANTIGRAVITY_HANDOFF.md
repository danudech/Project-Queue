# EZQueue Frontend Continuation Handoff

Updated: 30 July 2026 (Asia/Bangkok)

## Objective

Continue standardizing the whole frontend around the visual language now used by the Holiday settings page and the Dashcode reference template. Preserve all existing business behavior and API contracts.

## Primary references

- Working reference: `Frontend/src/app/[locale]/(user)/(dashboard)/setting/holiday/page.tsx`
- Dashcode source: `D:\Project\Dashcode-v1.0.0`
- Table reference: Dashcode `Customer Order`
- Row interaction reference: Dashcode `Hover Table`
- Summary/header reference: Dashcode `Dashboard Banking`

## Design rules

- Page title: `text-2xl font-medium text-default-900`
- Eyebrow: small primary-colored text; avoid large all-caps headings.
- Description: `text-sm text-muted-foreground`
- Main page spacing: `space-y-6`
- Cards: default Dashcode `Card`; avoid excessive rounded nested cards.
- Table toolbar: title and description on the left, search/filter on the right.
- Table header: `bg-default-200`
- Table rows: `hover:bg-default-200 dark:hover:bg-default-300`
- Actions: compact outline icon buttons with tooltips.
- Destructive actions: always require a confirmation dialog.
- Status: compact rounded badges with restrained success/warning/destructive colors.
- Past/disabled records: muted gray row, disabled controls, no destructive action.
- Keep IBM Plex Sans Thai for Thai and Just Sans for Latin text.

## Completed

- Holiday page uses the Dashboard Banking summary layout.
- Holiday list follows Customer Order table structure and Hover Table behavior.
- Government holiday sync is available; bank holiday sync has been removed.
- Holiday deletion has a confirmation dialog.
- Past holiday rows are muted and disabled.
- Shared dashboard primitives were introduced under `Frontend/src/components/dashboard`.
- Mock-backed dashboard pages inherit the shared layout through `_components/mock-dashboard-page.tsx`.
- Real pages migrated in this pass: dashboard home, booking list, booking slots,
  live queue, queue history, staff, business hours, and notifications.
- Staff settings page form validation updated to match Register form rules (Name, Role, Email, Phone 10-digit format, and Branch Service checks) with inline red error messages and disabled toggles when no services exist.
- Staff system access now uses an invitation flow instead of silently creating an
  account. New users complete the normal registration form, verify their email,
  and accept the Terms and Privacy Policy themselves.
- Existing verified EZQueue accounts are linked immediately. Existing unverified
  accounts receive a fresh verification link.
- Pending invitations are visible in the Staff table and can be resent. Staff
  removal uses a confirmation dialog and the existing soft-disable API behavior.
- Staff create/edit now supports an optional JPG, PNG, or WebP photo (maximum
  5 MB), including preview, replacement, and removal. Staff photos are stored
  separately from user-account profile photos.
- Apply migration `20260730090000_AddStaffProfilePicture` before using staff
  photo uploads against an existing database.
- The migration above was applied successfully to the local development
  database on 30 July 2026. It only adds a nullable column and preserves all
  existing staff rows.
- Confirming an email automatically links matching pending staff records.
- Staff role values describe the staff position only; access remains controlled
  independently by the system-access option.
- Role settings is no longer a mock page. It now loads system/custom roles and
  effective permissions from the API, supports custom-role CRUD, shop-specific
  overrides for system roles, scopes roles to shop or branch, protects system
  roles from deletion, and blocks deletion while a role is assigned.
- Staff records now keep `SystemRoleCode` separately from their displayed job
  position. The role selector appears only when system access is enabled.
  Verified accounts receive a `ShopUserRoleMap` or `BranchUserRoleMap`;
  pending invitations receive the map when email verification links the user.
- JWT login and refresh now resolve shop/branch role permissions from
  `ShopRolePermissions` instead of putting system role names in the permission
  claim.
- Migration `20260730100000_AddStaffSystemRoleCode` was applied successfully to
  the local development database. It backfills existing login-enabled staff
  with the default `Staff` role and creates missing branch role mappings without
  deleting existing records.
- Service provider selection is now persisted through `ServiceStaffMap`.
  Active services require at least one active service staff member; services can
  still be drafted as inactive before staff are added. Legacy active services
  without eligible staff are excluded from the public booking catalog.
- Thai and English Staff settings translations now have matching keys.
- TypeScript and the production Next.js build pass. Targeted ESLint for all files
  touched by the invitation flow passes with 0 errors and 0 warnings. Full
  frontend ESLint has 0 errors; the remaining warnings are inherited template
  cleanup items outside this flow.
- The full .NET solution builds with 0 warnings and 0 errors when using an
  isolated output directory (the running API may otherwise lock build outputs).
- Account ownership now follows a strict one-account-one-shop invariant. The
  same account may work in multiple branches of its home shop, but cannot own,
  join, accept an invitation from, or receive a role in another shop.
- `Users.HomeShopId` is now the authoritative account/shop binding. Migration
  `20260730120000_EnforceSingleShopPerAccount` validates existing affiliations,
  backfills the binding, and adds a unique owner index. It was applied to the
  local database successfully without dropping or deleting data.
- New registrations receive the `Customer` platform role rather than global
  `Admin`. An unbound verified account can create its first shop; shop ownership
  then supplies the shop-owner permissions.
- API permission checks are resource-scoped by shop and branch, preventing a
  role from being reused against another tenant. Account deletion is restricted
  to the authenticated account itself.
- Branch creation now requires an explicit `ShopId`; the frontend sends the
  active shop rather than allowing the repository to choose the first match.
- Production seed no longer inserts demo users, shops, bookings, or queues by
  default. Set `EZQUEUE_SEED_DEMO_DATA=true` only for a fresh development
  database that needs sample data.
- Dashboard summary data now comes from booking, queue, catalog, and customer
  APIs. Unimplemented mock routes, including Notifications and Account index,
  are denied by the dashboard access gate until real APIs exist.
- Shop, branch, business-hours, holiday, booking, and live-queue mutation
  controls are permission-aware. Booking and live-queue pages have matching
  Thai and English translations.
- Automated tests were added under `Tests`; four one-account-one-shop and
  tenant-scope tests pass.

## Continue next

1. Visually check Thai and English at desktop and mobile widths with authenticated data.
2. Verify real email delivery in the deployment environment after SMTP and the
   public frontend URL are configured.
3. Keep shop and branch forms functionally unchanged; standardize only their page shell if needed.
4. Implement real APIs before enabling currently blocked template routes
   (payment, invoice, subscription, analytics, system, notification).
5. Restart the API after pulling RBAC changes, then sign in again (or refresh
   the token) so the JWT receives the latest permission claim.

## Safety

- The worktree contains user work. Do not reset, checkout, or delete unrelated changes.
- Do not change API request/response shapes while standardizing UI.
- Update this file after each meaningful milestone so another agent can resume without chat history.

## Verification

Run from `Frontend`:

```powershell
pnpm exec tsc --noEmit
pnpm exec eslint src
pnpm run build
```

Run `dotnet test Tests\Queue.Tests.csproj --configuration Release` from the
repository root for the tenant-invariant checks.

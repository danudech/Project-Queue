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

## Mock replacement work — 26 October 2026 (in progress)

- Account and Settings index pages now link to implemented modules, with Thai/English labels and permission-filtered settings links. Removed fabricated metrics and enabled these two index routes.
- Remaining MockDashboardPage routes: analytics, customer/tag, queue/category, payment (index/list/transaction), invoice (index/list), subscription (index/plan), system (index/config/master-status/audit-log).
- Awaiting business requirements: payment recording versus gateway; subscription pricing/limits/expiry; invoice purpose; platform administrator versus shop system settings; shop-scoped customer tags.
- Verification: TypeScript currently reports seven dependency migration errors in customer/service tables, calendar, resizable panels and Tailwind config. No TypeScript errors were reported in the new index component. pnpm exec fails locally with "unable to open database file"; direct node invocation runs TypeScript.
- This is incomplete work, not a production-readiness sign-off. Complete the remaining modules and verify again after the requirements are clarified.

## Mock replacement completed — 26 October 2026

This section supersedes the earlier in-progress note and the old template-route checklist.

- User confirmed: hide Payment, Invoice and Subscription; System settings belong to shop owners; Customer Tags are isolated per shop. User authorized applying migrations and reconciling development migration history after schema inspection.
- Account/Settings indices link to implemented pages and omit fabricated metrics. Analytics reads actual booking counts by appointment date and queue counts by creation date, including real status breakdowns and branch/date filters. Reports are owner-only.
- Customer Tags support shop-scoped CRUD/deactivation and customer assignments. Queue Categories support branch-scoped CRUD/deactivation and classification of existing bookings. Prefixes are limited to the database's five characters. Category selection does not change queue numbering or service priority.
- System index links to real business-hours/booking-rule settings (now with branch selection), shared workflow statuses (read-only), and owner-only shop audit history. Shared platform statuses cannot be changed by a shop owner. New operational changes are audited with identifiers and field names; customer contact values and credentials are not copied to audit records. Historical logs without a known ShopId are retained but excluded from shop views.
- Payment/Invoice/Subscription routes are removed from navigation and return HTTP 404 in middleware. Removed the unused mock dashboard component and mock authentication data. Removed subscription upgrade widget; old Messages component now delegates to the real chat dropdown. Services without uploaded images use a neutral placeholder.
- Added workspace DTOs/interface, ShopWorkspace service, authenticated controller and Next BFF at /api/workspace. API authorization checks actual shop/branch ownership or permissions rather than trusting client shop identifiers.
- Applied 20261026100000_ScopeWorkspaceData to the authorized development database. Legacy tags/mappings are retained; tenant copies are generated from actual customer shop ownership. Migration rollback deliberately requires reviewed data reconciliation. No production database was updated.
- Existing database history used July migrations while source had an August squashed baseline. scripts/Sync-DevelopmentBaseline.ps1 checked 425 baseline/chat columns (types and nullability) plus Services.ImageUrl, added the missing nullable Customers.ImageUrl column, and recorded the three equivalent August migrations without removing old history or records. This is a development reconciliation script; inspect target schema before using it elsewhere.
- Fixed missing migration discovery attributes on AddServiceImages/AddChatTables. Regenerated the EF snapshot and migration target model; removed suppression of PendingModelChangesWarning. EF reports no pending model changes.
- Retained compatible major versions for React Table 8, DayPicker 9, Resizable Panels 2, Tailwind 3 and TypeScript 5.9. Other user package upgrades are retained. Updated calendar API, ESLint flat config and build script (next build --webpack). TypeScript errors are no longer ignored during Next builds. Existing effect-pattern diagnostics remain warnings during the React upgrade; lint is not warning-free.
- Verification: .NET Release build passes with 0 warnings/errors; 18 tests pass with 0 skipped when EZQUEUE_TEST_SQLSERVER is provided, including actual SQL Server queries, report totals, category creation/assignment, tag writes/assignment and audit (test transaction rolled back). Without that environment variable the SQL integration case intentionally skips. Production Next build and TypeScript pass. Translation audit passes with 1,355 keys in each language. Full ESLint has 0 errors and existing/advisory warnings. HTTP checks on temporary production server: hidden finance routes 404; unauthenticated workspace API 401; System/Analytics redirect 307 to login. Temporary server was stopped.
- Authenticated browser interaction and desktop/mobile visual review were not performed in this pass. Restart the API/frontend to use the new source and development schema together.

## Frontend visual refresh — 26 October 2026

- Replaced active homepage/authentication illustrations with three newly generated editorial photographs in public/images/editorial (reception, studio, booking). WebP output totals 393,350 bytes. Exact generation prompts, provenance, usages and dimensions are recorded in public/images/editorial/ASSETS.md; built-in image_gen was used.
- Added homepage production.css: warm paper/forest green palette, editorial hero layout, consistent typography, softer borders, clear actions, responsive grids, keyboard focus and reduced-motion support. Refreshed bilingual marketing text, removed visible claims about deferred payments, and replaced placeholder contact links with real registration/legal routes.
- Authentication uses a full-height studio photo, legible gradient overlay, matching EZQueue branding, and a compact mobile form. Existing authentication handlers and validation remain in place.
- Refined shared dashboard page headers, statistic cards, card borders/shadows, module navigation icons, tables and focus styles. Changes apply to existing API-backed pages. Customer routes use matching muted green accents; an illustrative default shop cover is visibly labeled, and uploaded shop/service images still take priority.
- Corrected dashboard header logo aspect ratio and link to /dashboard. Removed fake footer phone contact and unified header/auth/footer logos.
- Browser reviewed homepage in English and Thai, mobile navigation, locale switching, and Thai login at 390px mobile and 1440px desktop. Checked image loads and horizontal overflow. Screenshots are stored in design-preview/. Authenticated dashboard and customer booking flows were not submitted during this visual review.
- TypeScript and translation audit pass; full frontend ESLint reports no errors (existing/advisory warnings remain). Production build is checked separately before delivery. Temporary dev server on 3198 was stopped before building.

Final visual-refresh verification: production build exited successfully after the footer contrast correction. TypeScript and i18n parity pass; full ESLint: 0 errors, 248 existing/advisory warnings. Production preview is served on http://127.0.0.1:3198 for review. No backend behavior or database schema changes were made in this visual refresh.

## Metadata warning fix — 26 October 2026

- Added src/config/metadata.ts as the common metadataBase source: NEXT_PUBLIC_SITE_URL, then NEXT_PUBLIC_APP_BASE_URL, legacy NEXT_PUBLIC_APP_URL, then localhost/PORT fallback. All seven root/nested layouts now share it.
- Moved the global static Open Graph image into the homepage and locale root segments. With separate root layouts, the former global image was resolved before a segment supplied metadataBase and triggered the warning.
- Verified production build, TypeScript and targeted ESLint successfully. The metadataBase warning no longer appears during build or npm start. HTTP checks for /, /th/auth/login and /en/auth/login returned 200; each emitted an absolute og:image URL using configured http://localhost:3000, and all referenced image paths returned 200 on the preview server.
- npm run start -- --hostname 127.0.0.1 --port 3198 remains running for the existing preview. The warning shown in the user's screenshot was nonfatal; the screenshot alone did not establish why their separate npm start returned to the shell.

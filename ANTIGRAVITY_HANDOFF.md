# EZQueue Frontend Continuation Handoff

Updated: 23 July 2026 (Asia/Bangkok)

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
- TypeScript (`pnpm exec tsc --noEmit`) and ESLint (`pnpm exec eslint src`) pass cleanly with 0 errors.

## Continue next

1. Visually check Thai and English at desktop and mobile widths with authenticated data.
2. Keep shop and branch forms functionally unchanged; standardize only their page shell if needed.
3. Replace mock-backed routes with API queries as their backend endpoints become available.
4. Do not change database schema or run migrations for this styling pass.

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

The known `metadataBase` warning during build is unrelated to this styling pass.

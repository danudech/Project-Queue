# EZQueue Brand Assets

Updated: 2026-10-26

## Canonical assets

- `ezqueue-logo.png` — horizontal EZQueue wordmark for navigation, authentication, and footer areas.
- `ezqueue-mark.png` — square application mark for compact navigation, loaders, and Platform Admin.
- `ezqueue-symbol-transparent.svg` — background-free symbol for wordmarks placed directly on light or dark UI surfaces.
- `ezqueue-mark-16.png`, `-32.png`, `-64.png` — favicon source sizes.
- `ezqueue-mark-180.png` — Apple touch icon source.
- `ezqueue-mark-192.png`, `-256.png`, `-512.png` — application icon sizes.

## Published browser assets

- `/favicon.ico` — real multi-image ICO containing 16, 32, and 64px PNG entries.
- `/favicon.png` — 256px PNG fallback.
- `/apple-touch-icon.png` — 180px Apple touch icon.
- `/icon-192.png` and `/icon-512.png` — installable application icons.

All product UI must use the canonical wordmark or mark above. The older `new-logo.jpg` and `new-logo-transparent.png` files are retained only for compatibility with historical content and must not be referenced by new UI.

## Single source of truth

- Change brand names and asset paths only in `Frontend/src/config/brand.ts`.
- Change shared logo composition, color treatment, or compact/full behavior only in `Frontend/src/components/brand-logo.tsx`.
- Pages and layouts must consume `BrandLogo`, `BRAND`, or `BRAND_METADATA_ICONS`; they must not reference brand image paths directly.


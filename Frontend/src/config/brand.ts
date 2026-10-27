import type { Metadata } from "next";

export const BRAND = {
  name: "EZQueue",
  symbol: "/images/brand/ezqueue-symbol-transparent.svg",
  faviconSvg: "/images/brand/ezqueue-mark-v2.svg",
  faviconIco: "/favicon.ico?v=3",
  faviconPng: "/favicon.png?v=3",
  appleTouchIcon: "/apple-touch-icon.png?v=3",
  openGraphImage: "/images/brand/ezqueue-logo-v2.png",
} as const;

export const BRAND_METADATA_ICONS: Metadata["icons"] = {
  icon: [
    { url: BRAND.faviconSvg, type: "image/svg+xml" },
    { url: BRAND.faviconIco },
    { url: BRAND.faviconPng, type: "image/png" },
  ],
  apple: BRAND.appleTouchIcon,
};


// Shared by server layouts so every route resolves social images consistently.
const configuredSiteUrl = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_APP_BASE_URL,
  process.env.NEXT_PUBLIC_APP_URL,
].find(value => value?.trim())?.trim();

export const metadataBase = new URL(
  configuredSiteUrl || `http://localhost:${process.env.PORT || "3000"}`,
);

if (!["http:", "https:"].includes(metadataBase.protocol)) {
  throw new Error("The site URL for metadata must use http:// or https://.");
}

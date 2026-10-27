import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { metadataBase } from "@/config/metadata";
import { BRAND_METADATA_ICONS } from "@/config/brand";

export const metadata: Metadata = {
  metadataBase,
  title: "Platform Admin Mock | EZQueue",
  description: "Mock backoffice structure for EZQueue platform administration.",
  icons: BRAND_METADATA_ICONS,
};

export default function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}


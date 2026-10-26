import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { metadataBase } from "@/config/metadata";

export const metadata: Metadata = {
  metadataBase,
  title: "Platform Admin Mock | EZQueue",
  description: "Mock backoffice structure for EZQueue platform administration.",
};

export default function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}


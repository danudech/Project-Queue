import type { Metadata } from "next";
import { AdminMockLogin } from "@/components/admin/admin-mock-login";
import { metadataBase } from "@/config/metadata";

export const metadata: Metadata = { metadataBase, title: "Platform Admin Mock Access | EZQueue" };

export default async function AdminAccessPage({ params }: PageProps<"/[locale]/admin-access">) {
  const { locale } = await params;
  return <AdminMockLogin locale={locale} />;
}


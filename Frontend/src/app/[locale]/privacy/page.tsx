import type { Metadata } from "next";
import LegalPage from "@/components/legal/legal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isThai = locale === "th";

  return {
    title: isThai ? "นโยบายความเป็นส่วนตัว | EZQueue" : "Privacy Policy | EZQueue",
    description: isThai
      ? "นโยบายความเป็นส่วนตัวและการคุ้มครองข้อมูลของ EZQueue"
      : "Privacy and data-protection information for EZQueue.",
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LegalPage locale={locale} kind="privacy" />;
}

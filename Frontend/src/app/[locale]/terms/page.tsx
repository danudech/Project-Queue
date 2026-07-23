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
    title: isThai ? "ข้อกำหนดและเงื่อนไข | EZQueue" : "Terms & Conditions | EZQueue",
    description: isThai
      ? "ข้อกำหนดและเงื่อนไขสำหรับการใช้บริการ EZQueue"
      : "Terms and conditions for using the EZQueue service.",
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LegalPage locale={locale} kind="terms" />;
}

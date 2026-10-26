import { getTranslations } from "next-intl/server";
import { metadataBase } from "@/config/metadata";

export async function generateMetadata() {
  const t = await getTranslations("CustomerBooking.bookService");
  const title = t("metadataTitle");
  const description = t("metadataDescription");
  return {
    metadataBase,
    title,
    description,
    openGraph: { title, description },
  };
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

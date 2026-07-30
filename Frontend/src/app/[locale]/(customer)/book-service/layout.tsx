import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("CustomerBooking.bookService");
  const title = t("metadataTitle");
  const description = t("metadataDescription");
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3103"),
    title,
    description,
    openGraph: { title, description },
  };
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

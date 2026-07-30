import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("QueueStatus");
  const title = t("metadataTitle");
  const description = t("metadataDescription");
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3103"),
    title,
    description,
    openGraph: { title, description },
  };
}

export default function QueueStatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("QueueStatus");
  const title = t("metadataTitle");
  const description = t("metadataDescription");
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default function QueueStatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

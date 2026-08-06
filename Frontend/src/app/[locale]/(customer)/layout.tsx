import { getTranslations } from "next-intl/server";
import QueryProvider from "@/components/providers/query-provider";

export async function generateMetadata() {
  const t = await getTranslations("CustomerBooking.metadata");
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3103"),
    title: t("title"),
    description: t("description"),
  };
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <QueryProvider>{children}</QueryProvider>;
};

export default Layout;

import { getTranslations } from "next-intl/server";
import { metadataBase } from "@/config/metadata";
import QueryProvider from "@/components/providers/query-provider";

export async function generateMetadata() {
  const t = await getTranslations("CustomerBooking.metadata");
  return {
    metadataBase,
    title: t("title"),
    description: t("description"),
  };
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <QueryProvider>{children}</QueryProvider>;
};

export default Layout;

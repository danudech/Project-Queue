import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("CustomerBooking.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;

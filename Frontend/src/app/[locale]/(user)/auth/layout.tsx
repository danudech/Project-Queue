import { Metadata } from "next";
import { metadataBase } from "@/config/metadata";

export const metadata: Metadata = {
  metadataBase,
  title: "EZQueue Auth",
  description: "Sign in or create an EZQueue account.",
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;

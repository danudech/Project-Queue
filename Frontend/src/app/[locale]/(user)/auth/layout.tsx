import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EZQueue Auth",
  description: "Sign in or create an EZQueue account.",
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;

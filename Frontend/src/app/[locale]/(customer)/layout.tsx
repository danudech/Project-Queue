import { Metadata } from "next";

export const metadata: Metadata = {
  title: "จองคิวออนไลน์ | EZQueue",
  description: "จองคิวออนไลน์ล่วงหน้าได้ง่ายๆ สะดวกและรวดเร็วผ่านระบบ EZQueue",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;
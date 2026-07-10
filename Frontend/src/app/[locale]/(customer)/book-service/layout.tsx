import { Metadata } from "next";

export const metadata: Metadata = {
  title: "จองคิวใช้บริการ | EZQueue",
  description: "จองคิวใช้บริการล่วงหน้าออนไลน์ สะดวก รวดเร็ว ไม่ต้องรอคิวนานผ่านระบบ EZQueue",
  openGraph: {
    title: "จองคิวใช้บริการ | EZQueue",
    description: "จองคิวใช้บริการล่วงหน้าออนไลน์ สะดวก รวดเร็ว ไม่ต้องรอคิวนานผ่านระบบ EZQueue",
  }
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

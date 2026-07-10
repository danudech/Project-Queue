import { Metadata } from "next";

export const metadata: Metadata = {
  title: "สถานะคิวของคุณ | EZQueue",
  description: "ตรวจสอบสถานะคิวและการจองบริการของคุณแบบเรียลไทม์",
  openGraph: {
    title: "สถานะคิวของคุณ | EZQueue",
    description: "ตรวจสอบสถานะคิวและการจองบริการของคุณแบบเรียลไทม์",
  }
};

export default function QueueStatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

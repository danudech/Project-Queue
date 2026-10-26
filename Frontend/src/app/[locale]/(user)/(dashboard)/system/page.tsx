"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";

export default function SystemPage() {
  const th = useLocale() === "th";
  const links = [
    { href: "/system/config", en: "Business hours and booking rules", th: "เวลาทำการและกติกาการจอง" },
    { href: "/system/master-status", en: "Workflow statuses", th: "สถานะการทำงาน" },
    { href: "/system/audit-log", en: "Audit log", th: "ประวัติการเปลี่ยนแปลง" },
  ];
  return <div className="space-y-6"><DashboardPageHeader title={th ? "ระบบของร้าน" : "Shop system"} description={th ? "ข้อมูลและการตั้งค่าของร้านคุณ" : "Your shop’s information and operational settings"} /><div className="grid gap-4 md:grid-cols-3">{links.map(link => <Link key={link.href} href={link.href} className="rounded-lg focus-visible:ring-2 focus-visible:ring-primary"><Card className="h-full hover:bg-default-100"><CardContent className="p-6 font-medium">{th ? link.th : link.en}</CardContent></Card></Link>)}</div></div>;
}

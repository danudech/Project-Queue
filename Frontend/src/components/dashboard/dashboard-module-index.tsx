"use client";

import { useLocale } from "next-intl";
import { ArrowUpRight, Store, MapPin, Clock3, CalendarOff, UsersRound, ShieldCheck, UserRound, LockKeyhole } from "lucide-react";
import { Link } from "@/i18n/routing";
import { usePermissions } from "@/hooks/use-permissions";
import { DashboardPageHeader } from "./dashboard-page-header";
import { Card, CardContent } from "@/components/ui/card";

type Module = { href: string; title: [string, string]; description: [string, string]; permission?: string };
const settings: Module[] = [
  { href: "/setting/shop", title: ["Shop information", "ข้อมูลร้าน"], description: ["Name, contact details and shop images", "ชื่อ ข้อมูลติดต่อ และรูปภาพร้าน"], permission: "shop.view" },
  { href: "/setting/branch", title: ["Branches", "สาขา"], description: ["Branch details and addresses", "ข้อมูลและที่อยู่สาขา"], permission: "branch.view" },
  { href: "/setting/business-hours", title: ["Business hours", "เวลาทำการ"], description: ["Opening hours and booking rules", "เวลาเปิดบริการและกติกาการจอง"], permission: "setting.view" },
  { href: "/setting/holiday", title: ["Holidays", "วันหยุด"], description: ["Dates when branches are closed", "วันที่สาขาปิดให้บริการ"], permission: "setting.view" },
  { href: "/setting/staff", title: ["Staff", "พนักงาน"], description: ["Service providers and account invitations", "ผู้ให้บริการและการเชิญเข้าใช้งานระบบ"], permission: "staff.view" },
  { href: "/setting/role", title: ["Roles and permissions", "บทบาทและสิทธิ์"], description: ["Shop and branch access", "สิทธิ์เข้าถึงร้านและสาขา"], permission: "role.assign" },
];
const account: Module[] = [
  { href: "/account/profile", title: ["My profile", "ข้อมูลส่วนตัว"], description: ["Update your name, contact details and photo", "แก้ไขชื่อ ข้อมูลติดต่อ และรูปโปรไฟล์"] },
  { href: "/account/security", title: ["Security", "ความปลอดภัย"], description: ["Manage your password", "จัดการรหัสผ่านของคุณ"] },
];
const moduleIcons = {
  "/setting/shop": Store, "/setting/branch": MapPin, "/setting/business-hours": Clock3,
  "/setting/holiday": CalendarOff, "/setting/staff": UsersRound, "/setting/role": ShieldCheck,
  "/account/profile": UserRound, "/account/security": LockKeyhole,
};
export default function DashboardModuleIndex({ kind }: { kind: "account" | "setting" }) {
  const language = useLocale() === "th" ? 1 : 0;
  const { can } = usePermissions();
  const modules = (kind === "setting" ? settings : account).filter((module) => can(module.permission));
  return (
    <div className="space-y-6">
      <DashboardPageHeader title={kind === "setting" ? ["Settings", "การตั้งค่า"][language] : ["Account", "บัญชีของฉัน"][language]} description={["Choose a section to view or update its details.", "เลือกหัวข้อเพื่อดูหรือแก้ไขข้อมูล"][language]} />
      {modules.length === 0 ? <Card><CardContent className="p-6 text-sm text-muted-foreground">{["You do not have access to any settings.", "คุณไม่มีสิทธิ์เข้าถึงการตั้งค่าในขณะนี้"][language]}</CardContent></Card> : (
        <div className="grid gap-4 md:grid-cols-2">
          {modules.map((module) => {
            const Icon = moduleIcons[module.href as keyof typeof moduleIcons] ?? Store;
            return (
            <Link key={module.href} href={module.href} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-md"><CardContent className="flex items-center justify-between gap-4 p-6">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/5 text-primary"><Icon className="size-5" aria-hidden="true" /></span>
                <div className="flex-1"><h2 className="font-medium text-default-900">{module.title[language]}</h2><p className="mt-1.5 text-sm leading-6 text-muted-foreground">{module.description[language]}</p></div>
                <ArrowUpRight className="size-4 shrink-0 text-default-400 transition-colors group-hover:text-primary" aria-hidden="true" />
              </CardContent></Card>
            </Link>
          ); })}
        </div>
      )}
    </div>
  );
}

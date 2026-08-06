"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, Loader2, Mail, MapPin, Phone, Store, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useParams, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { http } from "@/lib/http/client";
import { env } from "@/config/env";
import type { PublicBookingPage } from "@/types/public-booking";

export default function PublicShopPage() {
  const t = useTranslations("CustomerBooking.shopPage");
  const locale = useLocale();
  const params = useParams<{ shopSlug: string }>();
  const branchId = useSearchParams().get("branch") ?? "";
  const [page, setPage] = useState<PublicBookingPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!branchId) { setLoading(false); return; }
    void http.get<PublicBookingPage>(`/api/public/booking/${encodeURIComponent(params.shopSlug)}/${encodeURIComponent(branchId)}`)
      .then(setPage).catch(() => toast.error(t("loadError"))).finally(() => setLoading(false));
  }, [branchId, params.shopSlug, t]);

  const typeName = locale === "th" ? page?.shopTypeNameTh : page?.shopTypeNameEn;
  const logoUrl = page?.logoUrl ? (page.logoUrl.startsWith("http") ? page.logoUrl : `${env.apiBaseUrl.replace("/api/v1", "")}${page.logoUrl}`) : null;
  const coverUrl = page?.coverUrl ? (page.coverUrl.startsWith("http") ? page.coverUrl : `${env.apiBaseUrl.replace("/api/v1", "")}${page.coverUrl}`) : "/images/homepage/ezqueue-about-generated.png";
  const bookingHref = `/book/${encodeURIComponent(params.shopSlug)}?branch=${encodeURIComponent(branchId)}`;
  const hours = useMemo(() => page?.businessHours.filter((item) => item.isActive) ?? [], [page]);

  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-50"><Loader2 className="size-8 animate-spin text-primary" /></div>;
  if (!page || !branchId) return <div className="grid min-h-screen place-items-center bg-slate-50 p-5"><Card><CardContent className="py-14 text-center text-muted-foreground">{t("notFound")}</CardContent></Card></div>;

  return <main className="min-h-screen bg-slate-50 pb-10 text-slate-900">
    <div className="mx-auto max-w-6xl px-3 py-3 sm:px-6 sm:py-6">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="h-40 w-full bg-slate-950 bg-cover bg-no-repeat sm:h-48" style={{ backgroundPosition: page.coverPosition || "50% 50%", backgroundSize: "cover", backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.84), rgba(15,23,42,.45)), url(${coverUrl})` }} />
        <div className="relative px-5 pb-6 pt-1 sm:px-8 sm:pb-7">
          <div className="-mt-12 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:gap-6">
            <div className="grid size-32 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md sm:size-40">{logoUrl ? <img src={logoUrl} alt={page.shopName} className="size-full object-cover" style={{ objectPosition: page.logoPosition || "50% 50%" }} /> : <Store className="size-12 text-primary" />}</div>
            <div className="min-w-0 flex-1 pb-1"><h1 className="text-2xl font-bold sm:text-3xl">{page.shopName}</h1><p className="mt-1 text-sm text-slate-500">{page.branchName}{typeName ? ` · ${typeName}` : ""}</p><p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-slate-600">{page.shopDescription || t("descriptionFallback", { name: page.shopName })}</p></div>
            <Button asChild className="shrink-0"><Link href={bookingHref}><CalendarDays className="mr-2 size-4" />{t("bookNow")}</Link></Button>
          </div>
          <div className="mt-7 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3"><Stat label={t("services")} value={String(page.services.length)} /><Stat label={t("team")} value={String(page.staff.length)} /><Stat label={t("hours")} value={hours.length ? t("openDays", { count: hours.length }) : t("notAvailable")} /></div>
        </div>
      </section>
      <div className="mt-6 grid gap-6 lg:grid-cols-[290px_1fr]">
        <Card className="h-fit border-slate-200 shadow-sm"><CardHeader><CardTitle className="text-lg">{t("info")}</CardTitle></CardHeader><CardContent className="space-y-5"><Info icon={Mail} label={t("email")} value={page.shopEmail || t("notAvailable")} /><Info icon={Phone} label={t("phone")} value={page.branchPhone || t("notAvailable")} /><Info icon={MapPin} label={t("address")} value={page.branchAddress || t("notAvailable")} /></CardContent></Card>
        <div className="space-y-6"><Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle className="text-lg">{t("services")}</CardTitle></CardHeader><CardContent className="divide-y divide-slate-100 p-0">{page.services.map((service) => <div key={service.id} className="flex items-center justify-between gap-4 px-6 py-5"><div><p className="font-semibold">{service.name}</p><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><Clock3 className="size-3.5" />{service.duration} {t("minutes")}</p></div><span className="text-lg font-bold text-primary">฿{service.price.toLocaleString()}</span></div>)}</CardContent></Card><Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Clock3 className="size-5 text-primary" />{t("hours")}</CardTitle></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2">{hours.map((item) => <div key={item.dayOfWeek} className="flex justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"><span className="text-slate-500">{t(`day.${item.dayOfWeek}`)}</span><span className="font-medium">{item.openTime} – {item.closeTime}</span></div>)}</CardContent></Card></div>
      </div>
    </div>
    <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 p-3 shadow-lg backdrop-blur sm:hidden"><Button asChild className="w-full"><Link href={bookingHref}><CalendarDays className="mr-2 size-5" />{t("bookNow")}</Link></Button></div>
  </main>;
}

function Stat({ label, value }: { label: string; value: string }) { return <div><p className="text-lg font-semibold text-slate-900">{value}</p><p className="mt-0.5 text-sm text-slate-500">{label}</p></div>; }
function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) { return <div className="flex gap-3"><Icon className="mt-0.5 size-5 shrink-0 text-slate-500" /><div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-sm text-slate-700">{value}</p></div></div>; }

"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, Loader2, Mail, MapPin, Phone, Store } from "lucide-react";
import toast from "react-hot-toast";
import { useParams, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { http } from "@/lib/http/client";
import { env } from "@/config/env";
import type { PublicBookingPage } from "@/types/public-booking";
import LocalSwitcher from "@/components/partials/header/locale-switcher";

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
  const hours = useMemo(() => {
    const configured = new Map((page?.businessHours ?? []).map((item) => [item.dayOfWeek, item]));
    return Array.from({ length: 7 }, (_, dayOfWeek) => configured.get(dayOfWeek) ?? { dayOfWeek, openTime: "", closeTime: "", isActive: false });
  }, [page]);
  const openDays = hours.filter((item) => item.isActive).length;
  const mockupImages = ["haircut", "coloring", "facial", "nails", "scalp-spa"];
  const serviceImage = (service: { imageUrl?: string | null }, index: number) => service.imageUrl
    ? (service.imageUrl.startsWith("http") ? service.imageUrl : `${env.apiBaseUrl.replace("/api/v1", "")}${service.imageUrl}`)
    : `/images/services/${mockupImages[index % mockupImages.length]}.jpg`;

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#f4f4f2]"><Loader2 className="size-8 animate-spin text-[#b38b4b]" /></div>;
  if (!page || !branchId) return <div className="grid min-h-screen place-items-center bg-[#f4f4f2] p-5"><Card><CardContent className="py-14 text-center text-muted-foreground">{t("notFound")}</CardContent></Card></div>;

  return <main className="min-h-screen bg-[#f4f4f2] pb-10 text-[#202124]">
    <div className="mx-auto w-full max-w-[1180px]">
      <section className="relative overflow-hidden bg-[#161616] shadow-sm">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundPosition: page.coverPosition || "50% 50%", backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.78)), url(${coverUrl})` }} />
        <div className="relative flex min-h-[280px] flex-col items-center justify-end px-5 pb-6 pt-8 text-center text-white sm:min-h-[325px] sm:pb-7">
          <div className="absolute right-4 top-4 rounded-lg bg-white/95 shadow-md"><LocalSwitcher compact /></div>
          <div className="mb-4 grid size-28 place-items-center overflow-hidden rounded-full border-[5px] border-[#d7b56e] bg-[#171717] shadow-2xl sm:size-32">{logoUrl ? <img src={logoUrl} alt={page.shopName} className="size-full object-cover" style={{ objectPosition: page.logoPosition || "50% 50%" }} /> : <Store className="size-12 text-[#d7b56e]" />}</div>
          <h1 className="text-2xl font-extrabold uppercase tracking-[.08em] drop-shadow-md sm:text-4xl">{page.shopName}</h1>
          <p className="mt-2 max-w-2xl text-xs text-white/90 sm:text-sm">{typeName || t("business")} · {page.shopDescription || t("descriptionFallback", { name: page.shopName })}</p>
        </div>
      </section>

      <div className="grid border-b border-slate-200 bg-white shadow-sm sm:grid-cols-4">
        <Stat value={String(page.services.length)} label={t("services")} />
        <Stat value={String(page.staff.length)} label={t("team")} />
        <Stat value={openDays ? t("openDays", { count: openDays }) : t("notAvailable")} label={t("hours")} />
        <div className="flex items-center justify-center p-4 sm:justify-end sm:px-6"><Button asChild className="w-full rounded-lg bg-[#1b1b1b] px-6 hover:bg-black sm:w-auto"><Link href={bookingHref}><CalendarDays className="mr-2 size-4" />{t("bookNow")}</Link></Button></div>
      </div>

      <div className="grid gap-5 px-0 pb-10 pt-5 lg:grid-cols-12">
        <aside className="space-y-5 lg:col-span-3 lg:sticky lg:bottom-4 lg:self-start">
          <Card className="border-[#d9c79e] bg-white shadow-sm"><CardHeader className="border-b border-[#eee7d7] pb-3"><CardTitle className="text-lg">{t("info")}</CardTitle></CardHeader><CardContent className="space-y-5 pt-5"><Info icon={Mail} label={t("email")} value={page.shopEmail || t("notAvailable")} /><Info icon={Phone} label={t("phone")} value={page.branchPhone || t("notAvailable")} /><Info icon={MapPin} label={t("address")} value={page.branchAddress || t("notAvailable")} /></CardContent></Card>
          <Card className="border-[#d9c79e] bg-white shadow-sm"><CardHeader className="border-b border-[#eee7d7] pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Clock3 className="size-5 text-[#b38b4b]" />{t("hours")}</CardTitle></CardHeader><CardContent className="space-y-2 pt-4">{hours.map((item) => <div key={item.dayOfWeek} className="flex items-center justify-between gap-2 rounded-md bg-[#f7f5ef] px-3 py-2 text-xs"><span className="text-slate-600">{t(`day.${item.dayOfWeek}`)}</span><span className={item.isActive ? "font-semibold text-slate-900" : "text-slate-400"}>{item.isActive ? `${item.openTime} - ${item.closeTime}` : t("closed")}</span></div>)}</CardContent></Card>
        </aside>

        <section className="min-w-0 space-y-5 lg:col-span-9 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <Card className="border-slate-200 bg-white shadow-sm"><CardHeader className="border-b border-slate-100 pb-4"><CardTitle className="text-xl">{t("services")}</CardTitle><p className="mt-1 text-sm text-slate-500">{t("servicesDescription")}</p></CardHeader><CardContent className="grid auto-rows-fr grid-cols-1 gap-4 overflow-hidden p-4 sm:grid-cols-2 lg:grid-cols-3">{page.services.map((service, index) => <Link key={service.id} href={`${bookingHref}&service=${service.id}`} className="group relative aspect-[4/3] min-h-0 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"><img src={serviceImage(service, index)} alt="" className="absolute inset-0 size-full object-cover transition duration-300 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-4 text-white"><div className="flex items-end justify-between gap-2"><p className="line-clamp-2 text-base font-bold leading-tight">{service.name}</p><span className="shrink-0 rounded-full bg-[#ead39b] px-2 py-1 text-xs font-bold text-[#302410]">฿{service.price.toLocaleString()}</span></div><p className="mt-2 flex items-center gap-1 text-xs text-white/90"><Clock3 className="size-3.5" />{service.duration} {t("minutes")}</p></div></Link>)}</CardContent></Card>
        </section>
      </div>
    </div>
    <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 p-3 shadow-lg backdrop-blur sm:hidden"><Button asChild className="w-full rounded-lg bg-[#1b1b1b]"><Link href={bookingHref}><CalendarDays className="mr-2 size-5" />{t("bookNow")}</Link></Button></div>
  </main>;
}

function Stat({ value, label }: { value: string; label: string }) { return <div className="border-r border-slate-200 p-4 text-center last:border-0"><p className="text-lg font-bold text-slate-900">{value}</p><p className="mt-0.5 text-xs text-slate-500">{label}</p></div>; }
function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) { return <div className="flex gap-3"><Icon className="mt-0.5 size-5 shrink-0 text-[#b38b4b]" /><div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-sm text-slate-700">{value}</p></div></div>; }

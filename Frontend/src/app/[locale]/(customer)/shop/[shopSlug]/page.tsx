"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Clock3, Loader2, MapPin, Phone, Store } from "lucide-react";
import toast from "react-hot-toast";
import { useParams, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { http } from "@/lib/http/client";
import { env } from "@/config/env";
import type { PublicBookingPage } from "@/types/public-booking";
import LocalSwitcher from "@/components/partials/header/locale-switcher";
import { CustomerChatWidget } from "@/components/customer/customer-chat-widget";
import { BranchSelectorModal } from "@/components/shop/branch-selector-modal";
import { resolveApiMediaUrl } from "@/lib/media-url";

export default function PublicShopPage() {
  const t = useTranslations("CustomerBooking.shopPage");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ shopSlug: string }>();
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branch") ?? "";
  const [page, setPage] = useState<PublicBookingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [openBranchModal, setOpenBranchModal] = useState(false);

  useEffect(() => {
    const fetchPath = branchId
      ? `/api/public/booking/${encodeURIComponent(params.shopSlug)}/${encodeURIComponent(branchId)}`
      : `/api/public/booking/${encodeURIComponent(params.shopSlug)}`;
    void http
      .get<PublicBookingPage>(fetchPath)
      .then(setPage)
      .catch(() => toast.error(t("loadError")))
      .finally(() => setLoading(false));
  }, [branchId, params.shopSlug, t]);

  const typeName = locale === "th" ? page?.shopTypeNameTh : page?.shopTypeNameEn;
  const logoUrl = resolveApiMediaUrl(page?.logoUrl);
  const coverUrl = resolveApiMediaUrl(page?.coverUrl) || "/images/editorial/studio.webp";
  const activeBranchId = branchId || page?.branchPublicId || "";
  const bookingHref = `/book/${encodeURIComponent(params.shopSlug)}?branch=${encodeURIComponent(activeBranchId)}`;
  const hours = useMemo(() => {
    const configured = new Map(
      (page?.businessHours ?? []).map((item) => [item.dayOfWeek, item]),
    );
    return Array.from({ length: 7 }, (_, dayOfWeek) =>
      configured.get(dayOfWeek) ?? {
        dayOfWeek,
        openTime: "",
        closeTime: "",
        isActive: false,
      },
    );
  }, [page]);
  const openDays = hours.filter((item) => item.isActive).length;
  const serviceImage = (service: { imageUrl?: string | null }) =>
    resolveApiMediaUrl(service.imageUrl) || "/images/services/service-placeholder.svg";

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f9f4]">
        <Loader2 className="size-8 animate-spin text-[#43694e]" />
      </div>
    );
  if (!page)
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f9f4] p-5">
        <Card>
          <CardContent className="py-14 text-center text-muted-foreground">
            {t("notFound")}
          </CardContent>
        </Card>
      </div>
    );

  return (
    <main className="min-h-screen bg-[#f7f9f4] pb-10 text-[#202124]">
      <div className="mx-auto w-full max-w-[1180px]">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#183d30] shadow-sm">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundPosition: page.coverPosition || "50% 50%",
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.78)), url(${coverUrl})`,
            }}
          />
          <div className="relative flex min-h-[280px] flex-col items-center justify-end px-5 pb-6 pt-8 text-center text-white sm:min-h-[325px] sm:pb-7">
            <LocalSwitcher className="absolute right-4 top-4 shadow-md" />
            {!page.coverUrl && (
              <span className="absolute left-4 top-5 rounded-full bg-black/25 px-3 py-1 text-[10px] text-white/80 backdrop-blur-sm">
                {locale === "th" ? "ภาพประกอบ" : "Illustrative image"}
              </span>
            )}
            <div className="mb-4 grid size-28 place-items-center overflow-hidden rounded-full border-[5px] border-[#c4d2b2] bg-[#171717] shadow-2xl sm:size-32">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={page.shopName}
                  className="size-full object-cover"
                  style={{ objectPosition: page.logoPosition || "50% 50%" }}
                />
              ) : (
                <Store className="size-12 text-[#c4d2b2]" />
              )}
            </div>
            <h1 className="text-2xl font-extrabold uppercase tracking-[.08em] drop-shadow-md sm:text-4xl">
              {page.shopName}
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-white/90 sm:text-sm">
              {typeName || t("business")} ·{" "}
              {page.shopDescription ||
                t("descriptionFallback", { name: page.shopName })}
            </p>
          </div>
        </section>

        {/* Adaptive Branch Selection Bar */}
        {page.branches && page.branches.length > 1 && (
          <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 px-4 py-2.5 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-950 sm:text-sm">
                <Store className="size-4 text-emerald-700" />
                <span>
                  {t("branch")} ({page.branches.length})
                </span>
                <span className="hidden text-xs font-normal text-emerald-800/80 sm:inline">
                  · {locale === "th" ? "เลือกสาขาที่สะดวกเข้ารับบริการ" : "Choose your preferred branch"}
                </span>
              </div>

              {page.branches.length <= 3 ? (
                /* Few branches (<= 3): Show sleek horizontal pills without wrapping */
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap py-0.5">
                  {page.branches.map((b) => {
                    const isSelected =
                      b.publicId === (activeBranchId || page.branchPublicId);
                    return (
                      <button
                        key={b.publicId}
                        type="button"
                        onClick={() => {
                          router.push(
                            `/shop/${encodeURIComponent(params.shopSlug)}?branch=${encodeURIComponent(b.publicId)}`,
                          );
                        }}
                        className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-[#43694e] text-white shadow-sm ring-2 ring-[#43694e]/30 font-semibold"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <MapPin
                          className={`size-3.5 ${isSelected ? "text-white" : "text-emerald-700"}`}
                        />
                        <span className="max-w-[140px] truncate">{b.name}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setOpenBranchModal(true)}
                    className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-emerald-400 bg-emerald-100/60 px-3 py-1 text-xs font-medium text-emerald-900 hover:bg-emerald-200/70 transition-colors"
                  >
                    <span>{locale === "th" ? "ดูทั้งหมด" : "All"}</span>
                  </button>
                </div>
              ) : (
                /* Many branches (> 3): Show current branch + "Change Branch" trigger so it never overflows */
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenBranchModal(true)}
                    className="flex items-center gap-2 rounded-full border border-[#43694e]/30 bg-white px-3.5 py-1 text-xs font-medium text-slate-800 shadow-xs hover:border-[#43694e] hover:bg-emerald-50 transition-all"
                  >
                    <span className="flex size-2 rounded-full bg-[#43694e]" />
                    <span className="max-w-[160px] truncate font-semibold text-[#43694e]">
                      {page.branchName}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs text-slate-600 font-normal">
                      {locale === "th"
                        ? `เปลี่ยนสาขา (มี ${page.branches.length} สาขา)`
                        : `Change (${page.branches.length})`}
                    </span>
                    <ChevronRight className="size-3.5 text-slate-400" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shop & Branch Info Bar */}
        <div className="grid border-b border-slate-200 bg-white shadow-sm sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="flex items-center gap-3 border-b border-slate-200 p-4 sm:border-r md:border-b-0">
            <Store className="size-5 shrink-0 text-[#43694e]" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs text-slate-500">{t("branch")}</p>
                {page.branches && page.branches.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setOpenBranchModal(true)}
                    className="text-[11px] font-semibold text-[#43694e] hover:underline"
                  >
                    {locale === "th" ? "เปลี่ยน" : "Change"}
                  </button>
                )}
              </div>
              <p
                className="truncate font-semibold text-slate-900"
                title={page.branchName}
              >
                {page.branchName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-slate-200 p-4 sm:border-r md:border-b-0">
            <MapPin className="size-5 shrink-0 text-[#43694e]" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{t("address")}</p>
              <p
                className="line-clamp-1 font-semibold text-slate-900"
                title={page.branchAddress || t("notAvailable")}
              >
                {page.branchAddress || t("notAvailable")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-slate-200 p-4 sm:border-r md:border-b-0">
            <Phone className="size-5 shrink-0 text-[#43694e]" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{t("phone")}</p>
              <p className="truncate font-semibold text-slate-900">
                {page.branchPhone || t("notAvailable")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-slate-200 p-4 sm:border-r md:border-b-0">
            <Clock3 className="size-5 shrink-0 text-[#43694e]" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{t("hours")}</p>
              <p className="truncate font-semibold text-slate-900">
                {t("openDays", { count: openDays })}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end p-4 sm:col-span-2 md:col-span-4 lg:col-span-1">
            <Button
              asChild
              size="lg"
              className="w-full bg-[#43694e] text-white hover:bg-[#34533d]"
            >
              <Link href={bookingHref}>{t("bookNow")}</Link>
            </Button>
          </div>
        </div>

        {/* Services & Business Hours */}
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div className="space-y-6 sm:col-span-2">
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold">
                  {t("services")}
                </CardTitle>
                <span className="text-xs text-slate-500">
                  {page.services.length} {t("serviceCount")}
                </span>
              </CardHeader>
              <CardContent>
                {page.services.length === 0 ? (
                  <p className="text-sm text-slate-500">{t("noServices")}</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {page.services.map((service) => (
                      <div
                        key={service.id}
                        className="flex gap-3 rounded-lg border border-slate-100 p-3 shadow-xs transition-colors hover:border-emerald-200"
                      >
                        <img
                          src={serviceImage(service)}
                          alt={service.name}
                          className="size-16 shrink-0 rounded-md object-cover"
                        />
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {service.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {service.duration} {t("minutes")}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="font-bold text-[#43694e]">
                              ฿{service.price.toLocaleString()}
                            </span>
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="h-7 border-[#43694e] text-xs text-[#43694e] hover:bg-[#43694e] hover:text-white"
                            >
                              <Link
                                href={`/book/${encodeURIComponent(params.shopSlug)}?branch=${encodeURIComponent(activeBranchId)}&service=${service.id}`}
                              >
                                {t("bookService")}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">{t("hours")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {hours.map((item) => (
                  <div
                    key={item.dayOfWeek}
                    className="flex justify-between border-b border-slate-50 py-1 text-sm last:border-0"
                  >
                    <span className="text-slate-500">
                      {t(`day.${item.dayOfWeek}`)}
                    </span>
                    <span
                      className={
                        item.isActive
                          ? "font-medium text-slate-900"
                          : "text-slate-400"
                      }
                    >
                      {item.isActive
                        ? `${item.openTime} - ${item.closeTime}`
                        : t("closed")}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Searchable Branch Selector Modal */}
      {page.branches && page.branches.length > 1 && (
        <BranchSelectorModal
          open={openBranchModal}
          onOpenChange={setOpenBranchModal}
          branches={page.branches}
          currentBranchId={activeBranchId}
          onSelectBranch={(nextBranchId) => {
            router.push(
              `/shop/${encodeURIComponent(params.shopSlug)}?branch=${encodeURIComponent(nextBranchId)}`,
            );
          }}
        />
      )}

      {activeBranchId && (
        <CustomerChatWidget
          shopSlug={params.shopSlug}
          branchPublicId={activeBranchId}
        />
      )}
    </main>
  );
}

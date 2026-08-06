"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock3, History, Loader2, Mail, MapPin, Phone, Store, UserRound, XCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import toast from "react-hot-toast";
import LocalSwitcher from "@/components/partials/header/locale-switcher";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useRouter } from "@/i18n/routing";
import { env } from "@/config/env";
import { http } from "@/lib/http/client";
import { startRouteLoading } from "@/lib/route-loading";
import { readRecentBookings, saveRecentBooking, updateRecentBookingStatus } from "@/lib/recent-bookings";
import type { PublicBookingManagement } from "@/types/public-booking";

export default function ManagePublicBookingPage() {
  const t = useTranslations("CustomerBooking.manage");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ bookingGuid: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [booking, setBooking] = useState<PublicBookingManagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const path = `/api/public/booking/manage/${encodeURIComponent(params.bookingGuid)}`;

  useEffect(() => {
    http.get<PublicBookingManagement>(path, { params: { token } })
      .then((result) => {
        setBooking(result);
        const previous = readRecentBookings().find((item) => item.guid === result.guid);
        const bookingPageHref = previous?.bookingPageHref
          || `/book/${encodeURIComponent(result.shopSlug)}?branch=${encodeURIComponent(result.branchPublicId)}`;
        saveRecentBooking({ guid: result.guid, managementHref: `/book/manage/${result.guid}?token=${encodeURIComponent(token)}`, bookingPageHref, shopName: result.shopName, branchName: result.branchName, serviceName: result.serviceName, date: result.date, startTime: result.startTime, status: result.status, createdAt: previous?.createdAt || new Date().toISOString() });
      })
      .catch(() => {
        try {
          const latest = window.localStorage.getItem("ezqueue.latestBooking") ?? "";
          if (latest.includes(params.bookingGuid))
            window.localStorage.removeItem("ezqueue.latestBooking");
        } catch {
          // Ignore unavailable browser storage.
        }
        toast.error(t("loadError"));
      })
      .finally(() => setLoading(false));
  }, [params.bookingGuid, path, token, t]);

  const bookAgain = () => {
    let destination = booking?.shopSlug && booking.branchPublicId
      ? `/book/${encodeURIComponent(booking.shopSlug)}?branch=${encodeURIComponent(booking.branchPublicId)}`
      : readRecentBookings().find((item) => item.guid === params.bookingGuid)?.bookingPageHref || "/book/my";
    try {
      destination = window.localStorage.getItem("ezqueue.bookingPage") || destination;
      window.localStorage.removeItem("ezqueue.latestBooking");
    } catch {
      // Continue to the saved booking history when browser storage is unavailable.
    }
    const separator = destination.includes("?") ? "&" : "?";
    startRouteLoading();
    router.push(`${destination}${separator}new=1`);
  };

  const cancelBooking = async () => {
    setCancelling(true);
    try {
      const result = await http.post<PublicBookingManagement>(
        `${path}/cancel`,
        {},
        { params: { token } },
      );
      setBooking(result);
      updateRecentBookingStatus(result.guid, result.status);
      toast.success(t("cancelSuccess"));
    } catch {
      toast.error(t("cancelError"));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-default-50"><Loader2 className="size-7 animate-spin text-primary" /></div>;
  }

  if (!booking) {
    return <div className="grid min-h-screen place-items-center bg-default-50 p-4"><Card className="w-full max-w-lg"><CardContent className="space-y-5 py-12 text-center text-muted-foreground"><p>{t("invalidLink")}</p><Button onClick={bookAgain}>{t("bookAgain")}</Button></CardContent></Card></div>;
  }

  const cancelled = booking.status === "CANCELLED";
  const shopType = locale === "th" ? booking.shopTypeNameTh : booking.shopTypeNameEn;
  const logoUrl = booking.logoUrl
    ? booking.logoUrl.startsWith("http")
      ? booking.logoUrl
      : `${env.apiBaseUrl.replace("/api/v1", "")}${booking.logoUrl}`
    : null;

  return (
    <main className="min-h-screen bg-default-50">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:px-5 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={booking.shopName}
                className="size-14 shrink-0 rounded-2xl border border-default-200 bg-white object-cover shadow-sm sm:size-16"
              />
            ) : (
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary sm:size-16"><Store className="size-6" /></span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold tracking-tight sm:text-xl">{booking.shopName}</p>
              <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                {shopType && <span className="max-w-[45%] truncate font-medium text-primary">{shopType}</span>}
                {shopType && <span className="size-1 shrink-0 rounded-full bg-default-300" />}
                <span className="truncate">{booking.branchName}</span>
              </div>
            </div>
            <div className="shrink-0 rounded-xl border border-default-200 bg-background shadow-sm"><LocalSwitcher compact /></div>
          </div>
          {(booking.branchAddress || booking.branchPhone || booking.shopEmail) && (
            <div className="mt-4 grid gap-2 rounded-2xl bg-default-100 px-3.5 py-3 text-xs text-muted-foreground sm:grid-cols-2 sm:px-4 sm:text-sm">
              {booking.branchAddress && (
                <span className="flex min-w-0 items-start gap-2 sm:col-span-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="line-clamp-2">{booking.branchAddress}</span>
                </span>
              )}
              {booking.branchPhone && (
                <a href={`tel:${booking.branchPhone}`} className="flex min-w-0 items-center gap-2 transition-colors hover:text-primary">
                  <Phone className="size-4 shrink-0 text-primary" />
                  <span className="truncate">{booking.branchPhone}</span>
                </a>
              )}
              {booking.shopEmail && (
                <a href={`mailto:${booking.shopEmail}`} className="flex min-w-0 items-center gap-2 transition-colors hover:text-primary">
                  <Mail className="size-4 shrink-0 text-primary" />
                  <span className="truncate">{booking.shopEmail}</span>
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 p-4 py-6 sm:space-y-6 sm:p-5 sm:py-10">
        <div>
          <p className="text-xs font-semibold text-primary sm:text-sm">{t("eyebrow")}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg">{booking.serviceName}</CardTitle>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${cancelled ? "bg-red-50 text-red-700" : booking.status === "WAITING" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                {t(`status.${booking.status.toLowerCase()}`)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
            <InfoRow icon={CalendarDays} label={t("date")} value={new Date(booking.date).toLocaleDateString()} />
            <InfoRow icon={Clock3} label={t("time")} value={booking.startTime} />
            <InfoRow icon={UserRound} label={t("customer")} value={booking.customerName} />
            <InfoRow icon={UserRound} label={t("staff")} value={booking.staffName || t("staffPending")} />

            {cancelled ? (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-red-700">
                <XCircle className="mt-0.5 size-5 shrink-0" />
                <div><p className="font-medium">{t("cancelledTitle")}</p><p className="mt-1 text-sm">{t("cancelledDescription")}</p></div>
              </div>
            ) : booking.canCancel ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-medium text-amber-900">{t("waitingTitle")}</p>
                <p className="mt-1 text-sm text-amber-800">{t("waitingDescription")}</p>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-700">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                <div><p className="font-medium">{t("confirmedTitle")}</p><p className="mt-1 text-sm">{t("confirmedDescription")}</p></div>
              </div>
            )}

            {booking.canCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">{t("cancelButton")}</Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("confirmCancelTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>{t("confirmCancelDescription")}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={cancelling}>{t("keepBooking")}</AlertDialogCancel>
                    <AlertDialogAction disabled={cancelling} onClick={cancelBooking} className="bg-red-600 text-white hover:bg-red-700">
                      {cancelling && <Loader2 className="mr-2 size-4 animate-spin" />}{t("confirmCancel")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button asChild variant="outline" className="w-full"><Link href="/book/my"><History className="mr-2 size-4" />{t("myBookings")}</Link></Button>
            <Button variant="outline" className="w-full" onClick={bookAgain}>{t("bookAgain")}</Button>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground">{t("reference", { reference: booking.guid })}</p>
      </div>
    </main>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return <div className="flex items-center gap-3 border-b pb-4 last:border-0"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate font-medium">{value}</p></div></div>;
}

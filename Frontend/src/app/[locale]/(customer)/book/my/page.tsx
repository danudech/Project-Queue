"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, History, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import LocalSwitcher from "@/components/partials/header/locale-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { readRecentBookings, type RecentBooking } from "@/lib/recent-bookings";

export default function MyBookingsPage() {
  const t = useTranslations("CustomerBooking.myBookings");
  const manageT = useTranslations("CustomerBooking.manage");
  const [bookings, setBookings] = useState<RecentBooking[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setBookings(readRecentBookings()); setLoaded(true); }, []);
  const statusLabel = (status: string) => {
    const key = `status.${status.toLowerCase()}`;
    return manageT.has(key) ? manageT(key) : status;
  };

  return <main className="min-h-screen bg-default-50">
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4 sm:px-5 sm:py-6">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><History className="size-5" /></span>
        <div className="min-w-0 flex-1"><h1 className="text-xl font-semibold sm:text-2xl">{t("title")}</h1><p className="mt-1 text-xs text-muted-foreground sm:text-sm">{t("description")}</p></div>
        <div className="rounded-xl border"><LocalSwitcher compact /></div>
      </div>
    </header>
    <div className="mx-auto max-w-2xl space-y-4 p-4 py-6 sm:p-5 sm:py-10">
      {loaded && bookings.length === 0 ? <Card><CardContent className="space-y-3 py-14 text-center"><Store className="mx-auto size-8 text-muted-foreground" /><p className="font-medium">{t("emptyTitle")}</p><p className="text-sm text-muted-foreground">{t("emptyDescription")}</p></CardContent></Card> : bookings.map((booking) => <Card key={booking.guid}><CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{booking.shopName}</p><p className="mt-1 truncate text-sm text-muted-foreground">{booking.branchName}</p></div><span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{statusLabel(booking.status)}</span></div>
        <div><p className="font-medium">{booking.serviceName}</p><div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"><span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-primary" />{new Date(booking.date).toLocaleDateString()}</span><span className="inline-flex items-center gap-2"><Clock3 className="size-4 text-primary" />{booking.startTime}</span></div></div>
        <div className="flex flex-col gap-2 sm:flex-row"><Button asChild className="flex-1"><Link href={booking.managementHref}>{t("view")}</Link></Button>{booking.bookingPageHref && <Button asChild variant="outline" className="flex-1"><Link href={`${booking.bookingPageHref}${booking.bookingPageHref.includes("?") ? "&" : "?"}new=1`}>{t("bookAgain")}</Link></Button>}</div>
        <p className="truncate text-xs text-muted-foreground">{t("reference", { reference: booking.guid })}</p>
      </CardContent></Card>)}
      <p className="rounded-xl bg-default-100 p-4 text-center text-xs leading-5 text-muted-foreground">{t("deviceNotice")}</p>
    </div>
  </main>;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Building2, CalendarDays, Check, Clock3, Loader2, Mail, MapPin, Phone, Store, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { http } from "@/lib/http/client";
import { env } from "@/config/env";
import LocalSwitcher from "@/components/partials/header/locale-switcher";
import { Link, useRouter } from "@/i18n/routing";
import { startRouteLoading } from "@/lib/route-loading";
import type {
  PublicBookingConfirmation,
  PublicBookingPage,
} from "@/types/public-booking";

const today = () => new Date().toLocaleDateString("en-CA");

export default function PublicBookingPageRoute() {
  const t = useTranslations("CustomerBooking.bookService");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ shopSlug: string }>();
  const query = useSearchParams();
  const branchPublicId = query.get("branch") ?? "";
  const startNewBooking = query.get("new") === "1";
  const [page, setPage] = useState<PublicBookingPage | null>(null);
  const [serviceId, setServiceId] = useState(0);
  const [date, setDate] = useState(today);
  const [slotId, setSlotId] = useState(0);
  const [staffId, setStaffId] = useState(0);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<PublicBookingConfirmation | null>(null);
  const [latestBookingHref, setLatestBookingHref] = useState("");

  const path = branchPublicId
    ? `/api/public/booking/${encodeURIComponent(params.shopSlug)}/${encodeURIComponent(branchPublicId)}`
    : "";
  const bookingPageHref = branchPublicId
    ? `/book/${encodeURIComponent(params.shopSlug)}?branch=${encodeURIComponent(branchPublicId)}`
    : "";
  const selectedService = useMemo(
    () => page?.services.find((service) => service.id === serviceId),
    [page?.services, serviceId],
  );
  const todayHours = page?.businessHours.find(
    (hours) => hours.dayOfWeek === new Date().getDay(),
  );
  const shopType = locale === "th" ? page?.shopTypeNameTh : page?.shopTypeNameEn;
  const logoUrl = page?.logoUrl
    ? page.logoUrl.startsWith("http")
      ? page.logoUrl
      : `${env.apiBaseUrl.replace("/api/v1", "")}${page.logoUrl}`
    : null;
  const changeService = (nextServiceId: number) => {
    setServiceId(nextServiceId);
    setSlotId(0);
    setStaffId(0);
  };

  useEffect(() => {
    try {
      const latest = window.localStorage.getItem("ezqueue.latestBooking") ?? "";
      const latestBookingPage = window.localStorage.getItem("ezqueue.bookingPage") ?? "";

      if (startNewBooking) {
        window.localStorage.removeItem("ezqueue.latestBooking");
        setLatestBookingHref("");
      } else if (latest && (!latestBookingPage || latestBookingPage === bookingPageHref)) {
        setLatestBookingHref(latest);
        startRouteLoading();
        router.replace(latest);
        return;
      }

      const saved = window.localStorage.getItem("ezqueue.bookingContact");
      if (!saved) return;
      const contact = JSON.parse(saved) as { name?: string; phone?: string; email?: string };
      setGuestName(contact.name ?? "");
      setGuestPhone(contact.phone ?? "");
      setGuestEmail(contact.email ?? "");
    } catch {
      // Ignore unavailable or invalid browser storage.
    }
  }, [bookingPageHref, router, startNewBooking]);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    setLoading(true);
    http.get<PublicBookingPage>(path, {
      params: serviceId ? { serviceId, date } : {},
    })
      .then((data) => {
        setPage(data);
        setSlotId(0);
        setStaffId(0);
      })
      .catch(() => toast.error(t("loadError")))
      .finally(() => setLoading(false));
  }, [path, serviceId, date, t]);

  const submit = async () => {
    if (!serviceId || !slotId) return toast.error(t("selectServiceAndTime"));
    if (!guestName.trim() || !guestPhone.trim()) return toast.error(t("guestRequired"));
    if (selectedService?.staffSelectionMode === "REQUIRED" && !staffId)
      return toast.error(t("selectStaffError"));
    setSubmitting(true);
    try {
      const result = await http.post<PublicBookingConfirmation>(path, {
        serviceId,
        queueSlotId: slotId,
        staffId: staffId || undefined,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim() || undefined,
        remark: remark.trim() || undefined,
      });
      setConfirmation(result);
      const managementHref = `/book/manage/${result.guid}?token=${encodeURIComponent(result.managementToken)}`;
      setLatestBookingHref(managementHref);
      try {
        window.localStorage.setItem("ezqueue.bookingContact", JSON.stringify({
          name: guestName.trim(),
          phone: guestPhone.trim(),
          email: guestEmail.trim(),
        }));
        window.localStorage.setItem("ezqueue.latestBooking", managementHref);
        window.localStorage.setItem("ezqueue.bookingPage", bookingPageHref);
      } catch {
        // The booking is already complete; unavailable browser storage must not fail it.
      }
      toast.success(t("success"));
    } catch {
      toast.error(t("error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !page)
    return <div className="grid min-h-screen place-items-center bg-default-50"><Loader2 className="size-8 animate-spin text-primary" /></div>;

  if (!branchPublicId || !page)
    return <div className="grid min-h-screen place-items-center bg-default-50 p-5"><Card className="max-w-lg"><CardContent className="py-14 text-center text-muted-foreground">{t("invalidBranch")}</CardContent></Card></div>;

  if (confirmation)
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-to-br from-primary/10 via-background to-background p-5">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="space-y-5 py-10">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-success/10 text-success"><Check className="size-8" /></span>
            <div><h1 className="text-2xl font-semibold">{t("bookingComplete")}</h1><p className="mt-2 text-muted-foreground">{page.shopName} · {page.branchName}</p></div>
            <div className="rounded-xl bg-default-100 p-5 text-left text-sm">
              <Summary label={t("bookingReference")} value={confirmation.guid} />
              <Summary label={t("service")} value={confirmation.serviceName} />
              <Summary label={t("date")} value={new Date(confirmation.date).toLocaleDateString()} />
              <Summary label={t("time")} value={confirmation.startTime} />
            </div>
            <Button asChild className="w-full">
              <Link href={`/book/manage/${confirmation.guid}?token=${encodeURIComponent(confirmation.managementToken)}`}>
                {t("manageBooking")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <main className="min-h-screen bg-default-50">
      <div className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-5">
          {logoUrl ? (
            <img src={logoUrl} alt={page.shopName} className="size-11 rounded-xl border border-default-200 bg-white object-cover sm:size-14" />
          ) : (
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary sm:size-14"><Store className="size-5 sm:size-6" /></span>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold sm:text-xl">{page.shopName}</h1>
            <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">{shopType ? `${shopType} · ` : ""}{page.branchName}</p>
          </div>
          <div className="ml-auto shrink-0 rounded-lg border border-default-200 bg-background">
            <LocalSwitcher compact />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl space-y-4 p-4 py-5 sm:space-y-6 sm:p-5 sm:py-8">
        <div className="flex items-end justify-between gap-3">
          <div><p className="text-xs font-semibold text-primary sm:text-sm">{t("eyebrow")}</p><h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{t("visitTitle")}</h2><p className="mt-2 hidden text-muted-foreground sm:block">{t("visitDescription")}</p></div>
          {latestBookingHref && <Link href={latestBookingHref} className="shrink-0 text-xs font-medium text-primary hover:underline sm:text-sm">{t("latestBooking")}</Link>}
        </div>
        <Card>
          <CardContent className="grid gap-3 p-4 sm:gap-5 sm:p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-2"><Building2 className="size-4 text-primary" /><h3 className="font-semibold">{t("shopDetails")}</h3></div>
              <p className="mt-2 hidden text-sm leading-6 text-muted-foreground sm:block">{page.shopDescription || t("shopDescriptionFallback", { name: page.shopName })}</p>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground sm:mt-4 sm:text-sm">
                {page.branchAddress && <span className="flex items-center gap-2"><MapPin className="size-4" />{page.branchAddress}</span>}
                {page.branchPhone && <a href={`tel:${page.branchPhone}`} className="flex items-center gap-2 hover:text-primary"><Phone className="size-4" />{page.branchPhone}</a>}
                {page.shopEmail && <a href={`mailto:${page.shopEmail}`} className="flex items-center gap-2 hover:text-primary"><Mail className="size-4" />{page.shopEmail}</a>}
              </div>
            </div>
            <div className="rounded-xl bg-default-100 px-4 py-3 sm:px-5 sm:py-4 md:min-w-56">
              <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><Clock3 className="size-4 text-primary" />{t("todayBusinessHours")}</p>
              <p className="mt-2 font-semibold">
                {todayHours?.isActive
                  ? `${todayHours.openTime}–${todayHours.closeTime}`
                  : todayHours
                    ? t("closedToday")
                    : t("hoursUnavailable")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{page.branchName}</p>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader className="p-4 sm:p-6"><CardTitle>{t("details")}</CardTitle><CardDescription className="hidden sm:block">{t("cardDescription")}</CardDescription></CardHeader>
            <CardContent className="grid gap-4 p-4 pt-0 sm:grid-cols-2 sm:gap-5 sm:p-6 sm:pt-0">
              <Field icon={Check} label={t("service")} wide><select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={serviceId} onChange={(event) => changeService(Number(event.target.value))}><option value={0}>{t("selectService")}</option>{page.services.map((service) => <option key={service.id} value={service.id}>{service.name} · ฿{service.price.toLocaleString()}</option>)}</select></Field>
              <Field icon={CalendarDays} label={t("date")}><Input type="date" min={today()} value={date} disabled={!serviceId} className="disabled:cursor-not-allowed disabled:bg-default-100 disabled:opacity-60" onChange={(event) => { setDate(event.target.value); setSlotId(0); }} /></Field>
              <Field icon={Clock3} label={t("availableTime")}><select disabled={!serviceId || loading} className="h-11 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:bg-default-100 disabled:opacity-60" value={slotId} onChange={(event) => setSlotId(Number(event.target.value))}><option value={0}>{!serviceId ? t("selectServiceFirst") : loading ? t("loadingTimes") : page.slots.length ? t("selectTime") : t("noSlots")}</option>{page.slots.map((slot) => <option key={slot.id} value={slot.id}>{slot.startTime}–{slot.endTime} · {t("remaining", { count: slot.remaining })}</option>)}</select></Field>
              {selectedService && selectedService.staffSelectionMode !== "AUTO" && <Field icon={UserRound} label={selectedService.staffSelectionMode === "REQUIRED" ? t("staffRequired") : t("staffOptional")} wide><select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={staffId} onChange={(event) => setStaffId(Number(event.target.value))}><option value={0}>{selectedService.staffSelectionMode === "OPTIONAL" ? t("anyone") : t("selectStaff")}</option>{page.staff.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></Field>}
              <div className="sm:col-span-2 border-t pt-5"><h3 className="font-medium">{t("contactDetails")}</h3><p className="mt-1 text-xs text-muted-foreground">{t("contactDescription")}</p></div>
              <Field icon={UserRound} label={t("guestName")}><Input value={guestName} maxLength={150} onChange={(event) => setGuestName(event.target.value)} /></Field>
              <Field icon={Phone} label={t("guestPhone")}><Input type="tel" value={guestPhone} maxLength={20} onChange={(event) => setGuestPhone(event.target.value)} /></Field>
              <Field icon={Check} label={t("guestEmail")} wide><Input type="email" value={guestEmail} maxLength={254} onChange={(event) => setGuestEmail(event.target.value)} /></Field>
              <Field icon={Check} label={t("note")} wide><Input value={remark} onChange={(event) => setRemark(event.target.value)} placeholder={t("notePlaceholder")} /></Field>
              <Button className="w-full sm:col-span-2 lg:hidden" disabled={submitting || !serviceId || !slotId || !guestName || !guestPhone} onClick={submit}>{submitting && <Loader2 className="mr-2 size-4 animate-spin" />}{t("confirm")}</Button>
            </CardContent>
          </Card>
          <Card className="hidden h-fit lg:block">
            <CardHeader><CardTitle className="text-lg">{t("summary")}</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <Summary label={t("service")} value={selectedService?.name || "—"} />
              <Summary label={t("date")} value={date} />
              <Summary label={t("time")} value={page.slots.find((slot) => slot.id === slotId)?.startTime || "—"} />
              <Summary label={t("staff")} value={page.staff.find((person) => person.id === staffId)?.name || t("autoAssigned")} />
              <Button className="w-full" disabled={submitting || !serviceId || !slotId || !guestName || !guestPhone} onClick={submit}>{submitting && <Loader2 className="mr-2 size-4 animate-spin" />}{t("confirm")}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function Field({ icon: Icon, label, wide, children }: { icon: typeof Check; label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`block space-y-2 ${wide ? "sm:col-span-2" : ""}`}><span className="flex items-center gap-2 text-sm font-medium"><Icon className="size-4 text-primary" />{label}</span>{children}</label>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3 border-b pb-3 last:border-0"><span className="text-muted-foreground">{label}</span><span className="max-w-[190px] break-all text-right font-medium">{value}</span></div>;
}

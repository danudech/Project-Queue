"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  History,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Store,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { http } from "@/lib/http/client";
import { env } from "@/config/env";
import LocalSwitcher from "@/components/partials/header/locale-switcher";
import { Link, useRouter } from "@/i18n/routing";
import { startRouteLoading } from "@/lib/route-loading";
import { saveRecentBooking } from "@/lib/recent-bookings";
import type {
  PublicBookingConfirmation,
  PublicBookingPage,
} from "@/types/public-booking";
import { CustomerChatWidget } from "@/components/customer/customer-chat-widget";
import { BranchSelectorModal } from "@/components/shop/branch-selector-modal";
import { resolveApiMediaUrl } from "@/lib/media-url";

const today = () => new Date().toLocaleDateString("en-CA");

export default function PublicBookingPageRoute() {
  const t = useTranslations("CustomerBooking.bookService");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ shopSlug: string }>();
  const query = useSearchParams();
  const branchPublicId =
    query.get("branch") ??
    query.get("branchId") ??
    query.get("branchPublicId") ??
    "";
  const startNewBooking = query.get("new") === "1";
  const [page, setPage] = useState<PublicBookingPage | null>(null);
  const requestedServiceId = Number(query.get("service") ?? 0);
  const [serviceId, setServiceId] = useState(
    requestedServiceId > 0 ? requestedServiceId : 0,
  );
  const [date, setDate] = useState(today);
  const [slotId, setSlotId] = useState(0);
  const [staffId, setStaffId] = useState(0);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] =
    useState<PublicBookingConfirmation | null>(null);
  const [latestBookingHref, setLatestBookingHref] = useState("");
  const [openBranchModal, setOpenBranchModal] = useState(false);

  const activeBranchId = branchPublicId || page?.branchPublicId || "";
  const path = activeBranchId
    ? `/api/public/booking/${encodeURIComponent(params.shopSlug)}/${encodeURIComponent(activeBranchId)}`
    : `/api/public/booking/${encodeURIComponent(params.shopSlug)}`;
  const bookingPageHref = activeBranchId
    ? `/book/${encodeURIComponent(params.shopSlug)}?branch=${encodeURIComponent(activeBranchId)}`
    : "";
  const selectedService = useMemo(
    () => page?.services.find((service) => service.id === serviceId),
    [page?.services, serviceId],
  );
  const todayHours = page?.businessHours.find(
    (hours) => hours.dayOfWeek === new Date().getDay(),
  );
  const shopType =
    locale === "th" ? page?.shopTypeNameTh : page?.shopTypeNameEn;
  const logoUrl = resolveApiMediaUrl(page?.logoUrl);

  const changeService = (nextServiceId: number) => {
    setServiceId(nextServiceId);
    setSlotId(0);
    setStaffId(0);
  };

  const switchBranch = (nextBranchPublicId: string) => {
    if (!nextBranchPublicId || nextBranchPublicId === activeBranchId) return;
    startRouteLoading();
    setServiceId(0);
    setSlotId(0);
    setStaffId(0);
    router.push(
      `/book/${encodeURIComponent(params.shopSlug)}?branch=${encodeURIComponent(nextBranchPublicId)}`,
    );
  };

  useEffect(() => {
    try {
      const latest =
        window.localStorage.getItem("ezqueue.latestBooking") ?? "";
      const latestBookingPage =
        window.localStorage.getItem("ezqueue.bookingPage") ?? "";

      if (startNewBooking) {
        window.localStorage.removeItem("ezqueue.latestBooking");
        setLatestBookingHref("");
      } else if (
        !requestedServiceId &&
        latest &&
        (!latestBookingPage || latestBookingPage === bookingPageHref)
      ) {
        setLatestBookingHref(latest);
        startRouteLoading();
        router.replace(latest);
        return;
      }

      const saved = window.localStorage.getItem("ezqueue.bookingContact");
      if (!saved) return;
      const contact = JSON.parse(saved) as {
        name?: string;
        phone?: string;
        email?: string;
      };
      setGuestName(contact.name ?? "");
      setGuestPhone(contact.phone ?? "");
      setGuestEmail(contact.email ?? "");
    } catch {
      // Ignore unavailable or invalid browser storage.
    }
  }, [bookingPageHref, requestedServiceId, router, startNewBooking]);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    setLoading(true);
    http
      .get<PublicBookingPage>(path, {
        params: serviceId ? { serviceId, date } : {},
      })
      .then((data) => {
        setPage(data);
        setSlotId(0);
        setStaffId(0);
        if (!branchPublicId && data.branchPublicId) {
          router.replace(
            `/book/${encodeURIComponent(params.shopSlug)}?branch=${encodeURIComponent(data.branchPublicId)}`,
          );
        }
      })
      .catch(() => toast.error(t("loadError")))
      .finally(() => setLoading(false));
  }, [path, serviceId, date, branchPublicId, params.shopSlug, router, t]);

  const submit = async () => {
    if (!serviceId || !slotId) return toast.error(t("selectServiceAndTime"));
    if (!guestName.trim() || !guestPhone.trim())
      return toast.error(t("guestRequired"));
    if (
      selectedService?.staffSelectionMode === "REQUIRED" &&
      !staffId
    )
      return toast.error(t("selectStaffError"));
    setSubmitting(true);
    try {
      const targetBranch = branchPublicId || page?.branchPublicId || "";
      const postPath = `/api/public/booking/${encodeURIComponent(params.shopSlug)}/${encodeURIComponent(targetBranch)}`;
      const result = await http.post<PublicBookingConfirmation>(postPath, {
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
        window.localStorage.setItem(
          "ezqueue.bookingContact",
          JSON.stringify({
            name: guestName.trim(),
            phone: guestPhone.trim(),
            email: guestEmail.trim(),
          }),
        );
        window.localStorage.setItem("ezqueue.latestBooking", managementHref);
        window.localStorage.setItem("ezqueue.bookingPage", bookingPageHref);
        saveRecentBooking({
          guid: result.guid,
          managementHref,
          bookingPageHref,
          shopName: result.shopName,
          branchName: result.branchName,
          serviceName: result.serviceName,
          date: result.date,
          startTime: result.startTime,
          status: result.status,
          createdAt: new Date().toISOString(),
        });
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
    return (
      <div className="grid min-h-screen place-items-center bg-default-50">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );

  if (!page)
    return (
      <div className="grid min-h-screen place-items-center bg-default-50 p-5">
        <Card className="max-w-lg">
          <CardContent className="py-14 text-center text-muted-foreground">
            {t("invalidBranch")}
          </CardContent>
        </Card>
      </div>
    );

  if (confirmation)
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-to-br from-primary/10 via-background to-background p-5">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="space-y-5 py-10">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-success/10 text-success">
              <Check className="size-8" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold">{t("bookingComplete")}</h1>
              <p className="mt-2 text-muted-foreground">
                {page.shopName} · {confirmation.branchName}
              </p>
            </div>
            <div className="rounded-xl bg-default-100 p-5 text-left text-sm">
              <Summary label={t("bookingReference")} value={confirmation.guid} />
              <Summary label={t("branch")} value={confirmation.branchName} />
              <Summary label={t("service")} value={confirmation.serviceName} />
              <Summary
                label={t("date")}
                value={new Date(confirmation.date).toLocaleDateString()}
              />
              <Summary label={t("time")} value={confirmation.startTime} />
            </div>
            <Button asChild className="w-full">
              <Link
                href={`/book/manage/${confirmation.guid}?token=${encodeURIComponent(confirmation.managementToken)}`}
              >
                {t("manageBooking")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/book/my">{t("myBookings")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <main className="min-h-screen bg-default-50">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-5">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={page.shopName}
              className="size-11 rounded-xl border border-default-200 bg-white object-cover sm:size-14"
            />
          ) : (
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary sm:size-14">
              <Store className="size-5 sm:size-6" />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold sm:text-xl">
              {page.shopName}
            </h1>
            <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
              {shopType ? `${shopType} · ` : ""}
              <span className="font-medium text-foreground">{page.branchName}</span>
            </p>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link href="/book/my">
                <History className="size-4" />
                {t("myBookings")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="icon"
              className="sm:hidden"
            >
              <Link href="/book/my" aria-label={t("myBookings")}>
                <History className="size-4" />
              </Link>
            </Button>
            <LocalSwitcher />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-4 p-4 py-5 sm:space-y-6 sm:p-5 sm:py-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-primary sm:text-sm">
              {t("eyebrow")}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("visitTitle")}
            </h2>
            <p className="mt-2 hidden text-muted-foreground sm:block">
              {t("visitDescription")}
            </p>
          </div>
          {latestBookingHref && (
            <Link
              href={latestBookingHref}
              className="shrink-0 text-xs font-medium text-primary hover:underline sm:text-sm"
            >
              {t("latestBooking")}
            </Link>
          )}
        </div>

        {/* Adaptive Branch Switcher Bar (when shop has multiple branches) */}
        {page.branches && page.branches.length > 1 && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent shadow-xs">
            <CardContent className="flex flex-col gap-2.5 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <div className="flex items-center gap-2">
                <Store className="size-4 text-primary" />
                <span className="text-xs font-semibold text-foreground sm:text-sm">
                  {t("selectBranch")}:
                </span>
                <span className="text-xs text-muted-foreground">
                  ({page.branches.length} {locale === "th" ? "สาขา" : "branches"})
                </span>
              </div>

              {page.branches.length <= 3 ? (
                /* Few branches (<= 3): Show horizontal pills with no wrapping */
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap py-0.5">
                  {page.branches.map((b) => {
                    const isSelected =
                      b.publicId === (activeBranchId || page.branchPublicId);
                    return (
                      <button
                        key={b.publicId}
                        type="button"
                        onClick={() => switchBranch(b.publicId)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/30 font-semibold"
                            : "border border-default-200 bg-background text-foreground hover:bg-default-100"
                        }`}
                      >
                        <MapPin className="size-3.5" />
                        <span className="max-w-[130px] truncate">{b.name}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setOpenBranchModal(true)}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-dashed border-primary/40 bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                  >
                    <span>{locale === "th" ? "ดูทั้งหมด" : "All"}</span>
                  </button>
                </div>
              ) : (
                /* Many branches (> 3): Show current branch + "Change Branch" modal trigger */
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenBranchModal(true)}
                    className="h-8 gap-1.5 border-primary/30 bg-background text-xs font-medium hover:border-primary hover:bg-primary/5"
                  >
                    <span className="flex size-2 rounded-full bg-primary" />
                    <span className="max-w-[140px] truncate font-semibold text-primary">
                      {page.branchName}
                    </span>
                    <span className="text-muted-foreground">|</span>
                    <span>
                      {locale === "th"
                        ? `เปลี่ยนสาขา (${page.branches.length})`
                        : `Change (${page.branches.length})`}
                    </span>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Shop & Branch Details Card */}
        <Card>
          <CardContent className="grid gap-3 p-4 sm:gap-5 sm:p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                <h3 className="font-semibold">{t("shopDetails")}</h3>
                <button
                  type="button"
                  onClick={() => {
                    if (page.branches && page.branches.length > 1) {
                      setOpenBranchModal(true);
                    }
                  }}
                  className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                    page.branches && page.branches.length > 1
                      ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                      : "bg-default-100 text-muted-foreground"
                  }`}
                  title={
                    page.branches && page.branches.length > 1
                      ? locale === "th"
                        ? "คลิกเพื่อเปลี่ยนสาขา"
                        : "Click to change branch"
                      : undefined
                  }
                >
                  {page.branchName}
                  {page.branches && page.branches.length > 1 && (
                    <span className="ml-1 text-[10px] underline">
                      ({locale === "th" ? "เปลี่ยน" : "Change"})
                    </span>
                  )}
                </button>
              </div>
              <p className="mt-2 hidden text-sm leading-6 text-muted-foreground sm:block">
                {page.shopDescription ||
                  t("shopDescriptionFallback", { name: page.shopName })}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground sm:mt-4 sm:text-sm">
                {page.branchAddress && (
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    {page.branchAddress}
                  </span>
                )}
                {page.branchPhone && (
                  <a
                    href={`tel:${page.branchPhone}`}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    <Phone className="size-4" />
                    {page.branchPhone}
                  </a>
                )}
                {page.shopEmail && (
                  <a
                    href={`mailto:${page.shopEmail}`}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    <Mail className="size-4" />
                    {page.shopEmail}
                  </a>
                )}
              </div>
            </div>
            <div className="rounded-xl bg-default-100 px-4 py-3 sm:px-5 sm:py-4 md:min-w-56">
              <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Clock3 className="size-4 text-primary" />
                {t("todayBusinessHours")}
              </p>
              <p className="mt-2 font-semibold">
                {todayHours?.isActive
                  ? `${todayHours.openTime}–${todayHours.closeTime}`
                  : todayHours
                    ? t("closedToday")
                    : t("hoursUnavailable")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {page.branchName}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form & Summary */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>{t("details")}</CardTitle>
              <CardDescription className="hidden sm:block">
                {t("cardDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-4 pt-0 sm:grid-cols-2 sm:gap-5 sm:p-6 sm:pt-0">
              {/* Branch Selector Field (if multiple branches) */}
              {page.branches && page.branches.length > 1 && (
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Store className="size-4 text-primary" />
                      {t("branch")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpenBranchModal(true)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      {locale === "th"
                        ? `🔍 ค้นหาหรือดูรายชื่อ (${page.branches.length} สาขา)`
                        : `🔍 Search all (${page.branches.length}) branches`}
                    </button>
                  </div>
                  <select
                    className="h-11 w-full rounded-md border bg-background px-3 text-sm font-medium"
                    value={activeBranchId}
                    onChange={(event) => switchBranch(event.target.value)}
                  >
                    {page.branches.map((b) => (
                      <option key={b.publicId} value={b.publicId}>
                        {b.name}
                        {b.address ? ` — ${b.address}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Service */}
              <Field icon={Check} label={t("service")} wide>
                <select
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                  value={serviceId}
                  onChange={(event) => changeService(Number(event.target.value))}
                >
                  <option value={0}>{t("selectService")}</option>
                  {page.services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} · ฿{service.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Date */}
              <Field icon={CalendarDays} label={t("date")}>
                <Input
                  type="date"
                  min={today()}
                  value={date}
                  disabled={!serviceId}
                  className="disabled:cursor-not-allowed disabled:bg-default-100 disabled:opacity-60"
                  onChange={(event) => {
                    setDate(event.target.value);
                    setSlotId(0);
                  }}
                />
              </Field>

              {/* Available Slot */}
              <Field icon={Clock3} label={t("availableTime")}>
                <select
                  disabled={!serviceId || loading}
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:bg-default-100 disabled:opacity-60"
                  value={slotId}
                  onChange={(event) => setSlotId(Number(event.target.value))}
                >
                  <option value={0}>
                    {!serviceId
                      ? t("selectServiceFirst")
                      : loading
                        ? t("loadingTimes")
                        : page.slots.length
                          ? t("selectTime")
                          : t("noSlots")}
                  </option>
                  {page.slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.startTime}–{slot.endTime} ·{" "}
                      {t("remaining", { count: slot.remaining })}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Staff (if applicable) */}
              {selectedService &&
                selectedService.staffSelectionMode !== "AUTO" && (
                  <Field
                    icon={UserRound}
                    label={
                      selectedService.staffSelectionMode === "REQUIRED"
                        ? t("staffRequired")
                        : t("staffOptional")
                    }
                    wide
                  >
                    <select
                      className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                      value={staffId}
                      onChange={(event) => setStaffId(Number(event.target.value))}
                    >
                      <option value={0}>
                        {selectedService.staffSelectionMode === "OPTIONAL"
                          ? t("anyone")
                          : t("selectStaff")}
                      </option>
                      {page.staff.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

              <div className="sm:col-span-2 border-t pt-5">
                <h3 className="font-medium">{t("contactDetails")}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("contactDescription")}
                </p>
              </div>

              <Field icon={UserRound} label={t("guestName")}>
                <Input
                  value={guestName}
                  maxLength={150}
                  onChange={(event) => setGuestName(event.target.value)}
                />
              </Field>
              <Field icon={Phone} label={t("guestPhone")}>
                <Input
                  type="tel"
                  value={guestPhone}
                  maxLength={20}
                  onChange={(event) => setGuestPhone(event.target.value)}
                />
              </Field>
              <Field icon={Check} label={t("guestEmail")} wide>
                <Input
                  type="email"
                  value={guestEmail}
                  maxLength={254}
                  onChange={(event) => setGuestEmail(event.target.value)}
                />
              </Field>
              <Field icon={Check} label={t("note")} wide>
                <Input
                  value={remark}
                  onChange={(event) => setRemark(event.target.value)}
                  placeholder={t("notePlaceholder")}
                />
              </Field>

              <Button
                className="w-full sm:col-span-2 lg:hidden"
                disabled={
                  submitting ||
                  !serviceId ||
                  !slotId ||
                  !guestName ||
                  !guestPhone
                }
                onClick={submit}
              >
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t("confirm")}
              </Button>
            </CardContent>
          </Card>

          {/* Desktop Summary Sidebar */}
          <Card className="hidden h-fit lg:block">
            <CardHeader>
              <CardTitle className="text-lg">{t("summary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <Summary label={t("branch")} value={page.branchName} />
              <Summary
                label={t("service")}
                value={selectedService?.name || "—"}
              />
              <Summary label={t("date")} value={date} />
              <Summary
                label={t("time")}
                value={
                  page.slots.find((slot) => slot.id === slotId)?.startTime || "—"
                }
              />
              <Summary
                label={t("staff")}
                value={
                  page.staff.find((person) => person.id === staffId)?.name ||
                  t("autoAssigned")
                }
              />
              <Button
                className="w-full"
                disabled={
                  submitting ||
                  !serviceId ||
                  !slotId ||
                  !guestName ||
                  !guestPhone
                }
                onClick={submit}
              >
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t("confirm")}
              </Button>
            </CardContent>
          </Card>

          {/* Searchable Branch Selector Modal */}
          {page.branches && page.branches.length > 1 && (
            <BranchSelectorModal
              open={openBranchModal}
              onOpenChange={setOpenBranchModal}
              branches={page.branches}
              currentBranchId={activeBranchId}
              onSelectBranch={switchBranch}
            />
          )}

          {activeBranchId && (
            <CustomerChatWidget
              shopSlug={params.shopSlug}
              branchPublicId={activeBranchId}
              defaultName={guestName}
              shopLogoUrl={logoUrl}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function Field({
  icon: Icon,
  label,
  wide,
  children,
}: {
  icon: typeof Check;
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block space-y-2 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-primary" />
        {label}
      </span>
      {children}
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b pb-3 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[190px] break-all text-right font-medium">
        {value}
      </span>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Clock3, Loader2, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useShop } from "@/hooks/use-me";
import { http } from "@/lib/http/client";
import type { AvailableSlotDto, BookingDto } from "@/types/booking";
import type { SetService } from "@/types/shop/service";
import type { StaffMember } from "@/types/shop/staff";
import { useTranslations } from "next-intl";

const today = () => new Date().toLocaleDateString("en-CA");

export default function BookingPage() {
  const t = useTranslations("CustomerBooking.bookService");
  const { data: shop, isLoading: shopLoading } = useShop();
  const [branchId, setBranchId] = useState(0);
  const [services, setServices] = useState<SetService[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [slots, setSlots] = useState<AvailableSlotDto[]>([]);
  const [serviceId, setServiceId] = useState(0);
  const [staffId, setStaffId] = useState(0);
  const [slotId, setSlotId] = useState(0);
  const [date, setDate] = useState(today);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const selectedService = useMemo(() => services.find((item) => item.id === serviceId), [services, serviceId]);

  useEffect(() => {
    const queryBranch = typeof window === "undefined" ? 0 : Number(new URLSearchParams(window.location.search).get("branchId") || 0);
    setBranchId(queryBranch || Number(shop?.shopBranches?.[0]?.id || 0));
  }, [shop]);

  useEffect(() => {
    if (!branchId) return;
    void http.get<SetService[]>("catalog", { params: { branchId } }).then(setServices).catch(() => toast.error(t("loadError")));
  }, [branchId, t]);

  useEffect(() => {
    if (!branchId || !serviceId) { setStaff([]); return; }
    setLoading(true);
    Promise.all([
      http.get<StaffMember[]>("staff", { params: { branchId, serviceId, eligible: true } }),
      http.get<AvailableSlotDto[]>("slots", { params: { branchId, date, serviceId } }),
    ]).then(([staffData, slotData]) => { setStaff(staffData); setSlots(slotData); setStaffId(0); setSlotId(0); })
      .catch(() => toast.error(t("loadError"))).finally(() => setLoading(false));
  }, [branchId, serviceId, date, t]);

  const submit = async () => {
    if (!serviceId || !slotId) return toast.error(t("selectServiceAndTime"));
    if (selectedService?.staffSelectionMode === "REQUIRED" && !staffId) return toast.error(t("selectStaffError"));
    setSubmitting(true);
    try {
      await http.post<BookingDto>("booking", { branchId, serviceId, queueSlotId: slotId, staffId: staffId || undefined, remark: remark || undefined });
      toast.success(t("success"));
      setSlotId(0); setRemark("");
    } catch { toast.error(t("error")); }
    finally { setSubmitting(false); }
  };

  if (shopLoading) return <div className="grid min-h-96 place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-5 sm:p-8">
      <div><p className="text-sm font-semibold text-primary">{t("eyebrow")}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{t("visitTitle")}</h1><p className="mt-2 text-muted-foreground">{t("visitDescription")}</p></div>
      {!branchId ? <Card><CardContent className="py-12 text-center text-muted-foreground">{t("invalidBranch")}</CardContent></Card> : (
        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          <Card><CardHeader><CardTitle>{t("details")}</CardTitle><CardDescription>{shop?.name || t("fallbackService")}</CardDescription></CardHeader><CardContent className="space-y-5">
            <BookingField icon={Check} label={t("service")}><select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={serviceId} onChange={(e) => setServiceId(Number(e.target.value))}><option value={0}>{t("selectService")}</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name} · ฿{service.price.toLocaleString()}</option>)}</select></BookingField>
            <BookingField icon={CalendarDays} label={t("date")}><Input type="date" min={today()} value={date} onChange={(e) => setDate(e.target.value)} /></BookingField>
            <BookingField icon={Clock3} label={t("availableTime")}><select disabled={!serviceId || loading} className="h-11 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-50" value={slotId} onChange={(e) => setSlotId(Number(e.target.value))}><option value={0}>{loading ? t("loadingTimes") : t("selectTime")}</option>{slots.map((slot) => <option key={slot.id} value={slot.id}>{slot.startTime}–{slot.endTime} · {t("remaining", { count: slot.remaining })}</option>)}</select></BookingField>
            {selectedService && selectedService.staffSelectionMode !== "AUTO" && <BookingField icon={UserRound} label={selectedService.staffSelectionMode === "REQUIRED" ? t("staffRequired") : t("staffOptional")}><select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={staffId} onChange={(e) => setStaffId(Number(e.target.value))}><option value={0}>{selectedService.staffSelectionMode === "OPTIONAL" ? t("anyone") : t("selectStaff")}</option>{staff.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></BookingField>}
            {selectedService?.staffSelectionMode === "AUTO" && <div className="rounded-xl bg-primary/5 p-4 text-sm text-primary">{t("autoAssignment")}</div>}
            <BookingField icon={Check} label={t("note")}><Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder={t("notePlaceholder")} /></BookingField>
          </CardContent></Card>
          <Card className="h-fit"><CardHeader><CardTitle className="text-lg">{t("summary")}</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><Summary label={t("service")} value={selectedService?.name || "—"} /><Summary label={t("date")} value={date} /><Summary label={t("time")} value={slots.find((slot) => slot.id === slotId)?.startTime || "—"} /><Summary label={t("staff")} value={staff.find((person) => person.id === staffId)?.name || (selectedService?.staffSelectionMode === "AUTO" ? t("autoAssigned") : t("anyone"))} /><Button className="w-full" disabled={submitting || !serviceId || !slotId} onClick={submit}>{submitting && <Loader2 className="mr-2 size-4 animate-spin" />}{t("confirm")}</Button></CardContent></Card>
        </div>
      )}
    </div>
  );
}

function BookingField({ icon: Icon, label, children }: { icon: typeof Check; label: string; children: React.ReactNode }) { return <label className="block space-y-2"><span className="flex items-center gap-2 text-sm font-medium"><Icon className="size-4 text-primary" />{label}</span>{children}</label>; }
function Summary({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-3 border-b pb-3"><span className="text-muted-foreground">{label}</span><span className="text-right font-medium">{value}</span></div>; }

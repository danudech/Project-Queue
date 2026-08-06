"use client";

import { useEffect, useState } from "react";
import { Clock3, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Input } from "@/components/ui/input";
import { useShop } from "@/hooks/use-me";
import { http } from "@/lib/http/client";
import { resolveActiveBranchId } from "@/lib/active-branch";
import type { AvailableSlotDto } from "@/types/booking";
import type { SetService } from "@/types/shop/service";
import { useTranslations } from "next-intl";

const localDate = () => new Date().toLocaleDateString("en-CA");

export default function BookingSlotPage() {
  const t = useTranslations("OperationsPages.slots");
  const { data: shop } = useShop();
  const [date, setDate] = useState(localDate);
  const [slots, setSlots] = useState<AvailableSlotDto[]>([]);
  const [services, setServices] = useState<SetService[]>([]);
  const [branchId, setBranchId] = useState(0);
  const [serviceId, setServiceId] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shop) return;
    void (async () => {
      try {
        const selectedBranch = await resolveActiveBranchId(shop.shopBranches);
        setBranchId(selectedBranch);
        if (!selectedBranch) return setServices([]);
        const result = await http.get<SetService[]>("catalog", { params: { branchId: selectedBranch } });
        const available = Array.isArray(result) ? result : [];
        setServices(available);
        setServiceId((current) => available.some((service) => service.id === current) ? current : (available[0]?.id ?? 0));
      } catch { toast.error(t("loadError")); }
    })();
  }, [shop, t]);

  useEffect(() => {
    if (!branchId || !serviceId) {
      setSlots([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    void http.get<AvailableSlotDto[]>("slots", { params: { branchId, date, serviceId } })
      .then((result) => setSlots(Array.isArray(result) ? result : []))
      .catch(() => { setSlots([]); toast.error(t("loadError")); })
      .finally(() => setLoading(false));
  }, [branchId, date, serviceId, t]);

  return <div className="space-y-6">
    <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} actions={<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"><select className="h-10 rounded-md border bg-background px-3 text-sm" value={serviceId} onChange={(e) => setServiceId(Number(e.target.value))}><option value={0}>{t("selectService")}</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select><Input className="w-full sm:w-48" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>} />
    <Card><CardHeader><CardTitle>{t("availableTimes")}</CardTitle><CardDescription>{t("capacityHint")}</CardDescription></CardHeader><CardContent>{loading ? <div className="grid min-h-40 place-items-center"><Loader2 className="size-5 animate-spin text-primary" /></div> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{slots.map((slot) => <div key={slot.id} className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-default-200 dark:hover:bg-default-300"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-lg bg-primary/10"><Clock3 className="size-5 text-primary" /></div><div><p className="font-semibold">{slot.startTime}–{slot.endTime}</p><p className="text-xs text-muted-foreground">{t("slotNumber", { id: slot.id })}</p></div></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{t("remaining", { count: slot.remaining })}</span></div>)}{!slots.length && <div className="col-span-full rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">{t("empty")}</div>}</div>}</CardContent></Card>
  </div>;
}

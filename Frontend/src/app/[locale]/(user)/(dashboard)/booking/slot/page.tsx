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
import { useTranslations } from "next-intl";

const localDate = () => new Date().toLocaleDateString("en-CA");

export default function BookingSlotPage() {
  const t = useTranslations("OperationsPages.slots");
  const { data: shop } = useShop();
  const [date, setDate] = useState(localDate);
  const [slots, setSlots] = useState<AvailableSlotDto[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!shop) return;
    setLoading(true);
    void (async () => {
      try {
        const branchId = await resolveActiveBranchId(shop.shopBranches);
        if (!branchId) {
          setSlots([]);
          return;
        }
        const result = await http.get<AvailableSlotDto[]>("slots", {
          params: { branchId, date },
        });
        setSlots(Array.isArray(result) ? result : []);
      }
      catch { toast.error(t("loadError")); }
      finally { setLoading(false); }
    })();
  }, [shop, date]);
  return <div className="space-y-6"><DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} actions={<Input className="w-full sm:w-48" type="date" value={date} onChange={(e) => setDate(e.target.value)} />} /><Card><CardHeader><CardTitle>{t("availableTimes")}</CardTitle><CardDescription>{t("capacityHint")}</CardDescription></CardHeader><CardContent>{loading ? <div className="grid min-h-40 place-items-center"><Loader2 className="size-5 animate-spin text-primary" /></div> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{slots.map((slot) => <div key={slot.id} className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-default-200 dark:hover:bg-default-300"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-lg bg-primary/10"><Clock3 className="size-5 text-primary" /></div><div><p className="font-semibold">{slot.startTime}–{slot.endTime}</p><p className="text-xs text-muted-foreground">{t("slotNumber", { id: slot.id })}</p></div></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{t("remaining", { count: slot.remaining })}</span></div>)}{!slots.length && <div className="col-span-full rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">{t("empty")}</div>}</div>}</CardContent></Card></div>;
}

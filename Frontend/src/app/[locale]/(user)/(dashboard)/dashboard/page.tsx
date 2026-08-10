"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Clock3, Scissors, Store, UserRound, XCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { useShop } from "@/hooks/use-me";
import { useTranslations } from "next-intl";
import RouteLoadingScreen from "@/components/route-loading-screen";
import { http } from "@/lib/http/client";
import { resolveActiveBranchId } from "@/lib/active-branch";
import type { BookingDto } from "@/types/booking";
import type { QueueDto } from "@/types/queue";
import type { SetService } from "@/types/shop/service";
import type { CustomerType } from "@/types/shop/customer";

type QueueStatus = "waiting" | "serving";

type DashboardSummary = {
  totalBookings: number;
  waiting: number;
  serving: number;
  completed: number;
  cancelled: number;
  noShow: number;
  customers: number;
  completionRate: number;
  nextQueues: Array<{ id: number; customer: string; service: string; time: string; staff: string; status: QueueStatus }>;
  popularServices: Array<{ name: string; bookings: number }>;
};

const dateKey = (value: string | null | undefined) => value?.slice(0, 10) ?? "";
const localToday = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

async function getDashboardSummary(branchId: number, labels: { service: string; walkInCustomer: string; staff: string }): Promise<DashboardSummary> {
  const empty: DashboardSummary = { totalBookings: 0, waiting: 0, serving: 0, completed: 0, cancelled: 0, noShow: 0, customers: 0, completionRate: 0, nextQueues: [], popularServices: [] };
  if (branchId <= 0) return empty;

  const [bookingResult, queueResult, serviceResult, customerResult] = await Promise.all([
    http.get<BookingDto[]>("booking", { params: { branchId } }).catch(() => []),
    http.get<QueueDto[]>("queues", { params: { branchId } }).catch(() => []),
    http.get<SetService[]>("catalog", { params: { branchId } }).catch(() => []),
    http.get<CustomerType[]>("customer").catch(() => []),
  ]);
  const bookings = Array.isArray(bookingResult) ? bookingResult : [];
  const queues = Array.isArray(queueResult) ? queueResult : [];
  const services = Array.isArray(serviceResult) ? serviceResult : [];
  const customers = Array.isArray(customerResult) ? customerResult : [];
  const today = localToday();
  const todayBookings = bookings.filter((booking) => dateKey(booking.date) === today);
  const todayQueues = queues.filter((queue) => dateKey(queue.queueDate ?? queue.createdAt) === today);
  const serviceById = new Map(services.map((service) => [Number(service.id), service]));
  const completed = todayQueues.filter((queue) => queue.status === "DONE").length;
  const waiting = todayQueues.filter((queue) => queue.status === "WAITING").length;
  const serving = todayQueues.filter((queue) => queue.status === "SERVING").length;
  const cancelled = todayQueues.filter((queue) => queue.status === "CANCELLED").length;
  const noShow = todayQueues.filter((queue) => queue.status === "SKIPPED").length;
  const counts = new Map<number, number>();
  todayQueues.forEach((queue) => { if (queue.serviceId) counts.set(queue.serviceId, (counts.get(queue.serviceId) ?? 0) + 1); });
  const popularServices = [...counts.entries()]
    .map(([id, count]) => ({ name: serviceById.get(id)?.name ?? labels.service, bookings: count }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);
  const nextQueues = todayQueues
    .filter((queue) => !["DONE", "CANCELLED", "SKIPPED"].includes(queue.status))
    .sort((a, b) => `${a.queueDate ?? a.createdAt}-${a.queueStartTime ?? ""}`.localeCompare(`${b.queueDate ?? b.createdAt}-${b.queueStartTime ?? ""}`))
    .slice(0, 8)
    .map((queue) => ({
      id: queue.id,
      customer: queue.customerName || labels.walkInCustomer,
      service: queue.serviceName || labels.service,
      time: queue.queueStartTime || `Q-${queue.queueNumber}`,
      staff: queue.staffName || labels.staff,
      status: queue.status === "SERVING" ? "serving" as const : "waiting" as const,
    }));

  return {
    totalBookings: todayBookings.length,
    waiting,
    serving,
    completed,
    cancelled,
    noShow,
    customers: customers.filter((customer) => customer.isActive).length,
    completionRate: todayQueues.length ? Math.round((completed / todayQueues.length) * 100) : 0,
    nextQueues,
    popularServices,
  };
}

export default function DashboardPage() {
  const tShop = useTranslations("Shop");
  const t = useTranslations("Dashboard");
  const { data: shopData, isLoading: isShopLoading } = useShop();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const shopName = shopData?.name ?? t("fallbackShop");

  useEffect(() => {
    if (!shopData) { setIsLoading(false); return; }
    let mounted = true;
    setIsLoading(true);
    void resolveActiveBranchId(shopData.shopBranches)
      .then((branchId) => getDashboardSummary(branchId, { service: t("serviceFallback"), walkInCustomer: t("walkInCustomer"), staff: t("staffFallback") }))
      .then((data) => { if (mounted) setSummary(data); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [shopData, t]);

  const stats = useMemo(() => summary ? [
    { label: t("stats.bookings"), value: summary.totalBookings, icon: CalendarClock, tone: "primary" as const },
    { label: t("stats.waiting"), value: summary.waiting, icon: Clock3, tone: "warning" as const },
    { label: t("stats.serving"), value: summary.serving, icon: UserRound, tone: "info" as const },
    { label: t("stats.completed"), value: summary.completed, icon: CheckCircle2, tone: "success" as const },
    { label: t("stats.customers"), value: summary.customers, icon: UserRound, tone: "primary" as const },
  ] : [], [summary, t]);

  if (isLoading || isShopLoading || (shopData && !summary)) return <RouteLoadingScreen />;
  if (!shopData) return <div className="flex h-[420px] flex-col items-center justify-center space-y-4 text-center"><div className="rounded-full bg-primary/10 p-5"><Store className="h-10 w-10 text-primary" /></div><div><h2 className="text-2xl font-semibold text-default-900">{tShop("noShop")}</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{tShop("needShopForDashboard")}</p></div><Button onClick={() => window.dispatchEvent(new CustomEvent("open-shop-dialog"))} size="lg">{tShop("createNewShop")}</Button></div>;
  if (!summary) return <RouteLoadingScreen />;

  return <div className="space-y-6">
    <DashboardPageHeader eyebrow={t("eyebrow")} title={shopName} description={t("description")} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{stats.map((item) => <DashboardStatCard key={item.label} icon={item.icon} label={item.label} value={item.value.toLocaleString()} tone={item.tone} />)}</div>

    <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
      <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">{t("upcomingQueue")}</CardTitle><Badge color="secondary">{t("live")}</Badge></CardHeader><CardContent className="space-y-3">
        {summary.nextQueues.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">{t("noUpcoming")}</p> : summary.nextQueues.map((queue) => <div key={queue.id} className="flex flex-col gap-3 rounded-md border border-default-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-10 min-w-16 items-center justify-center rounded-md bg-default-100 px-2 text-sm font-semibold">{queue.time}</div><div><p className="font-medium text-default-900">{queue.customer}</p><p className="text-xs text-muted-foreground">{queue.service} · {queue.staff}</p></div></div><Badge color={queue.status === "serving" ? "success" : "secondary"}>{t(`status.${queue.status}`)}</Badge></div>)}
      </CardContent></Card>
      <div className="space-y-6">
        <Card><CardHeader><CardTitle className="text-base">{t("todayStatus")}</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-3 text-sm"><StatusItem icon={XCircle} label={t("cancelled")} value={summary.cancelled} tone="text-danger" /><StatusItem icon={AlertTriangle} label={t("noShow")} value={summary.noShow} tone="text-warning" /><div className="col-span-2 mt-1 border-t pt-3"><div className="flex justify-between text-xs text-muted-foreground"><span>{t("completionRate")}</span><strong className="text-default-900">{summary.completionRate}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-default-100"><div className="h-full rounded-full bg-success" style={{ width: `${summary.completionRate}%` }} /></div></div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">{t("popularServices")}</CardTitle></CardHeader><CardContent className="space-y-3">{summary.popularServices.length === 0 ? <p className="text-sm text-muted-foreground">{t("noServiceData")}</p> : summary.popularServices.map((service) => <div key={service.name} className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-md bg-default-100"><Scissors className="h-4 w-4 text-muted-foreground" /></div><p className="text-sm font-medium">{service.name}</p></div><p className="text-sm font-semibold">{t("bookingCount", { count: service.bookings })}</p></div>)}</CardContent></Card>
      </div>
    </div>
  </div>;
}

function StatusItem({ icon: Icon, label, value, tone }: { icon: typeof XCircle; label: string; value: number; tone: string }) {
  return <div className="flex items-center justify-between rounded-md bg-default-50 px-3 py-2"><span className="flex items-center gap-2 text-muted-foreground"><Icon className={`size-4 ${tone}`} />{label}</span><strong>{value.toLocaleString()}</strong></div>;
}

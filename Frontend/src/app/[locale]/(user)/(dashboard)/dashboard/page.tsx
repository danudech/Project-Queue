"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Scissors,
  TrendingUp,
  Users,
  Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { Progress } from "@/components/ui/progress";
import { useShop } from "@/hooks/use-me";
import { useTranslations } from "next-intl";
import RouteLoadingScreen from "@/components/route-loading-screen";
import { http } from "@/lib/http/client";
import { resolveActiveBranchId } from "@/lib/active-branch";
import type { BookingDto } from "@/types/booking";
import type { QueueDto } from "@/types/queue";
import type { SetService } from "@/types/shop/service";
import type { CustomerType } from "@/types/shop/customer";

type QueueStatus = "waiting" | "in_progress" | "completed";

type DashboardSummary = {
  totalBookings: number;
  waiting: number;
  completed: number;
  customers: number;
  revenue: number;
  utilization: number;
  nextQueues: Array<{
    id: number;
    customer: string;
    service: string;
    time: string;
    status: QueueStatus;
  }>;
  popularServices: Array<{
    name: string;
    bookings: number;
    revenue: number;
  }>;
};

async function getDashboardSummary(
  branchId: number,
  labels: { service: string; walkInCustomer: string },
): Promise<DashboardSummary> {
  if (branchId <= 0) {
    return {
      totalBookings: 0,
      waiting: 0,
      completed: 0,
      customers: 0,
      revenue: 0,
      utilization: 0,
      nextQueues: [],
      popularServices: [],
    };
  }

  const [bookingResult, queueResult, serviceResult, customerResult] = await Promise.all([
    http
      .get<BookingDto[]>("booking", { params: { branchId } })
      .catch(() => []),
    http.get<QueueDto[]>("queues", { params: { branchId } }).catch(() => []),
    http
      .get<SetService[]>("catalog", { params: { branchId } })
      .catch(() => []),
    http.get<CustomerType[]>("customer").catch(() => []),
  ]);
  const bookings = Array.isArray(bookingResult) ? bookingResult : [];
  const queues = Array.isArray(queueResult) ? queueResult : [];
  const services = Array.isArray(serviceResult) ? serviceResult : [];
  const customers = Array.isArray(customerResult) ? customerResult : [];
  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter((booking) => booking.date.slice(0, 10) === today);
  const todayQueues = queues.filter((queue) => queue.createdAt.slice(0, 10) === today);
  const serviceById = new Map(
    services.map((service) => [Number(service.id), service]),
  );
  const completedQueues = todayQueues.filter((queue) => queue.status === "DONE");
  const serviceCounts = new Map<number, number>();
  for (const queue of todayQueues) {
    if (queue.serviceId) {
      serviceCounts.set(
        queue.serviceId,
        (serviceCounts.get(queue.serviceId) ?? 0) + 1,
      );
    }
  }
  const popularServices = [...serviceCounts.entries()]
    .map(([serviceId, count]) => {
      const service = serviceById.get(serviceId);
      return {
        name: service?.name ?? labels.service,
        bookings: count,
        revenue:
          completedQueues.filter((queue) => queue.serviceId === serviceId).length
          * (service?.price ?? 0),
      };
    })
    .sort((left, right) => right.bookings - left.bookings)
    .slice(0, 3);
  const activeQueues = todayQueues.filter(
    (queue) => !["DONE", "CANCELLED", "SKIPPED"].includes(queue.status),
  );

  return {
    totalBookings: todayBookings.length,
    waiting: activeQueues.filter((queue) => queue.status === "WAITING").length,
    completed: completedQueues.length,
    customers: customers.filter((customer) => customer.isActive).length,
    revenue: completedQueues.reduce(
      (total, queue) =>
        total + (serviceById.get(queue.serviceId ?? 0)?.price ?? 0),
      0,
    ),
    utilization: todayQueues.length
      ? Math.round((completedQueues.length / todayQueues.length) * 100)
      : 0,
    nextQueues: activeQueues.slice(0, 6).map((queue) => ({
      id: queue.id,
      customer: queue.customerName || labels.walkInCustomer,
      service: queue.serviceName || labels.service,
      time: `Q-${queue.queueNumber}`,
      status: queue.status === "SERVING" ? "in_progress" : "waiting",
    })),
    popularServices,
  };
}

const DashboardPage = () => {
  const tc = useTranslations("Common");
  const tShop = useTranslations("Shop");
  const t = useTranslations("Dashboard");
  const { data: shopData, isLoading: isShopLoading } = useShop();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const shopName = shopData?.name ?? t("fallbackShop");

  useEffect(() => {
    if (!shopData) {
      setIsLoading(false);
      return;
    }
    let mounted = true;
    setIsLoading(true);
    void resolveActiveBranchId(shopData.shopBranches)
      .then((branchId) =>
        getDashboardSummary(branchId, {
          service: t("serviceFallback"),
          walkInCustomer: t("walkInCustomer"),
        }),
      )
      .then((data) => {
        if (mounted) setSummary(data);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [shopData, t]);

  const stats = useMemo(() => {
    if (!summary) return [];
    return [
      {
        label: t("stats.bookings"),
        value: summary.totalBookings.toLocaleString(),
        icon: CalendarClock,
        tone: "bg-primary/10 text-primary",
      },
      {
        label: t("stats.waiting"),
        value: summary.waiting.toLocaleString(),
        icon: Clock3,
        tone: "bg-warning/10 text-warning",
      },
      {
        label: t("stats.completed"),
        value: summary.completed.toLocaleString(),
        icon: CheckCircle2,
        tone: "bg-success/10 text-success",
      },
      {
        label: t("stats.customers"),
        value: summary.customers.toLocaleString(),
        icon: Users,
        tone: "bg-info/10 text-info",
      },
    ];
  }, [summary, t]);

  if (isLoading || isShopLoading || (shopData && !summary)) {
    return <RouteLoadingScreen />;
  }

  if (!shopData) {
    return (
      <div className="flex h-[420px] flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-primary/10 p-5">
          <Store className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-default-900">{tShop('noShop')}</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            {tShop('needShopForDashboard')}
          </p>
        </div>
        <Button
          onClick={() => window.dispatchEvent(new CustomEvent("open-shop-dialog"))}
          size="lg"
          className="mt-2"
        >
          {tShop('createNewShop')}
        </Button>
      </div>
    );
  }

  if (!summary) {
    return <RouteLoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow={t("eyebrow")}
        title={shopName}
        description={t("description")}
        actions={
          <>
              <Button variant="outline">{t("export")}</Button>
              <Button>{t("newBooking")}</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, index) => (
          <DashboardStatCard
            key={item.label}
            icon={item.icon}
            label={item.label}
            value={item.value}
            tone={index === 1 ? "warning" : index === 2 ? "success" : index === 3 ? "info" : "primary"}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t("upcomingQueue")}</CardTitle>
            <Badge color="secondary">{t("live")}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.nextQueues.map((queue) => (
              <div
                key={queue.id}
                className="flex flex-col gap-3 rounded-md border border-default-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-default-100 text-sm font-semibold">
                    {queue.time}
                  </div>
                  <div>
                    <p className="font-medium text-default-900">{queue.customer}</p>
                    <p className="text-xs text-muted-foreground">{queue.service}</p>
                  </div>
                </div>
                <Badge color={queue.status === "completed" ? "success" : "secondary"}>
                  {t(`status.${queue.status}`)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("revenueToday")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-semibold text-default-900">
                    {tc("currency.thb")}{summary.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("revenueHint")}</p>
                </div>
                <Badge className="gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +12%
                </Badge>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t("utilization")}</span>
                  <span className="font-medium">{summary.utilization}%</span>
                </div>
                <Progress value={summary.utilization} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("popularServices")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.popularServices.map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-default-100">
                      <Scissors className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("bookingCount", { count: service.bookings })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{tc("currency.thb")}{service.revenue.toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

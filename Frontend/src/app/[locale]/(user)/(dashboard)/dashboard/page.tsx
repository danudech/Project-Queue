"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Loader2,
  Scissors,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useShop } from "@/hooks/use-me";

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

const mockDashboard: DashboardSummary = {
  totalBookings: 38,
  waiting: 7,
  completed: 24,
  customers: 126,
  revenue: 18450,
  utilization: 72,
  nextQueues: [
    { id: 1, customer: "Somchai Jaidee", service: "Haircut", time: "10:30", status: "waiting" },
    { id: 2, customer: "Nicha Wong", service: "Wash & Blow", time: "11:00", status: "in_progress" },
    { id: 3, customer: "Kanda P.", service: "Hair Color", time: "13:30", status: "waiting" },
    { id: 4, customer: "Arthit K.", service: "Beard Trim", time: "14:00", status: "completed" },
  ],
  popularServices: [
    { name: "Haircut", bookings: 18, revenue: 5400 },
    { name: "Wash & Blow", bookings: 12, revenue: 3600 },
    { name: "Hair Color", bookings: 8, revenue: 7200 },
  ],
};

async function getDashboardSummary(): Promise<DashboardSummary> {
  await new Promise((resolve) => setTimeout(resolve, 450));
  return mockDashboard;
}

function statusLabel(status: QueueStatus) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";
  return "Waiting";
}

const DashboardPage = () => {
  const { data: shopData } = useShop();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const shopName = shopData?.name ?? "EZQueue Shop";

  useEffect(() => {
    let mounted = true;
    getDashboardSummary()
      .then((data) => {
        if (mounted) setSummary(data);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    if (!summary) return [];
    return [
      {
        label: "Bookings today",
        value: summary.totalBookings.toLocaleString(),
        icon: CalendarClock,
        tone: "bg-primary/10 text-primary",
      },
      {
        label: "Waiting queue",
        value: summary.waiting.toLocaleString(),
        icon: Clock3,
        tone: "bg-warning/10 text-warning",
      },
      {
        label: "Completed",
        value: summary.completed.toLocaleString(),
        icon: CheckCircle2,
        tone: "bg-success/10 text-success",
      },
      {
        label: "Customers",
        value: summary.customers.toLocaleString(),
        icon: Users,
        tone: "bg-info/10 text-info",
      },
    ];
  }, [summary]);

  if (isLoading || !summary) {
    return (
      <div className="flex h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today overview</p>
              <h1 className="mt-1 text-2xl font-semibold text-default-900">{shopName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Mock dashboard for queue activity, revenue, and upcoming appointments.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">Export report</Button>
              <Button>New booking</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-md ${item.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-semibold text-default-900">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upcoming queue</CardTitle>
            <Badge color="secondary">Mock API</Badge>
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
                  {statusLabel(queue.status)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-semibold text-default-900">
                    ฿{summary.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Estimated from completed queues</p>
                </div>
                <Badge className="gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +12%
                </Badge>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Branch utilization</span>
                  <span className="font-medium">{summary.utilization}%</span>
                </div>
                <Progress value={summary.utilization} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Popular services</CardTitle>
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
                      <p className="text-xs text-muted-foreground">{service.bookings} bookings</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">฿{service.revenue.toLocaleString()}</p>
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

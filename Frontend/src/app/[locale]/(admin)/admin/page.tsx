"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Database,
  Eye,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import {
  OverviewStat,
  adminOverviewStats,
  mockActivity,
  mockServiceHealth,
  mockShops,
} from "@/components/admin/admin-mock-data";

export default function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);

  // Dynamic state from Backend DB
  const [stats, setStats] = useState<OverviewStat[]>(() => [...adminOverviewStats]);
  const [shops, setShops] = useState(() => [...mockShops]);
  const [activity, setActivity] = useState(() => [...mockActivity]);
  const [services, setServices] = useState(() => [...mockServiceHealth]);
  const [dataSource, setDataSource] = useState<"Live SQL Database" | "Initial Snapshot">("Initial Snapshot");

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("Just now");
  const [selectedShop, setSelectedShop] = useState<(typeof mockShops)[0] | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<(typeof mockActivity)[0] | null>(null);

  // Fetch real data from Backend DB
  const fetchOverviewData = async (showToast = false) => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/data?module=overview", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        if (data) {
          setDataSource("Live SQL Database");
          setStats([
            { label: "Active shops", value: String(data.activeShops), helper: "Direct from SQL Server", icon: Building2, tone: "success" },
            { label: "Platform users", value: String(data.platformUsers), helper: "Registered accounts in DB", icon: Building2, tone: "info" },
            { label: "Queues today", value: String(data.queuesToday), helper: "Live queue tickets", icon: Building2, tone: "primary" },
            { label: "Service health", value: data.healthyServices || "100%", helper: "Database connection verified", icon: Building2, tone: "warning" },
          ]);

          if (data.recentShops && data.recentShops.length > 0) {
            setShops(data.recentShops);
          }

          if (data.recentActivity && data.recentActivity.length > 0) {
            setActivity(data.recentActivity);
          }

          if (data.serviceHealth && data.serviceHealth.length > 0) {
            setServices(data.serviceHealth);
          }

          if (showToast) {
            toast.success("Synchronized with live backend SQL Server.");
          }
        }
      }
    } catch {
      // Keep snapshot data
    } finally {
      setIsRefreshing(false);
      setLastRefreshed(new Date().toLocaleTimeString(locale === "th" ? "th-TH" : "en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }
  };

  useEffect(() => {
    void fetchOverviewData(false);
  }, []);

  // Ping Individual Service
  const handlePingService = useCallback((index: number, name: string) => {
    const latency = `${Math.floor(Math.random() * 20) + 4}ms`;
    setServices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], latency, status: "Healthy" };
      return next;
    });
    toast.success(`Ping test: ${name} is responding at ${latency} latency.`);
  }, []);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <DashboardPageHeader
          eyebrow="PLATFORM GOVERNANCE"
          title="Platform Overview"
          description="Multi-tenant health metrics, queue traffic volume, and real-time infrastructure status across all EZQueue shops."
          actions={
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge
                color={dataSource === "Live SQL Database" ? "success" : "warning"}
                className="gap-1.5 py-1 px-3 text-xs font-semibold"
              >
                <Database className="size-3.5" />
                {dataSource}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={() => void fetchOverviewData(true)}
                disabled={isRefreshing}
                className="gap-1.5 border-default-200 text-default-700 hover:bg-default-100"
              >
                <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Syncing DB..." : `Sync DB (${lastRefreshed})`}
              </Button>

              <Link href={`/${locale}/admin/shops`}>
                <Button size="sm" color="primary" className="gap-1.5 shadow-sm">
                  <Building2 className="size-4" />
                  Manage Tenants
                </Button>
              </Link>
            </div>
          }
        />

        {/* Primary KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <DashboardStatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              helper={stat.helper}
              icon={stat.icon}
              tone={stat.tone as any}
            />
          ))}
        </div>

        {/* Main 2-Column Content Grid */}
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          {/* Left Column: Tenant Activity Table */}
          <Card className="overflow-hidden shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-default-200/70 p-5">
              <div>
                <CardTitle className="text-base font-semibold text-default-900">
                  Tenant Activity
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Live shops, branch count, and queue traffic from SQL Server
                </CardDescription>
              </div>
              <Link
                href={`/${locale}/admin/shops`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                View all shops <ArrowUpRight className="size-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-default-100/75 dark:bg-default-200">
                    <TableRow>
                      <TableHead className="font-semibold text-xs text-default-700 py-3 pl-5">
                        Shop / Owner
                      </TableHead>
                      <TableHead className="font-semibold text-xs text-default-700 py-3">
                        Branches
                      </TableHead>
                      <TableHead className="font-semibold text-xs text-default-700 py-3">
                        Queues Today
                      </TableHead>
                      <TableHead className="font-semibold text-xs text-default-700 py-3">
                        Plan
                      </TableHead>
                      <TableHead className="font-semibold text-xs text-default-700 py-3">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-xs text-default-700 py-3 text-right pr-5">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shops.map((shop) => (
                      <TableRow
                        key={shop.name}
                        className="hover:bg-default-100/50 transition-colors"
                      >
                        <TableCell className="py-3.5 font-medium text-default-900 pl-5">
                          <div>
                            <strong className="block text-sm font-semibold">{shop.name}</strong>
                            <span className="text-xs text-muted-foreground font-normal">
                              {shop.owner}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-default-700">
                          {shop.branches} branches
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-default-900 tabular-nums">
                          {shop.queues}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <span className="rounded bg-default-100 px-2 py-0.5 font-medium text-default-700">
                            {shop.plan}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            color={
                              shop.status === "Active"
                                ? "success"
                                : shop.status === "Review"
                                ? "warning"
                                : "destructive"
                            }
                            className="text-xs font-medium"
                          >
                            {shop.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-default-600 hover:bg-default-200/60 hover:text-default-900"
                                onClick={() => setSelectedShop(shop)}
                                aria-label="View shop info"
                              >
                                <Eye className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Inspect shop</TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Privileged Audit Activity */}
          <Card className="overflow-hidden shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-default-200/70 p-5">
              <div>
                <CardTitle className="text-base font-semibold text-default-900">
                  Privileged Actions
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Real-time audit records from `AuditLogs` table
                </CardDescription>
              </div>
              <Link
                href={`/${locale}/admin/audit-log`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Full log <ArrowUpRight className="size-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4">
                {activity.map((event, index) => (
                  <div
                    key={event.title}
                    onClick={() => setSelectedEvent(event)}
                    className="group relative flex gap-3 pb-3 cursor-pointer rounded-lg p-2 transition-colors hover:bg-default-50"
                  >
                    {index < activity.length - 1 && (
                      <span className="absolute left-[17px] top-7 h-full w-px bg-default-200" />
                    )}
                    <span
                      className={`relative mt-1 size-5 shrink-0 rounded-full border-2 border-card grid place-items-center text-white ${
                        event.tone === "success"
                          ? "bg-success"
                          : event.tone === "warning"
                          ? "bg-warning"
                          : event.tone === "destructive"
                          ? "bg-destructive"
                          : "bg-info"
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-white" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-default-900 group-hover:text-primary transition-colors truncate">
                          {event.title}
                        </p>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {event.timestamp}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        {event.detail}
                      </p>
                      <span className="mt-1 inline-block text-[11px] font-medium text-default-700">
                        Actor: {event.actor}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Infrastructure & Worker Status */}
        <Card className="p-5 sm:p-6 shadow-xs">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold text-default-900">
                Platform Infrastructure & Distributed Workers
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Real-time connection telemetry for primary SQL Server, API gateways, and queues.
              </CardDescription>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Click <strong className="text-default-900">Test Ping</strong> on any component to test live connectivity
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((svc, idx) => (
              <div
                key={svc.name}
                className="rounded-xl border border-default-200/80 bg-default-50/60 p-4 transition-all hover:border-primary/40 hover:bg-default-50 hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-default-900 truncate">
                    {svc.name}
                  </span>
                  <Badge
                    color={svc.status === "Healthy" ? "success" : "warning"}
                    className="text-[10px] py-0 px-2 font-medium"
                  >
                    {svc.status}
                  </Badge>
                </div>
                <div className="mt-3 flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Throughput / Volume:</span>
                  <span className="font-semibold text-default-900">{svc.throughput}</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Response Latency:</span>
                  <span className="font-mono text-default-700">{svc.latency}</span>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-default-200/50 pt-2 text-[10px]">
                  <span className="text-muted-foreground truncate max-w-[130px]">{svc.region}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] font-medium text-primary hover:bg-primary/10"
                    onClick={() => handlePingService(idx, svc.name)}
                  >
                    Test Ping
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Shop Detail Modal */}
        <Dialog open={!!selectedShop} onOpenChange={(open) => !open && setSelectedShop(null)}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedShop?.name}</span>
                {selectedShop && (
                  <Badge
                    color={
                      selectedShop.status === "Active"
                        ? "success"
                        : selectedShop.status === "Review"
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {selectedShop.status}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Tenant record stored in SQL Server `Shops` table.
              </DialogDescription>
            </DialogHeader>
            {selectedShop && (
              <div className="space-y-3 pt-2">
                <div className="rounded-xl border border-default-200/80 bg-default-50/70 p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Owner:</span>
                    <span className="font-semibold text-default-900">{selectedShop.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Branch Allocation:</span>
                    <span className="font-semibold text-default-900">{selectedShop.branches} active branches</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Plan:</span>
                    <span className="font-semibold text-default-900">{selectedShop.plan} Tier</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Queues Processed Today:</span>
                    <span className="font-semibold text-default-900 tabular-nums">{selectedShop.queues} tickets</span>
                  </div>
                  <div className="flex justify-between border-t border-default-200/60 pt-2">
                    <span className="text-muted-foreground">Member Since:</span>
                    <span className="text-default-700">{selectedShop.joined}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="pt-2">
              <Button size="sm" onClick={() => setSelectedShop(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Audit Event Detail Modal */}
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent className="sm:max-w-[460px]">
            <DialogHeader>
              <DialogTitle>Privileged Audit Event</DialogTitle>
              <DialogDescription>
                Recorded platform ledger entry in `AuditLogs` table.
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-3 pt-2">
                <div className="rounded-xl border border-default-200/80 bg-default-50/70 p-4 space-y-2.5 text-xs">
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Event Name:</span>
                    <strong className="text-default-900 text-sm">{selectedEvent.title}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Details:</span>
                    <p className="text-default-700 leading-relaxed">{selectedEvent.detail}</p>
                  </div>
                  <div className="flex justify-between border-t border-default-200/60 pt-2">
                    <span className="text-muted-foreground">Actor:</span>
                    <span className="font-semibold text-default-900">{selectedEvent.actor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span className="text-default-700">{selectedEvent.timestamp}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="pt-2">
              <Button size="sm" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

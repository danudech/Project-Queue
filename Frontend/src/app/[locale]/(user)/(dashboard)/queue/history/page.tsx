"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, History, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useShop } from "@/hooks/use-me";
import { http } from "@/lib/http/client";
import { resolveActiveBranchId } from "@/lib/active-branch";
import type { QueueDto } from "@/types/queue";
import { useLocale, useTranslations } from "next-intl";

export default function QueueHistoryPage() {
  const t = useTranslations("OperationsPages.history");
  const locale = useLocale();
  const { data: shop } = useShop();
  const [rows, setRows] = useState<QueueDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [customerQuery, setCustomerQuery] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [activeCustomerQuery, setActiveCustomerQuery] = useState("");
  const [activeStaffFilter, setActiveStaffFilter] = useState("all");
  const [activeDate, setActiveDate] = useState(todayKey());
  const [showAllHistory, setShowAllHistory] = useState(false);

  const loadQueues = useCallback(async (isRefresh = false) => {
    if (!shop) return;
    if (isRefresh) setRefreshing(true);
    try {
      const branchId = await resolveActiveBranchId(shop.shopBranches);
      if (!branchId) { setRows([]); return; }
      const result = await http.get<QueueDto[]>("queues", { params: { branchId } });
      setRows(Array.isArray(result) ? result : []);
    } catch {
      toast.error(t("loadError"));
    } finally {
      if (isRefresh) setRefreshing(false);
      setLoading(false);
    }
  }, [shop, t]);

  useEffect(() => {
    void loadQueues();
  }, [loadQueues]);

  const handleLoadAll = async () => {
    setCustomerQuery("");
    setStaffFilter("all");
    setActiveCustomerQuery("");
    setActiveStaffFilter("all");
    setShowAllHistory(true);
    await loadQueues(true);
  };

  const handleSearch = () => {
    setActiveCustomerQuery(customerQuery.trim());
    setActiveStaffFilter(staffFilter);
    setActiveDate(selectedDate);
    setShowAllHistory(false);
  };

  const allHistory = useMemo(
    () => rows.filter((row) => ["DONE", "CANCELLED", "SKIPPED"].includes(row.status)),
    [rows]
  );

  const staffOptions = useMemo(() => Array.from(new Set(allHistory.map((row) => row.staffName).filter((value): value is string => Boolean(value && value.trim())))).sort((a, b) => a.localeCompare(b)), [allHistory]);

  const history = useMemo(() => {
    const query = activeCustomerQuery.toLocaleLowerCase();
    return allHistory.filter((row) => {
      const searchable = [row.customerName, row.customerPhone].filter(Boolean).join(" ").toLocaleLowerCase();
      return (!query || searchable.includes(query))
        && (activeStaffFilter === "all" || row.staffName === activeStaffFilter)
        && (showAllHistory || toDateKey(row.queueDate || row.createdAt) === activeDate);
    });
  }, [activeCustomerQuery, activeDate, activeStaffFilter, allHistory, showAllHistory]);

  if (loading) return <div className="grid min-h-72 place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <DashboardPageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-white pb-5 dark:bg-card">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div><CardTitle>{t("pastQueues")}</CardTitle><CardDescription className="mt-1">{t("recordCount", { count: history.length })}</CardDescription></div>
            {showAllHistory ? <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{t("allHistoryActive")}</span> : null}
          </div>
          <div className="grid gap-3 pt-2 sm:grid-cols-5">
            <div className="relative min-w-0"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={customerQuery} onChange={(event) => setCustomerQuery(event.target.value)} placeholder={t("customerPlaceholder")} className="h-10 w-full pl-9" /></div>
            <select value={staffFilter} onChange={(event) => setStaffFilter(event.target.value)} className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm"><option value="all">{t("allStaff")}</option>{staffOptions.map((name) => <option key={name} value={name}>{name}</option>)}</select>
            <div className="relative min-w-0"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="h-10 w-full pl-9" /></div>
            <Button type="button" className="h-10 w-full" onClick={handleSearch}>{t("search")}</Button>
            <Button type="button" variant={showAllHistory ? "default" : "outline"} className="h-10 w-full" disabled={refreshing} onClick={handleLoadAll}>{refreshing ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}{t("loadAll")}</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-default-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-24">{t("columns.number")}</TableHead>
                  <TableHead>{t("columns.customer")}</TableHead>
                  <TableHead>{t("columns.service")}</TableHead>
                  <TableHead>{t("columns.remark")}</TableHead>
                  <TableHead>{t("columns.dateTime")}</TableHead>
                  <TableHead>{t("columns.staff")}</TableHead>
                  <TableHead>{t("columns.source")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">Q-{row.queueNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{row.customerName || t("walkInCustomer")}</div>
                      {row.customerPhone ? <div className="text-xs text-muted-foreground">{row.customerPhone}</div> : null}
                    </TableCell>
                    <TableCell>{row.serviceName || "-"}</TableCell>
                    <TableCell>
                      {row.remark ? (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 max-w-56">
                          <span>{row.remark}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>{new Date(row.queueDate || row.createdAt).toLocaleDateString(locale)}</div>
                      <div className="text-xs text-muted-foreground">{row.queueStartTime || new Date(row.createdAt).toLocaleTimeString(locale)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{row.staffName || t("unassigned")}</div>
                      {row.staffId ? <div className="text-xs text-muted-foreground">ID: {row.staffId}</div> : null}
                    </TableCell>
                    <TableCell>{row.type === "WALK_IN" ? t("walkIn") : t("booking")}</TableCell>
                    <TableCell><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{t(`status.${row.status.toLowerCase()}`)}</span></TableCell>
                  </TableRow>
                ))}
                {!history.length ? <TableRow><TableCell colSpan={8} className="h-48 text-center"><div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground"><History className="size-8 text-slate-300" /><span>{t("empty")}</span></div></TableCell></TableRow> : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toDateKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

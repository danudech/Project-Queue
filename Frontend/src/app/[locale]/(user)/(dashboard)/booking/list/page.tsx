"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  LogIn,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { useShop } from "@/hooks/use-me";
import { usePermissions } from "@/hooks/use-permissions";
import { http } from "@/lib/http/client";
import { resolveActiveBranchId } from "@/lib/active-branch";
import type { BookingDto } from "@/types/booking";

const PAGE_SIZE = 10;

export default function BookingListPage() {
  const t = useTranslations("OperationsPages.booking");
  const locale = useLocale();
  const { data: shop } = useShop();
  const { can } = usePermissions();
  const canManageBookings = can("booking.manage");
  const [rows, setRows] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey);
  const [currentPage, setCurrentPage] = useState(1);

  const load = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    try {
      const branchId = await resolveActiveBranchId(shop.shopBranches);
      if (!branchId) {
        setRows([]);
        return;
      }
      const result = await http.get<BookingDto[]>("booking", {
        params: { branchId },
      });
      setRows(Array.isArray(result) ? result : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [shop, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(
    () => ({
      total: rows.length,
      waiting: rows.filter((row) => row.status === "WAITING").length,
      confirmed: rows.filter((row) => row.status === "CONFIRMED").length,
      done: rows.filter((row) => row.status === "DONE").length,
    }),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();
    return rows.filter((row) => {
      if (selectedDate && toDateKey(row.date) !== selectedDate) return false;
      if (!keyword) return true;
      return [
        row.customerName,
        row.serviceName,
        row.staffName ?? "",
        row.status,
        row.guid,
      ].some((value) => value.toLocaleLowerCase().includes(keyword));
    });
  }, [rows, search, selectedDate]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paginatedRows = useMemo(
    () =>
      filteredRows.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [currentPage, filteredRows],
  );
  const visibleFrom = filteredRows.length
    ? (currentPage - 1) * PAGE_SIZE + 1
    : 0;
  const visibleTo = Math.min(currentPage * PAGE_SIZE, filteredRows.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDate]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const changeStatus = async (booking: BookingDto, status: string) => {
    if (!canManageBookings) return;
    setUpdating(booking.id);
    try {
      const saved = await http.patch<BookingDto>("booking", {
        id: booking.id,
        status,
      });
      setRows((current) =>
        current.map((row) => (row.id === saved.id ? saved : row)),
      );
      toast.success(t("updated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("updateError"));
    } finally {
      setUpdating(null);
    }
  };

  if (loading)
    return (
      <div className="grid min-h-72 place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          icon={CalendarCheck2}
          label={t("all")}
          value={counts.total}
        />
        <DashboardStatCard
          icon={Clock3}
          label={t("waiting")}
          value={counts.waiting}
          tone="warning"
        />
        <DashboardStatCard
          icon={UserRound}
          label={t("confirmed")}
          value={counts.confirmed}
          tone="info"
        />
        <DashboardStatCard
          icon={CheckCircle2}
          label={t("completed")}
          value={counts.done}
          tone="success"
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="gap-4 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("appointments")}</CardTitle>
            <CardDescription className="mt-1">
              {t("appointmentsDescription")}
            </CardDescription>
          </div>
          <div className="flex w-full flex-col gap-2 sm:max-w-xl sm:flex-row">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              {t("dateFilter")}
              <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="w-auto" />
            </label>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("search")} className="pl-9" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[980px]">
              <TableHeader className="bg-default-200">
                <TableRow>
                  <TableHead className="w-16 px-6 text-xs font-semibold uppercase tracking-wide">
                    {t("columns.number")}
                  </TableHead>
                  <TableHead className="min-w-52 text-xs font-semibold uppercase tracking-wide">
                    {t("columns.customer")}
                  </TableHead>
                  <TableHead className="min-w-48 text-xs font-semibold uppercase tracking-wide">
                    {t("columns.service")}
                  </TableHead>
                  <TableHead className="min-w-40 text-xs font-semibold uppercase tracking-wide">
                    {t("columns.dateTime")}
                  </TableHead>
                  <TableHead className="min-w-44 text-xs font-semibold uppercase tracking-wide">
                    {t("columns.staff")}
                  </TableHead>
                  <TableHead className="min-w-32 text-xs font-semibold uppercase tracking-wide">
                    {t("columns.status")}
                  </TableHead>
                  <TableHead className="min-w-40 pr-6 text-right text-xs font-semibold uppercase tracking-wide">
                    {t("columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.map((row, index) => {
                  const isUpdating = updating === row.id;
                  return (
                    <TableRow key={row.id} className="transition-colors hover:bg-default-100">
                      <TableCell className="px-6 text-muted-foreground">
                        {visibleFrom + index}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-default-900">
                          {row.customerName}
                        </p>
                        <p className="mt-1 max-w-44 truncate text-xs text-muted-foreground">
                          #{row.guid.slice(0, 8).toUpperCase()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{row.serviceName}</p>
                        {row.remark && (
                          <p className="mt-1 max-w-44 truncate text-xs text-muted-foreground">
                            {row.remark}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium tabular-nums">
                          {new Date(row.date).toLocaleDateString(locale, {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock3 className="size-3.5" />
                          {row.startTime}
                        </p>
                      </TableCell>
                      <TableCell>
                        {row.staffName ? (
                          <div className="flex items-center gap-2">
                            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {row.staffName.slice(0, 1).toUpperCase()}
                            </span>
                            <span className="font-medium">{row.staffName}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {t("staffPending")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Status
                          value={row.status}
                          label={t(getStatusTranslationKey(row.status))}
                        />
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {isUpdating && (
                            <Loader2 className="mr-1 size-4 animate-spin text-primary" />
                          )}
                          {row.status === "WAITING" && (
                            <Button
                              size="icon"
                              variant="outline"
                              className="size-8"
                              title={t("confirm")}
                              disabled={!canManageBookings || isUpdating}
                              onClick={() => changeStatus(row, "CONFIRMED")}
                            >
                              <Check className="size-4" />
                            </Button>
                          )}
                          {row.status === "CONFIRMED" && (
                            <Button
                              size="icon"
                              variant="outline"
                              className="size-8"
                              title={t("checkIn")}
                              disabled={!canManageBookings || isUpdating}
                              onClick={() => changeStatus(row, "CHECKED_IN")}
                            >
                              <LogIn className="size-4" />
                            </Button>
                          )}
                          {row.status === "CHECKED_IN" && (
                            <Button
                              size="icon"
                              variant="outline"
                              className="size-8 text-emerald-600"
                              title={t("complete")}
                              disabled={!canManageBookings || isUpdating}
                              onClick={() => changeStatus(row, "DONE")}
                            >
                              <CheckCircle2 className="size-4" />
                            </Button>
                          )}
                          {!["DONE", "CANCELLED", "NO_SHOW"].includes(
                            row.status,
                          ) && (
                            <Button
                              size="icon"
                              variant="outline"
                              className="size-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              title={t("cancel")}
                              disabled={!canManageBookings || isUpdating}
                              onClick={() => changeStatus(row, "CANCELLED")}
                            >
                              <X className="size-4" />
                            </Button>
                          )}
                          {["DONE", "CANCELLED", "NO_SHOW"].includes(
                            row.status,
                          ) && (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!paginatedRows.length && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-40 text-center text-sm text-muted-foreground"
                    >
                      {t("empty")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              {t("pagination", {
                from: visibleFrom,
                to: visibleTo,
                total: filteredRows.length,
              })}
            </p>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                size="icon"
                variant="outline"
                className="size-8"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => page - 1)}
                aria-label={t("previousPage")}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="min-w-16 text-center text-xs">
                {currentPage} / {totalPages}
              </span>
              <Button
                size="icon"
                variant="outline"
                className="size-8"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
                aria-label={t("nextPage")}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getStatusTranslationKey(status: string) {
  if (status === "DONE") return "completed" as const;
  if (status === "CONFIRMED") return "confirmed" as const;
  if (status === "CHECKED_IN") return "checkIn" as const;
  if (status === "CANCELLED") return "cancel" as const;
  if (status === "NO_SHOW") return "noShow" as const;
  return "waiting" as const;
}

function toDateKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getTodayDateKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function Status({ value, label }: { value: string; label: string }) {
  const tone =
    value === "DONE"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : value === "CANCELLED"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : value === "CONFIRMED"
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : value === "CHECKED_IN"
            ? "border-violet-200 bg-violet-50 text-violet-700"
            : value === "NO_SHOW"
              ? "border-default-300 bg-default-100 text-default-600"
              : "border-amber-200 bg-amber-50 text-amber-700";
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${tone}`}
    >
      {label}
    </span>
  );
}

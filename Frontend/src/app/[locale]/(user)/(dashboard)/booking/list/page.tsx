"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Loader2,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { useShop } from "@/hooks/use-me";
import { usePermissions } from "@/hooks/use-permissions";
import { http } from "@/lib/http/client";
import { resolveActiveBranchId } from "@/lib/active-branch";
import type { BookingDto } from "@/types/booking";
import { useTranslations } from "next-intl";

export default function BookingListPage() {
  const t = useTranslations("OperationsPages.booking");
  const { data: shop } = useShop();
  const { can } = usePermissions();
  const canManageBookings = can("booking.manage");
  const [rows, setRows] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

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
      toast.error(
        error instanceof Error ? error.message : t("loadError"),
      );
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
      waiting: rows.filter((r) => r.status === "WAITING").length,
      confirmed: rows.filter((r) => r.status === "CONFIRMED").length,
      done: rows.filter((r) => r.status === "DONE").length,
    }),
    [rows],
  );
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
      toast.error(
        error instanceof Error ? error.message : t("updateError"),
      );
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
      <Card>
        <CardHeader>
          <CardTitle>{t("appointments")}</CardTitle>
          <CardDescription>{t("appointmentsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-4 rounded-xl border p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{row.customerName}</p>
                  <Status
                    value={row.status}
                    label={t(
                      row.status === "DONE"
                        ? "completed"
                        : row.status === "CONFIRMED"
                          ? "confirmed"
                          : row.status === "CHECKED_IN"
                            ? "checkIn"
                            : row.status === "CANCELLED"
                              ? "cancel"
                              : row.status === "NO_SHOW"
                                ? "noShow"
                                : "waiting",
                    )}
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {row.serviceName} · {new Date(row.date).toLocaleDateString()}{" "}
                  at {row.startTime}
                </p>
                <p className="mt-1 text-sm">
                  {row.staffName
                    ? t("withStaff", { name: row.staffName })
                    : t("staffPending")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {row.status === "WAITING" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canManageBookings || updating === row.id}
                    onClick={() => changeStatus(row, "CONFIRMED")}
                  >
                    {t("confirm")}
                  </Button>
                )}
                {["WAITING", "CONFIRMED"].includes(row.status) && (
                  <Button
                    size="sm"
                    disabled={!canManageBookings || updating === row.id}
                    onClick={() => changeStatus(row, "CHECKED_IN")}
                  >
                    {t("checkIn")}
                  </Button>
                )}
                {row.status === "CHECKED_IN" && (
                  <Button
                    size="sm"
                    disabled={!canManageBookings || updating === row.id}
                    onClick={() => changeStatus(row, "DONE")}
                  >
                    {t("complete")}
                  </Button>
                )}
                {!["DONE", "CANCELLED", "NO_SHOW"].includes(row.status) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!canManageBookings || updating === row.id}
                    onClick={() => changeStatus(row, "CANCELLED")}
                  >
                    {t("cancel")}
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!rows.length && (
            <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
              {t("empty")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Status({ value, label }: { value: string; label: string }) {
  const tone =
    value === "DONE"
      ? "bg-emerald-50 text-emerald-700"
      : value === "CANCELLED"
        ? "bg-rose-50 text-rose-700"
        : "bg-amber-50 text-amber-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {label}
    </span>
  );
}

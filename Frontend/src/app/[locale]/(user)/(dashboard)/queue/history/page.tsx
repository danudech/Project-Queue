"use client";

import { useEffect, useMemo, useState } from "react";
import { History, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  useEffect(() => {
    if (!shop) return;

    void (async () => {
      try {
        const branchId = await resolveActiveBranchId(shop.shopBranches);
        if (!branchId) {
          setRows([]);
          return;
        }
        const result = await http.get<QueueDto[]>("queues", {
          params: { branchId },
        });
        setRows(Array.isArray(result) ? result : []);
      } catch (error) {
        toast.error(t("loadError"));
      } finally {
        setLoading(false);
      }
    })();
  }, [shop]);

  const history = useMemo(
    () =>
      rows.filter((row) =>
        ["DONE", "CANCELLED", "SKIPPED"].includes(row.status)
      ),
    [rows]
  );

  if (loading) {
    return (
      <div className="grid min-h-72 place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t("pastQueues")}</CardTitle>
          <CardDescription>{t("recordCount", { count: history.length })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.map((row) => (
            <div
              key={row.id}
              className="flex flex-col justify-between gap-3 rounded-xl border p-4 transition-colors hover:bg-default-200 dark:hover:bg-default-300 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-muted">
                  <History className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">
                    Q-{row.queueNumber} · {row.customerName || t("walkInCustomer")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {row.serviceName || t("service")} · {row.staffName || t("unassigned")}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {t(`status.${row.status.toLowerCase()}`)}
                </span>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(row.createdAt).toLocaleString(locale)}
                </p>
              </div>
            </div>
          ))}
          {!history.length ? (
            <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
              {t("empty")}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

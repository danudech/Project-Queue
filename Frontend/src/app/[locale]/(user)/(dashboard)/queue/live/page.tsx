"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Loader2, Play, Plus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useShop } from "@/hooks/use-me";
import { usePermissions } from "@/hooks/use-permissions";
import { http } from "@/lib/http/client";
import { resolveActiveBranchId } from "@/lib/active-branch";
import type { QueueDto } from "@/types/queue";
import type { SetService } from "@/types/shop/service";
import type { StaffMember } from "@/types/shop/staff";
import { useTranslations } from "next-intl";

export default function QueueLivePage() {
  const t = useTranslations("OperationsPages.queue");
  const { data: shop } = useShop();
  const { can } = usePermissions();
  const canManageQueue = can("queue.manage");
  const [branchId, setBranchId] = useState(0);
  const [rows, setRows] = useState<QueueDto[]>([]);
  const [services, setServices] = useState<SetService[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [serviceId, setServiceId] = useState(0);
  const [staffId, setStaffId] = useState(0);
  const selectedService = services.find((service) => service.id === serviceId);

  const load = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    try {
      const selectedBranch = await resolveActiveBranchId(shop.shopBranches);
      setBranchId(selectedBranch);
      if (!selectedBranch) {
        setRows([]);
        setServices([]);
        return;
      }
      const [queueData, serviceData] = await Promise.all([
        http.get<QueueDto[]>("queues", {
          params: { branchId: selectedBranch },
        }),
        http.get<SetService[]>("catalog", {
          params: { branchId: selectedBranch },
        }),
      ]);
      setRows(Array.isArray(queueData) ? queueData : []);
      setServices(Array.isArray(serviceData) ? serviceData : []);
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
  useEffect(() => {
    if (!serviceId) return setStaff([]);
    void http
      .get<StaffMember[]>("staff", {
        params: { branchId, serviceId, eligible: true },
      })
      .then(setStaff)
      .catch((e) => toast.error(e.message));
    setStaffId(0);
  }, [branchId, serviceId]);

  const counts = useMemo(
    () => ({
      waiting: rows.filter((r) => r.status === "WAITING").length,
      serving: rows.filter((r) => r.status === "SERVING").length,
      done: rows.filter((r) => r.status === "DONE").length,
    }),
    [rows],
  );
  const activeRows = useMemo(
    () => rows.filter((row) => ["WAITING", "SERVING"].includes(row.status)),
    [rows],
  );
  const update = async (row: QueueDto, status: string) => {
    if (!canManageQueue) return;
    try {
      const saved = await http.patch<QueueDto>("queues", {
        id: row.id,
        status,
      });
      setRows((current) =>
        current.map((item) => (item.id === saved.id ? saved : item)),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("updateError"),
      );
    }
  };
  const create = async () => {
    if (!canManageQueue) return;
    if (!serviceId) return toast.error(t("selectServiceError"));
    if (selectedService?.staffSelectionMode === "REQUIRED" && !staffId)
      return toast.error(t("selectStaffError"));
    setSaving(true);
    try {
      const saved = await http.post<QueueDto>("queues", {
        branchId,
        serviceId,
        staffId: staffId || undefined,
        customerName: customerName || undefined,
        type: "WALK_IN",
      });
      setRows((current) => [saved, ...current]);
      setOpen(false);
      setCustomerName("");
      setServiceId(0);
      toast.success(t("added", { number: saved.queueNumber }));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("addError"),
      );
    } finally {
      setSaving(false);
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
        actions={
          canManageQueue ? (
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="size-4" />
            {t("addWalkIn")}
          </Button>
          ) : undefined
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatCard
          icon={Clock3}
          label={t("waiting")}
          value={counts.waiting}
          tone="warning"
        />
        <DashboardStatCard
          icon={Play}
          label={t("serving")}
          value={counts.serving}
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
          <CardTitle>{t("board")}</CardTitle>
          <CardDescription>{t("boardDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeRows.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-4 rounded-xl border p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 font-semibold text-primary">
                  Q-{row.queueNumber}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      {row.customerName || t("walkInCustomer")}
                    </p>
                    <Status
                      value={row.status}
                      label={t(
                        row.status === "SERVING"
                          ? "serving"
                          : row.status === "DONE"
                            ? "completed"
                            : "waiting",
                      )}
                    />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {row.serviceName || t("service")}
                  </p>
                  <p className="mt-1 text-sm">
                    {row.staffName
                      ? t("assignedTo", { name: row.staffName })
                      : t("waitingAssignment")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {row.status === "WAITING" && (
                  <Button size="sm" onClick={() => update(row, "SERVING")} disabled={!canManageQueue}>
                    {t("start")}
                  </Button>
                )}
                {row.status === "SERVING" && (
                  <Button size="sm" onClick={() => update(row, "DONE")} disabled={!canManageQueue}>
                    {t("complete")}
                  </Button>
                )}
                {!["DONE", "CANCELLED", "SKIPPED"].includes(row.status) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => update(row, "SKIPPED")}
                    disabled={!canManageQueue}
                  >
                    {t("skip")}
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!activeRows.length && (
            <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
              {t("empty")}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addWalkIn")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="space-y-2 text-sm font-medium">
              {t("customerOptional")}
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              {t("service")}
              <select
                className="h-11 w-full rounded-md border bg-background px-3 font-normal"
                value={serviceId}
                onChange={(e) => setServiceId(Number(e.target.value))}
              >
                <option value={0}>{t("selectService")}</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>
            {selectedService?.staffSelectionMode !== "AUTO" &&
              serviceId > 0 && (
                <label className="block space-y-2 text-sm font-medium">
                  {selectedService?.staffSelectionMode === "REQUIRED"
                    ? t("staffRequired")
                    : t("staffOptional")}
                  <select
                    className="h-11 w-full rounded-md border bg-background px-3 font-normal"
                    value={staffId}
                    onChange={(e) => setStaffId(Number(e.target.value))}
                  >
                    <option value={0}>
                      {selectedService?.staffSelectionMode === "OPTIONAL"
                        ? t("anyone")
                        : t("selectStaff")}
                    </option>
                    {staff.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            {selectedService?.staffSelectionMode === "AUTO" && (
              <p className="rounded-xl bg-primary/5 p-3 text-sm text-primary">
                {t("autoAssignment")}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={create} disabled={saving || !canManageQueue}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Status({ value, label }: { value: string; label: string }) {
  const tone =
    value === "SERVING"
      ? "bg-sky-50 text-sky-700"
      : value === "DONE"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-amber-50 text-amber-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {label}
    </span>
  );
}

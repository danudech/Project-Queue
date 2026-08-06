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
import type { AvailableSlotResponse } from "@/types/queue";
import type { SetService } from "@/types/shop/service";
import type { StaffMember } from "@/types/shop/staff";
import type { CustomerType } from "@/types/shop/customer";
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
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(0);
  const [staffId, setStaffId] = useState(0);
  const [slots, setSlots] = useState<AvailableSlotResponse[]>([]);
  const [slotId, setSlotId] = useState(0);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const selectedService = services.find((service) => service.id === serviceId);
  const selectedSlot = slots.find((slot) => slot.id === slotId);
  const availableStaff = useMemo(() => {
    const availableIds = new Set(selectedSlot?.availableStaffIds ?? []);
    return staff.filter((person) => availableIds.has(person.id));
  }, [selectedSlot, staff]);
  const filteredCustomers = useMemo(() => {
    const query = customerQuery.trim().toLowerCase();
    if (!query) return customers.slice(0, 8);
    return customers
      .filter((customer) => `${customer.name} ${customer.phone}`.toLowerCase().includes(query))
      .slice(0, 8);
  }, [customerQuery, customers]);

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
  const refreshQueues = useCallback(async () => {
    if (!branchId) return;
    try {
      const queueData = await http.get<QueueDto[]>("queues", {
        params: { branchId },
      });
      setRows(Array.isArray(queueData) ? queueData : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("loadError"));
    }
  }, [branchId, t]);
  useEffect(() => {
    if (!shop || !branchId) return;
    const timer = window.setInterval(() => void refreshQueues(), 30_000);
    return () => window.clearInterval(timer);
  }, [branchId, refreshQueues, shop]);
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
  useEffect(() => {
    if (!branchId || !serviceId) {
      setSlots([]);
      setSlotId(0);
      return;
    }
    setSlotsLoading(true);
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    void http
      .get<AvailableSlotResponse[]>("slots", { params: { branchId, serviceId, date } })
      .then((data) => {
        const available = Array.isArray(data) ? data : [];
        setSlots(available);
        setSlotId(0);
        setStaffId(0);
      })
      .catch((error) => {
        setSlots([]);
        setSlotId(0);
        toast.error(error instanceof Error ? error.message : t("slotLoadError"));
      })
      .finally(() => setSlotsLoading(false));
  }, [branchId, serviceId, t]);
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setCustomerQuery("");
    setSelectedCustomer(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setServiceId(0);
    setStaffId(0);
    setSlotId(0);
    setSlots([]);
    setCustomersLoading(true);
    void http
      .get<CustomerType[]>("customer")
      .then((data) => setCustomers(Array.isArray(data) ? data.filter((customer) => customer.isActive) : []))
      .catch(() => setCustomers([]))
      .finally(() => setCustomersLoading(false));
  }, [open]);

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
    if (!slotId) return toast.error(t("selectSlotError"));
    if (selectedService?.staffSelectionMode === "REQUIRED" && !staffId)
      return toast.error(t("selectStaffError"));
    if (!selectedCustomer && (!customerName.trim() || !customerPhone.trim()))
      return toast.error(t("selectCustomerError"));
    setSaving(true);
    try {
      const saved = await http.post<QueueDto>("queues", {
        branchId,
        serviceId,
        queueSlotId: slotId,
        staffId: staffId || undefined,
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer ? undefined : customerName.trim(),
        customerPhone: selectedCustomer ? undefined : customerPhone.trim(),
        customerEmail: selectedCustomer ? undefined : customerEmail.trim() || undefined,
        type: "WALK_IN",
      });
      setRows((current) => [saved, ...current]);
      setOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setSelectedCustomer(null);
      setCustomerQuery("");
      setServiceId(0);
      setSlotId(0);
      setSlots([]);
      setStep(1);
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
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("addWalkIn")}</DialogTitle>
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              {[t("stepServiceAndStaff"), t("stepCustomer")].map((label, index) => (
                <span key={label} className={index + 1 === step ? "font-semibold text-primary" : undefined}>
                  {index + 1}. {label}
                </span>
              ))}
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {step === 1 && <div className="space-y-4">
              <label className="block space-y-2 text-sm font-medium">
                <span>{t("service")} <span className="text-destructive">*</span></span>
                <select className={`h-11 w-full rounded-md border bg-background px-3 font-normal ${!serviceId ? "border-destructive/70" : ""}`} value={serviceId} onChange={(e) => { setServiceId(Number(e.target.value)); setSlotId(0); }} aria-required="true" aria-invalid={!serviceId}>
                  <option value={0}>{t("selectService")}</option>
                  {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
                </select>
              </label>
              {serviceId > 0 && <label className="block space-y-2 text-sm font-medium">
                <span>{t("selectSlotRequired")} <span className="text-destructive">*</span></span>
                <select className={`h-11 w-full rounded-md border bg-background px-3 font-normal ${!slotId && !slotsLoading ? "border-destructive/70" : ""}`} value={slotId} onChange={(e) => { setSlotId(Number(e.target.value)); setStaffId(0); }} disabled={slotsLoading || !slots.length} aria-required="true" aria-invalid={!slotId}>
                  <option value={0}>{slotsLoading ? t("loadingSlots") : slots.length ? t("selectSlot") : t("noSlots")}</option>
                  {slots.map((slot) => <option key={slot.id} value={slot.id}>{slot.startTime} - {slot.endTime} ({t("slotsRemaining", { count: slot.remaining })})</option>)}
                </select>
                {!slotsLoading && !slotId && <p className="text-xs font-medium text-destructive">{slots.length ? t("selectSlotError") : t("noSlots")}</p>}
              </label>}
              {selectedService?.staffSelectionMode === "REQUIRED" && (
                <label className="block space-y-2 text-sm font-medium">
                  <span>{t("staffRequired")} <span className="text-destructive">*</span></span>
                  <select className={`h-11 w-full rounded-md border bg-background px-3 font-normal ${!staffId ? "border-destructive/70" : ""}`} value={staffId} onChange={(e) => setStaffId(Number(e.target.value))} disabled={!slotId} aria-required="true" aria-invalid={!staffId}>
                    <option value={0}>{slotId ? t("selectStaff") : t("selectSlotFirst")}</option>
                    {availableStaff.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  {!staffId && <p className="text-xs font-medium text-destructive">{t("selectStaffError")}</p>}
                </label>
              )}
              {selectedService && selectedService.staffSelectionMode !== "REQUIRED" && slotId > 0 && (
                <p className="rounded-xl bg-primary/5 p-3 text-sm text-primary">{t("autoAssignmentForSlot")}</p>
              )}
            </div>}
            {step === 2 && <div className="space-y-3">
              <label className="space-y-2 text-sm font-medium">
                {t("selectCustomer")}
                <Input value={customerQuery} onChange={(e) => setCustomerQuery(e.target.value)} placeholder={t("searchCustomer")} />
              </label>
              {customersLoading ? <p className="text-sm text-muted-foreground">{t("loadingCustomers")}</p> : filteredCustomers.length > 0 ? <div className="max-h-44 space-y-2 overflow-y-auto">
                {filteredCustomers.map((customer) => <button type="button" key={customer.id} onClick={() => { setSelectedCustomer(customer); setCustomerName(""); setCustomerPhone(""); setCustomerEmail(""); }} className={`w-full rounded-lg border p-3 text-left text-sm ${selectedCustomer?.id === customer.id ? "border-primary bg-primary/5" : ""}`}><span className="font-medium">{customer.name}</span><span className="ml-2 text-muted-foreground">{customer.phone}</span></button>)}
              </div> : <p className="text-sm text-muted-foreground">{t("noCustomers")}</p>}
              <div className="flex items-center gap-3 py-1 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /><span>{t("orNewCustomer")}</span><span className="h-px flex-1 bg-border" /></div>
              <label className="space-y-2 text-sm font-medium">{t("newCustomerName")}
                <Input value={customerName} onChange={(e) => { setSelectedCustomer(null); setCustomerName(e.target.value); }} placeholder={t("newCustomerNamePlaceholder")} />
              </label>
              <label className="space-y-2 text-sm font-medium">{t("newCustomerPhone")}
                <Input value={customerPhone} onChange={(e) => { setSelectedCustomer(null); setCustomerPhone(e.target.value); }} placeholder={t("newCustomerPhonePlaceholder")} />
              </label>
              <label className="space-y-2 text-sm font-medium">{t("newCustomerEmail")}
                <Input type="email" value={customerEmail} onChange={(e) => { setSelectedCustomer(null); setCustomerEmail(e.target.value); }} placeholder={t("newCustomerEmailPlaceholder")} />
              </label>
            </div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            {step > 1 && <Button variant="ghost" onClick={() => setStep((current) => current - 1)}>{t("back")}</Button>}
            {step < 2 ? <Button disabled={!canManageQueue || !serviceId || !slotId || slotsLoading || (selectedService?.staffSelectionMode === "REQUIRED" && !staffId)} onClick={() => {
              if (!serviceId) return toast.error(t("selectServiceError"));
              if (!slotId) return toast.error(t("selectSlotError"));
              if (selectedService?.staffSelectionMode === "REQUIRED" && !staffId) return toast.error(t("selectStaffError"));
              setStep(2);
            }}>{t("next")}</Button> : <Button onClick={create} disabled={saving || !canManageQueue}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("add")}
            </Button>}
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

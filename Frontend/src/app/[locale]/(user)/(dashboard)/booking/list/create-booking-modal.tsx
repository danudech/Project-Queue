"use client";

import { useEffect, useState } from "react";
import { Loader2, User, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { http } from "@/lib/http/client";
import type { AvailableSlotResponse } from "@/types/queue";
import type { CustomerType } from "@/types/shop/customer";

interface CatalogService {
  id: number;
  name: string;
  duration?: number;
  price?: number;
}

interface StaffMember {
  id: number;
  name: string;
}

interface CreateBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: number;
  onSuccess: () => void;
}

export function CreateBookingModal({
  open,
  onOpenChange,
  branchId,
  onSuccess,
}: CreateBookingModalProps) {
  const t = useTranslations("OperationsPages.booking");

  const [services, setServices] = useState<CatalogService[]>([]);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [slots, setSlots] = useState<AvailableSlotResponse[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  const [serviceId, setServiceId] = useState<number>(0);
  const [bookingDate, setBookingDate] = useState<string>(getTodayDateKey());
  const [slotId, setSlotId] = useState<number>(0);
  const [staffId, setStaffId] = useState<number>(0);

  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">(
    "",
  );

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [remark, setRemark] = useState("");

  const [loadingInitial, setLoadingInitial] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load catalog services & customers when modal opens
  useEffect(() => {
    if (!open || !branchId) return;
    setLoadingInitial(true);
    Promise.all([
      http.get<CatalogService[]>("catalog", { params: { branchId } }),
      http.get<CustomerType[]>("customer"),
    ])
      .then(([serviceRes, customerRes]) => {
        const servList = Array.isArray(serviceRes) ? serviceRes : [];
        const custs = Array.isArray(customerRes) ? customerRes : [];
        setServices(servList);
        setCustomers(custs);
        if (servList.length > 0) setServiceId(servList[0].id);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : t("loadError"));
      })
      .finally(() => setLoadingInitial(false));
  }, [open, branchId, t]);

  // Fetch slots & staff when serviceId or bookingDate changes
  useEffect(() => {
    if (!open || !branchId || !serviceId || !bookingDate) {
      setSlots([]);
      setSlotId(0);
      setStaffList([]);
      setStaffId(0);
      return;
    }

    setSlotsLoading(true);
    Promise.all([
      http.get<AvailableSlotResponse[]>("slots", {
        params: { branchId, serviceId, date: bookingDate },
      }),
      http.get<StaffMember[]>("staff", {
        params: { branchId, serviceId, eligible: true },
      }),
    ])
      .then(([slotRes, staffRes]) => {
        const availableSlots = Array.isArray(slotRes) ? slotRes : [];
        const availableStaff = Array.isArray(staffRes) ? staffRes : [];
        setSlots(availableSlots);
        setSlotId(availableSlots.length > 0 ? availableSlots[0].id : 0);
        setStaffList(availableStaff);
        setStaffId(0);
      })
      .catch((err) => {
        setSlots([]);
        setSlotId(0);
        setStaffList([]);
        toast.error(err instanceof Error ? err.message : t("loadError"));
      })
      .finally(() => setSlotsLoading(false));
  }, [open, branchId, serviceId, bookingDate, t]);

  // Auto-fill customer details when selecting existing customer
  const handleSelectCustomer = (idStr: string) => {
    if (!idStr) {
      setSelectedCustomerId("");
      setGuestName("");
      setGuestPhone("");
      setGuestEmail("");
      return;
    }
    const id = Number(idStr);
    setSelectedCustomerId(id);
    const target = customers.find((c) => c.id === id);
    if (target) {
      setGuestName(target.name);
      setGuestPhone(target.phone);
      setGuestEmail("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId) {
      toast.error(t("selectService"));
      return;
    }
    if (!slotId) {
      toast.error(t("selectSlot"));
      return;
    }
    if (!guestName.trim() || guestName.trim().length < 2) {
      toast.error(t("customerName"));
      return;
    }
    if (!guestPhone.trim() || guestPhone.trim().length < 8) {
      toast.error(t("customerPhone"));
      return;
    }

    setSubmitting(true);
    try {
      await http.post("booking", {
        branchId,
        serviceId,
        queueSlotId: slotId,
        staffId: staffId || null,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim() || null,
        remark: remark.trim() || null,
      });

      toast.success(t("bookingSuccess"));
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("updateError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createBookingModalTitle")}</DialogTitle>
          <DialogDescription>
            {t("createBookingModalDescription")}
          </DialogDescription>
        </DialogHeader>

        {loadingInitial ? (
          <div className="grid min-h-48 place-items-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Service Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {t("selectService")} *
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(Number(e.target.value))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                required
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.price ? `(฿${s.price.toLocaleString()})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time Slot Row */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  {t("selectDate")} *
                </label>
                <Input
                  type="date"
                  min={getTodayDateKey()}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  {t("selectSlot")} *
                </label>
                <select
                  value={slotId}
                  onChange={(e) => setSlotId(Number(e.target.value))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={slotsLoading || !slots.length}
                  required
                >
                  {!slots.length ? (
                    <option value={0}>
                      {slotsLoading ? t("loadingSlots") : t("noSlots")}
                    </option>
                  ) : (
                    slots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.startTime} – {slot.endTime} (เหลือ {slot.remaining} คิว)
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Staff Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {t("selectStaff")}
              </label>
              <select
                value={staffId}
                onChange={(e) => setStaffId(Number(e.target.value))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value={0}>{t("autoStaff")}</option>
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Info Section */}
            <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("customerType")}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={customerMode === "existing" ? "default" : "outline"}
                    onClick={() => {
                      setCustomerMode("existing");
                      setSelectedCustomerId("");
                      setGuestName("");
                      setGuestPhone("");
                      setGuestEmail("");
                    }}
                    className="h-7 text-xs"
                  >
                    <User className="mr-1 size-3.5" />
                    {t("existingCustomer")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={customerMode === "new" ? "default" : "outline"}
                    onClick={() => {
                      setCustomerMode("new");
                      setSelectedCustomerId("");
                      setGuestName("");
                      setGuestPhone("");
                      setGuestEmail("");
                    }}
                    className="h-7 text-xs"
                  >
                    <UserPlus className="mr-1 size-3.5" />
                    {t("newCustomer")}
                  </Button>
                </div>
              </div>

              {customerMode === "existing" && (
                <div>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => handleSelectCustomer(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">-- {t("existingCustomer")} --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    {t("customerName")} *
                  </label>
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="กรอกชื่อลูกค้า"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    {t("customerPhone")} *
                  </label>
                  <Input
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="กรอกเบอร์โทรศัพท์"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  {t("customerEmail")}
                </label>
                <Input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="email@example.com (ไม่บังคับ)"
                />
              </div>
            </div>

            {/* Remark Section */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {t("remark")}
              </label>
              <Input
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder={t("remarkPlaceholder")}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t("submitBooking")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getTodayDateKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

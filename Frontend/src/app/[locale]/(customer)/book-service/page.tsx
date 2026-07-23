"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Clock3, Loader2, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useShop } from "@/hooks/use-me";
import { http } from "@/lib/http/client";
import type { AvailableSlotDto, BookingDto } from "@/types/booking";
import type { SetService } from "@/types/shop/service";
import type { StaffMember } from "@/types/shop/staff";

const today = () => new Date().toLocaleDateString("en-CA");

export default function BookingPage() {
  const { data: shop, isLoading: shopLoading } = useShop();
  const [branchId, setBranchId] = useState(0);
  const [services, setServices] = useState<SetService[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [slots, setSlots] = useState<AvailableSlotDto[]>([]);
  const [serviceId, setServiceId] = useState(0);
  const [staffId, setStaffId] = useState(0);
  const [slotId, setSlotId] = useState(0);
  const [date, setDate] = useState(today);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const selectedService = useMemo(() => services.find((item) => item.id === serviceId), [services, serviceId]);

  useEffect(() => {
    const queryBranch = typeof window === "undefined" ? 0 : Number(new URLSearchParams(window.location.search).get("branchId") || 0);
    setBranchId(queryBranch || Number(shop?.shopBranches?.[0]?.id || 0));
  }, [shop]);

  useEffect(() => {
    if (!branchId) return;
    void http.get<SetService[]>("catalog", { params: { branchId } }).then(setServices).catch((error) => toast.error(error.message));
  }, [branchId]);

  useEffect(() => {
    if (!branchId || !serviceId) { setStaff([]); return; }
    setLoading(true);
    Promise.all([
      http.get<StaffMember[]>("staff", { params: { branchId, serviceId, eligible: true } }),
      http.get<AvailableSlotDto[]>("slots", { params: { branchId, date } }),
    ]).then(([staffData, slotData]) => { setStaff(staffData); setSlots(slotData); setStaffId(0); setSlotId(0); })
      .catch((error) => toast.error(error.message)).finally(() => setLoading(false));
  }, [branchId, serviceId, date]);

  const submit = async () => {
    if (!serviceId || !slotId) return toast.error("Please select a service and time");
    if (selectedService?.staffSelectionMode === "REQUIRED" && !staffId) return toast.error("Please select a staff member");
    setSubmitting(true);
    try {
      await http.post<BookingDto>("booking", { branchId, serviceId, queueSlotId: slotId, staffId: staffId || undefined, remark: remark || undefined });
      toast.success("Your booking has been confirmed");
      setSlotId(0); setRemark("");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create booking"); }
    finally { setSubmitting(false); }
  };

  if (shopLoading) return <div className="grid min-h-96 place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-5 sm:p-8">
      <div><p className="text-sm font-semibold text-primary">ONLINE BOOKING</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Book your visit</h1><p className="mt-2 text-muted-foreground">Choose a service, a convenient time, and your preferred staff member.</p></div>
      {!branchId ? <Card><CardContent className="py-12 text-center text-muted-foreground">Open this booking page from a shop link with a valid branch.</CardContent></Card> : (
        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          <Card><CardHeader><CardTitle>Booking details</CardTitle><CardDescription>{shop?.name || "EZQueue service"}</CardDescription></CardHeader><CardContent className="space-y-5">
            <BookingField icon={Check} label="Service"><select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={serviceId} onChange={(e) => setServiceId(Number(e.target.value))}><option value={0}>Select a service</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name} · ฿{service.price.toLocaleString()}</option>)}</select></BookingField>
            <BookingField icon={CalendarDays} label="Date"><Input type="date" min={today()} value={date} onChange={(e) => setDate(e.target.value)} /></BookingField>
            <BookingField icon={Clock3} label="Available time"><select disabled={!serviceId || loading} className="h-11 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-50" value={slotId} onChange={(e) => setSlotId(Number(e.target.value))}><option value={0}>{loading ? "Loading times…" : "Select a time"}</option>{slots.map((slot) => <option key={slot.id} value={slot.id}>{slot.startTime}–{slot.endTime} · {slot.remaining} left</option>)}</select></BookingField>
            {selectedService && selectedService.staffSelectionMode !== "AUTO" && <BookingField icon={UserRound} label={selectedService.staffSelectionMode === "REQUIRED" ? "Staff member (required)" : "Preferred staff (optional)"}><select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={staffId} onChange={(e) => setStaffId(Number(e.target.value))}><option value={0}>{selectedService.staffSelectionMode === "OPTIONAL" ? "Anyone available" : "Select staff"}</option>{staff.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></BookingField>}
            {selectedService?.staffSelectionMode === "AUTO" && <div className="rounded-xl bg-primary/5 p-4 text-sm text-primary">We’ll assign the best available staff member automatically.</div>}
            <BookingField icon={Check} label="Note (optional)"><Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Anything the team should know?" /></BookingField>
          </CardContent></Card>
          <Card className="h-fit"><CardHeader><CardTitle className="text-lg">Summary</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><Summary label="Service" value={selectedService?.name || "—"} /><Summary label="Date" value={date} /><Summary label="Time" value={slots.find((slot) => slot.id === slotId)?.startTime || "—"} /><Summary label="Staff" value={staff.find((person) => person.id === staffId)?.name || (selectedService?.staffSelectionMode === "AUTO" ? "Auto assigned" : "Anyone available")} /><Button className="w-full" disabled={submitting || !serviceId || !slotId} onClick={submit}>{submitting && <Loader2 className="mr-2 size-4 animate-spin" />}Confirm booking</Button></CardContent></Card>
        </div>
      )}
    </div>
  );
}

function BookingField({ icon: Icon, label, children }: { icon: typeof Check; label: string; children: React.ReactNode }) { return <label className="block space-y-2"><span className="flex items-center gap-2 text-sm font-medium"><Icon className="size-4 text-primary" />{label}</span>{children}</label>; }
function Summary({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-3 border-b pb-3"><span className="text-muted-foreground">{label}</span><span className="text-right font-medium">{value}</span></div>; }

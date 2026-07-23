"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarCheck2, CheckCircle2, Clock3, Loader2, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { useShop } from "@/hooks/use-me";
import { http } from "@/lib/http/client";
import { storage } from "@/services/localstorage";
import type { BookingDto } from "@/types/booking";

export default function BookingListPage() {
  const { data: shop } = useShop();
  const [rows, setRows] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    try {
      const branchId = Number(await storage.get("branch") || shop.shopBranches?.[0]?.id || 0);
      setRows(await http.get<BookingDto[]>("booking", { params: { branchId } }));
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to load bookings"); }
    finally { setLoading(false); }
  }, [shop]);
  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => ({ total: rows.length, waiting: rows.filter((r) => r.status === "WAITING").length, confirmed: rows.filter((r) => r.status === "CONFIRMED").length, done: rows.filter((r) => r.status === "DONE").length }), [rows]);
  const changeStatus = async (booking: BookingDto, status: string) => {
    setUpdating(booking.id);
    try { const saved = await http.patch<BookingDto>("booking", { id: booking.id, status }); setRows((current) => current.map((row) => row.id === saved.id ? saved : row)); toast.success("Booking updated"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update booking"); }
    finally { setUpdating(null); }
  };

  if (loading) return <div className="grid min-h-72 place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  return <div className="space-y-6">
    <DashboardPageHeader eyebrow="Operations" title="Booking list" description="Appointments, assigned staff, and service status in one place." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><DashboardStatCard icon={CalendarCheck2} label="All bookings" value={counts.total} /><DashboardStatCard icon={Clock3} label="Waiting" value={counts.waiting} tone="warning" /><DashboardStatCard icon={UserRound} label="Confirmed" value={counts.confirmed} tone="info" /><DashboardStatCard icon={CheckCircle2} label="Completed" value={counts.done} tone="success" /></div>
    <Card><CardHeader><CardTitle>Appointments</CardTitle><CardDescription>Assignments shown here are the same records used by live operations.</CardDescription></CardHeader><CardContent className="space-y-3">
      {rows.map((row) => <div key={row.id} className="flex flex-col gap-4 rounded-xl border p-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{row.customerName}</p><Status value={row.status} /></div><p className="mt-1 text-sm text-muted-foreground">{row.serviceName} · {new Date(row.date).toLocaleDateString()} at {row.startTime}</p><p className="mt-1 text-sm">{row.staffName ? `With ${row.staffName}` : "Staff will be assigned"}</p></div><div className="flex flex-wrap gap-2">{row.status === "WAITING" && <Button size="sm" variant="outline" disabled={updating === row.id} onClick={() => changeStatus(row, "CONFIRMED")}>Confirm</Button>}{["WAITING", "CONFIRMED"].includes(row.status) && <Button size="sm" disabled={updating === row.id} onClick={() => changeStatus(row, "CHECKED_IN")}>Check in</Button>}{row.status === "CHECKED_IN" && <Button size="sm" disabled={updating === row.id} onClick={() => changeStatus(row, "DONE")}>Complete</Button>}{!["DONE", "CANCELLED", "NO_SHOW"].includes(row.status) && <Button size="sm" variant="ghost" disabled={updating === row.id} onClick={() => changeStatus(row, "CANCELLED")}>Cancel</Button>}</div></div>)}
      {!rows.length && <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">No bookings for this branch yet.</div>}
    </CardContent></Card>
  </div>;
}

function Status({ value }: { value: string }) { const tone = value === "DONE" ? "bg-emerald-50 text-emerald-700" : value === "CANCELLED" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"; return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{value.replaceAll("_", " ")}</span>; }

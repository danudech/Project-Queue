"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Loader2, Play, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useShop } from "@/hooks/use-me";
import { http } from "@/lib/http/client";
import { storage } from "@/services/localstorage";
import type { QueueDto } from "@/types/queue";
import type { SetService } from "@/types/shop/service";
import type { StaffMember } from "@/types/shop/staff";

export default function QueueLivePage() {
  const { data: shop } = useShop();
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
      const selectedBranch = Number(await storage.get("branch") || shop.shopBranches?.[0]?.id || 0);
      setBranchId(selectedBranch);
      const [queueData, serviceData] = await Promise.all([http.get<QueueDto[]>("queues", { params: { branchId: selectedBranch } }), http.get<SetService[]>("catalog", { params: { branchId: selectedBranch } })]);
      setRows(queueData); setServices(serviceData);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to load queue"); }
    finally { setLoading(false); }
  }, [shop]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (!serviceId) return setStaff([]); void http.get<StaffMember[]>("staff", { params: { branchId, serviceId, eligible: true } }).then(setStaff).catch((e) => toast.error(e.message)); setStaffId(0); }, [branchId, serviceId]);

  const counts = useMemo(() => ({ waiting: rows.filter((r) => r.status === "WAITING").length, serving: rows.filter((r) => r.status === "SERVING").length, done: rows.filter((r) => r.status === "DONE").length }), [rows]);
  const update = async (row: QueueDto, status: string) => { try { const saved = await http.patch<QueueDto>("queues", { id: row.id, status }); setRows((current) => current.map((item) => item.id === saved.id ? saved : item)); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update queue"); } };
  const create = async () => {
    if (!serviceId) return toast.error("Please select a service");
    if (selectedService?.staffSelectionMode === "REQUIRED" && !staffId) return toast.error("Please select a staff member");
    setSaving(true);
    try { const saved = await http.post<QueueDto>("queues", { branchId, serviceId, staffId: staffId || undefined, customerName: customerName || undefined, type: "WALK_IN" }); setRows((current) => [saved, ...current]); setOpen(false); setCustomerName(""); setServiceId(0); toast.success(`Queue Q-${saved.queueNumber} added`); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to add queue"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="grid min-h-72 place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  return <div className="space-y-6">
    <DashboardPageHeader eyebrow="Operations" title="Live queue" description="Call, serve, and complete queues with the correct staff assignment." actions={<Button onClick={() => setOpen(true)} className="gap-2"><Plus className="size-4" />Add walk-in</Button>} />
    <div className="grid gap-4 sm:grid-cols-3"><DashboardStatCard icon={Clock3} label="Waiting" value={counts.waiting} tone="warning" /><DashboardStatCard icon={Play} label="Serving" value={counts.serving} tone="info" /><DashboardStatCard icon={CheckCircle2} label="Completed" value={counts.done} tone="success" /></div>
    <Card><CardHeader><CardTitle>Queue board</CardTitle><CardDescription>New work follows the staff selection rule configured on each service.</CardDescription></CardHeader><CardContent className="space-y-3">{rows.map((row) => <div key={row.id} className="flex flex-col gap-4 rounded-xl border p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-4"><div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 font-semibold text-primary">Q-{row.queueNumber}</div><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{row.customerName || "Walk-in customer"}</p><Status value={row.status} /></div><p className="mt-1 text-sm text-muted-foreground">{row.serviceName || "Service"}</p><p className="mt-1 text-sm">{row.staffName ? `Assigned to ${row.staffName}` : "Waiting for staff assignment"}</p></div></div><div className="flex gap-2">{row.status === "WAITING" && <Button size="sm" onClick={() => update(row, "SERVING")}>Start serving</Button>}{row.status === "SERVING" && <Button size="sm" onClick={() => update(row, "DONE")}>Complete</Button>}{!["DONE", "CANCELLED", "SKIPPED"].includes(row.status) && <Button size="sm" variant="ghost" onClick={() => update(row, "SKIPPED")}>Skip</Button>}</div></div>)}{!rows.length && <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">The live queue is clear.</div>}</CardContent></Card>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Add walk-in queue</DialogTitle></DialogHeader><div className="space-y-4"><label className="space-y-2 text-sm font-medium">Customer name (optional)<Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></label><label className="block space-y-2 text-sm font-medium">Service<select className="h-11 w-full rounded-md border bg-background px-3 font-normal" value={serviceId} onChange={(e) => setServiceId(Number(e.target.value))}><option value={0}>Select service</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>{selectedService?.staffSelectionMode !== "AUTO" && serviceId > 0 && <label className="block space-y-2 text-sm font-medium">{selectedService?.staffSelectionMode === "REQUIRED" ? "Staff (required)" : "Staff (optional)"}<select className="h-11 w-full rounded-md border bg-background px-3 font-normal" value={staffId} onChange={(e) => setStaffId(Number(e.target.value))}><option value={0}>{selectedService?.staffSelectionMode === "OPTIONAL" ? "Anyone available" : "Select staff"}</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}{selectedService?.staffSelectionMode === "AUTO" && <p className="rounded-xl bg-primary/5 p-3 text-sm text-primary">The least-busy available staff member will be assigned automatically.</p>}</div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create} disabled={saving}>{saving && <Loader2 className="mr-2 size-4 animate-spin" />}Add queue</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}

function Status({ value }: { value: string }) { const tone = value === "SERVING" ? "bg-sky-50 text-sky-700" : value === "DONE" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"; return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{value}</span>; }

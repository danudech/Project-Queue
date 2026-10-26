"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShop, useProfile } from "@/hooks/use-me";
import { usePermissions } from "@/hooks/use-permissions";
import { http } from "@/lib/http/client";
import { DashboardPageHeader } from "./dashboard-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

type Module = "tags" | "categories" | "analytics" | "statuses" | "audit";
type Row = { id: number; name: string; description?: string | null; isActive: boolean; branchId?: number; prefix?: string | null; count: number; relatedIds?: number[] };
type Result = { rows: Row[]; canEdit: boolean; total: number; metrics: { name: string; value: number }[]; activities: { id: number; tableName: string; recordId: string; action: string; createdAt: string; createdBy: number | null; fields?: string }[] };
type Save = { shopId: number; module: string; id?: number; branchId?: number; name?: string; prefix?: string; description?: string; isActive?: boolean; delete?: boolean; customerId?: number; tagId?: number; bookingId?: number; categoryId?: number | null };
const titles: Record<Module, [string, string]> = {
  tags: ["Customer tags", "แท็กลูกค้า"], categories: ["Queue categories", "หมวดคิว"],
  analytics: ["Analytics", "รายงานการดำเนินงาน"], statuses: ["Workflow statuses", "สถานะการทำงาน"], audit: ["Audit log", "ประวัติการเปลี่ยนแปลง"],
};

export default function WorkspacePage({ module }: { module: Module }) {
  const th = useLocale() === "th";
  const text = (en: string, thai: string) => th ? thai : en;
  const shop = useShop();
  const profile = useProfile();
  const { can } = usePermissions();
  const shopId = shop.data?.id;
  const owner = !!shop.data && shop.data.ownerId === profile.data?.id;
  const ownerOnly = ["analytics", "statuses", "audit"].includes(module);
  const [selectedBranch, setSelectedBranch] = useState(0);
  const branchId = selectedBranch || (module === "categories" ? shop.data?.shopBranches[0]?.id : undefined);
  const today = new Date();
  const dateString = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const [from, setFrom] = useState(() => dateString(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)));
  const [to, setTo] = useState(() => dateString(today));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Row> | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [assignment, setAssignment] = useState(false);
  const cache = useQueryClient();
  const enabled = !!shopId && (!ownerOnly || owner) && (module !== "categories" || !!branchId);
  const query = useQuery({
    queryKey: ["workspace", shopId, module, branchId, from, to, page],
    queryFn: () => http.get<Result>("/api/workspace", { params: { shopId, module, branchId, from, to, page }, cache: "no-store" }),
    enabled,
  });
  const assignments = useQuery({
    queryKey: ["workspace", shopId, "assignments", module, branchId, page],
    queryFn: () => http.get<Result>("/api/workspace", { params: { shopId, module: module === "tags" ? "customers" : "bookings", branchId, page }, cache: "no-store" }),
    enabled: enabled && assignment && (module === "tags" || module === "categories"),
  });
  const save = useMutation({
    mutationFn: (value: Save) => http.post<boolean>("/api/workspace", value),
    onSuccess: async () => { setEditing(null); setDeleting(null); await cache.invalidateQueries({ queryKey: ["workspace", shopId] }); toast.success(text("Saved", "บันทึกแล้ว")); },
    onError: (error: Error) => toast.error(error.message),
  });
  if (shop.isLoading || profile.isLoading) return <p role="status">{text("Loading…", "กำลังโหลด…")}</p>;
  if (shop.isError || profile.isError) return <Card><CardContent className="space-y-3 p-6"><p role="alert">{text("Unable to load your shop.", "โหลดข้อมูลร้านไม่สำเร็จ")}</p><Button onClick={() => { void shop.refetch(); void profile.refetch(); }}>{text("Retry", "ลองอีกครั้ง")}</Button></CardContent></Card>;
  if (!shopId) return <p>{text("Create or join a shop first.", "กรุณาสร้างหรือเข้าร่วมร้านก่อน")}</p>;
  if (ownerOnly && !owner) return <p role="alert">{text("Only the shop owner can access this page.", "หน้านี้สำหรับเจ้าของร้านเท่านั้น")}</p>;
  const data = query.data;
  const rows = (assignment ? assignments.data?.rows : data?.rows) ?? [];
  const visible = rows.filter(row => `${row.name} ${row.description ?? ""} ${row.prefix ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const canAssign = data?.canEdit && (module === "tags" || can("booking.manage"));
  const count = assignment ? assignments.data?.total : data?.total;
  const activeQuery = assignment ? assignments : query;
  return (
    <div className="space-y-6">
      <DashboardPageHeader title={titles[module][th ? 1 : 0]} description={module === "analytics" ? text("Bookings by appointment date; queues by creation date. Filters include both dates.", "การจองนับตามวันนัด คิวนับตามวันที่สร้าง รวมวันเริ่มต้นและวันสิ้นสุด") : module === "statuses" ? text("These shared workflow codes are read-only to keep booking and queue transitions consistent.", "รหัสสถานะกลางใช้แสดงข้อมูลเท่านั้น เพื่อให้ขั้นตอนการจองและคิวทำงานสอดคล้องกัน") : module === "audit" ? text("Recorded changes for this shop. History starts when audit collection is enabled.", "การเปลี่ยนแปลงของร้านนี้ ประวัติเริ่มตั้งแต่เปิดระบบบันทึก") : module === "categories" ? text("Classify bookings within a branch. Categories do not change queue priority or numbering.", "จัดหมวดการจองภายในสาขา หมวดไม่มีผลต่อลำดับเรียกหรือเลขคิว") : text("Manage your shop’s customer tags and assignments.", "จัดการแท็กและกำหนดแท็กให้ลูกค้าในร้านของคุณ")} actions={data?.canEdit && !assignment ? <Button onClick={() => setEditing({ name: "", prefix: "", description: "", isActive: true })}>{text("Add", "เพิ่ม")}</Button> : undefined} />
      <div className="flex flex-wrap items-end gap-3">
        {(module === "categories" || module === "analytics") && <div className="space-y-1"><Label htmlFor="workspace-branch">{text("Branch", "สาขา")}</Label><select id="workspace-branch" className="h-10 rounded-md border bg-background px-3" value={branchId ?? 0} onChange={e => { setSelectedBranch(Number(e.target.value)); setPage(1); setAssignment(false); }}>
          {module === "analytics" && <option value={0}>{text("All branches", "ทุกสาขา")}</option>}
          {shop.data?.shopBranches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
        </select></div>}
        {module === "analytics" && <><div className="space-y-1"><Label htmlFor="analytics-from">{text("From", "เริ่มวันที่")}</Label><Input id="analytics-from" type="date" value={from} max={to} onChange={e => setFrom(e.target.value)} /></div><div className="space-y-1"><Label htmlFor="analytics-to">{text("To", "ถึงวันที่")}</Label><Input id="analytics-to" type="date" value={to} min={from} onChange={e => setTo(e.target.value)} /></div></>}
        {module !== "audit" && <Input className="max-w-xs" aria-label={text("Filter displayed records", "ค้นหาในรายการที่แสดง")} placeholder={text("Filter displayed records", "ค้นหาในรายการที่แสดง")} value={search} onChange={e => setSearch(e.target.value)} />}
        {canAssign && <Button variant="outline" onClick={() => { setAssignment(!assignment); setPage(1); setSearch(""); }}>{assignment ? text("Back to list", "กลับรายการ") : module === "tags" ? text("Assign to customers", "กำหนดแท็กให้ลูกค้า") : text("Classify bookings", "จัดหมวดการจอง")}</Button>}
        <Button variant="outline" onClick={() => void activeQuery.refetch()} disabled={activeQuery.isFetching}>{text("Refresh", "โหลดใหม่")}</Button>
      </div>
      {module === "categories" && !branchId ? <p>{text("No branches are available.", "ยังไม่มีสาขา")}</p> : activeQuery.isPending ? <p role="status">{text("Loading…", "กำลังโหลด…")}</p> : activeQuery.isError ? <p role="alert" className="text-destructive">{activeQuery.error.message}</p> : <>
        {data?.metrics.length ? <div className="grid gap-4 sm:grid-cols-2">{data.metrics.map(metric => <Card key={metric.name}><CardContent className="p-6"><p className="text-sm text-muted-foreground">{metric.name === "Bookings" ? text("Bookings", "การจอง") : text("Queues", "คิว")}</p><p className="mt-2 text-3xl font-medium">{metric.value.toLocaleString()}</p></CardContent></Card>)}</div> : null}
        <Card><CardContent className="overflow-x-auto p-0"><table className="w-full text-left text-sm"><thead className="bg-default-200"><tr><th className="p-4">{text("Record", "รายการ")}</th><th className="p-4">{text("Details", "รายละเอียด")}</th><th className="p-4">{text("Status / actions", "สถานะ / จัดการ")}</th></tr></thead><tbody>
          {module === "audit" ? data?.activities.map(log => <tr key={log.id} className="border-t hover:bg-default-200"><td className="p-4">{log.tableName} #{log.recordId}</td><td className="p-4">{log.action}<br />{new Date(log.createdAt.endsWith("Z") ? log.createdAt : `${log.createdAt}Z`).toLocaleString(th ? "th-TH" : "en-US")}<br />{text("User", "ผู้ใช้")} #{log.createdBy ?? "—"}</td><td className="max-w-sm break-words p-4">{log.fields ?? "—"}</td></tr>) : visible.map(row => <tr key={row.id} className={`border-t hover:bg-default-200 ${!row.isActive ? "text-muted-foreground" : ""}`}>
            <td className="p-4">{row.name}{assignment && <span className="block text-xs">#{row.id}</span>}</td><td className="p-4">{row.prefix && <span className="mr-2 font-mono">{row.prefix}</span>}{row.description}{["analytics", "tags", "categories"].includes(module) && !assignment && <span className="block">{text("Count", "จำนวน")}: {row.count}</span>}</td>
            <td className="p-4">{assignment ? module === "tags" ? <div className="flex flex-wrap gap-3">{data?.rows.filter(tag => tag.isActive || row.relatedIds?.includes(tag.id)).map(tag => <label key={tag.id} className="inline-flex items-center gap-2"><input type="checkbox" checked={row.relatedIds?.includes(tag.id) ?? false} disabled={save.isPending || !canAssign} onChange={e => save.mutate({ shopId, module: "tag-assignment", customerId: row.id, tagId: tag.id, delete: !e.target.checked })} />{tag.name}</label>)}{!data?.rows.length && text("Add a tag first.", "กรุณาเพิ่มแท็กก่อน")}</div> : <select aria-label={text("Booking category", "หมวดการจอง")} className="h-10 rounded-md border bg-background px-3" disabled={save.isPending || !canAssign} value={row.relatedIds?.[0] ?? ""} onChange={e => save.mutate({ shopId, branchId, module: "category-assignment", bookingId: row.id, categoryId: e.target.value ? Number(e.target.value) : null })}><option value="">{text("Unassigned", "ไม่ระบุหมวด")}</option>{data?.rows.filter(c => c.isActive || row.relatedIds?.includes(c.id)).map(c => <option key={c.id} value={c.id} disabled={!c.isActive}>{c.name}</option>)}</select> : <div className="flex flex-wrap items-center gap-2"><span>{row.isActive ? text("Active", "เปิดใช้งาน") : text("Inactive", "ปิดใช้งาน")}</span>{data?.canEdit && <><Button size="sm" variant="outline" onClick={() => setEditing(row)}>{text("Edit", "แก้ไข")}</Button>{row.isActive && <Button size="sm" variant="outline" color="destructive" disabled={save.isPending} onClick={() => setDeleting(row)}>{text("Deactivate", "ปิดใช้งาน")}</Button>}</>}</div>}</td>
          </tr>)}
          {(module === "audit" ? !data?.activities.length : !visible.length) && <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">{text("No records found.", "ไม่พบข้อมูล")}</td></tr>}
        </tbody></table></CardContent></Card>
        {(assignment || module === "audit") && <div className="flex items-center justify-between"><Button variant="outline" disabled={page <= 1 || activeQuery.isFetching} onClick={() => setPage(page - 1)}>{text("Previous", "ก่อนหน้า")}</Button><span>{text("Page", "หน้า")} {page} / {Math.max(1, Math.ceil((count ?? 0) / 50))}</span><Button variant="outline" disabled={page * 50 >= (count ?? 0) || activeQuery.isFetching} onClick={() => setPage(page + 1)}>{text("Next", "ถัดไป")}</Button></div>}
      </>}
      <Dialog open={editing !== null} onOpenChange={open => { if (!open && !save.isPending) setEditing(null); }}><DialogContent><DialogHeader><DialogTitle>{titles[module][th ? 1 : 0]}</DialogTitle><DialogDescription>{text("Changes are saved to your shop.", "บันทึกข้อมูลสำหรับร้านของคุณ")}</DialogDescription></DialogHeader>{editing && <form className="space-y-4" onSubmit={event => { event.preventDefault(); save.mutate({ shopId, module, branchId, id: editing.id, name: editing.name, prefix: editing.prefix ?? "", description: editing.description ?? "", isActive: editing.isActive }); }}>
        <div className="space-y-1"><Label htmlFor="workspace-name">{text("Name", "ชื่อ")}</Label><Input id="workspace-name" required maxLength={100} value={editing.name ?? ""} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
        {module === "categories" && <><div className="space-y-1"><Label htmlFor="workspace-prefix">{text("Prefix (A–Z, 0–9)", "คำนำหน้า (A–Z, 0–9)")}</Label><Input id="workspace-prefix" required pattern="[A-Z0-9]{1,5}" maxLength={5} value={editing.prefix ?? ""} onChange={e => setEditing({ ...editing, prefix: e.target.value.toUpperCase() })} /></div><div className="space-y-1"><Label htmlFor="workspace-description">{text("Description", "รายละเอียด")}</Label><Input id="workspace-description" maxLength={500} value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div></>}
        <label className="flex items-center gap-2"><input type="checkbox" checked={editing.isActive ?? true} onChange={e => setEditing({ ...editing, isActive: e.target.checked })} />{text("Active", "เปิดใช้งาน")}</label>
        <DialogFooter><Button type="button" variant="outline" disabled={save.isPending} onClick={() => setEditing(null)}>{text("Cancel", "ยกเลิก")}</Button><Button type="submit" disabled={save.isPending || !editing.name?.trim()}>{save.isPending ? text("Saving…", "กำลังบันทึก…") : text("Save", "บันทึก")}</Button></DialogFooter>
      </form>}</DialogContent></Dialog>
      <AlertDialog open={deleting !== null} onOpenChange={open => { if (!open && !save.isPending) setDeleting(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{text("Deactivate this record?", "ปิดใช้งานรายการนี้?")}</AlertDialogTitle><AlertDialogDescription>{deleting?.name} — {text("Existing assignments and history are retained.", "ยังคงเก็บความสัมพันธ์และประวัติเดิม")}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={save.isPending}>{text("Cancel", "ยกเลิก")}</AlertDialogCancel><AlertDialogAction disabled={save.isPending} onClick={event => { event.preventDefault(); if (deleting) save.mutate({ shopId, module, branchId, id: deleting.id, name: deleting.name, prefix: deleting.prefix ?? "", delete: true }); }}>{text("Confirm", "ยืนยัน")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}


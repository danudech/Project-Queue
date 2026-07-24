"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BriefcaseBusiness, CircleUserRound, Loader2, Plus, UserRoundCheck, Search, Edit2, Eye, Trash2, KeyRound, ChevronLeft, ChevronRight, Users } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { http } from "@/lib/http/client";
import { useShop } from "@/hooks/use-me";
import { storage } from "@/services/localstorage";
import type { SetService } from "@/types/shop/service";
import type { SaveStaffMember, StaffMember } from "@/types/shop/staff";

const STAFF_ROLES = [
  { value: "ShopOwner", labelKey: "roles.shopOwner" },
  { value: "ShopManager", labelKey: "roles.shopManager" },
  { value: "BranchManager", labelKey: "roles.branchManager" },
  { value: "Staff", labelKey: "roles.staff" },
] as const;

const emptyForm: SaveStaffMember = {
  shopId: 0, branchId: 0, name: "", email: "", phone: "", role: "Staff",
  canServeQueues: true, canLogin: false, isAvailable: true, isActive: true, serviceIds: [],
};

const PAGE_SIZE = 10;

export default function StaffPage() {
  const t = useTranslations("StaffSettings");
  const locale = useLocale();
  const { data: shop } = useShop();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState("");
  const [services, setServices] = useState<SetService[]>([]);
  const [branchId, setBranchId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SaveStaffMember>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    try {
      const selectedBranch = Number(await storage.get("branch") || shop.shopBranches?.[0]?.id || 0);
      setBranchId(selectedBranch);
      const [staffData, serviceData] = await Promise.all([
        http.get<StaffMember[]>("staff", { params: { branchId: selectedBranch } }),
        http.get<SetService[]>("shopservices", { params: { shopId: shop.id, branchId: selectedBranch } }),
      ]);
      setStaff(staffData);
      setServices(serviceData);
    } catch (error) { toast.error(error instanceof Error ? error.message : t("messages.loadError")); }
    finally { setLoading(false); }
  }, [shop, t]);

  useEffect(() => { void load(); }, [load]);

  const stats = useMemo(() => ({
    active: staff.filter((item) => item.isActive).length,
    available: staff.filter((item) => item.isActive && item.isAvailable && item.canServeQueues).length,
    access: staff.filter((item) => item.isActive && item.canLogin).length,
  }), [staff]);

  const filteredStaff = useMemo(() => {
    if (!search.trim()) return staff;
    const lower = search.toLowerCase();
    return staff.filter((item) => 
      item.name.toLowerCase().includes(lower) || 
      (item.email && item.email.toLowerCase().includes(lower)) ||
      (item.phone && item.phone.includes(lower))
    );
  }, [staff, search]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [search]);

  const paginatedStaff = useMemo(() => {
    return filteredStaff.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredStaff, currentPage]);

  const totalPages = Math.ceil(filteredStaff.length / PAGE_SIZE);
  const visibleFrom = filteredStaff.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const visibleTo = Math.min(currentPage * PAGE_SIZE, filteredStaff.length);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedStaff.length && paginatedStaff.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedStaff.map((s) => s.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const beginCreate = () => {
    setErrors({});
    setForm({
      ...emptyForm,
      shopId: Number(shop?.id ?? 0),
      branchId,
      canServeQueues: services.length > 0 ? emptyForm.canServeQueues : false,
    });
    setOpen(true);
  };

  const beginEdit = (item: StaffMember) => {
    setErrors({});
    setForm({
      ...item,
      canServeQueues: services.length > 0 ? item.canServeQueues : false,
    });
    setOpen(true);
  };

  const hasSelectedServices = services.length > 0 && form.canServeQueues && form.serviceIds.length > 0;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = t("validation.name");
    }

    if (!form.role) {
      newErrors.role = t("validation.role");
    }

    if (form.canLogin) {
      if (!form.email?.trim()) {
        newErrors.email = t("validation.email");
      } else {
        const emailRegex = /^\S+@\S+$/i;
        if (!emailRegex.test(form.email.trim())) {
          newErrors.email = t("validation.emailInvalid");
        }
      }
    } else if (form.email?.trim()) {
      const emailRegex = /^\S+@\S+$/i;
      if (!emailRegex.test(form.email.trim())) {
        newErrors.email = t("validation.emailInvalid");
      }
    }

    if (form.phone?.trim()) {
      const phoneVal = form.phone.trim();
      if (!/^0/.test(phoneVal)) {
        newErrors.phone = t("validation.phoneStart");
      } else if (phoneVal.length !== 10) {
        newErrors.phone = t("validation.phoneLength");
      } else if (!/^\d+$/.test(phoneVal)) {
        newErrors.phone = t("validation.phoneDigits");
      }
    }

    if (form.canServeQueues) {
      if (services.length === 0) {
        newErrors.services = t("validation.noBranchServices");
      } else if (form.serviceIds.length === 0) {
        newErrors.services = t("validation.selectAtLeastOneService");
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  const save = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return;
    }

    setSaving(true);
    try {
      const payload: SaveStaffMember = {
        ...form,
        canServeQueues: services.length > 0 ? form.canServeQueues : false,
        serviceIds: services.length > 0 && form.canServeQueues ? form.serviceIds : [],
        isAvailable: hasSelectedServices ? form.isAvailable : false,
      };
      const saved = form.id
        ? await http.put<StaffMember>("staff", payload)
        : await http.post<StaffMember>("staff", payload);
      setStaff((current) => form.id ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]);
      setOpen(false);
      toast.success(form.id ? t("messages.updated") : t("messages.created"));
    } catch (error) { toast.error(error instanceof Error ? error.message : t("messages.saveError")); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex min-h-72 items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-default-900">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={beginCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("addStaff")}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-5 xl:grid-cols-[1.1fr_repeat(3,minmax(0,1fr))]">
            <div className="flex min-h-32 items-center gap-4 px-1">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-9 w-9" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-default-600">{t("eyebrow")}</p>
                <h2 className="mt-1 text-xl font-medium text-default-900">
                  {t("teamTitle")}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("teamDescription")}
                </p>
              </div>
            </div>

            <div className="flex min-h-32 flex-col justify-center rounded-lg bg-default-50 p-4">
              <p className="text-sm font-medium text-default-700">{t("stats.active")}</p>
              <p className="mt-1 text-xl font-semibold text-default-900">{stats.active}</p>
            </div>

            <div className="flex min-h-32 flex-col justify-center rounded-lg bg-default-50 p-4">
              <p className="text-sm font-medium text-default-700">{t("stats.available")}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-success">{stats.available}</p>
            </div>

            <div className="flex min-h-32 flex-col justify-center rounded-lg bg-default-50 p-4">
              <p className="text-sm font-medium text-default-700">{t("stats.access")}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-info">{stats.access}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
          <div className="flex-1 text-xl font-medium text-default-900">
            {t("teamTitle")}
          </div>
          <div className="relative w-full sm:ml-auto sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("columns.name")}
              className="pl-9"
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-default-200">
                <TableRow>
                  <TableHead className="w-16 px-7">
                    <Checkbox 
                      checked={paginatedStaff.length > 0 && selectedIds.size === paginatedStaff.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">{t("columns.name")}</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">{t("columns.role")}</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">{t("columns.email")}</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">{t("columns.emailConfirmed")}</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">{t("columns.lastLogin")}</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">{t("columns.status")}</TableHead>
                  <TableHead className="w-28 text-xs font-semibold uppercase tracking-wide text-right pr-6">{t("columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {paginatedStaff.map((item) => (
                <TableRow key={item.id} className={!item.isActive ? "bg-muted/30" : ""}>
                  <TableCell className="px-7">
                    <Checkbox 
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.profilePictureUrl ? item.profilePictureUrl : `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(item.name)}`} 
                        alt={item.name} 
                        className="size-10 rounded-full object-cover bg-slate-100 border border-slate-200"
                      />
                      <div>
                        <p>{item.name}</p>
                        {item.phone && <p className="text-xs text-muted-foreground">{item.phone}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {STAFF_ROLES.find((role) => role.value === item.role)?.labelKey ? t(STAFF_ROLES.find((role) => role.value === item.role)!.labelKey) : item.role}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.canServeQueues && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{t("serviceStaff")}</Badge>}
                      {item.canLogin && <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">{t("systemAccess")}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.email || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    {item.canLogin && item.email ? (
                      item.emailConfirmed ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          No
                        </Badge>
                      )
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.lastLoginAt ? (
                      new Date(item.lastLoginAt).toLocaleString(locale, { dateStyle: "short", timeStyle: "short" })
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? "default" : "secondary"}>
                      {item.isActive ? t("active") : t("inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" className="size-8 rounded-md text-slate-500 hover:text-slate-900" title="View details">
                        <Eye className="size-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="size-8 rounded-md text-slate-500 hover:text-slate-900" onClick={() => beginEdit(item)} title={t("dialog.editTitle")}>
                        <Edit2 className="size-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="size-8 rounded-md text-destructive hover:bg-destructive/10" title="Delete">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!paginatedStaff.length && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    {search ? "No results found" : t("empty")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
        {filteredStaff.length > 0 && (
          <div className="flex flex-col gap-3 px-10 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedIds.size > 0
                ? `${selectedIds.size} of ${filteredStaff.length} row(s) selected.`
                : `Showing ${visibleFrom} to ${visibleTo} of ${filteredStaff.length} entries`}
            </p>
            <div className="flex flex-none items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    size="icon"
                    variant={page === currentPage ? "default" : "outline"}
                    className={cn(
                      "h-8 w-8",
                      page !== currentPage &&
                        "border-default-200 bg-default-100 text-default-700",
                    )}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle>{form.id ? t("dialog.editTitle") : t("dialog.addTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-5 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("fields.name")} error={errors.name}>
                <Input
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                />
              </Field>
              <Field label={t("fields.position")} error={errors.role}>
                <Select
                  value={form.role}
                  onValueChange={(role) => {
                    setForm({ ...form, role });
                    if (errors.role) setErrors((prev) => ({ ...prev, role: "" }));
                  }}
                >
                  <SelectTrigger className={errors.role ? "border-destructive focus:ring-destructive" : ""}>
                    <SelectValue placeholder={t("fields.selectPosition")} />
                  </SelectTrigger>
                  <SelectContent>
                    {!STAFF_ROLES.some((role) => role.value === form.role) && form.role ? (
                      <SelectItem value={form.role}>{form.role}</SelectItem>
                    ) : null}
                    {STAFF_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {t(role.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t("fields.positionHelp")}
                </p>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("fields.email")} error={errors.email}>
                <Input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                />
              </Field>
              <Field label={t("fields.phone")} error={errors.phone}>
                <Input
                  value={form.phone ?? ""}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value });
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
                />
              </Field>
            </div>
            <Toggle label={t("toggles.serve.label")} description={services.length === 0 ? t("toggles.serve.noServices") : t("toggles.serve.description")} checked={services.length > 0 && form.canServeQueues} disabled={services.length === 0} onChange={(checked) => { setForm({ ...form, canServeQueues: checked }); if (!checked && errors.services) setErrors((prev) => ({ ...prev, services: "" })); }} />
            <Toggle label={t("toggles.login.label")} description={t("toggles.login.description")} checked={form.canLogin} onChange={(checked) => { setForm({ ...form, canLogin: checked }); if (!checked && errors.email) setErrors((prev) => ({ ...prev, email: "" })); }} />
            <Toggle label={t("toggles.available.label")} description={!hasSelectedServices ? t("toggles.available.noServicesSelected") : t("toggles.available.description")} checked={hasSelectedServices && form.isAvailable} disabled={!hasSelectedServices} onChange={(checked) => setForm({ ...form, isAvailable: checked })} />
            <Toggle label={t("toggles.active.label")} description={t("toggles.active.description")} checked={form.isActive} onChange={(checked) => setForm({ ...form, isActive: checked })} />
            {services.length > 0 && form.canServeQueues && (
              <Field label={t("fields.services")} error={errors.services}>
                <div className={`grid gap-2 rounded-xl border p-3 sm:grid-cols-2 ${errors.services ? "border-destructive bg-destructive/5" : ""}`}>
                  {services.map((service) => (
                    <label key={service.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={form.serviceIds.includes(service.id!)}
                        onChange={(e) => {
                          const updatedServiceIds = e.target.checked
                            ? [...form.serviceIds, service.id!]
                            : form.serviceIds.filter((id) => id !== service.id);
                          setForm({ ...form, serviceIds: updatedServiceIds });
                          if (errors.services && updatedServiceIds.length > 0) {
                            setErrors((prev) => ({ ...prev, services: "" }));
                          }
                        }}
                      />
                      {service.name}
                    </label>
                  ))}
                </div>
              </Field>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button><Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 size-4 animate-spin" />}{t("save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) { return <div className="space-y-2"><span className="block text-sm font-medium">{label}</span>{children}{error && <p className="text-xs font-medium text-destructive">{error}</p>}</div>; }
function Toggle({ label, description, checked, onChange, disabled = false }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) { return <div className={`flex items-center justify-between gap-4 rounded-xl border p-3 ${disabled ? "opacity-75 bg-muted/20" : ""}`}><div><p className="text-sm font-medium">{label}</p><p className={`text-xs ${disabled ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground"}`}>{description}</p></div><Switch checked={checked} onCheckedChange={onChange} disabled={disabled} /></div>; }

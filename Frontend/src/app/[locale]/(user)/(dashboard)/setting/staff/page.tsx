"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { BriefcaseBusiness, CircleUserRound, Loader2, Plus, UserRoundCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  { value: "STAFF", labelKey: "roles.staff" },
  { value: "SERVICE_STAFF", labelKey: "roles.serviceStaff" },
  { value: "RECEPTIONIST", labelKey: "roles.receptionist" },
  { value: "BRANCH_MANAGER", labelKey: "roles.branchManager" },
] as const;

const emptyForm: SaveStaffMember = {
  shopId: 0, branchId: 0, name: "", email: "", phone: "", role: "STAFF",
  canServeQueues: true, canLogin: false, isAvailable: true, isActive: true, serviceIds: [],
};

export default function StaffPage() {
  const t = useTranslations("StaffSettings");
  const { data: shop } = useShop();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<SetService[]>([]);
  const [branchId, setBranchId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SaveStaffMember>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      <DashboardPageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        actions={<Button onClick={beginCreate} className="gap-2"><Plus className="size-4" /> {t("addStaff")}</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatCard icon={CircleUserRound} label={t("stats.active")} value={stats.active} />
        <DashboardStatCard icon={BriefcaseBusiness} label={t("stats.available")} value={stats.available} tone="success" />
        <DashboardStatCard icon={UserRoundCheck} label={t("stats.access")} value={stats.access} tone="info" />
      </div>

      <Card>
        <CardHeader><CardTitle>{t("teamTitle")}</CardTitle><CardDescription>{t("teamDescription")}</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {staff.map((item) => (
            <button key={item.id} onClick={() => beginEdit(item)} className="flex w-full flex-col gap-3 rounded-xl border bg-card p-4 text-left transition hover:border-primary/40 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-full bg-primary/10 font-semibold text-primary">{item.name.slice(0, 1).toUpperCase()}</div><div><p className="font-semibold">{item.name}</p><p className="text-sm text-muted-foreground">{STAFF_ROLES.find((role) => role.value === item.role)?.labelKey ? t(STAFF_ROLES.find((role) => role.value === item.role)!.labelKey) : item.role} · {item.email || t("noLoginAccount")}</p></div></div>
              <div className="flex flex-wrap gap-2">
                {item.canServeQueues && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{t("serviceStaff")}</span>}
                {item.canLogin && <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">{t("systemAccess")}</span>}
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{item.isActive ? t("active") : t("inactive")}</span>
              </div>
            </button>
          ))}
          {!staff.length && <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">{t("empty")}</div>}
        </CardContent>
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

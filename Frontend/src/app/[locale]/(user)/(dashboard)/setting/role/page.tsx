"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Edit2,
  KeyRound,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRoundCog,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import RouteLoadingScreen from "@/components/route-loading-screen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useShop } from "@/hooks/use-me";
import { http } from "@/lib/http/client";
import type {
  PermissionCatalogItem,
  SaveShopRole,
  ShopRole,
} from "@/types/shop/role";

const emptyForm: SaveShopRole = {
  shopId: 0,
  label: "",
  scope: "Branch",
  isActive: true,
  permissionCodes: [],
};

export default function RolePage() {
  const t = useTranslations("RoleSettings");
  const { data: shop } = useShop();
  const [roles, setRoles] = useState<ShopRole[]>([]);
  const [catalog, setCatalog] = useState<PermissionCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<SaveShopRole>(emptyForm);
  const [editingRole, setEditingRole] = useState<ShopRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShopRole | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!shop?.id) return;
    setLoading(true);
    try {
      const [roleData, permissionData] = await Promise.all([
        http.get<ShopRole[]>("roles", { params: { shopId: shop.id } }),
        http.get<PermissionCatalogItem[]>("roles", {
          params: { catalog: true },
        }),
      ]);
      setRoles(roleData);
      setCatalog(permissionData);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("messages.loadError"),
      );
    } finally {
      setLoading(false);
    }
  }, [shop?.id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const groups = useMemo(
    () =>
      Array.from(new Set(catalog.map((permission) => permission.group))).map(
        (group) => ({
          group,
          items: catalog.filter((permission) => permission.group === group),
        }),
      ),
    [catalog],
  );

  const filteredRoles = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return roles;
    return roles.filter(
      (role) =>
        role.label.toLowerCase().includes(keyword) ||
        role.code.toLowerCase().includes(keyword),
    );
  }, [query, roles]);

  const stats = useMemo(
    () => ({
      total: roles.length,
      active: roles.filter((role) => role.isActive).length,
      custom: roles.filter((role) => !role.isSystem).length,
      users: roles.reduce((total, role) => total + role.userCount, 0),
    }),
    [roles],
  );

  const getRoleLabel = (role: ShopRole) =>
    role.isSystem &&
    ["ShopOwner", "ShopManager", "BranchManager", "Staff"].includes(role.code)
      ? t(`systemRoles.${role.code}`)
      : role.label;

  const beginCreate = () => {
    setEditingRole(null);
    setForm({ ...emptyForm, shopId: Number(shop?.id ?? 0) });
    setOpen(true);
  };

  const beginEdit = (role: ShopRole) => {
    setEditingRole(role);
    setForm({
      shopId: Number(shop?.id ?? 0),
      code: role.code,
      label: getRoleLabel(role),
      scope: role.scope,
      isActive: role.isActive,
      permissionCodes: [...role.permissionCodes],
    });
    setOpen(true);
  };

  const togglePermission = (code: string, checked: boolean) => {
    setForm((current) => ({
      ...current,
      permissionCodes: checked
        ? Array.from(new Set([...current.permissionCodes, code]))
        : current.permissionCodes.filter((permission) => permission !== code),
    }));
  };

  const toggleGroup = (items: PermissionCatalogItem[], checked: boolean) => {
    const codes = new Set(items.map((item) => item.code));
    setForm((current) => ({
      ...current,
      permissionCodes: checked
        ? Array.from(new Set([...current.permissionCodes, ...codes]))
        : current.permissionCodes.filter((code) => !codes.has(code)),
    }));
  };

  const isAllowedForScope = (code: string) =>
    form.scope === "Shop" ||
    (!code.startsWith("shop.") && code !== "branch.create");

  const save = async () => {
    if (!form.label.trim()) {
      toast.error(t("validation.name"));
      return;
    }
    setSaving(true);
    try {
      const saved = editingRole
        ? await http.put<ShopRole>("roles", form, {
            params: { code: editingRole.code },
          })
        : await http.post<ShopRole>("roles", form);
      setRoles((current) =>
        editingRole
          ? current.map((role) => (role.code === saved.code ? saved : role))
          : [...current, saved],
      );
      setOpen(false);
      toast.success(
        editingRole ? t("messages.updated") : t("messages.created"),
      );
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("messages.saveError"),
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget || !shop?.id) return;
    setDeleting(true);
    try {
      await http.delete<boolean>("roles", {
        params: { code: deleteTarget.code, shopId: shop.id },
      });
      setRoles((current) =>
        current.filter((role) => role.code !== deleteTarget.code),
      );
      setDeleteTarget(null);
      toast.success(t("messages.deleted"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("messages.deleteError"),
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <RouteLoadingScreen />;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
              <h1 className="mt-1 text-2xl font-semibold text-default-900">
                {t("title")}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                {t("description")}
              </p>
            </div>
          </div>
          <Button className="gap-2 self-start lg:self-auto" onClick={beginCreate}>
            <Plus className="size-4" />
            {t("create")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={ShieldCheck} label={t("stats.total")} value={stats.total} />
          <Stat icon={KeyRound} label={t("stats.active")} value={stats.active} />
          <Stat icon={UserRoundCog} label={t("stats.custom")} value={stats.custom} />
          <Stat icon={Users} label={t("stats.users")} value={stats.users} />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 border-b border-default-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-default-900">
                {t("table.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("table.description")}
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("search")}
                className="pl-9"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-default-100">
                <TableRow>
                  <TableHead className="pl-6">{t("columns.role")}</TableHead>
                  <TableHead>{t("columns.scope")}</TableHead>
                  <TableHead>{t("columns.permissions")}</TableHead>
                  <TableHead>{t("columns.users")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead className="pr-6 text-right">
                    {t("columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow
                    key={role.code}
                    className="transition-colors hover:bg-default-100/80"
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <ShieldCheck className="size-4" />
                        </div>
                        <div>
                          <p className="font-medium text-default-900">
                            {getRoleLabel(role)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {role.isSystem ? t("systemRole") : role.code}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge rounded="full" color="secondary">
                        {t(`scope.${role.scope.toLowerCase()}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {role.permissionCodes.length}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {t("permissionCount")}
                      </span>
                    </TableCell>
                    <TableCell>{role.userCount}</TableCell>
                    <TableCell>
                      <Badge
                        rounded="full"
                        color={role.isActive ? "success" : "secondary"}
                      >
                        {role.isActive ? t("active") : t("inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() => beginEdit(role)}
                          title={t("edit")}
                        >
                          <Edit2 className="size-4" />
                        </Button>
                        {!role.isSystem ? (
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(role)}
                            title={t("delete")}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredRoles.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-28 text-center text-muted-foreground"
                    >
                      {t("empty")}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          size="md"
          className="max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 md:max-w-[880px]"
        >
          <DialogHeader className="border-b border-default-200 px-6 py-5">
            <DialogTitle>
              {editingRole ? t("dialog.editTitle") : t("dialog.createTitle")}
            </DialogTitle>
            <p className="pr-8 text-sm text-muted-foreground">
              {editingRole?.isSystem
                ? t("dialog.systemDescription")
                : t("dialog.description")}
            </p>
          </DialogHeader>
          <div className="min-h-0 space-y-5 overflow-y-auto overscroll-contain px-6 py-5">
            <section className="grid gap-4 rounded-xl border border-default-200 p-4 sm:grid-cols-2">
              <Field label={t("fields.name")}>
                <Input
                  value={form.label}
                  disabled={Boolean(editingRole?.isSystem)}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      label: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label={t("fields.scope")}>
                <Select
                  value={form.scope}
                  disabled={Boolean(editingRole?.isSystem)}
                  onValueChange={(scope: "Shop" | "Branch") =>
                    setForm((current) => ({
                      ...current,
                      scope,
                      permissionCodes:
                        scope === "Branch"
                          ? current.permissionCodes.filter(
                              (code) =>
                                !code.startsWith("shop.") &&
                                code !== "branch.create",
                            )
                          : current.permissionCodes,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shop">{t("scope.shop")}</SelectItem>
                    <SelectItem value="Branch">{t("scope.branch")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {!editingRole?.isSystem ? (
                <div className="flex items-center justify-between gap-4 rounded-xl bg-default-100 p-4 sm:col-span-2">
                  <div>
                    <p className="text-sm font-medium">{t("fields.active")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("fields.activeHelp")}
                    </p>
                  </div>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(isActive) =>
                      setForm((current) => ({ ...current, isActive }))
                    }
                  />
                </div>
              ) : null}
            </section>

            <section>
              <div className="mb-4">
                <h3 className="font-semibold text-default-900">
                  {t("permissions.title")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("permissions.description")}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {groups.map(({ group, items: allItems }) => {
                  const items = allItems.filter((item) =>
                    isAllowedForScope(item.code),
                  );
                  if (items.length === 0) return null;
                  const selectedCount = items.filter((item) =>
                    form.permissionCodes.includes(item.code),
                  ).length;
                  const allSelected =
                    items.length > 0 && selectedCount === items.length;
                  return (
                    <div
                      key={group}
                      className="overflow-hidden rounded-xl border border-default-200"
                    >
                      <label className="flex cursor-pointer items-center justify-between gap-3 bg-default-100 px-4 py-3">
                        <span className="font-medium text-default-900">
                          {t(`groups.${group}`)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {selectedCount}/{items.length}
                          </span>
                          <Checkbox
                            color="primary"
                            checked={allSelected}
                            onCheckedChange={(checked) =>
                              toggleGroup(items, checked === true)
                            }
                          />
                        </div>
                      </label>
                      <div className="divide-y divide-default-200">
                        {items.map((permission) => (
                          <label
                            key={permission.code}
                            className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-default-50"
                          >
                            <Checkbox
                              color="primary"
                              className="mt-0.5"
                              checked={form.permissionCodes.includes(
                                permission.code,
                              )}
                              onCheckedChange={(checked) =>
                                togglePermission(
                                  permission.code,
                                  checked === true,
                                )
                              }
                            />
                            <span>
                              <span className="block text-sm text-default-900">
                                {t(
                                  `permissionLabels.${permission.code.replace(".", "_")}`,
                                )}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {permission.code}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
          <DialogFooter className="border-t border-default-200 bg-card px-6 py-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !deleting) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description", {
                name: deleteTarget?.label ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void remove();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              {t("deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: number;
}) {
  return (
    <div className="flex min-h-24 items-center gap-4 rounded-xl bg-default-100 px-5 py-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-default-900">{value}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-default-900">{label}</span>
      {children}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Loader2,
  Plus,
  Search,
  Edit2,
  Trash2,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  Users,
  Camera,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RouteLoadingScreen from "@/components/route-loading-screen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { usePermissions } from "@/hooks/use-permissions";
import { resolveActiveBranchId } from "@/lib/active-branch";
import { env } from "@/config/env";
import type { SetService } from "@/types/shop/service";
import type { SaveStaffMember, StaffMember } from "@/types/shop/staff";
import type { ShopRole } from "@/types/shop/role";

const STAFF_POSITIONS = [
  { value: "STAFF", labelKey: "positions.staff" },
  { value: "SERVICE_STAFF", labelKey: "positions.serviceStaff" },
  { value: "RECEPTIONIST", labelKey: "positions.receptionist" },
  { value: "BRANCH_MANAGER", labelKey: "positions.branchManager" },
] as const;

const emptyForm: SaveStaffMember = {
  shopId: 0,
  branchId: 0,
  name: "",
  email: "",
  phone: "",
  role: "STAFF",
  systemRoleCode: "Staff",
  canServeQueues: true,
  canLogin: false,
  isAvailable: true,
  isActive: true,
  serviceIds: [],
};

const PAGE_SIZE = 10;

export default function StaffPage() {
  const t = useTranslations("StaffSettings");
  const locale = useLocale();
  const { data: shop } = useShop();
  const { can } = usePermissions();
  const canEditStaff = can("staff.edit");
  const canInviteStaff = can("staff.invite");
  const canRemoveStaff = can("staff.remove");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState("");
  const [services, setServices] = useState<SetService[]>([]);
  const [systemRoles, setSystemRoles] = useState<ShopRole[]>([]);
  const [branchId, setBranchId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SaveStaffMember>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [invitingId, setInvitingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(null);
  const [originalPhotoIsCustom, setOriginalPhotoIsCustom] = useState(false);
  const [removePhoto, setRemovePhoto] = useState(false);

  const getStaffImageUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("blob:")) return url;
    return `${env.apiBaseUrl.replace(/\/api\/v1\/?$/, "")}${url}`;
  };

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const load = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    try {
      const selectedBranch = await resolveActiveBranchId(shop.shopBranches);
      setBranchId(selectedBranch);
      if (!selectedBranch) {
        setStaff([]);
        setServices([]);
        setSystemRoles([]);
        return;
      }
      const [staffData, serviceData, roleData] = await Promise.all([
        http.get<StaffMember[]>("staff", {
          params: { branchId: selectedBranch },
        }),
        http.get<SetService[]>("shopservices", {
          params: { shopId: shop.id, branchId: selectedBranch },
        }),
        http.get<ShopRole[]>("roles", {
          params: { shopId: shop.id },
        }),
      ]);
      setStaff(Array.isArray(staffData) ? staffData : []);
      setServices(Array.isArray(serviceData) ? serviceData : []);
      setSystemRoles(
        Array.isArray(roleData)
          ? roleData.filter((role) => role.isActive)
          : [],
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("messages.loadError"),
      );
    } finally {
      setLoading(false);
    }
  }, [shop, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(
    () => ({
      active: staff.filter((item) => item.isActive).length,
      available: staff.filter(
        (item) => item.isActive && item.isAvailable && item.canServeQueues,
      ).length,
      access: staff.filter((item) => item.isActive && item.canLogin).length,
    }),
    [staff],
  );

  const filteredStaff = useMemo(() => {
    if (!search.trim()) return staff;
    const lower = search.toLowerCase();
    return staff.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        (item.email && item.email.toLowerCase().includes(lower)) ||
        (item.phone && item.phone.includes(lower)),
    );
  }, [staff, search]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [search]);

  const paginatedStaff = useMemo(() => {
    return filteredStaff.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE,
    );
  }, [filteredStaff, currentPage]);

  const totalPages = Math.ceil(filteredStaff.length / PAGE_SIZE);
  const visibleFrom =
    filteredStaff.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const visibleTo = Math.min(currentPage * PAGE_SIZE, filteredStaff.length);

  const toggleSelectAll = () => {
    if (
      selectedIds.size === paginatedStaff.length &&
      paginatedStaff.length > 0
    ) {
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
    setPhotoFile(null);
    setPhotoPreview(null);
    setOriginalPhotoUrl(null);
    setOriginalPhotoIsCustom(false);
    setRemovePhoto(false);
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
    setPhotoFile(null);
    setPhotoPreview(getStaffImageUrl(item.profilePictureUrl));
    setOriginalPhotoUrl(item.profilePictureUrl ?? null);
    setOriginalPhotoIsCustom(Boolean(item.hasCustomProfilePicture));
    setRemovePhoto(false);
    setForm({
      ...item,
      canServeQueues: services.length > 0 ? item.canServeQueues : false,
    });
    setOpen(true);
  };

  const selectPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const supportedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!supportedTypes.includes(file.type)) {
      setErrors((current) => ({
        ...current,
        photo: t("validation.photoType"),
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        photo: t("validation.photoSize"),
      }));
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
    setErrors((current) => ({ ...current, photo: "" }));
  };

  const clearPhoto = () => {
    if (photoFile) {
      setPhotoFile(null);
      setPhotoPreview(getStaffImageUrl(originalPhotoUrl));
      setRemovePhoto(false);
      setErrors((current) => ({ ...current, photo: "" }));
      return;
    }

    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(Boolean(form.id && originalPhotoIsCustom));
    setErrors((current) => ({ ...current, photo: "" }));
  };

  const hasSelectedServices =
    services.length > 0 && form.canServeQueues && form.serviceIds.length > 0;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = t("validation.name");
    }

    if (!form.role) {
      newErrors.role = t("validation.role");
    }

    if (form.canLogin) {
      if (!form.systemRoleCode) {
        newErrors.systemRoleCode = t("validation.systemRole");
      }
      if (!form.email?.trim()) {
        newErrors.email = t("validation.email");
      } else {
        const emailRegex = /^\S+@\S+$/i;
        if (!emailRegex.test(form.email.trim())) {
          newErrors.email = t("validation.emailInvalid");
        }
      }
    }

    if (form.canLogin && form.phone?.trim()) {
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
        serviceIds:
          services.length > 0 && form.canServeQueues ? form.serviceIds : [],
        isAvailable: hasSelectedServices ? form.isAvailable : false,
      };
      let saved = form.id
        ? await http.put<StaffMember>("staff", payload)
        : await http.post<StaffMember>("staff", payload);

      try {
        if (photoFile) {
          const photoData = new FormData();
          photoData.append("StaffId", String(saved.id));
          photoData.append("ProfilePicture", photoFile);
          saved = await http.upload<StaffMember>("staffphoto", photoData);
        } else if (removePhoto && originalPhotoUrl) {
          saved = await http.delete<StaffMember>("staffphoto", {
            params: { staffId: saved.id },
          });
        }
      } catch {
        toast.error(t("messages.photoSaveError"));
      }

      setStaff((current) =>
        form.id
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved],
      );
      setOpen(false);
      toast.success(form.id ? t("messages.updated") : t("messages.created"));

      if (saved.canLogin && !saved.userId) {
        try {
          const invitationStatus = await http.post<string>("staffinvite", {
            staffId: saved.id,
            locale,
          });
          const messageKey =
            invitationStatus === "linked"
              ? "messages.accountLinked"
              : invitationStatus === "confirmation_resent"
                ? "messages.confirmationResent"
                : "messages.invitationSent";
          toast.success(t(messageKey));
          await load();
        } catch {
          toast.error(t("messages.inviteError"));
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("messages.saveError"),
      );
    } finally {
      setSaving(false);
    }
  };

  const sendInvitation = async (item: StaffMember) => {
    if (!item.email || !item.canLogin || invitingId !== null) return;
    setInvitingId(item.id);
    try {
      const invitationStatus = await http.post<string>("staffinvite", {
        staffId: item.id,
        locale,
      });
      const messageKey =
        invitationStatus === "linked"
          ? "messages.accountLinked"
          : invitationStatus === "confirmation_resent"
            ? "messages.confirmationResent"
            : "messages.invitationSent";
      toast.success(t(messageKey));
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("messages.inviteError"),
      );
    } finally {
      setInvitingId(null);
    }
  };

  const deleteStaff = async () => {
    if (!deleteTarget || deletingId !== null) return;
    setDeletingId(deleteTarget.id);
    try {
      await http.delete<boolean>("staff", {
        params: { staffId: deleteTarget.id },
      });
      setStaff((current) =>
        current.map((item) =>
          item.id === deleteTarget.id
            ? { ...item, isActive: false, isAvailable: false, canLogin: false }
            : item,
        ),
      );
      toast.success(t("messages.deleted"));
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("messages.deleteError"),
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getPositionLabel = (positionValue: string) => {
    const position = STAFF_POSITIONS.find(
      (item) => item.value === positionValue,
    );
    return position ? t(position.labelKey) : positionValue;
  };

  const getSystemRoleLabel = (role: ShopRole) =>
    role.isSystem &&
    ["ShopOwner", "ShopManager", "BranchManager", "Staff"].includes(role.code)
      ? t(`systemRoles.${role.code}`)
      : role.label;

  if (loading) return <RouteLoadingScreen />;

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
          {canEditStaff ? (
            <Button onClick={beginCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("addStaff")}
            </Button>
          ) : null}
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
              <p className="text-sm font-medium text-default-700">
                {t("stats.active")}
              </p>
              <p className="mt-1 text-xl font-semibold text-default-900">
                {stats.active}
              </p>
            </div>

            <div className="flex min-h-32 flex-col justify-center rounded-lg bg-default-50 p-4">
              <p className="text-sm font-medium text-default-700">
                {t("stats.available")}
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-success">
                {stats.available}
              </p>
            </div>

            <div className="flex min-h-32 flex-col justify-center rounded-lg bg-default-50 p-4">
              <p className="text-sm font-medium text-default-700">
                {t("stats.access")}
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-info">
                {stats.access}
              </p>
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
                      checked={
                        paginatedStaff.length > 0 &&
                        selectedIds.size === paginatedStaff.length
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">
                    {t("columns.name")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">
                    {t("columns.role")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">
                    {t("columns.email")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">
                    {t("columns.emailConfirmed")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">
                    {t("columns.lastLogin")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">
                    {t("columns.status")}
                  </TableHead>
                  <TableHead className="w-28 text-xs font-semibold uppercase tracking-wide text-right pr-6">
                    {t("columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStaff.map((item) => (
                  <TableRow
                    key={item.id}
                    className={!item.isActive ? "bg-muted/30" : ""}
                  >
                    <TableCell className="px-7">
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => toggleSelect(item.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="sm"
                          shape="circle"
                          className="border border-default-200 bg-default-100"
                        >
                          {item.profilePictureUrl ? (
                            <AvatarImage
                              src={getStaffImageUrl(item.profilePictureUrl)}
                              alt={item.name}
                            />
                          ) : null}
                          <AvatarFallback>
                            {item.name.slice(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p>{item.name}</p>
                          {item.phone && (
                            <p className="text-xs text-muted-foreground">
                              {item.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {getPositionLabel(item.role)}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.canServeQueues && (
                          <Badge
                            rounded="full"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700"
                          >
                            {t("serviceStaff")}
                          </Badge>
                        )}
                        {item.canLogin && (
                          <Badge
                            rounded="full"
                            className="border-sky-200 bg-sky-50 text-sky-700"
                          >
                            {t("systemAccess")}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.email || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.canLogin && item.email ? (
                        item.emailConfirmed && item.userId ? (
                          <Badge
                            rounded="full"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700"
                          >
                            {t("confirmed")}
                          </Badge>
                        ) : (
                          <Badge
                            rounded="full"
                            className="border-amber-200 bg-amber-50 text-amber-700"
                          >
                            {t("pendingAccess")}
                          </Badge>
                        )
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.lastLoginAt ? (
                        new Date(item.lastLoginAt).toLocaleString(locale, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        color={item.isActive ? "success" : "secondary"}
                        rounded="full"
                      >
                        {item.isActive ? t("active") : t("inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {canInviteStaff &&
                        item.canLogin &&
                        item.email &&
                        !item.emailConfirmed ? (
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8 rounded-md text-slate-500 hover:text-slate-900"
                            title={t("actions.sendInvitation")}
                            disabled={invitingId === item.id}
                            onClick={() => void sendInvitation(item)}
                          >
                            {invitingId === item.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <KeyRound className="size-4" />
                            )}
                          </Button>
                        ) : null}
                        {canEditStaff ? (
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8 rounded-md text-slate-500 hover:text-slate-900"
                            onClick={() => beginEdit(item)}
                            title={t("dialog.editTitle")}
                          >
                            <Edit2 className="size-4" />
                          </Button>
                        ) : null}
                        {canRemoveStaff ? (
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8 rounded-md text-destructive hover:bg-destructive/10"
                            title={t("actions.delete")}
                            disabled={!item.isActive}
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!paginatedStaff.length && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {search ? t("noResults") : t("empty")}
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
                ? t("pagination.selected", {
                    selected: selectedIds.size,
                    total: filteredStaff.length,
                  })
                : t("pagination.showing", {
                    from: visibleFrom,
                    to: visibleTo,
                    total: filteredStaff.length,
                  })}
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          size="md"
          className="max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 md:max-w-[760px]"
        >
          <DialogHeader className="shrink-0 border-b border-default-200 px-5 py-4 sm:px-6 sm:py-5">
            <DialogTitle>
              {form.id ? t("dialog.editTitle") : t("dialog.addTitle")}
            </DialogTitle>
            <p className="pr-8 text-sm text-muted-foreground">
              {t("dialog.description")}
            </p>
          </DialogHeader>
          <div className="min-h-0 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            <section className="flex flex-col gap-4 rounded-xl border border-default-200 bg-default-50 p-4 sm:flex-row sm:items-center">
              <Avatar
                size="lg"
                shape="circle"
                className="size-20 shrink-0 border-2 border-background bg-primary/10 shadow-sm"
              >
                {photoPreview ? (
                  <AvatarImage
                    src={photoPreview}
                    alt={form.name || t("photo.alt")}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="text-xl text-primary">
                  {form.name ? (
                    form.name.slice(0, 1).toUpperCase()
                  ) : (
                    <Camera className="size-7" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <p className="text-sm font-semibold text-default-900">
                    {t("photo.title")}
                    <span className="ml-1 font-normal text-muted-foreground">
                      {t("photo.optional")}
                    </span>
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {t("photo.description")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label
                    htmlFor="staff-photo-upload"
                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                  >
                    <Upload className="size-4" />
                    {photoPreview ? t("photo.change") : t("photo.upload")}
                  </label>
                  <Input
                    id="staff-photo-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={selectPhoto}
                  />
                  {photoPreview && (photoFile || originalPhotoIsCustom) ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 gap-2"
                      onClick={clearPhoto}
                    >
                      <X className="size-4" />
                      {t("photo.remove")}
                    </Button>
                  ) : null}
                </div>
                {errors.photo ? (
                  <p className="text-xs font-medium text-destructive">
                    {errors.photo}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="space-y-4 rounded-xl border border-default-200 p-4">
              <div>
                <h3 className="text-sm font-semibold text-default-900">
                  {t("sections.basic")}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("sections.basicDescription")}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("fields.name")} error={errors.name}>
                  <Input
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (errors.name)
                        setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    className={
                      errors.name
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                  />
                </Field>
                <Field label={t("fields.position")} error={errors.role}>
                  <Select
                    value={form.role}
                    onValueChange={(role) => {
                      setForm({ ...form, role });
                      if (errors.role)
                        setErrors((prev) => ({ ...prev, role: "" }));
                    }}
                  >
                    <SelectTrigger
                      className={
                        errors.role
                          ? "border-destructive focus:ring-destructive"
                          : ""
                      }
                    >
                      <SelectValue placeholder={t("fields.selectPosition")} />
                    </SelectTrigger>
                    <SelectContent>
                      {!STAFF_POSITIONS.some(
                        (position) => position.value === form.role,
                      ) &&
                      form.role ? (
                        <SelectItem value={form.role}>{form.role}</SelectItem>
                      ) : null}
                      {STAFF_POSITIONS.map((position) => (
                        <SelectItem key={position.value} value={position.value}>
                          {t(position.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t("fields.positionHelp")}
                  </p>
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-default-900">
                  {t("sections.permissions")}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("sections.permissionsDescription")}
                </p>
              </div>
              <Toggle
                label={t("toggles.serve.label")}
                description={
                  services.length === 0
                    ? t("toggles.serve.noServices")
                    : t("toggles.serve.description")
                }
                checked={services.length > 0 && form.canServeQueues}
                disabled={services.length === 0}
                onChange={(checked) => {
                  setForm({ ...form, canServeQueues: checked });
                  if (!checked && errors.services)
                    setErrors((prev) => ({ ...prev, services: "" }));
                }}
              />
              <Toggle
                label={t("toggles.login.label")}
                description={t("toggles.login.description")}
                checked={form.canLogin}
                onChange={(checked) => {
                  setForm({ ...form, canLogin: checked });
                  if (!checked && (errors.email || errors.phone)) {
                    setErrors((prev) => ({
                      ...prev,
                      email: "",
                      phone: "",
                    }));
                  }
                }}
              />
              {form.canLogin ? (
                <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/[0.035] p-4">
                  <div>
                    <h3 className="text-sm font-semibold text-default-900">
                      {t("sections.access")}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {t("sections.accessDescription")}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t("fields.email")} error={errors.email}>
                      <Input
                        type="email"
                        value={form.email ?? ""}
                        onChange={(e) => {
                          setForm({ ...form, email: e.target.value });
                          if (errors.email) {
                            setErrors((prev) => ({ ...prev, email: "" }));
                          }
                        }}
                        className={
                          errors.email
                            ? "border-destructive focus-visible:ring-destructive"
                            : "bg-background"
                        }
                      />
                    </Field>
                    <Field label={t("fields.phone")} error={errors.phone}>
                      <Input
                        inputMode="numeric"
                        value={form.phone ?? ""}
                        onChange={(e) => {
                          setForm({ ...form, phone: e.target.value });
                          if (errors.phone) {
                            setErrors((prev) => ({ ...prev, phone: "" }));
                          }
                        }}
                        className={
                          errors.phone
                            ? "border-destructive focus-visible:ring-destructive"
                            : "bg-background"
                        }
                      />
                    </Field>
                  </div>
                  <Field
                    label={t("fields.systemRole")}
                    error={errors.systemRoleCode}
                  >
                    <Select
                      value={form.systemRoleCode ?? ""}
                      onValueChange={(systemRoleCode) => {
                        setForm({ ...form, systemRoleCode });
                        if (errors.systemRoleCode) {
                          setErrors((prev) => ({
                            ...prev,
                            systemRoleCode: "",
                          }));
                        }
                      }}
                    >
                      <SelectTrigger
                        className={
                          errors.systemRoleCode
                            ? "border-destructive focus:ring-destructive"
                            : "bg-background"
                        }
                      >
                        <SelectValue
                          placeholder={t("fields.selectSystemRole")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {systemRoles.map((role) => (
                          <SelectItem key={role.code} value={role.code}>
                            {getSystemRoleLabel(role)} ·{" "}
                            {t(
                              `fields.systemRoleScope.${role.scope.toLowerCase()}`,
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {t("fields.systemRoleHelp")}
                    </p>
                  </Field>
                </div>
              ) : null}
              <Toggle
                label={t("toggles.available.label")}
                description={
                  !hasSelectedServices
                    ? t("toggles.available.noServicesSelected")
                    : t("toggles.available.description")
                }
                checked={hasSelectedServices && form.isAvailable}
                disabled={!hasSelectedServices}
                onChange={(checked) =>
                  setForm({ ...form, isAvailable: checked })
                }
              />
              <Toggle
                label={t("toggles.active.label")}
                description={t("toggles.active.description")}
                checked={form.isActive}
                onChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </section>
            {services.length > 0 && form.canServeQueues && (
              <section className="rounded-xl border border-default-200 p-4">
                <Field label={t("fields.services")} error={errors.services}>
                  <div
                    className={`grid gap-2 rounded-xl border p-3 sm:grid-cols-2 ${errors.services ? "border-destructive bg-destructive/5" : ""}`}
                  >
                    {services.map((service) => (
                      <label
                        key={service.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={form.serviceIds.includes(service.id!)}
                          onChange={(e) => {
                            const updatedServiceIds = e.target.checked
                              ? [...form.serviceIds, service.id!]
                              : form.serviceIds.filter(
                                  (id) => id !== service.id,
                                );
                            setForm({ ...form, serviceIds: updatedServiceIds });
                            if (
                              errors.services &&
                              updatedServiceIds.length > 0
                            ) {
                              setErrors((prev) => ({ ...prev, services: "" }));
                            }
                          }}
                        />
                        {service.name}
                      </label>
                    ))}
                  </div>
                </Field>
              </section>
            )}
          </div>
          <DialogFooter className="shrink-0 border-t border-default-200 bg-card px-5 py-4 sm:px-6">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && deletingId === null) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description", {
                name: deleteTarget?.name ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deletingId !== null}
              onClick={(event) => {
                event.preventDefault();
                void deleteStaff();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingId !== null ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              {deletingId !== null
                ? t("deleteDialog.deleting")
                : t("deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium">{label}</span>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl border p-3 ${disabled ? "opacity-75 bg-muted/20" : ""}`}
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p
          className={`text-xs ${disabled ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground"}`}
        >
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

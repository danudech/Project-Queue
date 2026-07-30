"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Standard Table Components
import { TableToolbar } from "@/components/partials/react-table/table-toolbar";
import { CommonTable } from "@/components/partials/react-table/common-table";
import RouteLoadingScreen from "@/components/route-loading-screen";

// Logic & Types
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ServiceCategoryType } from "@/types/shop/catgory";
import { SetService } from "@/types/shop/service";
import type { StaffMember } from "@/types/shop/staff";
import { getColumns } from "./columns";
import { useShop } from "@/hooks/use-me";
import { usePermissions } from "@/hooks/use-permissions";
import { http } from "@/lib/http/client";
import toast from "react-hot-toast";
import { resolveActiveBranchId } from "@/lib/active-branch";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

// ─── Schema ───────────────────────────────────────────────────────────────────

const getFormSchema = (t: any) =>
  z
    .object({
      name: z
        .string()
        .min(1, t("validation.nameRequired"))
        .max(150, t("validation.nameTooLong")),
      shopId: z.coerce.number().min(1, t("validation.shopRequired")),
      duration: z.coerce.number().min(1, t("validation.durationMin")),
      price: z.coerce.number().min(0, t("validation.priceMin")),
      categoryId: z.coerce.number().min(1, t("validation.categoryRequired")),
      isActive: z.boolean().default(true),
      staffSelectionMode: z.enum(["AUTO", "OPTIONAL", "REQUIRED"]),
      staffIds: z.array(z.number()),
    })
    .superRefine((values, context) => {
      if (values.isActive && values.staffIds.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["staffIds"],
          message: t("validation.activeStaffRequired"),
        });
      }
    });

type FormValues = {
  name: string;
  shopId: number;
  duration: number;
  price: number;
  categoryId: number;
  isActive: boolean;
  staffSelectionMode: "AUTO" | "OPTIONAL" | "REQUIRED";
  staffIds: number[];
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const ServicePage = () => {
  const t = useTranslations("service");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const [categoryData, setCategoryData] = React.useState<
    ServiceCategoryType[] | null
  >(null);
  const [tableData, setTableData] = React.useState<SetService[] | null>(null);
  const [staffData, setStaffData] = React.useState<StaffMember[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [missingCategoryDialogOpen, setMissingCategoryDialogOpen] =
    React.useState(false);
  const [editTarget, setEditTarget] = React.useState<SetService | null>(null);
  const [btnLoading, setBtnLoading] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const { data: shopData } = useShop();
  const { can } = usePermissions();
  const canCreateService = can("service.create");
  const canEditService = can("service.edit");
  const canDeleteService = can("service.delete");
  const eligibleStaff = React.useMemo(
    () =>
      staffData.filter((staff) => staff.isActive && staff.canServeQueues),
    [staffData],
  );
  const hasEligibleStaff = eligibleStaff.length > 0;

  const form = useForm<FormValues>({
    resolver: zodResolver(getFormSchema(t)) as any,
    defaultValues: {
      name: "",
      shopId: 0,
      duration: 30,
      price: 0,
      categoryId: 0,
      isActive: true,
      staffSelectionMode: "OPTIONAL",
      staffIds: [],
    },
  });

  // ── Fetch Categories & Services ────────────────────────────────────────
  React.useEffect(() => {
    if (!shopData) return;
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const branch = await resolveActiveBranchId(shopData.shopBranches);
        const [categories, services, staff] = await Promise.all([
          http.get<ServiceCategoryType[]>("shopcategory", {
            params: {
              shopId: shopData.id,
              branchId: branch,
            },
          }),
          http.get<SetService[]>("shopservices", {
            params: {
              shopId: shopData.id,
              branchId: branch,
            },
          }),
          http.get<StaffMember[]>("staff", { params: { branchId: branch } }),
        ]);
        setCategoryData(Array.isArray(categories) ? categories : []);
        setTableData(Array.isArray(services) ? services : []);
        setStaffData(Array.isArray(staff) ? staff : []);
      } catch {
        toast.error(tc("error.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [shopData, tc]);

  // ── Toggle Status ──────────────────────────────────────────────────────
  const toggleStatus = async (row: SetService) => {
    const newStatus = !row.isActive;
    const eligibleStaffIds = new Set(eligibleStaff.map((staff) => staff.id));
    const validStaffIds = (row.staffIds ?? []).filter((id) =>
      eligibleStaffIds.has(id),
    );
    if (newStatus && validStaffIds.length === 0) {
      toast.error(t("validation.activeStaffRequired"));
      openEdit(row);
      return;
    }

    setTableData(
      (prev) =>
        prev?.map((item) =>
          item.id === row.id
            ? { ...item, isActive: newStatus, staffIds: validStaffIds }
            : item,
        ) ?? null,
    );
    try {
      await http.put("shopservices", {
        id: row.id,
        name: row.name,
        duration: row.duration,
        price: row.price,
        categoryId: row.categoryId,
        isActive: newStatus,
        staffSelectionMode: row.staffSelectionMode ?? "OPTIONAL",
        staffIds: validStaffIds,
      });
      toast.success(
        t("toast.statusChangeSuccess", {
          status: newStatus ? tc("status.active") : tc("status.inactive"),
        }),
      );
    } catch {
      setTableData(
        (prev) =>
          prev?.map((item) =>
            item.id === row.id ? { ...item, isActive: row.isActive } : item,
          ) ?? null,
      );
      toast.error(tc("error.statusChangeFailed"));
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const deleteRow = async (id: number) => {
    try {
      await http.delete<boolean>("shopservices", { params: { serviceId: id } });
      setTableData((prev) => prev?.filter((item) => item.id !== id) ?? null);
      toast.success(t("toast.deleteSuccess"));
    } catch {
      toast.error(tc("error.deleteFailed"));
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    if (!shopData) return;
    setBtnLoading(true);
    try {
      if (editTarget) {
        const updated = await http.put<SetService>("shopservices", {
          id: editTarget.id,
          name: values.name,
          duration: values.duration,
          price: values.price,
          categoryId: values.categoryId,
          isActive: values.isActive,
          staffSelectionMode: values.staffSelectionMode,
          staffIds: values.staffIds,
        });
        if (updated) {
          setTableData(
            (prev) =>
              prev?.map((r) =>
                r.id === editTarget.id
                  ? {
                      ...r,
                      name: values.name,
                      duration: values.duration,
                      price: values.price,
                      categoryId: values.categoryId!,
                      isActive: values.isActive,
                      staffSelectionMode: values.staffSelectionMode,
                      staffIds: values.staffIds,
                    }
                  : r,
              ) ?? null,
          );
          toast.success(t("toast.editSuccess"));
        }
      } else {
        const branch = await resolveActiveBranchId(shopData.shopBranches);
        const newService = await http.post<SetService>("shopservices", {
          name: values.name,
          shopId: shopData.id,
          duration: values.duration,
          price: values.price,
          categoryId: values.categoryId,
          isActive: values.isActive,
          staffSelectionMode: values.staffSelectionMode,
          staffIds: values.staffIds,
          branchId: branch,
        });
        if (newService) {
          setTableData((prev) => [...(prev ?? []), newService]);
          toast.success(t("toast.addSuccess"));
        }
      }
      setDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(tc("error.saveFailed"));
    } finally {
      setBtnLoading(false);
    }
  };

  // ── Dialog Helpers ─────────────────────────────────────────────────────
  const openAdd = () => {
    if (!categoryData?.length) {
      setMissingCategoryDialogOpen(true);
      return;
    }

    setEditTarget(null);
    form.reset({
      name: "",
      shopId: shopData?.id || 0,
      duration: 30,
      price: 0,
      categoryId: 0,
      isActive: hasEligibleStaff,
      staffSelectionMode: "OPTIONAL",
      staffIds: [],
    });
    setDialogOpen(true);
  };

  const openEdit = (row: SetService) => {
    const eligibleStaffIds = new Set(eligibleStaff.map((staff) => staff.id));
    setEditTarget(row);
    form.reset({
      name: row.name,
      shopId: Number(row.shopId),
      duration: row.duration,
      price: row.price,
      categoryId: row.categoryId,
      isActive: hasEligibleStaff ? row.isActive : false,
      staffSelectionMode: row.staffSelectionMode ?? "OPTIONAL",
      staffIds: (row.staffIds ?? []).filter((id) => eligibleStaffIds.has(id)),
    });
    setDialogOpen(true);
  };

  // ── Table ──────────────────────────────────────────────────────────────
  const table = useReactTable({
    data: tableData ?? [],
    columns: getColumns(t, tc),
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      openEdit,
      deleteRow,
      toggleStatus,
      canEdit: canEditService,
      canDelete: canDeleteService,
    },
  });

  if (isLoading) {
    return <RouteLoadingScreen />;
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-4">
      {/* 1. Toolbar */}
      <TableToolbar
        title={t("toolbar.all")}
        searchPlaceholder={t("toolbar.search")}
        searchValue={
          (table.getColumn("name")?.getFilterValue() as string) ?? ""
        }
        onSearchChange={(val) => table.getColumn("name")?.setFilterValue(val)}
        onAddClick={canCreateService ? openAdd : undefined}
        addButtonText={canCreateService ? t("toolbar.add") : undefined}
      />

      {/* 2. Table */}
      <CommonTable table={table} columnsLength={getColumns(t, tc).length} />

      {/* 3. Missing category notice */}
      <AlertDialog
        open={missingCategoryDialogOpen}
        onOpenChange={setMissingCategoryDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("missingCategoryDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("missingCategoryDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("missingCategoryDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push(`/${locale}/service/category`)}
            >
              {t("missingCategoryDialog.action")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 4. Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? t("dialog.edit") : t("dialog.add")}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Section */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.namePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Section */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.duration")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="30"
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.priceWithCurrency")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.category")}</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value ? String(field.value) : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("form.selectCategory")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryData && categoryData.length > 0 ? (
                          categoryData.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="__empty__" disabled>
                            {t("form.emptyCategory")}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Section */}
              <FormField
                control={form.control}
                name="shopId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.shop")}</FormLabel>
                    <FormControl>
                      <Input {...field} value={shopData?.name || ""} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="staffSelectionMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("providerSelection.label")}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!hasEligibleStaff}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AUTO">
                          {t("providerSelection.auto")}
                        </SelectItem>
                        <SelectItem value="OPTIONAL">
                          {t("providerSelection.optional")}
                        </SelectItem>
                        <SelectItem value="REQUIRED">
                          {t("providerSelection.required")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {hasEligibleStaff
                        ? t("providerSelection.description")
                        : t("providerSelection.disabledDescription")}
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="staffIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("providerSelection.staffLabel")}</FormLabel>
                    <div className="grid max-h-36 grid-cols-1 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">
                      {eligibleStaff.map((staff) => (
                          <label
                            key={staff.id}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              className="size-4 accent-primary"
                              checked={field.value.includes(staff.id)}
                              onChange={(event) =>
                                field.onChange(
                                  event.target.checked
                                    ? [...field.value, staff.id]
                                    : field.value.filter(
                                        (id) => id !== staff.id,
                                      ),
                                )
                              }
                            />
                            <span>{staff.name}</span>
                          </label>
                        ))}
                      {!hasEligibleStaff && (
                        <div className="col-span-full flex flex-col items-start gap-3 rounded-md bg-warning/10 p-3">
                          <p className="text-sm text-warning-700 dark:text-warning-300">
                            {t("providerSelection.noStaff")}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/${locale}/setting/staff`)
                            }
                          >
                            {t("providerSelection.addStaff")}
                          </Button>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Section */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <FormLabel className="cursor-pointer">
                      {tc("form.statusLabel")}
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!hasEligibleStaff}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {!hasEligibleStaff && (
                <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning-700 dark:text-warning-300">
                  {t("providerSelection.inactiveNotice")}
                </p>
              )}

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  {tc("cancel")}
                </Button>
                <Button type="submit" disabled={btnLoading}>
                  {btnLoading ? tc("saving") : tc("save")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicePage;

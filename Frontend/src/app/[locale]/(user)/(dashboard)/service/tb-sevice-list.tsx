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
      useDefaultBookingRules: z.boolean().default(true),
      slotInterval: z.number().nullable(),
      advanceBookingWindow: z.number().nullable(),
      bufferBetweenServices: z.number().nullable(),
    })
    .superRefine((values, context) => {
      if (values.isActive && values.staffIds.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["staffIds"],
          message: t("validation.activeStaffRequired"),
        });
      }
      if (!values.useDefaultBookingRules) {
        const rules = [
          ["slotInterval", values.slotInterval, 5, 120],
          ["advanceBookingWindow", values.advanceBookingWindow, 1, 365],
          ["bufferBetweenServices", values.bufferBetweenServices, 0, 60],
        ] as const;
        rules.forEach(([path, value, minimum, maximum]) => {
          if (value === null || value < minimum || value > maximum) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              path: [path],
              message: t(`bookingRules.validation.${path}`),
            });
          }
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
  useDefaultBookingRules: boolean;
  slotInterval: number | null;
  advanceBookingWindow: number | null;
  bufferBetweenServices: number | null;
};

type QueueRules = {
  slotInterval: number;
  advanceBookingWindow: number;
  bufferBetweenServices: number;
};

const defaultQueueRules: QueueRules = {
  slotInterval: 30,
  advanceBookingWindow: 14,
  bufferBetweenServices: 10,
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
  const [branchRules, setBranchRules] = React.useState<QueueRules>(defaultQueueRules);

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
      useDefaultBookingRules: true,
      slotInterval: defaultQueueRules.slotInterval,
      advanceBookingWindow: defaultQueueRules.advanceBookingWindow,
      bufferBetweenServices: defaultQueueRules.bufferBetweenServices,
    },
  });

  // ── Fetch Categories & Services ────────────────────────────────────────
  React.useEffect(() => {
    if (!shopData) return;
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const branch = await resolveActiveBranchId(shopData.shopBranches);
        const [categories, services, staff, rules] = await Promise.all([
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
          http.get<QueueRules>("queuerules", { params: { branchId: branch } })
            .catch(() => defaultQueueRules),
        ]);
        setCategoryData(Array.isArray(categories) ? categories : []);
        setTableData(Array.isArray(services) ? services : []);
        setStaffData(Array.isArray(staff) ? staff : []);
        setBranchRules(rules || defaultQueueRules);
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
        slotInterval: row.slotInterval,
        advanceBookingWindow: row.advanceBookingWindow,
        bufferBetweenServices: row.bufferBetweenServices,
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
          slotInterval: values.useDefaultBookingRules ? null : values.slotInterval,
          advanceBookingWindow: values.useDefaultBookingRules ? null : values.advanceBookingWindow,
          bufferBetweenServices: values.useDefaultBookingRules ? null : values.bufferBetweenServices,
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
                      slotInterval: values.useDefaultBookingRules ? null : values.slotInterval,
                      advanceBookingWindow: values.useDefaultBookingRules ? null : values.advanceBookingWindow,
                      bufferBetweenServices: values.useDefaultBookingRules ? null : values.bufferBetweenServices,
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
          slotInterval: values.useDefaultBookingRules ? null : values.slotInterval,
          advanceBookingWindow: values.useDefaultBookingRules ? null : values.advanceBookingWindow,
          bufferBetweenServices: values.useDefaultBookingRules ? null : values.bufferBetweenServices,
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
      useDefaultBookingRules: true,
      slotInterval: branchRules.slotInterval,
      advanceBookingWindow: branchRules.advanceBookingWindow,
      bufferBetweenServices: branchRules.bufferBetweenServices,
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
      useDefaultBookingRules: row.slotInterval == null
        && row.advanceBookingWindow == null
        && row.bufferBetweenServices == null,
      slotInterval: row.slotInterval ?? branchRules.slotInterval,
      advanceBookingWindow: row.advanceBookingWindow ?? branchRules.advanceBookingWindow,
      bufferBetweenServices: row.bufferBetweenServices ?? branchRules.bufferBetweenServices,
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
        <DialogContent size="md" className="max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] overflow-y-auto p-6 sm:p-7">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? t("dialog.edit") : t("dialog.add")}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <div className="space-y-5 rounded-xl border border-primary/15 bg-primary/[0.025] p-5 shadow-sm">
                <FormField
                  control={form.control}
                  name="useDefaultBookingRules"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start gap-3 space-y-0 md:flex-row md:items-center md:justify-between">
                      <div>
                          <FormLabel className="text-base">{t("bookingRules.title")}</FormLabel>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("bookingRules.description")}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {t("bookingRules.useDefaults")}
                        </span>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("useDefaultBookingRules") ? (
                  <div className="grid gap-2 rounded-lg border border-default-200 bg-background p-3 text-xs text-muted-foreground sm:grid-cols-3">
                    <span>{t("bookingRules.inheritedInterval", { value: branchRules.slotInterval })}</span>
                    <span>{t("bookingRules.inheritedAdvance", { value: branchRules.advanceBookingWindow })}</span>
                    <span>{t("bookingRules.inheritedBuffer", { value: branchRules.bufferBetweenServices })}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 border-t border-primary/10 pt-5 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="slotInterval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm leading-5">{t("bookingRules.interval")}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={5}
                              max={120}
                              value={field.value ?? ""}
                              onChange={(event) => field.onChange(event.target.value === "" ? null : Number(event.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="advanceBookingWindow"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm leading-5">{t("bookingRules.advanceWindow")}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={365}
                              value={field.value ?? ""}
                              onChange={(event) => field.onChange(event.target.value === "" ? null : Number(event.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bufferBetweenServices"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm leading-5">{t("bookingRules.buffer")}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={60}
                              value={field.value ?? ""}
                              onChange={(event) => field.onChange(event.target.value === "" ? null : Number(event.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Section */}
              <div className="rounded-xl border border-default-200 bg-default-50/50 p-4">
                <p className="mb-3 text-sm font-semibold text-default-900">{t("form.serviceDetails")}</p>
                <div className="grid gap-4 sm:grid-cols-2">
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
                    <div className="grid max-h-52 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-default-200 bg-default-50/50 p-3 sm:grid-cols-2 lg:grid-cols-3">
                      {eligibleStaff.map((staff) => (
                          <label
                            key={staff.id}
                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-default-200 bg-background px-3 py-2.5 text-sm transition-colors hover:border-primary/40 hover:bg-primary/[0.03] has-[:checked]:border-primary has-[:checked]:bg-primary/[0.06]"
                          >
                            <input
                              type="checkbox"
                              className="size-4 shrink-0 accent-primary"
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
                            <span className="truncate font-medium">{staff.name}</span>
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

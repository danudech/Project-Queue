"use client"

import * as React from "react"
import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
} from "@tanstack/react-table"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

// Standard Table Components
import { TableToolbar } from "@/components/partials/react-table/table-toolbar"
import { CommonTable } from "@/components/partials/react-table/common-table"

// Logic & Types
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ServiceCategoryType } from "@/types/shop/catgory"
import { getColumns } from "./columns"
import { useShop } from "@/hooks/use-me"
import { http } from "@/lib/http/client"
import toast from "react-hot-toast"
import { storage } from "@/services/localstorage"
import { useTranslations } from "next-intl"

const getFormSchema = (t: any) => z.object({
    name: z.string().min(1, t("validation.nameRequired")).max(150, t("validation.nameTooLong")),
    shopId: z.coerce.number().min(1, t("validation.shopRequired")),
    isActive: z.boolean().default(true),
})

type FormValues = {
    name: string;
    shopId: number;
    isActive: boolean;
}

const ServiceCategoryPage = () => {
    const t = useTranslations("category")
    const tc = useTranslations("Common")
    const [tableData, setTableData] = React.useState<ServiceCategoryType[] | null>(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editTarget, setEditTarget] = React.useState<ServiceCategoryType | null>(null);

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const { data: shopData, isLoading } = useShop();

    const form = useForm<FormValues>({
        resolver: zodResolver(getFormSchema(t)) as any,
        defaultValues: { name: "", shopId: 0, isActive: true },
    });

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const branch: number | null = await storage.get("branch") || shopData?.shopBranches?.[0]?.id || null;
                if (shopData) {
                    const shopcategory = await http.get<ServiceCategoryType[]>("shopcategory", {
                        params: {
                            shopId: shopData.id,
                            branchId: branch
                        },
                    });
                    setTableData(shopcategory);
                }
            } catch (error) {
                toast.error(tc("error.loadFailed"));
            }
        };
        fetchData();
    }, [shopData]);

    const toggleStatus = async (row: ServiceCategoryType) => {
        const newStatus = !row.isActive;
        setTableData((prev) =>
            prev?.map((item) =>
                item.id === row.id ? { ...item, isActive: newStatus } : item
            ) ?? null
        );

        try {
            const body = {
                id: row.id,
                name: row.name,
                isActive: newStatus,
            };
            console.log("Updating status with body:", body);
            await http.put("shopcategory", {
                id: row.id,
                name: row.name,
                isActive: newStatus,
            });
            toast.success(t("toast.statusChangeSuccess", { status: newStatus ? tc("status.active") : tc("status.inactive") }));
        } catch (error) {
            setTableData((prev) =>
                prev?.map((item) =>
                    item.id === row.id ? { ...item, isActive: row.isActive } : item
                ) ?? null
            );
            toast.error(tc("error.statusChangeFailed"));
        }
    };

    const deleteRow = async (id: number) => {
        if (confirm(t("confirm.delete"))) {
            try {
                await http.delete<boolean>("shopcategory", {
                    params: {
                        categoryId: id
                    }
                });
                setTableData((prev) => prev?.filter((item) => item.id !== id) ?? null);
                toast.success(t("toast.deleteSuccess"));
            } catch (error) {
                toast.error(tc("error.deleteFailed"));
            }
        }
    };

    const onSubmit = async (values: FormValues) => {
        if (!shopData) return;

        try {
            const branch: number | null = await storage.get("branch") || shopData?.shopBranches?.[0]?.id || null;
            if (editTarget) {
                const update = await http.put<ServiceCategoryType>("shopcategory", {
                    id: editTarget.id,
                    name: values.name,
                    isActive: values.isActive,
                });

                if (update) {
                    setTableData((prev) =>
                        prev?.map((r) =>
                            r.id === editTarget.id
                                ? { ...r, name: values.name, isActive: values.isActive }
                                : r
                        ) ?? null
                    );
                    toast.success(t("toast.editSuccess"));
                }
            } else {
                const payload = {
                    name: values.name,
                    shopId: shopData.id,
                    branchId: branch,
                    isActive: values.isActive,
                };

                const newCategory = await http.post<ServiceCategoryType>("shopcategory", payload);
                if (newCategory) {
                    setTableData((prev) => [...(prev ?? []), newCategory]);
                    toast.success(t("toast.addSuccess"));
                }
            }
            setDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast.error(tc("error.saveFailed"));
        }
    };

    const openAdd = () => {
        setEditTarget(null);
        form.reset({
            name: "",
            shopId: shopData?.id || 0,
            isActive: true
        });
        setDialogOpen(true);
    };

    const openEdit = (row: ServiceCategoryType) => {
        setEditTarget(row);
        form.reset({
            name: row.name,
            shopId: row.shopId,
            isActive: row.isActive,
        });
        setDialogOpen(true);
    };

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
        },
    })

    return (
        <div className="w-full space-y-4">
            {/* 1. Toolbar */}
            <TableToolbar
                title={t("toolbar.all")}
                searchPlaceholder={t("toolbar.search")}
                searchValue={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onSearchChange={(val) => table.getColumn("name")?.setFilterValue(val)}
                onAddClick={openAdd}
                addButtonText={t("toolbar.add")}
            />

            {/* 2. Standard Table */}
            <CommonTable
                table={table}
                columnsLength={getColumns(t, tc).length}
            />

            {/* Add/edit dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editTarget ? t("dialog.edit") : t("dialog.add")}
                        </DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("form.name")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("form.namePlaceholder")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel>{tc("form.statusLabel")}</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{tc("cancel")}</Button>
                                <Button type="submit">{tc("save")}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ServiceCategoryPage

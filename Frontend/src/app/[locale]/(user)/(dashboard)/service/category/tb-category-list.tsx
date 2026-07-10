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

const getFormSchema = (t: any) => z.object({
    name: z.string().min(1, t("validation.nameRequired")).max(150, t("validation.nameTooLong")),
    shopId: z.number().min(1, t("validation.shopRequired")),
    is_active: z.boolean().default(true),
})

type FormValues = z.infer<ReturnType<typeof getFormSchema>>

const ServiceCategoryPage = () => {
    const [tableData, setTableData] = React.useState<ServiceCategoryType[] | null>(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editTarget, setEditTarget] = React.useState<ServiceCategoryType | null>(null);

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const { data: shopData, isLoading } = useShop();

    const form = useForm<FormValues>({
        resolver: zodResolver(getFormSchema(t)),
        defaultValues: { name: "", shopId: "", isActive: true },
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
            toast.success(`เปลี่ยนสถานะเป็น ${newStatus ? 'เปิด' : 'ปิด'} เรียบร้อย`);
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
        if (confirm("ยืนยันการลบข้อมูล?")) {
            try {
                await http.delete<boolean>("shopcategory", {
                    params: {
                        categoryId: id
                    }
                });
                setTableData((prev) => prev?.filter((item) => item.id !== id) ?? null);
                toast.success("ลบข้อมูลสำเร็จ");
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
                    toast.success("แก้ไข Category สำเร็จ");
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
                    toast.success("เพิ่ม Category สำเร็จ");
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
            shopId: String(shopData?.id || ""),
            isActive: true
        });
        setDialogOpen(true);
    };

    const openEdit = (row: ServiceCategoryType) => {
        setEditTarget(row);
        form.reset({
            name: row.name,
            shopId: String(row.shopId),
            isActive: row.isActive,
        });
        setDialogOpen(true);
    };

    const table = useReactTable({
        data: tableData ?? [],
        columns,
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
                title="Service Categories"
                searchPlaceholder="ค้นหาชื่อ category..."
                searchValue={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onSearchChange={(val) => table.getColumn("name")?.setFilterValue(val)}
                onAddClick={openAdd}
                addButtonText="เพิ่ม Category"
            />

            {/* 2. Standard Table */}
            <CommonTable
                table={table}
                columnsLength={columns.length}
            />

            {/* 3. Add/Edit Dialog (ต้องมีเพื่อให้ Popup ทำงาน) */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editTarget ? "แก้ไข Category" : "เพิ่ม Category ใหม่"}
                        </DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ชื่อ Category</FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น ตัดผม, ทำเล็บ" {...field} />
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
                                        <FormLabel>Shop</FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น ตัดผม, ทำเล็บ" {...field} value={shopData?.name || ""} disabled />
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
"use client"

import * as React from "react"
import {
    ColumnFiltersState,
    SortingState,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Standard Table Components
import { TableToolbar } from "@/components/partials/react-table/table-toolbar"
import { CommonTable } from "@/components/partials/react-table/common-table"

// Logic & Types
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ServiceCategoryType } from "@/types/shop/catgory"
import { SetService } from "@/types/shop/service"
import { columns } from "./columns"
import { useShop } from "@/hooks/use-me"
import { http } from "@/lib/http/client"
import toast from "react-hot-toast"

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
    name: z
        .string()
        .min(1, "กรุณากรอกชื่อบริการ")
        .max(150, "ชื่อยาวเกิน 150 ตัวอักษร"),
    shopId: z.string().min(1, "กรุณาเลือกร้านค้า"),
    duration: z
        .number({ message: "กรุณากรอกระยะเวลา" })
        .int("ต้องเป็นจำนวนเต็ม")
        .min(1, "ระยะเวลาต้องมากกว่า 0 นาที"),
    price: z
        .number({ message: "กรุณากรอกราคา" })
        .min(0, "ราคาต้องไม่ติดลบ"),
    categoryId: z
        .number({ message: "กรุณาเลือกหมวดหมู่" })
        .optional()
        .refine((val) => val !== undefined && val > 0, {
            message: "กรุณาเลือกหมวดหมู่",
        }),
    isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

// ─── Page ─────────────────────────────────────────────────────────────────────

const ServicePage = () => {
    const [categoryData, setCategoryData] = React.useState<ServiceCategoryType[] | null>(null)
    const [tableData, setTableData] = React.useState<SetService[] | null>(null)
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [editTarget, setEditTarget] = React.useState<SetService | null>(null)
    const [btnLoading, setBtnLoading] = React.useState(false)

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const { data: shopData } = useShop()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            shopId: "",
            duration: 30,
            price: 0,
            categoryId: undefined,
            isActive: true,
        },
    })

    // ── Fetch Categories & Services ────────────────────────────────────────
    React.useEffect(() => {
        if (!shopData) return
        const fetchAll = async () => {
            try {
                const [categories, services] = await Promise.all([
                    http.get<ServiceCategoryType[]>("shopcategory"),
                    http.get<SetService[]>("shopservices"),
                ])
                setCategoryData(categories)
                setTableData(services)
            } catch {
                toast.error("โหลดข้อมูลไม่สำเร็จ")
            }
        }
        fetchAll()
    }, [shopData])

    // ── Toggle Status ──────────────────────────────────────────────────────
    const toggleStatus = async (row: SetService) => {
        const newStatus = !row.isActive
        setTableData((prev) =>
            prev?.map((item) => item.id === row.id ? { ...item, isActive: newStatus } : item) ?? null
        )
        try {
            await http.put("shopservices", {
                id: row.id,
                name: row.name,
                duration: row.duration,
                price: row.price,
                categoryId: row.categoryId,
                isActive: newStatus,
            })
            toast.success(`เปลี่ยนสถานะเป็น ${newStatus ? "เปิด" : "ปิด"} เรียบร้อย`)
        } catch {
            setTableData((prev) =>
                prev?.map((item) => item.id === row.id ? { ...item, isActive: row.isActive } : item) ?? null
            )
            toast.error("ไม่สามารถเปลี่ยนสถานะได้")
        }
    }

    // ── Delete ─────────────────────────────────────────────────────────────
    const deleteRow = async (id: number) => {
        try {
            await http.delete<boolean>("shopservices", { params: { serviceId: id } })
            setTableData((prev) => prev?.filter((item) => item.id !== id) ?? null)
            toast.success("ลบบริการสำเร็จ")
        } catch {
            toast.error("ลบไม่สำเร็จ")
        }
    }

    // ── Submit ─────────────────────────────────────────────────────────────
    const onSubmit = async (values: FormValues) => {
        if (!shopData) return
        setBtnLoading(true)
        try {
            if (editTarget) {
                const updated = await http.put<SetService>("shopservices", {
                    id: editTarget.id,
                    name: values.name,
                    duration: values.duration,
                    price: values.price,
                    categoryId: values.categoryId,
                    isActive: values.isActive,
                })
                if (updated) {
                    setTableData((prev) =>
                        prev?.map((r) =>
                            r.id === editTarget.id
                                ? {
                                      ...r,
                                      name: values.name,
                                      duration: values.duration,
                                      price: values.price,
                                      categoryId: values.categoryId!,
                                      isActive: values.isActive,
                                  }
                                : r
                        ) ?? null
                    )
                    toast.success("แก้ไขบริการสำเร็จ")
                }
            } else {
                const newService = await http.post<SetService>("shopservices", {
                    name: values.name,
                    shopId: shopData.id,
                    duration: values.duration,
                    price: values.price,
                    categoryId: values.categoryId,
                    isActive: values.isActive,
                })
                if (newService) {
                    setTableData((prev) => [...(prev ?? []), newService])
                    toast.success("เพิ่มบริการสำเร็จ")
                }
            }
            setDialogOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล")
        } finally {
            setBtnLoading(false)
        }
    }

    // ── Dialog Helpers ─────────────────────────────────────────────────────
    const openAdd = () => {
        setEditTarget(null)
        form.reset({
            name: "",
            shopId: String(shopData?.id || ""),
            duration: 30,
            price: 0,
            categoryId: undefined,
            isActive: true,
        })
        setDialogOpen(true)
    }

    const openEdit = (row: SetService) => {
        setEditTarget(row)
        form.reset({
            name: row.name,
            shopId: String(row.shopId),
            duration: row.duration,
            price: row.price,
            categoryId: row.categoryId,
            isActive: row.isActive,
        })
        setDialogOpen(true)
    }

    // ── Table ──────────────────────────────────────────────────────────────
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
        meta: { openEdit, deleteRow, toggleStatus },
    })

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="w-full space-y-4">
            {/* 1. Toolbar */}
            <TableToolbar
                title="บริการทั้งหมด"
                searchPlaceholder="ค้นหาชื่อบริการ..."
                searchValue={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onSearchChange={(val) => table.getColumn("name")?.setFilterValue(val)}
                onAddClick={openAdd}
                addButtonText="เพิ่มบริการ"
            />

            {/* 2. Table */}
            <CommonTable table={table} columnsLength={columns.length} />

            {/* 3. Add / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editTarget ? "แก้ไขบริการ" : "เพิ่มบริการใหม่"}
                        </DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            {/* ชื่อบริการ */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ชื่อบริการ</FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น ตัดผมชาย, สระผม, ทำเล็บ" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ระยะเวลา + ราคา */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ระยะเวลา (นาที)</FormLabel>
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
                                            <FormLabel>ราคา (บาท)</FormLabel>
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

                            {/* หมวดหมู่ */}
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>หมวดหมู่</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            value={field.value ? String(field.value) : ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="เลือกหมวดหมู่" />
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
                                                        ไม่มีหมวดหมู่ — กรุณาเพิ่มหมวดหมู่ก่อน
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ร้านค้า (disabled) */}
                            <FormField
                                control={form.control}
                                name="shopId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ร้านค้า</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={shopData?.name || ""} disabled />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* สถานะ */}
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                        <FormLabel className="cursor-pointer">สถานะการใช้งาน</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                >
                                    ยกเลิก
                                </Button>
                                <Button type="submit" disabled={btnLoading}>
                                    {btnLoading ? "กำลังบันทึก..." : "บันทึก"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ServicePage
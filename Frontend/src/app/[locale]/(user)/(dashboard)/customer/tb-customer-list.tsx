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

// Standard Table Components
import { TableToolbar } from "@/components/partials/react-table/table-toolbar"
import { CommonTable } from "@/components/partials/react-table/common-table"

// Logic & Types
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { columns } from "./columns"
import { useShop } from "@/hooks/use-me"
import { http } from "@/lib/http/client"
import toast from "react-hot-toast"
import { CustomerType } from "@/types/shop/customer"

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
    name: z
        .string()
        .min(1, "กรุณากรอกชื่อลูกค้า")
        .max(150, "ชื่อยาวเกิน 150 ตัวอักษร"),
    phone: z
        .string()
        .min(1, "กรุณากรอกเบอร์โทรศัพท์")
        .max(20, "เบอร์โทรยาวเกิน 20 ตัวอักษร"),
    isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

// ─── Page ─────────────────────────────────────────────────────────────────────

const CustomerPage = () => {
    const [tableData, setTableData] = React.useState<CustomerType[] | null>(null)
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [editTarget, setEditTarget] = React.useState<CustomerType | null>(null)
    const [btnLoading, setBtnLoading] = React.useState(false)

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const { data: shopData } = useShop()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            phone: "",
            isActive: true,
        },
    })

    // ── Fetch ──────────────────────────────────────────────────────────────
    React.useEffect(() => {
        if (!shopData) return
        const fetchAll = async () => {
            try {
                const customers = await http.get<CustomerType[]>("customer")
                setTableData(customers)
            } catch {
                toast.error("โหลดข้อมูลไม่สำเร็จ")
            }
        }
        fetchAll()
    }, [shopData])

    // ── Toggle Status ──────────────────────────────────────────────────────
    const toggleStatus = async (row: CustomerType) => {
        const newStatus = !row.isActive
        setTableData((prev) =>
            prev?.map((item) => item.id === row.id ? { ...item, isActive: newStatus } : item) ?? null
        )
        try {
            await http.put("customer", {
                id: row.id,
                name: row.name,
                phone: row.phone,
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
            await http.delete<boolean>("customer", { params: { customerId: id } })
            setTableData((prev) => prev?.filter((item) => item.id !== id) ?? null)
            toast.success("ลบลูกค้าสำเร็จ")
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
                const updated = await http.put<CustomerType>("customer", {
                    id: editTarget.id,
                    name: values.name,
                    phone: values.phone,
                    isActive: values.isActive,
                })
                if (updated) {
                    setTableData((prev) =>
                        prev?.map((r) =>
                            r.id === editTarget.id
                                ? { ...r, name: values.name, phone: values.phone, isActive: values.isActive }
                                : r
                        ) ?? null
                    )
                    toast.success("แก้ไขข้อมูลลูกค้าสำเร็จ")
                }
            } else {
                const newCustomer = await http.post<CustomerType>("customer", {
                    name: values.name,
                    phone: values.phone,
                    shopId: shopData.id,
                    isActive: values.isActive,
                })
                if (newCustomer) {
                    setTableData((prev) => [...(prev ?? []), newCustomer])
                    toast.success("เพิ่มลูกค้าสำเร็จ")
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
        form.reset({ name: "", phone: "", isActive: true })
        setDialogOpen(true)
    }

    const openEdit = (row: CustomerType) => {
        setEditTarget(row)
        form.reset({ name: row.name, phone: row.phone, isActive: row.isActive })
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
                title="ลูกค้าทั้งหมด"
                searchPlaceholder="ค้นหาชื่อลูกค้า..."
                searchValue={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onSearchChange={(val) => table.getColumn("name")?.setFilterValue(val)}
                onAddClick={openAdd}
                addButtonText="เพิ่มลูกค้า"
            />

            {/* 2. Table */}
            <CommonTable table={table} columnsLength={columns.length} />

            {/* 3. Add / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editTarget ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้าใหม่"}
                        </DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            {/* ชื่อลูกค้า */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ชื่อลูกค้า</FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น สมชาย ใจดี" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* เบอร์โทรศัพท์ */}
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>เบอร์โทรศัพท์</FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น 0812345678" {...field} />
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

export default CustomerPage
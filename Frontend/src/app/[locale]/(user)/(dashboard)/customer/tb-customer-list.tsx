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
import { format } from "date-fns"
import { th } from "date-fns/locale"
import {
    CalendarIcon, Clock, User, Phone,
    Scissors, ChevronRight, CheckCircle2,
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
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
import { getColumns } from "./columns"
import { useShop } from "@/hooks/use-me"
import { http } from "@/lib/http/client"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"
import { CustomerType } from "@/types/shop/customer"
import { ShopResponse } from "@/types/shop/shop-responsd"
import { SetService } from "@/types/shop/service"
import { BookingDateField } from "./bookingdatefield"

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30",
]

// ─── Schema ───────────────────────────────────────────────────────────────────

const getFormSchema = (t: any) => z.object({
    name: z.string().min(1, t("validation.nameRequired")).max(150, t("validation.nameTooLong")),
    phone: z.string().min(1, t("validation.phoneRequired")).max(20, t("validation.phoneTooLong")),
    is_active: z.boolean().default(true),
    isBooking: z.boolean().default(false),
})

type FormValues = z.infer<ReturnType<typeof getFormSchema>>

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: "info" | "booking" }) {
    const steps = [
        { key: "info", label: "ข้อมูลลูกค้า" },
        { key: "booking", label: "จองคิว" },
    ]
    return (
        <div className="flex items-center gap-2 pb-2">
            {steps.map((step, i) => {
                const isActive = step.key === current
                const isDone = current === "booking" && step.key === "info"
                return (
                    <div key={step.key} className="flex items-center gap-2">
                        <div className={cn(
                            "flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full transition-all",
                            isActive && "bg-primary text-primary-foreground",
                            isDone && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
                            !isActive && !isDone && "bg-muted text-muted-foreground",
                        )}>
                            {isDone
                                ? <CheckCircle2 className="w-3.5 h-3.5" />
                                : <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">{i + 1}</span>
                            }
                            {step.label}
                        </div>
                        {i < steps.length - 1 && (
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const CustomerPage = () => {
    const [tableData, setTableData] = React.useState<CustomerType[] | null>(null)
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [editTarget, setEditTarget] = React.useState<CustomerType | null>(null)
    const [btnLoading, setBtnLoading] = React.useState(false)

    // booking dialog state
    const [step, setStep] = React.useState<"info" | "booking">("info")
    const [withBooking, setWithBooking] = React.useState(false)

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const { data: shopData } = useShop() as { data: ShopResponse | null }

    const form = useForm<FormValues>({
        resolver: zodResolver(getFormSchema(t)),
        defaultValues: {
            name: "",
            phone: "",
            isActive: true,
            serviceId: undefined,
            bookingDate: undefined,
            bookingTime: undefined,
            note: "",
        },
    })

    const selectedService = (shopData?.services ?? []).find(
        (s: SetService) => s.id === form.watch("serviceId")
    )
    const bookingDate = form.watch("bookingDate")
    const bookingTime = form.watch("bookingTime")

    // ── Fetch ──────────────────────────────────────────────────────────────
    React.useEffect(() => {
        if (!shopData) return
        const fetchAll = async () => {
            try {
                const customers = await http.get<CustomerType[]>("customer")
                setTableData(customers)
            } catch {
                toast.error(tc("error.loadFailed"))
            }
        }
        fetchAll()
    }, [shopData])

    // ── Toggle Status ──────────────────────────────────────────────────────
    const toggleStatus = async (row: CustomerType) => {
        const newStatus = !row.isActive
        setTableData((prev) =>
            prev?.map((item) =>
                item.id === row.id ? { ...item, isActive: newStatus } : item
            ) ?? null
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
                prev?.map((item) =>
                    item.id === row.id ? { ...item, isActive: row.isActive } : item
                ) ?? null
            )
            toast.error(tc("error.statusChangeFailed"))
        }
    }

    // ── Delete ─────────────────────────────────────────────────────────────
    const deleteRow = async (id: number) => {
        try {
            await http.delete<boolean>("customer", { params: { customerId: id } })
            setTableData((prev) => prev?.filter((item) => item.id !== id) ?? null)
            toast.success(t("toast.deleteSuccess"))
        } catch {
            toast.error(tc("error.deleteFailed"))
        }
    }

    // ── Submit ─────────────────────────────────────────────────────────────
    const onSubmit = async (values: FormValues) => {
        if (!shopData) return
        setBtnLoading(true)
        try {
            if (editTarget) {
                // ── Edit customer ──
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
                    toast.success(t("toast.editSuccess"))
                }
            } else {
                // ── Create customer ──
                const newCustomer = await http.post<CustomerType>("customer", {
                    name: values.name,
                    phone: values.phone,
                    shopId: shopData.id,
                    isActive: values.isActive,
                })
                if (newCustomer) {
                    setTableData((prev) => [...(prev ?? []), newCustomer])

                    // ── Create booking if opted in ──
                    if (withBooking && values.serviceId && values.bookingDate && values.bookingTime) {
                        try {
                            await http.post("booking", {
                                customerId: newCustomer.id,
                                shopId: shopData.id,
                                serviceId: values.serviceId,
                                date: format(values.bookingDate, "yyyy-MM-dd"),
                                time: values.bookingTime,
                                note: values.note ?? "",
                            })
                            toast.success("เพิ่มลูกค้าและจองคิวสำเร็จ")
                        } catch {
                            toast.error("เพิ่มลูกค้าสำเร็จ แต่จองคิวไม่สำเร็จ")
                        }
                    } else {
                        toast.success("เพิ่มลูกค้าสำเร็จ")
                    }
                }
            }
            handleCloseDialog()
        } catch (error) {
            console.error(error)
            toast.error(tc("error.saveFailed"))
        } finally {
            setBtnLoading(false)
        }
    }

    // ── Dialog Helpers ─────────────────────────────────────────────────────
    const handleCloseDialog = () => {
        setDialogOpen(false)
        setTimeout(() => {
            setStep("info")
            setWithBooking(false)
            form.reset()
        }, 300)
    }

    const openAdd = () => {
        setEditTarget(null)
        setStep("info")
        setWithBooking(false)
        form.reset({ name: "", phone: "", isActive: true })
        setDialogOpen(true)
    }

    const openEdit = (row: CustomerType) => {
        setEditTarget(row)
        setStep("info")
        setWithBooking(false)
        form.reset({ name: row.name, phone: row.phone, isActive: row.isActive })
        setDialogOpen(true)
    }

    const handleNextStep = () => {
        form.trigger(["name", "phone"]).then((valid) => {
            if (valid) setStep("booking")
        })
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
                title={t("toolbar.all")}
                searchPlaceholder={t("toolbar.search")}
                searchValue={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onSearchChange={(val) => table.getColumn("name")?.setFilterValue(val)}
                onAddClick={openAdd}
                addButtonText="เพิ่มลูกค้า"
            />

            {/* 2. Table */}
            <CommonTable table={table} columnsLength={columns.length} />

            {/* 3. Add / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editTarget ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้าใหม่"}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Step indicator — only for add mode with booking */}
                    {!editTarget && withBooking && <StepIndicator current={step} />}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            {/* ══════════════════════════════════════════
                                STEP 1 — ข้อมูลลูกค้า
                            ══════════════════════════════════════════ */}
                            {step === "info" && (
                                <>
                                    {/* ชื่อลูกค้า */}
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                                                    ชื่อลูกค้า
                                                </FormLabel>
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
                                                <FormLabel className="flex items-center gap-1.5">
                                                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                                    เบอร์โทรศัพท์
                                                </FormLabel>
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
                                                <FormLabel className="cursor-pointer">{tc("form.statusLabel")}</FormLabel>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Toggle จองคิว — add mode only */}
                                    {!editTarget && (
                                        <>
                                            <Separator />
                                            <div
                                                className={cn(
                                                    "flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors",
                                                    withBooking
                                                        ? "border-primary/50 bg-primary/5"
                                                        : "hover:bg-muted/50",
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                                        withBooking
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-muted text-muted-foreground",
                                                    )}>
                                                        <CalendarIcon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{t("form.bookTogether")}</p>
                                                        <p className="text-xs text-muted-foreground">เพิ่มการนัดหมายทันที</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={withBooking}
                                                    onCheckedChange={setWithBooking}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </>
                                    )}

                                    <DialogFooter className="pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCloseDialog}
                                        >
                                            ยกเลิก
                                        </Button>
                                        {withBooking && !editTarget ? (
                                            <Button type="button" onClick={handleNextStep}>
                                                ถัดไป
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        ) : (
                                            <Button type="submit" disabled={btnLoading}>
                                                {btnLoading ? tc("saving") : "บันทึก"}
                                            </Button>
                                        )}
                                    </DialogFooter>
                                </>
                            )}

                            {/* ══════════════════════════════════════════
                                STEP 2 — จองคิว
                            ══════════════════════════════════════════ */}
                            {step === "booking" && (
                                <>
                                    {/* Customer summary chip */}
                                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                                            {form.getValues("name").charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{form.getValues("name")}</p>
                                            <p className="text-xs text-muted-foreground">{form.getValues("phone")}</p>
                                        </div>
                                    </div>

                                    {/* บริการ */}
                                    <FormField
                                        control={form.control}
                                        name="serviceId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1.5">
                                                    <Scissors className="w-3.5 h-3.5 text-muted-foreground" />
                                                    บริการที่ต้องการ
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value?.toString()}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="เลือกบริการ" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {(shopData?.services ?? [])
                                                            .filter((s: SetService) => s.isActive)
                                                            .map((s: SetService) => (
                                                                <SelectItem key={s.id} value={s.id!.toString()}>
                                                                    <div className="flex items-center justify-between w-full gap-6">
                                                                        <span>{s.name}</span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {s.duration} นาที · ฿{s.price.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                                {selectedService && (
                                                    <div className="flex gap-2 mt-1">
                                                        <Badge className="text-xs">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {selectedService.duration} นาที
                                                        </Badge>
                                                        <Badge className="text-xs">
                                                            ฿{selectedService.price.toLocaleString()}
                                                        </Badge>
                                                        {selectedService.categoryName && (
                                                            <Badge className="text-xs">
                                                                {selectedService.categoryName}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* วันที่ */}
                                    <BookingDateField t={t} tc={tc} control={form.control} name="bookingDate" />

                                    {/* เวลา */}
                                    <FormField
                                        control={form.control}
                                        name="bookingTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                    เวลานัดหมาย
                                                </FormLabel>
                                                <div className="grid grid-cols-4 gap-1.5">
                                                    {TIME_SLOTS.map((t) => (
                                                        <button
                                                            key={t}
                                                            type="button"
                                                            onClick={() => field.onChange(t)}
                                                            className={cn(
                                                                "text-xs py-1.5 rounded-md border transition-all font-medium",
                                                                field.value === t
                                                                    ? "bg-primary text-primary-foreground border-primary"
                                                                    : "hover:border-primary/50 hover:bg-primary/5",
                                                            )}
                                                        >
                                                            {t}
                                                        </button>
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* หมายเหตุ */}
                                    <FormField
                                        control={form.control}
                                        name="note"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>หมายเหตุ (ถ้ามี)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="เช่น แพ้สารเคมี, ต้องการช่างเฉพาะ"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Booking summary */}
                                    {(selectedService || bookingDate || bookingTime) && (
                                        <div className="rounded-lg border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 p-3 space-y-1.5">
                                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                                                สรุปการจอง
                                            </p>
                                            {selectedService && (
                                                <p className="text-sm">📋 {selectedService.name}</p>
                                            )}
                                            {bookingDate && (
                                                <p className="text-sm">
                                                    📅 {format(bookingDate, "EEEE d MMMM yyyy", { locale: th })}
                                                </p>
                                            )}
                                            {bookingTime && (
                                                <p className="text-sm">🕐 {bookingTime} น.</p>
                                            )}
                                        </div>
                                    )}

                                    <DialogFooter className="pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep("info")}
                                        >
                                            ย้อนกลับ
                                        </Button>
                                        <Button type="submit" disabled={btnLoading}>
                                            {btnLoading ? tc("saving") : "บันทึกและจองคิว"}
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CustomerPage
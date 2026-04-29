"use client"

import * as React from "react"
import {
    ChevronsUpDown, Check, CirclePlus, Phone, Briefcase,
    Store, Loader2, Building2, ChevronRight, ChevronLeft,
    MapPin, Clock, GitBranch, ChevronDown, Home,
} from 'lucide-react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage, StoreImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Command, CommandEmpty, CommandGroup, CommandInput,
    CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command"
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Form, FormControl, FormField,
    FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { useConfig } from "@/hooks/use-config"
import { useMenuHoverConfig } from "@/hooks/use-menu-hover"
import { useShop } from "@/hooks/use-me"
import { AddShop, BusinessHour, ShopType } from "@/types/shop/shoptype"
import { useLocale } from "next-intl"
import { http } from "@/lib/http/client"
import { AddressType } from "@/types/address/address-type"
import { ShopResponse } from "@/types/shop/shop-responsd"
import toast from "react-hot-toast"

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────
const DAYS = [
    { value: 1, label: "จันทร์" },
    { value: 2, label: "อังคาร" },
    { value: 3, label: "พุธ" },
    { value: 4, label: "พฤหัส" },
    { value: 5, label: "ศุกร์" },
    { value: 6, label: "เสาร์" },
    { value: 0, label: "อาทิตย์" },
] as const

const STEPS = ["ข้อมูลร้าน", "ข้อมูลสาขา", "เวลาทำการ"] as const

// ─────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────
const step1Schema = z.object({
    name: z.string().min(2, "ชื่อร้านต้องมีอย่างน้อย 2 ตัวอักษร"),
    type: z.string().min(1, "กรุณาเลือกประเภทธุรกิจ"),
})

const step2Schema = z.object({
    branchName: z.string().min(2, "ชื่อสาขาต้องมีอย่างน้อย 2 ตัวอักษร"),
    branchPhone: z.string()
        .refine((val) => val === "" || /^0\d{9}$/.test(val), {
            message: "เบอร์โทรต้องมี 10 หลักและขึ้นต้นด้วย 0"
        })
        .optional()
        .or(z.literal("")),
    houseNo: z.string().optional(),
    street: z.string().optional(),
    zipcode: z.string().length(5, "รหัสไปรษณีย์ต้องมี 5 หลัก"),
    subdistrictId: z.number().min(1, "กรุณาเลือกตำบล"),
    districtId: z.number(),
    provinceId: z.number(),
    districtName: z.string().optional(),
    provinceName: z.string().optional(),
})

type Step1Values = z.infer<typeof step1Schema>
type Step2Values = z.infer<typeof step2Schema>

const defaultHours = (): BusinessHour[] =>
    DAYS.map((d) => ({
        dayOfWeek: d.value,
        isOpen: d.value >= 1 && d.value <= 5,
        openTime: "09:00",
        closeTime: "18:00",
    }))

// ─────────────────────────────────────────────────────────
// StepIndicator
// ─────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center gap-1.5 text-xs mt-3">
            {STEPS.map((s, i) => (
                <React.Fragment key={s}>
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200",
                        i < current && "text-muted-foreground",
                        i === current && "bg-primary text-primary-foreground font-medium",
                        i > current && "text-muted-foreground/50",
                    )}>
                        {i < current
                            ? <Check className="h-3 w-3" />
                            : <span>{i + 1}.</span>
                        }
                        <span>{s}</span>
                    </div>
                    {i < 2 && <ChevronRight className="h-3 w-3 text-muted-foreground/30 flex-shrink-0" />}
                </React.Fragment>
            ))}
        </div>
    )
}

// ─────────────────────────────────────────────────────────
// StepFooter
// ─────────────────────────────────────────────────────────
function StepFooter({
    onBack,
    nextLabel = "ถัดไป",
    isSubmitting = false,
    isLastStep = false,
}: {
    onBack?: () => void
    nextLabel?: string
    isSubmitting?: boolean
    isLastStep?: boolean
}) {
    return (
        <div className="px-6 pb-5 pt-4 flex items-center justify-between border-t">
            {onBack
                ? <Button type="button" variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground gap-1">
                    <ChevronLeft className="h-3.5 w-3.5" />ย้อนกลับ
                </Button>
                : <div />
            }
            <Button type="submit" size="sm" disabled={isSubmitting} className="min-w-[110px] gap-1">
                {isSubmitting
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />กำลังสร้าง...</>
                    : isLastStep
                        ? <><Check className="h-3.5 w-3.5" />{nextLabel}</>
                        : <>{nextLabel}<ChevronRight className="h-3.5 w-3.5" /></>
                }
            </Button>
        </div>
    )
}

// ─────────────────────────────────────────────────────────
// Step 1 — ข้อมูลร้าน
// ─────────────────────────────────────────────────────────
function Step1({ onNext, saved }: { onNext: (v: Step1Values) => void; saved: Partial<Step1Values> }) {
    const locale = useLocale()
    const [shopTypes, setShopTypes] = React.useState<ShopType[]>([])

    const form = useForm<Step1Values>({
        resolver: zodResolver(step1Schema),
        defaultValues: { name: "", type: "", ...saved },
    })

    React.useEffect(() => {
        http.get<ShopType[]>("shoptype")
            .then((res) => { if (res) setShopTypes(res) })
            .catch(console.error)
    }, [])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onNext)}>
                <div className="px-6 pt-4 pb-3 space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                                <Store className="h-3.5 w-3.5 text-muted-foreground" />
                                ชื่อร้านค้า <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="เช่น คลินิกสุขภาพดี, ร้านตัดผม The Cut" className="h-10 text-sm" {...field} />
                            </FormControl>
                            <p className="text-[11px] text-muted-foreground">ชื่อที่ลูกค้าเห็นเมื่อมาจองคิว</p>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                ประเภทธุรกิจ <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-10 text-sm">
                                        <SelectValue placeholder="เลือกประเภทธุรกิจ" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {shopTypes.map((t) => (
                                        <SelectItem key={t.id} value={t.id.toString()} className="text-sm">
                                            {locale === "th" ? t.nameTh : t.nameEn}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground">ใช้ตั้งค่าเริ่มต้นให้เหมาะสม</p>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )} />
                </div>
                <StepFooter nextLabel="ถัดไป" />
            </form>
        </Form>
    )
}

// ─────────────────────────────────────────────────────────
// Step 2 — สาขา
// ─────────────────────────────────────────────────────────
function Step2({ onNext, onBack, saved }: { onNext: (v: Step2Values) => void; onBack: () => void; saved: Partial<Step2Values> }) {
    const [addressList, setAddressList] = React.useState<AddressType[] | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    const form = useForm<Step2Values>({
        resolver: zodResolver(step2Schema),
        defaultValues: {
            branchName: "สาขาหลัก",
            branchPhone: "",
            houseNo: "",
            street: "",
            zipcode: "",
            subdistrictId: 0,
            districtId: 0,
            provinceId: 0,
            districtName: "",
            provinceName: "",
            ...saved,
        },
    })

    const watchZipcode = form.watch("zipcode") ?? ""
    const watchSubdistrictId = form.watch("subdistrictId")

    React.useEffect(() => {
        if (watchZipcode.length !== 5) {
            setAddressList(null)
            if (watchZipcode.length < 5) {
                form.setValue("subdistrictId", 0)
                form.setValue("districtId", 0)
                form.setValue("provinceId", 0)
                form.setValue("districtName", "")
                form.setValue("provinceName", "")
            }
            return
        }
        setIsLoading(true)
        http.get<AddressType[]>("addressbyzipcode", { params: { zipcode: watchZipcode } })
            .then((res) => setAddressList(res && res.length > 0 ? res : null))
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [watchZipcode, form])

    React.useEffect(() => {
        if (!addressList || !watchSubdistrictId) {
            if (!watchSubdistrictId) {
                form.setValue("districtName", "")
                form.setValue("provinceName", "")
            }
            return
        }
        const selected = addressList.find((a) => a.subdistrictId === Number(watchSubdistrictId))
        if (selected) {
            form.setValue("districtId", selected.districtId)
            form.setValue("provinceId", selected.provinceId)
            form.setValue("districtName", selected.districtNameTh)
            form.setValue("provinceName", selected.provinceNameTh)
        }
    }, [watchSubdistrictId, addressList, form])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onNext)}>
                <div className="px-6 pt-4 pb-3 space-y-4">
                    <FormField control={form.control} name="branchName" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                ชื่อสาขา <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="เช่น สาขาหลัก, สาขาสุขุมวิท" className="h-10 text-sm" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="branchPhone" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                เบอร์โทรสาขา <span className="text-[11px] text-muted-foreground font-normal">(ไม่บังคับ)</span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="0812345678" className="h-10 text-sm" type="tel" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )} />

                    <div className="space-y-3 pt-1 border-t border-dashed">
                        <p className="text-xs font-medium flex items-center gap-1.5 text-foreground/80">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            ที่อยู่สาขา
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                            <FormField control={form.control} name="houseNo" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[11px] text-muted-foreground">บ้านเลขที่</FormLabel>
                                    <FormControl><Input placeholder="99/9" className="h-9 text-sm" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="street" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[11px] text-muted-foreground">ถนน</FormLabel>
                                    <FormControl><Input placeholder="สุขุมวิท" className="h-9 text-sm" {...field} /></FormControl>
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="zipcode" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[11px] text-muted-foreground">รหัสไปรษณีย์</FormLabel>
                                <FormControl>
                                    <Input {...field} maxLength={5} className="h-9 text-sm" placeholder={isLoading ? "กำลังโหลด..." : "10600"} />
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="subdistrictId" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[11px] text-muted-foreground">ตำบล / แขวง</FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value > 0 ? field.value.toString() : ""}
                                    disabled={!addressList || isLoading}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder={isLoading ? "กำลังโหลด..." : "เลือกตำบล"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {addressList?.map((item) => (
                                            <SelectItem key={item.subdistrictId} value={item.subdistrictId.toString()} className="text-xs">
                                                {item.subdistrictNameTh} ({item.districtNameTh})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-2 gap-2">
                            <FormItem>
                                <FormLabel className="text-[11px] text-muted-foreground">เขต / อำเภอ</FormLabel>
                                <Input value={form.watch("districtName")} readOnly className="h-9 text-xs bg-muted/30 cursor-not-allowed" />
                                <input type="hidden" {...form.register("districtId")} />
                            </FormItem>
                            <FormItem>
                                <FormLabel className="text-[11px] text-muted-foreground">จังหวัด</FormLabel>
                                <Input value={form.watch("provinceName")} readOnly className="h-9 text-xs bg-muted/30 cursor-not-allowed" />
                                <input type="hidden" {...form.register("provinceId")} />
                            </FormItem>
                        </div>
                    </div>
                </div>
                <StepFooter onBack={onBack} nextLabel="ถัดไป" />
            </form>
        </Form>
    )
}

// ─────────────────────────────────────────────────────────
// Step 3 — เวลาทำการ
// ─────────────────────────────────────────────────────────
function Step3({ onSubmit, onBack, isSubmitting }: {
    onSubmit: (hours: BusinessHour[]) => void
    onBack: () => void
    isSubmitting: boolean
}) {
    const [hours, setHours] = React.useState<BusinessHour[]>(defaultHours)

    const update = (dayOfWeek: number, patch: Partial<BusinessHour>) =>
        setHours((prev) => prev.map((h) => h.dayOfWeek === dayOfWeek ? { ...h, ...patch } : h))

    const copyFirstOpen = () => {
        const first = hours.find((h) => h.isOpen)
        if (!first) return
        setHours((prev) => prev.map((h) => h.isOpen ? { ...h, openTime: first.openTime, closeTime: first.closeTime } : h))
    }

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(hours) }}>
            <div className="px-6 pt-4 pb-3 space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-medium flex items-center gap-1.5 text-foreground/80">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        วันและเวลาทำการ
                    </p>
                    <div className="flex gap-2 text-[11px]">
                        <button
                            type="button"
                            onClick={() => setHours((prev) => prev.map((h) => ({ ...h, isOpen: true })))}
                            className="text-primary hover:underline"
                        >
                            เปิดทุกวัน
                        </button>
                        <span className="text-muted-foreground/40">|</span>
                        <button type="button" onClick={copyFirstOpen} className="text-primary hover:underline">
                            copy เวลาจากวันแรก
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    {DAYS.map((day) => {
                        const h = hours.find((x) => x.dayOfWeek === day.value)!
                        return (
                            <div key={day.value} className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-150",
                                h.isOpen ? "border-border bg-background" : "border-border/40 bg-muted/20 opacity-55"
                            )}>
                                <Switch
                                    checked={h.isOpen}
                                    onCheckedChange={(v) => update(day.value, { isOpen: v })}
                                    className="flex-shrink-0 scale-90"
                                />
                                <span className={cn(
                                    "text-xs w-12 flex-shrink-0",
                                    h.isOpen ? "font-medium text-foreground" : "text-muted-foreground"
                                )}>
                                    {day.label}
                                </span>
                                {h.isOpen ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <Input type="time" value={h.openTime} onChange={(e) => update(day.value, { openTime: e.target.value })} className="h-8 text-xs w-[95px]" />
                                        <span className="text-xs text-muted-foreground">—</span>
                                        <Input type="time" value={h.closeTime} onChange={(e) => update(day.value, { closeTime: e.target.value })} className="h-8 text-xs w-[95px]" />
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground flex-1">วันหยุด</span>
                                )}
                            </div>
                        )
                    })}
                </div>
                <p className="text-[11px] text-muted-foreground pt-1">* แก้ไขเวลาทำการได้ในหน้าตั้งค่าร้าน</p>
            </div>
            <StepFooter onBack={onBack} nextLabel="สร้างร้านค้า" isSubmitting={isSubmitting} isLastStep />
        </form>
    )
}

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────
export default function TeamSwitcher({ className }: { className?: string }) {
    const [config] = useConfig()
    const [hoverConfig] = useMenuHoverConfig()
    const { hovered } = hoverConfig

    const { data: shopData, isLoading, refetch } = useShop()

    const [open, setOpen] = React.useState(false)
    const [showDialog, setShowDialog] = React.useState(false)
    const [dialogMode, setDialogMode] = React.useState<"shop" | "branch">("shop")
    const [step, setStep] = React.useState(0)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [selectedShopId, setSelectedShopId] = React.useState<number | null>(null)
    const [selectedBranchId, setSelectedBranchId] = React.useState<number | null>(null)

    const [step1Data, setStep1Data] = React.useState<Partial<Step1Values>>({})
    const [step2Data, setStep2Data] = React.useState<Partial<Step2Values>>({})

    // ตั้งค่า selectedShopId และ selectedBranchId จากร้านแรกที่โหลดมา
    React.useEffect(() => {
        if (shopData && !selectedShopId) {
            setSelectedShopId(shopData.id ?? null)
            const firstBranch = shopData.shopBranches?.[0]
            if (firstBranch) setSelectedBranchId(firstBranch.id)
        }
    }, [shopData])

    const selectedShop = shopData
    const selectedBranch = shopData?.shopBranches?.find((b) => b.id === selectedBranchId)

    const handleClose = (val: boolean) => {
        setShowDialog(val)
        if (!val) {
            setStep(0)
            setStep1Data({})
            setStep2Data({})
            setIsSubmitting(false)
            setDialogMode("shop")
        }
    }

    const handleFinalSubmit = async (hours: BusinessHour[]) => {
        setIsSubmitting(true)
        try {
            const payload: AddShop = {
                shopname: step1Data.name!,
                shoptype: step1Data.type!,
                branch: {
                    branchName: step2Data.branchName!,
                    branchPhone: step2Data.branchPhone ?? "",
                    branchAddress: {
                        houseNo: step2Data.houseNo ?? "",
                        street: step2Data.street ?? "",
                        subdistrictId: step2Data.subdistrictId!,
                        districtId: step2Data.districtId!,
                        provinceId: step2Data.provinceId!,
                        zipcode: step2Data.zipcode!,
                    },
                },
                businessHours: hours,
            }

            const res = await http.post<ShopResponse>("newshop", payload)

            if (res != null) {
                toast.success("สร้างร้านค้าสำเร็จ!")
                await refetch()
                handleClose(false)
            } else {
                toast.error("สร้างร้านค้าไม่สำเร็จ")
            }
        } catch (err) {
            console.error(err)
            toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (config.showSwitcher === false || config.sidebar === "compact") return null
    if (isLoading)
        return <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>

    const isCollapsed = config.collapsed && !hovered

    return (
        <Dialog open={showDialog} onOpenChange={handleClose}>
            {/* ── Switcher Popover ── */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <motion.div
                        key={isCollapsed ? "c" : "e"}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 320, damping: 22 }}
                    >
                        {isCollapsed ? (
                            <Button
                                variant="outline"
                                color="secondary"
                                role="combobox"
                                aria-expanded={open}
                                aria-label="Select a team"
                                className={cn("h-14 w-14 mx-auto p-0 md:p-0 dark:border-secondary ring-offset-sidebar", className)}
                            >
                                <Avatar>
                                    <AvatarImage
                                        height={24}
                                        width={24}
                                        src="/images/icon/store.svg"
                                        alt="store icon"
                                        className="grayscale"
                                    />
                                    <AvatarFallback>
                                        <Home className="h-4 w-4 text-muted-foreground" />
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                color="secondary"
                                role="combobox"
                                aria-expanded={open}
                                aria-label="Select a team"
                                className={cn("h-auto py-3 px-3 justify-start dark:border-secondary ring-offset-sidebar w-full", className)}
                            >
                                <div className="flex gap-2 flex-1 items-center">
                                    <Avatar className="flex-none">
                                        <StoreImage
                                            height={24}
                                            width={24}
                                            src="/images/icon/store.svg"
                                            alt="store icon"
                                            className="grayscale"
                                        />
                                        <AvatarFallback>
                                            <Home className="h-4 w-4 text-muted-foreground" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-start w-[100px]">
                                        <div className="text-sm font-semibold text-default-900 truncate">
                                            {selectedShop?.name ?? "—"}
                                        </div>
                                        <div className="text-xs font-normal text-default-500 dark:text-default-700 truncate flex items-center gap-1">
                                            <GitBranch className="h-2.5 w-2.5 flex-shrink-0" />
                                            {selectedBranch?.name ?? "—"}
                                        </div>
                                    </div>
                                    <ChevronsUpDown className="ml-auto h-5 w-5 shrink-0 text-default-500 dark:text-default-700" />
                                </div>
                            </Button>
                        )}
                    </motion.div>
                </PopoverTrigger>

                <PopoverContent className="w-64 p-0 shadow-lg" align="start">
                    <Command>
                        {/* ── Shop header — dark icon style ── */}
                        {shopData && (
                            <div className="flex items-center gap-3 px-3 py-3 border-b bg-muted/30">
                                <div className="h-9 w-9 rounded-full bg-foreground/90 dark:bg-foreground/10 flex items-center justify-center flex-shrink-0">
                                    <Home className="h-4 w-4 text-background dark:text-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted-foreground leading-none mb-0.5">ร้านของฉัน</p>
                                    <p className="text-sm font-semibold truncate leading-tight">{shopData.name}</p>
                                </div>
                            </div>
                        )}

                        {/* ── Branch list ── */}
                        {shopData?.shopBranches && shopData.shopBranches.length > 0 && (
                            <>
                                <div className="px-3 pt-2.5 pb-1">
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                        <GitBranch className="h-3 w-3" />
                                        เลือกสาขา
                                    </p>
                                </div>
                                <CommandList className="max-h-40">
                                    <CommandGroup>
                                        {shopData.shopBranches.map((branch) => (
                                            <CommandItem
                                                key={branch.id}
                                                onSelect={() => { setSelectedBranchId(branch.id); setOpen(false) }}
                                                className="text-sm gap-2.5 mx-1 rounded-md"
                                            >
                                                <div className={cn(
                                                    "h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors",
                                                    selectedBranchId === branch.id
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted text-muted-foreground"
                                                )}>
                                                    <Building2 className="h-3 w-3" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium truncate">{branch.name}</p>
                                                    {branch.phone && (
                                                        <p className="text-[10px] text-muted-foreground truncate">{branch.phone}</p>
                                                    )}
                                                </div>
                                                {selectedBranchId === branch.id && (
                                                    <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                                )}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </>
                        )}

                        <CommandSeparator />
                        <CommandList>
                            <CommandGroup>
                                {/* ถ้ามีร้านแล้ว → เพิ่มสาขา, ถ้าไม่มี → เพิ่มร้านใหม่ */}
                                {shopData ? (
                                    <CommandItem
                                        onSelect={() => { setOpen(false); setDialogMode("branch"); setShowDialog(true) }}
                                        className="text-sm gap-2 text-primary font-medium mx-1 rounded-md my-1"
                                    >
                                        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                                            <GitBranch className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        เพิ่มสาขาใหม่
                                    </CommandItem>
                                ) : (
                                    <CommandItem
                                        onSelect={() => { setOpen(false); setDialogMode("shop"); setShowDialog(true) }}
                                        className="text-sm gap-2 text-primary font-medium mx-1 rounded-md my-1"
                                    >
                                        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                                            <CirclePlus className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        เพิ่มร้านค้าใหม่
                                    </CommandItem>
                                )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* ── Multi-step Dialog ── */}
            <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden">
                <div className="px-6 pt-5 pb-4 border-b bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-foreground/90 dark:bg-foreground/10 flex items-center justify-center flex-shrink-0">
                            {dialogMode === "branch"
                                ? <GitBranch className="h-4 w-4 text-background dark:text-foreground" />
                                : <Home className="h-4 w-4 text-background dark:text-foreground" />
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-sm font-semibold leading-tight">
                                {dialogMode === "branch" ? "เพิ่มสาขาใหม่" : "สร้างร้านค้าใหม่"}
                            </DialogTitle>
                            <DialogDescription className="text-[11px] mt-0.5">
                                {dialogMode === "branch"
                                    ? "ระบุข้อมูลสาขาและเวลาทำการ"
                                    : step === 0 ? "กรอกข้อมูลเบื้องต้นของร้าน"
                                    : step === 1 ? "ระบุที่ตั้งสาขาแรก — เพิ่มสาขาอื่นได้ในภายหลัง"
                                    : "กำหนดวันและเวลาทำการเริ่มต้น"
                                }
                            </DialogDescription>
                        </div>
                    </div>
                    {/* Step indicator เฉพาะ mode สร้างร้าน */}
                    {dialogMode === "shop" && <StepIndicator current={step} />}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={dialogMode === "branch" ? "branch" : step}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                    >
                        {/* ── Branch-only mode ── */}
                        {dialogMode === "branch" && (
                            <>
                                <Step2
                                    saved={step2Data}
                                    onNext={async (v) => {
                                        setStep2Data(v)
                                        setIsSubmitting(true)
                                        try {
                                            const res = await http.post("newbranch", {
                                                shopId: shopData?.id,
                                                branchName: v.branchName,
                                                branchPhone: v.branchPhone ?? "",
                                                branchAddress: {
                                                    houseNo: v.houseNo ?? "",
                                                    street: v.street ?? "",
                                                    subdistrictId: v.subdistrictId,
                                                    districtId: v.districtId,
                                                    provinceId: v.provinceId,
                                                    zipcode: v.zipcode,
                                                },
                                            })
                                            if (res != null) {
                                                toast.success("เพิ่มสาขาสำเร็จ!")
                                                await refetch()
                                                handleClose(false)
                                            } else {
                                                toast.error("เพิ่มสาขาไม่สำเร็จ")
                                            }
                                        } catch {
                                            toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่")
                                        } finally {
                                            setIsSubmitting(false)
                                        }
                                    }}
                                    onBack={() => handleClose(false)}
                                />
                            </>
                        )}

                        {/* ── Full shop mode ── */}
                        {dialogMode === "shop" && (
                            <>
                                {step === 0 && (
                                    <Step1 saved={step1Data} onNext={(v) => { setStep1Data(v); setStep(1) }} />
                                )}
                                {step === 1 && (
                                    <Step2 saved={step2Data} onNext={(v) => { setStep2Data(v); setStep(2) }} onBack={() => setStep(0)} />
                                )}
                                {step === 2 && (
                                    <Step3 onSubmit={handleFinalSubmit} onBack={() => setStep(1)} isSubmitting={isSubmitting} />
                                )}
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    )
}
"use client"

import * as React from "react"
import {
    ChevronsUpDown, Check, CirclePlus, Phone, Briefcase,
    Store, Loader2, Building2, ChevronRight, ChevronLeft,
    MapPin, Clock, GitBranch, ChevronDown, Home, Ban,
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
import { useLocale, useTranslations } from "next-intl"
import { http } from "@/lib/http/client"
import { AddressType } from "@/types/address/address-type"
import { ShopResponse } from "@/types/shop/shop-responsd"
import toast from "react-hot-toast"
import { storage } from "@/services/localstorage"

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────
const DAYS = [
    { value: 1, label: "day_monday" },
    { value: 2, label: "day_tuesday" },
    { value: 3, label: "day_wednesday" },
    { value: 4, label: "day_thursday" },
    { value: 5, label: "day_friday" },
    { value: 6, label: "day_saturday" },
    { value: 0, label: "day_sunday" },
] as const

// ─────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────
const getStep1Schema = (t: any) => z.object({
    name: z.string().min(2, t("validation_shopNameMin")),
    type: z.string().min(1, t("validation_selectBusinessType")),
})

const getStep2Schema = (t: any) => z.object({
    branchName: z.string().min(2, t("validation_branchNameMin")),
    branchPhone: z.string()
        .refine((val) => val === "" || /^0\d{9}$/.test(val), {
            message: t("validation_phoneFormat")
        })
        .optional()
        .or(z.literal("")),
    houseNo: z.string().optional(),
    street: z.string().optional(),
    zipcode: z.string().length(5, t("validation_zipcodeLength")),
    subdistrictId: z.number().min(1, t("validation_selectSubdistrict")),
    districtId: z.number(),
    provinceId: z.number(),
    districtName: z.string().optional(),
    provinceName: z.string().optional(),
})

type Step1Values = z.infer<ReturnType<typeof getStep1Schema>>
type Step2Values = z.infer<ReturnType<typeof getStep2Schema>>

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
    const t = useTranslations("Shop")
    const stepLabels = [t("shopInfo"), t("branchInfo"), t("businessHours")]
    return (
        <div className="flex items-center gap-1.5 text-xs mt-3">
            {stepLabels.map((s, i) => (
                <React.Fragment key={i}>
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
    nextLabel,
    isSubmitting = false,
    isLastStep = false,
}: {
    onBack?: () => void
    nextLabel?: string
    isSubmitting?: boolean
    isLastStep?: boolean
}) {
    const t = useTranslations("Shop")
    const resolvedNextLabel = nextLabel || t("next")
    return (
        <div className="px-6 pb-5 pt-4 flex items-center justify-between border-t">
            {onBack
                ? <Button type="button" variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground gap-1">
                    <ChevronLeft className="h-3.5 w-3.5" />{t("back") || "Back"}
                </Button>
                : <div />
            }
            <Button type="submit" size="sm" disabled={isSubmitting} className="min-w-[110px] gap-1">
                {isSubmitting
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t("creating")}</>
                    : isLastStep
                        ? <><Check className="h-3.5 w-3.5" />{resolvedNextLabel}</>
                        : <>{resolvedNextLabel}<ChevronRight className="h-3.5 w-3.5" /></>
                }
            </Button>
        </div>
    )
}

// ─────────────────────────────────────────────────────────
// Note
// ─────────────────────────────────────────────────────────
function Step1({ onNext, saved }: { onNext: (v: Step1Values) => void; saved: Partial<Step1Values> }) {
    const locale = useLocale()
    const t = useTranslations("Shop")
    const [shopTypes, setShopTypes] = React.useState<ShopType[]>([])

    const form = useForm<Step1Values>({
        resolver: zodResolver(getStep1Schema(t)),
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
                                {t("shopName")} <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder={t("shopNamePlaceholder")} className="h-10 text-sm" {...field} />
                            </FormControl>
                            <p className="text-[11px] text-muted-foreground">{t("shopNameDesc")}</p>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                {t("businessType")} <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-10 text-sm">
                                        <SelectValue placeholder={t("selectBusinessType")} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {shopTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()} className="text-sm">
                                            {locale === "th" ? type.nameTh : type.nameEn}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground">{t("businessTypeDesc")}</p>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )} />
                </div>
                <StepFooter nextLabel={t("next")} />
            </form>
        </Form>
    )
}

// ─────────────────────────────────────────────────────────
// Note
// ─────────────────────────────────────────────────────────
function Step2({ onNext, onBack, saved }: { onNext: (v: Step2Values) => void; onBack: () => void; saved: Partial<Step2Values> }) {
    const t = useTranslations("Shop")
    const [addressList, setAddressList] = React.useState<AddressType[] | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    const form = useForm<Step2Values>({
        resolver: zodResolver(getStep2Schema(t)),
        defaultValues: {
            branchName: t("defaultBranchName"),
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
                                {t("branchName")} <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder={t("branchNamePlaceholder")} className="h-10 text-sm" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="branchPhone" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                {t("branchPhone")} <span className="text-[11px] text-muted-foreground font-normal">{t("optional")}</span>
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
                            {t("branchAddress")}
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                            <FormField control={form.control} name="houseNo" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[11px] text-muted-foreground">{t("houseNo")}</FormLabel>
                                    <FormControl><Input placeholder="99/9" className="h-9 text-sm" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="street" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[11px] text-muted-foreground">{t("street")}</FormLabel>
                                    <FormControl><Input placeholder={t("streetPlaceholder")} className="h-9 text-sm" {...field} /></FormControl>
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="zipcode" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[11px] text-muted-foreground">{t("zipcode")}</FormLabel>
                                <FormControl>
                                    <Input {...field} maxLength={5} className="h-9 text-sm" placeholder={isLoading ? t("loading") : "10600"} />
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="subdistrictId" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[11px] text-muted-foreground">{t("subdistrict")}</FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value > 0 ? field.value.toString() : ""}
                                    disabled={!addressList || isLoading}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder={isLoading ? t("loading") : t("selectSubdistrict")} />
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
                                <FormLabel className="text-[11px] text-muted-foreground">{t("district")}</FormLabel>
                                <Input value={form.watch("districtName")} readOnly className="h-9 text-xs bg-muted/30 cursor-not-allowed" />
                                <input type="hidden" {...form.register("districtId")} />
                            </FormItem>
                            <FormItem>
                                <FormLabel className="text-[11px] text-muted-foreground">{t("province")}</FormLabel>
                                <Input value={form.watch("provinceName")} readOnly className="h-9 text-xs bg-muted/30 cursor-not-allowed" />
                                <input type="hidden" {...form.register("provinceId")} />
                            </FormItem>
                        </div>
                    </div>
                </div>
                <StepFooter onBack={onBack} nextLabel={t("next")} />
            </form>
        </Form>
    )
}

// ─────────────────────────────────────────────────────────
// Note
// ─────────────────────────────────────────────────────────
function Step3({ onSubmit, onBack, isSubmitting, submitLabel }: {
    onSubmit: (hours: BusinessHour[]) => void
    onBack: () => void
    isSubmitting: boolean
    submitLabel?: string
}) {
    const t = useTranslations("Shop")
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
                        {t("businessHoursLabel")}
                    </p>
                    <div className="flex gap-2 text-[11px]">
                        <button
                            type="button"
                            onClick={() => setHours((prev) => prev.map((h) => ({ ...h, isOpen: true })))}
                            className="text-primary hover:underline"
                        >
                            {t("openAllDays")}
                        </button>
                        <span className="text-muted-foreground/40">|</span>
                        <button type="button" onClick={copyFirstOpen} className="text-primary hover:underline">
                            {t("copyFirstDayHours")}
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
                                    {t(day.label as any)}
                                </span>
                                {h.isOpen ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <Input type="time" value={h.openTime} onChange={(e) => update(day.value, { openTime: e.target.value })} className="h-8 text-xs w-[95px]" />
                                        <span className="text-xs text-muted-foreground">—</span>
                                        <Input type="time" value={h.closeTime} onChange={(e) => update(day.value, { closeTime: e.target.value })} className="h-8 text-xs w-[95px]" />
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground flex-1">{t("dayOff")}</span>
                                )}
                            </div>
                        )
                    })}
                </div>
                <p className="text-[11px] text-muted-foreground pt-1">{t("editHoursNote")}</p>
            </div>
            <StepFooter onBack={onBack} nextLabel={submitLabel || t("next")} isSubmitting={isSubmitting} isLastStep />
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
    const t = useTranslations("Shop")

    const { data: shopData, isLoading, refetch } = useShop()
    const { data: profile } = useProfile()

    const [open, setOpen] = React.useState(false)
    const [showDialog, setShowDialog] = React.useState(false)
    const [dialogMode, setDialogMode] = React.useState<"shop" | "branch">("shop")
    const [step, setStep] = React.useState(0)
    const [branchStep, setBranchStep] = React.useState(0) // Note
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [selectedShopId, setSelectedShopId] = React.useState<number | null>(null)
    const [selectedBranchId, setSelectedBranchId] = React.useState<number | null>(null)

    const [step1Data, setStep1Data] = React.useState<Partial<Step1Values>>({})
    const [step2Data, setStep2Data] = React.useState<Partial<Step2Values>>({})

    // Note
    React.useEffect(() => {
        const freshdata = async () => {
            if (shopData && !selectedShopId) {
                const branchselect: number | null = await storage.get("branch") || shopData.shopBranches?.[0]?.id || null;
                setSelectedShopId(shopData.id ?? null)
                setSelectedBranchId(branchselect)
            }
        }
        freshdata()
    }, [shopData, selectedShopId])

    // Listen for custom event to open dialog from other parts of the app
    React.useEffect(() => {
        const handleOpenShopDialog = () => {
            setDialogMode("shop");
            setShowDialog(true);
        };
        window.addEventListener("open-shop-dialog", handleOpenShopDialog);
        return () => window.removeEventListener("open-shop-dialog", handleOpenShopDialog);
    }, []);

    const selectedShop = shopData
    const selectedBranch = shopData?.shopBranches?.find((b) => b.id === selectedBranchId)

    const handleClose = (val: boolean) => {
        setShowDialog(val)
        if (!val) {
            setStep(0)
            setBranchStep(0)
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
                toast.success(t("createShopSuccess"))
                await refetch()
                handleClose(false)
            } else {
                toast.error(t("createShopFailed"))
            }
        } catch (err) {
            console.error(err)
            toast.error(t("createShopFailed"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBranchSubmit = async (hours: BusinessHour[]) => {
        setIsSubmitting(true)
        try {
            const payload: AddShop = {
                shopname: shopData?.name ?? "",
                shoptype: shopData?.type ?? "",
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

            const res = await http.post<ShopResponse>("newbranch", payload)

            if (res != null) {
                toast.success(t("addBranchSuccess"))
                await refetch()
                handleClose(false)
            } else {
                toast.error(t("addBranchFailed"))
            }
        } catch (err) {
            console.error(err)
            toast.error(t("createShopFailed"))
        } finally {
            setIsSubmitting(false)
        }
    }

    if (config.showSwitcher === false || config.sidebar === "compact") return null
    if (isLoading)
        return <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>

    const isCollapsed = config.collapsed && !hovered

    const handleBranchSelect = async (id: number) => {
        setOpen(false)
        if (id === selectedBranchId) return;
        setSelectedBranchId(id);
        await storage.set("branch", id)
        window.location.reload();
    }

    return (
        <Dialog open={showDialog} onOpenChange={handleClose}>
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
                                variant="ghost"
                                role="combobox"
                                aria-expanded={open}
                                aria-label="Select a team"
                                className={cn(
                                    "h-12 w-12 mx-auto p-0 md:p-0 ring-offset-sidebar flex items-center justify-center transition-colors",
                                    shopData 
                                        ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" 
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted/80 hover:text-muted-foreground",
                                    className
                                )}
                            >
                                {shopData ? <Store className="h-6 w-6" /> : <Ban className="h-6 w-6 opacity-70" />}
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
                                    <div className={cn(
                                        "flex-none h-7 w-7 rounded-md flex items-center justify-center",
                                        shopData ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                                    )}>
                                        {shopData ? <Store className="h-4 w-4" /> : <Ban className="h-4 w-4 opacity-70" />}
                                    </div>
                                    <div className="flex-1 text-start w-[100px]">
                                        <div className="text-sm font-semibold text-default-900 truncate">
                                            {selectedShop?.name ?? t('noShop')}
                                        </div>
                                        <div className="text-xs font-normal text-default-500 dark:text-default-700 truncate flex items-center gap-1">
                                            <GitBranch className="h-2.5 w-2.5 flex-shrink-0" />
                                            {selectedBranch?.name ?? t('noBranch')}
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
                                <div className="h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                        <Store className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted-foreground leading-none mb-0.5">{t("myShop")}</p>
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
                                        {t("selectBranch")}
                                    </p>
                                </div>
                                <CommandList className="max-h-40">
                                    <CommandGroup>
                                        {shopData.shopBranches.map((branch) => (
                                            <CommandItem
                                                key={branch.id}
                                                onSelect={() => { handleBranchSelect(branch.id) }}
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
                                {/* Section */}
                                {profile?.role === "Admin" && (
                                    shopData ? (
                                        <CommandItem
                                            onSelect={() => { setOpen(false); setDialogMode("branch"); setShowDialog(true) }}
                                            className="text-sm gap-2 text-primary font-medium mx-1 rounded-md my-1"
                                        >
                                            <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                                                <GitBranch className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                            {t("addNewBranch")}
                                        </CommandItem>
                                    ) : (
                                        <CommandItem
                                            onSelect={() => { setOpen(false); setDialogMode("shop"); setShowDialog(true) }}
                                            className="text-sm gap-2 text-primary font-medium mx-1 rounded-md my-1"
                                        >
                                            <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                                                <CirclePlus className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                            {t("addNewShop")}
                                        </CommandItem>
                                    )
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
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            <Store className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-sm font-semibold leading-tight">
                                {dialogMode === "branch" ? t("addNewBranch") : t("createNewShop")}
                            </DialogTitle>
                            <DialogDescription className="text-[11px] mt-0.5">
                                {dialogMode === "branch"
                                    ? branchStep === 0 ? t("branchDetailAndAddress")
                                        : t("branchOperatingHours")
                                    : step === 0 ? t("basicShopInfo")
                                        : step === 1 ? t("firstBranchInfo")
                                            : t("setInitialHours")
                                }
                            </DialogDescription>
                        </div>
                    </div>
                    {/* Section */}
                    {dialogMode === "shop" && <StepIndicator current={step} />}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={dialogMode === "branch" ? `branch-${branchStep}` : step}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                    >
                        {/* Section */}
                        {dialogMode === "branch" && branchStep === 0 && (
                            <Step2
                                saved={step2Data}
                                onNext={(v) => { setStep2Data(v); setBranchStep(1) }}
                                onBack={() => handleClose(false)}
                            />
                        )}

                        {/* Section */}
                        {dialogMode === "branch" && branchStep === 1 && (
                            <Step3
                                onSubmit={handleBranchSubmit}
                                onBack={() => setBranchStep(0)}
                                isSubmitting={isSubmitting}
                                submitLabel={t("addBranch")}
                            />
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
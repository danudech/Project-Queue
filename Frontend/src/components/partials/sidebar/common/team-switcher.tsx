"use client"

import * as React from "react"
import { ChevronsUpDown, Check, CirclePlus, Phone, Briefcase, Store, Loader2 } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useConfig } from "@/hooks/use-config";
import { useMediaQuery } from "@/hooks/use-media-query";
import { motion } from "framer-motion";
import { useMenuHoverConfig } from "@/hooks/use-menu-hover";
import { useProfile, useShop } from "@/hooks/use-me";

// 1. กำหนด Schema สำหรับการ Validate
const formSchema = z.object({
    name: z.string().min(2, "ชื่อร้านต้องมีความยาวอย่างน้อย 2 ตัวอักษร"),
    type: z.string().min(1, "กรุณาเลือกประเภทธุรกิจ"),
    phone: z.string().regex(/^[0-9+\-\s()]*$/, "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง").optional().or(z.string().length(0)),
});

type FormValues = z.infer<typeof formSchema>;

const groups = [
    {
        label: "Personal Account",
        teams: [{ label: "Designing Workspace", value: "personal" }],
    },
    {
        label: "Teams",
        teams: [
            { label: "Core Workspace", value: "acme-inc" },
            { label: "Dev.Workspace", value: "monsters" },
        ],
    },
]

type Team = (typeof groups)[number]["teams"][number]

export default function TeamSwitcher({ className }: { className?: string }) {
    const [config] = useConfig();
    const [hoverConfig] = useMenuHoverConfig();
    const { hovered } = hoverConfig;
    const [open, setOpen] = React.useState(false)
    const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false)
    const [selectedTeam, setSelectedTeam] = React.useState<Team>(groups[0].teams[0])
    
    const { data, isLoading } = useProfile();
    const { data: shopData, isLoading: isShopLoading } = useShop();

    // 2. Setup Form ด้วย React Hook Form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "",
            phone: "",
        },
    });

    const onSubmit = (values: FormValues) => {
        console.log("Form Submitted:", values);
        // จำลองการโหลดหรือส่งข้อมูล
        setTimeout(() => {
            setShowNewTeamDialog(false);
            form.reset();
        }, 1000);
    };

    if (config.showSwitcher === false || config.sidebar === 'compact') return null
    if (isLoading || isShopLoading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-5 w-5" /></div>;

    return (
        <Dialog open={showNewTeamDialog} onOpenChange={(val) => {
            setShowNewTeamDialog(val);
            if (!val) form.reset(); // Reset form เมื่อปิด dialog
        }}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <motion.div
                        key={(config.collapsed && !hovered) ? "collapsed" : "expanded"}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        {/* ส่วน Switcher Button (คงเดิมตาม Logic คุณ) */}
                        {(config.collapsed && !hovered) ? (
                            <Button
                                variant="outline"
                                color="secondary"
                                className={cn("h-14 w-14 mx-auto p-0 dark:border-secondary", className)}
                            >
                                <Avatar>
                                    <AvatarImage src={data?.profilePictureUrl} className="grayscale" />
                                    <AvatarFallback>{data?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                color="secondary"
                                className={cn("h-auto py-3 px-3 justify-start dark:border-secondary w-full", className)}
                            >
                                <div className="flex gap-2 flex-1 items-center overflow-hidden">
                                    <Avatar className="h-9 w-9 flex-none">
                                        <AvatarImage src={data?.profilePictureUrl} className="grayscale" />
                                        <AvatarFallback>{data?.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-start overflow-hidden">
                                        <div className="text-sm font-semibold text-default-900 truncate">ร้านค้า/บริการ</div>
                                        <div className="text-xs font-normal text-default-500 truncate">{selectedTeam.label}</div>
                                    </div>
                                    <ChevronsUpDown className="h-4 w-4 shrink-0 text-default-500" />
                                </div>
                            </Button>
                        )}
                    </motion.div>
                </PopoverTrigger>
                
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandList>
                            {groups.map((group) => (
                                <CommandGroup key={group.label} heading={group.label}>
                                    {group.teams.map((team) => (
                                        <CommandItem
                                            key={team.value}
                                            onSelect={() => {
                                                setSelectedTeam(team);
                                                setOpen(false);
                                            }}
                                            className="text-sm"
                                        >
                                            {team.label}
                                            <Check className={cn("ml-auto h-4 w-4", selectedTeam.value === team.value ? "opacity-100" : "opacity-0")} />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ))}
                        </CommandList>
                        <CommandSeparator />
                        <CommandList>
                            <CommandGroup>
                                <CommandItem onSelect={() => { setOpen(false); setShowNewTeamDialog(true); }}>
                                    <CirclePlus className="mr-2 h-4 w-4" />
                                    Create Team
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>ข้อมูลร้านค้า</DialogTitle>
                    <DialogDescription>เพิ่มร้านค้าใหม่เพื่อจัดการสินค้าและลูกค้า</DialogDescription>
                </DialogHeader>

                {/* 3. นำ Form มาครอบ Input ต่างๆ */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
                        
                        {/* ชื่อร้านค้า */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-slate-700">
                                        <Store className="w-4 h-4 text-indigo-500" />
                                        ชื่อร้านค้า <span className="text-rose-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="เช่น คลินิกสุขภาพดี, ร้านตัดผม The Cut" {...field} className="h-11 rounded-lg" />
                                    </FormControl>
                                    <p className="text-[11px] text-slate-400">ชื่อที่ลูกค้าจะเห็นเมื่อมาจองคิว</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ประเภทธุรกิจ */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-slate-700">
                                        <Briefcase className="w-4 h-4 text-indigo-500" />
                                        ประเภทธุรกิจ <span className="text-rose-500">*</span>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-11 rounded-lg">
                                                <SelectValue placeholder="เลือกประเภทธุรกิจ" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="clinic">🏥 คลินิก / สุขภาพ</SelectItem>
                                            <SelectItem value="salon">✂️ เสริมสวย / ตัดผม</SelectItem>
                                            <SelectItem value="restaurant">☕ ร้านอาหาร / คาเฟ่</SelectItem>
                                            <SelectItem value="other">✨ อื่นๆ</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                    <FormLabel className="flex items-center gap-2 text-slate-700">
                                        <Phone className="w-4 h-4 text-indigo-500" />
                                        เบอร์โทรศัพท์ร้าน
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="02-XXX-XXXX หรือ 081-XXX-XXXX" {...field} className="h-11 rounded-lg" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setShowNewTeamDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                                Continue
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
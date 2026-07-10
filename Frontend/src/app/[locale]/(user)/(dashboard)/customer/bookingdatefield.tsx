"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay, getDay } from "date-fns"
import { th } from "date-fns/locale"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { Control, FieldValues, Path } from "react-hook-form"

// ─── Inline Calendar ──────────────────────────────────────────────────────────

const DAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]

interface InlineCalendarProps {
    selected?: Date
    onSelect: (date: Date) => void
    disabled?: (date: Date) => boolean
}

function InlineCalendar({ selected, onSelect, disabled }: InlineCalendarProps) {
    const [viewDate, setViewDate] = React.useState(selected ?? new Date())

    const days = React.useMemo(() => {
        const start = startOfMonth(viewDate)
        const end = endOfMonth(viewDate)
        return eachDayOfInterval({ start, end })
    }, [viewDate])

    // leading empty cells to align first day
    const leadingBlanks = getDay(startOfMonth(viewDate))

    return (
        <div className="w-full select-none">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
                <button
                    type="button"
                    onClick={() => setViewDate(subMonths(viewDate, 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold">
                    {format(viewDate, "MMMM yyyy", { locale: th })}
                </span>
                <button
                    type="button"
                    onClick={() => setViewDate(addMonths(viewDate, 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
                {DAYS_TH.map((d, i) => (
                    <div
                        key={d}
                        className={cn(
                            "text-center text-[11px] font-medium py-1",
                            i === 0 ? "text-rose-400" : "text-muted-foreground"
                        )}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Date grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
                {/* Leading blanks */}
                {Array.from({ length: leadingBlanks }).map((_, i) => (
                    <div key={`blank-${i}`} />
                ))}

                {days.map((day) => {
                    const isSelected = selected ? isSameDay(day, selected) : false
                    const isDisabled = disabled?.(day) ?? false
                    const isToday = isSameDay(day, new Date())
                    const isSunday = getDay(day) === 0

                    return (
                        <button
                            key={day.toISOString()}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => !isDisabled && onSelect(day)}
                            className={cn(
                                "relative h-8 w-full flex items-center justify-center rounded-lg text-sm transition-all",
                                isSelected && "bg-primary text-primary-foreground font-semibold shadow-sm",
                                !isSelected && !isDisabled && "hover:bg-muted",
                                !isSelected && isToday && "font-semibold text-primary ring-1 ring-primary/30",
                                isDisabled && "opacity-30 cursor-not-allowed",
                                !isSelected && isSunday && !isDisabled && "text-rose-400",
                            )}
                        >
                            {format(day, "d")}
                            {isToday && !isSelected && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// ─── FormField wrapper ────────────────────────────────────────────────────────

interface BookingDateFieldProps<TFieldValues extends FieldValues> {
    control: Control<TFieldValues>
    name: Path<TFieldValues>
}

export function BookingDateField<TFieldValues extends FieldValues>({
    control,
    name,
}: BookingDateFieldProps<TFieldValues>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        วันที่นัดหมาย
                        {field.value && (
                            <span className="ml-auto text-xs font-normal text-primary">
                                {format(field.value, "d MMM yyyy", { locale: th })}
                            </span>
                        )}
                    </FormLabel>
                    <FormControl>
                        <div className="rounded-xl border bg-background p-3 shadow-sm">
                            <InlineCalendar
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                    isBefore(startOfDay(date), startOfDay(new Date()))
                                }
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
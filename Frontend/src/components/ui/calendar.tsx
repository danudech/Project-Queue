"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0 border-default-200 dark:border-default-300 md:p-3", className)}
      classNames={{
        months: "w-full  space-y-4 sm:gap-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center py-1 relative items-center",
        caption_label: "text-base font-medium",
        nav: "gap-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        button_next: cn(buttonVariants({ variant: "outline", size: "icon" }), "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"),

        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "flex-1 text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full gap-1 mt-2",
        day: "flex-1 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-default [&:has([aria-selected])]:rounded-md focus-within:relative focus-within:z-20",
        day_button: "w-full h-9 rounded  p-0 font-normal aria-selected:opacity-100 bg-transparent text-current hover:text-default",
        selected:
          "bg-default text-default-foreground hover:bg-default hover:text-default-foreground focus:bg-default focus:text-default-foreground",
        today: "bg-accent text-accent-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => orientation === "left" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

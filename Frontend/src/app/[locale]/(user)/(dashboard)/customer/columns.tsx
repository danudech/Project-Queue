"use client"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { ColumnDef } from "@tanstack/react-table"
import { SquarePen, Trash2, Power, History } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CustomerType } from "@/types/shop/customer"

export const getColumns = (t: any, tc: any): ColumnDef<CustomerType>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="text-default-400 text-sm">{row.getValue("id")}</span>
    ),
  },
  {
    accessorKey: "name",
    header: t("columns.name"),
    cell: ({ row }) => {
      const notes = row.original.notes
      const latestNote = notes && notes.length > 0 ? notes[notes.length - 1].note : null
      return (
        <div>
          <span className="font-medium text-default-900">{row.getValue("name")}</span>
          {latestNote && (
            <div className="mt-1 max-w-56 truncate text-xs text-amber-700 dark:text-amber-300 font-medium">
              📝 {latestNote}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "phone",
    header: t("columns.phone"),
    cell: ({ row }) => (
      <span className="text-default-600 text-sm">{row.getValue("phone")}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: tc("columns.status"),
    cell: ({ row, table }) => {
      const active = row.getValue("isActive") as boolean
      const meta = table.options.meta as any

      return (
        <Badge
          color={active ? "success" : "destructive"}
          className={cn(
            "capitalize",
            meta?.canManage && "cursor-pointer hover:opacity-80",
          )}
          onClick={() => meta?.canManage && meta?.toggleStatus(row.original)}
        >
          {active ? tc("status.active") : tc("status.inactive")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: t("columns.createdAt"),
    cell: ({ row }) => {
      const dateValue = row.getValue("createdAt") as string
      if (!dateValue) return <span className="text-default-400 text-sm">-</span>

      const date = new Date(dateValue)
      if (isNaN(date.getTime())) return <span className="text-default-400 text-sm">-</span>

      const formatted = new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(date)

      return <span className="text-default-500 text-sm">{formatted} {tc("units.timeSuffix")}</span>
    },
  },
  {
    id: "actions",
    header: tc("columns.action"),
    enableHiding: false,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any
      const isActive = row.original.isActive

      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="w-7 h-7 border-default-200 text-primary" onClick={() => meta?.openHistory(row.original)}>
                  <History className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top"><p>{t("history.title")}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Toggle Status */}
          {meta?.canManage ? <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "w-7 h-7 border-default-200 transition-colors",
                    isActive
                      ? "text-success hover:bg-success/10"
                      : "text-default-400 hover:bg-default-100"
                  )}
                  onClick={() => meta?.toggleStatus(row.original)}
                >
                  <Power className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{isActive ? tc("tooltip.deactivate") : tc("tooltip.activate")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> : null}

          {/* Edit */}
          {meta?.canManage ? <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-7 h-7 border-default-200 text-default-400"
                  onClick={() => meta?.openEdit(row.original)}
                >
                  <SquarePen className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top"><p>{tc("tooltip.edit")}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider> : null}

          {/* Delete */}
          {meta?.canManage ? <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-7 h-7 border-default-200 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm(t("confirm.delete"))) {
                      meta?.deleteRow(row.original.id)
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-destructive text-destructive-foreground">
                <p>{tc("tooltip.delete")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> : null}
        </div>
      )
    },
  },
]

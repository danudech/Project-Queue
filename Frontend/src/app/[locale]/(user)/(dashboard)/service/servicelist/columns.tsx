"use client"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { ColumnDef } from "@tanstack/react-table"
import { SquarePen, Trash2, Power } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SetService } from "@/types/shop/service"

export const columns: ColumnDef<SetService>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="text-default-400 text-sm">{row.getValue("id")}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "ชื่อบริการ",
    cell: ({ row }) => (
      <span className="font-medium text-default-900">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "duration",
    header: "ระยะเวลา",
    cell: ({ row }) => (
      <span className="text-default-600 text-sm">{row.getValue("duration")} นาที</span>
    ),
  },
  {
    accessorKey: "price",
    header: "ราคา",
    cell: ({ row }) => {
      const price = row.getValue("price") as number
      return (
        <span className="text-default-600 text-sm">
          {price.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          ฿
        </span>
      )
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row, table }) => {
      const active = row.getValue("isActive") as boolean
      const meta = table.options.meta as any

      return (
        <Badge
          color={active ? "success" : "destructive"}
          className="capitalize cursor-pointer hover:opacity-80"
          onClick={() => meta?.toggleStatus(row.original)}
        >
          {active ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <span className="text-default-500 text-sm">{row.getValue("createdAt")}</span>
    ),
  },
  {
    id: "actions",
    header: "Action",
    enableHiding: false,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any
      const isActive = row.original.isActive

      return (
        <div className="flex items-center gap-2">
          {/* Toggle Status */}
          <TooltipProvider>
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
                <p>{isActive ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Edit */}
          <TooltipProvider>
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
              <TooltipContent side="top"><p>แก้ไข</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Delete */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-7 h-7 border-default-200 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm("คุณต้องการลบบริการนี้ใช่หรือไม่?")) {
                      meta?.deleteRow(row.original.id)
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-destructive text-destructive-foreground">
                <p>ลบข้อมูล</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
  },
]
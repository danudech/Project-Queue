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
import { cn } from "@/lib/utils";
import { ServiceCategoryType } from "@/types/shop/catgory"


export const getColumns = (t: any, tc: any): ColumnDef<ServiceCategoryType>[] => [
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
    cell: ({ row }) => (
      <span className="font-medium text-default-900">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "shopName",
    header: t("columns.shop"),
    cell: ({ row }) => (
      <span className="text-default-600 text-sm">{row.getValue("shopName")}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: tc("columns.status"),
    cell: ({ row, table }) => {
      const active = row.getValue("isActive") as boolean;
      const meta = table.options.meta as any;

      return (
        <Badge
          color={active ? "success" : "destructive"}
          className="capitalize cursor-pointer hover:opacity-80"
          onClick={() => meta?.toggleStatus(row.original)}
        >
          {active ? tc("status.active") : tc("status.inactive")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: t("columns.createdAt"),
    cell: ({ row }) => {
      const dateValue = row.getValue("createdAt") as string;
      if (!dateValue) return "-";

      const date = new Date(dateValue);

      // Note
      if (isNaN(date.getTime())) return "-";

      const formattedDate = new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(date);

      return (
        <span className="text-default-500 text-sm">
          {formattedDate} {tc("units.timeSuffix")}</span>
      );
    },
  },
  {
    id: "actions",
    header: tc("columns.action"),
    enableHiding: false,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const isActive = row.original.isActive;

      return (
        <div className="flex items-center gap-2">
          {/* Section */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "w-7 h-7 border-default-200 transition-colors",
                    isActive ? "text-success hover:bg-success/10" : "text-default-400 hover:bg-default-100"
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
          </TooltipProvider>

          {/* Section */}
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
              <TooltipContent side="top"><p>{tc("tooltip.edit")}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Section */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-7 h-7 border-default-200 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm(t("confirm.delete"))) {
                      meta?.deleteRow(row.original.id);
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
          </TooltipProvider>
        </div>
      );
    },
  },
];
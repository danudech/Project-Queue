"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface TableToolbarProps {
  title: string
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  onAddClick?: () => void
  addButtonText?: string
}

export function TableToolbar({
  title,
  searchPlaceholder = "ค้นหา...",
  searchValue,
  onSearchChange,
  onAddClick,
  addButtonText = "เพิ่มข้อมูล",
}: TableToolbarProps) {
  return (
    <div className="flex items-center py-4 px-5">
      <div className="flex-1 text-xl font-medium text-default-900">{title}</div>
      <div className="flex items-center gap-3">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-64"
        />
        {onAddClick && (
          <Button onClick={onAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            {addButtonText}
          </Button>
        )}
      </div>
    </div>
  )
}
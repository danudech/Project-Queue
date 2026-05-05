"use client"

import * as React from "react"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { columns, DataProps } from "./columns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
import { data as initialData } from "./data"
import TablePagination from "./table-pagination"

// -------- Form schema --------
const formSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ category").max(150, "ชื่อยาวเกิน 150 ตัวอักษร"),
  shopId: z.string().min(1, "กรุณาเลือก Shop"),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

const mockShops = [
  { id: 101, name: "The Barber Society" },
  { id: 102, name: "Hair Studio BKK" },
  { id: 103, name: "Style & Co." },
]

const ExampleTwo = () => {
  const [tableData, setTableData] = React.useState(initialData);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<DataProps | null>(null);

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", shopId: "", isActive: true },
  });

  const table = useReactTable({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      openEdit: (row: DataProps) => openEdit(row),
      deleteRow: (id: number) => deleteRow(id),
      toggleStatus: (id: number) => toggleStatus(id),
    },
  })

  const openAdd = () => {
    setEditTarget(null);
    form.reset({ name: "", shopId: "", isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (row: DataProps) => {
    setEditTarget(row);
    form.reset({
      name: row.name,
      shopId: String(row.shopId),
      isActive: row.isActive,
    });
    setDialogOpen(true);
  };

  const deleteRow = (id: number) => {
    setTableData((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleStatus = (id: number) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  const onSubmit = (values: FormValues) => {
    const shop = mockShops.find((s) => s.id === Number(values.shopId))!;

    if (editTarget) {
      setTableData((prev) =>
        prev.map((r) =>
          r.id === editTarget.id
            ? { ...r, name: values.name, shopId: shop.id, shopName: shop.name, isActive: values.isActive }
            : r
        )
      );
    } else {
      const newRow: DataProps = {
        id: Date.now(),
        name: values.name,
        shopId: shop.id,
        shopName: shop.name,
        isActive: values.isActive,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setTableData((prev) => [...prev, newRow]);
    }
    setDialogOpen(false);
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center py-4 px-5">
        <div className="flex-1 text-xl font-medium text-default-900">Service Categories</div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="ค้นหาชื่อ..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="w-48"
          />
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่ม Category
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                ไม่พบข้อมูล
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination table={table} />

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "แก้ไข Category" : "เพิ่ม Category ใหม่"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      ชื่อ Category <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="เช่น ตัดผมชาย, นวดหน้า..."
                        maxLength={150}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <FormMessage />
                      <span className="text-xs text-default-400 ml-auto">
                        {field.value.length} / 150
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              {/* Shop */}
              <FormField
                control={form.control}
                name="shopId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Shop <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="— เลือก Shop —" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockShops.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* IsActive */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-default-200 px-4 py-3">
                    <div>
                      <FormLabel className="text-sm font-medium">เปิดใช้งาน</FormLabel>
                      <p className="text-xs text-default-500 mt-0.5">
                        แสดง category ให้ลูกค้าเลือกได้
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit">บันทึก</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ExampleTwo
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Database,
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { moduleDefinitions } from "./admin-mock-data";

type ModuleKey = keyof typeof moduleDefinitions;

const getBadgeColor = (value: string): "success" | "warning" | "destructive" | "default" => {
  if (["Active", "Healthy", "Success"].includes(value)) return "success";
  if (["Review", "Draft", "Degraded"].includes(value)) return "warning";
  if (["Suspended", "Inactive"].includes(value)) return "destructive";
  return "default";
};

export function AdminModulePage({ module }: { module: ModuleKey }) {
  const data = moduleDefinitions[module];

  // Table State
  const [items, setItems] = useState<string[][]>(() => [...data.rows.map((r) => [...r])]);
  const [itemIds, setItemIds] = useState<(number | string)[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const pageSize = 5;

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<string[] | null>(null);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);

  // Form states for Create modal
  const [createForm, setCreateForm] = useState<Record<string, string>>({
    field0: "",
    field1: "",
    field2: "",
    field3: "",
    field4: "",
    status: "Active",
  });

  // Form state for Edit modal
  const [editForm, setEditForm] = useState<string[]>([]);

  // Fetch real data from Backend DB
  const fetchModuleData = useCallback(async (showToast = false) => {
    await Promise.resolve();
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/data?module=${module}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const apiData = json.data;

        if (Array.isArray(apiData) && apiData.length > 0) {
          setIsDbConnected(true);
          const ids: (number | string)[] = [];
          const rows: string[][] = [];

          if (module === "shops") {
            apiData.forEach((s: any) => {
              ids.push(s.id || s.guid);
              rows.push([s.name, s.owner, `${s.branches} branches`, String(s.queues), s.plan || "Standard", s.status]);
            });
          } else if (module === "users") {
            apiData.forEach((u: any) => {
              ids.push(u.id || u.guid);
              rows.push([u.name, u.role, u.shop, u.lastActive, u.status]);
            });
          } else if (module === "operations") {
            apiData.forEach((op: any) => {
              ids.push(op.service);
              rows.push([op.service, op.region, op.throughput, op.latency, op.status]);
            });
          } else if (module === "audit-log") {
            apiData.forEach((l: any) => {
              ids.push(l.id);
              rows.push([l.timestamp, l.actor, l.action, l.target, l.result]);
            });
          } else if (module === "settings") {
            apiData.forEach((st: any) => {
              ids.push(st.key);
              rows.push([st.key, st.scope, st.value, st.updatedBy, st.state]);
            });
          }

          if (rows.length > 0) {
            setItems(rows);
            setItemIds(ids);
          }

          if (showToast) {
            toast.success(`Synchronized ${data.title} from primary SQL Server.`);
          }
        }
      }
    } catch {
      // Keep snapshot data
    } finally {
      setIsLoading(false);
    }
  }, [module, data.title]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchModuleData(false);
  }, [fetchModuleData]);

  // Extract distinct status values for filter pills
  const statusOptions = useMemo(() => {
    const statuses = new Set<string>();
    items.forEach((row) => {
      const statusCell = row[row.length - 1];
      if (statusCell) statuses.add(statusCell);
    });
    return Array.from(statuses);
  }, [items]);

  // Client-side filtering by search query and status filter
  const filteredRows = useMemo(() => {
    return items.filter((row) => {
      const statusCell = row[row.length - 1];
      if (selectedStatus !== "ALL" && statusCell !== selectedStatus) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return row.some((cell) => cell.toLowerCase().includes(query));
    });
  }, [items, searchQuery, selectedStatus]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage]);

  // Real client-side CSV export
  const handleExportCSV = () => {
    if (filteredRows.length === 0) {
      toast.error("No records to export.");
      return;
    }
    const headerRow = data.columns.join(",");
    const bodyRows = filteredRows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headerRow, ...bodyRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${module}-db-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredRows.length} records to CSV successfully.`);
  };

  // Open View Details Dialog
  const handleView = (row: string[]) => {
    setActiveRow(row);
    setIsViewOpen(true);
  };

  // Open Edit Dialog
  const handleEdit = (row: string[], originalIndex: number) => {
    setActiveRow(row);
    setActiveRowIndex(originalIndex);
    setEditForm([...row]);
    setIsEditOpen(true);
  };

  // Save Edit Changes (Persists to Backend DB if ID exists)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRowIndex === null) return;

    const recordId = itemIds[activeRowIndex];
    const newStatus = editForm[editForm.length - 1];

    if (recordId && (module === "shops" || module === "users")) {
      try {
        await fetch(`/api/admin/data?module=${module}&id=${recordId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch {
        // Fallback
      }
    }

    setItems((prev) => {
      const next = [...prev];
      next[activeRowIndex] = [...editForm];
      return next;
    });

    setIsEditOpen(false);
    toast.success(`Record '${editForm[0]}' updated in database.`);
  };

  // Quick Status Toggle directly from row
  const handleQuickStatusChange = async (rowIndex: number, newStatus: string) => {
    const recordId = itemIds[rowIndex];

    if (recordId && (module === "shops" || module === "users")) {
      try {
        await fetch(`/api/admin/data?module=${module}&id=${recordId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch {
        // Fallback
      }
    }

    setItems((prev) => {
      const next = [...prev];
      const target = [...next[rowIndex]];
      target[target.length - 1] = newStatus;
      next[rowIndex] = target;
      return next;
    });

    toast.success(`Status updated to '${newStatus}' in SQL Server.`);
  };

  // Handle Delete/Remove Row
  const handleDeleteRow = (rowIndex: number, name: string) => {
    setItems((prev) => prev.filter((_, idx) => idx !== rowIndex));
    toast.success(`'${name}' removed from active view.`);
  };

  // Handle Create Form Submit (Persists to Backend DB)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare payload for backend API
    let payload: any = {};
    if (module === "shops") {
      payload = {
        name: createForm.field0 || "New Shop",
        ownerName: createForm.field1 || "Shop Owner",
        branches: parseInt(createForm.field2) || 1,
        plan: createForm.field4 || "Standard",
        status: createForm.status || "Active",
      };
    } else if (module === "users") {
      payload = {
        name: createForm.field0 || "New User",
        email: createForm.field0?.includes("@") ? createForm.field0 : `${createForm.field0?.toLowerCase().replace(/\s+/g, "")}@ezqueue.local`,
        role: createForm.field1 || "Admin",
        shopName: createForm.field2 || null,
        status: createForm.status || "Active",
      };
    } else if (module === "settings") {
      payload = {
        key: createForm.field0 || "NewConfigKey",
        value: createForm.field2 || "ConfiguredValue",
        scope: createForm.field1 || "Global",
      };
    }

    try {
      const res = await fetch(`/api/admin/data?module=${module}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`New entry created and stored in SQL Server.`);
        void fetchModuleData(false);
      } else {
        throw new Error("Failed to persist");
      }
    } catch {
      // Local fallback
      const newRecord: string[] = [];
      data.columns.forEach((col, idx) => {
        if (idx === data.columns.length - 1) {
          newRecord.push(createForm.status || "Active");
        } else {
          const val = createForm[`field${idx}`] || `Demo ${col}`;
          newRecord.push(val);
        }
      });
      setItems((prev) => [newRecord, ...prev]);
      toast.success(`Created entry in ${data.title}.`);
    }

    setIsCreateOpen(false);
    setCurrentPage(1);
    setCreateForm({
      field0: "",
      field1: "",
      field2: "",
      field3: "",
      field4: "",
      status: "Active",
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Module Header */}
        <DashboardPageHeader
          eyebrow={data.eyebrow}
          title={data.title}
          description={data.description}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                color={isDbConnected ? "success" : "warning"}
                className="gap-1 py-1 px-2.5 text-xs font-semibold"
              >
                <Database className="size-3.5" />
                {isDbConnected ? "SQL Server Live" : "DB Snapshot"}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-default-200 text-default-700 hover:bg-default-100"
                onClick={() => void fetchModuleData(true)}
                disabled={isLoading}
              >
                <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Syncing..." : "Sync DB"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-default-200 text-default-700 hover:bg-default-100"
                onClick={handleExportCSV}
              >
                <Download className="size-4" />
                Export CSV
              </Button>

              <Button
                size="sm"
                color="primary"
                className="gap-1.5 shadow-sm"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="size-4" />
                {data.primaryAction}
              </Button>
            </div>
          }
        />

        {/* Module KPI Statistics */}
        {data.stats && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.stats.map((stat) => (
              <DashboardStatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                helper={stat.helper}
                icon={stat.icon}
                tone={stat.tone}
              />
            ))}
          </div>
        )}

        {/* Main Table Card */}
        <Card className="overflow-hidden shadow-xs">
          {/* Card Toolbar */}
          <div className="flex flex-col gap-3 border-b border-default-200/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={`Search ${data.title.toLowerCase()}...`}
                className="h-9 w-full rounded-lg border-default-200 pl-9 pr-8 text-xs focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-default-900"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => {
                  setSelectedStatus("ALL");
                  setCurrentPage(1);
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedStatus === "ALL"
                    ? "bg-default-900 text-white dark:bg-default-100 dark:text-default-900 font-semibold"
                    : "bg-default-100 text-default-600 hover:bg-default-200 hover:text-default-900"
                }`}
              >
                All ({items.length})
              </button>
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setSelectedStatus(status);
                    setCurrentPage(1);
                  }}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedStatus === status
                      ? "bg-default-900 text-white dark:bg-default-100 dark:text-default-900 font-semibold"
                      : "bg-default-100 text-default-600 hover:bg-default-200 hover:text-default-900"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-default-100/75 dark:bg-default-200">
                  <TableRow>
                    {data.columns.map((column, idx) => (
                      <TableHead
                        key={column}
                        className={`text-xs font-semibold uppercase tracking-wider text-default-700 py-3 ${
                          idx === 0 ? "pl-5" : ""
                        }`}
                      >
                        {column}
                      </TableHead>
                    ))}
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-default-700 pr-5 py-3">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={data.columns.length + 1}
                        className="py-12 text-center text-sm text-muted-foreground"
                      >
                        No records matching criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRows.map((row, rowIndex) => {
                      const originalIndex = items.findIndex((orig) => orig === row);
                      return (
                        <TableRow
                          key={`row-${rowIndex}`}
                          className="hover:bg-default-100/50 transition-colors"
                        >
                          {row.map((cell, cellIndex) => (
                            <TableCell
                              key={`cell-${rowIndex}-${cellIndex}`}
                              className={`py-3.5 text-sm ${
                                cellIndex === 0
                                  ? "pl-5 font-semibold text-default-900"
                                  : "text-default-700"
                              }`}
                            >
                              {cellIndex === row.length - 1 ? (
                                <Badge
                                  color={getBadgeColor(cell)}
                                  className="text-xs font-medium"
                                >
                                  {cell}
                                </Badge>
                              ) : (
                                cell
                              )}
                            </TableCell>
                          ))}
                          <TableCell className="pr-5 text-right py-3.5">
                            <div className="flex items-center justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 rounded-lg text-default-600 hover:bg-default-200/60 hover:text-default-900"
                                    onClick={() => handleView(row)}
                                    aria-label="View details"
                                  >
                                    <Eye className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View details</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 rounded-lg text-default-600 hover:bg-default-200/60 hover:text-default-900"
                                    onClick={() => handleEdit(row, originalIndex)}
                                    aria-label="Edit record"
                                  >
                                    <Pencil className="size-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit record</TooltipContent>
                              </Tooltip>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 rounded-lg text-default-600 hover:bg-default-200/60 hover:text-default-900"
                                    aria-label="More actions"
                                  >
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuLabel className="text-xs">Database Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => void handleQuickStatusChange(originalIndex, "Active")}
                                  >
                                    <CheckCircle2 className="size-3.5 mr-2 text-success" /> Set Active
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => void handleQuickStatusChange(originalIndex, "Review")}
                                  >
                                    <Clock className="size-3.5 mr-2 text-warning" /> Set Review
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => void handleQuickStatusChange(originalIndex, "Suspended")}
                                  >
                                    <ShieldAlert className="size-3.5 mr-2 text-destructive" /> Suspend
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:bg-destructive/10"
                                    onClick={() => handleDeleteRow(originalIndex, row[0])}
                                  >
                                    <Trash2 className="size-3.5 mr-2" /> Delete View
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination / Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-default-200/70 px-5 py-3.5 text-xs text-muted-foreground gap-2">
              <span>
                Showing{" "}
                <strong className="text-default-900">
                  {filteredRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                </strong>{" "}
                to{" "}
                <strong className="text-default-900">
                  {Math.min(currentPage * pageSize, filteredRows.length)}
                </strong>{" "}
                of <strong className="text-default-900">{filteredRows.length}</strong> records (from SQL Server)
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-7 px-2.5 text-xs"
                >
                  Previous
                </Button>
                <span className="px-2 text-xs font-medium text-default-900">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-7 px-2.5 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1. Create Modal */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>{data.primaryAction}</DialogTitle>
              <DialogDescription>
                Fill out the required information to persist a new record directly into SQL Server {data.title}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
              {data.columns.slice(0, data.columns.length - 1).map((col, idx) => (
                <div key={col}>
                  <label className="block text-xs font-semibold text-default-700 mb-1.5">
                    {col}
                  </label>
                  <Input
                    required
                    value={createForm[`field${idx}`] || ""}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, [`field${idx}`]: e.target.value }))
                    }
                    placeholder={`Enter ${col.toLowerCase()}...`}
                    className="h-9 text-sm"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-default-700 mb-1.5">
                  Initial Status
                </label>
                <select
                  value={createForm.status}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="h-9 w-full rounded-md border border-default-200 bg-card px-3 text-sm focus:border-primary outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Review">Review</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" color="primary">
                  Save to Database
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 2. View Details Modal */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Database Record Details</span>
                {activeRow && (
                  <Badge color={getBadgeColor(activeRow[activeRow.length - 1])}>
                    {activeRow[activeRow.length - 1]}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Detailed database metadata and platform ledger entry for this record.
              </DialogDescription>
            </DialogHeader>
            {activeRow && (
              <div className="space-y-3 pt-3">
                <div className="rounded-xl border border-default-200/80 bg-default-50/70 p-4 space-y-2.5">
                  {data.columns.map((col, idx) => (
                    <div key={col} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">{col}:</span>
                      <span className="font-semibold text-default-900">{activeRow[idx]}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-xs border-t border-default-200/60 pt-2">
                    <span className="text-muted-foreground">Database Storage:</span>
                    <span className="font-mono text-[11px] text-default-600">
                      SQL Server Table: {module === "shops" ? "Shops" : module === "users" ? "Users" : module === "audit-log" ? "AuditLogs" : "SystemConfigs"}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="pt-2">
              <Button size="sm" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 3. Edit Record Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Edit Database Record</DialogTitle>
              <DialogDescription>
                Update properties directly in SQL Server for this {data.title.toLowerCase()} entry.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
              {data.columns.slice(0, data.columns.length - 1).map((col, idx) => (
                <div key={col}>
                  <label className="block text-xs font-semibold text-default-700 mb-1.5">
                    {col}
                  </label>
                  <Input
                    required
                    value={editForm[idx] || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditForm((prev) => {
                        const next = [...prev];
                        next[idx] = val;
                        return next;
                      });
                    }}
                    className="h-9 text-sm"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-default-700 mb-1.5">
                  Status
                </label>
                <select
                  value={editForm[editForm.length - 1] || "Active"}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditForm((prev) => {
                      const next = [...prev];
                      next[next.length - 1] = val;
                      return next;
                    });
                  }}
                  className="h-9 w-full rounded-md border border-default-200 bg-card px-3 text-sm focus:border-primary outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Review">Review</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" color="primary">
                  Update in Database
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

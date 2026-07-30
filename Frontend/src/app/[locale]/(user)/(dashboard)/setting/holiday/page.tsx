"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CloudDownload,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { http } from "@/lib/http/client";
import { useShop } from "@/hooks/use-me";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Holiday = {
  id: number;
  name: string;
  date: string;
};

type SyncedHoliday = {
  date: string;
  name: string;
  type: "government";
};

type HolidaySyncResponse = {
  type: "government";
  year: number;
  items: SyncedHoliday[];
  source: string;
  sourceUrl: string;
  fetchedAt: string;
};

const emptyForm = {
  name: "",
  date: "",
};

const PAGE_SIZE = 10;

const SettingHolidayPage = () => {
  const t = useTranslations("HolidaySettings");
  const locale = useLocale();
  const { data: shopData } = useShop();
  const { can } = usePermissions();
  const canEditSettings = can("setting.edit");
  const branchId = shopData?.shopBranches?.[0]?.id;
  const currentYear = new Date().getFullYear();

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncYear, setSyncYear] = useState(String(currentYear));
  const [syncData, setSyncData] = useState<HolidaySyncResponse | null>(null);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedHolidayIds, setSelectedHolidayIds] = useState<Set<number>>(
    new Set(),
  );
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState(emptyForm);

  const fetchHolidays = useCallback(async () => {
    if (!branchId) return;
    try {
      const response = await http.get<Holiday[]>("holidays", {
        params: { branchId },
      });
      if (response) setHolidays(response);
    } catch (error: any) {
      toast.error(error.message || t("messages.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [branchId, t]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const existingDates = useMemo(
    () => new Set(holidays.map((holiday) => holiday.date)),
    [holidays],
  );

  const syncItems = useMemo(
    () =>
      (syncData?.items ?? []).map((item) => ({
        ...item,
        duplicate: existingDates.has(item.date),
      })),
    [existingDates, syncData],
  );

  const duplicateCount = syncItems.filter((item) => item.duplicate).length;
  const importableCount = syncItems.length - duplicateCount;

  const filteredHolidays = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return holidays;
    return holidays.filter((item) =>
      [item.name, item.date].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );
  }, [holidays, query]);

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const sortedHolidays = useMemo(
    () =>
      filteredHolidays.slice().sort((a, b) => {
        const aIsUpcoming = a.date >= today;
        const bIsUpcoming = b.date >= today;

        if (aIsUpcoming !== bIsUpcoming) return aIsUpcoming ? -1 : 1;
        return aIsUpcoming
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      }),
    [filteredHolidays, today],
  );
  const totalPages = Math.max(1, Math.ceil(sortedHolidays.length / PAGE_SIZE));
  const activePage = Math.min(currentPage, totalPages);
  const firstVisibleIndex = (activePage - 1) * PAGE_SIZE;
  const visibleHolidays = sortedHolidays.slice(
    firstVisibleIndex,
    firstVisibleIndex + PAGE_SIZE,
  );
  const selectableVisibleHolidays = visibleHolidays.filter(
    (item) => item.date >= today,
  );
  const visibleFrom = sortedHolidays.length === 0 ? 0 : firstVisibleIndex + 1;
  const visibleTo = Math.min(
    firstVisibleIndex + PAGE_SIZE,
    sortedHolidays.length,
  );
  const allVisibleSelected =
    selectableVisibleHolidays.length > 0 &&
    selectableVisibleHolidays.every((item) => selectedHolidayIds.has(item.id));
  const someVisibleSelected = selectableVisibleHolidays.some((item) =>
    selectedHolidayIds.has(item.id),
  );
  const nextHoliday = holidays
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .find((item) => item.date >= today);
  const previousHoliday = holidays
    .filter((item) => item.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "full",
      timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`));
  const formatNumericDate = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const openSync = () => {
    setSyncData(null);
    setSelectedDates(new Set());
    setSyncOpen(true);
  };

  const syncHolidays = async () => {
    setIsSyncing(true);
    try {
      const response = await http.get<HolidaySyncResponse>("holidaySync", {
        params: {
          type: "government",
          year: syncYear,
          locale,
        },
      });
      setSyncData(response);
      setSelectedDates(
        new Set(
          response.items
            .filter((item) => !existingDates.has(item.date))
            .map((item) => item.date),
        ),
      );
    } catch (error: any) {
      toast.error(error.message || t("messages.syncError"));
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleDate = (date: string, checked: boolean) => {
    setSelectedDates((current) => {
      const next = new Set(current);
      if (checked) next.add(date);
      else next.delete(date);
      return next;
    });
  };

  const toggleVisibleHolidays = (checked: boolean) => {
    setSelectedHolidayIds((current) => {
      const next = new Set(current);
      selectableVisibleHolidays.forEach((item) => {
        if (checked) next.add(item.id);
        else next.delete(item.id);
      });
      return next;
    });
  };

  const toggleHolidaySelection = (id: number, checked: boolean) => {
    setSelectedHolidayIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const importHolidays = async () => {
    if (!canEditSettings) return;
    if (!branchId || !syncData || selectedDates.size === 0) return;
    setIsImporting(true);

    const selectedItems = syncData.items.filter(
      (item) => selectedDates.has(item.date) && !existingDates.has(item.date),
    );
    const added: Holiday[] = [];
    let failed = 0;

    for (const item of selectedItems) {
      try {
        const response = await http.post<Holiday>("holidays", {
          branchId,
          date: item.date,
          name: item.name,
        });
        if (response) added.push(response);
      } catch {
        failed += 1;
      }
    }

    if (added.length > 0) {
      setHolidays((current) =>
        [...current, ...added].sort((a, b) => a.date.localeCompare(b.date)),
      );
      toast.success(t("messages.importSuccess", { count: added.length }));
    }
    if (failed > 0) {
      toast.error(t("messages.importPartial", { count: failed }));
    }

    setIsImporting(false);
    if (failed === 0) setSyncOpen(false);
  };

  const addHoliday = async () => {
    if (!canEditSettings) return;
    if (!form.name || !form.date || !branchId) return;
    if (existingDates.has(form.date)) {
      toast.error(t("messages.duplicateDate"));
      return;
    }

    setIsSaving(true);
    try {
      const response = await http.post<Holiday>("holidays", {
        branchId,
        date: form.date,
        name: form.name,
      });
      if (response) {
        setHolidays((current) =>
          [...current, response].sort((a, b) => a.date.localeCompare(b.date)),
        );
        toast.success(t("messages.addSuccess"));
        setForm(emptyForm);
        setDialogOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || t("messages.addError"));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteHoliday = async () => {
    if (!canEditSettings) return;
    if (!holidayToDelete) return;
    setIsDeleting(true);
    try {
      await http.delete("holidays", {
        params: { holidayId: holidayToDelete.id },
      });
      setHolidays((current) =>
        current.filter((item) => item.id !== holidayToDelete.id),
      );
      setSelectedHolidayIds((current) => {
        const next = new Set(current);
        next.delete(holidayToDelete.id);
        return next;
      });
      toast.success(t("messages.deleteSuccess"));
      setHolidayToDelete(null);
    } catch (error: any) {
      toast.error(error.message || t("messages.deleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-default-900">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={openSync} className="gap-2" disabled={!canEditSettings}>
            <CloudDownload className="h-4 w-4" />
            {t("syncGovernment")}
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="gap-2" disabled={!canEditSettings}>
            <Plus className="h-4 w-4" />
            {t("add")}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-5 xl:grid-cols-[1.1fr_repeat(3,minmax(0,1fr))]">
            <div className="flex min-h-32 items-center gap-4 px-1">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalendarDays className="h-9 w-9" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-default-600">{t("eyebrow")}</p>
                <h2 className="mt-1 text-xl font-medium text-default-900">
                  {t("overviewTitle")}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("overviewDescription")}
                </p>
              </div>
            </div>

            <div className="flex min-h-32 flex-col justify-center rounded-lg bg-default-50 p-4">
              <p className="text-sm font-medium text-default-700">
                {t("totalHolidays")}
              </p>
              <p className="mt-1 text-xl font-semibold text-default-900">
                {holidays.length}
              </p>
            </div>

            <div className="flex min-h-32 flex-col justify-center rounded-lg bg-default-50 p-4">
              <p className="text-sm font-medium text-default-700">
                {t("previousHolidays")}
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-default-900">
                {previousHoliday
                  ? formatNumericDate(previousHoliday.date)
                  : t("stats.noPreviousDate")}
              </p>
              {previousHoliday && (
                <p className="mt-1 max-w-[90%] truncate text-xs text-muted-foreground">
                  {previousHoliday.name}
                </p>
              )}
            </div>

            <div className="flex min-h-32 flex-col justify-center rounded-lg bg-default-50 p-4">
              <p className="text-sm font-medium text-default-700">
                {t("nextHoliday")}
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-default-900">
                {nextHoliday
                  ? formatNumericDate(nextHoliday.date)
                  : t("stats.noNextDate")}
              </p>
              {nextHoliday && (
                <p className="mt-1 max-w-[70%] truncate text-xs text-muted-foreground">
                  {nextHoliday.name}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
          <div className="flex-1 text-xl font-medium text-default-900">
            {t("listTitle")}
          </div>
          <div className="relative w-full sm:ml-auto sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder={t("search")}
              className="pl-9"
            />
          </div>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
              {t("loading")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-default-200">
                  <TableRow>
                    <TableHead className="w-16 px-7">
                      <Checkbox
                        checked={
                          allVisibleSelected ||
                          (someVisibleSelected && "indeterminate")
                        }
                        onCheckedChange={(checked) =>
                          toggleVisibleHolidays(checked === true)
                        }
                        disabled={selectableVisibleHolidays.length === 0}
                        aria-label={t("table.selectAll")}
                      />
                    </TableHead>
                    <TableHead className="w-20 text-xs font-semibold uppercase tracking-wide">
                      {t("table.number")}
                    </TableHead>
                    <TableHead className="w-40 whitespace-nowrap text-xs font-semibold uppercase tracking-wide">
                      {t("table.date")}
                    </TableHead>
                    <TableHead className="min-w-[22rem] text-xs font-semibold uppercase tracking-wide">
                      {t("table.title")}
                    </TableHead>
                    <TableHead className="w-44 text-xs font-semibold uppercase tracking-wide">
                      {t("table.status")}
                    </TableHead>
                    <TableHead className="w-28 text-xs font-semibold uppercase tracking-wide">
                      {t("table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleHolidays.map((item, index) => {
                    const isUpcoming = item.date >= today;
                    return (
                      <TableRow
                        key={item.id}
                        data-state={
                          selectedHolidayIds.has(item.id)
                            ? "selected"
                            : undefined
                        }
                        aria-disabled={!isUpcoming}
                        className={cn(
                          "transition-colors",
                          isUpcoming
                            ? "hover:bg-default-200 dark:hover:bg-default-300"
                            : "cursor-not-allowed bg-default-50/80 text-default-400 hover:bg-default-100 dark:bg-default-200/30 dark:hover:bg-default-300/50",
                        )}
                      >
                        <TableCell className="px-7">
                          <Checkbox
                            checked={selectedHolidayIds.has(item.id)}
                            disabled={!isUpcoming}
                            onCheckedChange={(checked) =>
                              toggleHolidaySelection(item.id, checked === true)
                            }
                            aria-label={t("table.selectRow", {
                              name: item.name,
                            })}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {firstVisibleIndex + index + 1}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "whitespace-nowrap font-semibold tabular-nums",
                            isUpcoming
                              ? "text-default-900"
                              : "text-default-400",
                          )}
                        >
                          {formatNumericDate(item.date)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "font-medium",
                            isUpcoming
                              ? "text-default-700"
                              : "text-default-400",
                          )}
                        >
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            rounded="full"
                            className={cn(
                              "min-w-[100px] justify-center whitespace-nowrap border-transparent px-5 py-1 font-normal",
                              isUpcoming
                                ? "bg-success/20 text-success"
                                : "bg-default-200 text-default-600",
                            )}
                          >
                            {t(isUpcoming ? "table.upcoming" : "table.past")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setHolidayToDelete(item)}
                                    disabled={!canEditSettings || !isUpcoming}
                                    aria-label={t("deleteAria", {
                                      name: item.name,
                                    })}
                                    className="h-7 w-7 border-default-200 text-default-400 ring-offset-transparent hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive dark:border-default-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  <p>{t("delete")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {visibleHolidays.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-40 text-center text-muted-foreground"
                      >
                        {t("empty")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {!isLoading && sortedHolidays.length > 0 && (
            <div className="flex flex-col gap-3 px-10 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedHolidayIds.size > 0
                  ? t("pagination.selected", {
                      selected: selectedHolidayIds.size,
                      total: sortedHolidays.length,
                    })
                  : t("pagination.showing", {
                      from: visibleFrom,
                      to: visibleTo,
                      total: sortedHolidays.length,
                    })}
              </p>
              <div className="flex flex-none items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={activePage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  aria-label={t("pagination.previous")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  return (
                    <Button
                      key={page}
                      size="icon"
                      variant={page === activePage ? "default" : "outline"}
                      className={cn(
                        "h-8 w-8",
                        page !== activePage &&
                          "border-default-200 bg-default-100 text-default-700",
                      )}
                      onClick={() => setCurrentPage(page)}
                      aria-label={t("pagination.page", {
                        page,
                        total: totalPages,
                      })}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={activePage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  aria-label={t("pagination.next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(holidayToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setHolidayToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {holidayToDelete
                ? t("deleteDialog.description", {
                    name: holidayToDelete.name,
                    date: formatNumericDate(holidayToDelete.date),
                  })
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void deleteHoliday();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting
                ? t("deleteDialog.deleting")
                : t("deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("addDialog.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                {t("addDialog.name")}
              </label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder={t("addDialog.namePlaceholder")}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                {t("addDialog.date")}
              </label>
              <Input
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={addHoliday}
              disabled={!canEditSettings || !form.name || !form.date || isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={syncOpen} onOpenChange={setSyncOpen}>
        <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CloudDownload className="h-5 w-5" />
              {t("syncDialog.governmentTitle")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-hidden">
            <div className="flex flex-col gap-3 rounded-lg border bg-default-50 p-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {t("syncDialog.year")}
                </label>
                <Select
                  value={syncYear}
                  onValueChange={setSyncYear}
                  disabled={isSyncing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentYear - 1, currentYear, currentYear + 1].map(
                      (year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={syncHolidays}
                disabled={isSyncing}
                className="gap-2"
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CloudDownload className="h-4 w-4" />
                )}
                {isSyncing ? t("syncDialog.syncing") : t("syncDialog.fetch")}
              </Button>
            </div>

            {!syncData && !isSyncing && (
              <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed px-6 text-center">
                <CloudDownload className="h-9 w-9 text-muted-foreground/60" />
                <p className="mt-3 font-medium">{t("syncDialog.emptyTitle")}</p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {t("syncDialog.emptyDescription")}
                </p>
              </div>
            )}

            {isSyncing && (
              <div className="flex min-h-52 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
                {t("syncDialog.loadingSource")}
              </div>
            )}

            {syncData && !isSyncing && (
              <>
                <div className="flex flex-wrap gap-2">
                  <Badge className="border-default-200 bg-transparent text-default-700">
                    {t("syncDialog.found", { count: syncItems.length })}
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                    {t("syncDialog.new", { count: importableCount })}
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    {t("syncDialog.duplicate", { count: duplicateCount })}
                  </Badge>
                </div>

                <div className="max-h-[42vh] space-y-2 overflow-y-auto pr-1">
                  {syncItems.map((item) => (
                    <label
                      key={item.date}
                      className={cn(
                        "flex gap-3 rounded-lg border p-3 transition-colors",
                        item.duplicate
                          ? "cursor-not-allowed border-amber-200 bg-amber-50/70"
                          : "cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/40",
                      )}
                    >
                      <Checkbox
                        checked={item.duplicate || selectedDates.has(item.date)}
                        disabled={item.duplicate}
                        onCheckedChange={(checked) =>
                          toggleDate(item.date, checked === true)
                        }
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="font-medium text-default-900">
                            {item.name}
                          </p>
                          {item.duplicate && (
                            <Badge className="border-amber-300 text-amber-800">
                              <Check className="mr-1 h-3 w-3" />
                              {t("syncDialog.alreadyExists")}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatDate(item.date)}
                        </p>
                      </div>
                    </label>
                  ))}

                  {syncItems.length === 0 && (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                      {t("syncDialog.noData")}
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-900">
                  <p>
                    {t("syncDialog.source")}{" "}
                    <a
                      href={syncData.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline"
                    >
                      {syncData.source}
                    </a>
                  </p>
                  <p className="mt-1">{t("syncDialog.reviewNotice")}</p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSyncOpen(false)}
              disabled={isImporting}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={importHolidays}
              disabled={!canEditSettings || !syncData || selectedDates.size === 0 || isImporting}
              className="gap-2"
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CalendarCheck2 className="h-4 w-4" />
              )}
              {isImporting
                ? t("syncDialog.saving")
                : t("syncDialog.saveSelected", {
                    count: selectedDates.size,
                  })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingHolidayPage;

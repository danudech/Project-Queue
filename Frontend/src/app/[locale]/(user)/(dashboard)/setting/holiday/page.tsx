"use client"

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { CalendarX2, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { http } from "@/lib/http/client";
import { useShop } from "@/hooks/use-me";
import { toast } from "sonner";

type Holiday = {
  id: number;
  name: string;
  date: string;
};

const emptyForm = {
  name: "",
  date: "",
};

const SettingHolidayPage = () => {
  const t = useTranslations("Settings.holiday");
  const { data: shopData } = useShop();
  const branchId = shopData?.shopBranches?.[0]?.id;

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);

  const fetchHolidays = async () => {
    if (!branchId) return;
    try {
      const res = await http.get<Holiday[]>("holidays", { params: { branchId } });
      if (res) setHolidays(res);
    } catch (e: any) {
      toast.error(e.message || "Failed to load holidays");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [branchId]);

  const filteredHolidays = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return holidays;
    return holidays.filter((item) =>
      [item.name, item.date].some((value) => value.toLowerCase().includes(keyword))
    );
  }, [holidays, query]);

  const today = new Date().toISOString().slice(0, 10);
  const nextHoliday = holidays
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .find((item) => item.date >= today);

  const addHoliday = async () => {
    if (!form.name || !form.date || !branchId) return;
    setIsSaving(true);
    try {
      const res = await http.post<Holiday>("holidays", {
        branchId,
        date: form.date,
        name: form.name
      });
      if (res) {
        setHolidays(prev => [...prev, res]);
        toast.success("Holiday added successfully!");
        setForm(emptyForm);
        setDialogOpen(false);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to add holiday");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteHoliday = async (id: number) => {
    try {
      await http.delete("holidays", { params: { holidayId: id } });
      setHolidays((prev) => prev.filter((item) => item.id !== id));
      toast.success("Holiday deleted successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete holiday");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Shop settings</p>
            <h1 className="mt-1 text-2xl font-semibold text-default-900">Holidays</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage holiday dates for your branch.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add holiday
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarX2 className="h-4 w-4" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4">
              <p className="text-xs text-muted-foreground">Total holidays</p>
              <p className="mt-1 text-3xl font-semibold">{holidays.length}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-xs text-muted-foreground">Next holiday</p>
              <p className="mt-1 font-medium">{nextHoliday?.name ?? "No upcoming holiday"}</p>
              {nextHoliday && (
                <p className="mt-1 text-sm text-muted-foreground">{nextHoliday.date}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Holiday list</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Closed dates</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search holidays..."
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                Loading holidays...
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHolidays.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-md border border-default-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-default-900">{item.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.date}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteHoliday(item.id)}
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {filteredHolidays.length === 0 && (
                  <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                    No holidays found.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add holiday</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Holiday name</label>
              <Input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="e.g. Staff training"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Date</label>
              <Input
                type="date"
                value={form.date}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addHoliday} disabled={!form.name || !form.date || isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingHolidayPage;

"use client";

import { useEffect, useState } from "react";
import { Check, Clock, Copy, Loader2, Plus, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type BusinessHour = {
  day: string;
  shortDay: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart: string;
  breakEnd: string;
};

const mockBusinessHours: BusinessHour[] = [
  { day: "Monday", shortDay: "Mon", isOpen: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
  { day: "Tuesday", shortDay: "Tue", isOpen: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
  { day: "Wednesday", shortDay: "Wed", isOpen: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
  { day: "Thursday", shortDay: "Thu", isOpen: true, openTime: "09:00", closeTime: "18:00", breakStart: "12:00", breakEnd: "13:00" },
  { day: "Friday", shortDay: "Fri", isOpen: true, openTime: "09:00", closeTime: "19:00", breakStart: "12:00", breakEnd: "13:00" },
  { day: "Saturday", shortDay: "Sat", isOpen: true, openTime: "10:00", closeTime: "17:00", breakStart: "", breakEnd: "" },
  { day: "Sunday", shortDay: "Sun", isOpen: false, openTime: "10:00", closeTime: "17:00", breakStart: "", breakEnd: "" },
];

async function getBusinessHours(): Promise<BusinessHour[]> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return mockBusinessHours;
}

async function saveBusinessHours(_: BusinessHour[]): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return true;
}

const SettingBusinessHoursPage = () => {
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    getBusinessHours()
      .then((data) => {
        if (mounted) setHours(data);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const updateHour = <K extends keyof BusinessHour>(
    index: number,
    key: K,
    value: BusinessHour[K]
  ) => {
    setHours((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item))
    );
    setSaved(false);
  };

  const copyMondayToWeekdays = () => {
    const monday = hours[0];
    if (!monday) return;
    setHours((prev) =>
      prev.map((item, index) =>
        index > 0 && index < 5
          ? {
              ...item,
              isOpen: monday.isOpen,
              openTime: monday.openTime,
              closeTime: monday.closeTime,
              breakStart: monday.breakStart,
              breakEnd: monday.breakEnd,
            }
          : item
      )
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveBusinessHours(hours);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } finally {
      setIsSaving(false);
    }
  };

  const openDays = hours.filter((item) => item.isOpen).length;

  if (isLoading) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
        Loading business hours...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Shop settings</p>
            <h1 className="mt-1 text-2xl font-semibold text-default-900">Business hours</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Mock schedule editor for weekly opening hours and break times.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={copyMondayToWeekdays} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy Monday
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : saved ? "Saved" : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Weekly schedule</CardTitle>
            <Badge color="secondary">{openDays} open days</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {hours.map((item, index) => (
              <div
                key={item.day}
                className="grid gap-3 rounded-md border border-default-200 p-4 lg:grid-cols-[120px_1fr_auto] lg:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-default-100 text-sm font-semibold">
                    {item.shortDay}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-default-900">{item.day}</p>
                    <p className="text-xs text-muted-foreground">{item.isOpen ? "Open" : "Closed"}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Open</label>
                    <Input
                      type="time"
                      value={item.openTime}
                      disabled={!item.isOpen}
                      onChange={(event) => updateHour(index, "openTime", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Close</label>
                    <Input
                      type="time"
                      value={item.closeTime}
                      disabled={!item.isOpen}
                      onChange={(event) => updateHour(index, "closeTime", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Break start</label>
                    <Input
                      type="time"
                      value={item.breakStart}
                      disabled={!item.isOpen}
                      onChange={(event) => updateHour(index, "breakStart", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Break end</label>
                    <Input
                      type="time"
                      value={item.breakEnd}
                      disabled={!item.isOpen}
                      onChange={(event) => updateHour(index, "breakEnd", event.target.value)}
                    />
                  </div>
                </div>

                <Switch
                  checked={item.isOpen}
                  onCheckedChange={(checked) => updateHour(index, "isOpen", checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Queue rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Slot interval</label>
              <Input defaultValue="30 minutes" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Advance booking window</label>
              <Input defaultValue="14 days" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Buffer between services</label>
              <Input defaultValue="10 minutes" />
            </div>
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              These values are mock inputs for the future queue availability API.
            </div>
            <Button variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add custom rule
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingBusinessHoursPage;

"use client";

import { useEffect, useState } from "react";
import { Check, Clock, Copy, Loader2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { http } from "@/lib/http/client";
import { useShop } from "@/hooks/use-me";
import { toast } from "sonner";

type BusinessHour = {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

type QueueRules = {
  slotInterval: number;
  advanceBookingWindow: number;
  bufferBetweenServices: number;
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const defaultHours: BusinessHour[] = Array.from({ length: 7 }, (_, i) => ({
  dayOfWeek: i,
  isOpen: i >= 1 && i <= 5,
  openTime: "09:00",
  closeTime: "18:00"
}));

const defaultQueueRules: QueueRules = {
  slotInterval: 30,
  advanceBookingWindow: 14,
  bufferBetweenServices: 10
};

const SettingBusinessHoursPage = () => {
  const { data: shopData } = useShop();
  const branchId = shopData?.shopBranches?.[0]?.id;

  const [hours, setHours] = useState<BusinessHour[]>(defaultHours);
  const [queueRules, setQueueRules] = useState<QueueRules>(defaultQueueRules);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingRules, setIsSavingRules] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!branchId) {
      // If shop data is not yet loaded, wait
      return;
    }

    Promise.all([
      http.get<BusinessHour[]>("businesshours", { params: { branchId } }),
      http.get<QueueRules>("queuerules", { params: { branchId } })
    ])
      .then(([hoursRes, rulesRes]: any) => {
        if (mounted) {
          if (hoursRes && hoursRes.length > 0) {
            // Merge to ensure 7 days exist
            const merged = defaultHours.map(def => 
              hoursRes.find((r: any) => r.dayOfWeek === def.dayOfWeek) || def
            );
            setHours(merged);
          }
          if (rulesRes) {
            setQueueRules(rulesRes);
          }
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [branchId]);

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

  const updateRule = (key: keyof QueueRules, value: number) => {
    setQueueRules(prev => ({ ...prev, [key]: value }));
  };

  const copyMondayToWeekdays = () => {
    const monday = hours.find(h => h.dayOfWeek === 1);
    if (!monday) return;
    setHours((prev) =>
      prev.map((item) =>
        item.dayOfWeek >= 1 && item.dayOfWeek <= 5
          ? {
              ...item,
              isOpen: monday.isOpen,
              openTime: monday.openTime,
              closeTime: monday.closeTime,
            }
          : item
      )
    );
    setSaved(false);
  };

  const handleSave = async () => {
    if (!branchId) return;
    setIsSaving(true);
    try {
      await http.put("businesshours", {
        branchId: branchId,
        hours: hours
      });
      toast.success("Business hours updated successfully!");
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } catch (e: any) {
      toast.error(e.message || "Failed to update business hours");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRules = async () => {
    if (!branchId) return;
    setIsSavingRules(true);
    try {
      await http.put("queuerules", {
        branchId: branchId,
        ...queueRules
      });
      toast.success("Queue rules updated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update queue rules");
    } finally {
      setIsSavingRules(false);
    }
  };

  const openDays = hours.filter((item) => item.isOpen).length;

  if (isLoading) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Shop settings"
        title="Business hours & Queue rules"
        description="Configure weekly opening hours and queue behaviors for your branch."
        actions={
          <>
            <Button variant="outline" onClick={copyMondayToWeekdays} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy Monday
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : saved ? "Saved" : "Save hours"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Weekly schedule</CardTitle>
            <Badge color="secondary">{openDays} open days</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {hours.map((item, index) => (
              <div
                key={item.dayOfWeek}
                className="grid gap-3 rounded-md border border-default-200 p-4 lg:grid-cols-[120px_1fr_auto] lg:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-default-100 text-sm font-semibold">
                    {SHORT_DAY_NAMES[item.dayOfWeek]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-default-900">{DAY_NAMES[item.dayOfWeek]}</p>
                    <p className="text-xs text-muted-foreground">{item.isOpen ? "Open" : "Closed"}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
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
              <label className="mb-1 block text-xs text-muted-foreground">Slot interval (minutes)</label>
              <Input 
                type="number"
                min="5" 
                max="120"
                value={queueRules.slotInterval} 
                onChange={(e) => updateRule("slotInterval", parseInt(e.target.value) || 0)} 
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Advance booking window (days)</label>
              <Input 
                type="number"
                min="1"
                max="365"
                value={queueRules.advanceBookingWindow}
                onChange={(e) => updateRule("advanceBookingWindow", parseInt(e.target.value) || 0)} 
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Buffer between services (minutes)</label>
              <Input 
                type="number"
                min="0"
                max="60"
                value={queueRules.bufferBetweenServices}
                onChange={(e) => updateRule("bufferBetweenServices", parseInt(e.target.value) || 0)} 
              />
            </div>
            <Button onClick={handleSaveRules} disabled={isSavingRules} variant="outline" className="w-full gap-2">
              {isSavingRules ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSavingRules ? "Saving rules..." : "Save rules"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingBusinessHoursPage;

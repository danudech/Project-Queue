"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Loader2, Mail, MessageSquare, Search, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type NotificationType = "booking" | "system" | "promotion";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  channel: "email" | "sms" | "line";
  createdAt: string;
  unread: boolean;
};

const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "New booking confirmed",
    message: "Nicha Wong booked Wash & Blow for 11:00 today.",
    type: "booking",
    channel: "line",
    createdAt: "10 minutes ago",
    unread: true,
  },
  {
    id: 2,
    title: "Queue reminder sent",
    message: "Reminder was sent to Somchai Jaidee before appointment time.",
    type: "booking",
    channel: "sms",
    createdAt: "32 minutes ago",
    unread: true,
  },
  {
    id: 3,
    title: "Business hours updated",
    message: "Sunday opening hours changed to 10:00 - 18:00.",
    type: "system",
    channel: "email",
    createdAt: "Yesterday",
    unread: false,
  },
  {
    id: 4,
    title: "Campaign draft ready",
    message: "Songkran promotion message is ready for review.",
    type: "promotion",
    channel: "line",
    createdAt: "2 days ago",
    unread: false,
  },
];

async function getNotifications(): Promise<NotificationItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return mockNotifications;
}

const typeLabel: Record<NotificationType, string> = {
  booking: "Booking",
  system: "System",
  promotion: "Promotion",
};

const NotificationPage = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [settings, setSettings] = useState({
    booking: true,
    reminder: true,
    marketing: false,
  });

  useEffect(() => {
    let mounted = true;
    getNotifications()
      .then((data) => {
        if (mounted) setNotifications(data);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredNotifications = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return notifications;
    return notifications.filter((item) =>
      [item.title, item.message, item.type, item.channel].some((value) =>
        value.toLowerCase().includes(keyword)
      )
    );
  }, [notifications, query]);

  const unreadCount = notifications.filter((item) => item.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Notification center"
        title="Notifications"
        description="Review booking alerts, system updates, and message delivery mockups."
        actions={
          <Button variant="outline" onClick={markAllRead} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Inbox</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{unreadCount} unread notifications</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search notifications..."
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                Loading notifications...
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-md border border-default-200 p-4 transition-colors hover:bg-default-200 dark:hover:bg-default-300"
                  >
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      {item.channel === "email" ? (
                        <Mail className="h-4 w-4" />
                      ) : item.channel === "sms" ? (
                        <MessageSquare className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-default-900">{item.title}</p>
                        {item.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                        <Badge color="secondary">{typeLabel[item.type]}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {item.createdAt} via {item.channel.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}

                {filteredNotifications.length === 0 && (
                  <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                    No notifications found.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4" />
              Delivery settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["booking", "New booking alerts", "Notify staff when a customer creates a queue."],
              ["reminder", "Appointment reminders", "Send reminders before the appointment time."],
              ["marketing", "Marketing messages", "Allow promotional broadcast mockups."],
            ].map(([key, title, description]) => (
              <div key={key} className="flex items-center justify-between gap-4 rounded-md border p-4">
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>
                <Switch
                  checked={settings[key as keyof typeof settings]}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
            <Button className="w-full">Save mock settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationPage;

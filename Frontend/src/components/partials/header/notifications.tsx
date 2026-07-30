"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useRouter } from "@/i18n/routing";
import { http } from "@/lib/http/client";
import { startRouteLoading } from "@/lib/route-loading";
import type { NotificationDto } from "@/types/notification";

const Notifications = () => {
  const t = useTranslations("Layout.notifications");
  const locale = useLocale();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);

  const load = useCallback(() => {
    void http.get<NotificationDto[]>("notifications", { params: { limit: 20 } })
      .then((items) => setNotifications(Array.isArray(items) ? items : []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 15000);
    return () => window.clearInterval(timer);
  }, [load]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  const markRead = async (notificationId: number) => {
    setNotifications((items) => items.map((item) =>
      item.id === notificationId ? { ...item, isRead: true } : item));
    try {
      await http.patch(`/api/notifications/${notificationId}/read`, {});
    } catch {
      load();
    }
  };

  const openNotification = (item: NotificationDto) => {
    void markRead(item.id);
    startRouteLoading();
    router.push(item.type.startsWith("BOOKING") ? "/booking/list" : "/notification");
  };

  const markAllRead = async () => {
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    try {
      await http.patch("notifications", {});
    } catch {
      load();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={t("title")} className="relative flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground outline-none transition-colors hover:bg-secondary/80">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 grid size-4 min-w-4 place-items-center rounded-full p-0 text-[9px] font-semibold" color="destructive">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[999] mx-3 w-[min(340px,calc(100vw-24px))] p-0">
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="text-sm font-medium">{t("title")}</p>
              <p className="mt-0.5 text-xs font-normal text-muted-foreground">{t("youHave")} {unreadCount} {t("unread")}</p>
            </div>
            {unreadCount > 0 && <button type="button" onClick={markAllRead} className="text-xs font-normal text-primary hover:underline">{t("markAllAsRead")}</button>}
          </div>
        </DropdownMenuLabel>
        <ScrollArea className="h-[min(360px,60vh)]">
          {notifications.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => openNotification(item)}
              className={`cursor-pointer gap-3 rounded-none border-b px-4 py-3 last:border-0 ${item.isRead ? "" : "bg-primary/5"}`}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Bell className="size-4" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><p className="truncate text-sm font-medium">{item.title}</p>{!item.isRead && <span className="size-2 shrink-0 rounded-full bg-primary" />}</div>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.message}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{new Date(item.createdAt).toLocaleString(locale)}</p>
              </div>
            </DropdownMenuItem>
          ))}
          {!notifications.length && <div className="grid min-h-36 place-items-center px-4 text-sm text-muted-foreground">{t("empty")}</div>}
        </ScrollArea>
        <div className="border-t px-4 py-3 text-center"><Link href="/notification" className="text-xs font-medium text-primary hover:underline">{t("viewAll")}</Link></div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;

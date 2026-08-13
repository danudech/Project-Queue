"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Loader2, MessageSquare, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Input } from "@/components/ui/input";
import { http } from "@/lib/http/client";
import { useRouter } from "@/i18n/routing";
import { startRouteLoading } from "@/lib/route-loading";
import type { NotificationDto } from "@/types/notification";

export default function NotificationPage() {
  const t = useTranslations("NotificationCenter");
  const locale = useLocale();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = () => {
    setLoading(true);
    void http.get<NotificationDto[]>("notifications", { params: { limit: 100 } })
      .then((items) => setNotifications(Array.isArray(items) ? items : []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return notifications;
    return notifications.filter((item) =>
      `${item.title} ${item.message} ${item.type}`.toLowerCase().includes(keyword));
  }, [notifications, query]);

  const markAllRead = async () => {
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    try { await http.patch("notifications", {}); }
    catch { load(); }
  };

  const markRead = async (id: number) => {
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, isRead: true } : item));
    try { await http.patch(`/api/notifications/${id}/read`, {}); }
    catch { load(); }
  };

  const openNotification = (item: NotificationDto) => {
    void markRead(item.id);
    startRouteLoading();
    if (item.type.startsWith("BOOKING")) {
      router.push("/booking/list");
    } else if (item.type.includes("CHAT") || item.title.includes("สนทนา") || item.title.includes("แชท")) {
      router.push("/chat");
    } else {
      router.push("/notification");
    }
  };

  const openChatNotification = async (item: NotificationDto, e: React.MouseEvent) => {
    e.stopPropagation();
    void markRead(item.id);
    const match = item.message.match(/#(\d+)/);
    if (match && match[1]) {
      try {
        await http.post(`/api/chat/conversations/${match[1]}/accept`, {});
      } catch {
        // Ignored if already accepted
      }
    }
    startRouteLoading();
    router.push("/chat");
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        actions={<Button variant="outline" onClick={markAllRead} disabled={!unreadCount} className="gap-2"><CheckCheck className="size-4" />{t("markAll")}</Button>}
      />
      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle className="text-base">{t("inbox")}</CardTitle><p className="mt-1 text-xs text-muted-foreground">{t("unreadCount", { count: unreadCount })}</p></div>
          <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("search")} className="pl-9" /></div>
        </CardHeader>
        <CardContent>
          {loading ? <div className="grid min-h-48 place-items-center"><Loader2 className="size-5 animate-spin text-primary" /></div> : (
            <div className="divide-y rounded-xl border">
              {filtered.map((item) => {
                const isChat = item.type.includes("CHAT") || item.title.includes("สนทนา") || item.title.includes("แชท");
                return (
                  <div
                    key={item.id}
                    onClick={() => openNotification(item)}
                    className={`flex w-full items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-default-100 ${item.isRead ? "" : "bg-primary/5"}`}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      {isChat ? <MessageSquare className="size-5" /> : <Bell className="size-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.title}</span>
                        {!item.isRead && <span className="size-2 rounded-full bg-primary" />}
                      </div>
                      <span className="mt-1 block text-sm text-muted-foreground">{item.message}</span>
                      {isChat && (
                        <div className="mt-2.5">
                          <Button
                            type="button"
                            size="sm"
                            className="h-8 gap-1.5 text-xs font-medium"
                            onClick={(e) => void openChatNotification(item, e)}
                          >
                            <MessageSquare className="size-3.5" />
                            {t("joinChat")}
                          </Button>
                        </div>
                      )}
                      <span className="mt-2 block text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString(locale)}</span>
                    </div>
                  </div>
                );
              })}
              {!filtered.length && <div className="grid min-h-40 place-items-center text-sm text-muted-foreground">{t("empty")}</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

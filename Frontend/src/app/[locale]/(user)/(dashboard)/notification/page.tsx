"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Loader2, Search } from "lucide-react";
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
    router.push(item.type.startsWith("BOOKING") ? "/booking/list" : "/notification");
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
              {filtered.map((item) => (
                <button type="button" key={item.id} onClick={() => openNotification(item)} className={`flex w-full gap-3 p-4 text-left transition-colors hover:bg-default-100 ${item.isRead ? "" : "bg-primary/5"}`}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Bell className="size-4" /></span>
                  <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="font-medium">{item.title}</span>{!item.isRead && <span className="size-2 rounded-full bg-primary" />}</span><span className="mt-1 block text-sm text-muted-foreground">{item.message}</span><span className="mt-2 block text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString(locale)}</span></span>
                </button>
              ))}
              {!filtered.length && <div className="grid min-h-40 place-items-center text-sm text-muted-foreground">{t("empty")}</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

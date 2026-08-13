"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, MessageSquare, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { http } from "@/lib/http/client";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@/i18n/routing";
import { startRouteLoading } from "@/lib/route-loading";

type Conversation = {
  id: number;
  guid: string;
  customerName: string;
  lastMessage?: string | null;
  lastMessageAt: string;
  unreadCount: number;
  customerAvatarUrl?: string | null;
  status?: string;
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CU";

const toUTC = (value: string) =>
  new Date(value.endsWith("Z") || value.includes("+") ? value : value + "Z");

const formatTimeAgo = (value: string) => {
  const date = toUTC(value);
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
  if (diffMinutes < 1) return "เมื่อสักครู่";
  if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} ชม. ที่แล้ว`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export default function MessagesDropdown() {
  const t = useTranslations("OperationsPages.chat");
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const load = async () => {
    try {
      const items = await http.get<Conversation[]>("/api/chat/conversations");
      if (Array.isArray(items)) {
        setConversations((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(items)) return prev;
          return items;
        });
      }
    } catch {
      /* Handled silently */
    }
  };

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 4000);
    return () => clearInterval(timer);
  }, []);

  const totalUnread = useMemo(
    () =>
      conversations.reduce(
        (sum, item) => sum + (item.unreadCount || 0) + (item.status === "PENDING" ? 1 : 0),
        0,
      ),
    [conversations],
  );

  const openChat = (guid: string) => {
    void startRouteLoading();
    void router.push({ pathname: "/chat" as never, query: { conversationId: guid } } as never);
  };

  const acceptChat = async (conv: Conversation, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await http.post(`/api/chat/conversations/${conv.guid}/accept`, {});
    } catch {
      /* Handle silently if already accepted */
    }
    openChat(conv.guid);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("title")}
          className="relative flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground outline-none transition-colors hover:bg-secondary/80"
        >
          <MessageSquare className="size-5" />
          {totalUnread > 0 && (
            <Badge
              className="absolute -right-1 -top-1 grid size-4 min-w-4 place-items-center rounded-full p-0 text-[9px] font-semibold"
              color="destructive"
            >
              {totalUnread > 9 ? "9+" : totalUnread}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="z-[999] mx-3 w-[min(380px,calc(100vw-24px))] p-0"
      >
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{t("title")}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {totalUnread > 0
                  ? `มี ${totalUnread} ข้อความรอรับเรื่อง`
                  : t("noMessages")}
              </p>
            </div>
            <Link
              href="/chat"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {t("title")}
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </DropdownMenuLabel>

        <div className="max-h-[360px] overflow-y-auto divide-y divide-default-100">
          {conversations.length === 0 ? (
            <div className="grid min-h-36 place-items-center px-4 text-center text-sm text-muted-foreground">
              {t("noMessages")}
            </div>
          ) : (
            conversations.slice(0, 7).map((item) => {
              const isPending = item.status === "PENDING";
              const hasUnread = item.unreadCount > 0 || isPending;

              return (
                <DropdownMenuItem
                  key={item.id}
                  onSelect={() => openChat(item.guid)}
                  className={`cursor-pointer gap-3 p-3 transition-colors hover:bg-default-100 ${
                    hasUnread ? "bg-primary/5 font-medium" : ""
                  }`}
                >
                  <Avatar className="size-10 shrink-0 border border-default-200">
                    <AvatarImage src={item.customerAvatarUrl ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {initials(item.customerName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item.customerName}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatTimeAgo(item.lastMessageAt)}
                      </span>
                    </div>

                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {isPending
                        ? t("pendingBadge")
                        : item.lastMessage ?? t("noMessages")}
                    </p>

                    {isPending && (
                      <Button
                        type="button"
                        size="sm"
                        className="mt-2 h-7 gap-1.5 text-xs font-medium"
                        onClick={(e) => void acceptChat(item, e)}
                      >
                        <Check className="size-3.5" />
                        {t("joinChat")}
                      </Button>
                    )}
                  </div>

                  {hasUnread && !isPending && (
                    <span className="size-2.5 shrink-0 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </div>

        <div className="border-t p-2 text-center">
          <Link
            href="/chat"
            className="block w-full rounded-md py-2 text-center text-xs font-medium text-primary hover:bg-default-100"
          >
            ดูข้อความทั้งหมดในหน้าแชท
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

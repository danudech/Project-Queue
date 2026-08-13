"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  Info,
  Loader2,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  Smile,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { http } from "@/lib/http/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useShop } from "@/hooks/use-me";
import { env } from "@/config/env";

type Conversation = {
  id: number;
  guid: string;
  customerName: string;
  lastMessage?: string | null;
  lastMessageAt: string;
  unreadCount: number;
  bookingGuid?: string | null;
  customerAvatarUrl?: string | null;
  status?: string;
  canSend?: boolean;
};

type Message = {
  id: number;
  senderType: string;
  body: string;
  sentAt: string;
  isMine: boolean;
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CU";

// API returns UTC timestamps without 'Z' — force UTC parsing
const toUTC = (value: string) =>
  new Date(value.endsWith("Z") || value.includes("+") ? value : value + "Z");

const formatTime = (value: string) =>
  toUTC(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDate = (value: string) =>
  toUTC(value).toLocaleDateString([], { month: "short", day: "numeric" });

export default function ChatPage() {
  const t = useTranslations("OperationsPages.chat");
  const searchParams = useSearchParams();
  const targetConvId = searchParams.get("conversationId");

  const { data: shopData } = useShop();
  const shopLogo = shopData?.logo
    ? shopData.logo.startsWith("http")
      ? shopData.logo
      : `${env.apiBaseUrl.replace("/api/v1", "")}${shopData.logo}`
    : undefined;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevSelectedId = useRef<number | undefined>(undefined);
  const prevMessageCount = useRef<number>(0);

  const loadConversations = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setLoadError(false);
    try {
      const result = await http.get<Conversation[]>("/api/chat/conversations");
      setConversations((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(result)) return prev;
        return result;
      });
      if (result.length > 0) {
        setSelected((current) => {
          if (current) {
            const updated = result.find(
              (item) => item.guid === current.guid || item.id === current.id,
            );
            if (updated) {
              if (JSON.stringify(current) !== JSON.stringify(updated)) {
                return updated;
              }
              return current;
            }
          }
          if (targetConvId) {
            const matched = result.find(
              (item) => item.guid === targetConvId || item.id.toString() === targetConvId,
            );
            return matched ?? result[0];
          }
          return result[0];
        });
      }
    } catch {
      setLoadError(true);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const loadMessages = async (idOrGuid: string | number) => {
    try {
      const result = await http.get<Message[]>(
        `/api/chat/conversations/${idOrGuid}/messages`,
      );
      setMessages((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(result)) return prev;
        return result;
      });
    } catch {
      /* Keep existing messages on background polling error */
    }
  };

  const acceptConversation = async (conv: Conversation) => {
    if (accepting) return;
    setAccepting(true);
    try {
      await http.post<Conversation>(
        `/api/chat/conversations/${conv.guid}/accept`,
      );
      setConversations((prev) =>
        prev.map((item) =>
          item.guid === conv.guid ? { ...item, status: "ACTIVE" } : item,
        ),
      );
      setSelected({ ...conv, status: "ACTIVE" });
      await loadMessages(conv.guid);
    } catch {
      /* Handle error silently or alert */
    } finally {
      setAccepting(false);
    }
  };

  useEffect(() => {
    void loadConversations(true);
    const timer = setInterval(() => void loadConversations(false), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selected) return;
    void loadMessages(selected.id);
    const timer = setInterval(() => void loadMessages(selected.id), 3000);
    return () => clearInterval(timer);
  }, [selected?.id]);

  // Scroll to bottom when messages load: instant on conversation switch, smooth on new message
  useEffect(() => {
    if (!messagesEndRef.current) return;
    const switchedConversation = prevSelectedId.current !== selected?.id;
    prevSelectedId.current = selected?.id;
    const newMessageArrived = messages.length > prevMessageCount.current;
    prevMessageCount.current = messages.length;
    if (switchedConversation || newMessageArrived) {
      messagesEndRef.current.scrollIntoView({
        behavior: switchedConversation ? "instant" : "smooth",
      });
    }
  }, [messages, selected?.id]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return conversations;
    return conversations.filter(
      (item) =>
        item.customerName.toLowerCase().includes(keyword) ||
        (item.lastMessage ?? "").toLowerCase().includes(keyword),
    );
  }, [conversations, search]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !text.trim() || sending) return;
    const body = text.trim();
    setText("");
    setSending(true);

    try {
      await http.post(`/api/chat/conversations/${selected.guid}/messages`, {
        body,
      });
      await loadMessages(selected.guid);
      await loadConversations();
    } catch {
      setText(body);
    } finally {
      setSending(false);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  return (
    <main className="app-height flex min-h-0 gap-5 overflow-hidden relative">
      {/* Sidebar / Conversation List */}
      <div className="relative hidden h-full min-h-0 w-[320px] lg:block">
        <Card className="flex h-full min-h-0 flex-col pb-0">
          <CardHeader className="border-none pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border-none bg-primary/10">
                <AvatarImage src={shopLogo} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  EZ
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {t("title")}
                </div>
                <div className="text-xs text-muted-foreground">{t("description")}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden px-0 pt-0">
            <div className="sticky top-0 z-10 border-b border-default-200 bg-card px-4 pb-3">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="h-10 w-full rounded-md border border-default-200 bg-background ps-9 pe-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto py-2">
              {loading ? (
                <p className="p-5 text-sm text-muted-foreground">
                  {t("loading")}
                </p>
              ) : loadError ? (
                <div className="space-y-2 p-5 text-sm text-destructive">
                  <p>{t("loadError")}</p>
                  <button
                    type="button"
                    onClick={() => void loadConversations()}
                    className="font-medium underline"
                  >
                    {t("retry")}
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground">
                  {t("noMessages")}
                </p>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected(item)}
                    className={`flex w-full gap-3 px-4 py-3 text-start transition hover:bg-default-100 ${
                      selected?.id === item.id
                        ? "border-s-2 border-primary bg-default-100"
                        : "border-s-2 border-transparent"
                    }`}
                  >
                    <span className="grid size-10 flex-none place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {initials(item.customerName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {item.customerName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(item.lastMessageAt)}
                        </span>
                      </span>
                      <span className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-muted-foreground">
                          {item.status === "PENDING"
                            ? t("pendingBadge")
                            : item.lastMessage ?? t("noMessages")}
                        </span>
                        {item.unreadCount > 0 && (
                          <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
                            {item.unreadCount}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Panel */}
      <div className="flex h-full min-h-0 min-w-0 flex-1 gap-5">
        <Card className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          {selected ? (
            <>
              <CardHeader className="mb-0 flex-none border-b border-default-200 py-4">
                <header className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                      {initials(selected.customerName)}
                    </span>
                    <div>
                      <h2 className="text-sm font-medium text-foreground">
                        {selected.customerName}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {selected.status === "PENDING"
                          ? t("pendingStatus")
                          : t("customerMember")}
                      </p>
                    </div>
                  </div>

                  {selected.status === "PENDING" && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={accepting}
                      onClick={() => void acceptConversation(selected)}
                      className="gap-1.5 font-medium shadow-sm"
                    >
                      {accepting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Check className="size-4" />
                      )}
                      {t("joinChat")}
                    </Button>
                  )}
                </header>
              </CardHeader>

              {/* Messages Container */}
              <CardContent className="relative min-h-0 flex-1 overflow-y-auto p-5">
                {messages.length === 0 ? (
                  <div className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-sm text-muted-foreground">
                    {t("noMessages")}
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`group mb-4 flex w-full items-end gap-2 ${
                        message.isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex flex-col gap-1 ${
                          message.isMine ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm ${
                            message.isMine
                              ? "bg-primary text-primary-foreground"
                              : "bg-default-100 text-foreground"
                          }`}
                        >
                          {message.body}
                        </div>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground px-1">
                          {formatTime(message.sentAt)}{" "}
                          {message.isMine &&
                            (message.senderType === "SHOP" ? (
                              <CheckCheck className="size-3 text-primary" />
                            ) : (
                              <Check className="size-3" />
                            ))}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Footer Input */}
              <footer className="flex-none border-t border-border px-4 py-4">
                <form onSubmit={send} className="flex items-end gap-2">
                  <button
                    type="button"
                    className="grid size-10 flex-none place-items-center rounded-full bg-default-100 text-muted-foreground hover:bg-default-200"
                    aria-label="Attach file"
                  >
                    <Paperclip className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="grid size-10 flex-none place-items-center rounded-full bg-default-100 text-muted-foreground hover:bg-default-200"
                    aria-label="Add emoji"
                  >
                    <Smile className="size-4" />
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void send(event as unknown as FormEvent);
                      }
                    }}
                    disabled={selected.status === "PENDING"}
                    placeholder={
                      selected.status === "PENDING"
                        ? t("pendingPlaceholder")
                        : t("typeReply")
                    }
                    rows={1}
                    className="min-h-10 flex-1 resize-none rounded-xl border border-default-200 bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={sending || !text.trim() || selected.status === "PENDING"}
                    className="grid size-10 flex-none place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send className="size-4" />
                  </button>
                </form>
              </footer>
            </>
          ) : (
            <CardContent className="flex h-full items-center justify-center text-center">
              <div>
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
                  <Info className="size-7" />
                </div>
                <h2 className="mt-4 text-base font-medium text-foreground">
                  {t("selectChat")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("selectChatDesc")}
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Selected Conversation Info Drawer (Desktop Right Side) */}
        {selected && (
          <Card className="hidden h-full w-72 shrink-0 xl:block">
            <CardHeader className="border-b border-default-200 py-4">
              <h3 className="text-sm font-medium text-foreground">
                {t("chatInfo")}
              </h3>
            </CardHeader>
            <CardContent className="space-y-6 p-5">
              <div className="text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {initials(selected.customerName)}
                </span>
                <h3 className="mt-3 font-semibold text-foreground">
                  {selected.customerName}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selected.status === "PENDING"
                    ? t("pendingStatus")
                    : t("customerMember")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

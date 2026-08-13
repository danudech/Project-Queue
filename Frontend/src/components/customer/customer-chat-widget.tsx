"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  CheckCheck,
  Loader2,
  LogOut,
  MessageCircle,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { http } from "@/lib/http/client";

type Props = {
  shopSlug: string;
  branchPublicId: string;
  bookingGuid?: string;
  bookingToken?: string;
  defaultName?: string;
  defaultEmail?: string | null;
  shopLogoUrl?: string | null;
};

type Message = { id: number; body: string; isMine: boolean };
type Conversation = {
  guid: string;
  accessToken?: string | null;
  customerAvatarUrl?: string | null;
  customerEmailVerified?: boolean;
  status?: string;
  canSend?: boolean;
};

export function CustomerChatWidget({
  shopSlug,
  branchPublicId,
  bookingGuid,
  bookingToken,
  defaultName = "",
  defaultEmail = "",
  shopLogoUrl,
}: Props) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [chatReady, setChatReady] = useState(false);
  const [conversation, setConversation] = useState<Conversation>();
  const [token, setToken] = useState(bookingToken ?? "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const storageKey = `ezqueue.chat.${shopSlug}.${branchPublicId}.${bookingGuid ?? "guest"}`;

  // Re-focus the input whenever it becomes enabled after a send
  useEffect(() => {
    if (!busy && !creatingRoom && conversation?.status === "ACTIVE") {
      inputRef.current?.focus();
    }
  }, [busy, creatingRoom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) return;
      const value = JSON.parse(saved) as Conversation & {
        token?: string;
        name?: string;
        email?: string;
      };
      if (value.guid && value.token) {
        setConversation({ guid: value.guid });
        setToken(value.token);
        setChatReady(true);
        if (value.name) setName(value.name);
        if (value.email) setEmail(value.email);
      }
    } catch {
      /* Ignore invalid browser storage. */
    }
  }, [storageKey]);

  const load = async () => {
    if (!conversation || !token) return;
    try {
      const items = await http.get<Message[]>(
        `/api/public/chat/conversations/${conversation.guid}/messages`,
        { params: { token } },
      );
      setMessages(items);
      setTimeout(scrollToBottom, 100);
    } catch {
      window.localStorage.removeItem(storageKey);
      setConversation(undefined);
      setToken("");
      setMessages([]);
      setText("");
      setChatReady(false);
    }
  };

  useEffect(() => {
    if (!conversation || !token) return;
    const refresh = async () => {
      try {
        const result = await http.get<Conversation>(
          `/api/public/chat/conversations/${conversation.guid}`,
          { params: { token } },
        );
        setConversation(result);
        if (result.status === "ACTIVE") {
          await load();
        }
      } catch {
        /* Stale sessions handled in load */
      }
    };
    void refresh();
    const id = window.setInterval(() => void refresh(), 3000);
    return () => window.clearInterval(id);
  }, [conversation?.guid, token]);

  const validateContact = () => {
    setError("");
    const value = email.trim().toLowerCase();
    if (!name.trim() || (bookingGuid && !value)) return false;
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("กรุณากรอกอีเมลให้ถูกต้อง");
      return false;
    }
    return true;
  };

  const start = () => {
    if (validateContact()) setChatReady(true);
  };

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const body = text.trim();
    if (busy) return;
    setError("");

    try {
      let active = conversation;
      let activeToken = token;

      if (!active) {
        if (!chatReady || !validateContact()) return;
        setCreatingRoom(true);
        setBusy(true);
        const normalizedEmail = email.trim().toLowerCase();
        active = await http.post<Conversation>(
          "/api/public/chat/conversations",
          {
            shopSlug,
            branchPublicId,
            bookingGuid,
            token: bookingToken || undefined,
            customerName: name.trim(),
            customerEmail: normalizedEmail || undefined,
          },
        );
        activeToken = active.accessToken || bookingToken || "";
        setConversation({ ...active, status: active.status ?? "PENDING" });
        setAvatarUrl(active.customerAvatarUrl ?? null);
        setToken(activeToken);
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({
            guid: active.guid,
            token: activeToken,
            name: name.trim(),
            email: normalizedEmail,
          }),
        );
        return;
      }

      if (!body) return;

      if (!activeToken || active.status !== "ACTIVE") {
        setError("กรุณารอพนักงานตอบรับคำขอสนทนาก่อนส่งข้อความ");
        return;
      }

      setBusy(true);
      setText("");
      await http.post(
        `/api/public/chat/conversations/${active.guid}/messages`,
        { body, token: activeToken },
      );
      const items = await http.get<Message[]>(
        `/api/public/chat/conversations/${active.guid}/messages`,
        { params: { token: activeToken } },
      );
      setMessages(items);
      setTimeout(scrollToBottom, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถส่งข้อความได้";
      setError(msg);
    } finally {
      setBusy(false);
      setCreatingRoom(false);
    }
  };

  const updateProfile = async (file: File) => {
    if (!conversation || !token) return;
    const form = new FormData();
    form.append("Token", token);
    form.append("ProfilePicture", file);
    setBusy(true);
    setError("");
    try {
      const result = await http.post<Conversation>(
        `/api/public/chat/conversations/${conversation.guid}/profile`,
        form,
      );
      setAvatarUrl(result.customerAvatarUrl ?? null);
      setConversation(result);
    } catch {
      setError("ไม่สามารถเปลี่ยนรูปโปรไฟล์ได้");
    } finally {
      setBusy(false);
    }
  };

  const closeConversation = async () => {
    if (!conversation || !token) return;
    setShowConfirm(true);
  };

  const confirmClose = async () => {
    setShowConfirm(false);
    if (!conversation || !token) return;
    setBusy(true);
    try {
      await http.post(
        `/api/public/chat/conversations/${conversation.guid}/close`,
        { token },
      );
      window.localStorage.removeItem(storageKey);
      setConversation(undefined);
      setToken("");
      setMessages([]);
      setText("");
      setChatReady(false);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        type="button"
        aria-label="เปิดแชทกับร้านค้า"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-primary px-5 py-3.5 text-primary-foreground shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-primary/30"
      >
        <MessageCircle className="size-6" />
        <span className="text-sm font-semibold hidden sm:inline">
          สอบถามร้านค้า
        </span>
      </button>

      {/* Chat Window Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={() => setOpen(false)}
        >
          <Card
            className="fixed bottom-6 right-6 z-[61] flex h-[min(580px,calc(100vh-4rem))] w-[min(440px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-default-200 bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Custom Confirm Dialog Overlay */}
            {showConfirm && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl">
                <div className="mx-6 w-full rounded-2xl border border-default-200 bg-card p-6 shadow-xl text-center">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
                    <svg className="size-7 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h4 className="mb-1 text-base font-semibold text-foreground">จบการสนทนา?</h4>
                  <p className="mb-5 text-sm text-muted-foreground">ต้องการจบการสนทนานี้ใช่หรือไม่? ประวัติการสนทนาจะถูกปิด</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 rounded-xl border border-default-200 bg-background py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-default-100"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={() => void confirmClose()}
                      className="flex-1 rounded-xl bg-destructive py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      จบการสนทนา
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between border-b border-default-200 bg-card px-5 py-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border border-primary/20 bg-primary/10 shadow-xs">
                  <AvatarImage src={shopLogoUrl ?? undefined} />
                  <AvatarFallback className="bg-primary/10 font-bold text-primary">
                    ร้าน
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    ติดต่อสอบถามร้านค้า
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex size-2">
                      <span
                        className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${
                          conversation?.status === "PENDING"
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        }`}
                      ></span>
                      <span
                        className={`relative inline-flex size-2 rounded-full ${
                          conversation?.status === "PENDING"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      ></span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {conversation?.status === "PENDING"
                        ? "กำลังรอพนักงานเข้าห้อง..."
                        : conversation?.status === "ACTIVE"
                        ? "พนักงานพร้อมให้บริการ"
                        : "สอบถามข้อมูลสด"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {conversation?.status === "ACTIVE" && (
                  <button
                    type="button"
                    aria-label="จบการสนทนา"
                    title="จบการสนทนา"
                    onClick={closeConversation}
                    disabled={busy}
                    className="grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-40"
                  >
                    <LogOut className="size-4" />
                  </button>
                )}
                <button
                  type="button"
                  aria-label="ปิดแชท"
                  onClick={() => setOpen(false)}
                  className="grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-default-100 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex min-h-0 flex-1 flex-col p-5 overflow-hidden">
              {/* Customer Profile Bar */}
              <div className="mb-4 flex items-center justify-between rounded-xl bg-default-50 border border-default-100 p-2.5">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-8 bg-background border">
                    <AvatarImage src={avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <UserRound className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {name || "ผู้ติดต่อทั่วไป"}
                    </p>
                    {email && (
                      <p className="truncate text-[10px] text-muted-foreground">
                        {email}
                      </p>
                    )}
                  </div>
                </div>
                {conversation?.customerEmailVerified && (
                  <label className="cursor-pointer text-xs font-medium text-primary hover:underline px-2">
                    เปลี่ยนรูป
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void updateProfile(file);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                )}
              </div>

              {!conversation && !chatReady ? (
                /* Contact Form Step */
                <div className="flex flex-1 flex-col justify-center space-y-4">
                  <div className="text-center space-y-1">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <Sparkles className="size-6" />
                    </div>
                    <h4 className="text-base font-semibold text-foreground">
                      ยินดีต้อนรับสู่ระบบสอบถาม
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      กรุณาระบุข้อมูลติดต่อเพื่อเริ่มต้นการแชทกับพนักงาน
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label
                        htmlFor="customer-chat-contact-name"
                        className="mb-1 block text-xs font-medium text-foreground"
                      >
                        ชื่อผู้ติดต่อ *
                      </label>
                      <input
                        id="customer-chat-contact-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="ระบุชื่อของคุณ"
                        className="h-11 w-full rounded-xl border border-default-200 bg-background px-3.5 text-sm outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="customer-chat-contact-email"
                        className="mb-1 block text-xs font-medium text-foreground"
                      >
                        อีเมล {bookingGuid ? "*" : "(ไม่บังคับ)"}
                      </label>
                      <input
                        id="customer-chat-contact-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="name@example.com"
                        className="h-11 w-full rounded-xl border border-default-200 bg-background px-3.5 text-sm outline-none focus:border-primary"
                      />
                      {bookingGuid && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          ระบุอีเมลตรงกับรายการจองของคุณ
                        </p>
                      )}
                    </div>

                    {error && (
                      <p className="text-xs font-medium text-destructive">
                        {error}
                      </p>
                    )}

                    <Button
                      className="w-full h-11 rounded-xl gap-2 font-medium"
                      onClick={start}
                      disabled={
                        busy ||
                        !name.trim() ||
                        (Boolean(bookingGuid) && !email.trim())
                      }
                    >
                      <MessageCircle className="size-4" />
                      เริ่มต้นการแชท
                    </Button>
                  </div>
                </div>
              ) : (
                /* Chat Messages Area */
                <div className="flex flex-1 flex-col min-h-0 space-y-3">
                  {/* Creating Room Full Spinner / Logo Loading */}
                  {creatingRoom && (
                    <div className="flex flex-1 flex-col items-center justify-center space-y-4 rounded-2xl bg-default-50/90 border border-default-100 p-8 text-center">
                      <div className="relative mx-auto flex size-20 items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <div className="absolute inset-1 rounded-full bg-primary/10 animate-pulse" />
                        <Avatar className="size-14 border border-primary/20 shadow-md">
                          <AvatarImage src={shopLogoUrl ?? undefined} className="object-cover" />
                          <AvatarFallback className="bg-primary/10 font-bold text-primary">
                            ร้าน
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">กำลังเปิดห้องสนทนา...</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          กำลังแจ้งเตือนไปยังพนักงานร้านค้า กรุณารอสักครู่
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pending Status Banner */}
                  {!creatingRoom && conversation?.status === "PENDING" && (
                    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-foreground shadow-xs">
                      <span className="relative flex size-3 shrink-0 mt-0.5">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 opacity-75"></span>
                        <span className="relative inline-flex size-3 rounded-full bg-primary"></span>
                      </span>
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-semibold text-sm text-foreground">
                          รอเจ้าหน้าที่เข้าร่วมห้องสนทนา
                        </p>
                        <p className="mt-0.5 text-muted-foreground">
                          ระบบได้ส่งการแจ้งเตือนไปยังพนักงานแล้ว
                          คุณสามารถพิมพ์ข้อความทิ้งไว้ได้ทันทีครับ
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Messages Stream */}
                  {!creatingRoom && (
                    <div className="flex-1 overflow-y-auto space-y-2.5 rounded-xl bg-default-50/70 border border-default-100 p-3.5">
                      {messages.length === 0 && (
                        <div className="grid h-full place-items-center text-center p-6 text-xs text-muted-foreground">
                          {conversation?.status === "PENDING" ? (
                            <div className="space-y-4 py-4">
                              {/* Logo Loading animation */}
                              <div className="relative mx-auto flex size-20 items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                <div className="absolute inset-1 rounded-full bg-primary/10 animate-pulse" />
                                <Avatar className="size-14 border border-primary/20 shadow-md">
                                  <AvatarImage src={shopLogoUrl ?? undefined} className="object-cover" />
                                  <AvatarFallback className="bg-primary/10 font-bold text-primary">
                                    ร้าน
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-foreground">
                                  กำลังรอเจ้าหน้าที่เข้าร่วมห้องสนทนา...
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground max-w-[280px] mx-auto">
                                  ระบบแจ้งเตือนพนักงานแล้ว คุณสามารถพิมพ์ข้อความฝากไว้ด้านล่างได้เลยครับ
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <MessageCircle className="mx-auto size-8 opacity-40 mb-2" />
                              <p className="font-medium text-sm text-foreground">
                                เริ่มต้นการสนทนาได้เลย
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                พิมพ์ข้อความด้านล่างเพื่อส่งคำถามถึงร้านค้า
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {messages.map((item) => (
                        <div
                          key={item.id}
                          className={`flex ${
                            item.isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                              item.isMine
                                ? "bg-primary text-primary-foreground rounded-br-xs"
                                : "bg-background border border-default-200 text-foreground rounded-bl-xs"
                            }`}
                          >
                            {item.body}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}

                  {error && (
                    <p className="text-xs font-medium text-destructive">
                      {error}
                    </p>
                  )}

                  {/* Footer Input */}
                  <form onSubmit={send} className="flex items-center gap-2 pt-1">
                    <input
                      ref={inputRef}
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      placeholder={
                        conversation?.status === "PENDING"
                          ? "พิมพ์ข้อความฝากไว้..."
                          : "พิมพ์ข้อความตอบกลับ..."
                      }
                      disabled={busy || creatingRoom}
                      className="h-11 min-w-0 flex-1 rounded-xl border border-default-200 bg-background px-3.5 text-sm outline-none focus:border-primary disabled:opacity-50"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={busy || !text.trim() || creatingRoom}
                      className="size-11 shrink-0 rounded-xl"
                    >
                      {busy ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

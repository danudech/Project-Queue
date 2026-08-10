"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, CheckCheck, Info, Paperclip, Search, Send, Smile } from "lucide-react";
import { http } from "@/lib/http/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
type Message = { id: number; senderType: string; body: string; sentAt: string; isMine: boolean };

const initials = (name: string) => name.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "CU";
const formatTime = (value: string) => new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const formatDate = (value: string) => new Date(value).toLocaleDateString([], { month: "short", day: "numeric" });

export default function ChatPage() {
  const { data: shopData } = useShop();
  const shopLogo = shopData?.logo ? (shopData.logo.startsWith("http") ? shopData.logo : `${env.apiBaseUrl.replace("/api/v1", "")}${shopData.logo}`) : undefined;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [sending, setSending] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const loadConversations = async () => {
    try {
      const result = await http.get<Conversation[] | null>("/api/chat/conversations");
      const items = Array.isArray(result) ? result : [];
      setConversations(items);
      const firstWithMessage = items.find((item) => Boolean(item.lastMessage?.trim()));
      setSelected((current) => {
        const refreshed = current ? items.find((item) => item.id === current.id) : undefined;
        if (refreshed?.lastMessage?.trim() || !firstWithMessage) return refreshed ?? items[0];
        return firstWithMessage;
      });
      setLoadError(false);
    } catch {
      setConversations([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadConversations(); const timer = window.setInterval(() => void loadConversations(), 5000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    if (!selected) { setMessages([]); return; }
    const load = async () => { try { const result = await http.get<Message[] | null>(`/api/chat/conversations/${selected.id}/messages`); setMessages(Array.isArray(result) ? result : []); } catch { setMessages([]); } };
    void load(); const timer = window.setInterval(() => void load(), 5000); return () => window.clearInterval(timer);
  }, [selected]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const body = text.trim();
    if (!body || !selected || selected.status !== "ACTIVE" || sending) return;
    setSending(true); setText("");
    try { await http.post(`/api/chat/conversations/${selected.id}/messages`, { body }); const result = await http.get<Message[] | null>(`/api/chat/conversations/${selected.id}/messages`); setMessages(Array.isArray(result) ? result : []); await loadConversations(); } finally { setSending(false); }
  };
  const acceptConversation = async (conversation = selected) => { if (!conversation || conversation.status !== "PENDING" || accepting) return; setAccepting(true); try { await http.post(`/api/chat/conversations/${conversation.id}/accept`, {}); await loadConversations(); } finally { setAccepting(false); } };

  const filtered = useMemo(() => conversations.filter((item) => item.customerName.toLowerCase().includes(search.toLowerCase()) || (item.lastMessage ?? "").toLowerCase().includes(search.toLowerCase())), [conversations, search]);

  return (
    <main className="app-height flex min-h-0 gap-5 overflow-hidden relative">
      <div className="relative hidden h-full min-h-0 w-[320px] lg:block">
        <Card className="flex h-full min-h-0 flex-col pb-0">
        <CardHeader className="border-none pb-3"><div className="flex items-center gap-3"><Avatar className="size-10 border-none bg-primary/10"><AvatarImage src={shopLogo} /><AvatarFallback className="bg-primary/10 text-primary">EZ</AvatarFallback></Avatar><div><div className="text-sm font-medium text-foreground">Customer messages</div><div className="text-xs text-muted-foreground">Your inbox</div></div></div></CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden px-0 pt-0">
          <div className="sticky top-0 z-10 border-b border-default-200 bg-card px-4 pb-3"><div className="relative"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search..." className="h-10 w-full rounded-md border border-default-200 bg-background ps-9 pe-3 text-sm outline-none focus:border-primary" /></div></div>
          {conversations.some((item) => item.status === "PENDING") && <div className="mx-4 mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><strong className="block">มีคำขอแชทรอรับ</strong><span>ลูกค้ากำลังรอพนักงานกดยอมรับ</span><button type="button" className="mt-2 font-medium underline" onClick={() => { const pending = conversations.find((item) => item.status === "PENDING"); if (pending) { setSelected(pending); void acceptConversation(pending); } }}>รับคำขอแรก</button></div>}
          <div className="min-h-0 flex-1 overflow-y-auto py-2">
            {loading ? <p className="p-5 text-sm text-muted-foreground">Loading conversations...</p> : loadError ? <div className="space-y-2 p-5 text-sm text-destructive"><p>Unable to load conversations.</p><button type="button" onClick={() => void loadConversations()} className="font-medium underline">Try again</button></div> : filtered.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No conversations yet.</p> : filtered.map((item) => <button key={item.id} type="button" onClick={() => setSelected(item)} className={`flex w-full gap-3 px-4 py-3 text-start transition hover:bg-default-100 ${selected?.id === item.id ? "border-s-2 border-primary bg-default-100" : "border-s-2 border-transparent"}`}><span className="grid size-10 flex-none place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{initials(item.customerName)}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-medium text-foreground">{item.customerName}</span><span className="text-[11px] text-muted-foreground">{formatDate(item.lastMessageAt)}</span></span><span className="mt-1 flex items-center justify-between gap-2"><span className="truncate text-xs text-muted-foreground">{item.lastMessage ?? "Start a conversation"}</span>{item.unreadCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{item.unreadCount}</span>}</span></span></button>)}
          </div>
        </CardContent>
        </Card>
      </div>

      <div className="flex h-full min-h-0 min-w-0 flex-1 gap-5">
        <Card className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          {selected ? <><CardHeader className="mb-0 flex-none border-b border-default-200 py-5"><header className="flex items-center"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-primary/10 font-semibold text-primary">{initials(selected.customerName)}</span><div><h2 className="text-sm font-medium text-foreground">{selected.customerName}</h2><p className="text-xs text-muted-foreground">Customer</p></div></div></header></CardHeader><CardContent className="relative min-h-0 flex-1 overflow-y-auto p-5">{messages.length === 0 ? <div className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-sm text-muted-foreground">No messages yet</div> : messages.map((message) => <div key={message.id} className={`group mb-4 flex w-full items-end gap-2 ${message.isMine ? "justify-end" : "justify-start"}`}><div className={`flex flex-col gap-1 ${message.isMine ? "items-end" : "items-start"}`}><div className={`whitespace-pre-wrap break-words rounded-md p-3 text-sm ${message.isMine ? "bg-primary text-primary-foreground" : "bg-default-100 text-foreground"}`}>{message.body}</div><span className="flex items-center gap-1 text-xs text-muted-foreground">{formatTime(message.sentAt)} {message.isMine && (message.senderType === "SHOP" ? <CheckCheck className="size-3 text-primary" /> : <Check className="size-3" />)}</span></div></div>)}</CardContent><footer className="flex-none border-t border-border px-4 py-4"><form onSubmit={send} className="flex items-end gap-2"><button type="button" className="grid size-10 flex-none place-items-center rounded-full bg-default-100 text-muted-foreground" aria-label="Attach file"><Paperclip className="size-4" /></button><button type="button" className="grid size-10 flex-none place-items-center rounded-full bg-default-100 text-muted-foreground" aria-label="Add emoji"><Smile className="size-4" /></button><textarea value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(event as unknown as FormEvent); } }} placeholder="Type your message..." rows={1} className="min-h-10 flex-1 resize-none rounded-xl border border-default-200 bg-background px-3 py-2 text-sm outline-none" /><button type="submit" disabled={sending || !text.trim()} className="grid size-10 flex-none place-items-center rounded-full bg-default-100 text-foreground disabled:opacity-50" aria-label="Send message"><Send className="size-4" /></button></form></footer></> : <CardContent className="flex h-full items-center justify-center text-center"><div><div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary"><Info className="size-7" /></div><h2 className="mt-4 text-base font-medium text-foreground">Select a conversation</h2><p className="mt-1 text-sm text-muted-foreground">Choose a customer to start replying</p></div></CardContent>}
        </Card>

        <Card className="hidden h-full w-[280px] flex-none lg:block"><CardHeader className="mb-0 border-b border-default-200 py-5"><h2 className="text-sm font-medium text-foreground">Contact info</h2></CardHeader>{selected ? <CardContent className="p-6"><div className="flex flex-col items-center border-b border-default-200 pb-6"><Avatar className="size-24"><AvatarImage src={selected.customerAvatarUrl ?? undefined} /><AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">{initials(selected.customerName)}</AvatarFallback></Avatar><h3 className="mt-4 text-base font-medium text-foreground">{selected.customerName}</h3><p className="mt-1 text-xs text-muted-foreground">Customer</p></div><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-xs text-muted-foreground">Last activity</dt><dd className="mt-1 text-foreground">{new Date(selected.lastMessageAt).toLocaleString()}</dd></div><div><dt className="text-xs text-muted-foreground">Booking</dt><dd className="mt-1 break-all text-foreground">{selected.bookingGuid ?? "General inquiry"}</dd></div></dl></CardContent> : <p className="p-6 text-sm text-muted-foreground">Select a conversation to view details.</p>}</Card>
      </div>
    </main>
  );
}

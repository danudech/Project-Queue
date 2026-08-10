"use client";

import { FormEvent, useEffect, useState } from "react";
import { LogOut, MessageCircle, Send, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { http } from "@/lib/http/client";

type Props = { shopSlug: string; branchPublicId: string; bookingGuid?: string; bookingToken?: string; defaultName?: string; defaultEmail?: string | null; shopLogoUrl?: string | null };
type Message = { id: number; body: string; isMine: boolean };
type Conversation = { guid: string; accessToken?: string | null; customerAvatarUrl?: string | null; customerEmailVerified?: boolean; status?: string; canSend?: boolean };

export function CustomerChatWidget({ shopSlug, branchPublicId, bookingGuid, bookingToken, defaultName = "", defaultEmail = "", shopLogoUrl }: Props) {
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
  const [open, setOpen] = useState(false);
  const storageKey = `ezqueue.chat.${shopSlug}.${branchPublicId}.${bookingGuid ?? "guest"}`;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) return;
      const value = JSON.parse(saved) as Conversation & { token?: string; name?: string; email?: string };
      if (value.guid && value.token) { setConversation({ guid: value.guid }); setToken(value.token); setChatReady(true); if (value.name) setName(value.name); if (value.email) setEmail(value.email); }
    } catch { /* Ignore invalid browser storage. */ }
  }, [storageKey]);

  const load = async () => {
    if (!conversation || !token) return;
    try { setMessages(await http.get<Message[]>(`/api/public/chat/conversations/${conversation.guid}/messages`, { params: { token } })); }
    catch { window.localStorage.removeItem(storageKey); setConversation(undefined); setToken(""); setMessages([]); setText(""); setChatReady(false); }
  };
  useEffect(() => { if (!conversation) return; const refresh = async () => { try { const result = await http.get<Conversation>(`/api/public/chat/conversations/${conversation.guid}`, { params: { token } }); setConversation(result); setError(result.status === "PENDING" ? "กำลังรอพนักงานกดยอมรับคำขอสนทนา..." : ""); if (result.status === "ACTIVE") { await load(); const queued = text.trim(); if (queued && !busy) { setBusy(true); setText(""); try { await http.post(`/api/public/chat/conversations/${conversation.guid}/messages`, { body: queued, token }); await load(); } finally { setBusy(false); } } } } catch { /* stale sessions are cleared by load */ } }; void refresh(); const id = window.setInterval(() => void refresh(), 3000); return () => window.clearInterval(id); }, [conversation?.guid, token, text, busy]);

  const validateContact = () => {
    setError("");
    const value = email.trim().toLowerCase();
    if (!name.trim() || (bookingGuid && !value)) return false;
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setError("กรุณากรอกอีเมลให้ถูกต้อง"); return false; }
    return true;
  };
  const start = () => { if (validateContact()) setChatReady(true); };
  const send = async (event: FormEvent) => {
    event.preventDefault();
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true); setError("");
    try {
      let active = conversation;
      let activeToken = token;
      if (!active) {
        if (!chatReady || !validateContact()) return;
        const normalizedEmail = email.trim().toLowerCase();
        active = await http.post<Conversation>("/api/public/chat/conversations", { shopSlug, branchPublicId, bookingGuid, token: bookingToken || undefined, customerName: name.trim(), customerEmail: normalizedEmail || undefined });
        activeToken = active.accessToken || bookingToken || "";
        setConversation({ ...active, status: active.status ?? "PENDING" }); setAvatarUrl(active.customerAvatarUrl ?? null); setToken(activeToken); setText(body); setError("กำลังรอพนักงานกดยอมรับคำขอสนทนา...");
        window.localStorage.setItem(storageKey, JSON.stringify({ guid: active.guid, token: activeToken, name: name.trim(), email: normalizedEmail }));
        return;
      }
      if (!activeToken || active.status !== "ACTIVE") return;
      setText("");
      await http.post(`/api/public/chat/conversations/${active.guid}/messages`, { body, token: activeToken });
      setMessages(await http.get<Message[]>(`/api/public/chat/conversations/${active.guid}/messages`, { params: { token: activeToken } }));
    } catch { setError("ยืนยันอีเมลไม่สำเร็จ หรือส่งข้อความไม่สำเร็จ"); }
    finally { setBusy(false); }
  };
  const updateProfile = async (file: File) => {
    if (!conversation || !token) return;
    const form = new FormData(); form.append("Token", token); form.append("ProfilePicture", file); setBusy(true); setError("");
    try { const result = await http.post<Conversation>(`/api/public/chat/conversations/${conversation.guid}/profile`, form); setAvatarUrl(result.customerAvatarUrl ?? null); setConversation(result); }
    catch { setError("ไม่สามารถเปลี่ยนรูปโปรไฟล์ได้"); } finally { setBusy(false); }
  };
  const closeConversation = async () => {
    if (!conversation || !token || !window.confirm("ต้องการจบการสนทนานี้ใช่หรือไม่?")) return;
    setBusy(true);
    try { await http.post(`/api/public/chat/conversations/${conversation.guid}/close`, { token }); window.localStorage.removeItem(storageKey); setConversation(undefined); setToken(""); setMessages([]); setText(""); setChatReady(false); setOpen(false); }
    finally { setBusy(false); }
  };

  return <>
    <button type="button" aria-label="เปิดแชทกับร้านค้า" onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-105"><MessageCircle className="size-6" /></button>
    {open && <div className="fixed inset-0 z-[60] bg-slate-950/20" onClick={() => setOpen(false)}>
      <Card className="customer-chat-card fixed bottom-24 right-6 z-[61] w-[min(380px,calc(100vw-3rem))] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <style>{`.customer-chat-card > div:nth-child(3) { padding-top: 1.25rem; } .customer-chat-card > div:nth-child(3) > div:first-child { display: none; }`}</style>
        <div className="flex items-center justify-between gap-3 border-b border-default-200 px-6 py-4"><div className="flex items-center gap-3"><Avatar className="size-9"><AvatarImage src={shopLogoUrl ?? undefined} /><AvatarFallback className="bg-primary/10 text-primary">ร้าน</AvatarFallback></Avatar><span className="text-sm font-semibold text-foreground">ติดต่อร้านค้า</span></div><div className="flex items-center gap-1">{conversation?.status === "ACTIVE" && <button type="button" aria-label="จบการสนทนา" title="จบการสนทนา" onClick={closeConversation} disabled={busy} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-40"><LogOut className="size-5" /></button>}<button type="button" aria-label="ปิดแชท" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-default-100"><X className="size-5" /></button></div></div>
        <CardContent><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><Avatar className="size-9 bg-slate-100"><AvatarImage src={avatarUrl ?? undefined} /><AvatarFallback className="bg-slate-100 text-slate-500"><UserRound className="size-4" /></AvatarFallback></Avatar><span className="text-xs text-muted-foreground">{name || "ผู้ติดต่อ"}</span></div>{conversation?.customerEmailVerified && <label className="cursor-pointer text-xs text-primary hover:underline">เปลี่ยนรูป<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void updateProfile(file); event.currentTarget.value = ""; }} /></label>}</div>
          {!conversation && !chatReady ? <div className="space-y-3"><p className="text-sm text-muted-foreground">สอบถามข้อมูลกับพนักงานได้โดยตรง</p><label htmlFor="customer-chat-contact-name" className="block text-sm font-medium">ชื่อผู้ติดต่อ</label><input id="customer-chat-contact-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="กรอกชื่อผู้ติดต่อ" className="h-11 w-full rounded-lg border px-3 text-sm" /><label htmlFor="customer-chat-contact-email" className="block text-sm font-medium">อีเมลสำหรับยืนยันตัวตน{bookingGuid ? " *" : ""}</label><input id="customer-chat-contact-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="h-11 w-full rounded-lg border px-3 text-sm" />{bookingGuid && <p className="text-xs text-muted-foreground">ใช้อีเมลเดียวกับที่ระบุในการจอง</p>}{error && <p className="text-xs text-destructive">{error}</p>}<Button className="w-full" onClick={start} disabled={busy || !name.trim() || (Boolean(bookingGuid) && !email.trim())}><MessageCircle className="mr-2 size-4" />เริ่มแชท</Button></div> : <div className="space-y-3"><div className="max-h-64 space-y-2 overflow-y-auto rounded-xl bg-default-50 p-3">{messages.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">เริ่มการสนทนาได้เลย</p>}{messages.map((item) => <div key={item.id} className={`flex ${item.isMine ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${item.isMine ? "bg-primary text-primary-foreground" : "bg-background shadow-sm"}`}>{item.body}</div></div>)}</div>{error && <p className="text-xs text-destructive">{error}</p>}<form onSubmit={send} className="flex gap-2"><input value={text} onChange={(event) => setText(event.target.value)} placeholder="พิมพ์ข้อความ..." className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" /><Button type="submit" size="icon" disabled={busy || !text.trim()}><Send className="size-4" /></Button></form></div>}
        </CardContent>
      </Card>
    </div>}
  </>;
}

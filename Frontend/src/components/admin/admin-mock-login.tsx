"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Copy, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { ADMIN_MOCK_EMAIL, ADMIN_MOCK_PASSWORD, ADMIN_MOCK_PERMISSIONS } from "@/config/admin-mock";

export function AdminMockLogin({ locale }: { locale: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(ADMIN_MOCK_EMAIL);
  const [password, setPassword] = useState(ADMIN_MOCK_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"email" | "password" | null>(null);

  const copy = async (value: string, field: "email" | "password") => {
    await navigator.clipboard.writeText(value);
    setCopied(field);
    window.setTimeout(() => setCopied(null), 1200);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/mock-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to start mock session");
      router.replace(`/${locale}/admin`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start mock session");
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-h-screen bg-[#f3f6f4] p-4 text-slate-950 md:p-8">
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(16,37,28,0.14)] lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative overflow-hidden bg-[#10251c] p-8 text-white md:p-12">
        <div className="absolute -right-28 -top-28 size-80 rounded-full border-[60px] border-white/[0.03]" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center gap-3"><span className="grid size-11 place-items-center overflow-hidden rounded-xl bg-white/10"><Image src="/images/brand/ezqueue-mark.png" alt="" width={44} height={44} className="size-11 object-contain" priority /></span><div><strong className="block text-xl">EZQueue</strong><span className="text-xs font-bold tracking-[0.18em] text-emerald-100/60">PLATFORM ADMIN MOCK</span></div></div>
          <div className="my-auto py-12"><p className="text-xs font-bold tracking-[0.2em] text-[#e1bd76]">DEMONSTRATION ACCESS</p><h1 className="mt-4 max-w-lg text-4xl font-bold leading-tight tracking-tight md:text-5xl">Test the platform boundary before connecting real privileges.</h1><p className="mt-5 max-w-lg leading-7 text-white/60">This session represents a cross-tenant administrator. It contains static data and never changes real shops, users, or settings.</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-white/55"><strong className="block text-white/80">Prototype limitation</strong>This login is intentionally isolated from the production identity system and must be removed when real `system.admin` authorization is implemented.</div>
        </div>
      </section>
      <section className="flex items-center p-6 md:p-12 lg:p-16"><div className="w-full"><div className="mb-8"><span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"><LockKeyhole className="size-3.5" />Mock credentials</span><h2 className="mt-4 text-3xl font-bold tracking-tight">Platform administrator access</h2><p className="mt-2 text-sm leading-6 text-slate-500">Credentials are prefilled for local UI review.</p></div>
        <form className="space-y-5" onSubmit={submit}>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Email</span><span className="relative block"><input type="email" value={email} onChange={event => setEmail(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" /><button type="button" onClick={() => void copy(ADMIN_MOCK_EMAIL, "email")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-emerald-700" aria-label="Copy email">{copied === "email" ? <Check className="size-4" /> : <Copy className="size-4" />}</button></span></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold">Password</span><span className="relative block"><input type={showPassword ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-20 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" /><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-11 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-white" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button><button type="button" onClick={() => void copy(ADMIN_MOCK_PASSWORD, "password")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-emerald-700" aria-label="Copy password">{copied === "password" ? <Check className="size-4" /> : <Copy className="size-4" />}</button></span></label>
          {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
          <button disabled={loading} className="flex h-12 w-full items-center justify-center rounded-xl bg-[#173d2d] text-sm font-bold text-white shadow-sm transition hover:bg-[#20563e] disabled:cursor-wait disabled:opacity-60">{loading ? "Starting mock session…" : "Enter Platform Admin mock"}</button>
        </form>
        <div className="mt-8 border-t border-slate-200 pt-6"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Mock role: PlatformAdminMock</p><div className="mt-3 flex flex-wrap gap-2">{ADMIN_MOCK_PERMISSIONS.map(permission => <span key={permission} className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-[10px] text-slate-600">{permission}</span>)}</div></div>
      </div></section>
    </div>
  </div>;
}


"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronRight, LogOut, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { adminNavItems } from "./admin-mock-data";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1] || "en";
  const [open, setOpen] = useState(false);

  const leaveMock = async () => {
    await fetch("/api/admin/mock-logout", { method: "POST" });
    router.replace(`/${locale}/admin-access`);
    router.refresh();
  };

  const isActive = (href: string) => {
    const localized = `/${locale}${href}`;
    return href === "/admin" ? pathname === localized : pathname.startsWith(localized);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-950">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-[#10251c] text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link href={`/${locale}/admin`} className="flex items-center gap-3">
            <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-white/10"><Image src="/images/brand/ezqueue-mark.png" alt="" width={40} height={40} className="size-10 object-contain" priority /></span>
            <span><strong className="block text-lg tracking-tight">EZQueue</strong><span className="text-[11px] font-semibold tracking-[0.18em] text-emerald-100/60">PLATFORM ADMIN</span></span>
          </Link>
          <button className="rounded-lg p-2 text-white/70 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X className="size-5" /></button>
        </div>
        <nav className="space-y-1 p-4">
          {adminNavItems.map((item) => {
            const active = isActive(item.href);
            return <Link key={item.href} href={`/${locale}${item.href}`} onClick={() => setOpen(false)} className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition ${active ? "bg-white text-[#173d2d] shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <item.icon className={`size-5 ${active ? "text-[#247351]" : "text-white/60"}`} />
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.label}</span><span className={`block truncate text-xs ${active ? "text-slate-500" : "text-white/40"}`}>{item.description}</span></span>
              {active && <ChevronRight className="size-4 text-[#247351]" />}
            </Link>;
          })}
        </nav>
        <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#e1bd76]">Mock environment</p>
          <p className="mt-1 text-xs leading-5 text-white/50">Static demonstration data. No administrator action is connected to the API.</p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 flex h-20 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-8">
          <button className="rounded-xl border border-slate-200 p-2.5 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></button>
          <div className="relative hidden max-w-md flex-1 md:block"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" placeholder="Search shops, users, or incidents" /></div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 sm:inline-flex">Mock prototype</span>
            <button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600" aria-label="Notifications"><Bell className="size-5" /><span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white" /></button>
            <div className="hidden items-center gap-3 border-l border-slate-200 pl-3 sm:flex"><span className="grid size-10 place-items-center rounded-xl bg-[#dcece4] text-sm font-bold text-[#174c36]">PA</span><span><strong className="block text-sm">Platform Admin</strong><span className="block text-xs text-slate-500">admin@ezqueue.local</span></span><button onClick={() => void leaveMock()} className="ml-2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600" aria-label="Leave admin mock"><LogOut className="size-4" /></button></div>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 md:p-8">{children}</main>
      </div>
      {open && <button className="fixed inset-0 z-40 bg-black/45 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation overlay" />}
    </div>
  );
}


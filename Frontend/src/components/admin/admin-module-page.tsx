"use client";

import { Download, Filter, Plus, Search } from "lucide-react";
import { moduleDefinitions } from "./admin-mock-data";

type ModuleKey = keyof typeof moduleDefinitions;

const badgeClass = (value: string) => {
  if (["Active", "Healthy", "Success"].includes(value)) return "bg-emerald-50 text-emerald-700 ring-emerald-600/15";
  if (["Review", "Draft", "Degraded"].includes(value)) return "bg-amber-50 text-amber-800 ring-amber-600/15";
  if (["Suspended", "Inactive"].includes(value)) return "bg-rose-50 text-rose-700 ring-rose-600/15";
  return "bg-slate-100 text-slate-700 ring-slate-600/10";
};

export function AdminModulePage({ module }: { module: ModuleKey }) {
  const data = moduleDefinitions[module];
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div><p className="text-xs font-bold tracking-[0.18em] text-emerald-700">{data.eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{data.title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">{data.description}</p></div>
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#173d2d] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20563e]"><Plus className="size-4" />{data.primaryAction}</button>
    </div>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,35,27,0.05)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center">
        <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-emerald-700" placeholder={`Search ${data.title.toLowerCase()}`} /></div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600"><Filter className="size-4" />Filter</button>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600"><Download className="size-4" />Export</button>
      </div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{data.columns.map(column => <th key={column} className="px-5 py-4 font-semibold">{column}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{data.rows.map((row, index) => <tr key={`${row[0]}-${index}`} className="transition hover:bg-emerald-50/30">{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className={`px-5 py-4 ${cellIndex === 0 ? "font-semibold text-slate-900" : "text-slate-600"}`}>{cellIndex === row.length - 1 ? <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeClass(cell)}`}>{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div>
      <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-xs text-slate-500"><span>Showing mock records only</span><span>Page 1 of 1</span></div>
    </section>
  </div>;
}


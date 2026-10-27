"use client";

import { useMemo, useState } from "react";
import { Check, MapPin, Phone, Search, Store, X } from "lucide-react";
import { useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { PublicBookingBranchSummary } from "@/types/public-booking";

interface BranchSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: PublicBookingBranchSummary[];
  currentBranchId: string;
  onSelectBranch: (branchPublicId: string) => void;
}

export function BranchSelectorModal({
  open,
  onOpenChange,
  branches,
  currentBranchId,
  onSelectBranch,
}: BranchSelectorModalProps) {
  const locale = useLocale();
  const isTh = locale === "th";
  const [keyword, setKeyword] = useState("");

  const filteredBranches = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter((b) => {
      const matchName = b.name.toLowerCase().includes(q);
      const matchAddress = b.address ? b.address.toLowerCase().includes(q) : false;
      const matchPhone = b.phone ? b.phone.includes(q) : false;
      return matchName || matchAddress || matchPhone;
    });
  }, [branches, keyword]);

  const handleSelect = (branchPublicId: string) => {
    onSelectBranch(branchPublicId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="default" className="max-h-[85vh] overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2 text-[#43694e]">
            <Store className="size-5" />
            <DialogTitle className="text-lg font-bold text-slate-900">
              {isTh ? "เลือกสาขาที่ต้องการเข้ารับบริการ" : "Select Service Branch"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            {isTh
              ? `มีทั้งหมด ${branches.length} สาขา กรุณาเลือกสาขาที่ท่านสะดวก`
              : `${branches.length} branches available. Please choose your preferred branch.`}
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={
                isTh
                  ? "ค้นหาชื่อสาขา, ถนน, เขต, เบอร์โทร..."
                  : "Search branch name, street, district, phone..."
              }
              className="pl-10 pr-9 h-10 bg-slate-50 border-slate-200 text-sm focus:bg-white"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Branch List */}
          <div className="max-h-[50vh] overflow-y-auto space-y-2.5 pr-1">
            {filteredBranches.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                <Store className="size-10 mx-auto mb-2 opacity-30" />
                <p>{isTh ? "ไม่พบสาขาที่ตรงกับคำค้นหา" : "No branches match your search"}</p>
              </div>
            ) : (
              filteredBranches.map((branch) => {
                const isCurrent = branch.publicId === currentBranchId;
                return (
                  <div
                    key={branch.publicId}
                    onClick={() => handleSelect(branch.publicId)}
                    className={`group relative rounded-xl border p-4 transition-all cursor-pointer ${
                      isCurrent
                        ? "border-[#43694e] bg-[#43694e]/5 shadow-xs ring-1 ring-[#43694e]/30"
                        : "border-slate-200 bg-white hover:border-[#43694e]/60 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 group-hover:text-[#43694e] transition-colors">
                            {branch.name}
                          </p>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#43694e] px-2.5 py-0.5 text-[10px] font-medium text-white">
                              <Check className="size-3" />
                              {isTh ? "สาขาปัจจุบัน" : "Current"}
                            </span>
                          )}
                        </div>

                        {branch.address && (
                          <p className="flex items-start gap-1.5 text-xs text-slate-600 leading-relaxed">
                            <MapPin className="size-3.5 shrink-0 text-slate-400 mt-0.5" />
                            <span className="line-clamp-2">{branch.address}</span>
                          </p>
                        )}

                        {branch.phone && (
                          <p className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="size-3.5 shrink-0 text-slate-400" />
                            <span>{branch.phone}</span>
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 pt-0.5">
                        <Button
                          size="sm"
                          variant={isCurrent ? "default" : "outline"}
                          className={`h-8 text-xs font-medium ${
                            isCurrent
                              ? "bg-[#43694e] text-white hover:bg-[#34533d]"
                              : "border-slate-300 text-slate-700 group-hover:border-[#43694e] group-hover:text-[#43694e]"
                          }`}
                        >
                          {isCurrent
                            ? isTh
                              ? "เลือกอยู่แล้ว"
                              : "Selected"
                            : isTh
                              ? "เลือกสาขานี้"
                              : "Select"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

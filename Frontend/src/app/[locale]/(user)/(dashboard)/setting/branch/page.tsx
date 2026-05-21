"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useShop } from "@/hooks/use-me";
import { BranchDto } from "@/types/shop/shop-responsd";
import { storage } from "@/services/localstorage";

const SettingShopPage = () => {
  const { data: shopData, isLoading } = useShop();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchDto | null>(null);

  // sync isActive จาก shopData
  useEffect(() => {
    if (shopData?.isActive !== undefined) {
      setIsOpen(shopData.isActive);
    }
  }, [shopData?.isActive]);

  // หา branch ที่ตรงกับ branchselect
  useEffect(() => {
    if (!shopData?.shopBranches?.length) return;

    const resolveBranch = async () => {
      const branchselect: number | null = await storage.get("branch") || shopData.shopBranches?.[0]?.id || null;
      const branch = shopData.shopBranches?.find((b) => b.id === branchselect) ?? shopData?.shopBranches[0];
      setSelectedBranch(branch);
    };

    resolveBranch();
  }, [shopData?.shopBranches]);
  

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: เรียก API update ข้อมูลสาขา
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!shopData) return <div>ไม่พบข้อมูลร้านค้า</div>;

  return (
    <div className="space-y-5">

      {/* ── Section 1: รูปภาพร้านค้า (คงเดิม) ── */}
      <Card className="p-6 pb-10 md:pt-[84px] pt-10 rounded-lg lg:flex lg:space-y-0 space-y-6 justify-between items-end relative z-[1]">
        <div className="bg-default-900 dark:bg-default-400 absolute left-0 top-0 md:h-1/2 h-[150px] w-full z-[-1] rounded-t-lg" />

        <div className="profile-box flex-none md:text-start text-center">
          <div className="md:flex items-end md:space-x-6 rtl:space-x-reverse">
            {/* Avatar */}
            <div className="flex-none">
              <div className="md:h-[186px] md:w-[186px] h-[140px] w-[140px] md:ml-0 md:mr-0 ml-auto mr-auto md:mb-0 mb-4 rounded-full ring-4 dark:ring-default-700 ring-default-50 relative">
                <Image
                  width={300}
                  height={300}
                  src={shopData.logo ?? "https://avatars.githubusercontent.com/u/9919?s=200&v=4"}
                  alt={shopData.name}
                  className="w-full h-full object-cover rounded-full"
                />
                <Link
                  href="#"
                  className="absolute right-2 h-8 w-8 bg-default-50 text-default-600 rounded-full shadow-sm flex flex-col items-center justify-center md:top-[140px] top-[100px]"
                >
                  <Icon icon="heroicons:pencil-square" />
                </Link>
              </div>
            </div>

            {/* ชื่อร้าน */}
            <div className="flex-1">
              <div className="text-2xl font-medium text-default-900 mb-[3px]">
                {shopData.name}
              </div>
              <div className="text-sm font-light text-default-600">
                ร้านค้า
              </div>
            </div>
          </div>
        </div>

        {/* ปุ่มเปิด/ปิดทำการ */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-default-600">
            {isOpen ? "เปิดทำการ" : "ปิดทำการ"}
          </span>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none
              ${isOpen ? "bg-primary" : "bg-default-300 dark:bg-default-600"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300
                ${isOpen ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium
              ${isOpen
                ? "bg-success/10 text-success"
                : "bg-default-100 text-default-500 dark:bg-default-700"}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-success" : "bg-default-400"}`} />
            {isOpen ? "เปิดอยู่" : "ปิดอยู่"}
          </span>
        </div>
      </Card>

      {/* ── Section 2: ข้อมูลสาขา ── */}
      {selectedBranch ? (
        <Card>
          <div className="border-b border-default-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-default-900">ข้อมูลสาขา</p>
                <p className="mt-0.5 text-xs text-default-500">ชื่อสาขา เบอร์โทร และที่อยู่</p>
              </div>
              {/* dropdown เปลี่ยนสาขา (ถ้ามีหลายสาขา) */}
              {shopData.shopBranches.length > 1 && (
                <select
                  value={selectedBranch.id}
                  onChange={(e) => {
                    const branch = shopData.shopBranches.find((b) => b.id === Number(e.target.value));
                    if (branch) setSelectedBranch(branch);
                  }}
                  className="h-8 rounded-md border border-default-200 bg-default-50 px-2 text-xs text-default-700 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800"
                >
                  {shopData.shopBranches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="space-y-4 px-6 py-5">
            {/* ชื่อสาขา + เบอร์ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs text-default-500">ชื่อสาขา *</label>
                <input
                  type="text"
                  defaultValue={selectedBranch.name}
                  key={`name-${selectedBranch.id}`}
                  className="h-9 w-full rounded-md border border-default-200 bg-default-50 px-3 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-default-500">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  defaultValue={selectedBranch.phone ?? ""}
                  key={`phone-${selectedBranch.id}`}
                  placeholder="0XX-XXX-XXXX"
                  className="h-9 w-full rounded-md border border-default-200 bg-default-50 px-3 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800"
                />
              </div>
            </div>

            {/* ที่อยู่ */}
            <div className="space-y-1.5">
              <label className="text-xs text-default-500">บ้านเลขที่ / ถนน</label>
              <input
                type="text"
                defaultValue={
                  [selectedBranch.address?.houseNo, selectedBranch.address?.street]
                    .filter(Boolean)
                    .join(" ")
                }
                key={`street-${selectedBranch.id}`}
                placeholder="บ้านเลขที่ และถนน"
                className="h-9 w-full rounded-md border border-default-200 bg-default-50 px-3 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs text-default-500">แขวง / ตำบล</label>
                <input
                  type="text"
                  defaultValue={selectedBranch.address?.subdistrict ?? ""}
                  key={`subdistrict-${selectedBranch.id}`}
                  className="h-9 w-full rounded-md border border-default-200 bg-default-50 px-3 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-default-500">เขต / อำเภอ</label>
                <input
                  type="text"
                  defaultValue={selectedBranch.address?.district ?? ""}
                  key={`district-${selectedBranch.id}`}
                  className="h-9 w-full rounded-md border border-default-200 bg-default-50 px-3 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-default-500">จังหวัด</label>
                <input
                  type="text"
                  defaultValue={selectedBranch.address?.province ?? ""}
                  key={`province-${selectedBranch.id}`}
                  className="h-9 w-full rounded-md border border-default-200 bg-default-50 px-3 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs text-default-500">รหัสไปรษณีย์</label>
                <input
                  type="text"
                  defaultValue={selectedBranch.address?.zipcode ?? ""}
                  key={`zipcode-${selectedBranch.id}`}
                  maxLength={5}
                  className="h-9 w-full rounded-md border border-default-200 bg-default-50 px-3 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-default-500">ที่อยู่เต็ม (อัตโนมัติ)</label>
                <input
                  type="text"
                  readOnly
                  value={selectedBranch.address?.fullAddress ?? ""}
                  className="h-9 w-full rounded-md border border-default-200 bg-default-100 px-3 text-sm text-default-500 cursor-not-allowed dark:bg-default-700"
                />
              </div>
            </div>
          </div>

          {/* ปุ่ม Update */}
          <div className="flex items-center justify-end gap-3 border-t border-default-200 px-6 py-4">
            <button
              type="button"
              className="h-9 rounded-md border border-default-200 bg-default-50 px-4 text-sm text-default-600 hover:bg-default-100 dark:bg-default-800 dark:hover:bg-default-700"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Icon icon="heroicons:check" className="h-3.5 w-3.5" />
                  บันทึกข้อมูล
                </>
              )}
            </button>
          </div>
        </Card>
      ) : (
        <Card className="flex h-32 items-center justify-center">
          <p className="text-sm text-default-400">ไม่พบข้อมูลสาขา</p>
        </Card>
      )}

    </div>
  );
};

export default SettingShopPage;
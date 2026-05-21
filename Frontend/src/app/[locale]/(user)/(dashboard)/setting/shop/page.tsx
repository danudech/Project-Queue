"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useShop } from "@/hooks/use-me";

const SettingShopPage = () => {
  const { data: shopData, isLoading } = useShop();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  // sync ค่าจาก shopData หลังจาก fetch เสร็จ
  useEffect(() => {
    if (shopData?.isActive !== undefined) {
      setIsOpen(shopData.isActive);
    }
  }, [shopData?.isActive]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: เรียก API update ข้อมูลร้าน
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

      {/* ── Section 1: รูปภาพร้านค้า ── */}
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

        {/* ── ปุ่มเปิด/ปิดทำการ ── */}
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

      {/* ── Section 2: ข้อมูลพื้นฐาน ── */}
      <Card>
        <div className="border-b border-default-200 px-6 py-4">
          <p className="text-sm font-medium text-default-900">ข้อมูลพื้นฐาน</p>
          <p className="mt-0.5 text-xs text-default-500">ชื่อร้าน คำอธิบาย และช่องทางติดต่อ</p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs text-default-500">ชื่อร้านค้า *</label>
              <input
                type="text"
                defaultValue={shopData.name}
                className="h-9 w-full rounded-md border border-default-200 bg-default-50 px-3 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-default-500">ประเภทธุรกิจ</label>
              <select className="h-9 w-full rounded-md border border-default-200 bg-default-50 px-3 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800">
                <option value="">เลือกประเภท</option>
                <option value="barber">ร้านตัดผม</option>
                <option value="salon">ร้านเสริมสวย</option>
                <option value="spa">สปา / นวด</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-default-500">คำอธิบายร้าน</label>
            <textarea
              rows={3}
              placeholder="แนะนำร้านของคุณให้ลูกค้ารู้จัก..."
              className="w-full rounded-md border border-default-200 bg-default-50 px-3 py-2 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs text-default-500">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                defaultValue={shopData.phone ?? ""}
                placeholder="0XX-XXX-XXXX"
                className="h-9 w-full rounded-md border border-default-200 bg-default-50 px-3 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-default-500">อีเมล</label>
              <input
                type="email"
                placeholder="shop@example.com"
                className="h-9 w-full rounded-md border border-default-200 bg-default-50 px-3 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800"
              />
            </div>
          </div>
        </div>

        {/* ── ปุ่ม Update ── */}
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

    </div>
  );
};

export default SettingShopPage;
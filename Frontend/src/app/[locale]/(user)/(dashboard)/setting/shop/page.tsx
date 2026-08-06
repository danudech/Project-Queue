"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useShop } from "@/hooks/use-me";
import { usePermissions } from "@/hooks/use-permissions";
import { useTranslations, useLocale } from "next-intl";
import { http } from "@/lib/http/client";
import { env } from "@/config/env";
import { ShopType } from "@/types/shop/shoptype";

const SettingShopPage = () => {
  const t = useTranslations("Settings.shop");
  const { data: shopData, isLoading } = useShop();
  const { can } = usePermissions();
  const canEditShop = can("shop.edit");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCover, setSelectedCover] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [coverPositionY, setCoverPositionY] = useState(50);
  const [coverPositionX, setCoverPositionX] = useState(50);
  const coverDrag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const [logoPositionX, setLogoPositionX] = useState(50);
  const [logoPositionY, setLogoPositionY] = useState(50);
  const logoDrag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [shopTypes, setShopTypes] = useState<ShopType[]>([]);
  const [selectedShopType, setSelectedShopType] = useState("");
  const [isLoadingShopTypes, setIsLoadingShopTypes] = useState(true);
  const locale = useLocale();

  const getLogoUrl = (url: string | null | undefined) => {
    if (!url) return "https://avatars.githubusercontent.com/u/9919?s=200&v=4";
    if (url.startsWith("http")) return url;
    return `${env.apiBaseUrl.replace('/api/v1', '')}${url}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedCover(file);
    setCoverPreviewUrl(URL.createObjectURL(file));
  };

  // Note
  useEffect(() => {
    if (shopData?.isActive !== undefined) {
      setIsOpen(shopData.isActive);
    }
  }, [shopData?.isActive]);

  useEffect(() => {
    const match = shopData?.coverPosition?.match(/(\d+)%\s+(\d+)%/);
    if (match) { setCoverPositionX(Number(match[1])); setCoverPositionY(Number(match[2])); }
  }, [shopData?.coverPosition]);

  useEffect(() => {
    const match = shopData?.logoPosition?.match(/(\d+)%\s+(\d+)%/);
    if (match) { setLogoPositionX(Number(match[1])); setLogoPositionY(Number(match[2])); }
  }, [shopData?.logoPosition]);

  useEffect(() => {
    setIsLoadingShopTypes(true);
    http.get<ShopType[]>("shoptype")
      .then((res) => { if (res) setShopTypes(res) })
      .catch(console.error)
      .finally(() => setIsLoadingShopTypes(false));
  }, []);

  useEffect(() => {
    setSelectedShopType(shopData?.type ? String(shopData.type) : "");
  }, [shopData?.type]);

  const handleSave = async () => {
    if (!canEditShop) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      if (selectedFile) formData.append("Logo", selectedFile);
      if (selectedCover) formData.append("Cover", selectedCover);
      formData.append("CoverPosition", `${coverPositionX}% ${coverPositionY}%`);
      formData.append("LogoPosition", `${logoPositionX}% ${logoPositionY}%`);
      formData.append("IsActive", String(isOpen));
      
      const branchId = shopData?.shopBranches?.[0]?.id;
      if (branchId) formData.append("BranchId", String(branchId));
      
      const descEl = document.getElementById("shop-description") as HTMLTextAreaElement;
      if (descEl) formData.append("Description", descEl.value);
      
      const emailEl = document.getElementById("shop-email") as HTMLInputElement;
      if (emailEl) formData.append("Email", emailEl.value);
      
      const nameEl = document.getElementById("shop-name") as HTMLInputElement;
      if (nameEl) formData.append("Name", nameEl.value);
      
      if (selectedShopType) formData.append("TypeId", selectedShopType);

      // TODO: Connect with actual update API when ready
      await http.put("updateshop", formData);
      window.location.reload(); // Refresh to show new data
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!shopData) return <div>{t("noShopData")}</div>;

  return (
    <div className="space-y-5">

      {/* Section */}
      <Card className="p-6 pb-10 md:pt-[84px] pt-10 rounded-lg lg:flex lg:space-y-0 space-y-6 justify-between items-end relative z-[1] text-white">
        <div className="pointer-events-none absolute inset-0 z-[-1] h-full w-full rounded-lg bg-cover bg-no-repeat" style={{ backgroundPosition: `${coverPositionX}% ${coverPositionY}%`, backgroundSize: "cover", backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.82), rgba(15,23,42,.42)), url(${coverPreviewUrl || getLogoUrl(shopData.cover)})` }} />
        <button type="button" onClick={() => coverInputRef.current?.click()} className="absolute right-5 top-5 z-30 inline-flex cursor-pointer items-center gap-2 rounded-md bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-white"><Icon icon="heroicons:pencil-square" className="size-4" />{t("changeCover")}</button>
        <input id="shop-cover-upload" ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />

        <div className="profile-box relative z-10 flex-none md:text-start text-center">
          <div className="md:flex items-end md:space-x-6 rtl:space-x-reverse">
            {/* Avatar */}
            <div className="flex-none">
              <div className="relative md:h-[186px] md:w-[186px] h-[140px] w-[140px] md:ml-0 md:mr-0 ml-auto mr-auto md:mb-0 mb-4 cursor-grab rounded-full ring-4 active:cursor-grabbing dark:ring-default-700 ring-default-50" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); logoDrag.current = { x: event.clientX, y: event.clientY, startX: logoPositionX, startY: logoPositionY }; }} onPointerMove={(event) => { const start = logoDrag.current; if (!start) return; const rect = event.currentTarget.getBoundingClientRect(); setLogoPositionX(Math.max(0, Math.min(100, start.startX - ((event.clientX - start.x) / rect.width) * 100))); setLogoPositionY(Math.max(0, Math.min(100, start.startY - ((event.clientY - start.y) / rect.height) * 100))); }} onPointerUp={() => { logoDrag.current = null; }} onPointerCancel={() => { logoDrag.current = null; }}>
                <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                <Image
                  width={300}
                  height={300}
                  src={previewUrl || getLogoUrl(shopData.logo)}
                  alt={shopData.name}
                  className="h-full w-full touch-none rounded-full object-cover"
                  style={{ objectPosition: `${logoPositionX}% ${logoPositionY}%` }}
                />
                </div>
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute right-0 z-20 cursor-pointer h-8 w-8 bg-default-50 text-default-600 rounded-full shadow-sm flex flex-col items-center justify-center md:top-[140px] top-[100px] hover:bg-default-100 transition-colors"
                >
                  <Icon icon="heroicons:pencil-square" />
                </button>
                <input
                  id="shop-logo-upload"
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Section */}
            <div className="flex-1">
              <div className="text-2xl font-medium text-white mb-[3px]">
                {shopData.name}
              </div>
              <div className="text-sm font-light text-white/75">{t("shopType")}</div>
            </div>
          </div>
        </div>

        {/* Section */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-sm text-white/85">
            {isOpen ? t("open") : t("closed")}
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
            {isOpen ? t("openLabel") : t("closedLabel")}
          </span>
        </div>
      </Card>

      {/* Section */}
      <Card>
        <div className="border-b border-default-200 px-6 py-4">
          <p className="text-sm font-medium text-default-900">{t("basicInfo")}</p>
          <p className="mt-0.5 text-xs text-default-500">{t("basicInfoDescription")}</p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs text-default-500">{t("shopName")} *</label>
              <input
                id="shop-name"
                type="text"
                defaultValue={shopData.name}
                className="h-9 w-full rounded-md border border-default-200 bg-default-50 px-3 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-default-500">{t("businessType")}</label>
              <select
                id="shop-type"
                value={selectedShopType}
                onChange={(event) => setSelectedShopType(event.target.value)}
                disabled={isLoadingShopTypes || !canEditShop}
                className="h-9 w-full rounded-md border border-default-200 bg-default-50 px-3 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60 dark:bg-default-800"
              >
                <option value="">
                  {isLoadingShopTypes ? t("loadingBusinessTypes") : t("selectBusinessType")}
                </option>
                {shopTypes.map((type) => (
                  <option key={type.id} value={type.id.toString()}>
                    {locale === "th" ? type.nameTh : type.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-default-500">{t("descriptionLabel")}</label>
            <textarea
              id="shop-description"
              rows={3}
              defaultValue={shopData.description ?? ""}
              placeholder={t("descriptionPlaceholder")}
              className="w-full rounded-md border border-default-200 bg-default-50 px-3 py-2 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs text-default-500">{t("phone")}</label>
              <input
                type="tel"
                defaultValue={shopData.phone ?? ""}
                placeholder="0XX-XXX-XXXX"
                className="h-9 w-full rounded-md border border-default-200 bg-default-50 px-3 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800"
                readOnly
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-default-500">{t("email")}</label>
              <input
                id="shop-email"
                type="email"
                defaultValue={shopData.email ?? ""}
                placeholder="shop@example.com"
                className="h-9 w-full rounded-md border border-default-200 bg-default-50 px-3 text-sm text-default-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800"
              />
            </div>
          </div>
        </div>

        {/* Section */}
        <div className="flex items-center justify-end gap-3 border-t border-default-200 px-6 py-4">
          <button
            type="button"
            className="h-9 rounded-md border border-default-200 bg-default-50 px-4 text-sm text-default-600 hover:bg-default-100 dark:bg-default-800 dark:hover:bg-default-700"
          >{t("cancel")}</button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !canEditShop}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t("saving")}
              </>
            ) : (
              <>
                <Icon icon="heroicons:check" className="h-3.5 w-3.5" />
                {t("saveData")}
              </>
            )}
          </button>
        </div>
      </Card>

    </div>
  );
};

export default SettingShopPage;

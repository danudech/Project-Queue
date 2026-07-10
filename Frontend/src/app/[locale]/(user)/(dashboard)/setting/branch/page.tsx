"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Building2, Loader2, MapPin, Phone, ChevronDown, Check, Store, X } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import Image from "next/image";
import { useShop } from "@/hooks/use-me";
import { AddressDto, BranchDto } from "@/types/shop/shop-responsd";
import { storage } from "@/services/localstorage";
import z from "zod";
import { AddressType } from "@/types/address/address-type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { http } from "@/lib/http/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Schema ───────────────────────────────────────────────────────────────────

const getBranchSchema = (t: any) => z.object({
  branchName: z.string().min(2, t("validation.branchNameMin")),
  branchPhone: z.string()
    .refine((val) => val === "" || /^0\d{9}$/.test(val), {
      message: t("validation.phoneFormat")
    })
    .optional()
    .or(z.literal("")),
  houseNo: z.string().optional(),
  street: z.string().optional(),
  zipcode: z.string().length(5, t("validation.zipcodeLength")),
  subdistrictId: z.number().min(1, t("validation.selectSubdistrict")),
  districtId: z.number(),
  provinceId: z.number(),
  districtName: z.string().optional(),
  provinceName: z.string().optional(),
})

type BranchValues = z.infer<ReturnType<typeof getBranchSchema>>;

// ─── Default form values ───────────────────────────────────────────────────────

const defaultValues: BranchValues = {
  branchName: "",
  branchPhone: "",
  houseNo: "",
  street: "",
  zipcode: "",
  subdistrictId: 0,
  districtId: 0,
  provinceId: 0,
  districtName: "",
  provinceName: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

const SettingShopBranchPage = () => {
  const t = useTranslations("Settings.branch");
  const { data: shopData, isLoading } = useShop();

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchDto | null>(null);
  const [addressList, setAddressList] = useState<AddressType[] | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const isInitialLoad = useRef(false);
  const [pendingAddress, setPendingAddress] = useState<{
    address: AddressDto | null;
    list: AddressType[];
  } | null>(null);

  const form = useForm<BranchValues>({
    resolver: zodResolver(getBranchSchema(t)),
    defaultValues,
  });

  const watchZipcode = form.watch("zipcode") ?? "";
  const watchSubdistrictId = form.watch("subdistrictId");

  useEffect(() => {
    if (!shopData || !selectedBranch) return;
    isInitialLoad.current = true;

    const calladdress = async () => {
      try {
        const address: AddressDto | null = selectedBranch.address ?? null;
        const res = await http.get<AddressType[]>("addressbyzipcode", {
          params: { zipcode: address?.zipcode },
        });

        // Note
        form.setValue("branchName", selectedBranch.name);
        form.setValue("branchPhone", selectedBranch.phone ?? "");
        form.setValue("houseNo", address?.houseNo ?? "");
        form.setValue("street", address?.street ?? "");
        form.setValue("zipcode", address?.zipcode ?? "");

        // Note
        setAddressList(res?.length ? res : null);
        setPendingAddress({ address, list: res ?? [] });
      } catch (err) {
        console.error(err);
        setAddressList(null);
      }
    };
    calladdress();
  }, [shopData, selectedBranch]);

  useEffect(() => {
    if (!pendingAddress || !addressList) return;

    const { address, list } = pendingAddress;
    const subdistrict = list.find(
      (a) => a.subdistrictNameTh === address?.subdistrict
    );

    form.setValue("subdistrictId", subdistrict?.subdistrictId ?? 0);
    form.setValue("districtId", subdistrict?.districtId ?? 0);
    form.setValue("provinceId", subdistrict?.provinceId ?? 0);
    form.setValue("districtName", subdistrict?.districtNameTh ?? "");
    form.setValue("provinceName", subdistrict?.provinceNameTh ?? "");

    setPendingAddress(null); // clear pending
  }, [addressList, pendingAddress]);

  // ── Fetch address by zipcode ────────────────────────────────────────────────
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    if (watchZipcode.length !== 5) {
      setAddressList(null);
      if (watchZipcode.length < 5) {
        form.setValue("subdistrictId", 0);
        form.setValue("districtId", 0);
        form.setValue("provinceId", 0);
        form.setValue("districtName", "");
        form.setValue("provinceName", "");
      }
      return;
    }

    const fetchAddress = async () => {
      setIsLoadingAddress(true);
      try {
        const res = await http.get<AddressType[]>("addressbyzipcode", {
          params: { zipcode: watchZipcode },
        });
        setAddressList(res?.length ? res : null);
      } catch (err) {
        console.error(err);
        setAddressList(null);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    fetchAddress();
  }, [watchZipcode, form]);

  // ── Auto-fill district/province from subdistrict selection ─────────────────
  useEffect(() => {
    if (!addressList || !watchSubdistrictId) {
      if (!watchSubdistrictId) {
        form.setValue("districtName", "");
        form.setValue("provinceName", "");
      }
      return;
    }
    const selected = addressList.find(
      (a) => a.subdistrictId === Number(watchSubdistrictId)
    );
    if (selected) {
      form.setValue("districtId", selected.districtId);
      form.setValue("provinceId", selected.provinceId);
      form.setValue("districtName", selected.districtNameTh);
      form.setValue("provinceName", selected.provinceNameTh);
    }
  }, [watchSubdistrictId, addressList, form]);

  // ── Sync shop open/close status ─────────────────────────────────────────────
  useEffect(() => {
    if (shopData?.isActive !== undefined) setIsOpen(shopData.isActive);
  }, [shopData?.isActive]);

  // ── Resolve selected branch from storage or first branch ───────────────────
  useEffect(() => {
    if (!shopData?.shopBranches?.length) return;
    const resolveBranch = async () => {
      const stored: number | null = (await storage.get("branch")) || null;
      const branch =
        shopData.shopBranches?.find((b) => b.id === stored) ??
        shopData.shopBranches[0];
      setSelectedBranch(branch);
    };
    resolveBranch();
  }, [shopData?.shopBranches]);


  // ── Submit handler ──────────────────────────────────────────────────────────
  const handleSave = useCallback(
    form.handleSubmit(async (values) => {
      setIsSaving(true);
      try {
        // Note
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } finally {
        setIsSaving(false);
      }
    }),
    [form]
  );

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!shopData) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <Store className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-default-600">{t("noShopData")}</p>
          <p className="text-xs text-muted-foreground">{t("tryAgain")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ══ Section 1: Shop Profile Banner ══════════════════════════════════════ */}
      <Card className="relative z-[1] overflow-hidden rounded-xl p-6 pb-10 pt-10 md:pt-[84px]">
        {/* Banner background */}
        <div className="absolute inset-x-0 top-0 z-[-1] h-[150px] rounded-t-xl bg-gradient-to-r from-default-900 to-default-700 dark:from-default-400 dark:to-default-500 md:h-1/2" />

        <div className="lg:flex lg:items-end lg:justify-between lg:space-y-0 space-y-6">
          {/* Avatar + Shop Name */}
          <div className="md:flex md:items-end md:space-x-6 rtl:space-x-reverse">
            <div className="flex-none">
              <div className="relative mx-auto mb-4 h-[140px] w-[140px] overflow-hidden rounded-full ring-4 ring-default-50 dark:ring-default-700 md:mx-0 md:mb-0 md:h-[186px] md:w-[186px]">
                <Image
                  fill
                  src={
                    shopData.logo ??
                    "https://avatars.githubusercontent.com/u/9919?s=200&v=4"
                  }
                  alt={shopData.name}
                  className="object-cover"
                />
              </div>
            </div>
            <div className="text-center md:text-start">
              <h2 className="mb-1 text-2xl font-semibold text-default-900">
                {shopData.name}
              </h2>
              <p className="text-sm font-light text-default-600">{t("shopType")}</p>
            </div>
          </div>

          {/* Open/Close Toggle */}
          <div className="flex items-center justify-center gap-3 md:justify-end">
            <span className="text-sm text-default-600">
              {isOpen ? t("open") : t("closed")}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-pressed={isOpen}
              aria-label={t("toggleAria")}
              className={[
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isOpen
                  ? "bg-primary"
                  : "bg-default-300 dark:bg-default-600",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300",
                  isOpen ? "translate-x-6" : "translate-x-1",
                ].join(" ")}
              />
            </button>
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                isOpen
                  ? "bg-success/10 text-success"
                  : "bg-default-100 text-default-500 dark:bg-default-700",
              ].join(" ")}
            >
              <span
                className={[
                  "h-1.5 w-1.5 rounded-full",
                  isOpen ? "bg-success animate-pulse" : "bg-default-400",
                ].join(" ")}
              />
              {isOpen ? t("openLabel") : t("closedLabel")}
            </span>
          </div>
        </div>
      </Card>

      {/* ══ Section 2: Branch Info Form ══════════════════════════════════════════ */}
      {selectedBranch ? (
        <Card className="overflow-hidden rounded-xl">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-default-200 px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-default-900">{t("infoTitle")}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t("infoDescription")}</p>
            </div>

            {/* Branch Switcher (multi-branch) */}
            {shopData.shopBranches.length > 1 && (
              <div className="relative">
                <select
                  value={selectedBranch.id}
                  onChange={(e) => {
                    const branch = shopData.shopBranches.find(
                      (b) => b.id === Number(e.target.value)
                    );
                    if (branch) setSelectedBranch(branch);
                  }}
                  className="h-8 appearance-none rounded-md border border-default-200 bg-default-50 pl-3 pr-7 text-xs text-default-700 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-default-800 dark:text-default-200"
                >
                  {shopData.shopBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Form Body */}
          <Form {...form}>
            <form onSubmit={handleSave} noValidate>
              <div className="space-y-5 px-6 pb-4 pt-5">
                {/* Section */}
                <FormField
                  control={form.control}
                  name="branchName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs font-medium">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {t("branchName")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("branchNamePlaceholder")}
                          className="h-10 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Section */}
                <FormField
                  control={form.control}
                  name="branchPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs font-medium">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {t("branchPhone")}{" "}
                        <span className="text-[11px] font-normal text-muted-foreground">
                          {t("optional")}
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0812345678"
                          className="h-10 text-sm"
                          type="tel"
                          maxLength={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* ── {t("branchAddress")} ───────────────────────────────────────────── */}
                <div className="space-y-4 rounded-lg border border-dashed border-default-200 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("branchAddress")}
                  </p>

                  {/* {t("houseNo")} + {t("street")} */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="houseNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] text-muted-foreground">
                            {t("houseNo")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="99/9"
                              className="h-9 text-sm"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] text-muted-foreground">
                            {t("street")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("streetPlaceholder")}
                              className="h-9 text-sm"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* {t("zipcode")} */}
                  <FormField
                    control={form.control}
                    name="zipcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] text-muted-foreground">
                          {t("zipcode")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              maxLength={5}
                              inputMode="numeric"
                              className="h-9 text-sm pr-8"
                              placeholder="10110"
                            />
                            {isLoadingAddress && (
                              <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Section */}
                  <FormField
                    control={form.control}
                    name="subdistrictId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] text-muted-foreground">
                          {t("subdistrict")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(val) => field.onChange(Number(val))}
                          value={
                            field.value > 0 ? field.value.toString() : ""
                          }
                          disabled={!addressList || isLoadingAddress}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue
                                placeholder={
                                  isLoadingAddress
                                    ? t("loadingAddress")
                                    : !watchZipcode || watchZipcode.length < 5
                                      ? t("enterZipcodeFirst")
                                      : addressList === null
                                        ? t("addressNotFound")
                                        : t("selectSubdistrict")
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {addressList?.map((item) => (
                              <SelectItem
                                key={item.subdistrictId}
                                value={item.subdistrictId.toString()}
                                className="text-xs"
                              >
                                {item.subdistrictNameTh}
                                <span className="ml-1 text-muted-foreground">
                                  ({item.districtNameTh})
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Section */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormItem>
                      <FormLabel className="text-[11px] text-muted-foreground">
                        {t("district")}
                      </FormLabel>
                      <Input
                        value={form.watch("districtName") ?? ""}
                        readOnly
                        className="h-9 cursor-not-allowed bg-muted/40 text-xs"
                        placeholder="—"
                      />
                      <input type="hidden" {...form.register("districtId")} />
                    </FormItem>
                    <FormItem>
                      <FormLabel className="text-[11px] text-muted-foreground">
                        {t("province")}
                      </FormLabel>
                      <Input
                        value={form.watch("provinceName") ?? ""}
                        readOnly
                        className="h-9 cursor-not-allowed bg-muted/40 text-xs"
                        placeholder="—"
                      />
                      <input type="hidden" {...form.register("provinceId")} />
                    </FormItem>
                  </div>
                </div>
              </div>

              {/* ── Footer Buttons ────────────────────────────────────────────── */}
              <div className="flex items-center justify-end gap-3 border-t border-default-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => form.reset()}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-default-200 bg-default-50 px-4 text-sm text-default-600 transition-colors hover:bg-default-100 dark:bg-default-800 dark:hover:bg-default-700"
                >
                  <X className="h-3.5 w-3.5" />{t("reset")}</button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={[
                    "inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-60",
                    saveSuccess
                      ? "bg-success hover:bg-success/90"
                      : "bg-primary hover:bg-primary/90",
                  ].join(" ")}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {t("saving")}
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      {t("saved")}
                    </>
                  ) : (
                    <>
                      <Icon icon="heroicons:check" className="h-3.5 w-3.5" />
                      {t("saveData")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </Form>
        </Card>
      ) : (
        <Card className="flex h-32 items-center justify-center rounded-xl">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <Building2 className="h-6 w-6 text-muted-foreground/40" />
            <p className="text-sm text-default-400">{t("noBranchData")}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SettingShopBranchPage;

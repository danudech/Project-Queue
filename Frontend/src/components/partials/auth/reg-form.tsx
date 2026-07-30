"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Controller, useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { http } from "@/lib/http/client";
import { UserRegister, UserRegisterResponse } from "@/types/user";
import { storage } from "@/services/localstorage";
import { Link, useRouter } from "@/i18n/routing";
import { startRouteLoading } from "@/lib/route-loading";
import { useSearchParams } from "next/navigation";

const RegForm = () => {
  const t = useTranslations("Auth.register");
  const [loading, setLoading] = React.useState(false);
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isStaffInvitation = searchParams.get("invited") === "1";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UserRegister>({
    defaultValues: {
      name: searchParams.get("name") ?? "",
      email: searchParams.get("email") ?? "",
      phone: searchParams.get("phone") ?? "",
      acceptTerms: false,
      locale: "en",
    },
  });

  const onSubmit = async (data: UserRegister) => {
    if (loading) return;
    data.locale = locale;

    try {
      setLoading(true);

      const login = await http.post<UserRegisterResponse>("userregister", data);
      const message =
        login.code === "success"
          ? t("toast.success")
          : login.code === "idle"
            ? t("toast.idle")
            : t("toast.failed");
      toast.success(login.message || message);
      await storage.set("registration", JSON.stringify(data));
      startRouteLoading();
      router.push("/auth/mail-confirm");
    } catch (err: any) {
      toast.error(err.message || t("toast.error"));
      setLoading(false);
    }
  };

  const getGroupClass = (error: any) =>
    cn(
      "merged flex h-12 items-center rounded-md border bg-white transition-colors duration-200",
      "focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100",
      error ? "border-destructive" : "border-slate-200",
    );

  const iconWrapperClass =
    "flex items-center justify-center border-none bg-transparent px-3 text-slate-400";
  const inputBaseClass =
    "h-11 w-full border-none bg-transparent pl-1 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "space-y-4 transition-opacity",
        loading && "pointer-events-none opacity-70",
      )}
    >
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-slate-800">
          {t("name")}
        </Label>
        <InputGroup className={getGroupClass(errors.name)}>
          <InputGroupText className={iconWrapperClass}>
            <Icon icon="mdi:user" fontSize={16} />
          </InputGroupText>
          <Input
            id="name"
            disabled={loading}
            placeholder={t("namePlaceholder")}
            size="sm"
            {...register("name", { required: t("validation.nameRequired") })}
            className={inputBaseClass}
          />
        </InputGroup>
        {errors.name && (
          <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-slate-800">
          {t("email")}
        </Label>
        <InputGroup className={getGroupClass(errors.email)}>
          <InputGroupText className={iconWrapperClass}>
            <Icon icon="ic:outline-email" fontSize={16} />
          </InputGroupText>
          <Input
            type="email"
            id="email"
            disabled={loading}
            readOnly={isStaffInvitation}
            size="sm"
            placeholder={t("emailPlaceholder")}
            {...register("email", {
              required: t("validation.emailRequired"),
              pattern: {
                value: /^\S+@\S+$/i,
                message: t("validation.emailInvalid"),
              },
            })}
            className={inputBaseClass}
          />
        </InputGroup>
        {errors.email && (
          <p className="text-xs text-destructive mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-slate-800">
          {t("phone")}
        </Label>
        <InputGroup className={getGroupClass(errors.phone)}>
          <InputGroupText className={iconWrapperClass}>
            <Icon icon="tdesign:call" fontSize={16} />
          </InputGroupText>
          <Input
            id="phone"
            disabled={loading}
            type="tel"
            size="sm"
            placeholder="08XXXXXXXX"
            {...register("phone", {
              required: false,
              validate: (value) => {
                if (!value) return true;
                if (!/^0/.test(value)) return t("validation.phoneStart");
                if (value.length !== 10) return t("validation.phoneLength");
                if (!/^\d+$/.test(value)) return t("validation.phoneDigits");
                return true;
              },
            })}
            className={inputBaseClass}
          />
        </InputGroup>
        {errors.phone && (
          <p className="text-xs text-destructive mt-1">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="pt-2">
        <Controller
          name="acceptTerms"
          control={control}
          rules={{ required: t("validation.termsRequired") }}
          render={({ field }) => (
            <div className="flex items-start gap-2">
              <Checkbox
                id="acceptTerms"
                disabled={loading}
                checked={field.value}
                onCheckedChange={field.onChange}
                className={cn(errors.acceptTerms && "border-destructive")}
              />
              <div className="flex flex-wrap items-center gap-x-1 text-sm font-normal leading-5 text-slate-600">
                <Label
                  htmlFor="acceptTerms"
                  className="cursor-pointer font-normal text-slate-600"
                >
                  {t("termsPrefix")}
                </Label>
                <Link
                  href="/terms"
                  locale={locale}
                  className="font-medium text-emerald-700 hover:underline"
                >
                  {t("terms")}
                </Link>
                <span>{t("termsAnd")}</span>
                <Link
                  href="/privacy"
                  locale={locale}
                  className="font-medium text-emerald-700 hover:underline"
                >
                  {t("privacy")}
                </Link>
              </div>
            </div>
          )}
        />
        {errors.acceptTerms && (
          <p className="text-xs text-destructive mt-1">
            {errors.acceptTerms.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        fullWidth
        disabled={loading}
        size="lg"
        className="mt-2 h-12 w-full rounded-md bg-emerald-700 text-base font-semibold text-white shadow-none transition-colors hover:bg-emerald-800 hover:text-white active:bg-emerald-900"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
};

export default RegForm;

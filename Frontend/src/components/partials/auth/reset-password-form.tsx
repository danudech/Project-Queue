"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Check } from "lucide-react"; // นำเข้า Check icon
import { toast } from "sonner";
import { http } from "@/lib/http/client";
import { useRouter, useSearchParams } from "next/navigation";

type ResetPasswordRequest = {
  password: string;
  confirmPassword: string;
};

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("ResetPassword");
  const [loading, setLoading] = React.useState(false);

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordRequest>();

  const password = watch("password") || "";

  // ✅ rules realtime
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isValidPassword =
    rules.length &&
    rules.upper &&
    rules.lower &&
    rules.number &&
    rules.special;

  const onSubmit = async (data: ResetPasswordRequest) => {
    if (loading) return;

    if (!isValidPassword) {
      toast.error(t("password_invalid"));
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error(t("password_not_match"));
      return;
    }

    try {
      setLoading(true);
      const resetPassword = await http.post("resetpassword", { NewPassword: data.password });
      if (resetPassword) {
        toast.success(t("success"));
        const returnUrl = searchParams.get("returnUrl");
        let redirectTo = "/dashboard";

        if (returnUrl) {
          redirectTo = returnUrl.replace(`/${locale}`, "") || "/dashboard";
        }

        // เพิ่ม Delay 1.5 วินาที เพื่อให้ผู้ใช้เห็น Notification ก่อน Redirect
        setTimeout(() => {
          router.push(redirectTo);
        }, 1500);
      }
    } catch (err: any) {
      toast.error(err.message || t("error"));
    } finally {
      setLoading(false);
    }
  };

  const getGroupClass = (error: any) =>
    cn(
      "merged border rounded-md transition-all duration-200 flex items-center",
      "focus-within:ring-1 focus-within:ring-primary focus-within:border-primary",
      error ? "border-destructive" : "border-default-300",
    );

  const iconWrapperClass = "bg-transparent border-none text-default-500 px-2.5 flex items-center justify-center";
  const inputBaseClass = "border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent w-full h-9 pl-1 text-sm";

  // Helper สำหรับ Checklist
  const RuleItem = ({ isMet, label }: { isMet: boolean; label: string }) => (
    <div className={cn("flex items-center gap-1.5 transition-colors duration-300", isMet ? "text-success" : "text-default-400")}>
      <Check className={cn("h-3.5 w-3.5", isMet ? "opacity-100" : "opacity-30")} />
      <span>{label}</span>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* NEW PASSWORD */}
      <div className="space-y-1">
        <Label className="text-default-700 font-medium">
          {t("new_password")}
        </Label>
        <InputGroup className={getGroupClass(errors.password)}>
          <InputGroupText className={iconWrapperClass}>
            <Icon icon="mdi:lock-outline" fontSize={16} />
          </InputGroupText>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={t("new_password")}
            {...register("password", {
              required: t("password_required"),
            })}
            className={inputBaseClass}
          />
          <InputGroupText
            className="bg-transparent border-none cursor-pointer hover:text-primary transition-colors px-2.5 text-default-400"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            <Icon icon={showPassword ? "basil:eye-closed-solid" : "basil:eye-outline"} fontSize={16} />
          </InputGroupText>
        </InputGroup>
      </div>

      {/* CONFIRM PASSWORD */}
      <div className="space-y-1">
        <Label className="text-default-700 font-medium">
          {t("confirm_password")}
        </Label>
        <InputGroup className={getGroupClass(errors.confirmPassword)}>
          <InputGroupText className={iconWrapperClass}>
            <Icon icon="mdi:lock-check-outline" fontSize={16} />
          </InputGroupText>
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder={t("confirm_password")}
            {...register("confirmPassword", {
              required: t("password_required"),
              validate: (value) => value === password || t("password_not_match"),
            })}
            className={inputBaseClass}
          />
          <InputGroupText
            className="bg-transparent border-none cursor-pointer hover:text-primary transition-colors px-2.5 text-default-400"
            onClick={() => setShowConfirm((prev) => !prev)}
          >
            <Icon icon={showConfirm ? "basil:eye-closed-solid" : "basil:eye-outline"} fontSize={16} />
          </InputGroupText>
        </InputGroup>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* ✅ REALTIME CHECKLIST */}
      <div className="text-xs space-y-1 mt-2">
        <RuleItem isMet={rules.length} label={t("password_min_length")} />
        <RuleItem isMet={rules.upper} label={t("password_uppercase")} />
        <RuleItem isMet={rules.lower} label={t("password_lowercase")} />
        <RuleItem isMet={rules.number} label={t("password_number")} />
        <RuleItem isMet={rules.special} label={t("password_special")} />
      </div>

      {/* SUBMIT */}
      <Button
        type="submit"
        disabled={loading || !isValidPassword}
        size="lg"
        className="w-full h-11 text-base shadow-sm mt-2 font-semibold"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? t("loading") : t("submit")}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
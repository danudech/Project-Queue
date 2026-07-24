"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { http } from "@/lib/http/client";

type ChangePasswordRequest = {
  oldPassword: string;
  password: string;
  confirmPassword: string;
};

const ChangePasswordForm = () => {
  const t = useTranslations("ResetPassword");
  const tSecurity = useTranslations("AccountSecurity");
  const [loading, setLoading] = React.useState(false);

  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordRequest>();

  const password = watch("password") || "";
  const hasForeignCharacters = /[^\x00-\x7F]/.test(password);

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

  const onSubmit = async (data: ChangePasswordRequest) => {
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
      const changepassword = await http.post("changepassword", { 
        OldPassword: data.oldPassword,
        NewPassword: data.password 
      });
      if (changepassword) {
        toast.success(tSecurity("success"));
        reset(); // Clear form on success
      }
    } catch (err: any) {
      toast.error(err.message || t("error"));
    } finally {
      setLoading(false);
    }
  };

  const getGroupClass = (error: any) =>
    cn(
      "merged flex h-12 items-center rounded-md border bg-white transition-colors duration-200",
      "focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100",
      error ? "border-destructive" : "border-slate-200",
      loading && "cursor-not-allowed opacity-50",
    );

  const iconWrapperClass =
    "flex items-center justify-center border-none bg-transparent px-3 text-slate-400";
  const inputBaseClass =
    "h-11 w-full border-none bg-transparent pl-1 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0";

  const RuleItem = ({ isMet, label }: { isMet: boolean; label: string }) => (
    <div className={cn("flex items-center gap-2 transition-colors duration-300", isMet ? "text-emerald-700" : "text-slate-400")}>
      <Check className={cn("h-3.5 w-3.5", isMet ? "opacity-100" : "opacity-30")} />
      <span>{label}</span>
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-5", loading && "pointer-events-none opacity-70")}
    >
      <div className="space-y-2">
        <Label htmlFor="old-password" className="text-sm font-medium text-slate-800">
          {t("old_password")}
        </Label>
        <InputGroup className={getGroupClass(errors.oldPassword)}>
          <InputGroupText className={iconWrapperClass}>
            <Icon icon="mdi:lock-outline" fontSize={16} />
          </InputGroupText>
          <Input
            id="old-password"
            disabled={loading}
            type={showOldPassword ? "text" : "password"}
            placeholder={t("old_password")}
            {...register("oldPassword", {
              required: t("old_password_required"),
            })}
            className={inputBaseClass}
          />
          <InputGroupText
            className="cursor-pointer border-none bg-transparent px-2.5 text-slate-400 transition-colors hover:text-emerald-700"
            onClick={() => !loading && setShowOldPassword((prev) => !prev)}
          >
            <Icon icon={showOldPassword ? "basil:eye-outline" : "basil:eye-closed-solid"} fontSize={16} />
          </InputGroupText>
        </InputGroup>
        {errors.oldPassword && (
          <p className="mt-1 text-xs text-destructive">{errors.oldPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-sm font-medium text-slate-800">
          {t("new_password")}
        </Label>
        <InputGroup className={getGroupClass(errors.password)}>
          <InputGroupText className={iconWrapperClass}>
            <Icon icon="mdi:lock-outline" fontSize={16} />
          </InputGroupText>
          <Input
            id="new-password"
            disabled={loading}
            type={showPassword ? "text" : "password"}
            placeholder={t("new_password")}
            {...register("password", {
              required: t("password_required"),
            })}
            className={inputBaseClass}
          />
          <InputGroupText
            className="cursor-pointer border-none bg-transparent px-2.5 text-slate-400 transition-colors hover:text-emerald-700"
            onClick={() => !loading && setShowPassword((prev) => !prev)}
          >
            <Icon icon={showPassword ? "basil:eye-outline" : "basil:eye-closed-solid"} fontSize={16} />
          </InputGroupText>
        </InputGroup>
        {errors.password && (
          <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
        )}
        {hasForeignCharacters && (
          <p className="mt-1 text-xs font-medium text-amber-500">
            {t("foreign_keyboard_warning")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-sm font-medium text-slate-800">
          {t("confirm_password")}
        </Label>
        <InputGroup className={getGroupClass(errors.confirmPassword)}>
          <InputGroupText className={iconWrapperClass}>
            <Icon icon="mdi:lock-check-outline" fontSize={16} />
          </InputGroupText>
          <Input
            id="confirm-password"
            disabled={loading}
            type={showConfirm ? "text" : "password"}
            placeholder={t("confirm_password")}
            {...register("confirmPassword", {
              required: t("password_required"),
              validate: (value) => value === password || t("password_not_match"),
            })}
            className={inputBaseClass}
          />
          <InputGroupText
            className="cursor-pointer border-none bg-transparent px-2.5 text-slate-400 transition-colors hover:text-emerald-700"
            onClick={() => !loading && setShowConfirm((prev) => !prev)}
          >
            <Icon icon={showConfirm ? "basil:eye-outline" : "basil:eye-closed-solid"} fontSize={16} />
          </InputGroupText>
        </InputGroup>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="mt-2 grid grid-cols-1 gap-1.5 rounded-lg bg-slate-50 px-4 py-3 text-xs sm:grid-cols-2">
        <RuleItem isMet={rules.length} label={t("password_min_length")} />
        <RuleItem isMet={rules.upper} label={t("password_uppercase")} />
        <RuleItem isMet={rules.lower} label={t("password_lowercase")} />
        <RuleItem isMet={rules.number} label={t("password_number")} />
        <RuleItem isMet={rules.special} label={t("password_special")} />
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={loading || !isValidPassword}
          className="bg-emerald-700 text-white hover:bg-emerald-800"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? t("loading") : tSecurity("submit")}
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;

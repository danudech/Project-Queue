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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { http } from "@/lib/http/client";

type ResetPasswordRequest = {
  password: string;
  confirmPassword: string;
};

const ResetPasswordForm = () => {
  const t = useTranslations("Auth");
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordRequest>();

  const password = watch("password");

  const onSubmit = async (data: ResetPasswordRequest) => {
    if (loading) return;

    if (data.password !== data.confirmPassword) {
      toast.error(t("password_not_match"));
      return;
    }

    try {
      setLoading(true);

      // await http.post<boolean>("resetpassword", {
      //   token,
      //   newPassword: data.password,
      // });

      toast.success("Password reset successfully");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
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

  const iconWrapperClass =
    "bg-transparent border-none text-default-500 px-2.5 flex items-center justify-center";

  const inputBaseClass =
    "border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent w-full h-9 pl-1 text-sm";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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
            type="password"
            placeholder={t("new_password")}
            {...register("password", {
              required: t("password_required"),
              minLength: {
                value: 6,
                message: "Minimum 6 characters",
              },
            })}
            className={inputBaseClass}
          />
        </InputGroup>

        {errors.password && (
          <p className="text-xs text-destructive mt-1">
            {errors.password.message}
          </p>
        )}
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
            type="password"
            placeholder={t("confirm_password")}
            {...register("confirmPassword", {
              required: t("password_required"),
              validate: (value) =>
                value === password || t("password_not_match"),
            })}
            className={inputBaseClass}
          />
        </InputGroup>

        {errors.confirmPassword && (
          <p className="text-xs text-destructive mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* SUBMIT */}
      <Button
        type="submit"
        fullWidth
        disabled={loading}
        size="lg"
        className="w-full h-9 text-base shadow-sm mt-2"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? `${t("reset_password_btn")}...` : t("reset_password_btn")}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;

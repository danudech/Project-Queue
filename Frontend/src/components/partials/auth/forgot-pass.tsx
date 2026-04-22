"use client";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";
import { http } from "@/lib/http/client";

type Inputs = {
  email: string;
};

const RESEND_COOLDOWN = 60;

const ForgotPass = () => {
  const t = useTranslations("ForgotPassword");
  const locale = useLocale();
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!data || loading || countdown > 0) return;
    setLoading(true);
    try {
      await http.post<boolean>("forgotpassword", {
        email: data.email,
        locale: locale,
      });
      setMessage(t("message_sent"));
      setCountdown(RESEND_COOLDOWN);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t("email_label")}</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@gmail.com"
          {...register("email", { required: true })}
          className="h-[48px] text-sm text-default-900"
        />
        {errors.email && <span className="text-destructive text-xs">{t("email_required")}</span>}
      </div>
      {message && <p className="text-green-600 text-sm">{message}</p>}

      <Button type="submit" className="w-full h-[48px]" disabled={loading || countdown > 0}>
        {loading
          ? t("sending")
          : countdown > 0
            ? t("resend_in", { seconds: countdown })
            : t("send_recovery")}
      </Button>
    </form>
  );
};

export default ForgotPass;
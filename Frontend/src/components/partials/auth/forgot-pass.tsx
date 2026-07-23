"use client";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";
import { useLocale, useTranslations } from "next-intl";
import { http } from "@/lib/http/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
      toast.error(err?.message || t("send_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-slate-800">
          {t("email_label")}
        </Label>
        <InputGroup className="merged flex h-12 items-center rounded-md border border-slate-200 bg-white transition-colors duration-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
          <InputGroupText className="flex items-center justify-center border-none bg-transparent px-3 text-slate-400">
            <Icon icon="ic:outline-email" fontSize={16} />
          </InputGroupText>
          <Input
            id="email"
            type="email"
            disabled={loading || countdown > 0}
            placeholder="name@example.com"
            {...register("email", { required: true })}
            className="h-11 w-full border-none bg-transparent pl-1 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </InputGroup>
        {errors.email && <span className="text-destructive text-xs">{t("email_required")}</span>}
      </div>
      {message && (
        <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
          {message}
        </p>
      )}

      <Button
        type="submit"
        className="h-12 w-full rounded-md bg-emerald-700 text-base font-semibold text-white shadow-none transition-colors hover:bg-emerald-800 hover:text-white active:bg-emerald-900"
        disabled={loading || countdown > 0}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

"use client";

import { useEffect, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { http } from "@/lib/http/client";
import { storage } from "@/services/localstorage";
import type { UserRegister } from "@/types/user";

const RESEND_COOLDOWN_SECONDS = 60;

const MailConfirmContent = () => {
  const t = useTranslations("EmailConfirmation");
  const [registration, setRegistration] = useState<UserRegister | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const loadRegistration = async () => {
      const value = await storage.get<string>("registration");
      if (!value) return;

      try {
        setRegistration(JSON.parse(value));
      } catch {
        setRegistration(null);
      }
    };

    loadRegistration();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(
      () => setCountdown((value) => value - 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [countdown]);

  const resendMail = async () => {
    if (!registration || loading || countdown > 0) return;

    try {
      setLoading(true);
      await http.post<string>("resendconfirmation", registration);
      toast.success(t("resend_success"));
      setCountdown(RESEND_COOLDOWN_SECONDS);
    } catch (error: any) {
      toast.error(error?.message || t("resend_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div
        role="img"
        aria-label={t("image_alt")}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50"
      >
        <MailCheck className="h-10 w-10 text-emerald-700" aria-hidden="true" />
      </div>

      <Button
        className="h-12 w-full rounded-md bg-emerald-700 text-base font-semibold text-white shadow-none transition-colors hover:bg-emerald-800 hover:text-white active:bg-emerald-900"
        asChild
      >
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("open_mail_app")}
        </a>
      </Button>

      <p className="text-sm leading-6 text-slate-500">
        {t("didnt_receive_email")}{" "}
        <button
          type="button"
          className="font-semibold text-emerald-700 transition-colors hover:text-emerald-800 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          onClick={resendMail}
          disabled={!registration || loading || countdown > 0}
        >
          {loading && <Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" />}
          {loading
            ? t("sending")
            : countdown > 0
              ? t("resend_in", { seconds: countdown })
              : t("resend_link")}
        </button>
      </p>
    </div>
  );
};

export default MailConfirmContent;

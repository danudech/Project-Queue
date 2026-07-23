"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { http } from "@/lib/http/client";

type VerifyStatus = "loading" | "success" | "error";

const MailVerifyContent = () => {
  const t = useTranslations("MailVerify");
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerifyStatus>("loading");
  const hasCalled = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (hasCalled.current) return;
      hasCalled.current = true;

      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        const result = await http.post<boolean | { status: boolean }>("verifyaccount", {
          token,
        });
        const isSuccess =
          typeof result === "boolean" ? result : result.status;
        setStatus(isSuccess ? "success" : "error");
        if (isSuccess) toast.success(t("success_toast"));
      } catch {
        setStatus("error");
      }
    };

    verifyEmail();
  }, [searchParams, t]);

  const stateStyles = {
    loading: {
      icon: <Loader2 className="h-11 w-11 animate-spin text-emerald-700" />,
      iconClass: "bg-emerald-50",
      title: t("verifying"),
      description: t("please_wait"),
    },
    success: {
      icon: <CheckCircle2 className="h-11 w-11 text-emerald-700" />,
      iconClass: "bg-emerald-50",
      title: t("success_title"),
      description: t("success_desc"),
    },
    error: {
      icon: <XCircle className="h-11 w-11 text-red-600" />,
      iconClass: "bg-red-50",
      title: t("error_title"),
      description: t("error_desc"),
    },
  } satisfies Record<
    VerifyStatus,
    { icon: React.ReactNode; iconClass: string; title: string; description: string }
  >;

  const current = stateStyles[status];

  return (
    <div className="space-y-7 text-center">
      <div
        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${current.iconClass}`}
      >
        {current.icon}
      </div>

      <div>
        <h2 className="text-[30px] font-semibold leading-tight text-slate-950">
          {current.title}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
          {current.description}
        </p>
      </div>

      {status === "success" && (
        <>
          <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
            {t("password_sent_desc")}
          </p>
          <Button
            asChild
            className="h-12 w-full rounded-md bg-emerald-700 text-base font-semibold text-white shadow-none transition-colors hover:bg-emerald-800 hover:text-white active:bg-emerald-900"
          >
            <Link href="/auth/login">{t("go_to_login")}</Link>
          </Button>
        </>
      )}

      {status === "error" && (
        <Button
          asChild
          variant="outline"
          className="h-12 w-full border-slate-200 text-base font-semibold text-slate-800 hover:bg-slate-50"
        >
          <Link href="/">{t("back_to_home")}</Link>
        </Button>
      )}
    </div>
  );
};

export default MailVerifyContent;

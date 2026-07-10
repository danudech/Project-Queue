"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { storage } from "@/services/localstorage";
import { http } from "@/lib/http/client";
import { toast } from "sonner";

const MailVerifyPage = () => {
  const t = useTranslations("MailVerify");
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const hasCalled = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (hasCalled.current) return;
      const token = searchParams.get("token");
      if (!token) return;

      hasCalled.current = true;

      try {
        const res = await http.post<{ status: boolean }>("verifyaccount", {
          token,
        });
        toast.success(
          res ? "Email verified successfully" : "Email verification failed",
        );

        setStatus(res ? "success" : "error");
      } catch {
        setStatus("error");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 px-6">
      {/* Section */}
      <div className="w-full max-w-xl">
        <div className="w-full bg-white/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl text-center border border-white/30 space-y-8">
          {/* Loading */}
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-6 rounded-full mb-6">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900">
                {t("verifying")}
              </h2>

              <p className="text-gray-500 mt-2">{t("please_wait")}</p>
            </div>
          )}

          {/* SUCCESS */}
          {status === "success" && (
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-6 rounded-full mb-6 shadow-inner">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t("success_title")}
              </h2>

              <div className="bg-green-50 border border-green-200 p-5 rounded-xl mb-8 max-w-lg">
                <p className="text-green-700 font-medium">
                  {t("password_sent_desc")}
                </p>
              </div>

              <p className="text-gray-500 mb-8 leading-relaxed max-w-md">
                {t("success_desc")}
              </p>

              <Button
                asChild
                className="w-full max-w-sm h-12 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Link href="/auth/login">{t("go_to_login")}</Link>
              </Button>
            </div>
          )}

          {/* ERROR */}
          {status === "error" && (
            <div className="flex flex-col items-center">
              <div className="bg-red-100 p-6 rounded-full mb-6">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900">
                {t("error_title")}
              </h2>

              <p className="text-gray-500 mt-2 mb-8">{t("error_desc")}</p>

              <div className="flex flex-col w-full max-w-sm gap-3">
                <Button className="h-12 w-full text-base" asChild>
                  <Link href="/">{t("back_to_home")}</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MailVerifyPage;

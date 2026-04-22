"use client";
import Logo from "@/components/partials/auth/logo";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { storage } from "@/services/localstorage";
import { useEffect, useState } from "react";
import { UserRegister } from "@/types/user";
import { http } from "@/lib/http/client";
import { toast } from "sonner";

const FORGOT_PASSWORD_COOLDOWN = 60; // วินาที

const MailConfirm = () => {
  const t = useTranslations("EmailConfirmation");

  const [data, setData] = useState<UserRegister | null>(null);
  const [loading, setLoading] = useState(false);
  const [iscountdown, setIsCountdown] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const regData = await storage.get<string>("registration");
      if (regData) {
        setData(JSON.parse(regData));
      }
    };
    fetchData();
  }, []);

  // countdown timer
  useEffect(() => {
    if (iscountdown <= 0) return;

    const timer = setInterval(() => {
      setIsCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [iscountdown]);

  const resendMail = async () => {
    if (!data || loading || iscountdown > 0) return;

    try {
      setLoading(true);

      await http.post<string>("resendconfirmation", data);

      toast.success("Confirmation email resent if the email is registered");

      // เริ่ม cooldown
      setIsCountdown(FORGOT_PASSWORD_COOLDOWN);
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="absolute left-0 top-0 w-full z-10">
        <div className="flex justify-between items-center py-6 container">
          <Link href="/">
            <Logo />
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="container flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center text-center max-w-[500px] mx-auto">
          <Image
            height={300}
            width={300}
            src="/images/svg/img-1.svg"
            alt="Email Sent"
            className="mb-8"
          />

          <h4 className="text-3xl font-semibold mb-4">
            {t("check_email_title")}
          </h4>

          <p className="text-base text-default-500 mb-8">
            {t("check_email_desc_1")} <br />
            {t("check_email_desc_2")}
          </p>

          <div className="flex flex-col w-full gap-4">
            <Button className="h-12 w-full text-base" asChild>
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("open_mail_app")}
              </a>
            </Button>

            <p className="text-sm text-default-500">
              {t("didnt_receive_email")}{" "}
              <button
                className="text-primary font-medium hover:underline disabled:opacity-50"
                onClick={resendMail}
                disabled={loading || iscountdown > 0}
              >
                {loading
                  ? t("sending")
                  : iscountdown > 0
                    ? t("resend_in", { seconds: iscountdown })
                    : t("resend_link")}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="container py-6 border-t text-center text-sm text-default-500">
        © {new Date().getFullYear()} QueueApp. All rights reserved.
      </div>
    </div>
  );
};

export default MailConfirm;

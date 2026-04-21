"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import Logo from "@/components/partials/auth/logo";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import ResetPasswordForm from "@/components/partials/auth/reset-password-form";

const ResetPasswordPage = () => {
  const t = useTranslations("Auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="flex w-full items-center overflow-hidden min-h-dvh h-dvh basis-full">
      <div className="overflow-y-auto flex flex-wrap w-full h-dvh">
        <div className="lg:block hidden flex-1 overflow-hidden text-[40px] leading-[48px] text-default-600 relative z-[1]">
          <div className="max-w-[520px] pt-20 ps-20 pb-10">
            <Link href="/" className="mb-6 inline-block">
              <Logo />
            </Link>

            <h4>
              {t("unlock_title")}
              <span className="text-default-800  font-bold ms-2">
                {t("unlock_performance")}
              </span>
            </h4>
          </div>
          <div className="absolute left-0 bottom-[-200px] h-full w-full z-[-1] transform origin-bottom-left">
            <Image
              src="/images/auth/Booking system architecture diagram.png"
              alt="Booking system architecture diagram"
              width={1376}
              height={768}
              className="mt-20 w-full h-auto"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 relative">
          <div className="h-full flex flex-col dark:bg-default-100 bg-white">
            <div className="max-w-[524px] md:px-[42px] md:py-[44px] p-7 mx-auto w-full text-2xl text-default-900 mb-3 h-full flex flex-col justify-center">
              {/* Mobile Logo */}
              <div className="flex justify-center items-center text-center mb-6 lg:hidden">
                <Link href="/">
                  <Logo />
                </Link>
              </div>

              {/* ✅ แก้ข้อความตรงนี้ */}
              <div className="text-center 2xl:mb-10 mb-4">
                <h4 className="font-medium">{t("reset_header")}</h4>
                <div className="text-default-500 text-base">
                  {t("reset_desc")}
                </div>
              </div>

              {/* ✅ ส่ง token */}
              <ResetPasswordForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

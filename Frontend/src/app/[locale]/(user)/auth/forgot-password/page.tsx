"use client";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import Logo from "@/components/partials/auth/logo";
import { useTranslations } from "next-intl";
import Copyright from "@/components/partials/auth/copyright";
import ForgotPass from "@/components/partials/auth/forgot-pass";

const ForgotPasswordPage = () => {
  const t = useTranslations("ForgotPassword");

  return (
    <div className="flex w-full items-center overflow-hidden min-h-dvh h-dvh basis-full">
      <div className="overflow-y-auto flex flex-wrap w-full h-dvh">
        {/* Left Side: Desktop View */}
        <div className="lg:block hidden flex-1 overflow-hidden text-[40px] leading-[48px] text-default-600 relative z-[1]">
          <div className="max-w-[520px] pt-20 ps-20">
            <Link href="/" className="mb-6 inline-block">
              <Logo />
            </Link>
            <h4>
              {t("unlock_title")}
              <span className="text-default-800 font-bold ms-2">{t("unlock_performance")}</span>
            </h4>
          </div>
          <div className="absolute left-0 bottom-[-200px] h-full w-full z-[-1] transform origin-bottom-left">
            <Image
              src="/images/auth/Booking system architecture diagram.png"
              alt="Background"
              width={1376}
              height={768}
              className="mt-20 w-full h-auto"
            />
          </div>
        </div>

        {/* Right Side: Form View */}
        <div className="flex-1 relative dark:bg-default-100 bg-white">
          <div className="h-full flex flex-col">
            <div className="max-w-[524px] mx-auto w-full md:px-[42px] md:py-[44px] p-7 flex flex-col justify-center h-full">
              {/* Logo Mobile */}
              <div className="flex justify-center items-center text-center mb-6 lg:hidden">
                <Link href="/">
                  <Logo />
                </Link>
              </div>

              {/* Title Section */}
              <div className="text-center 2xl:mb-10 mb-5">
                <h4 className="font-medium mb-4 text-2xl text-default-900">{t("forgot_title")}</h4>
                <div className="text-default-500 text-base">
                  {t("forgot_subtitle")}
                </div>
              </div>

              {/* Instruction Box */}
              <div className="font-normal text-base text-default-500 text-center px-2 bg-default-100 rounded py-3 mb-4 mt-10">
                {t("forgot_instructions")}
              </div>

              {/* The Separated Form */}
              <ForgotPass />

              {/* Navigation Back */}
              <div className="md:max-w-[345px] mx-auto font-normal text-default-500 2xl:mt-12 mt-8 uppercase text-sm">
                {t("forget_it")}{" "}
                <Link href="/auth/login" className="text-default-900 font-medium hover:underline">
                  {t("send_back")}
                </Link>{" "}
                {t("to_signin")}
              </div>
            </div>
            
            <div className="text-xs font-normal text-default-500 z-[999] pb-10 text-center">
              <Copyright />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
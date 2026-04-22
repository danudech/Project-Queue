import LoginForm from "@/components/partials/auth/login-form";
import Image from "next/image";
import Social from "@/components/partials/auth/social";
import Copyright from "@/components/partials/auth/copyright";
import Logo from "@/components/partials/auth/logo";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

const Login = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const t = await getTranslations("Auth");

  return (
    <div className="flex w-full items-center overflow-hidden min-h-dvh h-dvh basis-full">
      <div className="overflow-y-auto flex flex-wrap w-full h-dvh">
        {/* Left Side: Desktop Only Visuals */}
        <div className="lg:block hidden flex-1 overflow-hidden text-[40px] leading-[48px] text-default-600 relative z-[1] ">
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
              alt="Booking system architecture diagram"
              width={1376}
              height={768}
              className="mt-20 w-full h-auto"
            />
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="flex-1 relative">
          <div className="h-full flex flex-col dark:bg-default-100 bg-white">
            <div className="max-w-[524px] md:px-[42px] md:py-[44px] p-7 mx-auto w-full text-2xl text-default-900 mb-3 h-full flex flex-col justify-center">
              {/* Logo for Mobile */}
              <div className="flex justify-center items-center text-center mb-6 lg:hidden">
                <Link href="/">
                  <Logo />
                </Link>
              </div>

              <div className="text-center 2xl:mb-10 mb-4">
                <h4 className="font-medium">{t("login_header")}</h4>
                <div className="text-default-500 text-base">
                  {t("login_desc")}
                </div>
              </div>

              <LoginForm  />

              {/* <div className="relative border-b-[#9AA2AF] border-opacity-[16%] border-b pt-6">
                <div className="absolute inline-block bg-default-50 dark:bg-default-100 left-1/2 top-1/2 transform -translate-x-1/2 px-4 min-w-max text-sm text-default-500 font-normal">
                  {t("or_continue")}
                </div>
              </div> */}

              {/* <div className="max-w-[242px] mx-auto mt-8 w-full">
                <Social locale={locale} />
              </div> */}

              <div className="md:max-w-[345px] mx-auto font-normal text-default-500 mt-12 uppercase text-sm text-center">
                {t("no_account")}{" "}
                <Link
                  href="/auth/register"
                  locale={locale}
                  className="text-default-900 font-medium hover:underline"
                >
                  {t("sign_up")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
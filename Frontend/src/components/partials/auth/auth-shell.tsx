import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import LocalSwitcher from "@/components/partials/header/locale-switcher";
import { Link } from "@/i18n/routing";
import Logo from "./logo";

type AuthShellProps = {
  children: React.ReactNode;
  locale: string;
  mode: "login" | "register";
};

const AuthShell = async ({ children, locale, mode }: AuthShellProps) => {
  const t = await getTranslations("Auth");
  const isLogin = mode === "login";

  return (
    <main className="h-dvh w-full overflow-hidden bg-white text-slate-950">
      <div className="grid h-full w-full lg:grid-cols-[minmax(0,3fr)_minmax(440px,2fr)]">
        <section className="relative hidden h-dvh min-w-0 flex-col overflow-hidden bg-[#f2f8f5] lg:flex">
          <header className="flex shrink-0 items-start justify-between px-[6vw] pt-[5vh]">
            <Link href="/" aria-label="EZQueue home" className="inline-flex">
              <span className="block [&_img]:!w-[82px] [&_img]:!max-w-[82px]">
                <Logo />
              </span>
            </Link>
            <span className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t("loginVisual.badge")}
            </span>
          </header>

          <div className="z-10 shrink-0 px-[6vw] pt-[5vh]">
            <p className="text-xs font-semibold uppercase text-emerald-700">
              {t("loginVisual.eyebrow")}
            </p>
            <h1 className="mt-3 max-w-[620px] text-[clamp(2.25rem,3.4vw,4rem)] font-semibold leading-[1.06] tracking-normal">
              {t("loginVisual.title")}
            </h1>
            <p className="mt-4 max-w-[480px] text-base leading-7 text-slate-600">
              {t("loginVisual.description")}
            </p>
          </div>

          <div className="relative min-h-0 flex-1">
            <Image
              src="/images/auth/queue-workspace-hero.png"
              alt={t("loginVisual.imageAlt")}
              fill
              priority
              sizes="60vw"
              className="object-contain object-bottom"
            />
          </div>
        </section>

        <section className="h-dvh min-w-0 overflow-y-auto bg-white">
          <div className="flex min-h-full flex-col">
            <header className="flex h-20 shrink-0 items-center justify-between px-6 sm:px-10 lg:justify-end">
              <Link href="/" className="lg:hidden" aria-label="EZQueue home">
                <span className="block [&_img]:!w-[60px] [&_img]:!max-w-[60px]">
                  <Logo />
                </span>
              </Link>
              <LocalSwitcher />
            </header>

            <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10 lg:py-10">
              <div className={isLogin ? "w-full max-w-[420px]" : "w-full max-w-[460px]"}>
                <div className="mb-8">
                  <p className="mb-3 text-xs font-semibold uppercase text-emerald-700">
                    {t(`${mode}.eyebrow`)}
                  </p>
                  <h2 className="text-[32px] font-semibold leading-tight tracking-normal sm:text-[36px]">
                    {t(`${mode}.title`)}
                  </h2>
                  <p className="mt-3 text-base leading-6 text-slate-500">
                    {t(`${mode}.subtitle`)}
                  </p>
                </div>

                {children}

                <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 text-sm text-slate-500">
                  <span>{t(isLogin ? "login.noAccount" : "register.hasAccount")}</span>
                  <Link
                    href={isLogin ? "/auth/register" : "/auth/login"}
                    locale={locale}
                    className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    {t(isLogin ? "login.register" : "register.login")}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            <footer className="shrink-0 px-6 pb-6 pt-2 text-center text-xs text-slate-400">
              {t("login.footerNote")}
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AuthShell;

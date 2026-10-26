import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import LocalSwitcher from "@/components/partials/header/locale-switcher";
import { Link } from "@/i18n/routing";
import Logo from "./logo";

type AuthShellProps = {
  children: React.ReactNode;
  locale: string;
  mode?: "login" | "register";
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  showHeading?: boolean;
};

const AuthShell = async ({
  children,
  locale,
  mode,
  eyebrow,
  title,
  subtitle,
  showHeading = true,
}: AuthShellProps) => {
  const t = await getTranslations("Auth");
  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isThai = locale === "th";
  const heading = mode
    ? {
        eyebrow: t(`${mode}.eyebrow`),
        title: t(`${mode}.title`),
        subtitle: t(`${mode}.subtitle`),
      }
    : { eyebrow, title, subtitle };

  return (
    <main className="ez-auth h-dvh w-full overflow-hidden bg-white text-slate-950">
      <div className="grid h-full w-full lg:grid-cols-[minmax(0,1.1fr)_minmax(480px,0.9fr)]">
        <section className="relative hidden h-dvh min-w-0 flex-col overflow-hidden bg-[#214c3c] lg:flex">
          <Image src="/images/editorial/studio.webp" alt={t("loginVisual.imageAlt")} fill preload sizes="55vw" className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102e25] via-[#102e25]/50 to-[#102e25]/10" />
          <header className="relative z-10 flex shrink-0 items-start justify-between px-[4vw] pt-[5vh]">
            <Link href="/" aria-label="EZQueue home" className="inline-flex rounded-xl bg-white/95 px-4 py-3 shadow-sm">
              <span className="block [&_img]:!w-[132px] [&_img]:!max-w-[132px]">
                <Logo />
              </span>
            </Link>
            <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9e9bc]" />
              {t("loginVisual.badge")}
            </span>
          </header>

          <div className="relative z-10 mt-auto shrink-0 px-[5vw] pb-[8vh] pt-12">
            <p className="text-xs font-medium tracking-widest text-[#d4dfbd]">
              {t("loginVisual.eyebrow")}
            </p>
            <h1
              className={`mt-4 max-w-[650px] text-[clamp(2.25rem,2.8vw,3.25rem)] leading-[1.2] tracking-normal text-white ${
                isThai ? "font-medium" : "font-semibold"
              }`}
            >
              {t("loginVisual.title")}
            </h1>
            <p className="mt-5 max-w-[470px] text-[15px] leading-8 text-white/75">
              {t("loginVisual.description")}
            </p>
          </div>

        </section>

        <section className="h-dvh min-w-0 overflow-y-auto bg-[#fcfdfb]">
          <div className="flex min-h-full flex-col">
            <header className="flex h-20 shrink-0 items-center justify-between px-6 sm:px-10 lg:justify-end">
              <Link href="/" className="lg:hidden" aria-label="EZQueue home">
                <span className="block [&_img]:!w-[120px] [&_img]:!max-w-[120px]">
                  <Logo />
                </span>
              </Link>
              <LocalSwitcher />
            </header>

            <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10 lg:py-10">
              <div className={isRegister ? "w-full max-w-[460px]" : "w-full max-w-[420px]"}>
                {showHeading && (
                  <div className="mb-8">
                    {heading.eyebrow && (
                      <p className="mb-3 text-xs font-semibold uppercase text-emerald-700">
                        {heading.eyebrow}
                      </p>
                    )}
                    <h2
                      className={`leading-[1.25] tracking-normal ${
                        isThai
                          ? "text-[30px] font-medium sm:text-[32px]"
                          : "text-[32px] font-semibold sm:text-[36px]"
                      }`}
                    >
                      {heading.title}
                    </h2>
                    {heading.subtitle && (
                      <p className="mt-3 text-base leading-6 text-slate-500">
                        {heading.subtitle}
                      </p>
                    )}
                  </div>
                )}

                {children}

                {mode && (
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
                )}
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

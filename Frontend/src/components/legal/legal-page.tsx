import Image from "next/image";
import NextLink from "next/link";
import { ArrowLeft, CheckCircle2, FileText, Languages, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/routing";
import { legalContent, type LegalKind } from "./legal-copy";

export default function LegalPage({
  locale,
  kind,
}: {
  locale: string;
  kind: LegalKind;
}) {
  const language = locale === "th" ? "th" : "en";
  const copy = legalContent[language][kind];
  const relatedKind: LegalKind = kind === "terms" ? "privacy" : "terms";
  const otherLocale = language === "th" ? "en" : "th";
  const Icon = kind === "privacy" ? ShieldCheck : FileText;

  return (
    <main className="min-h-screen bg-[#f5f7f5] text-[#10251f]">
      <header className="border-b border-[#dfe8e4] bg-[#fbfdfc]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <NextLink href="/" className="flex items-center gap-3">
            <Image
              src="/images/brand/new-logo-transparent.png"
              alt="EZQueue"
              width={42}
              height={42}
              className="h-10 w-10 object-contain"
              priority
            />
            <span className="text-xl font-bold tracking-[-0.025em] text-[#123d33]">EZQueue</span>
          </NextLink>
          <Link
            href={`/${kind}`}
            locale={otherLocale}
            className="inline-flex items-center gap-2 rounded-full border border-[#d7e3de] bg-white px-4 py-2 text-sm font-semibold text-[#176b57] shadow-[0_2px_8px_rgba(16,37,31,0.04)] transition hover:border-[#9bc9b9] hover:bg-[#f0f8f4]"
          >
            <Languages className="h-4 w-4" />
            {otherLocale === "th" ? "ภาษาไทย" : "English"}
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#0b3b32] text-white">
        <div className="pointer-events-none absolute -left-24 -top-40 h-[420px] w-[420px] rounded-full bg-[#21a67a]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-52 right-[8%] h-[460px] w-[460px] rounded-full bg-[#0e6f5a]/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#9de5ce] backdrop-blur-sm">
              <Icon className="h-4 w-4" />
              {copy.badge}
            </div>
            <h1 className="mt-6 text-[clamp(2.5rem,6vw,5.25rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-white">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#c9ddd6] sm:text-xl">
              {copy.description}
            </p>
            <div className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#a9c8bd]">
              <CheckCircle2 className="h-4 w-4 text-[#58d1aa]" />
              {copy.effectiveLabel}: {copy.effectiveDate}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-10 lg:py-16">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Link
            href="/auth/register"
            locale={language}
            className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#18745e] hover:text-[#0b493b]"
          >
            <ArrowLeft className="h-4 w-4" />
            {copy.back}
          </Link>
          <nav className="rounded-2xl border border-[#dfe7e3] bg-[#fbfcfb] p-5 shadow-[0_14px_38px_rgba(25,53,44,0.06)]">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-[#8b9c96]">
              {copy.contents}
            </p>
            <ol className="space-y-1">
              {copy.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-lg px-3 py-2 text-sm leading-5 text-[#586a64] transition hover:bg-[#e9f4ef] hover:text-[#12604d]"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="min-w-0">
          <div className="mb-8 rounded-2xl border border-[#c7e2d8] bg-[#eaf5f0] p-5 text-[15px] leading-7 text-[#174b3d] shadow-[0_8px_24px_rgba(30,90,70,0.04)] sm:p-6">
            {copy.notice}
          </div>

          <div className="space-y-5">
            {copy.sections.map((section) => (
              <section
                id={section.id}
                key={section.id}
                className="scroll-mt-8 rounded-2xl border border-[#e0e7e3] bg-[#fff] p-6 shadow-[0_14px_40px_rgba(27,54,45,0.045)] sm:p-8"
              >
                <h2 className="text-xl font-semibold leading-8 tracking-[-0.02em] text-[#10251f] sm:text-2xl">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#53635e] sm:text-base sm:leading-8">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets && (
                    <ul className="space-y-3 pl-1">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3">
                          <CheckCircle2 className="mt-1.5 h-4 w-4 shrink-0 text-[#279b77]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Link
              href={`/${relatedKind}`}
              locale={language}
              className="group rounded-2xl border border-[#164e40] bg-[#0d3b32] p-6 text-white shadow-[0_18px_44px_rgba(11,59,50,0.16)] transition hover:-translate-y-0.5 hover:bg-[#124b3f]"
            >
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#75d9b8]">
                {copy.relatedLabel}
              </p>
              <h2 className="mt-3 text-xl font-semibold">{copy.relatedTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-[#c0d9d0]">
                {copy.relatedDescription}
              </p>
            </Link>
            <a
              href="mailto:hello@ezqueue.app"
              className="rounded-2xl border border-[#dfe7e3] bg-white p-6 shadow-[0_14px_40px_rgba(27,54,45,0.05)] transition hover:-translate-y-0.5 hover:border-[#9bc9b9]"
            >
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#18745e]">
                {copy.contactLabel}
              </p>
              <h2 className="mt-3 text-xl font-semibold text-[#10251f]">hello@ezqueue.app</h2>
              <p className="mt-2 text-sm leading-6 text-[#687872]">
                {copy.contactDescription}
              </p>
            </a>
          </div>
        </article>
      </div>

      <footer className="border-t border-[#dfe7e3] bg-[#fbfdfc]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-[#687872] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <span>© 2026 EZQueue</span>
          <div className="flex gap-5">
            <Link href="/terms" locale={language} className="hover:text-[#18745e]">
              {legalContent[language].terms.title}
            </Link>
            <Link href="/privacy" locale={language} className="hover:text-[#18745e]">
              {legalContent[language].privacy.title}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { startRouteLoading } from "@/lib/route-loading";
import { cn } from "@/lib/utils";
import { setLocaleCookie } from "@/lib/cookies";

const languages = [
  {
    code: "th",
    shortLabel: "TH",
    label: "ภาษาไทย",
    flag: "/images/homepage/flags/th.png",
  },
  {
    code: "en",
    shortLabel: "EN",
    label: "English",
    flag: "/images/homepage/flags/en.png",
  },
] as const;

interface LocalSwitcherProps {
  compact?: boolean;
  className?: string;
}

export default function LocalSwitcher({
  compact = false,
  className,
}: LocalSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = useLocale();

  const currentLang =
    languages.find((lang) => lang.code === currentLocale) ?? languages[0];

  const onSelectLocale = (nextLocale: string) => {
    if (nextLocale === currentLocale) return;

    // Set cookie so both middleware and future requests respect the choice
    setLocaleCookie(nextLocale);

    startTransition(() => {
      const segments = pathname.split("/");
      let newPath: string;

      if (segments[1] === "th" || segments[1] === "en") {
        segments[1] = nextLocale;
        newPath = segments.join("/");
      } else {
        newPath = `/${nextLocale}${pathname === "/" ? "" : pathname}`;
      }

      const queryString = searchParams?.toString();
      const targetUrl = `${newPath}${queryString ? `?${queryString}` : ""}`;

      startRouteLoading();
      router.replace(targetUrl);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isPending}>
        <button
          type="button"
          aria-label="Change language"
          className={cn(
            "group inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-[#18745e] hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#18745e]/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200",
            className,
          )}
        >
          <Image
            src={currentLang.flag}
            alt={currentLang.label}
            width={20}
            height={20}
            className="size-4.5 rounded-full object-cover shadow-2xs"
          />
          <span className="font-semibold tracking-wider text-slate-800 dark:text-slate-100">
            {compact ? currentLang.shortLabel : currentLang.label}
          </span>
          <ChevronDown className="size-3 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-40 rounded-xl border border-slate-200/80 bg-white/95 p-1.5 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900"
      >
        {languages.map((lang) => {
          const isSelected = lang.code === currentLocale;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => onSelectLocale(lang.code)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
                isSelected
                  ? "bg-[#18745e]/10 text-[#18745e] font-semibold dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
              )}
            >
              <div className="flex items-center gap-2.5">
                <Image
                  src={lang.flag}
                  alt={lang.label}
                  width={20}
                  height={20}
                  className="size-4.5 rounded-full object-cover shadow-2xs"
                />
                <span>{lang.label}</span>
              </div>
              {isSelected && <Check className="size-3.5 text-[#18745e]" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

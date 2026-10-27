"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { setLocaleCookie } from "@/lib/cookies";
import type { HomepageCopy, HomepageLocale } from "../i18n";

type LanguageSwitcherProps = {
  currentLocale: HomepageLocale;
  copy: HomepageCopy["language"];
};

const languages = [
  {
    code: "th",
    label: "ภาษาไทย",
    flag: "/images/homepage/flags/th.png",
  },
  {
    code: "en",
    label: "English",
    flag: "/images/homepage/flags/en.png",
  },
] as const;

const LanguageSwitcher = ({ currentLocale, copy }: LanguageSwitcherProps) => {
  const router = useRouter();

  const switchLocale = (locale: HomepageLocale) => {
    setLocaleCookie(locale);
    router.refresh();
  };

  const currentLang =
    languages.find((lang) => lang.code === currentLocale) ?? languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={copy.label}
          className="group inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-[#18745e] hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#18745e]/20"
        >
          <Image
            src={currentLang.flag}
            alt={currentLang.label}
            width={20}
            height={20}
            className="size-4.5 rounded-full object-cover shadow-2xs"
          />
          <span className="font-semibold tracking-wider text-slate-800">
            {currentLang.label}
          </span>
          <ChevronDown className="size-3 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-40 rounded-xl border border-slate-200/80 bg-white/95 p-1.5 shadow-lg backdrop-blur-md"
      >
        {languages.map((lang) => {
          const isSelected = lang.code === currentLocale;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => switchLocale(lang.code as HomepageLocale)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
                isSelected
                  ? "bg-[#18745e]/10 text-[#18745e] font-semibold"
                  : "text-slate-700 hover:bg-slate-100",
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
};

export default LanguageSwitcher;

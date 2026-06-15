"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { HomepageCopy, HomepageLocale } from "../i18n";

type LanguageSwitcherProps = {
  currentLocale: HomepageLocale;
  copy: HomepageCopy["language"];
};

const LanguageSwitcher = ({ currentLocale, copy }: LanguageSwitcherProps) => {
  const router = useRouter();

  const switchLocale = (locale: HomepageLocale) => {
    document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  const nextLocale: HomepageLocale = currentLocale === "th" ? "en" : "th";
  const currentFlag =
    currentLocale === "th"
      ? { src: "/images/homepage/flags/th.png", label: copy.thai }
      : { src: "/images/homepage/flags/en.png", label: copy.english };
  const nextLabel = nextLocale === "th" ? copy.thai : copy.english;

  return (
    <div className="ez-language-switcher" aria-label={copy.label}>
      <button
        type="button"
        className="active"
        onClick={() => switchLocale(nextLocale)}
        title={`${copy.label}: ${currentFlag.label}. Switch to ${nextLabel}`}
      >
        <Image src={currentFlag.src} alt={currentFlag.label} width={24} height={24} />
      </button>
    </div>
  );
};

export default LanguageSwitcher;

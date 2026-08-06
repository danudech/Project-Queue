"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { localePath, type HomepageCopy, type HomepageLocale } from "../i18n";

const sectionIds = ["home", "about", "features", "service"];

type HeaderProps = {
  locale: HomepageLocale;
  copy: HomepageCopy;
};

const Header = ({ locale, copy }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const onScroll = () => {
      setIsSticky(window.scrollY > 100);

      const current = sectionIds.findLast((id) => {
        const section = document.getElementById(id);
        if (!section) return false;
        return section.getBoundingClientRect().top <= 130;
      });

      if (current) setActiveSection(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header>
      <nav
        className={[
          "navbar ez-navbar fixed-top navbar-expand-lg",
          isSticky ? "nav-sticky ez-navbar-sticky" : "",
        ].join(" ")}
        style={isSticky ? { backgroundColor: "#fff" } : undefined}
        id="navbar"
      >
        <div className="ez-container">
          <div className="ez-nav-inner">
            <div className="navbar-brand logo">
              <Link className="navbar-caption" href="/">
                <Image
                  src="/images/brand/ezqueue-logo.png"
                  alt="EZQueue"
                  className="ez-brand-logo"
                  width={256}
                  height={80}
                  priority
                />
              </Link>
            </div>

            <button
              className="ez-navbar-toggler"
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <div
              className={[
                "ez-navbar-collapse",
                isMenuOpen ? "ez-navbar-collapse-open" : "",
              ].join(" ")}
              id="navbarCollapse"
            >
              <ul className="navbar-nav" id="navbar-navlist">
                {sectionIds.map((id) => (
                  <li key={id} className="nav-item">
                    <Link
                      href={`#${id}`}
                      className={`nav-link ${activeSection === id ? "active" : ""}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>{copy.nav[id as keyof typeof copy.nav]}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="ez-nav-actions">
                <Link href={localePath(locale, "/auth/login")} className="ez-btn ez-btn-outline">
                  {copy.actions.login}
                </Link>
                <Link href={localePath(locale, "/auth/register")} className="ez-btn ez-btn-primary">
                  {copy.actions.signup}
                </Link>
                <LanguageSwitcher currentLocale={locale} copy={copy.language} />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

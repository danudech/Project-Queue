import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { localePath, type HomepageCopy, type HomepageLocale } from "../i18n";

type FooterProps = {
  copy: HomepageCopy["footer"];
  locale: HomepageLocale;
};

const Footer = ({ copy, locale }: FooterProps) => {
  const groupRoutes = [
    ["#home", "#how-it-works", "#features", "#service"],
    ["#service", "#features", "#how-it-works", "#about"],
    ["#about", "#features", "#how-it-works"],
  ];
  return (
    <>
      <footer className="section footer">
        <div className="ez-container">
          <div className="ez-footer-grid">
            <div className="footer-brand">
              <Link href="#home" className="footer-logo">
                <Image src="/images/brand/ezqueue-logo.png" alt="EZQueue" width={150} height={47} />
              </Link>
              <h3>{copy.title}</h3>
              <p>{copy.description}</p>
            </div>

            {copy.groups.map((group, groupIndex) => (
              <div className="footer-links" key={group.title}>
                <h5>{group.title}</h5>
                <ul>
                  {group.links.map((link, index) => (
                    <li key={link}>
                      <Link href={groupRoutes[groupIndex]?.[index] ?? "#home"}>{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="footer-links footer-contact">
              <h5>{copy.contactTitle}</h5>
              <ul>
                <li>
                  <Link href={localePath(locale, "/auth/register")}>
                    <ArrowUpRight className="h-4 w-4" />
                    {locale === "th" ? "สร้างบัญชีร้านของคุณ" : "Create your account"}
                  </Link>
                </li>
                <li>
                  <Link href={localePath(locale, "/terms")}>
                    {locale === "th" ? "ข้อกำหนดการใช้งาน" : "Terms of service"}
                  </Link>
                </li>
                <li>
                  <Link href={localePath(locale, "/privacy")}>
                    {locale === "th" ? "นโยบายความเป็นส่วนตัว" : "Privacy policy"}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <div className="footer-copyright">
        <div className="ez-container">{copy.copyright}</div>
      </div>
    </>
  );
};

export default Footer;

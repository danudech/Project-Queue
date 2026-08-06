import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { HomepageCopy } from "../i18n";

type FooterProps = {
  copy: HomepageCopy["footer"];
};

const Footer = ({ copy }: FooterProps) => {
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
                <span className="ez-logo-mark">
                  <Image
                    src="/images/brand/new-logo-transparent.png"
                    alt=""
                    width={34}
                    height={34}
                  />
                </span>
                EZQueue
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
                  <Link href="mailto:hello@ezqueue.app">
                    <Mail className="h-4 w-4" />
                    hello@ezqueue.app
                  </Link>
                </li>
                <li>
                  <Link href="tel:+66020000000">
                    <Phone className="h-4 w-4" />
                    +66 02-000-0000
                  </Link>
                </li>
                <li>
                  <Link href="#home">
                    <MapPin className="h-4 w-4" />
                    {copy.location}
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

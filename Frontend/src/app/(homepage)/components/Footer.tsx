import Image from "next/image";
import Link from "next/link";
import { AtSign, Globe, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import type { HomepageCopy } from "../i18n";

type FooterProps = {
  copy: HomepageCopy["footer"];
  actions: HomepageCopy["actions"];
};

const Footer = ({ copy, actions }: FooterProps) => {
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
              <div className="footer-subscribe">
                <input type="email" aria-label="Email" placeholder={copy.emailPlaceholder} />
                <button className="ez-btn ez-btn-primary" type="button">
                  {actions.subscribe}
                </button>
              </div>
              <div className="footer-icon">
                {[Globe, AtSign, MessageCircle, Send].map((Icon, index) => (
                  <Link href="#" className="icon-link" key={index}>
                    <Icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>

            {copy.groups.map((group) => (
              <div className="footer-links" key={group.title}>
                <h5>{group.title}</h5>
                <ul>
                  {group.links.map((link) => (
                    <li key={link}>
                      <Link href="#home">{link}</Link>
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

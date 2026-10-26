import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, UsersRound, Check } from "lucide-react";
import { localePath, type HomepageCopy, type HomepageLocale } from "../i18n";

type HeroProps = {
  locale: HomepageLocale;
  copy: HomepageCopy["hero"];
  actions: HomepageCopy["actions"];
};

const Hero = ({ locale, copy, actions }: HeroProps) => {
  const th = locale === "th";
  return (
    <section className="home-6 position-relative" id="home">
      <div className="home-center">
        <div className="home-desc-center">
          <div className="ez-container">
            <div className="ez-row align-items-center">
              <div className="ez-col-left align-self-center position-relative z-1">
                <div className="hero-content mb-4">
                <span className="ez-badge">{copy.badge}</span>
                <h1 className="ez-hero-title">{copy.title}</h1>
                <p className="ez-hero-copy">{copy.description}</p>
                </div>

                <div className="ez-hero-actions">
                  <Link href={localePath(locale, "/auth/register")} className="ez-btn ez-btn-primary ez-btn-lg">
                    {actions.tryFree}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link href="#features" className="ez-btn ez-btn-outline ez-btn-lg">
                    {actions.learnMore}
                  </Link>
                </div>
                <div className="ez-hero-benefits">
                  <span><CalendarDays size={16} />{th ? "จองออนไลน์" : "Online booking"}</span>
                  <span><Clock3 size={16} />{th ? "คิวเป็นระบบ" : "Organized queues"}</span>
                  <span><UsersRound size={16} />{th ? "ทีมทำงานร่วมกัน" : "Connected teams"}</span>
                </div>
              </div>

              <div className="ez-col-right offset-xl-1 justify-content-center align-self-center position-relative z-1">
                <div className="ez-hero-visual">
                      <Image
                        src="/images/editorial/reception.webp"
                        alt={copy.imageAlt}
                        className="ez-hero-photograph"
                        fill
                        sizes="(max-width: 991px) 100vw, 52vw"
                        preload
                      />
                      <div className="ez-photo-caption"><span className="ez-caption-icon"><Check size={20} /></span><div><strong>{th ? "ให้ทุกนัดหมายเป็นเรื่องง่าย" : "Make room for better service"}</strong><span>{th ? "ดูแลลูกค้าได้เต็มที่ ในทุกวันทำงาน" : "Less organizing. More looking after people."}</span></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { localePath, type HomepageCopy, type HomepageLocale } from "../i18n";

type HeroProps = {
  locale: HomepageLocale;
  copy: HomepageCopy["hero"];
  actions: HomepageCopy["actions"];
};

const Hero = ({ locale, copy, actions }: HeroProps) => {
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
              </div>

              <div className="ez-col-right offset-xl-1 justify-content-center align-self-center position-relative z-1">
                <div>
                  <div className="text-center">
                      <Image
                        src="/images/homepage/ezqueue-hero-generated.png"
                        alt={copy.imageAlt}
                        className="business-img"
                        width={700}
                        height={700}
                        priority
                      />
                  </div>
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

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { localePath, type HomepageCopy, type HomepageLocale } from "../i18n";

type AboutProps = {
  locale: HomepageLocale;
  copy: HomepageCopy["about"];
  actions: HomepageCopy["actions"];
};

const About = ({ locale, copy, actions }: AboutProps) => {
  return (
    <section className="section bg-about pb-0" id="about">
      <div className="ez-container">
        <div className="ez-section-grid ez-section-grid-about">
          <div className="about-img text-center">
            <Image
              src="/images/homepage/ezqueue-about-generated.png"
              alt={copy.imageAlt}
              width={550}
              height={550}
              className="ez-section-image"
            />
          </div>

          <div className="ez-section-content">
            <span className="ez-badge">{copy.badge}</span>
            <h2 className="ez-section-title">
              {copy.titlePrefix} <span className="text-primary">{copy.titleHighlight}</span>
            </h2>
            <p className="ez-section-copy">
              {copy.description}
            </p>
            <Link href={localePath(locale, "/dashboard")} className="ez-btn ez-btn-primary mt-4">
              {actions.readMore}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

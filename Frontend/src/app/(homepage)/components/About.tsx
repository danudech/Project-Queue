import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HomepageCopy } from "../i18n";

type AboutProps = {
  copy: HomepageCopy["about"];
  actions: HomepageCopy["actions"];
};

const About = ({ copy, actions }: AboutProps) => {
  return (
    <section className="section bg-about pb-0" id="about">
      <div className="ez-container">
        <div className="ez-section-grid ez-section-grid-about">
          <div className="about-img text-center">
            <Image
              src="/images/editorial/studio.webp"
              alt={copy.imageAlt}
              width={768}
              height={640}
              sizes="(max-width: 991px) 100vw, 45vw"
              className="ez-section-image ez-editorial-photo"
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
            <Link href="#how-it-works" className="ez-btn ez-btn-primary mt-4">
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

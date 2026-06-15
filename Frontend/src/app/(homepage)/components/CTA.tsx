import Image from "next/image";
import Link from "next/link";
import { localePath, type HomepageCopy, type HomepageLocale } from "../i18n";

type CTAProps = {
  locale: HomepageLocale;
  copy: HomepageCopy["cta"];
  actions: HomepageCopy["actions"];
};

const CTA = ({ locale, copy, actions }: CTAProps) => {
  return (
    <section className="section overflow-hidden pt-0">
      <div className="ez-container">
        <div className="bg-cta">
          <div className="ez-cta-grid">
            <div className="ez-cta-copy">
              <h2>{copy.title}</h2>
              <Link href={localePath(locale, "/auth/register")} className="ez-btn ez-btn-light mt-4">
                {actions.getStarted}
              </Link>
            </div>
            <div className="cta-img">
              <Image
                src="/images/homepage/nosic-cta.png"
                alt={copy.imageAlt}
                className="shadow"
                width={715}
                height={344}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;

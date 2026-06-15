import Link from "next/link";
import { ArrowRight, CalendarCheck, CreditCard, MonitorCheck, UsersRound } from "lucide-react";
import { localePath, type HomepageCopy, type HomepageLocale } from "../i18n";

const icons = [CalendarCheck, MonitorCheck, UsersRound, CreditCard];

type ServiceProps = {
  locale: HomepageLocale;
  copy: HomepageCopy["service"];
  actions: HomepageCopy["actions"];
};

const Service = ({ locale, copy, actions }: ServiceProps) => {
  return (
    <section className="section bg-services pt-0" id="service">
      <div className="ez-container">
        <div className="ez-section-heading ez-section-heading-wide">
          <span className="ez-badge">{copy.badge}</span>
          <h2 className="ez-section-title">{copy.title}</h2>
          <p className="ez-section-copy">{copy.description}</p>
        </div>

        <div className="ez-service-grid">
          {copy.items.map((item, index) => {
            const Icon = icons[index] ?? CalendarCheck;
            return (
              <div className="service-card" key={item.title}>
                <div className="service-icon">
                  <Icon className="h-8 w-8" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link href={localePath(locale, "/dashboard")} className="ez-inline-link">
                  {actions.exploreMore}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Service;

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { localePath, type HomepageCopy, type HomepageLocale } from "../i18n";

type PricingProps = {
  locale: HomepageLocale;
  copy: HomepageCopy["pricing"];
  actions: HomepageCopy["actions"];
};

const Pricing = ({ locale, copy, actions }: PricingProps) => {
  return (
    <section className="section bg-pricing" id="price">
      <div className="ez-container">
        <div className="ez-section-heading">
          <span className="ez-badge">{copy.badge}</span>
          <h2 className="ez-section-title">{copy.title}</h2>
          <p className="ez-section-copy">{copy.description}</p>
        </div>

        <div className="ez-pricing-grid">
          {copy.plans.map((plan) => {
            const isPopular = "popular" in plan && plan.popular;

            return (
            <div className={`pricing-card ${isPopular ? "pricing-card-popular" : ""}`} key={plan.name}>
              {isPopular ? <span className="label-name">{copy.popular}</span> : null}
              <div className="pricing-card-header">
                <h3>{plan.name}</h3>
                <p>{plan.note}</p>
                <h4>
                  {plan.price}
                  <span>{copy.period}</span>
                </h4>
              </div>
              <div className="price-info">
                <h5>{copy.listTitle}</h5>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <CheckCircle2 className="h-5 w-5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href={localePath(locale, "/auth/register")} className={`ez-btn ${isPopular ? "ez-btn-light" : "ez-btn-primary"} w-100`}>
                {actions.buyNow}
              </Link>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;

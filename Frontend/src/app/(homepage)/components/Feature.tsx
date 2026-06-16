import Image from "next/image";
import { BarChart3, CheckSquare, TabletSmartphone } from "lucide-react";
import type { HomepageCopy } from "../i18n";

const icons = [TabletSmartphone, BarChart3, CheckSquare];

type FeatureProps = {
  copy: HomepageCopy["features"];
};

const Feature = ({ copy }: FeatureProps) => {
  return (
    <section className="section bg-features" id="features">
      <div className="ez-container">
        <div className="ez-section-grid">
          <div>
            <Image
              src="/images/homepage/ezqueue-features-generated.png"
              alt={copy.imageAlt}
              className="rounded-4 ez-section-image"
              height={512}
              width={512}
            />
          </div>

          <div className="ez-section-content">
            <span className="ez-badge">{copy.badge}</span>
            <h2 className="ez-section-title">{copy.title}</h2>
            <p className="ez-section-copy">{copy.description}</p>

            <div className="ez-accordion" id="accordionExample">
              {copy.items.map((item, idx) => {
                const Icon = icons[idx] ?? CheckSquare;
                return (
                  <details className="ez-accordion-item" key={item.question} open={idx === 0}>
                    <summary className="ez-accordion-header">
                      <span className={`ez-feature-icon ez-feature-${item.variant}`}>
                        <Icon className="h-6 w-6" />
                      </span>
                      {item.question}
                    </summary>
                    <p className="ez-accordion-body">{item.answer}</p>
                  </details>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Feature;

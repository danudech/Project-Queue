import { CalendarCheck2, ListChecks, Settings2 } from "lucide-react";

const icons = [Settings2, CalendarCheck2, ListChecks];

export type WorkflowCopy = {
  badge: string;
  title: string;
  description: string;
  stepLabel: string;
  steps: ReadonlyArray<{ title: string; description: string }>;
};

export default function Workflow({ copy }: { copy: WorkflowCopy }) {
  return (
    <section className="section bg-features" id="how-it-works">
      <div className="ez-container">
        <div className="ez-section-heading ez-section-heading-wide">
          <span className="ez-badge">{copy.badge}</span>
          <h2 className="ez-section-title">{copy.title}</h2>
          <p className="ez-section-copy">{copy.description}</p>
        </div>
        <div className="ez-service-grid">
          {copy.steps.map((step, index) => {
            const Icon = icons[index] ?? ListChecks;
            return (
              <article className="service-card" key={step.title}>
                <div className="service-icon"><Icon className="h-8 w-8" /></div>
                <p className="mb-2 text-sm font-semibold text-primary">{copy.stepLabel} {index + 1}</p>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

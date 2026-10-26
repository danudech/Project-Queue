import type { ReactNode } from "react";

type DashboardPageHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-5 border-b border-default-200/70 pb-6 lg:flex-row lg:items-center dark:border-default-200">
      <div className="min-w-0">
        {eyebrow ? (
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-primary"><span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />{eyebrow}</div>
        ) : null}
        <h1 className="text-2xl font-medium tracking-tight text-default-900">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}


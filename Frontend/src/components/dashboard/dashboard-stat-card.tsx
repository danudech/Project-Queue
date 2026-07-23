import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Tone = "primary" | "success" | "warning" | "info" | "secondary";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  secondary: "bg-default-200 text-default-700",
};

type DashboardStatCardProps = {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  tone?: Tone;
};

export function DashboardStatCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = "primary",
}: DashboardStatCardProps) {
  return (
    <Card>
      <CardContent className="flex min-h-28 items-center gap-4 p-5">
        <div
          className={`grid size-11 shrink-0 place-items-center rounded-full ${toneClasses[tone]}`}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-2xl font-medium text-default-900">{value}</p>
          {helper ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {helper}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

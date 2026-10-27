import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Tone = "primary" | "success" | "warning" | "info" | "secondary" | "destructive";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  secondary: "bg-default-200 text-default-700",
  destructive: "bg-destructive/10 text-destructive",
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
    <Card className="transition-shadow duration-200 hover:shadow-md">
      <CardContent className="flex min-h-32 items-start justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <p className="text-xs font-medium leading-5 text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-medium tabular-nums tracking-tight text-default-900">{value}</p>
          {helper ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</p> : null}
        </div>
        <div
          className={`grid size-10 shrink-0 place-items-center rounded-xl ${toneClasses[tone]}`}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

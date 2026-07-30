"use client";

import { ShieldX } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/components/navigation";
import RouteLoadingScreen from "@/components/route-loading-screen";
import { Card, CardContent } from "@/components/ui/card";
import { usePermissions } from "@/hooks/use-permissions";
import { accessRuleForPath } from "@/lib/permissions";

export default function DashboardAccessGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("AccessControl");
  const pathname = usePathname();
  const { isLoading, isError, can } = usePermissions();
  const accessRule = accessRuleForPath(pathname);
  const requiredPermission = accessRule?.permission;

  if (isLoading) return <RouteLoadingScreen />;
  if (!isError && accessRule && can(requiredPermission)) return children;

  return (
    <Card>
      <CardContent className="flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldX className="size-8" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-default-900">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {accessRule ? t("description") : t("unavailable")}
        </p>
        {requiredPermission ? (
          <p className="mt-4 rounded-full bg-default-100 px-3 py-1 text-xs text-muted-foreground">
            {t("required")}: {requiredPermission}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

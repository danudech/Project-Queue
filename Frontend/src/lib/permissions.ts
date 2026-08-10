export const ADMIN_PERMISSIONS = new Set(["system.admin", "Admin"]);

export function hasPermission(
  permissions: readonly string[] | undefined,
  required?: string | readonly string[],
) {
  if (!required) return true;
  const current = new Set(permissions ?? []);
  if ([...ADMIN_PERMISSIONS].some((permission) => current.has(permission))) {
    return true;
  }
  const accepted =
    typeof required === "string"
      ? required.split("|").filter(Boolean)
      : [...required];
  return accepted.some((permission) => current.has(permission));
}

export const dashboardRoutePermissions: Array<{
  prefix: string;
  permission?: string;
}> = [
  { prefix: "/setting/role", permission: "role.assign" },
  { prefix: "/setting/staff", permission: "staff.view" },
  { prefix: "/setting/shop", permission: "shop.view" },
  { prefix: "/setting/branch", permission: "branch.view" },
  { prefix: "/setting/business-hours", permission: "setting.view" },
  { prefix: "/setting/holiday", permission: "setting.view" },
  { prefix: "/service", permission: "service.view" },
  { prefix: "/customer", permission: "customer.view" },
  { prefix: "/queue", permission: "queue.view" },
  { prefix: "/booking", permission: "booking.view" },
  { prefix: "/dashboard", permission: "shop.view|branch.view|queue.view" },
  { prefix: "/notification" },
  { prefix: "/chat", permission: "branch.view" },
  { prefix: "/account" },
];

const unavailableDashboardPrefixes = [
  "/analytics",
  "/queue/category",
  "/customer/tag",
  "/payment",
  "/invoice",
  "/subscription",
  "/system",
  "/setting",
];

const unavailableDashboardPaths = new Set(["/account"]);

export function permissionForPath(pathname: string) {
  return accessRuleForPath(pathname)?.permission;
}

export function accessRuleForPath(pathname: string) {
  if (unavailableDashboardPaths.has(pathname)) return undefined;

  if (
    unavailableDashboardPrefixes.some(
      (prefix) =>
        pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    const implementedSettingChild = dashboardRoutePermissions.some(
      (route) =>
        route.prefix.startsWith("/setting/")
        && (pathname === route.prefix || pathname.startsWith(`${route.prefix}/`)),
    );
    if (!implementedSettingChild) return undefined;
  }
  return dashboardRoutePermissions.find(
    (route) =>
      pathname === route.prefix || pathname.startsWith(`${route.prefix}/`),
  );
}

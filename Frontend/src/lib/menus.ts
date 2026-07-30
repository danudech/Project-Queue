export type SubChildren = {
  href: string;
  label: string;
  active: boolean;
  children?: SubChildren[];
};

export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon?: string;
  submenus?: Submenu[];
  children?: SubChildren[];
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: string;
  submenus: Submenu[];
  id: string;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  id: string;
};

export function getMenuList(
  pathname: string,
  t: any,
  permissions: readonly string[] = [],
): Group[] {
  const groups: Group[] = [
    // ─────────────────────────────────────────
    // Overview
    // ─────────────────────────────────────────
    {
      groupLabel: t("overview"),
      id: "overview",
      menus: [
        {
          id: "dashboard",
          href: "/dashboard",
          label: t("dashboard"),
          active: pathname === "/dashboard",
          icon: "heroicons-outline:squares-2x2",
          submenus: [],
        },
        {
          id: "analytics",
          href: "/analytics",
          label: t("analytics"),
          active: pathname.startsWith("/analytics"),
          icon: "heroicons-outline:chart-bar",
          submenus: [],
        },
      ],
    },

    // ─────────────────────────────────────────
    // Operations (Queue & Booking)
    // ─────────────────────────────────────────
    {
      groupLabel: t("operations"),
      id: "operations",
      menus: [
        {
          id: "queue",
          href: "/queue/live",
          label: t("queueManagement"),
          active: pathname.startsWith("/queue"),
          icon: "heroicons-outline:queue-list",
          submenus: [
            {
              href: "/queue/live",
              label: t("queueLive"),
              active: pathname === "/queue/live",
            },
            {
              href: "/queue/history",
              label: t("queueHistory"),
              active: pathname === "/queue/history",
            },
            {
              href: "/queue/category",
              label: t("queueCategory"),
              active: pathname === "/queue/category",
            }
          ],
        },
        {
          id: "booking",
          href: "/booking/list",
          label: t("bookingManagement"),
          active: pathname.startsWith("/booking"),
          icon: "heroicons-outline:calendar-days",
          submenus: [
            {
              href: "/booking/list",
              label: t("bookingList"),
              active: pathname === "/booking/list",
            },
            {
              href: "/booking/slot",
              label: t("bookingSlot"),
              active: pathname === "/booking/slot",
            }
          ],
        },
      ],
    },

    // ─────────────────────────────────────────
    // Business & CRM
    // ─────────────────────────────────────────
    {
      groupLabel: t("business"),
      id: "business",
      menus: [
        {
          id: "service",
          href: "/service",
          label: t("services"),
          active: pathname.startsWith("/service"),
          icon: "heroicons-outline:briefcase",
          submenus: [
            {
              href: "/service",
              label: t("serviceList"),
              active: pathname === "/service",
            },
            {
              href: "/service/category",
              label: t("serviceCategory"),
              active: pathname === "/service/category",
            }
          ],
        },
        {
          id: "customer",
          href: "/customer",
          label: t("customers"),
          active: pathname.startsWith("/customer"),
          icon: "heroicons-outline:user-group",
          submenus: [
            {
              href: "/customer",
              label: t("customerDirectory"),
              active: pathname === "/customer",
            },
            {
              href: "/customer/tag",
              label: t("customerTag"),
              active: pathname === "/customer/tag",
            }
          ],
        },
      ],
    },

    // ─────────────────────────────────────────
    // Finance & Subscription
    // ─────────────────────────────────────────
    {
      groupLabel: t("finance"),
      id: "finance",
      menus: [
        {
          id: "payment",
          href: "/payment/list",
          label: t("payments"),
          active: pathname.startsWith("/payment"),
          icon: "heroicons-outline:credit-card",
          submenus: [
            {
              href: "/payment/list",
              label: t("paymentList"),
              active: pathname === "/payment/list",
            },
            {
              href: "/payment/transaction",
              label: t("transactions"),
              active: pathname === "/payment/transaction",
            }
          ],
        },
        {
          id: "saas",
          href: "/subscription",
          label: t("subscription"),
          active: pathname.startsWith("/subscription") || pathname.startsWith("/invoice"),
          icon: "heroicons-outline:document-check",
          submenus: [
            {
              href: "/subscription/plan",
              label: t("myPlan"),
              active: pathname === "/subscription/plan",
            },
            {
              href: "/invoice/list",
              label: t("billingHistory"),
              active: pathname === "/invoice/list",
            }
          ],
        },
      ],
    },

    // ─────────────────────────────────────────
    // Settings & Administration
    // ─────────────────────────────────────────
    {
      groupLabel: t("administration"),
      id: "administration",
      menus: [
        {
          id: "notification",
          href: "/notification",
          label: t("notification"),
          active: pathname.startsWith("/notification"),
          icon: "heroicons-outline:bell",
          submenus: [],
        },
        {
          id: "shop-management",
          href: "/setting/shop",
          label: t("shopSettings"),
          active: pathname.startsWith("/setting/shop") || pathname.startsWith("/setting/branch") || pathname.startsWith("/setting/business-hours") || pathname.startsWith("/setting/holiday"),
          icon: "heroicons-outline:building-storefront",
          submenus: [
            {
              href: "/setting/shop",
              label: t("shopInfo"),
              active: pathname === "/setting/shop",
            },
            {
              href: "/setting/branch",
              label: t("branches"),
              active: pathname === "/setting/branch",
            },
            {
              href: "/setting/business-hours",
              label: t("businessHours"),
              active: pathname === "/setting/business-hours",
            },
            {
              href: "/setting/holiday",
              label: t("holidays"),
              active: pathname === "/setting/holiday",
            }
          ],
        },
        {
          id: "staff-management",
          href: "/setting/staff",
          label: t("staffAndRoles"),
          active: pathname.startsWith("/setting/staff") || pathname.startsWith("/setting/role"),
          icon: "heroicons-outline:users",
          submenus: [
            {
              href: "/setting/staff",
              label: t("staffList"),
              active: pathname === "/setting/staff",
            },
            {
              href: "/setting/role",
              label: t("rolesPermissions"),
              active: pathname === "/setting/role",
            }
          ],
        },
        {
          id: "system",
          href: "/system/config",
          label: t("system"),
          active: pathname.startsWith("/system"),
          icon: "heroicons-outline:cog-8-tooth",
          submenus: [
            {
              href: "/system/config",
              label: t("systemConfig"),
              active: pathname === "/system/config",
            },
            {
              href: "/system/master-status",
              label: t("masterStatus"),
              active: pathname === "/system/master-status",
            },
            {
              href: "/system/audit-log",
              label: t("auditLog"),
              active: pathname === "/system/audit-log",
            }
          ],
        },
      ],
    },

    // ─────────────────────────────────────────
    // Account
    // ─────────────────────────────────────────
    {
      groupLabel: "",
      id: "account",
      menus: [
        {
          id: "profile",
          href: "/account/profile",
          label: t("myProfile"),
          active: pathname.startsWith("/account"),
          icon: "heroicons-outline:user-circle",
          submenus: [],
        },
        {
          id: "logout",
          href: "/auth/login",
          label: t("logout"),
          active: false,
          icon: "heroicons-outline:arrow-right-on-rectangle",
          submenus: [],
        },
      ],
    },
  ];

  return groups
    .map((group) => ({
      ...group,
      menus: group.menus
        .map((menu) => {
          const submenus = menu.submenus.filter((submenu) => {
            const rule = accessRuleForPath(submenu.href);
            return Boolean(rule && hasPermission(permissions, rule.permission));
          });
          const directRule = accessRuleForPath(menu.href);
          const isAccountAction =
            menu.id === "logout" || menu.id === "profile";
          if (
            submenus.length === 0
            && !isAccountAction
            && (!directRule
              || !hasPermission(permissions, directRule.permission))
          ) {
            return null;
          }
          return {
            ...menu,
            href: submenus[0]?.href ?? menu.href,
            submenus,
          };
        })
        .filter((menu): menu is Menu => menu !== null),
    }))
    .filter((group) => group.menus.length > 0);
}

export function getHorizontalMenuList(
  pathname: string,
  t: any,
  permissions: readonly string[] = [],
): Group[] {
  return getMenuList(pathname, t, permissions).map((group) => ({
    ...group,
    menus: group.menus.map((menu) => ({ ...menu, submenus: [] })),
  }));
}
import { accessRuleForPath, hasPermission } from "@/lib/permissions";

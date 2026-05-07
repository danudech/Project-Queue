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
  icon: any;
  submenus?: Submenu[];
  children?: SubChildren[];
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  id: string;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  id: string;
};

export function getMenuList(pathname: string, t: any): Group[] {
  return [

    // ─────────────────────────────────────────
    // Overview
    // ─────────────────────────────────────────
    {
      groupLabel: "",
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
    // Queue & Booking — รวม queue + booking ไว้กลุ่มเดียว
    // ─────────────────────────────────────────
    {
      groupLabel: t("queueAndBooking"),
      id: "queue-booking",
      menus: [
        {
          id: "queue-live",
          href: "/queue/live",
          label: t("queueLive"),
          active: pathname === "/queue/live",
          icon: "heroicons-outline:clock",
          submenus: [],
        },
        {
          id: "queue-history",
          href: "/queue/history",
          label: t("queueHistory"),
          active: pathname === "/queue/history",
          icon: "heroicons-outline:archive-box",
          submenus: [],
        },
        {
          id: "queue-category",
          href: "/queue/category",
          label: t("queueCategory"),
          active: pathname === "/queue/category",
          icon: "heroicons-outline:tag",
          submenus: [],
        },
        {
          id: "booking-list",
          href: "/booking/list",
          label: t("bookingList"),
          active: pathname === "/booking/list",
          icon: "heroicons-outline:calendar-days",
          submenus: [],
        },
        {
          id: "booking-slot",
          href: "/booking/slot",
          label: t("bookingSlot"),
          active: pathname === "/booking/slot",
          icon: "heroicons-outline:calendar",
          submenus: [],
        },
      ],
    },

    // ─────────────────────────────────────────
    // Service & Customer — รวมเป็นกลุ่ม "ธุรกิจ"
    // ─────────────────────────────────────────
    {
      groupLabel: t("business"),
      id: "business",
      menus: [
        {
          id: "service-list",
          href: "/service/servicelist",
          label: t("serviceList"),
          active: pathname === "/service/servicelist",
          icon: "heroicons-outline:briefcase",
          submenus: [],
        },
        {
          id: "service-category",
          href: "/service/category",
          label: t("serviceCategory"),
          active: pathname === "/service/category",
          icon: "heroicons-outline:rectangle-stack",
          submenus: [],
        },
        {
          id: "customer-list",
          href: "/customer/list",
          label: t("customerList"),
          active: pathname === "/customer/list",
          icon: "heroicons-outline:user-group",
          submenus: [],
        },
        {
          id: "customer-tag",
          href: "/customer/tag",
          label: t("customerTag"),
          active: pathname === "/customer/tag",
          icon: "heroicons-outline:tag",
          submenus: [],
        },
      ],
    },

    // ─────────────────────────────────────────
    // Finance — payment + invoice + subscription
    // ─────────────────────────────────────────
    {
      groupLabel: t("finance"),
      id: "finance",
      menus: [
        {
          id: "payment-list",
          href: "/payment/list",
          label: t("paymentList"),
          active: pathname === "/payment/list",
          icon: "heroicons-outline:credit-card",
          submenus: [],
        },
        {
          id: "payment-transaction",
          href: "/payment/transaction",
          label: t("paymentTransaction"),
          active: pathname === "/payment/transaction",
          icon: "heroicons-outline:arrows-right-left",
          submenus: [],
        },
        {
          id: "invoice",
          href: "/invoice",
          label: t("invoice"),
          active: pathname.startsWith("/invoice"),
          icon: "heroicons-outline:document-text",
          submenus: [],
        },
        {
          id: "subscription",
          href: "/subscription",
          label: t("subscription"),
          active: pathname.startsWith("/subscription"),
          icon: "heroicons-outline:arrow-path",
          submenus: [],
        },
      ],
    },

    // ─────────────────────────────────────────
    // Setting — shop + system + notification รวมไว้กลุ่มเดียว
    // ─────────────────────────────────────────
    {
      groupLabel: t("setting"),
      id: "setting",
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
          id: "setting-shop",
          href: "/setting/shop",
          label: t("shopInfo"),
          active: pathname === "/setting/shop",
          icon: "heroicons-outline:building-storefront",
          submenus: [],
        },
        {
          id: "setting-branch",
          href: "/setting/branch",
          label: t("branch"),
          active: pathname === "/setting/branch",
          icon: "heroicons-outline:building-office",
          submenus: [],
        },
        {
          id: "setting-business-hours",
          href: "/setting/business-hours",
          label: t("businessHours"),
          active: pathname === "/setting/business-hours",
          icon: "heroicons-outline:clock",
          submenus: [],
        },
        {
          id: "setting-holiday",
          href: "/setting/holiday",
          label: t("holiday"),
          active: pathname === "/setting/holiday",
          icon: "heroicons-outline:calendar",
          submenus: [],
        },
        {
          id: "setting-staff",
          href: "/setting/staff",
          label: t("staff"),
          active: pathname === "/setting/staff",
          icon: "heroicons-outline:users",
          submenus: [],
        },
        {
          id: "setting-queue",
          href: "/setting/queue",
          label: t("queueSetting"),
          active: pathname === "/setting/queue",
          icon: "heroicons-outline:adjustments-horizontal",
          submenus: [],
        },
        {
          id: "system-config",
          href: "/setting/system",
          label: t("systemConfig"),
          active: pathname === "/setting/system",
          icon: "heroicons-outline:cog-6-tooth",
          submenus: [],
        },
        {
          id: "audit-log",
          href: "/setting/audit-log",
          label: t("auditLog"),
          active: pathname === "/setting/audit-log",
          icon: "heroicons-outline:document-magnifying-glass",
          submenus: [],
        },
        {
          id: "master-status",
          href: "/setting/master-status",
          label: t("masterStatus"),
          active: pathname === "/setting/master-status",
          icon: "heroicons-outline:list-bullet",
          submenus: [],
        },
      ],
    },

    // ─────────────────────────────────────────
    // Logout
    // ─────────────────────────────────────────
    {
      groupLabel: "",
      id: "logout",
      menus: [
        {
          id: "logout",
          href: "/auth/logout",
          label: t("logout"),
          active: false,
          icon: "heroicons-outline:arrow-right-on-rectangle",
          submenus: [],
        },
      ],
    },
  ];
}

export function getHorizontalMenuList(pathname: string, t: any): Group[] {
  return [
    {
      groupLabel: "",
      id: "main",
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
          id: "queue-live",
          href: "/queue/live",
          label: t("queueAndBooking"),
          active: pathname.startsWith("/queue") || pathname.startsWith("/booking"),
          icon: "heroicons-outline:clock",
          submenus: [],
        },
        {
          id: "service-list",
          href: "/service/list",
          label: t("business"),
          active: pathname.startsWith("/service") || pathname.startsWith("/customer"),
          icon: "heroicons-outline:briefcase",
          submenus: [],
        },
        {
          id: "payment-list",
          href: "/payment/list",
          label: t("finance"),
          active: pathname.startsWith("/payment") || pathname.startsWith("/invoice") || pathname.startsWith("/subscription"),
          icon: "heroicons-outline:credit-card",
          submenus: [],
        },
        {
          id: "setting-shop",
          href: "/setting/shop",
          label: t("setting"),
          active: pathname.startsWith("/setting") || pathname.startsWith("/notification"),
          icon: "heroicons-outline:cog-6-tooth",
          submenus: [],
        },
      ],
    },
  ];
}
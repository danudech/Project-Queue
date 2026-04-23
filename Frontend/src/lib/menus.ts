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
    // 🏠 Overview
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
    // 🎟️ Queue & Booking  (Queues, Bookings, QueueSlots, QueueCategories)
    // ─────────────────────────────────────────
    {
      groupLabel: t("queueAndBooking"),
      id: "queue-booking",
      menus: [
        {
          id: "queue-live",
          href: "/queue/live",
          label: t("queueLive"),
          active: pathname.startsWith("/queue"),
          icon: "heroicons-outline:clock",
          submenus: [
            {
              href: "/queue/live",
              label: t("queueLive"),
              active: pathname === "/queue/live",
              icon: "",
              children: [],
            },
            {
              href: "/queue/history",
              label: t("queueHistory"),
              active: pathname === "/queue/history",
              icon: "",
              children: [],
            },
            {
              href: "/queue/category",
              label: t("queueCategory"),
              active: pathname === "/queue/category",
              icon: "",
              children: [],
            },
          ],
        },
        {
          id: "booking",
          href: "/booking",
          label: t("booking"),
          active: pathname.startsWith("/booking"),
          icon: "heroicons-outline:calendar-days",
          submenus: [
            {
              href: "/booking/list",
              label: t("bookingList"),
              active: pathname === "/booking/list",
              icon: "",
              children: [],
            },
            {
              href: "/booking/slot",
              label: t("bookingSlot"),
              active: pathname === "/booking/slot",
              icon: "",
              children: [],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────
    // 💼 Service  (Services, ServiceCategories)
    // ─────────────────────────────────────────
    {
      groupLabel: t("service"),
      id: "service",
      menus: [
        {
          id: "service",
          href: "/service",
          label: t("service"),
          active: pathname.startsWith("/service"),
          icon: "heroicons-outline:briefcase",
          submenus: [
            {
              href: "/service/list",
              label: t("serviceList"),
              active: pathname === "/service/list",
              icon: "",
              children: [],
            },
            {
              href: "/service/category",
              label: t("serviceCategory"),
              active: pathname === "/service/category",
              icon: "",
              children: [],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────
    // 👥 Customer  (Customers, CustomerNotes, CustomerTags)
    // ─────────────────────────────────────────
    {
      groupLabel: t("customer"),
      id: "customer",
      menus: [
        {
          id: "customer",
          href: "/customer",
          label: t("customer"),
          active: pathname.startsWith("/customer"),
          icon: "heroicons-outline:user-group",
          submenus: [
            {
              href: "/customer/list",
              label: t("customerList"),
              active: pathname === "/customer/list",
              icon: "",
              children: [],
            },
            {
              href: "/customer/tag",
              label: t("customerTag"),
              active: pathname === "/customer/tag",
              icon: "",
              children: [],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────
    // 💳 Payment  (Payments, PaymentTransactions, Invoices, Subscriptions)
    // ─────────────────────────────────────────
    {
      groupLabel: t("finance"),
      id: "finance",
      menus: [
        {
          id: "payment",
          href: "/payment",
          label: t("payment"),
          active: pathname.startsWith("/payment"),
          icon: "heroicons-outline:credit-card",
          submenus: [
            {
              href: "/payment/list",
              label: t("paymentList"),
              active: pathname === "/payment/list",
              icon: "",
              children: [],
            },
            {
              href: "/payment/transaction",
              label: t("paymentTransaction"),
              active: pathname === "/payment/transaction",
              icon: "",
              children: [],
            },
          ],
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
    // 🔔 Notification
    // ─────────────────────────────────────────
    {
      groupLabel: t("notification"),
      id: "notification",
      menus: [
        {
          id: "notification",
          href: "/notification",
          label: t("notification"),
          active: pathname.startsWith("/notification"),
          icon: "heroicons-outline:bell",
          submenus: [],
        },
      ],
    },

    // ─────────────────────────────────────────
    // ⚙️ Setting  (Shop, Branches, BusinessHours, Holidays, Staff, QueueConfig)
    // ─────────────────────────────────────────
    {
      groupLabel: t("setting"),
      id: "setting",
      menus: [
        {
          id: "setting-shop",
          href: "/setting/shop",
          label: t("shopSetting"),
          active: pathname.startsWith("/setting"),
          icon: "heroicons-outline:building-storefront",
          submenus: [
            {
              href: "/setting/shop",
              label: t("shopInfo"),
              active: pathname === "/setting/shop",
              icon: "",
              children: [],
            },
            {
              href: "/setting/branch",
              label: t("branch"),
              active: pathname === "/setting/branch",
              icon: "",
              children: [],
            },
            {
              href: "/setting/business-hours",
              label: t("businessHours"),
              active: pathname === "/setting/business-hours",
              icon: "",
              children: [],
            },
            {
              href: "/setting/holiday",
              label: t("holiday"),
              active: pathname === "/setting/holiday",
              icon: "",
              children: [],
            },
            {
              href: "/setting/staff",
              label: t("staff"),
              active: pathname === "/setting/staff",
              icon: "",
              children: [],
            },
            {
              href: "/setting/queue",
              label: t("queueSetting"),
              active: pathname === "/setting/queue",
              icon: "",
              children: [],
            },
          ],
        },
        // System (Admin only)
        {
          id: "setting-system",
          href: "/setting/system",
          label: t("systemConfig"),
          active: pathname.startsWith("/setting/system"),
          icon: "heroicons-outline:cog-6-tooth",
          submenus: [
            {
              href: "/setting/system",
              label: t("systemConfig"),
              active: pathname === "/setting/system",
              icon: "",
              children: [],
            },
            {
              href: "/setting/audit-log",
              label: t("auditLog"),
              active: pathname === "/setting/audit-log",
              icon: "",
              children: [],
            },
            {
              href: "/setting/master-status",
              label: t("masterStatus"),
              active: pathname === "/setting/master-status",
              icon: "",
              children: [],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────
    // 🚪 Logout
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
          id: "queue-booking",
          href: "/queue/live",
          label: t("queueAndBooking"),
          active: pathname.startsWith("/queue") || pathname.startsWith("/booking"),
          icon: "heroicons-outline:clock",
          submenus: [
            { href: "/queue/live", label: t("queueLive"), active: pathname.startsWith("/queue"), icon: "", children: [] },
            { href: "/booking/list", label: t("bookingList"), active: pathname.startsWith("/booking"), icon: "", children: [] },
            { href: "/booking/slot", label: t("bookingSlot"), active: pathname === "/booking/slot", icon: "", children: [] },
            { href: "/queue/category", label: t("queueCategory"), active: pathname === "/queue/category", icon: "", children: [] },
          ],
        },
        {
          id: "service",
          href: "/service/list",
          label: t("service"),
          active: pathname.startsWith("/service"),
          icon: "heroicons-outline:briefcase",
          submenus: [
            { href: "/service/list", label: t("serviceList"), active: pathname === "/service/list", icon: "", children: [] },
            { href: "/service/category", label: t("serviceCategory"), active: pathname === "/service/category", icon: "", children: [] },
          ],
        },
        {
          id: "customer",
          href: "/customer/list",
          label: t("customer"),
          active: pathname.startsWith("/customer"),
          icon: "heroicons-outline:user-group",
          submenus: [
            { href: "/customer/list", label: t("customerList"), active: pathname === "/customer/list", icon: "", children: [] },
            { href: "/customer/tag", label: t("customerTag"), active: pathname === "/customer/tag", icon: "", children: [] },
          ],
        },
        {
          id: "finance",
          href: "/payment/list",
          label: t("finance"),
          active: pathname.startsWith("/payment") || pathname.startsWith("/invoice") || pathname.startsWith("/subscription"),
          icon: "heroicons-outline:credit-card",
          submenus: [
            { href: "/payment/list", label: t("payment"), active: pathname.startsWith("/payment"), icon: "", children: [] },
            { href: "/invoice", label: t("invoice"), active: pathname.startsWith("/invoice"), icon: "", children: [] },
            { href: "/subscription", label: t("subscription"), active: pathname.startsWith("/subscription"), icon: "", children: [] },
          ],
        },
        {
          id: "setting",
          href: "/setting/shop",
          label: t("setting"),
          active: pathname.startsWith("/setting"),
          icon: "heroicons-outline:cog-6-tooth",
          submenus: [
            { href: "/setting/shop", label: t("shopInfo"), active: pathname === "/setting/shop", icon: "", children: [] },
            { href: "/setting/branch", label: t("branch"), active: pathname === "/setting/branch", icon: "", children: [] },
            { href: "/setting/business-hours", label: t("businessHours"), active: pathname === "/setting/business-hours", icon: "", children: [] },
            { href: "/setting/holiday", label: t("holiday"), active: pathname === "/setting/holiday", icon: "", children: [] },
            { href: "/setting/staff", label: t("staff"), active: pathname === "/setting/staff", icon: "", children: [] },
            { href: "/setting/queue", label: t("queueSetting"), active: pathname === "/setting/queue", icon: "", children: [] },
          ],
        },
      ],
    },
  ];
}
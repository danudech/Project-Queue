

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
    // 🏠 Dashboard
    {
      groupLabel: "",
      id: "dashboard",
      menus: [
        {
          id: "dashboard",
          href: "/dashboard",
          label: t("dashboard"),
          active: pathname.includes("/dashboard"),
          icon: "heroicons-outline:home",
          submenus: [],
        },
      ],
    },

    // 📅 Queue
    {
      groupLabel: t("queue"),
      id: "queue",
      menus: [
        {
          id: "queue",
          href: "/queue/today",
          label: t("queue"),
          active: pathname.includes("/queue"),
          icon: "heroicons-outline:calendar",
          submenus: [
            {
              href: "/queue/today",
              label: t("todayQueue"),
              active: pathname === "/queue/today",
              icon: "",
              children: [],
            },
            {
              href: "/queue/waiting",
              label: t("waiting"),
              active: pathname === "/queue/waiting",
              icon: "",
              children: [],
            },
            {
              href: "/queue/processing",
              label: t("processing"),
              active: pathname === "/queue/processing",
              icon: "",
              children: [],
            },
            {
              href: "/queue/completed",
              label: t("completed"),
              active: pathname === "/queue/completed",
              icon: "",
              children: [],
            },
            {
              href: "/queue/cancel",
              label: t("cancel"),
              active: pathname === "/queue/cancel",
              icon: "",
              children: [],
            },
            {
              href: "/queue/history",
              label: t("history"),
              active: pathname === "/queue/history",
              icon: "",
              children: [],
            },
          ],
        },
      ],
    },

    // 🏢 Shop (รวม service + staff + customer)
    {
      groupLabel: t("shop"),
      id: "shop",
      menus: [
        {
          id: "service",
          href: "/service/list",
          label: t("service"),
          active: pathname.includes("/service"),
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
              label: t("category"),
              active: pathname === "/service/category",
              icon: "",
              children: [],
            },
          ],
        },
        {
          id: "staff",
          href: "/staff/list",
          label: t("staff"),
          active: pathname.includes("/staff"),
          icon: "heroicons-outline:users",
          submenus: [
            {
              href: "/staff/list",
              label: t("staffList"),
              active: pathname === "/staff/list",
              icon: "",
              children: [],
            },
            {
              href: "/staff/schedule",
              label: t("schedule"),
              active: pathname === "/staff/schedule",
              icon: "",
              children: [],
            },
          ],
        },
        {
          id: "customer",
          href: "/customer/list",
          label: t("customer"),
          active: pathname.includes("/customer"),
          icon: "heroicons-outline:user-group",
          submenus: [
            {
              href: "/customer/list",
              label: t("customerList"),
              active: pathname === "/customer/list",
              icon: "",
              children: [],
            },
          ],
        },
      ],
    },

    // 📊 Reports
    {
      groupLabel: t("report"),
      id: "report",
      menus: [
        {
          id: "report",
          href: "/report/queue",
          label: t("report"),
          active: pathname.includes("/report"),
          icon: "heroicons-outline:chart-bar",
          submenus: [
            {
              href: "/report/queue",
              label: t("queueReport"),
              active: pathname === "/report/queue",
              icon: "",
              children: [],
            },
            {
              href: "/report/revenue",
              label: t("revenueReport"),
              active: pathname === "/report/revenue",
              icon: "",
              children: [],
            },
          ],
        },
      ],
    },

    // ⚙️ Settings
    {
      groupLabel: t("setting"),
      id: "setting",
      menus: [
        {
          id: "setting",
          href: "/setting",
          label: t("setting"),
          active: pathname.includes("/setting"),
          icon: "heroicons-outline:cog-6-tooth",
          submenus: [
            {
              href: "/setting/shop",
              label: t("shopInfo"),
              active: pathname === "/setting/shop",
              icon: "",
              children: [],
            },
            {
              href: "/setting/time",
              label: t("businessHours"),
              active: pathname === "/setting/time",
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
      ],
    },

    // 🚪 Logout
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
          active: pathname.includes("/dashboard"),
          icon: "heroicons-outline:home",
          submenus: [],
        },

        {
          id: "queue",
          href: "/queue/today",
          label: t("queue"),
          active: pathname.includes("/queue"),
          icon: "heroicons-outline:calendar",
          submenus: [
            { href: "/queue/today", label: t("todayQueue"), active: pathname === "/queue/today", icon: "", children: [] },
            { href: "/queue/waiting", label: t("waiting"), active: pathname === "/queue/waiting", icon: "", children: [] },
            { href: "/queue/processing", label: t("processing"), active: pathname === "/queue/processing", icon: "", children: [] },
            { href: "/queue/completed", label: t("completed"), active: pathname === "/queue/completed", icon: "", children: [] },
            { href: "/queue/cancel", label: t("cancel"), active: pathname === "/queue/cancel", icon: "", children: [] },
            { href: "/queue/history", label: t("history"), active: pathname === "/queue/history", icon: "", children: [] },
          ],
        },

        {
          id: "shop",
          href: "/service/list",
          label: t("shop"),
          active: pathname.includes("/service") || pathname.includes("/staff") || pathname.includes("/customer"),
          icon: "heroicons-outline:building-storefront",
          submenus: [
            { href: "/service/list", label: t("service"), active: pathname.includes("/service"), icon: "", children: [] },
            { href: "/staff/list", label: t("staff"), active: pathname.includes("/staff"), icon: "", children: [] },
            { href: "/customer/list", label: t("customer"), active: pathname.includes("/customer"), icon: "", children: [] },
          ],
        },

        {
          id: "report",
          href: "/report/queue",
          label: t("report"),
          active: pathname.includes("/report"),
          icon: "heroicons-outline:chart-bar",
          submenus: [
            { href: "/report/queue", label: t("queueReport"), active: pathname === "/report/queue", icon: "", children: [] },
            { href: "/report/revenue", label: t("revenueReport"), active: pathname === "/report/revenue", icon: "", children: [] },
          ],
        },

        {
          id: "setting",
          href: "/setting/shop",
          label: t("setting"),
          active: pathname.includes("/setting"),
          icon: "heroicons-outline:cog-6-tooth",
          submenus: [
            { href: "/setting/shop", label: t("shopInfo"), active: pathname === "/setting/shop", icon: "", children: [] },
            { href: "/setting/time", label: t("businessHours"), active: pathname === "/setting/time", icon: "", children: [] },
            { href: "/setting/queue", label: t("queueSetting"), active: pathname === "/setting/queue", icon: "", children: [] },
          ],
        },
      ],
    },
  ];
}



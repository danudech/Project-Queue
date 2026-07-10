import { Home, Calendar, Users, Settings, Clock } from "lucide-react";

export const MENU_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["Owner", "Manager", "Staff"],
  },
  {
    title: "Booking",
    href: "/book-service",
    icon: Calendar,
    roles: ["Customer"],
  },
  {
    title: "Queue Status",
    href: "/queue-status",
    icon: Clock,
    roles: ["Customer", "Owner", "Manager", "Staff"],
  },
  {
    title: "Staff Management",
    href: "/staff",
    icon: Users,
    roles: ["Owner", "Manager"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["Owner", "Manager"],
  },
];

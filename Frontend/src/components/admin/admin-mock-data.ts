import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Building2,
  FileClock,
  Gauge,
  Settings2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const adminNavItems: AdminNavItem[] = [
  { label: "Overview", description: "Platform health", href: "/admin", icon: Gauge },
  { label: "Shops", description: "Tenant lifecycle", href: "/admin/shops", icon: Building2 },
  { label: "Users", description: "Accounts & access", href: "/admin/users", icon: UsersRound },
  { label: "Operations", description: "Queues & incidents", href: "/admin/operations", icon: Activity },
  { label: "Audit log", description: "Platform activity", href: "/admin/audit-log", icon: FileClock },
  { label: "Settings", description: "Global controls", href: "/admin/settings", icon: Settings2 },
];

export const adminOverviewStats = [
  { label: "Active shops", value: "128", change: "+8 this month", icon: Building2, tone: "emerald" },
  { label: "Platform users", value: "2,846", change: "+12.4%", icon: UsersRound, tone: "blue" },
  { label: "Queues today", value: "4,392", change: "Across 186 branches", icon: Activity, tone: "amber" },
  { label: "Healthy services", value: "99.98%", change: "Last 24 hours", icon: ShieldCheck, tone: "violet" },
] as const;

export const mockShops = [
  { name: "Nara Wellness Studio", owner: "Nara P.", branches: 3, status: "Active", queues: 184 },
  { name: "Mellow Hair Lab", owner: "Mellow Group", branches: 5, status: "Active", queues: 321 },
  { name: "The Daily Clinic", owner: "Daily Health Co.", branches: 2, status: "Review", queues: 96 },
  { name: "Common Ground Barbers", owner: "Common Ground", branches: 1, status: "Suspended", queues: 0 },
];

export const mockActivity = [
  { title: "Shop verification requested", detail: "The Daily Clinic · 12 minutes ago", tone: "Review" },
  { title: "New shop activated", detail: "Nara Wellness Studio · 48 minutes ago", tone: "Success" },
  { title: "Account access suspended", detail: "Common Ground Barbers · 2 hours ago", tone: "Warning" },
  { title: "Platform setting updated", detail: "Queue retention policy · Yesterday", tone: "Info" },
];

export const moduleDefinitions = {
  shops: {
    eyebrow: "TENANT MANAGEMENT",
    title: "Shops",
    description: "Review every tenant, ownership record, branch count, and platform access state.",
    primaryAction: "Add shop",
    columns: ["Shop", "Owner", "Branches", "Queues today", "Status"],
    rows: mockShops.map((shop) => [shop.name, shop.owner, String(shop.branches), String(shop.queues), shop.status]),
  },
  users: {
    eyebrow: "IDENTITY & ACCESS",
    title: "Platform users",
    description: "Inspect accounts and prepare support or access actions across every tenant.",
    primaryAction: "Invite administrator",
    columns: ["User", "Role", "Shop", "Last active", "Status"],
    rows: [
      ["Arisa K.", "Shop owner", "Nara Wellness Studio", "2 min ago", "Active"],
      ["Thanawat R.", "Manager", "Mellow Hair Lab", "18 min ago", "Active"],
      ["Pimchanok S.", "Customer", "—", "Yesterday", "Active"],
      ["Support Operator", "Platform admin", "EZQueue", "3 days ago", "Review"],
    ],
  },
  operations: {
    eyebrow: "PLATFORM OPERATIONS",
    title: "Operations center",
    description: "Monitor queue traffic, integration health, background jobs, and incidents.",
    primaryAction: "Create incident",
    columns: ["Service", "Region", "Throughput", "Last check", "Status"],
    rows: [
      ["Public booking API", "Thailand", "218 req/min", "Just now", "Healthy"],
      ["Queue event worker", "Thailand", "74 jobs/min", "Just now", "Healthy"],
      ["Notification delivery", "Thailand", "41 msg/min", "1 min ago", "Degraded"],
      ["Database backups", "Primary", "Daily", "04:00 today", "Healthy"],
    ],
  },
  "audit-log": {
    eyebrow: "GOVERNANCE",
    title: "Platform audit log",
    description: "Trace sensitive administrator actions without exposing tenant secrets.",
    primaryAction: "Export log",
    columns: ["Time", "Administrator", "Action", "Target", "Result"],
    rows: [
      ["10:42", "admin@ezqueue.co", "Reviewed shop", "The Daily Clinic", "Success"],
      ["09:18", "admin@ezqueue.co", "Suspended access", "Common Ground Barbers", "Success"],
      ["Yesterday", "system", "Backup completed", "Primary database", "Success"],
      ["Yesterday", "ops@ezqueue.co", "Changed retention", "Audit policy", "Review"],
    ],
  },
  settings: {
    eyebrow: "PLATFORM CONTROLS",
    title: "Global settings",
    description: "A safe staging area for platform-wide policy, feature flags, and maintenance controls.",
    primaryAction: "Save draft",
    columns: ["Setting", "Scope", "Current value", "Updated by", "State"],
    rows: [
      ["Default timezone", "New shops", "Asia/Bangkok", "System", "Active"],
      ["Audit retention", "All tenants", "365 days", "Platform admin", "Draft"],
      ["New shop onboarding", "All tenants", "Enabled", "Platform admin", "Active"],
      ["Maintenance banner", "Public booking", "Disabled", "Operations", "Inactive"],
    ],
  },
} as const;


import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  FileClock,
  Gauge,
  Key,
  Settings2,
  ShieldCheck,
  Sliders,
  UserCheck,
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

export type OverviewStat = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: "primary" | "success" | "warning" | "info" | "secondary" | "destructive";
};

export const adminOverviewStats: OverviewStat[] = [
  { label: "Active shops", value: "128", helper: "+8 new shops this month", icon: Building2, tone: "success" },
  { label: "Platform users", value: "2,846", helper: "+12.4% MoM growth", icon: UsersRound, tone: "info" },
  { label: "Queues today", value: "4,392", helper: "Across 186 branch counters", icon: Activity, tone: "primary" },
  { label: "Service uptime", value: "99.98%", helper: "Zero outages in 30 days", icon: ShieldCheck, tone: "warning" },
];

export const mockShops = [
  { name: "Nara Wellness Studio", owner: "Nara P.", branches: 3, status: "Active", queues: 184, plan: "Enterprise", joined: "Jan 2026" },
  { name: "Mellow Hair Lab", owner: "Mellow Group", branches: 5, status: "Active", queues: 321, plan: "Pro", joined: "Feb 2026" },
  { name: "The Daily Clinic", owner: "Daily Health Co.", branches: 2, status: "Review", queues: 96, plan: "Standard", joined: "Apr 2026" },
  { name: "Common Ground Barbers", owner: "Common Ground", branches: 1, status: "Suspended", queues: 0, plan: "Starter", joined: "Nov 2025" },
  { name: "Apex Dental Clinic", owner: "Dr. Somchai K.", branches: 2, status: "Active", queues: 142, plan: "Pro", joined: "May 2026" },
  { name: "Komorebi Tea & Spa", owner: "Mayuko T.", branches: 1, status: "Active", queues: 88, plan: "Standard", joined: "Jun 2026" },
];

export const mockActivity = [
  { title: "Shop verification submitted", actor: "The Daily Clinic", detail: "KYC documents uploaded for legal entity review", timestamp: "12m ago", tone: "warning" },
  { title: "New tenant onboarded", actor: "Nara Wellness Studio", detail: "Activated 3 branches and 12 service staff members", timestamp: "48m ago", tone: "success" },
  { title: "Account access suspended", actor: "Common Ground Barbers", detail: "Repeated spam booking triggers on public queue", timestamp: "2h ago", tone: "destructive" },
  { title: "Global rate limits updated", actor: "Security Policy", detail: "Increased public booking write limit to 10 req/min", timestamp: "5h ago", tone: "info" },
  { title: "Database snapshot verified", actor: "Primary Backup Job", detail: "Automated snapshot integrity test passed (2.4 GB)", timestamp: "1d ago", tone: "success" },
];

export const mockServiceHealth = [
  { name: "Public Booking API", status: "Healthy", latency: "38ms", throughput: "218 req/min", region: "Bangkok (BKK-1)" },
  { name: "Queue Event Processor", status: "Healthy", latency: "14ms", throughput: "74 jobs/min", region: "Bangkok (BKK-1)" },
  { name: "Notification Gateway", status: "Degraded", latency: "340ms", throughput: "41 msg/min", region: "Global Webhook" },
  { name: "Primary Database (SQL)", status: "Healthy", latency: "4ms", throughput: "1,240 QPS", region: "Dedicated Cluster" },
];

export type ModuleStat = {
  label: string;
  value: string;
  helper: string;
  tone: "primary" | "success" | "warning" | "info" | "secondary" | "destructive";
  icon: LucideIcon;
};

export const moduleDefinitions = {
  shops: {
    eyebrow: "TENANT MANAGEMENT",
    title: "Shops & Tenants",
    description: "Review tenant lifecycle, verify shop credentials, inspect branch allocations, and review platform access.",
    primaryAction: "Add shop",
    stats: [
      { label: "Total Tenants", value: "128", helper: "+8 new this month", tone: "primary", icon: Building2 },
      { label: "Active Shops", value: "119", helper: "93% healthy active", tone: "success", icon: CheckCircle2 },
      { label: "Under Review", value: "6", helper: "Pending KYC inspection", tone: "warning", icon: Clock },
      { label: "Suspended", value: "3", helper: "Policy violations", tone: "destructive", icon: AlertTriangle },
    ] as ModuleStat[],
    columns: ["Shop", "Owner", "Branches", "Queues today", "Plan", "Status"],
    rows: mockShops.map((shop) => [shop.name, shop.owner, `${shop.branches} branches`, String(shop.queues), shop.plan, shop.status]),
  },
  users: {
    eyebrow: "IDENTITY & ACCESS",
    title: "Platform Accounts",
    description: "Inspect registered accounts, role mappings, elevated privileges, and tenant associations.",
    primaryAction: "Invite administrator",
    stats: [
      { label: "Total Accounts", value: "2,846", helper: "+12.4% MoM active", tone: "primary", icon: UsersRound },
      { label: "Shop Owners", value: "142", helper: "1-account-1-shop invariant", tone: "success", icon: ShieldCheck },
      { label: "Staff & Managers", value: "688", helper: "Scoped to shop branches", tone: "info", icon: UserCheck },
      { label: "Platform Admins", value: "4", helper: "MFA Enforced credentials", tone: "warning", icon: Key },
    ] as ModuleStat[],
    columns: ["User Account", "Role", "Shop Association", "Last active", "Status"],
    rows: [
      ["Arisa K. (arisa@nara.local)", "Shop owner", "Nara Wellness Studio", "2 min ago", "Active"],
      ["Thanawat R. (thanawat@mellow.local)", "Branch Manager", "Mellow Hair Lab", "18 min ago", "Active"],
      ["Pimchanok S. (customer@gmail.local)", "Customer", "— (Public booking)", "Yesterday", "Active"],
      ["Support Operator (support@ezqueue.local)", "Platform admin", "EZQueue Platform", "3 days ago", "Review"],
      ["Chayanon V. (staff@dailyclinic.local)", "Staff member", "The Daily Clinic", "1 hour ago", "Active"],
      ["Dr. Somchai K. (somchai@apex.local)", "Shop owner", "Apex Dental Clinic", "4 hours ago", "Active"],
    ],
  },
  operations: {
    eyebrow: "PLATFORM OPERATIONS",
    title: "Operations & Workers",
    description: "Monitor real-time queue traffic, background processing workers, integration health, and incidents.",
    primaryAction: "Create incident",
    stats: [
      { label: "Service Health", value: "99.98%", helper: "Last 30 days rolling", tone: "success", icon: ShieldCheck },
      { label: "Active Queues", value: "4,392", helper: "Across all shops today", tone: "primary", icon: Activity },
      { label: "Worker Jobs", value: "115 / min", helper: "Zero processing backlog", tone: "info", icon: Cpu },
      { label: "Open Incidents", value: "0", helper: "All systems operational", tone: "warning", icon: AlertCircle },
    ] as ModuleStat[],
    columns: ["Service / Worker", "Region", "Throughput", "Latency / Interval", "Status"],
    rows: [
      ["Public Booking API", "ap-southeast-1 (Bangkok)", "218 req/min", "38ms avg", "Healthy"],
      ["Queue Event Worker", "ap-southeast-1 (Bangkok)", "74 jobs/min", "12ms avg", "Healthy"],
      ["Notification Gateway", "Global (LINE/Email)", "41 msg/min", "340ms avg", "Degraded"],
      ["Database Backup Job", "Primary Cluster", "Daily snapshot", "04:00 UTC+7", "Healthy"],
      ["Chat WebSocket Cluster", "ap-southeast-1 (Bangkok)", "512 active conn", "18ms avg", "Healthy"],
    ],
  },
  "audit-log": {
    eyebrow: "SECURITY & GOVERNANCE",
    title: "Platform Audit Log",
    description: "Trace sensitive cross-tenant actions, policy adjustments, and elevated access events without exposing tenant secrets.",
    primaryAction: "Export audit log",
    stats: [
      { label: "Total Events (7d)", value: "1,482", helper: "Immutable audit ledger", tone: "primary", icon: FileClock },
      { label: "Privileged Actions", value: "28", helper: "By 3 verified admins", tone: "warning", icon: ShieldCheck },
      { label: "Policy Changes", value: "4", helper: "Reviewed and approved", tone: "info", icon: Settings2 },
      { label: "Security Anomalies", value: "0", helper: "Clean audit log", tone: "success", icon: CheckCircle2 },
    ] as ModuleStat[],
    columns: ["Timestamp", "Administrator", "Action", "Target Resource", "Result"],
    rows: [
      ["10:42 Today", "admin@ezqueue.local", "Reviewed shop KYC", "The Daily Clinic", "Success"],
      ["09:18 Today", "admin@ezqueue.local", "Suspended tenant", "Common Ground Barbers", "Success"],
      ["Yesterday 23:00", "system-automated", "Automated DB snapshot", "Primary Cluster", "Success"],
      ["Yesterday 16:30", "ops@ezqueue.local", "Updated write rate limit", "Public Booking Route", "Success"],
      ["24 Oct 14:15", "admin@ezqueue.local", "Granted branch manager role", "Thanawat R. (Mellow Hair)", "Success"],
    ],
  },
  settings: {
    eyebrow: "SYSTEM CONFIGURATION",
    title: "Global Platform Settings",
    description: "Manage system-wide defaults, feature flags, maintenance windows, and global security policies.",
    primaryAction: "Save draft",
    stats: [
      { label: "Global Policies", value: "18", helper: "Active across tenants", tone: "primary", icon: Settings2 },
      { label: "Feature Flags", value: "6", helper: "2 in gradual rollout", tone: "info", icon: Sliders },
      { label: "Maintenance Status", value: "Normal", helper: "Next window: Nov 1", tone: "success", icon: CheckCircle2 },
      { label: "Draft Changes", value: "1", helper: "Awaiting approval", tone: "warning", icon: Clock },
    ] as ModuleStat[],
    columns: ["Setting Key", "Scope", "Configured Value", "Last Updated By", "State"],
    rows: [
      ["Default Timezone", "All new tenants", "Asia/Bangkok (UTC+7)", "System default", "Active"],
      ["Audit Retention Period", "Global database", "365 days (Rolling)", "Platform Admin", "Active"],
      ["New Tenant Onboarding", "Registration portal", "Enabled (Open registration)", "Platform Admin", "Active"],
      ["Maintenance Banner", "Public customer booking", "Disabled", "Operations", "Inactive"],
      ["Max SMS/Email Quota", "Free tier shops", "500 msgs / month", "Finance Ops", "Draft"],
    ],
  },
} as const;

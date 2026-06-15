import MockDashboardPage from "../_components/mock-dashboard-page";

export default function SystemIndexPage() {
  return (
    <MockDashboardPage
      eyebrow="Administration"
      title="System"
      description="System overview mockup for configuration, master statuses, audit logs, and integrations."
      primaryAction="Open config"
      stats={[
        { label: "Config keys", value: "18", helper: "Mock settings" },
        { label: "Statuses", value: "22", helper: "Master data" },
        { label: "Audit events", value: "1,402", helper: "This month" },
        { label: "Health", value: "OK", helper: "Mock monitor" },
      ]}
      rows={[
        { id: "sys1", title: "System config", subtitle: "Operational and integration settings.", meta: "/system/config", status: "Active", enabled: true },
        { id: "sys2", title: "Master status", subtitle: "Workflow statuses for modules.", meta: "/system/master-status", status: "Active", enabled: true },
        { id: "sys3", title: "Audit log", subtitle: "Security and staff activity trail.", meta: "/system/audit-log", status: "Active", enabled: true },
      ]}
      panelTitle="System modules"
      panelDescription="Parent route overview for system pages."
      progressLabel="System readiness"
      progressValue={82}
      detailItems={[
        { label: "Environment", value: "Frontend mock" },
        { label: "Locale", value: "TH / EN" },
        { label: "Audit retention", value: "180 days" },
      ]}
    />
  );
}

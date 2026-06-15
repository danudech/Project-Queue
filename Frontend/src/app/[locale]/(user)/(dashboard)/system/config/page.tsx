import MockDashboardPage from "../../_components/mock-dashboard-page";

export default function SystemConfigPage() {
  return (
    <MockDashboardPage
      eyebrow="Administration"
      title="System config"
      description="System configuration mockup for queue numbering, locale, timezone, and integration settings."
      primaryAction="Add config"
      stats={[
        { label: "Configs", value: "18", helper: "Mock keys" },
        { label: "Integrations", value: "3", helper: "Connected apps" },
        { label: "Timezone", value: "BKK", helper: "Asia/Bangkok" },
        { label: "Health", value: "OK", helper: "Mock status" },
      ]}
      rows={[
        { id: "sc1", title: "Queue prefix", subtitle: "Use Q- as daily queue number prefix.", meta: "Applies to all branches", status: "Active", enabled: true },
        { id: "sc2", title: "Customer public booking", subtitle: "Allow customers to book from public page.", meta: "Requires active services", status: "Active", enabled: true },
        { id: "sc3", title: "Debug notifications", subtitle: "Send mock notification logs to admin.", meta: "Development only", status: "Pending", enabled: false },
      ]}
      panelTitle="Configuration keys"
      panelDescription="Mock system settings."
      progressLabel="Configured modules"
      progressValue={74}
      detailItems={[
        { label: "Locale", value: "TH / EN" },
        { label: "Queue reset", value: "Daily" },
        { label: "Webhook retries", value: "3" },
      ]}
    />
  );
}

import MockDashboardPage from "../_components/mock-dashboard-page";

export default function SettingIndexPage() {
  return (
    <MockDashboardPage
      eyebrow="Administration"
      title="Settings"
      description="Central settings index mockup linking shop, branch, hours, holidays, staff, and role configuration."
      primaryAction="Open setup"
      stats={[
        { label: "Shop setup", value: "80%", helper: "Profile completion" },
        { label: "Branches", value: "2", helper: "Configured" },
        { label: "Staff", value: "8", helper: "Active users" },
        { label: "Rules", value: "12", helper: "Operational settings" },
      ]}
      rows={[
        { id: "set1", title: "Shop information", subtitle: "Name, logo, contact, and shop status.", meta: "/setting/shop", status: "Active", enabled: true },
        { id: "set2", title: "Business hours", subtitle: "Weekly schedule and booking availability.", meta: "/setting/business-hours", status: "Active", enabled: true },
        { id: "set3", title: "Staff and roles", subtitle: "Team access and permissions.", meta: "/setting/staff", status: "Pending", enabled: false },
      ]}
      panelTitle="Settings checklist"
      panelDescription="Mock setup checklist."
      progressLabel="Configuration readiness"
      progressValue={80}
      detailItems={[
        { label: "Required", value: "Shop + branch" },
        { label: "Optional", value: "Staff roles" },
        { label: "Public booking", value: "Ready" },
      ]}
    />
  );
}

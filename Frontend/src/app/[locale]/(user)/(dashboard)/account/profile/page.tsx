import MockDashboardPage from "../../_components/mock-dashboard-page";

export default function AccountProfilePage() {
  return (
    <MockDashboardPage
      eyebrow="Account"
      title="My profile"
      description="Profile mockup for owner account details, security preferences, and workspace access."
      primaryAction="Edit profile"
      stats={[
        { label: "Role", value: "Owner", helper: "Full access" },
        { label: "Workspaces", value: "1", helper: "EZQueue shop" },
        { label: "MFA", value: "Off", helper: "Recommended" },
        { label: "Sessions", value: "2", helper: "Active devices" },
      ]}
      rows={[
        { id: "ap1", title: "Dany Owner", subtitle: "owner@example.com", meta: "Primary account", status: "Active", enabled: true },
        { id: "ap2", title: "Password security", subtitle: "Last changed 45 days ago.", meta: "Security settings", status: "Active", enabled: true },
        { id: "ap3", title: "Email notifications", subtitle: "Receive important workspace updates.", meta: "Preference", status: "Active", enabled: true },
      ]}
      panelTitle="Profile settings"
      panelDescription="Mock account preference list."
      progressLabel="Security score"
      progressValue={62}
      detailItems={[
        { label: "Language", value: "English" },
        { label: "Timezone", value: "Asia/Bangkok" },
        { label: "Last login", value: "Today" },
      ]}
    />
  );
}

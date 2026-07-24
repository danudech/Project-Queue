import MockDashboardPage from "../_components/mock-dashboard-page";

export default function AccountIndexPage() {
  return (
    <MockDashboardPage
      eyebrow="Account"
      title="Account"
      description="Account overview mockup for profile details, workspace access, sessions, and security preferences."
      primaryAction="Edit profile"
      stats={[
        { label: "Role", value: "Owner", helper: "Workspace access" },
        { label: "Sessions", value: "2", helper: "Active devices" },
        { label: "Security", value: "62%", helper: "Mock score" },
        { label: "Workspaces", value: "1", helper: "Connected" },
      ]}
      rows={[
        { id: "acc1", title: "My profile", subtitle: "Personal details and preferences.", meta: "/account/profile", status: "Active", enabled: true },
        { id: "acc2", title: "Security", subtitle: "Password and session controls.", meta: "/account/security", status: "Active", enabled: true },
        { id: "acc3", title: "Notification preferences", subtitle: "Account-level notification settings.", meta: "Future module", status: "Active", enabled: true },
      ]}
      panelTitle="Account modules"
      panelDescription="Parent route overview for account pages."
      progressLabel="Profile readiness"
      progressValue={62}
      detailItems={[
        { label: "Email", value: "owner@example.com" },
        { label: "Timezone", value: "Asia/Bangkok" },
        { label: "MFA", value: "Off" },
      ]}
    />
  );
}

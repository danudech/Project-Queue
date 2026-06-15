import MockDashboardPage from "../../_components/mock-dashboard-page";

export default function RolePage() {
  return (
    <MockDashboardPage
      eyebrow="Administration"
      title="Roles and permissions"
      description="Permission mockup for owner, manager, staff, and front desk roles."
      primaryAction="Create role"
      stats={[
        { label: "Roles", value: "4", helper: "Permission sets" },
        { label: "Modules", value: "9", helper: "Protected areas" },
        { label: "Custom", value: "1", helper: "Custom role" },
        { label: "Audited", value: "100%", helper: "Mock coverage" },
      ]}
      rows={[
        { id: "r1", title: "Owner", subtitle: "Full access to shop, finance, and settings.", meta: "2 users", status: "Active", enabled: true },
        { id: "r2", title: "Manager", subtitle: "Manage queue, booking, staff, and reports.", meta: "1 user", status: "Active", enabled: true },
        { id: "r3", title: "Front desk", subtitle: "Create walk-ins and manage daily queue.", meta: "3 users", status: "Active", enabled: true },
      ]}
      panelTitle="Permission sets"
      panelDescription="Mock role list with local toggles."
      progressLabel="Permission setup"
      progressValue={80}
      detailItems={[
        { label: "Sensitive modules", value: "Finance" },
        { label: "Default staff role", value: "Front desk" },
        { label: "MFA required", value: "Owner" },
      ]}
    />
  );
}

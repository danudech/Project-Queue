import MockDashboardPage from "../../_components/mock-dashboard-page";

export default function StaffPage() {
  return (
    <MockDashboardPage
      eyebrow="Administration"
      title="Staff"
      description="Staff management mockup for employees, assigned branches, roles, and active service capacity."
      primaryAction="Invite staff"
      stats={[
        { label: "Staff", value: "8", helper: "Active users" },
        { label: "On shift", value: "5", helper: "Today" },
        { label: "Roles", value: "4", helper: "Permission groups" },
        { label: "Invites", value: "2", helper: "Pending accept" },
      ]}
      rows={[
        { id: "st1", title: "Aom S.", subtitle: "Senior stylist", meta: "Main branch", status: "Active", enabled: true },
        { id: "st2", title: "May K.", subtitle: "Reception and booking", meta: "Main branch", status: "Active", enabled: true },
        { id: "st3", title: "Bank T.", subtitle: "Part-time stylist", meta: "Weekend schedule", status: "Pending", enabled: false },
      ]}
      panelTitle="Staff list"
      panelDescription="Mock staff management list."
      progressLabel="Profile completion"
      progressValue={69}
      detailItems={[
        { label: "Default role", value: "Staff" },
        { label: "Branch access", value: "Scoped" },
        { label: "Invite expiry", value: "7 days" },
      ]}
    />
  );
}

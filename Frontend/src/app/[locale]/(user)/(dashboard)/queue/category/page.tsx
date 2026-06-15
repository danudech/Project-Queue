import MockDashboardPage from "../../_components/mock-dashboard-page";

export default function QueueCategoryPage() {
  return (
    <MockDashboardPage
      eyebrow="Operations"
      title="Queue categories"
      description="Mock setup for separating walk-in, appointment, VIP, and service-specific queue lanes."
      primaryAction="Add category"
      stats={[
        { label: "Categories", value: "5", helper: "Queue lanes" },
        { label: "Active", value: "4", helper: "Visible to staff" },
        { label: "Priority rules", value: "2", helper: "Mock rules" },
        { label: "Auto assign", value: "On", helper: "Routing enabled" },
      ]}
      rows={[
        { id: "qc1", title: "Appointment", subtitle: "Bookings with confirmed time slots.", meta: "Default priority", status: "Active", enabled: true },
        { id: "qc2", title: "Walk-in", subtitle: "Customers created from front desk.", meta: "First come first served", status: "Active", enabled: true },
        { id: "qc3", title: "VIP", subtitle: "Tagged customers with priority handling.", meta: "Priority +1", status: "Pending", enabled: false },
      ]}
      panelTitle="Category rules"
      panelDescription="Local mock queue categories."
      progressLabel="Rule coverage"
      progressValue={64}
      detailItems={[
        { label: "Default lane", value: "Appointment" },
        { label: "Staff override", value: "Allowed" },
        { label: "Public display", value: "Enabled" },
      ]}
    />
  );
}

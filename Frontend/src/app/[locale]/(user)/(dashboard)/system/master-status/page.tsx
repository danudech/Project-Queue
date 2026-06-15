import MockDashboardPage from "../../_components/mock-dashboard-page";

export default function MasterStatusPage() {
  return (
    <MockDashboardPage
      eyebrow="Administration"
      title="Master status"
      description="Master data status mockup for booking, queue, payment, and notification states."
      primaryAction="Add status"
      stats={[
        { label: "Statuses", value: "22", helper: "Across modules" },
        { label: "Active", value: "19", helper: "Available states" },
        { label: "Locked", value: "3", helper: "System states" },
        { label: "Mapped", value: "100%", helper: "Workflow coverage" },
      ]}
      rows={[
        { id: "ms1", title: "Booking confirmed", subtitle: "Customer has confirmed an appointment.", meta: "Booking module", status: "Active", enabled: true },
        { id: "ms2", title: "Queue serving", subtitle: "Customer is currently being served.", meta: "Queue module", status: "Active", enabled: true },
        { id: "ms3", title: "Payment refunded", subtitle: "Payment has been refunded or reversed.", meta: "Finance module", status: "Active", enabled: true },
      ]}
      panelTitle="Status catalog"
      panelDescription="Mock master status records."
      progressLabel="Workflow coverage"
      progressValue={100}
      detailItems={[
        { label: "Primary module", value: "Booking" },
        { label: "Editable", value: "Custom only" },
        { label: "Color tokens", value: "Mapped" },
      ]}
    />
  );
}

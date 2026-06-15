import MockDashboardPage from "../_components/mock-dashboard-page";

export default function BookingIndexPage() {
  return (
    <MockDashboardPage
      eyebrow="Operations"
      title="Booking management"
      description="Booking overview mockup for appointments, slot rules, and customer reservation flow."
      primaryAction="New booking"
      stats={[
        { label: "Bookings", value: "38", helper: "Today" },
        { label: "Confirmed", value: "31", helper: "Ready" },
        { label: "Slots", value: "64", helper: "Next 7 days" },
        { label: "Capacity", value: "76%", helper: "Booked" },
      ]}
      rows={[
        { id: "bi1", title: "Booking list", subtitle: "Manage confirmed and pending appointments.", meta: "/booking/list", status: "Active", enabled: true },
        { id: "bi2", title: "Booking slots", subtitle: "Configure available service slots.", meta: "/booking/slot", status: "Active", enabled: true },
        { id: "bi3", title: "Public booking flow", subtitle: "Customer-facing booking page mockup.", meta: "/[locale]", status: "Pending", enabled: false },
      ]}
      panelTitle="Booking modules"
      panelDescription="Parent route overview for booking pages."
      progressLabel="Booking readiness"
      progressValue={76}
      detailItems={[
        { label: "Slot interval", value: "30 min" },
        { label: "Advance window", value: "14 days" },
        { label: "Reminder", value: "Enabled" },
      ]}
    />
  );
}

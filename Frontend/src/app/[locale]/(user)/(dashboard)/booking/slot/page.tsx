import MockDashboardPage from "../../_components/mock-dashboard-page";

export default function BookingSlotPage() {
  return (
    <MockDashboardPage
      eyebrow="Operations"
      title="Booking slots"
      description="Mock availability grid for service slots, staff capacity, and online booking limits."
      primaryAction="Add slot rule"
      stats={[
        { label: "Open slots", value: "64", helper: "Next 7 days" },
        { label: "Blocked", value: "8", helper: "Holidays and breaks" },
        { label: "Staff capacity", value: "82%", helper: "Average" },
        { label: "Interval", value: "30m", helper: "Default slot size" },
      ]}
      rows={[
        { id: "bs1", title: "Weekday morning", subtitle: "09:00 - 12:00", meta: "4 staff available", status: "Active", enabled: true },
        { id: "bs2", title: "Weekday afternoon", subtitle: "13:00 - 18:00", meta: "5 staff available", status: "Active", enabled: true },
        { id: "bs3", title: "Sunday online booking", subtitle: "10:00 - 17:00", meta: "Temporarily hidden", status: "Closed", enabled: false },
      ]}
      panelTitle="Slot rules"
      panelDescription="Local toggles for booking slot mockups."
      progressLabel="Availability configured"
      progressValue={84}
      detailItems={[
        { label: "Advance booking", value: "14 days" },
        { label: "Buffer", value: "10 minutes" },
        { label: "Overbooking", value: "Disabled" },
      ]}
    />
  );
}

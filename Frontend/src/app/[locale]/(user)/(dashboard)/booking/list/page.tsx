import MockDashboardPage from "../../_components/mock-dashboard-page";

export default function BookingListPage() {
  return (
    <MockDashboardPage
      eyebrow="Operations"
      title="Booking list"
      description="Appointment management mockup for confirmed, pending, and canceled bookings."
      primaryAction="New booking"
      stats={[
        { label: "Today", value: "38", helper: "Total bookings" },
        { label: "Confirmed", value: "31", helper: "Ready to serve" },
        { label: "Pending", value: "5", helper: "Awaiting confirmation" },
        { label: "Canceled", value: "2", helper: "Today" },
      ]}
      rows={[
        { id: "b1", title: "Nicha Wong", subtitle: "Wash & Blow", meta: "Today 11:00, Main branch", status: "Active", amount: "THB 450" },
        { id: "b2", title: "Somchai Jaidee", subtitle: "Haircut", meta: "Today 10:30, Main branch", status: "Active", amount: "THB 300" },
        { id: "b3", title: "Kanda P.", subtitle: "Hair Color", meta: "Tomorrow 13:30", status: "Pending", amount: "THB 1,200" },
      ]}
      panelTitle="Appointments"
      panelDescription="Mock booking rows for future API integration."
      progressLabel="Daily booked capacity"
      progressValue={76}
      detailItems={[
        { label: "Next booking", value: "10:30" },
        { label: "Online bookings", value: "22" },
        { label: "Manual bookings", value: "16" },
      ]}
    />
  );
}

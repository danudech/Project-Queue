import MockDashboardPage from "../../_components/mock-dashboard-page";

export default function QueueLivePage() {
  return (
    <MockDashboardPage
      eyebrow="Operations"
      title="Live queue"
      description="Real-time queue board mockup for staff to call, serve, hold, and complete customers."
      primaryAction="Add walk-in"
      stats={[
        { label: "Waiting", value: "7", helper: "Customers in queue" },
        { label: "Serving", value: "3", helper: "Counters active" },
        { label: "Avg wait", value: "10m", helper: "Current estimate" },
        { label: "Done today", value: "24", helper: "Completed queues" },
      ]}
      rows={[
        { id: "q1", title: "Q-102 Somchai Jaidee", subtitle: "Haircut with Aom", meta: "Booked 10:30", status: "Waiting", amount: "10:30", enabled: true },
        { id: "q2", title: "Q-103 Nicha Wong", subtitle: "Wash & Blow with May", meta: "Serving at counter 2", status: "Active", amount: "11:00", enabled: true },
        { id: "q3", title: "Q-104 Kanda P.", subtitle: "Hair Color", meta: "VIP customer note", status: "Pending", amount: "13:30", enabled: false },
      ]}
      panelTitle="Queue board"
      panelDescription="Mock queue list with local toggles."
      progressLabel="Today capacity"
      progressValue={72}
      detailItems={[
        { label: "Next call", value: "Q-102" },
        { label: "Open counters", value: "3/4" },
        { label: "Hold queue", value: "1" },
      ]}
    />
  );
}

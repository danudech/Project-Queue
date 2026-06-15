import MockDashboardPage from "../_components/mock-dashboard-page";

export default function QueueIndexPage() {
  return (
    <MockDashboardPage
      eyebrow="Operations"
      title="Queue management"
      description="Queue overview mockup for live queue, queue history, and queue category setup."
      primaryAction="Open live queue"
      stats={[
        { label: "Live", value: "10", helper: "Active queues" },
        { label: "Completed", value: "24", helper: "Today" },
        { label: "Categories", value: "5", helper: "Queue lanes" },
        { label: "Avg wait", value: "12m", helper: "Current day" },
      ]}
      rows={[
        { id: "qi1", title: "Live queue", subtitle: "Manage active queues and call customers.", meta: "/queue/live", status: "Active", enabled: true },
        { id: "qi2", title: "Queue history", subtitle: "Review completed and canceled queues.", meta: "/queue/history", status: "Active", enabled: true },
        { id: "qi3", title: "Queue categories", subtitle: "Configure lanes and priority behavior.", meta: "/queue/category", status: "Pending", enabled: false },
      ]}
      panelTitle="Queue modules"
      panelDescription="Parent route overview for queue pages."
      progressLabel="Queue setup"
      progressValue={72}
      detailItems={[
        { label: "Default lane", value: "Appointment" },
        { label: "Display board", value: "Enabled" },
        { label: "Auto call", value: "Manual" },
      ]}
    />
  );
}

import MockDashboardPage from "../../_components/mock-dashboard-page";

export default function QueueHistoryPage() {
  return (
    <MockDashboardPage
      eyebrow="Operations"
      title="Queue history"
      description="Historical queue mockup for reviewing completed, canceled, and missed queues."
      primaryAction="Export CSV"
      stats={[
        { label: "Completed", value: "642", helper: "This month" },
        { label: "Canceled", value: "29", helper: "Staff/customer canceled" },
        { label: "No-show", value: "18", helper: "Needs follow-up" },
        { label: "Avg service", value: "34m", helper: "Completed queues" },
      ]}
      rows={[
        { id: "qh1", title: "Q-091 Arthit K.", subtitle: "Beard Trim", meta: "Completed yesterday", status: "Done", amount: "THB 250" },
        { id: "qh2", title: "Q-090 Nicha Wong", subtitle: "Wash & Blow", meta: "Completed yesterday", status: "Done", amount: "THB 450" },
        { id: "qh3", title: "Q-089 Guest customer", subtitle: "Haircut", meta: "Customer did not arrive", status: "Pending", amount: "No-show" },
      ]}
      panelTitle="History records"
      panelDescription="Search and review mock queue history."
      progressLabel="Resolved records"
      progressValue={91}
      detailItems={[
        { label: "Date range", value: "30 days" },
        { label: "Refund cases", value: "2" },
        { label: "Notes added", value: "16" },
      ]}
    />
  );
}

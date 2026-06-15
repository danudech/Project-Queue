import MockDashboardPage from "../_components/mock-dashboard-page";

export default function AnalyticsPage() {
  return (
    <MockDashboardPage
      eyebrow="Overview"
      title="Analytics"
      description="Operational performance mockup for bookings, queue conversion, and branch utilization."
      primaryAction="Create report"
      stats={[
        { label: "Bookings", value: "1,284", helper: "+18% this month" },
        { label: "Completion", value: "86%", helper: "Queue success rate" },
        { label: "Avg wait", value: "12m", helper: "Across all branches" },
        { label: "Revenue", value: "THB 248k", helper: "Mock estimate" },
      ]}
      rows={[
        { id: "a1", title: "Peak booking hour", subtitle: "11:00 - 12:00 has the highest demand.", meta: "Updated 5 minutes ago", status: "Active", amount: "142 queues" },
        { id: "a2", title: "Returning customers", subtitle: "Customers who booked more than once.", meta: "Last 30 days", status: "Done", amount: "38%" },
        { id: "a3", title: "No-show trend", subtitle: "Customers who missed confirmed bookings.", meta: "Needs review", status: "Pending", amount: "4.8%" },
      ]}
      panelTitle="Insight feed"
      panelDescription="Mock analytics insights for dashboard widgets."
      progressLabel="Monthly target"
      progressValue={78}
      detailItems={[
        { label: "Best service", value: "Haircut" },
        { label: "Top branch", value: "Main branch" },
        { label: "Forecast", value: "+9%" },
      ]}
    />
  );
}

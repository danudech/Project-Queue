import MockDashboardPage from "../../_components/mock-dashboard-page";

export default function SubscriptionPlanPage() {
  return (
    <MockDashboardPage
      eyebrow="Finance"
      title="My plan"
      description="Subscription mockup for plan usage, feature limits, billing cycle, and upgrade actions."
      primaryAction="Upgrade plan"
      stats={[
        { label: "Plan", value: "Pro", helper: "Mock subscription" },
        { label: "Branches", value: "2/5", helper: "Included limit" },
        { label: "Staff", value: "8/20", helper: "Included seats" },
        { label: "Renewal", value: "15 days", helper: "Next billing" },
      ]}
      rows={[
        { id: "s1", title: "Online booking", subtitle: "Public customer booking page.", meta: "Included in Pro", status: "Active", enabled: true },
        { id: "s2", title: "Automated reminders", subtitle: "SMS and LINE reminders before appointments.", meta: "Usage based", status: "Active", enabled: true },
        { id: "s3", title: "Advanced analytics", subtitle: "Forecasts, staff utilization, and cohort reports.", meta: "Business plan feature", status: "Pending", enabled: false },
      ]}
      panelTitle="Plan features"
      panelDescription="Mock subscription feature toggles."
      progressLabel="Plan usage"
      progressValue={46}
      detailItems={[
        { label: "Billing cycle", value: "Monthly" },
        { label: "Next invoice", value: "THB 990" },
        { label: "Workspace", value: "EZQueue" },
      ]}
    />
  );
}

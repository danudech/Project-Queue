import MockDashboardPage from "../_components/mock-dashboard-page";

export default function SubscriptionIndexPage() {
  return (
    <MockDashboardPage
      eyebrow="Finance"
      title="Subscription"
      description="Subscription overview mockup for current plan, feature limits, add-ons, and billing status."
      primaryAction="Manage plan"
      stats={[
        { label: "Plan", value: "Pro", helper: "Current" },
        { label: "Seats", value: "8/20", helper: "Staff usage" },
        { label: "Branches", value: "2/5", helper: "Included" },
        { label: "Renewal", value: "15d", helper: "Remaining" },
      ]}
      rows={[
        { id: "sub1", title: "My plan", subtitle: "Usage, limits, and upgrade actions.", meta: "/subscription/plan", status: "Active", enabled: true },
        { id: "sub2", title: "Billing history", subtitle: "Subscription invoices and receipts.", meta: "/invoice/list", status: "Active", enabled: true },
        { id: "sub3", title: "Reminder add-on", subtitle: "Usage-based SMS and LINE reminders.", meta: "Future add-on", status: "Pending", enabled: false },
      ]}
      panelTitle="Subscription modules"
      panelDescription="Parent route overview for subscription pages."
      progressLabel="Plan usage"
      progressValue={46}
      detailItems={[
        { label: "Cycle", value: "Monthly" },
        { label: "Next invoice", value: "THB 990" },
        { label: "Auto renew", value: "On" },
      ]}
    />
  );
}

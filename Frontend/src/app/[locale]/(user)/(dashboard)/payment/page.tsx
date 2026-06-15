import MockDashboardPage from "../_components/mock-dashboard-page";

export default function PaymentIndexPage() {
  return (
    <MockDashboardPage
      eyebrow="Finance"
      title="Payment center"
      description="Finance overview mockup for payments, transactions, refunds, and reconciliation."
      primaryAction="Record payment"
      stats={[
        { label: "Paid", value: "THB 18.4k", helper: "Today" },
        { label: "Pending", value: "THB 3.2k", helper: "Open" },
        { label: "Transactions", value: "312", helper: "This month" },
        { label: "Refunds", value: "2", helper: "This week" },
      ]}
      rows={[
        { id: "pi1", title: "Payment list", subtitle: "Review customer service payments.", meta: "/payment/list", status: "Active", enabled: true },
        { id: "pi2", title: "Transactions", subtitle: "Gateway and counter payment logs.", meta: "/payment/transaction", status: "Active", enabled: true },
        { id: "pi3", title: "Refund workflow", subtitle: "Manager approval and gateway status.", meta: "Future module", status: "Pending", enabled: false },
      ]}
      panelTitle="Finance modules"
      panelDescription="Parent route overview for payment pages."
      progressLabel="Reconciliation"
      progressValue={88}
      detailItems={[
        { label: "Gateway", value: "MockPay" },
        { label: "Settlement", value: "Daily" },
        { label: "Cash drawer", value: "Counter 1" },
      ]}
    />
  );
}

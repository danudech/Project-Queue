import MockDashboardPage from "../../_components/mock-dashboard-page";

export default function TransactionPage() {
  return (
    <MockDashboardPage
      eyebrow="Finance"
      title="Transactions"
      description="Transaction log mockup for gateway references, counter payments, and refund activity."
      primaryAction="Export transactions"
      stats={[
        { label: "Transactions", value: "312", helper: "This month" },
        { label: "Card", value: "49%", helper: "Payment mix" },
        { label: "Cash", value: "34%", helper: "Payment mix" },
        { label: "PromptPay", value: "17%", helper: "Payment mix" },
      ]}
      rows={[
        { id: "t1", title: "TXN-88420", subtitle: "Gateway charge succeeded", meta: "Reference gw_mock_1021", status: "Paid", amount: "THB 450" },
        { id: "t2", title: "TXN-88421", subtitle: "Cash receipt created", meta: "Counter 1", status: "Done", amount: "THB 300" },
        { id: "t3", title: "TXN-88422", subtitle: "Refund requested", meta: "Waiting for manager approval", status: "Pending", amount: "THB 250" },
      ]}
      panelTitle="Transaction feed"
      panelDescription="Mock transaction audit trail."
      progressLabel="Reconciled"
      progressValue={73}
      detailItems={[
        { label: "Batch", value: "2026-06" },
        { label: "Fees", value: "THB 812" },
        { label: "Export format", value: "CSV" },
      ]}
    />
  );
}

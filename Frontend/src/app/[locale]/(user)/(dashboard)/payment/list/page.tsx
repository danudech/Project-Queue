import MockDashboardPage from "../../_components/mock-dashboard-page";

export default function PaymentListPage() {
  return (
    <MockDashboardPage
      eyebrow="Finance"
      title="Payments"
      description="Payment overview mockup for booking deposits, service payments, refunds, and receipts."
      primaryAction="Record payment"
      stats={[
        { label: "Paid today", value: "THB 18.4k", helper: "Completed payments" },
        { label: "Pending", value: "THB 3.2k", helper: "Awaiting payment" },
        { label: "Refunds", value: "2", helper: "This week" },
        { label: "Success rate", value: "97%", helper: "Mock gateway" },
      ]}
      rows={[
        { id: "p1", title: "PAY-10021", subtitle: "Nicha Wong - Wash & Blow", meta: "Card payment", status: "Paid", amount: "THB 450" },
        { id: "p2", title: "PAY-10022", subtitle: "Somchai Jaidee - Haircut", meta: "Cash at counter", status: "Paid", amount: "THB 300" },
        { id: "p3", title: "PAY-10023", subtitle: "Kanda P. - Hair Color deposit", meta: "PromptPay pending", status: "Pending", amount: "THB 500" },
      ]}
      panelTitle="Payment records"
      panelDescription="Mock finance list for payment APIs."
      progressLabel="Settlement progress"
      progressValue={88}
      detailItems={[
        { label: "Gateway", value: "MockPay" },
        { label: "Settlement", value: "Daily" },
        { label: "Open disputes", value: "0" },
      ]}
    />
  );
}

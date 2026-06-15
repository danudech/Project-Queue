import MockDashboardPage from "../../_components/mock-dashboard-page";

export default function InvoiceListPage() {
  return (
    <MockDashboardPage
      eyebrow="Finance"
      title="Billing history"
      description="Invoice mockup for subscription billing, payment status, and downloadable receipts."
      primaryAction="Download all"
      stats={[
        { label: "Invoices", value: "12", helper: "Last 12 months" },
        { label: "Paid", value: "11", helper: "Completed invoices" },
        { label: "Open", value: "1", helper: "Due this month" },
        { label: "Total", value: "THB 10.8k", helper: "Mock billing" },
      ]}
      rows={[
        { id: "i1", title: "INV-2026-006", subtitle: "Pro plan subscription", meta: "Due 2026-06-30", status: "Pending", amount: "THB 990" },
        { id: "i2", title: "INV-2026-005", subtitle: "Pro plan subscription", meta: "Paid 2026-05-30", status: "Paid", amount: "THB 990" },
        { id: "i3", title: "INV-2026-004", subtitle: "Reminder usage add-on", meta: "Paid 2026-04-30", status: "Paid", amount: "THB 1,240" },
      ]}
      panelTitle="Invoices"
      panelDescription="Mock invoice list."
      progressLabel="Paid invoices"
      progressValue={92}
      detailItems={[
        { label: "Tax ID", value: "Mock only" },
        { label: "Payment method", value: "Card" },
        { label: "Billing email", value: "owner@example.com" },
      ]}
    />
  );
}

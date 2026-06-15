import MockDashboardPage from "../_components/mock-dashboard-page";

export default function InvoiceIndexPage() {
  return (
    <MockDashboardPage
      eyebrow="Finance"
      title="Invoices"
      description="Invoice overview mockup for subscription bills, receipts, and tax information."
      primaryAction="Download invoices"
      stats={[
        { label: "Invoices", value: "12", helper: "Last 12 months" },
        { label: "Paid", value: "11", helper: "Completed" },
        { label: "Open", value: "1", helper: "Due" },
        { label: "Total", value: "THB 10.8k", helper: "Mock billing" },
      ]}
      rows={[
        { id: "inv1", title: "Billing history", subtitle: "View all subscription invoices.", meta: "/invoice/list", status: "Active", enabled: true },
        { id: "inv2", title: "Tax profile", subtitle: "Business tax and billing identity.", meta: "Future module", status: "Pending", enabled: false },
        { id: "inv3", title: "Receipt delivery", subtitle: "Email settings for invoices.", meta: "Future module", status: "Pending", enabled: false },
      ]}
      panelTitle="Invoice modules"
      panelDescription="Parent route overview for invoice pages."
      progressLabel="Billing setup"
      progressValue={70}
      detailItems={[
        { label: "Billing email", value: "owner@example.com" },
        { label: "Currency", value: "THB" },
        { label: "Tax profile", value: "Mock" },
      ]}
    />
  );
}

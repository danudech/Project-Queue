import MockDashboardPage from "../../_components/mock-dashboard-page";

export default function CustomerTagPage() {
  return (
    <MockDashboardPage
      eyebrow="Business"
      title="Customer tags"
      description="CRM tag mockup for VIPs, regulars, allergy notes, and marketing segments."
      primaryAction="Add tag"
      stats={[
        { label: "Tags", value: "12", helper: "Customer segments" },
        { label: "VIP", value: "18", helper: "Tagged customers" },
        { label: "Marketing", value: "64", helper: "Opt-in customers" },
        { label: "Notes", value: "9", helper: "Care instructions" },
      ]}
      rows={[
        { id: "ct1", title: "VIP", subtitle: "Priority queue and personal follow-up.", meta: "18 customers", status: "Active", enabled: true },
        { id: "ct2", title: "Color allergy", subtitle: "Requires staff to verify products before service.", meta: "4 customers", status: "Active", enabled: true },
        { id: "ct3", title: "Campaign target", subtitle: "Receives seasonal promotion messages.", meta: "64 customers", status: "Pending", enabled: false },
      ]}
      panelTitle="Segments"
      panelDescription="Mock customer tag list."
      progressLabel="Profile coverage"
      progressValue={58}
      detailItems={[
        { label: "Most used", value: "Regular" },
        { label: "Auto tags", value: "3 rules" },
        { label: "Hidden tags", value: "1" },
      ]}
    />
  );
}

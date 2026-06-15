import MockDashboardPage from "../../_components/mock-dashboard-page";

export default function AuditLogPage() {
  return (
    <MockDashboardPage
      eyebrow="Administration"
      title="Audit log"
      description="Audit trail mockup for security events, staff actions, and system changes."
      primaryAction="Export audit"
      stats={[
        { label: "Events", value: "1,402", helper: "This month" },
        { label: "Staff actions", value: "894", helper: "Manual changes" },
        { label: "System jobs", value: "508", helper: "Automations" },
        { label: "Alerts", value: "3", helper: "Needs review" },
      ]}
      rows={[
        { id: "al1", title: "Business hours updated", subtitle: "May K. changed Sunday hours.", meta: "2026-06-15 09:42", status: "Done", amount: "Settings" },
        { id: "al2", title: "Payment refunded", subtitle: "Owner approved refund for PAY-10018.", meta: "2026-06-14 16:20", status: "Done", amount: "Finance" },
        { id: "al3", title: "Staff invite sent", subtitle: "Invitation sent to new stylist.", meta: "2026-06-14 12:08", status: "Pending", amount: "Staff" },
      ]}
      panelTitle="Audit events"
      panelDescription="Mock audit log feed."
      progressLabel="Reviewed alerts"
      progressValue={67}
      detailItems={[
        { label: "Retention", value: "180 days" },
        { label: "Export", value: "CSV" },
        { label: "Risk events", value: "3" },
      ]}
    />
  );
}

import { Metadata } from "next";
import ThemeCustomize from "@/components/partials/customizer";
import DashCodeFooter from "@/components/partials/footer";
import DashCodeHeader from "@/components/partials/header";
import DashCodeSidebar from "@/components/partials/sidebar";
import QueryProvider from "@/components/providers/query-provider";
import LayoutContentProvider from "@/providers/content.provider";
import LayoutProvider from "@/providers/layout.provider";
import SiteBreadcrumb from "@/components/site-breadcrumb";
import { StoreSyncProvider } from "@/components/providers/store-sync-provider";
import DashboardAccessGate from "@/components/permissions/dashboard-access-gate";

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3103"),
    title: "EZQueue User Dashboard",
    description: "Manage queues, bookings, staff, and branch operations with EZQueue.",
};

export default function DashboardLayout({ children }: any) {
    return (
        <QueryProvider>
            <StoreSyncProvider>
                <LayoutProvider >
                    <ThemeCustomize />
                    <DashCodeHeader />
                    <DashCodeSidebar />
                    <LayoutContentProvider>
                        <div>
                            <SiteBreadcrumb />
                            <DashboardAccessGate>{children}</DashboardAccessGate>
                        </div>
                    </LayoutContentProvider>
                    <DashCodeFooter />
                </LayoutProvider>
            </StoreSyncProvider>
        </QueryProvider>
    );
}

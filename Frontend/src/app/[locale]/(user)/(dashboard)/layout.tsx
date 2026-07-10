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

export const metadata: Metadata = {
    title: "EZQueue User Dashboard",
    description: "EZQueue is a popular dashboard template.",
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
                            {children}
                        </div>
                    </LayoutContentProvider>
                    <DashCodeFooter />
                </LayoutProvider>
            </StoreSyncProvider>
        </QueryProvider>
    );
}
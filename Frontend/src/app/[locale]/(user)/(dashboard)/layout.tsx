import ThemeCustomize from "@/components/partials/customizer";
import DashCodeFooter from "@/components/partials/footer";
import DashCodeHeader from "@/components/partials/header";
import DashCodeSidebar from "@/components/partials/sidebar";
import QueryProvider from "@/components/providers/query-provider";
import LayoutContentProvider from "@/providers/content.provider";
import LayoutProvider from "@/providers/layout.provider";

export default function DashboardLayout({ children }: any) {
    return (
        <QueryProvider>
            <LayoutProvider >
                <ThemeCustomize />
                <DashCodeHeader />
                <DashCodeSidebar />
                <LayoutContentProvider>
                    {children}
                </LayoutContentProvider>
                <DashCodeFooter />
            </LayoutProvider>
        </QueryProvider>
    );
}
"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Footer } from "./footer";
import { usePathname } from "next/navigation";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  
  // Do not show sidebar/header/footer on auth pages
  const isAuthPage = pathname?.includes("/auth/");
  // Or homepage
  const isHomePage = pathname === "/" || pathname === "/th" || pathname === "/en";

  if (isAuthPage || isHomePage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

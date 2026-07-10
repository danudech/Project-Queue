import React from "react";
import { MENU_ITEMS } from "@/config/menu-items";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-muted/20 hidden md:flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b">
        <h1 className="text-2xl font-bold text-primary tracking-tight">QueueApp</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="flex flex-col gap-1.5">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.includes(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

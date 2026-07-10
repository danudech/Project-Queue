import { useTranslations } from "next-intl";
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { MENU_ITEMS } from "@/config/menu-items";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const NavigationDrawer = () => {
    const t = useTranslations("Layout");
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="p-2 md:hidden">
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-2">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.includes(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground/80"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

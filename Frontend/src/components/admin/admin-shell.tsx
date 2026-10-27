"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND } from "@/config/brand";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  Shield,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LocalSwitcher from "@/components/partials/header/locale-switcher";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { adminNavItems, mockShops } from "./admin-mock-data";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1] || "en";
  const [open, setOpen] = useState(false);

  // Command Palette & Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchPaletteQuery, setSearchPaletteQuery] = useState("");

  // Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New tenant onboarded", desc: "Nara Wellness Studio completed verification", time: "10m ago", read: false },
    { id: 2, title: "Elevated access granted", desc: "Manager role assigned to Thanawat R.", time: "1h ago", read: false },
    { id: 3, title: "Rate limit alert", desc: "Public booking cluster reached 85% capacity", time: "3h ago", read: false },
  ]);

  // Keybinding for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const leaveMock = async () => {
    await fetch("/api/admin/mock-logout", { method: "POST" });
    toast.info("Logged out of Platform Admin sandbox.");
    router.replace(`/${locale}/admin-access`);
    router.refresh();
  };

  const isActive = (href: string) => {
    const localized = `/${locale}${href}`;
    return href === "/admin" ? pathname === localized : pathname.startsWith(localized);
  };

  const currentItem = adminNavItems.find((item) => isActive(item.href)) || adminNavItems[0];

  // Filter items in command palette
  const filteredNavItems = adminNavItems.filter((i) =>
    i.label.toLowerCase().includes(searchPaletteQuery.toLowerCase()) ||
    i.description.toLowerCase().includes(searchPaletteQuery.toLowerCase())
  );

  const filteredShops = mockShops.filter((s) =>
    s.name.toLowerCase().includes(searchPaletteQuery.toLowerCase()) ||
    s.owner.toLowerCase().includes(searchPaletteQuery.toLowerCase())
  );

  const handleClearNotifications = () => {
    setNotifications([]);
    toast.success("All platform alerts marked as read.");
    setIsNotificationsOpen(false);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-default-50 text-default-900 font-sans">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-default-200/40 bg-[#0f241a] text-white transition-transform duration-300 lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
            <Link href={`/${locale}/admin`} className="flex items-center gap-3 group">
              <BrandLogo compact onDark symbolClassName="size-10 transition-transform group-hover:scale-105" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <strong className="text-base font-semibold tracking-tight text-white">
                    {BRAND.name}
                  </strong>
                  <Badge
                    color="primary"
                    className="border border-emerald-500/40 bg-emerald-950/70 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider text-emerald-300"
                  >
                    Admin
                  </Badge>
                </div>
                <span className="block text-[11px] font-medium tracking-wide text-white/50">
                  Control Plane
                </span>
              </div>
            </Link>
            <button
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Platform Modules
            </p>
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={`/${locale}${item.href}`}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                      active
                        ? "border border-emerald-600/30 bg-emerald-800/40 font-medium text-white shadow-sm"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon
                      className={`size-4.5 shrink-0 ${
                        active ? "text-emerald-400" : "text-white/60 group-hover:text-white"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block text-sm font-medium leading-none">
                        {item.label}
                      </span>
                      <span
                        className={`mt-1 block truncate text-xs ${
                          active ? "text-emerald-200/80" : "text-white/45"
                        }`}
                      >
                        {item.description}
                      </span>
                    </div>
                    {active && <ChevronRight className="size-4 text-emerald-400" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Mock Notice */}
          <div className="shrink-0 p-3">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                <Shield className="size-3.5" /> Demonstration Mock
              </span>
              <p className="mt-1 text-[11px] leading-relaxed text-white/65">
                Isolated sandbox for UI evaluation. No changes affect live database records.
              </p>
              <div className="mt-2.5 border-t border-white/10 pt-2">
                <Link
                  href={`/${locale}/dashboard`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 transition-colors hover:text-emerald-200"
                >
                  <ArrowLeft className="size-3.5" /> Back to Shop Dashboard
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Wrapper */}
        <div className="lg:pl-72 flex flex-col min-h-screen">
          {/* Top Header */}
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-default-200/80 bg-card/90 px-4 backdrop-blur-md md:px-8">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-lg lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="size-4.5" />
              </Button>
              <nav className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                <span className="font-medium text-default-600">Platform Admin</span>
                <ChevronRight className="size-3.5 text-muted-foreground" />
                <span className="font-semibold text-default-900">{currentItem.label}</span>
              </nav>
            </div>

            {/* Middle Search Input with Command Palette Trigger */}
            <div
              onClick={() => setIsSearchOpen(true)}
              className="relative hidden max-w-sm flex-1 md:block mx-4 cursor-pointer"
            >
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                readOnly
                className="h-9 w-full rounded-lg border border-default-200 bg-default-50 pl-9 pr-12 text-xs text-muted-foreground cursor-pointer focus:outline-none hover:bg-card"
                placeholder="Search shops, accounts, incidents... (⌘K)"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-default-200 bg-default-100 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <LocalSwitcher />
              <Badge
                color="warning"
                className="hidden items-center gap-1.5 py-0.5 px-2.5 text-xs font-semibold sm:inline-flex"
              >
                <span className="size-1.5 rounded-full bg-warning animate-pulse" />
                Mock Session
              </Badge>

              {/* Notifications Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsNotificationsOpen(true)}
                    className="relative size-9 rounded-lg border-default-200 text-default-700"
                    aria-label="Notifications"
                  >
                    <Bell className="size-4" />
                    {notifications.length > 0 && (
                      <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-card" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Platform alerts ({notifications.length})</TooltipContent>
              </Tooltip>

              {/* Profile & Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 border-l border-default-200 pl-3 text-left outline-none cursor-pointer">
                    <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/20">
                      PA
                    </div>
                    <div className="hidden sm:block">
                      <strong className="block text-xs font-semibold leading-none text-default-900">
                        Platform Admin
                      </strong>
                      <span className="block text-[11px] leading-tight text-muted-foreground">
                        admin@ezqueue.local
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none text-default-900">Platform Admin</p>
                      <p className="text-xs text-muted-foreground">admin@ezqueue.local</p>
                      <Badge color="primary" className="mt-1 w-fit text-[9px] py-0">
                        PlatformAdminMock
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(`/${locale}/dashboard`)}>
                    <Building2 className="mr-2 size-4" /> Go to Shop Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsSearchOpen(true)}>
                    <Search className="mr-2 size-4" /> Command Palette (⌘K)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => void leaveMock()}
                    className="text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="mr-2 size-4" /> Sign Out of Mock
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Page Area */}
          <main className="ez-dashboard flex-1 p-4 md:p-8 space-y-6">
            {children}
          </main>
        </div>

        {/* 1. Command Palette Dialog */}
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden">
            <div className="flex items-center border-b border-default-200 px-3">
              <Search className="size-4 text-muted-foreground mr-2 shrink-0" />
              <input
                autoFocus
                value={searchPaletteQuery}
                onChange={(e) => setSearchPaletteQuery(e.target.value)}
                placeholder="Jump to module, shop, or setting..."
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {searchPaletteQuery && (
                <button
                  onClick={() => setSearchPaletteQuery("")}
                  className="text-xs text-muted-foreground hover:text-default-900"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto p-3 space-y-3">
              {/* Module Navigation Results */}
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase px-2 mb-1.5">
                  Navigation
                </p>
                <div className="space-y-1">
                  {filteredNavItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        setIsSearchOpen(false);
                        router.push(`/${locale}${item.href}`);
                      }}
                      className="flex w-full items-center justify-between rounded-lg p-2 text-left text-sm hover:bg-default-100 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className="size-4 text-primary" />
                        <div>
                          <strong className="block font-medium text-default-900 leading-none">
                            {item.label}
                          </strong>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      </div>
                      <ArrowRight className="size-3.5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Shop Results */}
              {filteredShops.length > 0 && (
                <div className="border-t border-default-200/60 pt-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase px-2 mb-1.5">
                    Shops ({filteredShops.length})
                  </p>
                  <div className="space-y-1">
                    {filteredShops.map((shop) => (
                      <button
                        key={shop.name}
                        onClick={() => {
                          setIsSearchOpen(false);
                          router.push(`/${locale}/admin/shops`);
                        }}
                        className="flex w-full items-center justify-between rounded-lg p-2 text-left text-xs hover:bg-default-100 transition-colors"
                      >
                        <div>
                          <strong className="block font-semibold text-default-900">{shop.name}</strong>
                          <span className="text-muted-foreground">{shop.owner} · {shop.branches} branches</span>
                        </div>
                        <Badge
                          color={shop.status === "Active" ? "success" : "warning"}
                          className="text-[10px] py-0"
                        >
                          {shop.status}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-default-200/60 bg-default-50 px-4 py-2 text-right text-[11px] text-muted-foreground">
              Press <kbd className="rounded bg-default-200 px-1 py-0.5 font-mono">ESC</kbd> to close
            </div>
          </DialogContent>
        </Dialog>

        {/* 2. Notifications Dialog */}
        <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
          <DialogContent className="sm:max-w-[460px]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Platform Alerts</span>
                <Badge color="primary">{notifications.length} Unread</Badge>
              </DialogTitle>
              <DialogDescription>
                Recent operational telemetry and governance alerts.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2.5 pt-2">
              {notifications.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  No active unread alerts.
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-lg border border-default-200/80 bg-default-50/60 p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="font-semibold text-default-900">{n.title}</strong>
                      <span className="text-[11px] text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{n.desc}</p>
                  </div>
                ))
              )}
            </div>

            <DialogFooter className="pt-2">
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearNotifications}
                  className="mr-auto"
                >
                  Mark all as read
                </Button>
              )}
              <Button size="sm" onClick={() => setIsNotificationsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mobile Backdrop */}
        {open && (
          <button
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation overlay"
          />
        )}
      </div>
    </TooltipProvider>
  );
}

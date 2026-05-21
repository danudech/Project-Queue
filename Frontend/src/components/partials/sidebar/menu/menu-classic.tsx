"use client";

import React from 'react'
import { Ellipsis, LogOut } from "lucide-react";
import { usePathname } from "@/components/navigation";
import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/menus";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
} from "@/components/ui/tooltip";
import { useConfig } from "@/hooks/use-config";
import MenuLabel from "../common/menu-label";
import MenuItem from "../common/menu-item";
import { CollapseMenuButton } from "../common/collapse-menu-button";
import MenuWidget from "../common/menu-widget";
import SearchBar from '@/components/partials/sidebar/common/search-bar'
import TeamSwitcher from '../common/team-switcher'
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation'
import { getLangDir } from 'rtl-detect';
import Logo from '@/components/logo';
import SidebarHoverToggle from '@/components/partials/sidebar/sidebar-hover-toggle';
import { useMenuHoverConfig } from '@/hooks/use-menu-hover';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useShop } from '@/hooks/use-me';


export function MenuClassic({ }) {
    // translate
    const t = useTranslations("Menu")
    const pathname = usePathname();
    const params = useParams<{ locale: string; }>();
    const direction = getLangDir(params?.locale ?? '');

    const isDesktop = useMediaQuery('(min-width: 1280px)')


    const menuList = getMenuList(pathname, t);
    const [config, setConfig] = useConfig()
    const collapsed = config.collapsed
    const [hoverConfig] = useMenuHoverConfig();
    const { hovered } = hoverConfig;

    const scrollableNodeRef = React.useRef<HTMLDivElement>(null);
    const [scroll, setScroll] = React.useState(false);
    const { data: shopData, isLoading, refetch } = useShop();


    React.useEffect(() => {
        const handleScroll = () => {
            if (scrollableNodeRef.current && scrollableNodeRef.current.scrollTop > 0) {
                setScroll(true);
            } else {
                setScroll(false);
            }
        };
        scrollableNodeRef.current?.addEventListener("scroll", handleScroll);
    }, [scrollableNodeRef]);

    return (
        <>
            {isDesktop && (
                <div className="flex items-center justify-between  px-4 py-4">
                    <Logo />
                    <SidebarHoverToggle />
                </div>
            )}

            <ScrollArea className="[&>div>div[style]]:!block" dir={direction}>

                {isDesktop && (
                    <div className={cn(' space-y-3 mt-6 ', {
                        'px-4': !collapsed || hovered,
                        'text-center': collapsed || !hovered
                    })}>

                        <TeamSwitcher />
                        {/* <SearchBar /> */}
                    </div>

                )}
                {shopData ? (
                    <nav className="mt-8 h-full w-full">
                        <ul className="h-full flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-4">
                            {menuList?.map(({ groupLabel, menus, id: groupId }, groupIndex) => (
                                <li className="w-full" key={groupId || groupIndex}>

                                    {/* Render Group Label or Ellipsis (เมื่อมี groupLabel) */}
                                    {groupLabel && (
                                        (!collapsed || hovered) ? (
                                            <MenuLabel label={groupLabel} />
                                        ) : (
                                            <TooltipProvider>
                                                <Tooltip delayDuration={100}>
                                                    <TooltipTrigger className="w-full">
                                                        <div className="w-full flex justify-center items-center">
                                                            <Ellipsis className="h-5 w-5 text-default-700" />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right">
                                                        <p>{groupLabel}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )
                                    )}

                                    {/* Render Menu Items */}
                                    {menus.map(({ href, label, icon, active, id, submenus }) => (
                                        (!submenus || submenus.length === 0) ? (
                                            // แบบไม่มี Submenu
                                            <div className="w-full mb-2 last:mb-0" key={id}>
                                                <TooltipProvider disableHoverableContent>
                                                    <Tooltip delayDuration={100}>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <MenuItem
                                                                    label={label}
                                                                    icon={icon}
                                                                    href={href}
                                                                    active={active}
                                                                    id={id}
                                                                    collapsed={collapsed}
                                                                />
                                                            </div>
                                                        </TooltipTrigger>
                                                        {collapsed && (
                                                            <TooltipContent side="right">
                                                                {label}
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        ) : (
                                            // แบบมี Submenu (Collapse)
                                            <div className="w-full mb-2" key={id}>
                                                <CollapseMenuButton
                                                    icon={icon}
                                                    label={label}
                                                    active={active}
                                                    submenus={submenus}
                                                    collapsed={collapsed}
                                                    id={id}
                                                />
                                            </div>
                                        )
                                    ))}
                                </li>
                            ))}
                        </ul>
                    </nav>
                ) : (
                    <nav className="mt-8 h-full w-full">
                        <div className="mt-8 flex flex-col items-center justify-center text-center px-4">
                            <div className="text-lg font-semibold text-default-800">
                                ยังไม่มีข้อมูลร้าน
                            </div>
                            <p className="text-sm text-default-500 mt-2">
                                กรุณาเพิ่มข้อมูลร้านเพื่อเริ่มใช้งาน
                            </p>
                        </div>
                    </nav>
                )}
            </ScrollArea>
        </>
    );
}

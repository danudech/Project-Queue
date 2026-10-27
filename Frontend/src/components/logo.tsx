'use client'
import React from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Link } from '@/i18n/routing';
import { useConfig } from "@/hooks/use-config";
import { useMenuHoverConfig } from "@/hooks/use-menu-hover";
import { useMediaQuery } from "@/hooks/use-media-query";

const Logo = () => {
    const [config] = useConfig()
    const [hoverConfig] = useMenuHoverConfig();
    const { hovered } = hoverConfig
    const isDesktop = useMediaQuery('(min-width: 1280px)');

    if (config.sidebar === 'compact') {
        return <Link href="/dashboard" className="flex gap-2 items-center justify-center">
            <BrandLogo compact symbolClassName="size-8" />
        </Link>
    }
    if (config.sidebar === 'two-column' || !isDesktop) return null

    return (
        <Link href="/dashboard" className="flex gap-2 items-center">
            <BrandLogo compact={Boolean(config?.collapsed && !hovered)} symbolClassName="size-8" />
        </Link>
    );
};

export default Logo;

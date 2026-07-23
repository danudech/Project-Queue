'use client'
import Image from "next/image";
import React from "react";
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
        return <Link href="/dashboard" className="flex gap-2 items-center   justify-center    ">
            <Image src="/images/brand/new-logo-transparent.png" alt="EZQueue" width={32} height={32} className="h-8 w-8" />

        </Link>
    }
    if (config.sidebar === 'two-column' || !isDesktop) return null

    return (
        <Link href="/dashboard" className="flex gap-2 items-center    ">
            <Image src="/images/brand/new-logo-transparent.png" alt="EZQueue" width={32} height={32} className="h-8 w-8" />
            {(!config?.collapsed || hovered) && (
                <h1 className="text-xl font-semibold text-default-900 ">
                    EZQueue
                </h1>
            )}
        </Link>

    );
};

export default Logo;

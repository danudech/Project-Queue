'use client'
import React from 'react'
import { BrandLogo } from '@/components/brand-logo'
import { Link } from '@/components/navigation'
import { useConfig } from '@/hooks/use-config'
import { useMediaQuery } from '@/hooks/use-media-query'

const HeaderLogo = () => {
    const [config] = useConfig();
    const isDesktop = useMediaQuery('(min-width: 1280px)');

    return (
        config.layout === 'horizontal' ? (
            <Link href="/dashboard" className="flex gap-2 items-center">
                <BrandLogo symbolClassName="size-8" className="[&>span]:hidden lg:[&>span]:inline" />
            </Link>
        ) :
            !isDesktop && (
                <Link href="/dashboard" className="flex gap-2 items-center">
                    <BrandLogo compact symbolClassName="size-8" />
                </Link>
            )
    )
}

export default HeaderLogo;

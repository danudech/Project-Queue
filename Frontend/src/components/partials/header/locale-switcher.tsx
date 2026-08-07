'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Image from 'next/image';
import { startRouteLoading } from '@/lib/route-loading';

export default function LocalSwitcher({ compact = false }: { compact?: boolean }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const localActive = useLocale();

    const onSelectChange = (nextLocale: string) => {
        startTransition(() => {
            const segments = pathname.split('/');
            if (segments[1] === 'th' || segments[1] === 'en') {
                segments[1] = nextLocale;
            }
            const queryString = searchParams.toString();
            startRouteLoading();
            router.replace(`${segments.join('/')}${queryString ? `?${queryString}` : ''}`);
        });
    };
    return (
        <Select onValueChange={onSelectChange} value={localActive} disabled={isPending}>
            <SelectTrigger
                aria-label="Language"
                className={compact
                    ? 'h-9 w-[78px] rounded-lg border-slate-200 bg-white px-2 shadow-sm [&>span>div>span]:hidden'
                    : 'w-[94px] border-none read-only:bg-transparent'}
            >
                <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent >
                <SelectItem value="th"
                    className='border-none'>
                    <div className='flex items-center gap-1'>
                        <Image
                            src="/images/all-img/flag-3.png"
                            alt='flag'
                            width={24}
                            height={24}
                            className='w-6 h-6 rounded-full'
                        />
                        <span className='font-medium text-sm text-default-600 dark:text-default-700'>th</span>
                    </div>
                </SelectItem>
                <SelectItem
                    value="en"
                    className='border-none'
                >
                    <div className='flex items-center gap-1'>
                        <Image
                            src="/images/all-img/flag-1.png"
                            alt='flag'
                            width={24}
                            height={24}
                            className='w-6 h-6 rounded-full'
                        />
                        <span className='font-medium text-sm text-default-600 dark:text-default-700'>En</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>

    );
}

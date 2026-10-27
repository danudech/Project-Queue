'use client'
import { BrandLogo } from '@/components/brand-logo';

const Logo = ({ onDark = false }: { onDark?: boolean }) => {
  return (
    <BrandLogo onDark={onDark} symbolClassName="size-12" />
  );
}

export default Logo;

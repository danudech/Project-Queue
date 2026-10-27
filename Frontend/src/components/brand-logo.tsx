import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND } from "@/config/brand";

type BrandLogoProps = {
  onDark?: boolean;
  compact?: boolean;
  className?: string;
  symbolClassName?: string;
};

export function BrandLogo({ onDark = false, compact = false, className, symbolClassName }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={BRAND.symbol}
        alt=""
        width={48}
        height={48}
        unoptimized
        className={cn("size-10 shrink-0", symbolClassName)}
      />
      {!compact && (
        <span className={cn("text-[1.35rem] font-bold tracking-[-0.045em]", onDark ? "text-white" : "text-[#183d33]")}>
          <span className={onDark ? "text-[#e5c179]" : "text-[#16835f]"}>EZ</span>{BRAND.name.slice(2)}
        </span>
      )}
    </span>
  );
}

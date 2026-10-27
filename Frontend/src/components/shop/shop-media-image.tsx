"use client";

import Image from "next/image";
import { Store } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ShopMediaImageProps = {
  src: string | null;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
};

export function ShopMediaImage({ src, alt, className, style }: ShopMediaImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = !src || failedSrc === src;

  if (failed) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-emerald-50 to-slate-100" role="img" aria-label={`${alt} logo unavailable`}>
        <Store className="size-12 text-emerald-700/45" />
      </div>
    );
  }

  return (
    <Image
      fill
      unoptimized
      src={src}
      alt={alt}
      className={cn("object-cover", className)}
      style={style}
      onError={() => setFailedSrc(src)}
    />
  );
}


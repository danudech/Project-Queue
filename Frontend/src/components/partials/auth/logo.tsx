'use client'
import Image from 'next/image';

const Logo = () => {
  return (
    <div>
      <Image
        src="/images/brand/ezqueue-logo.png"
        alt="EZQueue"
        width={320}
        height={100}
        className="h-auto w-40"
        priority
      />
    </div>
  );
}

export default Logo;

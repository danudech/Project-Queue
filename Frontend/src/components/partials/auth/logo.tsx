'use client'
import Image from 'next/image';

const Logo = () => {
  return (
    <div>
      <Image
        src="/images/brand/new-logo.jpg"
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

'use client';

import Image from 'next/image';

export function FlipLogo() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/CCPEZON.png"
        alt="CCPEZON"
        width={120}
        height={80}
        className="object-contain"
        priority
      />
      <Image
        src="/LOGO STUDIA BLACK .png"
        alt="STUDIA"
        width={120}
        height={80}
        className="object-contain"
        priority
      />
    </div>
  );
}

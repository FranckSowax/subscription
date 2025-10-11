'use client';

import Image from 'next/image';

export function FlipLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="logo-container">
        <Image
          src="/CCPEZON.png"
          alt="CCPEZON"
          width={120}
          height={80}
          className="logo-image"
          priority
        />
      </div>
      <div className="logo-container">
        <Image
          src="/LOGO STUDIA BLACK .png"
          alt="STUDIA"
          width={120}
          height={80}
          className="logo-image"
          priority
        />
      </div>

      <style jsx>{`
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .logo-container {
            padding: 6px;
          }
        }

        .logo-image {
          max-width: 100%;
          height: auto;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
}

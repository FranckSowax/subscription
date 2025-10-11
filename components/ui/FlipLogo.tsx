'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function FlipLogo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flip-container">
      <div className="flipper">
        <div className="flip-front">
          <Image
            src="/CCPEZON.png"
            alt="CCPEZON"
            width={200}
            height={150}
            className="logo-image"
            priority
          />
        </div>
        <div className="flip-back">
          <Image
            src="/LOGO STUDIA BLACK .png"
            alt="STUDIA"
            width={200}
            height={150}
            className="logo-image"
            priority
          />
        </div>
      </div>

      <style jsx>{`
        .flip-container {
          perspective: 1500px;
          width: 180px;
          height: 120px;
        }

        @media (max-width: 768px) {
          .flip-container {
            width: 140px;
            height: 90px;
          }
        }

        .flipper {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: continuousFlip 5s linear infinite;
        }

        @keyframes continuousFlip {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }

        .flip-front,
        .flip-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 10px;
        }

        .flip-front {
          transform: rotateY(0deg);
        }

        .flip-back {
          transform: rotateY(180deg);
        }

        .logo-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
}

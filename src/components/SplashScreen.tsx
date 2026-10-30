import React, { useEffect, useState } from 'react';
import { MochiiMascot, SparkleStar } from './MochiiMascot';

interface SplashScreenProps {
  onFinish: () => void;
  onlineCount?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onFinish, 400);
    }, 1600);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const handleTap = () => {
    setIsExiting(true);
    setTimeout(onFinish, 200);
  };

  return (
    <div
      onClick={handleTap}
      className={`absolute inset-0 z-50 bg-gradient-to-b from-[#744CFB] via-[#6638F6] to-[#5527E6] flex flex-col items-center justify-between p-6 sm:p-8 text-white select-none overflow-hidden cursor-pointer transition-all duration-400 ease-out ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Decorative Sparkle Stars */}
      <SparkleStar size={24} className="absolute top-16 left-12 opacity-80 animate-pulse" />
      <SparkleStar size={16} className="absolute top-28 right-16 opacity-70 animate-bounce" />
      <SparkleStar size={18} className="absolute top-64 left-10 opacity-60" />
      <SparkleStar size={22} className="absolute bottom-40 right-10 opacity-80 animate-pulse" />

      {/* Spacer top */}
      <div className="h-6" />

      {/* Center Branding Block */}
      <div className="flex flex-col items-center text-center space-y-4 my-auto relative z-10">
        {/* Mochii Mascot */}
        <div className="animate-in zoom-in-95 duration-400">
          <MochiiMascot variant="happy" size={160} />
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
          mochii
        </h1>

        {/* Tagline */}
        <p className="text-sm sm:text-base text-white/85 font-medium max-w-xs leading-relaxed">
          Real people. Real moments.<br />Random video chat.
        </p>
      </div>

      {/* Bottom Layered Cloud Silhouette */}
      <div className="w-full relative z-0 mt-auto pointer-events-none">
        <svg
          viewBox="0 0 360 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full text-white/10"
        >
          <path
            d="M0 90 C40 40 80 80 120 50 C160 20 220 70 260 40 C300 10 340 50 360 40 L360 90 L0 90 Z"
            fill="currentColor"
          />
          <path
            d="M0 90 C30 60 70 85 110 65 C150 45 200 80 250 55 C290 35 330 65 360 55 L360 90 L0 90 Z"
            fill="white"
            fillOpacity="0.08"
          />
        </svg>
      </div>
    </div>
  );
};

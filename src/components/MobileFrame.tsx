import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  isWideLayout?: boolean;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [deviceMode, setDeviceMode] = useState<'phone' | 'fill'>('phone');

  return (
    <div className="w-screen h-[100dvh] bg-[#0A0718] bg-radial from-[#1A123E] via-[#0E0A22] to-[#080514] flex flex-col items-center justify-center overflow-hidden p-0 sm:p-4 select-none relative">
      
      {/* Top Device View Toggle for Desktop/Previewers */}
      <div className="hidden sm:flex items-center gap-2 absolute top-3 right-4 z-50 bg-[#1B143F]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-white/70 text-xs">
        <button
          onClick={() => setDeviceMode('phone')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            deviceMode === 'phone'
              ? 'bg-[#6538F6] text-white font-bold shadow-xs'
              : 'hover:text-white'
          }`}
          title="Mobile Phone View (Match Reference Image)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile</span>
        </button>
        <button
          onClick={() => setDeviceMode('fill')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            deviceMode === 'fill'
              ? 'bg-[#6538F6] text-white font-bold shadow-xs'
              : 'hover:text-white'
          }`}
          title="Full Viewport"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Wide</span>
        </button>
      </div>

      {/* Main Container */}
      <main
        className={`w-full h-full text-white overflow-hidden flex flex-col relative transition-all duration-300 ${
          deviceMode === 'phone'
            ? 'sm:w-[410px] sm:h-[860px] sm:max-h-[95dvh] sm:rounded-[44px] sm:shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_40px_rgba(103,57,247,0.25)] sm:border-[8px] sm:border-[#221B42] sm:ring-1 sm:ring-white/15'
            : 'sm:max-w-4xl sm:h-[94dvh] sm:rounded-[32px] sm:shadow-2xl sm:border sm:border-white/10'
        }`}
      >
        {/* Subtle Phone Notch / Speaker pill on mobile view */}
        {deviceMode === 'phone' && (
          <div className="hidden sm:flex absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#140F2D] rounded-full z-50 items-center justify-center pointer-events-none">
            <div className="w-10 h-1 bg-[#2C2356] rounded-full mr-2" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#1F1742] border border-[#3C2F75]" />
          </div>
        )}

        {/* Application Content */}
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-[#120E28]">
          {children}
        </div>

        {/* Subtle Home Indicator Bar */}
        {deviceMode === 'phone' && (
          <div className="hidden sm:flex absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full z-50 pointer-events-none" />
        )}
      </main>
    </div>
  );
};

import React from 'react';
import { Video, Volume2, VolumeX, Shield, QrCode, Monitor, Smartphone, Share2 } from 'lucide-react';

interface HeaderProps {
  onlineCount: number;
  waitingCount: number;
  soundEnabled: boolean;
  isWideLayout: boolean;
  onToggleWideLayout: () => void;
  onToggleSound: () => void;
  onOpenSafetyGuide: () => void;
  onOpenTwoDevicesModal: () => void;
  onOpenInstallModal: () => void;
  onShowSplash?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onlineCount,
  waitingCount,
  soundEnabled,
  isWideLayout,
  onToggleWideLayout,
  onToggleSound,
  onOpenSafetyGuide,
  onOpenTwoDevicesModal,
  onOpenInstallModal,
  onShowSplash,
}) => {
  return (
    // Jetpack Compose TopAppBar (Material 3 standard 64dp height)
    <header className="h-16 px-3 sm:px-4 bg-[#FEF7FF] border-b border-[#CAC4D0]/40 flex items-center justify-between select-none z-30 shrink-0">
      {/* Navigation Icon & Title Group */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onShowSplash}
          className="w-10 h-10 rounded-[14px] bg-[#6750A4] hover:bg-[#594291] active:scale-95 flex items-center justify-center text-white shadow-sm shadow-[#6750A4]/25 shrink-0 transition-all cursor-pointer"
          title="Replay Loading Splash Screen"
        >
          <Video className="w-5 h-5 fill-current" />
        </button>
        
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-semibold text-lg text-[#1D1B20] tracking-tight truncate">
              ChatPulse
            </h1>
            
            {/* Material 3 Tonal Status Badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8DEF8] text-[#21005D] text-[10px] font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#388E3C] animate-pulse" />
              <span>Live</span>
            </span>
          </div>
        </div>
      </div>

      {/* Jetpack Compose TopAppBar Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Toggle Website Wide / Phone Frame on desktop */}
        <button
          onClick={onToggleWideLayout}
          className="hidden md:flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#F3EDF7] hover:bg-[#E8DEF8] text-[#49454F] hover:text-[#21005D] text-xs font-medium transition-all active:scale-95 cursor-pointer"
          title={isWideLayout ? 'Switch to Compact Mobile View' : 'Switch to Wide View'}
        >
          {isWideLayout ? <Smartphone className="w-4 h-4 text-[#6750A4]" /> : <Monitor className="w-4 h-4 text-[#6750A4]" />}
          <span className="text-[11px] font-medium">{isWideLayout ? 'Mobile' : 'Desktop'}</span>
        </button>

        {/* Material 3 Filled Tonal Button: Host & Share */}
        <button
          onClick={onOpenInstallModal}
          className="h-9 px-3.5 rounded-full bg-[#EADDFF] hover:bg-[#D0BCFF] text-[#21005D] text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          title="Share website link or get app"
        >
          <Share2 className="w-3.5 h-3.5 text-[#6750A4]" />
          <span className="hidden sm:inline">Share & Host</span>
          <span className="sm:hidden">Share</span>
        </button>

        {/* Material 3 IconButton: Test 2 Devices */}
        <button
          onClick={onOpenTwoDevicesModal}
          className="w-10 h-10 rounded-full hover:bg-[#1D1B20]/8 active:bg-[#1D1B20]/12 flex items-center justify-center text-[#49454F] hover:text-[#1D1B20] transition-colors cursor-pointer"
          title="Test with two devices (QR Code)"
        >
          <QrCode className="w-5 h-5" />
        </button>

        {/* Material 3 IconButton: Sound */}
        <button
          onClick={onToggleSound}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            soundEnabled
              ? 'hover:bg-[#1D1B20]/8 active:bg-[#1D1B20]/12 text-[#49454F]'
              : 'bg-[#FFDAD6] text-[#410002]'
          }`}
          title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {/* Material 3 IconButton: Safety */}
        <button
          onClick={onOpenSafetyGuide}
          className="w-10 h-10 rounded-full hover:bg-[#1D1B20]/8 active:bg-[#1D1B20]/12 flex items-center justify-center text-[#49454F] hover:text-[#1D1B20] transition-colors cursor-pointer"
          title="Safety Rules"
        >
          <Shield className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

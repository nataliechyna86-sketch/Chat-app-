import React from 'react';
import { Video, Volume2, VolumeX, Shield, Users, QrCode } from 'lucide-react';

interface HeaderProps {
  onlineCount: number;
  waitingCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSafetyGuide: () => void;
  onOpenTwoDevicesModal: () => void;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onlineCount,
  waitingCount,
  soundEnabled,
  onToggleSound,
  onOpenSafetyGuide,
  onOpenTwoDevicesModal,
  onOpenInstallModal,
}) => {
  return (
    <header className="h-14 px-3 sm:px-4 bg-white/95 backdrop-blur-md border-b border-purple-100 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-500/20">
          <Video className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-slate-900">
              ChatPulse
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5">
        {/* Install Android App Button */}
        <button
          onClick={onOpenInstallModal}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
          title="Install on your phone or get APK"
        >
          <span className="text-[11px]">Install App</span>
        </button>

        {/* Test on 2 Devices Button */}
        <button
          onClick={onOpenTwoDevicesModal}
          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
          title="Test with two devices (QR Code)"
        >
          <QrCode className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-[11px] hidden sm:inline">2 Devices</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-xl text-xs border transition-all active:scale-95 ${
            soundEnabled
              ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
              : 'bg-rose-50 text-rose-500 border-rose-200'
          }`}
          title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Safety Guide */}
        <button
          onClick={onOpenSafetyGuide}
          className="p-2 rounded-xl text-xs bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 transition-all active:scale-95"
          title="Safety & Rules"
        >
          <Shield className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

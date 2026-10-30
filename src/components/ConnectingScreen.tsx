import React from 'react';
import { MochiiMascot } from './MochiiMascot';

interface ConnectingScreenProps {
  onCancel: () => void;
}

export const ConnectingScreen: React.FC<ConnectingScreenProps> = ({ onCancel }) => {
  return (
    <div className="absolute inset-0 z-30 bg-[#120E28] flex flex-col justify-between items-center p-6 sm:p-8 text-white select-none animate-in fade-in duration-200">
      
      {/* Top spacer */}
      <div className="h-10" />

      {/* Center Radar & Mascot Block */}
      <div className="flex flex-col items-center text-center space-y-8 my-auto">
        {/* Pulsing Concentric Glowing Rings */}
        <div className="relative flex items-center justify-center">
          {/* Ring 3 (Outer glow) */}
          <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-[#1C1540] border border-[#352778]/50 animate-ping opacity-25 duration-1000" />
          
          {/* Ring 2 (Middle) */}
          <div className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-[#271B5A] border border-[#4E35A8]/60 flex items-center justify-center animate-pulse duration-700" />

          {/* Ring 1 (Inner avatar ring) */}
          <div className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#774DFA] to-[#5527E6] p-1 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#6538F6] flex items-center justify-center overflow-hidden">
              <MochiiMascot variant="happy" size={80} />
            </div>
          </div>
        </div>

        {/* Status Text matching Screen 6 */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight text-white">
            Connecting...
          </h3>
          <p className="text-sm text-[#A89CD6] font-normal max-w-xs">
            Finding someone awesome for you...
          </p>
        </div>
      </div>

      {/* Bottom Cancel Pill Button matching Screen 6 */}
      <div className="w-full max-w-[200px] pb-4">
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-full bg-transparent border border-white/30 hover:border-white/60 active:bg-white/10 text-white font-semibold text-sm transition-all cursor-pointer"
        >
          Cancel
        </button>
      </div>

    </div>
  );
};

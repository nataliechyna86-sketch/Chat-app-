import React, { useState } from 'react';
import { Video, Menu, Sparkles, Mic, MicOff, VideoOff, Settings } from 'lucide-react';
import { MochiiMascot, SparkleStar } from './MochiiMascot';
import { AdMobBanner } from './AdMobBanner';
import { UserProfile } from '../types';

interface SetupScreenProps {
  profile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onStartMatching: () => void;
  onOpenSettings: () => void;
  onOpenTwoDevices?: () => void;
  localStream: MediaStream | null;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onlineCount: number;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  profile,
  onStartMatching,
  onOpenSettings,
  onOpenTwoDevices,
  localStream,
  isAudioMuted,
  isVideoMuted,
  onToggleAudio,
  onToggleVideo,
  onlineCount,
}) => {
  const [showQuickPreview, setShowQuickPreview] = useState(false);

  return (
    <div className="flex-1 w-full h-full bg-gradient-to-b from-[#7147F9] via-[#6537F7] to-[#5527E6] flex flex-col justify-between p-6 sm:p-7 text-white select-none relative overflow-hidden">
      
      {/* Decorative Sparkle Stars matching Home / Waiting screen */}
      <SparkleStar size={18} className="absolute top-28 left-8 opacity-75 animate-pulse" />
      <SparkleStar size={14} className="absolute top-44 right-10 opacity-70" />
      <SparkleStar size={18} className="absolute bottom-48 left-12 opacity-80" />
      <SparkleStar size={22} className="absolute bottom-40 right-14 opacity-85 animate-pulse" />

      {/* Top Navigation Bar: Mini Mochii logo + Name + Online badge + Actions */}
      <div className="flex items-center justify-between z-20 h-10">
        {/* Brand Group */}
        <div className="flex items-center gap-2">
          <MochiiMascot variant="icon" size={28} />
          <span className="font-extrabold text-2xl tracking-tight text-white">
            mochii
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold backdrop-blur-xs ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{onlineCount === 1 ? '1 online' : `${onlineCount.toLocaleString()} online`}</span>
          </span>
        </div>

        {/* Action Group: Test on Phone / 2 Devices + Hamburger Menu */}
        <div className="flex items-center gap-1">
          {onOpenTwoDevices && (
            <button
              onClick={onOpenTwoDevices}
              className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-semibold text-white flex items-center gap-1 transition-all cursor-pointer border border-white/20"
              title="Test on another phone or browser (QR code & link)"
            >
              <span>📱 QR</span>
            </button>
          )}

          {/* Hamburger Menu Button */}
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full hover:bg-white/15 active:scale-95 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Open Settings & Profile"
          >
            <Menu className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Center Hero Block: "Find someone to chat with" */}
      <div className="flex flex-col items-center text-center space-y-6 my-auto z-10 max-w-sm mx-auto px-2">
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Find someone<br />to chat with
          </h2>
          <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed max-w-[280px] mx-auto">
            Tap the button below to start a random video chat.
          </p>
        </div>

        {/* Big Crisp White Pill Button: [ 📹 Start Chat ] */}
        <div className="w-full max-w-[280px] space-y-3">
          <button
            onClick={onStartMatching}
            className="w-full py-4 px-6 rounded-full bg-white hover:bg-white/95 active:scale-98 text-[#5D30F0] font-extrabold text-base sm:text-lg shadow-2xl shadow-black/20 flex items-center justify-center gap-3 transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-[#5D30F0] text-white flex items-center justify-center shrink-0">
              <Video className="w-4 h-4 fill-current" />
            </div>
            <span>Start Chat</span>
          </button>

          {/* Quick Camera & Mic Preview toggle */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={onToggleAudio}
              className={`p-2 rounded-full border transition-all active:scale-95 cursor-pointer ${
                isAudioMuted
                  ? 'bg-rose-500/30 border-rose-400 text-white'
                  : 'bg-white/15 border-white/30 text-white hover:bg-white/25'
              }`}
              title={isAudioMuted ? 'Microphone Muted' : 'Microphone Ready'}
            >
              {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={onToggleVideo}
              className={`p-2 rounded-full border transition-all active:scale-95 cursor-pointer ${
                isVideoMuted
                  ? 'bg-rose-500/30 border-rose-400 text-white'
                  : 'bg-white/15 border-white/30 text-white hover:bg-white/25'
              }`}
              title={isVideoMuted ? 'Camera Off' : 'Camera Ready'}
            >
              {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowQuickPreview(!showQuickPreview)}
              className="text-xs text-white/80 hover:text-white font-medium underline underline-offset-4 cursor-pointer px-1"
            >
              {showQuickPreview ? 'Hide camera' : 'Preview camera'}
            </button>
          </div>

          {/* Small floating preview card if requested */}
          {showQuickPreview && (
            <div className="w-40 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-white/40 shadow-xl bg-slate-900 animate-in fade-in zoom-in-95 duration-200 relative">
              {localStream && !isVideoMuted ? (
                <video
                  ref={(el) => {
                    if (el && localStream) {
                      if (el.srcObject !== localStream) el.srcObject = localStream;
                      el.play().catch(() => {});
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={(e) => {
                    (e.target as HTMLVideoElement).play().catch(() => {});
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/50 text-xs">
                  <VideoOff className="w-5 h-5 mb-1" />
                  <span>Camera off</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom AdMob Test Banner & Peeking Mascot */}
      <div className="w-full flex flex-col items-center z-10 -mb-6 pointer-events-auto">
        <AdMobBanner className="mb-2 shadow-2xl" />
        <div className="w-full flex justify-center items-end pointer-events-none">
          <MochiiMascot variant="peeking" />
        </div>
      </div>

    </div>
  );
};

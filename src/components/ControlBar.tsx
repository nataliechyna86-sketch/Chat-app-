import React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  RefreshCw,
  Sparkles,
  MessageSquare,
  SkipForward,
} from 'lucide-react';
import { ConnectionState } from '../types';

interface ControlBarProps {
  connectionState: ConnectionState;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  canSwitchCamera: boolean;
  isChatOpen: boolean;
  unreadCount?: number;
  onSkip: () => void;
  onStop: () => void;
  onStart: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onSwitchCamera: () => void;
  onOpenEffects: () => void;
  onToggleChat: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  connectionState,
  isAudioMuted,
  isVideoMuted,
  canSwitchCamera,
  isChatOpen,
  unreadCount = 0,
  onSkip,
  onStop,
  onStart,
  onToggleAudio,
  onToggleVideo,
  onSwitchCamera,
  onOpenEffects,
  onToggleChat,
}) => {
  return (
    <div className="relative z-30 w-full bg-gradient-to-t from-[#0E0A22] via-[#120E28]/95 to-transparent pt-3 pb-6 px-4 select-none">
      
      {/* Floating secondary action buttons above dock (Chat & Next & Effects) */}
      <div className="flex items-center justify-between mb-3 px-2">
        {/* Chat Button */}
        <button
          onClick={onToggleChat}
          className={`relative px-3.5 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isChatOpen
              ? 'bg-[#6538F6] text-white shadow-lg shadow-[#6538F6]/30'
              : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
          }`}
          title="Live Chat"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat</span>
          {unreadCount > 0 && !isChatOpen && (
            <span className="w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center -mr-1">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Quick Skip / Next Stranger */}
        <button
          onClick={onSkip}
          className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 backdrop-blur-md text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          title="Skip to next stranger (Space)"
        >
          <span>Next</span>
          <SkipForward className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Effects & Filters */}
        <button
          onClick={onOpenEffects}
          className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-md text-white border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          title="Filters & Face Stickers"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Effects</span>
        </button>
      </div>

      {/* Screen 7 Core Dock: 4 Circular Glass Buttons with Labels Underneath */}
      <div className="flex items-center justify-around max-w-sm mx-auto">
        
        {/* 1. Mute */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onToggleAudio}
            className={`w-12 h-12 xs:w-14 xs:h-14 sm:w-15 sm:h-15 rounded-full flex items-center justify-center transition-all active:scale-92 cursor-pointer shadow-lg backdrop-blur-md ${
              isAudioMuted
                ? 'bg-rose-500/90 hover:bg-rose-600 text-white shadow-rose-500/30'
                : 'bg-white/20 hover:bg-white/30 text-white border border-white/25'
            }`}
            title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isAudioMuted ? (
              <MicOff className="w-5 h-5 xs:w-6 xs:h-6 stroke-[2.2]" />
            ) : (
              <Mic className="w-5 h-5 xs:w-6 xs:h-6 stroke-[2.2]" />
            )}
          </button>
          <span className="text-[11px] xs:text-xs font-medium text-white/90">
            {isAudioMuted ? 'Unmute' : 'Mute'}
          </span>
        </div>

        {/* 2. Camera */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onToggleVideo}
            className={`w-12 h-12 xs:w-14 xs:h-14 sm:w-15 sm:h-15 rounded-full flex items-center justify-center transition-all active:scale-92 cursor-pointer shadow-lg backdrop-blur-md ${
              isVideoMuted
                ? 'bg-rose-500/90 hover:bg-rose-600 text-white shadow-rose-500/30'
                : 'bg-white/20 hover:bg-white/30 text-white border border-white/25'
            }`}
            title={isVideoMuted ? 'Turn camera on' : 'Turn camera off'}
          >
            {isVideoMuted ? (
              <VideoOff className="w-5 h-5 xs:w-6 xs:h-6 stroke-[2.2]" />
            ) : (
              <Video className="w-5 h-5 xs:w-6 xs:h-6 stroke-[2.2]" />
            )}
          </button>
          <span className="text-[11px] xs:text-xs font-medium text-white/90">
            Camera
          </span>
        </div>

        {/* 3. End (Screen 7 Red Circle Button) */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onStop}
            className="w-12 h-12 xs:w-14 xs:h-14 sm:w-15 sm:h-15 rounded-full bg-[#EF4444] hover:bg-[#DC2626] active:scale-92 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-all cursor-pointer"
            title="End call"
          >
            <PhoneOff className="w-5 h-5 xs:w-6 xs:h-6 fill-current" />
          </button>
          <span className="text-[11px] xs:text-xs font-medium text-white/90">
            End
          </span>
        </div>

        {/* 4. Switch (Camera Flip) */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onSwitchCamera}
            className="w-12 h-12 xs:w-14 xs:h-14 sm:w-15 sm:h-15 rounded-full bg-white/20 hover:bg-white/30 active:scale-92 text-white border border-white/25 flex items-center justify-center shadow-lg backdrop-blur-md transition-all cursor-pointer"
            title="Switch / Flip camera"
          >
            <RefreshCw className="w-5 h-5 xs:w-6 xs:h-6 stroke-[2.2]" />
          </button>
          <span className="text-[11px] xs:text-xs font-medium text-white/90">
            Switch
          </span>
        </div>

      </div>

    </div>
  );
};

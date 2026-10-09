import React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  SkipForward,
  Square,
  Sparkles,
  MessageSquare,
  RefreshCw,
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
    <div className="h-18 px-4 bg-white/95 backdrop-blur-md border-t border-purple-100 flex items-center justify-between select-none z-30 shrink-0">
      
      {/* Primary Skip / Next Button */}
      <div className="flex items-center gap-2">
        {connectionState === 'idle' ? (
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-sm shadow-md shadow-purple-500/25 transition-all cursor-pointer"
          >
            <span>Start</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onSkip}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md shadow-purple-500/25 active:scale-95 transition-all cursor-pointer"
              title="Next stranger"
            >
              <SkipForward className="w-4 h-4 fill-current" />
              <span>Next</span>
            </button>

            <button
              onClick={onStop}
              className="p-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 active:scale-95 transition-all cursor-pointer"
              title="Leave call"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Action Circular Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Microphone */}
        <button
          onClick={onToggleAudio}
          className={`p-2.5 rounded-2xl border transition-all active:scale-95 cursor-pointer ${
            isAudioMuted
              ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
              : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
          }`}
          title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Video Camera */}
        <button
          onClick={onToggleVideo}
          className={`p-2.5 rounded-2xl border transition-all active:scale-95 cursor-pointer ${
            isVideoMuted
              ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
              : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
          }`}
          title={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
        </button>

        {/* Camera Flip (Mobile Devices) */}
        {canSwitchCamera && (
          <button
            onClick={onSwitchCamera}
            className="p-2.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 active:scale-95 transition-all cursor-pointer"
            title="Flip Camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Effects / Stickers */}
        <button
          onClick={onOpenEffects}
          className="p-2.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 active:scale-95 transition-all cursor-pointer"
          title="Filters & Face Stickers"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
        </button>

        {/* Chat Drawer Toggle with Unread Badge */}
        <button
          onClick={onToggleChat}
          className={`relative p-2.5 rounded-2xl border transition-all active:scale-95 cursor-pointer ${
            isChatOpen
              ? 'bg-purple-600 border-purple-600 text-white'
              : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
          }`}
          title="Open Live Chat"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

    </div>
  );
};

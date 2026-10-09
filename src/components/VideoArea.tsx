import React, { useEffect, useRef } from 'react';
import {
  User,
  Globe,
  Radio,
  Tag,
  Sparkles,
  VideoOff,
  Flag,
} from 'lucide-react';
import { ConnectionState, PartnerInfo, FloatingReaction, VideoFilter, FaceOverlay, ChatMessage } from '../types';
import { getFilterStyle } from '../utils/videoCanvas';

interface VideoAreaProps {
  connectionState: ConnectionState;
  partnerInfo: PartnerInfo | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  filter: VideoFilter;
  overlay: FaceOverlay;
  mirrorLocal: boolean;
  localAudioLevel: number;
  remoteAudioLevel: number;
  floatingReactions: FloatingReaction[];
  recentMessages: ChatMessage[];
  onStartSearch: () => void;
  onSimulateSoloMatch: () => void;
  onOpenReport: () => void;
  waitingCount: number;
}

export const VideoArea: React.FC<VideoAreaProps> = ({
  connectionState,
  partnerInfo,
  localStream,
  remoteStream,
  isAudioMuted,
  isVideoMuted,
  filter,
  overlay,
  mirrorLocal,
  localAudioLevel,
  remoteAudioLevel,
  floatingReactions,
  recentMessages,
  onStartSearch,
  onSimulateSoloMatch,
  onOpenReport,
  waitingCount,
}) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((err) => {
        console.warn('Remote video playback auto-play notice:', err);
      });
    }
  }, [remoteStream]);

  const isLocalSpeaking = localAudioLevel > 18;
  const isRemoteSpeaking = remoteAudioLevel > 18;

  // Render sticker overlay on local camera
  const renderFaceOverlay = () => {
    switch (overlay) {
      case 'sunglasses':
        return (
          <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl pointer-events-none drop-shadow-md select-none">
            🕶️
          </div>
        );
      case 'party_hat':
        return (
          <div className="absolute top-[12%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl pointer-events-none drop-shadow-md select-none">
            🥳
          </div>
        );
      case 'mustache':
        return (
          <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl pointer-events-none drop-shadow-md select-none">
            🥸
          </div>
        );
      case 'cat_ears':
        return (
          <div className="absolute top-[14%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl pointer-events-none drop-shadow-md select-none">
            🐱
          </div>
        );
      case 'crown':
        return (
          <div className="absolute top-[12%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl pointer-events-none drop-shadow-md select-none">
            👑
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative flex-1 bg-purple-50/50 flex flex-col overflow-hidden select-none p-2 sm:p-3">
      {/* Floating Reactions Stream */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {floatingReactions.map((item) => (
          <div
            key={item.id}
            style={{
              left: `${item.x}%`,
              bottom: '20%',
            }}
            className="absolute text-3xl animate-[bounce_1.5s_ease-out_infinite] transition-transform duration-1000 -translate-y-48 opacity-95 drop-shadow-md"
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Main Video Viewport (Mobile Native App Style) */}
      <div className="relative w-full h-full rounded-3xl overflow-hidden bg-slate-900 border-2 border-purple-200 shadow-sm flex items-center justify-center">
        
        {/* Connected Remote Video */}
        {connectionState === 'connected' && remoteStream ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover transition-all ${
                isRemoteSpeaking ? 'ring-4 ring-purple-500/80 ring-inset' : ''
              }`}
            />

            {/* Top Partner Floating Badge */}
            {partnerInfo && (
              <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-purple-100 shadow-md flex items-center gap-2">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                      {partnerInfo.name.charAt(0)}
                    </div>
                    {isRemoteSpeaking && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 leading-tight">
                      <span className="font-bold text-xs text-slate-900">{partnerInfo.name}</span>
                      {partnerInfo.isSimulated && (
                        <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-full font-semibold">
                          Practice
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-purple-600 font-medium flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" />
                      <span>{partnerInfo.country}</span>
                    </div>
                  </div>
                </div>

                {/* Report button in header */}
                <button
                  onClick={onOpenReport}
                  className="p-2 rounded-2xl bg-white/90 backdrop-blur-md border border-purple-100 text-slate-400 hover:text-rose-500 shadow-md transition-colors"
                  title="Report user"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Interest Tags in Video */}
            {partnerInfo && partnerInfo.interests.length > 0 && (
              <div className="absolute top-14 left-3 z-20 flex flex-wrap gap-1 max-w-[200px]">
                {partnerInfo.interests.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-white/80 backdrop-blur-xs text-purple-900 px-2 py-0.5 rounded-full border border-purple-200/60 shadow-xs flex items-center gap-1 font-medium"
                  >
                    <Tag className="w-2 h-2 text-purple-600" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Live Chat Overlay (Mobile Stream Style) */}
            <div className="absolute bottom-3 left-3 right-28 z-20 pointer-events-none space-y-1.5 max-h-36 overflow-hidden flex flex-col justify-end">
              {recentMessages.slice(-3).map((msg) => (
                <div
                  key={msg.id}
                  className={`px-3 py-1.5 rounded-2xl text-xs max-w-[90%] backdrop-blur-md shadow-sm animate-in fade-in slide-in-from-bottom-2 ${
                    msg.sender === 'system'
                      ? 'bg-purple-950/70 text-purple-200 text-[11px] self-start'
                      : msg.sender === 'me'
                      ? 'bg-purple-600/90 text-white self-end'
                      : 'bg-white/90 text-slate-900 border border-purple-100 self-start'
                  }`}
                >
                  <span className="font-semibold text-[10px] opacity-75 mr-1.5">
                    {msg.sender === 'me' ? 'You' : msg.sender === 'stranger' ? partnerInfo?.name || 'Stranger' : '●'}
                  </span>
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>

          </div>
        ) : (
          /* Searching / Radar or Ended State */
          <div className="w-full h-full bg-gradient-to-b from-purple-50 via-white to-purple-100 flex flex-col items-center justify-center p-6 text-center">
            {connectionState === 'searching' || connectionState === 'connecting' ? (
              <div className="flex flex-col items-center gap-4 max-w-xs">
                {/* Clean Purple Radar */}
                <div className="relative flex items-center justify-center w-24 h-24">
                  <div className="absolute inset-0 rounded-full bg-purple-200/60 animate-ping opacity-60" />
                  <div className="absolute inset-2 rounded-full bg-purple-300/40 animate-pulse" />
                  <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Radio className="w-7 h-7 text-white animate-spin" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-0.5">
                    {connectionState === 'connecting' ? 'Connecting Video...' : 'Finding Someone...'}
                  </h3>
                  <p className="text-xs text-purple-700">
                    {waitingCount} active peers in matching queue
                  </p>
                </div>

                <button
                  onClick={onSimulateSoloMatch}
                  className="mt-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Practice with AI Partner
                </button>
              </div>
            ) : connectionState === 'ended' ? (
              <div className="flex flex-col items-center gap-3 max-w-xs">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <User className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Partner left the chat</h3>
                <p className="text-xs text-slate-500">
                  Ready to talk with someone new?
                </p>
                <button
                  onClick={onStartSearch}
                  className="mt-1 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/25 transition-all cursor-pointer"
                >
                  Find Next Partner
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <Radio className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Ready to Match</h3>
                <p className="text-xs text-purple-700">
                  Tap Start to connect with a random stranger!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Local Camera Floating PiP (Mobile App FaceTime Style) */}
        <div className="absolute bottom-3 right-3 w-28 h-36 sm:w-32 sm:h-44 rounded-2xl overflow-hidden bg-slate-900 border-2 border-white shadow-xl z-20 group">
          {localStream && !isVideoMuted ? (
            <div className="relative w-full h-full bg-black">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  filter: getFilterStyle(filter),
                  transform: mirrorLocal ? 'scaleX(-1)' : 'none',
                }}
                className={`w-full h-full object-cover ${
                  isLocalSpeaking ? 'ring-2 ring-purple-500 ring-inset' : ''
                }`}
              />
              {renderFaceOverlay()}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-purple-100 text-purple-400 gap-1">
              <VideoOff className="w-6 h-6 text-purple-500" />
              <span className="text-[10px] font-medium text-purple-700">Off</span>
            </div>
          )}

          {/* Local Pill Badge */}
          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[10px] px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white">
            <span className="font-semibold">You</span>
            {isLocalSpeaking && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          </div>
        </div>

      </div>
    </div>
  );
};

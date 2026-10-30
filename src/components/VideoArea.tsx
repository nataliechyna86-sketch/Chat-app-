import React, { useEffect, useRef, useState } from 'react';
import {
  User,
  Globe,
  Radio,
  Tag,
  Sparkles,
  VideoOff,
  Flag,
} from 'lucide-react';
import { MochiiMascot } from './MochiiMascot';
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

  // Call duration timer (00:00) matching Screen 7
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer: any = null;
    if (connectionState === 'connected') {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [connectionState]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Robust local stream attachment & auto-play helper
  const attachLocalVideoRef = (el: HTMLVideoElement | null) => {
    localVideoRef.current = el;
    if (el && localStream) {
      if (el.srcObject !== localStream) {
        el.srcObject = localStream;
      }
      el.play().catch((err) => {
        console.warn('Local video playback catch:', err);
      });
    }
  };

  // Re-verify stream attachment and play whenever state, stream, or mute changes
  useEffect(() => {
    if (localVideoRef.current && localStream && !isVideoMuted) {
      if (localVideoRef.current.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream;
      }
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, isVideoMuted, connectionState]);

  // Handle app/tab waking up from background or minimised state to prevent frozen frames
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (localVideoRef.current && localStream && !isVideoMuted) {
          localVideoRef.current.play().catch(() => {});
        }
        if (remoteVideoRef.current && remoteStream) {
          remoteVideoRef.current.play().catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [localStream, remoteStream, isVideoMuted]);

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
          <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl pointer-events-none drop-shadow-md select-none">
            🕶️
          </div>
        );
      case 'party_hat':
        return (
          <div className="absolute top-[12%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl pointer-events-none drop-shadow-md select-none">
            🥳
          </div>
        );
      case 'mustache':
        return (
          <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl pointer-events-none drop-shadow-md select-none">
            🥸
          </div>
        );
      case 'cat_ears':
        return (
          <div className="absolute top-[14%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl pointer-events-none drop-shadow-md select-none">
            🐱
          </div>
        );
      case 'crown':
        return (
          <div className="absolute top-[12%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl pointer-events-none drop-shadow-md select-none">
            👑
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative flex-1 w-full h-full bg-[#120E28] flex flex-col overflow-hidden select-none">
      
      {/* Floating Reactions Stream */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {floatingReactions.map((item) => (
          <div
            key={item.id}
            style={{
              left: `${item.x}%`,
              bottom: '25%',
            }}
            className="absolute text-3xl animate-[bounce_1.5s_ease-out_infinite] transition-transform duration-1000 -translate-y-48 opacity-95 drop-shadow-md"
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Main Video Viewport matching Screen 7 */}
      <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
        
        {/* Connected Remote Video */}
        {connectionState === 'connected' ? (
          <div className="relative w-full h-full flex items-center justify-center bg-[#151030]">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover transition-all ${
                  isRemoteSpeaking ? 'ring-4 ring-[#7F57FF] ring-inset' : ''
                }`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-24 h-24 rounded-full bg-[#6538F6] flex items-center justify-center shadow-xl">
                  <MochiiMascot variant="happy" size={70} />
                </div>
                <p className="text-white font-semibold text-sm">
                  Connecting partner camera...
                </p>
              </div>
            )}

            {/* Screen 7: Top-Left Glass Timer Pill (00:32) */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <div className="px-3.5 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white font-semibold text-xs tracking-wider flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{formatTimer(elapsedSeconds)}</span>
              </div>

              {/* Partner Name Tag */}
              {partnerInfo && (
                <div className="px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium flex items-center gap-1.5 shadow-md max-w-[110px] xs:max-w-[150px] sm:max-w-[200px] truncate">
                  <span className="truncate">{partnerInfo.name}</span>
                  <span className="text-[10px] text-white/60 shrink-0">({partnerInfo.country})</span>
                </div>
              )}
            </div>

            {/* Top-Right Report Button */}
            <div className="absolute top-4 right-26 xs:right-30 sm:right-34 z-20">
              <button
                onClick={onOpenReport}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white/80 hover:text-rose-400 transition-colors cursor-pointer shadow-md"
                title="Report user"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Screen 7: Top-Right Local Camera PiP Card */}
            <div className="absolute top-4 right-3 sm:right-4 w-20 h-28 xs:w-24 xs:h-32 sm:w-28 sm:h-36 rounded-2xl overflow-hidden bg-slate-900 border-2 border-white/80 shadow-2xl z-20 group">
              {localStream && !isVideoMuted ? (
                <div className="relative w-full h-full bg-black">
                  <video
                    ref={attachLocalVideoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={(e) => {
                      (e.target as HTMLVideoElement).play().catch(() => {});
                    }}
                    onPause={(e) => {
                      if (!isVideoMuted && localStream) {
                        (e.target as HTMLVideoElement).play().catch(() => {});
                      }
                    }}
                    style={{
                      filter: getFilterStyle(filter),
                      transform: mirrorLocal ? 'scaleX(-1)' : 'none',
                    }}
                    className={`w-full h-full object-cover ${
                      isLocalSpeaking ? 'ring-2 ring-[#7F57FF] ring-inset' : ''
                    }`}
                  />
                  {renderFaceOverlay()}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#251D52] text-white/70 p-2">
                  <MochiiMascot variant="icon" size={32} />
                  <span className="text-[9px] font-semibold mt-1">Off</span>
                </div>
              )}

              {/* Small "You" Tag */}
              <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between text-[9px] px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white">
                <span className="font-semibold">You</span>
                {isLocalSpeaking && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </div>
            </div>

            {/* Live Chat Overlay (Minimal Floating Bubble List with responsive wrap) */}
            <div className="absolute bottom-3 left-3 right-3 sm:right-24 z-20 pointer-events-none space-y-1.5 max-h-36 overflow-hidden flex flex-col justify-end">
              {recentMessages.slice(-3).map((msg) => (
                <div
                  key={msg.id}
                  className={`px-3 py-1.5 rounded-2xl text-xs backdrop-blur-md shadow-md animate-in fade-in slide-in-from-bottom-2 break-words [overflow-wrap:anywhere] max-w-[90%] sm:max-w-[75%] ${
                    msg.sender === 'system'
                      ? 'bg-purple-950/85 text-[#CBBEE8] text-[11px] self-start border border-white/10'
                      : msg.sender === 'me'
                      ? 'bg-[#6538F6]/95 text-white self-end'
                      : 'bg-white/95 text-slate-900 self-start shadow-lg font-medium'
                  }`}
                >
                  <span className="font-bold text-[10px] opacity-75 mr-1.5 inline-block">
                    {msg.sender === 'me' ? 'You' : msg.sender === 'stranger' ? partnerInfo?.name || 'Stranger' : '✦'}
                  </span>
                  <span className="break-words [overflow-wrap:anywhere]">{msg.text}</span>
                </div>
              ))}
            </div>

          </div>
        ) : connectionState === 'ended' ? (
          /* Ended State with Mochii mascot */
          <div className="w-full h-full bg-[#120E28] flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
            <div className="w-24 h-24 rounded-full bg-[#6538F6] flex items-center justify-center shadow-2xl p-2">
              <MochiiMascot variant="happy" size={76} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Call Ended</h3>
              <p className="text-xs text-[#A89CD6]">
                Ready to meet someone awesome?
              </p>
            </div>
            <button
              onClick={onStartSearch}
              className="px-6 py-3 rounded-full bg-white text-[#5D30F0] font-extrabold text-sm shadow-xl active:scale-95 transition-all cursor-pointer"
            >
              Start Next Chat
            </button>
          </div>
        ) : (
          /* Idle / Fallback */
          <div className="w-full h-full bg-[#120E28] flex flex-col items-center justify-center p-6 text-center">
            <MochiiMascot variant="happy" size={100} />
          </div>
        )}

      </div>
    </div>
  );
};

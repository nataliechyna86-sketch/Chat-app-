import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Mic,
  Plus,
  X,
  Play,
  Bot,
  Globe,
  VideoOff,
  MicOff,
  QrCode,
  Users,
  Smartphone,
} from 'lucide-react';
import { UserProfile } from '../types';

interface SetupScreenProps {
  profile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onStartMatching: () => void;
  onStartSoloPractice: () => void;
  onOpenTwoDevicesModal: () => void;
  onOpenInstallModal: () => void;
  localStream: MediaStream | null;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onlineCount: number;
  waitingCount: number;
}

const POPULAR_TAGS = ['Gaming', 'Music', 'Anime', 'Tech', 'Movies', 'Chill', 'Travel'];
const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Japan', 'Brazil', 'Australia', 'Spain', 'Italy', 'Global'];

export const SetupScreen: React.FC<SetupScreenProps> = ({
  profile,
  onUpdateProfile,
  onStartMatching,
  onStartSoloPractice,
  onOpenTwoDevicesModal,
  onOpenInstallModal,
  localStream,
  isAudioMuted,
  isVideoMuted,
  onToggleAudio,
  onToggleVideo,
  onlineCount,
  waitingCount,
}) => {
  const [tagInput, setTagInput] = useState('');
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (previewVideoRef.current && localStream) {
      previewVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().toLowerCase();
    if (!clean) return;
    if (profile.interests.map(t => t.toLowerCase()).includes(clean)) return;
    if (profile.interests.length >= 8) return;

    onUpdateProfile({
      interests: [...profile.interests, clean],
    });
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateProfile({
      interests: profile.interests.filter(t => t.toLowerCase() !== tagToRemove.toLowerCase()),
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-purple-50/40 p-4 sm:p-5 flex flex-col justify-between">
      <div className="max-w-md mx-auto w-full space-y-4">
        
        {/* Top welcome status */}
        <div className="flex items-center justify-between text-xs text-purple-900/80 px-1 pt-1">
          <div className="flex items-center gap-1.5 font-medium">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>{onlineCount.toLocaleString()} strangers online</span>
          </div>
          <span className="text-purple-600 font-semibold">{waitingCount} waiting</span>
        </div>

        {/* Camera Preview Card (Vertical Mobile Frame) */}
        <div className="relative w-full aspect-[4/3] sm:aspect-square max-h-[300px] rounded-3xl overflow-hidden bg-slate-900 border-2 border-purple-200 shadow-md flex items-center justify-center">
          {localStream && !isVideoMuted ? (
            <video
              ref={previewVideoRef}
              autoPlay
              playsInline
              muted
              style={{ transform: profile.mirrorLocal ? 'scaleX(-1)' : 'none' }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <VideoOff className="w-8 h-8 text-purple-400" />
              <span className="text-xs font-medium">Camera is turned off</span>
            </div>
          )}

          {/* Camera & Mic toggles */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-purple-200 shadow-md">
            <button
              onClick={onToggleAudio}
              className={`p-2 rounded-full transition-all active:scale-95 ${
                isAudioMuted
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
              title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={onToggleVideo}
              className={`p-2 rounded-full transition-all active:scale-95 ${
                isVideoMuted
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
              title={isVideoMuted ? 'Turn camera on' : 'Turn camera off'}
            >
              {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>
          </div>

          <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-semibold text-purple-900 border border-purple-100 shadow-xs">
            Preview
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-4 border border-purple-100 shadow-sm space-y-3.5">
          {/* Nickname & Country */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-purple-950 mb-1">
                Nickname
              </label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => onUpdateProfile({ username: e.target.value })}
                maxLength={18}
                placeholder="Your name"
                className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-purple-300 focus:outline-none focus:border-purple-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-purple-950 mb-1">
                Region
              </label>
              <div className="relative">
                <select
                  value={profile.country}
                  onChange={(e) => onUpdateProfile({ country: e.target.value })}
                  className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2 text-xs text-slate-800 appearance-none focus:outline-none focus:border-purple-500 focus:bg-white transition-colors"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Globe className="w-3.5 h-3.5 text-purple-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Interests */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-purple-950">Interests</span>
              <span className="text-[10px] text-purple-400">{profile.interests.length}/8 tags</span>
            </div>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[30px]">
              {profile.interests.length === 0 ? (
                <span className="text-[11px] text-purple-300 italic self-center">
                  Add tags to match shared interests, or leave blank to match anyone
                </span>
              ) : (
                profile.interests.map((tag) => (
                  <span
                    key={tag}
                    className="bg-purple-100 text-purple-800 border border-purple-200 text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-purple-950"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Custom Tag */}
            <div className="flex gap-1.5 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Type tag (e.g. music) & press Add"
                className="flex-1 bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-purple-300 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                disabled={!tagInput.trim()}
                className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold text-xs disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {/* Popular quick tags */}
            <div className="flex flex-wrap gap-1">
              {POPULAR_TAGS.map((tag) => {
                const isSelected = profile.interests.map(t => t.toLowerCase()).includes(tag.toLowerCase());
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => isSelected ? handleRemoveTag(tag) : handleAddTag(tag)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 font-medium'
                        : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Install on Android App Banner */}
        <button
          type="button"
          onClick={onOpenInstallModal}
          className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white flex items-center justify-between text-left transition-all shadow-md shadow-purple-500/20 group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Install on Your Phone / Get APK</span>
                <span className="text-[9px] bg-white/25 text-white px-1.5 py-0.2 rounded-full font-semibold">Android</span>
              </div>
              <div className="text-[11px] text-purple-100">
                Install directly on phone or build React Native APK
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-white group-hover:translate-x-0.5 transition-transform bg-white/20 px-2.5 py-1 rounded-xl">
            Install →
          </span>
        </button>

        {/* Test on 2 Devices Banner */}
        <button
          type="button"
          onClick={onOpenTwoDevicesModal}
          className="w-full p-3 rounded-2xl bg-white hover:bg-purple-50/80 border border-purple-200 flex items-center justify-between text-left transition-all shadow-xs group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Test with 2 Devices</span>
                <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-full font-semibold">Real P2P</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Scan QR with your phone to start 2-way video!
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold text-purple-600 group-hover:translate-x-0.5 transition-transform">
            Scan →
          </span>
        </button>

      </div>

      {/* Bottom Main Actions */}
      <div className="max-w-md mx-auto w-full pt-4 space-y-2">
        <button
          onClick={onStartMatching}
          className="w-full py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-98 text-white font-bold text-base shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Start Video Chat</span>
        </button>

        <button
          onClick={onStartSoloPractice}
          className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-purple-50 text-purple-700 font-semibold text-xs border border-purple-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Bot className="w-4 h-4 text-purple-600" />
          <span>Practice Solo with AI Partner</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ChevronLeft,
  Settings,
  User,
  Ban,
  HelpCircle,
  Info,
  ChevronRight,
  Globe,
  Tag,
  Plus,
  X,
  PlayCircle,
  Check,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { MochiiMascot } from './MochiiMascot';
import { AdMobBanner, AdMobInterstitialModal, ADMOB_TEST_IDS } from './AdMobBanner';
import { UserProfile } from '../types';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onReplayOnboarding: () => void;
  onOpenTwoDevices: () => void;
}

const COUNTRIES = [
  'Global',
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'France',
  'Japan',
  'Brazil',
  'Australia',
  'Spain',
  'Italy',
];

const POPULAR_TAGS = ['Gaming', 'Music', 'Anime', 'Tech', 'Movies', 'Chill', 'Travel'];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onReplayOnboarding,
  onOpenTwoDevices,
}) => {
  const [activeSubView, setActiveSubView] = useState<'main' | 'nickname' | 'region' | 'interests' | 'help' | 'about' | 'admob'>('main');
  const [nicknameInput, setNicknameInput] = useState(profile.username);
  const [tagInput, setTagInput] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const [showTestInterstitial, setShowTestInterstitial] = useState(false);

  if (!isOpen) return null;

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (nicknameInput.trim()) {
      onUpdateProfile({ username: nicknameInput.trim() });
      setSavedNotice(true);
      setTimeout(() => {
        setSavedNotice(false);
        setActiveSubView('main');
      }, 800);
    }
  };

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

  const handleResetProfile = () => {
    onUpdateProfile({
      username: 'mochii',
      country: 'Global',
      interests: [],
    });
    setNicknameInput('mochii');
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#120E28] flex flex-col justify-between p-6 sm:p-7 text-white select-none overflow-y-auto animate-in slide-in-from-right duration-250">
      
      {/* Top Bar matching Screen 8: Back arrow < on left, Gear ⚙️ on right */}
      <div className="flex items-center justify-between h-8 shrink-0">
        <button
          onClick={() => {
            if (activeSubView === 'main') {
              onClose();
            } else {
              setActiveSubView('main');
            }
          }}
          className="w-10 h-10 -ml-2 rounded-full hover:bg-white/10 active:scale-95 flex items-center justify-center text-white transition-colors cursor-pointer"
          title="Back"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.4]" />
        </button>

        <button
          onClick={() => setActiveSubView('main')}
          className="w-10 h-10 -mr-2 rounded-full hover:bg-white/10 active:scale-95 flex items-center justify-center text-white transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {activeSubView === 'main' ? (
        <div className="flex-1 flex flex-col justify-between py-4 space-y-6">
          {/* Avatar and Profile Header matching Screen 8 */}
          <div className="flex flex-col items-center text-center space-y-2 pt-2">
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#7F57FF] to-[#5527E6] p-1 shadow-2xl flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#6538F6] flex items-center justify-center overflow-hidden">
                <MochiiMascot variant="happy" size={72} />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white capitalize pt-1">
              {profile.username || 'mochii'}
            </h3>
            <p className="text-xs text-[#A89CD6] font-medium flex items-center gap-1">
              <span>Good vibes only</span>
              <span>✦</span>
            </p>
          </div>

          {/* Settings Items List matching Screen 8 */}
          <div className="space-y-2.5 max-w-sm mx-auto w-full">
            {/* Change Nickname */}
            <button
              onClick={() => setActiveSubView('nickname')}
              className="w-full p-4 rounded-2xl bg-[#1B153D] hover:bg-[#251D52] active:scale-98 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/90">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold text-white">Change Nickname</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </button>

            {/* Region / Country */}
            <button
              onClick={() => setActiveSubView('region')}
              className="w-full p-4 rounded-2xl bg-[#1B153D] hover:bg-[#251D52] active:scale-98 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/90">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold text-white">Region: {profile.country}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </button>

            {/* Topic Chips */}
            <button
              onClick={() => setActiveSubView('interests')}
              className="w-full p-4 rounded-2xl bg-[#1B153D] hover:bg-[#251D52] active:scale-98 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/90">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold text-white">
                  Topic Chips ({profile.interests.length})
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </button>

            {/* Blocked Users */}
            <button
              onClick={() => setActiveSubView('help')}
              className="w-full p-4 rounded-2xl bg-[#1B153D] hover:bg-[#251D52] active:scale-98 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/90">
                  <Ban className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold text-white">Blocked Users</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </button>

            {/* Help & Support */}
            <button
              onClick={() => setActiveSubView('help')}
              className="w-full p-4 rounded-2xl bg-[#1B153D] hover:bg-[#251D52] active:scale-98 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/90">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold text-white">Help & Support</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </button>

            {/* About */}
            <button
              onClick={() => setActiveSubView('about')}
              className="w-full p-4 rounded-2xl bg-[#1B153D] hover:bg-[#251D52] active:scale-98 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/90">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold text-white">About</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </button>

            {/* AdMob & Monetization */}
            <button
              onClick={() => setActiveSubView('admob')}
              className="w-full p-4 rounded-2xl bg-[#1B153D] hover:bg-[#251D52] active:scale-98 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#FBBC04]/20 text-[#FBBC04] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block">AdMob & Monetization</span>
                  <span className="text-[10px] text-[#A89CD6]">Test banner & interstitial ads</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </button>

            {/* Test on Another Device / QR */}
            <button
              onClick={() => {
                onClose();
                onOpenTwoDevices();
              }}
              className="w-full p-4 rounded-2xl bg-[#6538F6]/25 border border-[#6538F6]/50 hover:bg-[#6538F6]/40 active:scale-98 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#6538F6] flex items-center justify-center text-white">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">Test on Another Device</span>
                  <span className="text-[10px] text-[#A89CD6]">QR code & direct links</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
            </button>

            {/* Replay Tutorial */}
            <button
              onClick={() => {
                onClose();
                onReplayOnboarding();
              }}
              className="w-full p-4 rounded-2xl bg-[#1B153D] hover:bg-[#251D52] active:scale-98 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/90">
                  <PlayCircle className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold text-white">Replay Onboarding Guide</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Bottom Action: Log Out / Reset Profile matching Screen 8 */}
          <div className="pt-2 max-w-sm mx-auto w-full">
            <button
              onClick={handleResetProfile}
              className="w-full py-3.5 rounded-full bg-transparent border border-white/20 hover:border-white/50 active:bg-white/10 text-white font-semibold text-sm transition-all cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      ) : activeSubView === 'nickname' ? (
        // Sub-view: Change Nickname
        <div className="flex-1 flex flex-col justify-between py-6 max-w-sm mx-auto w-full space-y-6">
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-white">Change Nickname</h4>
            <p className="text-xs text-[#A89CD6]">
              This name will be shown to people you match with in video calls.
            </p>
            <form onSubmit={handleSaveNickname} className="space-y-4">
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={20}
                placeholder="Enter nickname..."
                className="w-full p-4 rounded-2xl bg-[#1B153D] border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#7F57FF]"
              />
              <button
                type="submit"
                className="w-full py-4 rounded-full bg-white text-[#5D30F0] font-bold text-sm shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {savedNotice ? <Check className="w-4 h-4 text-emerald-600" /> : null}
                <span>{savedNotice ? 'Saved!' : 'Save Nickname'}</span>
              </button>
            </form>
          </div>
          <button
            onClick={() => setActiveSubView('main')}
            className="w-full py-3 text-sm text-white/70 hover:text-white"
          >
            Cancel
          </button>
        </div>
      ) : activeSubView === 'region' ? (
        // Sub-view: Region Selection
        <div className="flex-1 flex flex-col justify-between py-6 max-w-sm mx-auto w-full space-y-4">
          <div className="space-y-3">
            <h4 className="text-xl font-bold text-white">Select Region</h4>
            <p className="text-xs text-[#A89CD6]">
              Matches you with people nearby or worldwide.
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {COUNTRIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onUpdateProfile({ country: c });
                    setActiveSubView('main');
                  }}
                  className={`w-full p-3.5 rounded-2xl text-left text-sm font-semibold flex items-center justify-between transition-colors ${
                    profile.country === c
                      ? 'bg-[#6538F6] text-white'
                      : 'bg-[#1B153D] text-white/90 hover:bg-[#251D52]'
                  }`}
                >
                  <span>{c}</span>
                  {profile.country === c && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : activeSubView === 'interests' ? (
        // Sub-view: Topic Chips
        <div className="flex-1 flex flex-col justify-between py-6 max-w-sm mx-auto w-full space-y-4">
          <div className="space-y-3">
            <h4 className="text-xl font-bold text-white">Topic Chips</h4>
            <p className="text-xs text-[#A89CD6]">
              Add tags to find people who share your passions.
            </p>
            
            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2 min-h-[36px] p-2 rounded-2xl bg-[#1B153D]">
              {profile.interests.length === 0 ? (
                <span className="text-xs text-white/40 italic p-1">No tags added yet</span>
              ) : (
                profile.interests.map((t) => (
                  <span
                    key={t}
                    className="bg-[#6538F6] text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5"
                  >
                    #{t}
                    <button onClick={() => handleRemoveTag(t)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Input Tag */}
            <div className="flex gap-2">
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
                placeholder="Add topic (e.g. music)..."
                className="flex-1 p-3 rounded-2xl bg-[#1B153D] border border-white/20 text-white placeholder-white/40 text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-4 rounded-2xl bg-white text-[#5D30F0] font-bold text-xs"
              >
                Add
              </button>
            </div>

            {/* Popular Tags */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  className="text-xs px-3 py-1 rounded-full bg-[#1B153D] hover:bg-[#251D52] text-white/80"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setActiveSubView('main')}
            className="w-full py-3.5 rounded-full bg-white text-[#5D30F0] font-bold text-sm"
          >
            Done
          </button>
        </div>
      ) : activeSubView === 'admob' ? (
        // Sub-view: Google AdMob Test Ads & Native App Guide
        <div className="flex-1 flex flex-col justify-between py-4 max-w-sm mx-auto w-full space-y-4">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#FBBC04] text-[#202124] text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                  AdMob
                </span>
                <h4 className="text-lg font-bold text-white">Google AdMob Test Ads</h4>
              </div>
              <p className="text-xs text-[#A89CD6]">
                Live Google Mobile Ads test environment with real test unit IDs.
              </p>
            </div>

            {/* Live 320x50 Banner Test Preview */}
            <div className="p-3.5 rounded-2xl bg-[#1B153D] space-y-2.5 border border-white/10">
              <span className="text-xs font-semibold text-white/90">Standard Banner (320×50):</span>
              <AdMobBanner />
              <p className="text-[10px] text-white/50 font-mono">ID: {ADMOB_TEST_IDS.BANNER_ANDROID}</p>
            </div>

            {/* Test Interstitial Ad Button */}
            <div className="p-3.5 rounded-2xl bg-[#1B153D] space-y-2 border border-white/10">
              <span className="text-xs font-semibold text-white/90">Full-Screen Interstitial:</span>
              <p className="text-[11px] text-[#A89CD6]">Displayed between video calls or after skipping.</p>
              <button
                type="button"
                onClick={() => setShowTestInterstitial(true)}
                className="w-full py-2.5 rounded-xl bg-[#6538F6] hover:bg-[#5527E6] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Launch Test Interstitial Ad
              </button>
            </div>

            {/* React Native & Native APK Guide */}
            <div className="p-3.5 rounded-2xl bg-[#1B153D] space-y-2 border border-white/10 text-xs text-white/80">
              <h5 className="font-bold text-white">📱 React Native / Capacitor Setup</h5>
              <p className="text-[11px] text-white/70 leading-relaxed">
                To build a production Android APK with native AdMob SDK:
              </p>
              <code className="block p-2 rounded-lg bg-black/50 text-[10px] text-emerald-300 font-mono">
                npm i @react-native-google-mobile-ads
              </code>
              <p className="text-[10px] text-white/60">
                Or using Capacitor: <span className="text-white/80 font-mono">@capacitor-community/admob</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveSubView('main')}
            className="w-full py-3.5 rounded-full bg-white text-[#5D30F0] font-bold text-sm cursor-pointer"
          >
            Back to Settings
          </button>
        </div>
      ) : (
        // Sub-view: Help / About
        <div className="flex-1 flex flex-col justify-between py-6 max-w-sm mx-auto w-full space-y-4">
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-white">About mochii</h4>
            <div className="p-4 rounded-2xl bg-[#1B153D] space-y-2 text-xs text-white/80 leading-relaxed">
              <p>
                <strong>mochii</strong> is an instant random video chat platform connecting real people around the globe.
              </p>
              <p>
                🔒 All audio and video streams are peer-to-peer encrypted with WebRTC.
              </p>
              <p>
                🛡️ Zero tolerance for harassment or inappropriate conduct.
              </p>
              <p className="text-white/50 pt-2">Version 1.0.0 (Mochii Edition)</p>
            </div>
          </div>
          <button
            onClick={() => setActiveSubView('main')}
            className="w-full py-3.5 rounded-full bg-white text-[#5D30F0] font-bold text-sm cursor-pointer"
          >
            Back to Settings
          </button>
        </div>
      )}

      {/* Interstitial Test Ad Modal */}
      <AdMobInterstitialModal
        isOpen={showTestInterstitial}
        onClose={() => setShowTestInterstitial(false)}
      />

    </div>
  );
};

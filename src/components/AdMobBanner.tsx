import React, { useState } from 'react';
import { X, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';

interface AdMobBannerProps {
  className?: string;
  adUnitId?: string;
  showDismiss?: boolean;
}

// Official Google AdMob Test Ad Unit IDs
export const ADMOB_TEST_IDS = {
  BANNER_ANDROID: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL_ANDROID: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED_ANDROID: 'ca-app-pub-3940256099942544/5224354917',
  BANNER_IOS: 'ca-app-pub-3940256099942544/2934735716',
};

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  className = '',
  adUnitId = ADMOB_TEST_IDS.BANNER_ANDROID,
  showDismiss = true,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div
      className={`relative w-full max-w-[320px] mx-auto h-[50px] bg-[#202124] text-white rounded-lg border border-[#3C4043] flex items-center justify-between px-3 overflow-hidden shadow-lg select-none ${className}`}
      title={`Google AdMob Test Unit: ${adUnitId}`}
    >
      {/* Google Ad Badge */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="bg-[#FBBC04] text-[#202124] text-[9px] font-extrabold px-1 rounded-sm uppercase tracking-wider shrink-0">
          Ad
        </span>
        <div className="flex flex-col min-w-0 leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-white truncate">
              Google AdMob Test
            </span>
            <span className="text-[9px] text-[#9AA0A6] hidden xs:inline truncate">
              320×50
            </span>
          </div>
          <span className="text-[10px] text-[#8AB4F8] truncate">
            Sample Ad: Real Test Ad Unit Active
          </span>
        </div>
      </div>

      {/* Ad Info & Close */}
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span className="text-[9px] text-[#9AA0A6] border border-[#5F6368] rounded px-1 hidden sm:inline">
          Test Mode
        </span>
        {showDismiss && (
          <button
            onClick={() => setIsDismissed(true)}
            className="w-5 h-5 rounded-full hover:bg-white/10 active:scale-90 flex items-center justify-center text-[#9AA0A6] hover:text-white transition-colors cursor-pointer"
            title="Dismiss Ad"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Subtle diagonal test watermark */}
      <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-white/[0.03] pointer-events-none rotate-45" />
    </div>
  );
};

// Full-screen Interstitial Test Ad Modal (e.g., between matches or on skip)
interface AdMobInterstitialModalProps {
  isOpen: boolean;
  onClose: () => void;
  adUnitId?: string;
}

export const AdMobInterstitialModal: React.FC<AdMobInterstitialModalProps> = ({
  isOpen,
  onClose,
  adUnitId = ADMOB_TEST_IDS.INTERSTITIAL_ANDROID,
}) => {
  const [countdown, setCountdown] = React.useState(3);

  React.useEffect(() => {
    let timer: any = null;
    if (isOpen) {
      setCountdown(3);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-6 text-white select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-[#FBBC04] text-[#202124] text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">
            AdMob Interstitial
          </span>
          <span className="text-xs text-white/60">Test Ad</span>
        </div>

        {countdown > 0 ? (
          <span className="text-xs text-white/60 bg-white/10 px-2.5 py-1 rounded-full">
            Skip in {countdown}s
          </span>
        ) : (
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
          >
            <span>Close</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Center Ad Content */}
      <div className="flex flex-col items-center text-center space-y-4 my-auto max-w-xs mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#4285F4] to-[#34A853] p-1 flex items-center justify-center shadow-2xl">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-white">Google Mobile Ads</h3>
          <p className="text-xs text-white/70">
            Ad Unit ID: <br />
            <code className="text-[10px] text-[#8AB4F8] break-all">{adUnitId}</code>
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-sm shadow-lg cursor-pointer"
        >
          Learn More
        </button>
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-[10px] text-white/40">
        Google AdMob Interstitial Test Environment
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Check,
  Copy,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  Code2,
  Terminal,
} from 'lucide-react';
import QRCode from 'qrcode';

interface InstallAndroidModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallPWA: () => void;
}

export const InstallAndroidModal: React.FC<InstallAndroidModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallPWA,
}) => {
  const [activeTab, setActiveTab] = useState<'instant' | 'reactNative'>('instant');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (isOpen && currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 220,
        margin: 2,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
      })
        .then((url) => setQrUrl(url))
        .catch(() => {});
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const expoConfigCode = `// 1. Terminal commands to create your native APK:
npx create-expo-app chatpulse-mobile
cd chatpulse-mobile
npx expo install react-native-webrtc @config-plugins/react-native-webrtc

// 2. Add to app.json plugins:
{
  "expo": {
    "name": "ChatPulse",
    "slug": "chatpulse",
    "android": {
      "package": "com.chatpulse.videochat",
      "permissions": ["CAMERA", "RECORD_AUDIO", "MODIFY_AUDIO_SETTINGS"]
    },
    "plugins": [
      ["@config-plugins/react-native-webrtc"]
    ]
  }
}

// 3. Build standalone APK file directly:
npx eas-cli build -p android --profile preview`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(expoConfigCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-purple-100 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative text-slate-900 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-purple-100 text-purple-700">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Install on Your Android Phone</h3>
              <p className="text-xs text-purple-600 font-medium">Native App Experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-purple-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-purple-50 p-1 rounded-2xl border border-purple-200 mt-4 shrink-0">
          <button
            onClick={() => setActiveTab('instant')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'instant'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-700 hover:text-purple-950'
            }`}
          >
            📱 1-Tap Android Install
          </button>
          <button
            onClick={() => setActiveTab('reactNative')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'reactNative'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-700 hover:text-purple-950'
            }`}
          >
            ⚛️ React Native / APK
          </button>
        </div>

        {/* Body content */}
        <div className="overflow-y-auto py-4 space-y-4 text-xs flex-1">
          {activeTab === 'instant' ? (
            <div className="space-y-4">
              
              {/* Highlight card */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-purple-950">Install without App Store</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Ready Now
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Android supports installing this app as a standalone WebAPK. It gives you an app icon on your home screen, launches in full screen with no browser bars, and accesses your camera & mic natively!
                </p>

                {deferredPrompt ? (
                  <button
                    onClick={onInstallPWA}
                    className="w-full mt-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install App on this Device</span>
                  </button>
                ) : null}
              </div>

              {/* QR Code to open on phone */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-2xl bg-white border border-purple-100 shadow-2xs">
                <div className="p-1.5 bg-white border border-purple-200 rounded-xl shrink-0 shadow-xs">
                  {qrUrl ? (
                    <img src={qrUrl} alt="Scan to install on phone" className="w-28 h-28 rounded-lg" />
                  ) : null}
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h4 className="font-bold text-xs text-slate-900">Scan on your Android Phone:</h4>
                  <ol className="list-decimal pl-4 text-[11px] text-slate-600 space-y-1">
                    <li>Scan this QR code with your phone camera.</li>
                    <li>In Chrome, tap the <strong>⋮ menu</strong> at top right.</li>
                    <li>Tap <strong>"Install app"</strong> (or "Add to Home screen").</li>
                  </ol>
                </div>
              </div>

              {/* Copy link */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 bg-purple-50/40 border border-purple-200 rounded-xl px-3 py-2 text-[11px] text-slate-700 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

            </div>
          ) : (
            <div className="space-y-3.5">
              {/* GitHub Actions Highlight Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-purple-950">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>GitHub Actions Automated APK</span>
                  </div>
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
                    On Push to main
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Every time you push code to the <code className="bg-purple-100 px-1 py-0.5 rounded text-purple-900 font-semibold">main</code> branch, GitHub Actions will automatically compile the native Android code and produce an installable <strong>.apk</strong> artifact!
                </p>

                <div className="p-2.5 bg-white rounded-xl border border-purple-100 space-y-1.5 text-[11px] text-slate-700">
                  <span className="font-bold text-purple-950">How to get your APK on GitHub:</span>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                    <li>Push code to the <code className="text-purple-700 font-mono">main</code> branch.</li>
                    <li>Go to your GitHub repo &rarr; click the <strong>Actions</strong> tab.</li>
                    <li>Click the latest <strong>"Build Android APK"</strong> run.</li>
                    <li>Under <strong>Artifacts</strong>, download <strong className="text-purple-700">ChatPulse-Android-APK</strong>!</li>
                  </ol>
                </div>
              </div>

              {/* Local CLI & EAS alternative */}
              <div className="relative">
                <div className="flex items-center justify-between bg-slate-900 text-slate-200 px-3 py-2 rounded-t-xl text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-purple-300">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Manual / Local Build Commands</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-purple-300 px-2 py-0.5 rounded transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-slate-300 rounded-b-xl text-[10px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
                  {expoConfigCode}
                </pre>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-200 text-[11px] text-slate-600">
                📁 <strong>Workflow file:</strong> <code className="text-purple-700 font-mono">.github/workflows/build-android-apk.yml</code>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer shrink-0"
        >
          Close
        </button>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Check,
  Copy,
  X,
  Globe,
  Server,
  Cloud,
  Terminal,
  ExternalLink,
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
  const [activeTab, setActiveTab] = useState<'instant' | 'hosting' | 'reactNative'>('hosting');
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

  const expoConfigCode = `# 1. Push code to your GitHub repo's main branch:
git add .
git commit -m "Build Android APK"
git push origin main

# 2. GitHub Actions will automatically run:
# .github/workflows/build-android-apk.yml

# 3. Download ChatPulse-Android-APK from the Actions tab on GitHub!`;

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
      <div className="bg-[#FEF7FF] border border-[#CAC4D0]/60 rounded-[28px] max-w-lg w-full p-5 sm:p-6 shadow-2xl relative text-[#1D1B20] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#CAC4D0]/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[14px] bg-[#EADDFF] flex items-center justify-center text-[#21005D]">
              <Globe className="w-5 h-5 text-[#6750A4]" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#1D1B20]">Website & App Hosting</h3>
              <p className="text-xs text-[#49454F] font-medium">Free hosting options & direct access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full text-[#49454F] hover:bg-[#1D1B20]/8 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Material 3 Segmented Buttons / Tab Switcher */}
        <div className="flex bg-[#ECE6F0] p-1 rounded-full border border-[#CAC4D0]/50 mt-4 shrink-0 gap-1">
          <button
            onClick={() => setActiveTab('hosting')}
            className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              activeTab === 'hosting'
                ? 'bg-[#6750A4] text-white shadow-xs'
                : 'text-[#49454F] hover:text-[#1D1B20]'
            }`}
          >
            🌐 Free Web Hosting
          </button>
          <button
            onClick={() => setActiveTab('instant')}
            className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              activeTab === 'instant'
                ? 'bg-[#6750A4] text-white shadow-xs'
                : 'text-[#49454F] hover:text-[#1D1B20]'
            }`}
          >
            📱 Phone Install
          </button>
          <button
            onClick={() => setActiveTab('reactNative')}
            className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              activeTab === 'reactNative'
                ? 'bg-[#6750A4] text-white shadow-xs'
                : 'text-[#49454F] hover:text-[#1D1B20]'
            }`}
          >
            ⚛️ Native APK
          </button>
        </div>

        {/* Body content */}
        <div className="overflow-y-auto py-4 space-y-4 text-xs flex-1">
          {activeTab === 'hosting' ? (
            <div className="space-y-4">
              
              {/* Option 1: Right Here (Already Live for Free!) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 border-2 border-purple-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-purple-950">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Hosted Right Here (Already Live & Free!)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Active 24/7
                  </span>
                </div>
                
                <p className="text-slate-600 text-xs leading-relaxed">
                  Your website is <strong>already hosted for free on Google Cloud Run</strong> with full HTTPS, camera/mic permissions, and real-time WebSockets enabled. You can share this link with anyone right now:
                </p>

                {/* Direct Link Box */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Deploying to Other Free Hosts */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs text-purple-950">Other Free Hosting Platforms:</h4>

                <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white border border-purple-200 text-purple-700 shrink-0">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">Render.com (Free Tier)</span>
                      <span className="text-[10px] text-purple-700 font-semibold">1-Click deploy</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Connect your GitHub repo to Render &rarr; select <strong>Web Service</strong>. We’ve included a pre-configured <code className="bg-purple-100 px-1 rounded text-purple-900 font-mono">render.yaml</code> for automatic free setup!
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white border border-purple-200 text-purple-700 shrink-0">
                    <Server className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">Railway / Fly.io / Koyeb</span>
                      <span className="text-[10px] text-purple-700 font-semibold">Free Docker tier</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      We’ve added a production <code className="bg-purple-100 px-1 rounded text-purple-900 font-mono">Dockerfile</code> in the repository. Connect your repo and it builds both frontend & backend automatically.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ) : activeTab === 'instant' ? (
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
                  Android and iOS support installing this website directly to your home screen as a standalone app with full camera and microphone access!
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
                  <h4 className="font-bold text-xs text-slate-900">Scan on your Phone:</h4>
                  <ol className="list-decimal pl-4 text-[11px] text-slate-600 space-y-1">
                    <li>Scan this QR code with your phone camera.</li>
                    <li>In Chrome/Safari, tap the <strong>Menu / Share</strong> icon.</li>
                    <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.</li>
                  </ol>
                </div>
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
                  Every time you push code to your <code className="bg-purple-100 px-1 py-0.5 rounded text-purple-900 font-semibold">main</code> branch on GitHub, GitHub Actions compiles the native Android code and generates an installable <strong>.apk</strong> artifact!
                </p>

                <div className="p-2.5 bg-white rounded-xl border border-purple-100 space-y-1.5 text-[11px] text-slate-700">
                  <span className="font-bold text-purple-950">Where to find your APK on GitHub:</span>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                    <li>Go to your repo on GitHub &rarr; click the <strong>Actions</strong> tab.</li>
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
                    <span>Git Push Commands</span>
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
          className="w-full h-11 rounded-full bg-[#6750A4] hover:bg-[#594291] text-white font-semibold text-xs shadow-md shadow-[#6750A4]/25 transition-all active:scale-98 cursor-pointer shrink-0"
        >
          Close
        </button>

      </div>
    </div>
  );
};

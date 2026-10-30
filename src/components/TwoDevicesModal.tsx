import React, { useState, useEffect } from 'react';
import { Smartphone, QrCode, Copy, Check, X, ExternalLink, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';

interface TwoDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onlineCount: number;
  waitingCount: number;
}

const SHARED_URL = 'https://ais-pre-ollmggw5fqklgkr5otu3h2-808300536981.europe-west2.run.app';
const DEV_URL = 'https://ais-dev-ollmggw5fqklgkr5otu3h2-808300536981.europe-west2.run.app';

export const TwoDevicesModal: React.FC<TwoDevicesModalProps> = ({
  isOpen,
  onClose,
  onlineCount,
}) => {
  const [selectedUrlType, setSelectedUrlType] = useState<'shared' | 'dev'>('shared');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const activeUrl = selectedUrlType === 'shared' ? SHARED_URL : DEV_URL;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(activeUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#120E28',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [isOpen, activeUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#120E28] border border-white/20 rounded-3xl max-w-sm w-full p-5 shadow-2xl relative text-white max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#6538F6] text-white shadow-md shadow-[#6538F6]/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Test on Another Device</h3>
              <p className="text-[11px] text-[#A89CD6]">Instant WebRTC Match</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* URL Mode Switcher */}
        <div className="flex bg-[#1B153D] p-1 rounded-2xl my-3 text-xs">
          <button
            onClick={() => setSelectedUrlType('shared')}
            className={`flex-1 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              selectedUrlType === 'shared'
                ? 'bg-[#6538F6] text-white shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Shared Link
          </button>
          <button
            onClick={() => setSelectedUrlType('dev')}
            className={`flex-1 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              selectedUrlType === 'dev'
                ? 'bg-[#6538F6] text-white shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Direct Dev Link
          </button>
        </div>

        {/* QR Code and Quick Scan */}
        <div className="space-y-3">
          <div className="flex flex-col items-center p-4 rounded-2xl bg-[#1B153D] border border-white/10">
            <div className="p-2.5 bg-white rounded-2xl shadow-xl mb-2.5">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Scan QR code" className="w-36 h-36 rounded-xl" />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-[#6538F6]">
                  <QrCode className="w-10 h-10 animate-pulse" />
                </div>
              )}
            </div>
            <p className="text-xs text-center font-medium text-white/90">
              Point your phone camera at this QR code
            </p>
          </div>

          {/* Copy link input bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={activeUrl}
              className="flex-1 bg-[#1B153D] border border-white/15 rounded-xl px-3 py-2 text-[11px] text-[#CBBEE8] font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-white text-[#5D30F0] text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 shadow-md"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Troubleshooting Notice for "Not opening on other side" */}
          <div className="p-3 rounded-2xl bg-[#1B153D]/80 border border-amber-500/30 text-[11px] space-y-1.5 text-amber-200">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>If the link shows an error or sign-in:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-white/80">
              <li>
                <strong>Google Account Sign-In</strong>: Ensure the other device is logged in with your account (<strong>ashelchibvaz@gmail.com</strong>), as AI Studio projects require access authorization.
              </li>
              <li>
                <strong>Try the Direct Dev Link</strong>: Switch to the &quot;Direct Dev Link&quot; tab above if the shared link doesn&apos;t load.
              </li>
              <li>
                <strong>Or test in a 2nd Browser Tab / Incognito</strong>: You can test right on your computer in another tab or window!
              </li>
            </ul>
          </div>
        </div>

        {/* Done / Close Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-full bg-white text-[#5D30F0] font-bold text-xs shadow-xl active:scale-95 transition-all cursor-pointer"
        >
          Got it
        </button>

      </div>
    </div>
  );
};

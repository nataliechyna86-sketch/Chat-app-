import React, { useState, useEffect } from 'react';
import { Smartphone, QrCode, Copy, Check, X, Radio } from 'lucide-react';
import QRCode from 'qrcode';

interface TwoDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onlineCount: number;
  waitingCount: number;
}

export const TwoDevicesModal: React.FC<TwoDevicesModalProps> = ({
  isOpen,
  onClose,
  onlineCount,
  waitingCount,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (isOpen && currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code error:', err));
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-purple-100 rounded-3xl max-w-sm w-full p-5 shadow-2xl relative text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Test on 2 Devices</h3>
              <p className="text-[11px] text-purple-600 font-medium">Real Live WebRTC Video</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-purple-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code and Quick Scan */}
        <div className="space-y-3 pt-3">
          <div className="flex flex-col items-center p-3 rounded-2xl bg-purple-50/60 border border-purple-200">
            <div className="p-2 bg-white rounded-2xl border border-purple-200 shadow-sm mb-2">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Scan QR code" className="w-36 h-36 rounded-xl" />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-purple-400">
                  <QrCode className="w-8 h-8 animate-pulse" />
                </div>
              )}
            </div>
            <p className="text-xs text-center font-medium text-purple-950">
              Scan with your phone camera to open instantly
            </p>
          </div>

          {/* Copy link */}
          <div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2 text-[11px] text-slate-700 font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="p-2.5 rounded-2xl bg-purple-50/40 border border-purple-100 text-[11px] text-slate-600 space-y-1">
            <p className="font-semibold text-purple-950">Quick steps:</p>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>Open on your phone or in a 2nd window.</li>
              <li>Allow camera & mic permissions.</li>
              <li>Click <strong>Start Video Chat</strong> on both devices.</li>
              <li>Enjoy real 2-way WebRTC video & chat!</li>
            </ol>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
        >
          Got it
        </button>

      </div>
    </div>
  );
};

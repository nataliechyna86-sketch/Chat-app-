import React from 'react';
import { ShieldCheck, X, AlertTriangle, EyeOff, Lock } from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-purple-100 rounded-3xl max-w-sm w-full p-5 shadow-2xl relative text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-base text-slate-900">Safety & Rules</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-purple-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 py-3 text-xs text-slate-600">
          <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-purple-50/60 border border-purple-100">
            <Lock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-slate-900 mb-0.5">Encrypted P2P Video</h5>
              <p className="text-[11px] leading-relaxed">
                Your video streams directly between you and your partner using WebRTC.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-purple-50/60 border border-purple-100">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-slate-900 mb-0.5">Zero Tolerance</h5>
              <p className="text-[11px] leading-relaxed">
                Nudity, harassment, and hate speech result in instant bans.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-purple-50/60 border border-purple-100">
            <EyeOff className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-slate-900 mb-0.5">Stay Private</h5>
              <p className="text-[11px] leading-relaxed">
                Never share personal numbers, addresses, or private info with strangers.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer"
        >
          Got it
        </button>

      </div>
    </div>
  );
};

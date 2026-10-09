import React from 'react';
import { X, Sparkles, FlipHorizontal } from 'lucide-react';
import { VideoFilter, FaceOverlay } from '../types';

interface EffectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  filter: VideoFilter;
  onSelectFilter: (filter: VideoFilter) => void;
  overlay: FaceOverlay;
  onSelectOverlay: (overlay: FaceOverlay) => void;
  mirrorLocal: boolean;
  onToggleMirror: () => void;
}

const FILTERS: { id: VideoFilter; label: string; preview: string }[] = [
  { id: 'none', label: 'Natural', preview: 'bg-purple-100' },
  { id: 'warm', label: 'Warm', preview: 'bg-amber-400' },
  { id: 'cyberpunk', label: 'Cyber', preview: 'bg-purple-500' },
  { id: 'noir', label: 'Noir', preview: 'bg-slate-700' },
  { id: 'vintage', label: 'Vintage', preview: 'bg-orange-300' },
  { id: 'glow', label: 'Soft Aura', preview: 'bg-indigo-400' },
  { id: 'blur', label: 'Blur', preview: 'bg-purple-200 backdrop-blur' },
];

const OVERLAYS: { id: FaceOverlay; label: string; icon: string }[] = [
  { id: 'none', label: 'None', icon: '🚫' },
  { id: 'sunglasses', label: 'Glasses', icon: '🕶️' },
  { id: 'party_hat', label: 'Party', icon: '🥳' },
  { id: 'mustache', label: 'Stache', icon: '🥸' },
  { id: 'cat_ears', label: 'Cat', icon: '🐱' },
  { id: 'crown', label: 'Crown', icon: '👑' },
];

export const EffectsModal: React.FC<EffectsModalProps> = ({
  isOpen,
  onClose,
  filter,
  onSelectFilter,
  overlay,
  onSelectOverlay,
  mirrorLocal,
  onToggleMirror,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-purple-100 rounded-3xl max-w-sm w-full p-5 shadow-2xl relative text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-base text-slate-900">Filters & Stickers</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-purple-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 pt-3 text-xs">
          {/* Filters */}
          <div>
            <label className="text-[11px] font-semibold text-purple-950 block mb-2">
              Color Filter
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectFilter(item.id)}
                  className={`p-2 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    filter === item.id
                      ? 'bg-purple-100 border-purple-500 font-bold text-purple-900 shadow-xs'
                      : 'bg-purple-50/50 border-purple-200 text-slate-600 hover:bg-purple-100/50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg ${item.preview} shadow-xs`} />
                  <span className="text-[10px] truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stickers */}
          <div>
            <label className="text-[11px] font-semibold text-purple-950 block mb-2">
              Face Stickers
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {OVERLAYS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectOverlay(item.id)}
                  className={`p-2 rounded-2xl border flex items-center justify-center gap-1.5 transition-all ${
                    overlay === item.id
                      ? 'bg-purple-100 border-purple-500 font-bold text-purple-900 shadow-xs'
                      : 'bg-purple-50/50 border-purple-200 text-slate-600 hover:bg-purple-100/50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-[11px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mirror Toggle */}
          <div className="pt-2 border-t border-purple-100">
            <button
              onClick={onToggleMirror}
              className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                mirrorLocal
                  ? 'bg-purple-100 border-purple-400 text-purple-800'
                  : 'bg-purple-50/50 border-purple-200 text-slate-600'
              }`}
            >
              <FlipHorizontal className="w-4 h-4 text-purple-600" />
              <span>{mirrorLocal ? 'Camera Mirrored (ON)' : 'Natural View (OFF)'}</span>
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all"
        >
          Done
        </button>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Flag, X, ShieldAlert, Check } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (reason: string) => void;
  partnerName: string;
}

const REPORT_REASONS = [
  'Inappropriate or offensive behavior',
  'Explicit content / Nudity',
  'Harassment or hate speech',
  'Spam or bot advertising',
  'Other violation',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  partnerName,
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmitReport(selectedReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-purple-100 rounded-3xl max-w-sm w-full p-4 sm:p-5 shadow-2xl relative text-slate-900 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-100">
          <div className="flex items-center gap-2 text-rose-500">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900">Report & Skip</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-purple-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-3 space-y-3">
          <p className="text-xs text-slate-600">
            Reporting <strong className="text-slate-900">{partnerName}</strong> will immediately disconnect the call and find you a new partner.
          </p>

          <div className="space-y-1.5">
            {REPORT_REASONS.map((reason) => (
              <label
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                  selectedReason === reason
                    ? 'bg-rose-50 border-rose-300 text-rose-800 font-medium'
                    : 'bg-purple-50/40 border-purple-100 text-slate-700 hover:bg-purple-50'
                }`}
              >
                <span>{reason}</span>
                {selectedReason === reason && <Check className="w-3.5 h-3.5 text-rose-500" />}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-purple-100">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Confirm & Skip</span>
          </button>
        </div>

      </div>
    </div>
  );
};

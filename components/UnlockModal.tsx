import React from 'react';
import { X, Lock, PlayCircle, Crown } from 'lucide-react';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSingle: () => void;
  onUnlockPremium: () => void;
}

const UnlockModal: React.FC<UnlockModalProps> = ({ isOpen, onClose, onUnlockSingle, onUnlockPremium }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-naksir-card border border-naksir-purple rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.2)]">
        
        {/* Header */}
        <div className="p-6 pb-0 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Unlock Prediction</h2>
            <p className="text-gray-400 text-sm">Reveal the AI confidence and winner.</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Ad Option */}
          <button 
            onClick={onUnlockSingle}
            className="w-full group relative flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all hover:border-naksir-purple/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <PlayCircle className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white">Watch Ad</div>
                <div className="text-xs text-gray-400">Unlock this match only</div>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 group-hover:underline">Free</span>
          </button>

          {/* Premium Option */}
          <button 
            onClick={onUnlockPremium}
            className="w-full group relative flex items-center justify-between p-4 bg-gradient-to-r from-naksir-purple/20 to-naksir-neon/20 border border-naksir-purple/30 rounded-xl hover:border-naksir-purple transition-all"
          >
            <div className="absolute inset-0 bg-naksir-purple/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-naksir-purple/20 flex items-center justify-center text-naksir-neon">
                <Crown className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white">Naksir Premium</div>
                <div className="text-xs text-gray-300">Unlock ALL predictions forever</div>
              </div>
            </div>
            <span className="relative text-lg font-bold text-white">$9.99</span>
          </button>

        </div>
        
        <div className="bg-black/40 p-4 text-center">
            <p className="text-xs text-gray-500">Secure payment via Stripe. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
};

export default UnlockModal;
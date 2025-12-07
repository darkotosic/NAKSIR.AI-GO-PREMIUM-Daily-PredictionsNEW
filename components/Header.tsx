import React from 'react';
import { Menu, Zap } from 'lucide-react';

interface HeaderProps {
  isPremium: boolean;
  onUnlockPremium: () => void;
}

const Header: React.FC<HeaderProps> = ({ isPremium, onUnlockPremium }) => {
  return (
    <header className="sticky top-0 z-50 bg-naksir-black/80 backdrop-blur-md border-b border-naksir-card h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Zap className="text-naksir-purple fill-naksir-neon w-6 h-6 animate-pulse-slow" />
        <span className="text-2xl font-black tracking-tighter text-white">
          NAKSIR<span className="text-naksir-purple">.AI</span>
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        {!isPremium && (
          <button 
            onClick={onUnlockPremium}
            className="hidden sm:block px-4 py-1.5 rounded-full bg-gradient-to-r from-naksir-purple to-naksir-neon text-white text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all"
          >
            GO PREMIUM
          </button>
        )}
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
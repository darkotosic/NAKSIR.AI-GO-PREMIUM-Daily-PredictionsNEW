import React, { useState } from 'react';
import { FullPredictionData, PredictionType } from '../types';
import { Lock, Cpu, TrendingDown, TrendingUp, Minus, BrainCircuit, ChevronDown, ChevronUp, Activity, Trophy, Shield, Target, Goal } from 'lucide-react';

interface PredictionCardProps {
  data: FullPredictionData;
  isUnlocked: boolean;
  onUnlockClick: () => void;
  onAnalyzeClick: () => void;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ 
  data, 
  isUnlocked, 
  onUnlockClick,
  onAnalyzeClick 
}) => {
  const { homeTeam, awayTeam, league, kickoff, prediction, xG_home, xG_away, shotsOnTarget_home, shotsOnTarget_away, oddsTrend } = data;
  const [showStats, setShowStats] = useState(false);
  
  // Force CET Timezone Display
  const date = new Date(kickoff);
  const timeString = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris'
  }).format(date);

  // Calculate a mock "AI Power" based on confidence for visual bar
  const confidenceColor = prediction.confidence > 80 ? 'bg-green-500' : prediction.confidence > 65 ? 'bg-yellow-500' : 'bg-red-500';

  // Helper for Odds Trend Details
  const getTrendDetails = (trend: string) => {
    switch (trend) {
      case 'Dropping': return { text: 'Odds Dropping', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20', icon: <TrendingDown size={12} className="text-green-400"/> };
      case 'Drifting': return { text: 'Odds Drifting', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', icon: <TrendingUp size={12} className="text-red-400"/> };
      default: return { text: 'Odds Stable', color: 'text-gray-400', bg: 'bg-white/5 border-white/10', icon: <Minus size={12} className="text-gray-400"/> };
    }
  };

  const trendInfo = getTrendDetails(oddsTrend);

  // Helper for stat bars calculation
  const getBarWidths = (val1: number, val2: number) => {
    const total = val1 + val2;
    if (total === 0) return { w1: '50%', w2: '50%' };
    return {
        w1: `${(val1 / total) * 100}%`,
        w2: `${(val2 / total) * 100}%`
    };
  };

  const xGWidths = getBarWidths(xG_home, xG_away);
  const sotWidths = getBarWidths(shotsOnTarget_home, shotsOnTarget_away);

  // Helper for Prediction Type Icon
  const getPredictionIcon = (type: PredictionType) => {
    switch (type) {
        case PredictionType.MATCH_WINNER: return <Trophy size={14} className="text-naksir-purple" />;
        case PredictionType.DOUBLE_CHANCE: return <Shield size={14} className="text-blue-400" />;
        case PredictionType.CORRECT_SCORE: return <Target size={14} className="text-naksir-neon" />;
        case PredictionType.GOALS_OVER_2_5: return <Goal size={14} className="text-green-400" />;
        case PredictionType.BTTS: return <Activity size={14} className="text-yellow-400" />;
        default: return <Trophy size={14} className="text-naksir-purple" />;
    }
  };

  return (
    <div className="relative w-full bg-[#0e0e0e] border border-white/5 rounded-xl overflow-hidden mb-4 hover:border-naksir-purple/30 transition-all duration-300">
      
      {/* League Header */}
      <div className="px-4 py-2 bg-white/5 flex justify-between items-center text-xs font-medium text-gray-400">
        <span className="uppercase tracking-wider">{league}</span>
        <span>{timeString} CET</span>
      </div>

      {/* Teams Section */}
      <div className="p-5 grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
        {/* Home */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden p-1 border border-white/10">
            <img src={homeTeam.logo} alt={homeTeam.name} className="w-full h-full object-cover rounded-full opacity-80" />
          </div>
          <span className="text-sm font-bold text-white leading-tight">{homeTeam.name}</span>
          <span className="text-[10px] text-gray-500 tracking-widest">{homeTeam.form}</span>
        </div>

        {/* VS / Score Context */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl font-black text-white/20 italic">VS</span>
          {/* Stats Row */}
          <div className="flex flex-col gap-1 w-full min-w-[80px]">
            <div className="flex justify-between text-[9px] text-gray-500 font-mono border-b border-white/5 pb-1">
                 <span>{xG_home}</span>
                 <span className="text-gray-700">xG</span>
                 <span>{xG_away}</span>
            </div>
            <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                 <span>{shotsOnTarget_home}</span>
                 <span className="text-gray-700">SoT</span>
                 <span>{shotsOnTarget_away}</span>
            </div>
          </div>

          {/* Market Trend - Always Visible */}
           <div className={`mt-1 flex items-center gap-1 px-1.5 py-0.5 rounded border ${trendInfo.bg}`}>
               {trendInfo.icon}
               <span className={`text-[8px] font-bold uppercase tracking-wide ${trendInfo.color}`}>{trendInfo.text}</span>
           </div>
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden p-1 border border-white/10">
            <img src={awayTeam.logo} alt={awayTeam.name} className="w-full h-full object-cover rounded-full opacity-80" />
          </div>
          <span className="text-sm font-bold text-white leading-tight">{awayTeam.name}</span>
          <span className="text-[10px] text-gray-500 tracking-widest">{awayTeam.form}</span>
        </div>
      </div>

      {/* Prediction / Locked State */}
      <div className="relative px-4 pb-4">
        {isUnlocked ? (
          <div className="space-y-3">
            {/* The Prediction */}
            <div className="bg-naksir-purple/10 border border-naksir-purple/30 rounded-lg p-3 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                    {getPredictionIcon(prediction.type)}
                    <span className="text-xs text-naksir-purple uppercase font-bold">{prediction.type}</span>
                </div>
                <p className="text-lg font-bold text-white">{prediction.value}</p>
              </div>
              <div className="text-right flex flex-col items-end justify-center">
                <p className="text-xl font-mono text-naksir-neon font-bold leading-none">{prediction.odds.toFixed(2)}</p>
                <p className="text-[10px] text-gray-500 mt-1">Market Odds</p>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Cpu size={12}/> AI Confidence</span>
                    <span>{prediction.confidence}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${confidenceColor}`} 
                        style={{ width: `${prediction.confidence}%` }} 
                    />
                </div>
            </div>

            {/* Actions */}
            <button 
                onClick={onAnalyzeClick}
                className="w-full py-2 mt-2 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-gray-300 flex items-center justify-center gap-2 transition-colors"
            >
                <BrainCircuit size={14} className="text-naksir-purple"/> View Gemini Analysis
            </button>
          </div>
        ) : (
          <div className="relative bg-white/5 border border-white/5 rounded-lg p-6 flex flex-col items-center justify-center text-center gap-3 overflow-hidden group cursor-pointer" onClick={onUnlockClick}>
             {/* Gradient overlay for Locked state */}
             <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/50 to-black/80 z-0"></div>
             
             <div className="relative z-10 p-3 rounded-full bg-white/5 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300">
                <Lock className="w-6 h-6 text-naksir-purple" />
             </div>
             <div className="relative z-10">
                <p className="text-sm font-bold text-white mb-1">High Confidence Pick</p>
                <p className="text-xs text-gray-400">Tap to unlock this prediction</p>
             </div>
          </div>
        )}
      </div>

      {/* Stats Toggle Section */}
      <div className="border-t border-white/5">
        <button 
          onClick={() => setShowStats(!showStats)}
          className="w-full py-2 bg-black/20 hover:bg-black/40 text-[10px] uppercase font-bold tracking-wider text-gray-500 hover:text-gray-300 flex items-center justify-center gap-2 transition-colors"
        >
            <Activity size={12} />
            {showStats ? 'Hide Stats' : 'Match Stats'}
            {showStats ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        
        <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-black/40 ${showStats ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 space-y-4">
                
                {/* xG Comparison */}
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-gray-400 font-bold">{xG_home}</span>
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Expected Goals (xG)</span>
                        <span className="text-[10px] text-gray-400 font-bold">{xG_away}</span>
                    </div>
                    <div className="flex h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="bg-naksir-purple" style={{ width: xGWidths.w1 }}></div>
                        <div className="bg-naksir-neon" style={{ width: xGWidths.w2 }}></div>
                    </div>
                </div>

                {/* Shots on Target Comparison */}
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-gray-400 font-bold">{shotsOnTarget_home}</span>
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Shots on Target</span>
                        <span className="text-[10px] text-gray-400 font-bold">{shotsOnTarget_away}</span>
                    </div>
                    <div className="flex h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="bg-blue-500" style={{ width: sotWidths.w1 }}></div>
                        <div className="bg-red-500" style={{ width: sotWidths.w2 }}></div>
                    </div>
                </div>

                <div className="text-[9px] text-gray-600 text-center italic mt-2">
                    *Stats derived from recent form & market movements
                </div>

            </div>
        </div>
      </div>

    </div>
  );
};

export default PredictionCard;
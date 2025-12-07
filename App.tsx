import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PredictionCard from './components/PredictionCard';
import UnlockModal from './components/UnlockModal';
import { FullPredictionData } from './types';
import { generateGeminiAnalysis } from './services/geminiService';
import { fetchTodaysMatches, fetchMatchIntelligence } from './services/apiFootballService';
import { Loader2, Sparkles, RefreshCcw, ShieldCheck, BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  const [predictions, setPredictions] = useState<FullPredictionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState<string>('Ingesting fixtures...');
  const [unlockedMatches, setUnlockedMatches] = useState<Set<string>>(new Set());
  const [isPremium, setIsPremium] = useState<boolean>(false);
  
  // Unlock Modal State
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [selectedMatchIdForUnlock, setSelectedMatchIdForUnlock] = useState<string | null>(null);

  // Analysis Modal State
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisContent, setAnalysisContent] = useState<string>('');
  const [analyzingMatch, setAnalyzingMatch] = useState<FullPredictionData | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // Filter State
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Initial Data Load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setLoadingStep('Fetching today\'s fixtures from API-Football...');
    
    // Simulate steps for UX
    setTimeout(() => setLoadingStep('Processing allowed leagues...'), 800);
    setTimeout(() => setLoadingStep('Syncing live odds...'), 1600);

    const data = await fetchTodaysMatches();
    setPredictions(data);
    setLoading(false);
  };

  // Actions
  const handleUnlockClick = (matchId: string) => {
    setSelectedMatchIdForUnlock(matchId);
    setUnlockModalOpen(true);
  };

  const handleUnlockSingle = () => {
    if (selectedMatchIdForUnlock) {
      setUnlockedMatches(prev => new Set(prev).add(selectedMatchIdForUnlock));
      setUnlockModalOpen(false);
      setSelectedMatchIdForUnlock(null);
    }
  };

  const handleUnlockPremium = () => {
    setIsPremium(true);
    setUnlockModalOpen(false);
    setSelectedMatchIdForUnlock(null);
  };

  const handleAnalyzeClick = async (match: FullPredictionData) => {
    setAnalyzingMatch(match);
    setAnalysisOpen(true);
    setIsLoadingAnalysis(true);
    setAnalysisContent(''); 

    // 1. Fetch Deep Data (H2H, Injuries, Form)
    const intel = await fetchMatchIntelligence(match.id);
    
    if (intel) {
         // 2. Generate Gemini Analysis
         const analysisText = await generateGeminiAnalysis(match, intel);
         setAnalysisContent(analysisText);
    } else {
        setAnalysisContent("Detailed match data is currently unavailable for AI processing.");
    }
    
    setIsLoadingAnalysis(false);
  };

  // Filter Logic
  const filteredPredictions = activeFilter === 'ALL' 
    ? predictions 
    : predictions.filter(p => p.league === activeFilter);

  // Get unique leagues for filter
  const leagues = Array.from(new Set(predictions.map(p => p.league)));

  return (
    <div className="min-h-screen pb-20 bg-naksir-black text-white font-sans selection:bg-naksir-purple selection:text-white">
      
      <Header isPremium={isPremium} onUnlockPremium={() => setUnlockModalOpen(true)} />

      <main className="max-w-md mx-auto px-4 pt-6">
        
        {/* Intro/Hero */}
        <div className="mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black mb-2 tracking-tight">Daily Predictions</h1>
                <p className="text-gray-400 text-xs uppercase tracking-widest">Powered by Gemini 2.5 & API-Football</p>
            </div>
            <button 
                onClick={loadData}
                disabled={loading}
                className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
            >
                <RefreshCcw className={`w-5 h-5 text-naksir-purple ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>

        {/* Loading State */}
        {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-naksir-neon animate-spin" />
                <p className="text-sm text-gray-400 animate-pulse font-mono">{loadingStep}</p>
            </div>
        )}

        {/* Content */}
        {!loading && (
            <>
                {/* Filters */}
                {leagues.length > 0 && (
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                        <button 
                            onClick={() => setActiveFilter('ALL')}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeFilter === 'ALL' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50'}`}
                        >
                            All
                        </button>
                        {leagues.map(league => (
                            <button 
                                key={league}
                                onClick={() => setActiveFilter(league)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeFilter === league ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50'}`}
                            >
                                {league}
                            </button>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {predictions.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-xl px-6">
                        <ShieldCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-300 font-bold">No Matches Found</p>
                        <p className="text-xs text-gray-500 mt-2">No matches from the allowed leagues are scheduled for today.</p>
                    </div>
                )}

                {/* Predictions List */}
                <div className="space-y-4">
                {filteredPredictions.map((match) => {
                    const isUnlocked = isPremium || !match.prediction.isLocked || unlockedMatches.has(match.id);
                    return (
                    <PredictionCard 
                        key={match.id} 
                        data={match} 
                        isUnlocked={isUnlocked}
                        onUnlockClick={() => handleUnlockClick(match.id)}
                        onAnalyzeClick={() => handleAnalyzeClick(match)}
                    />
                    );
                })}
                </div>
            </>
        )}
      </main>

      {/* Unlock Modal */}
      <UnlockModal 
        isOpen={unlockModalOpen} 
        onClose={() => setUnlockModalOpen(false)}
        onUnlockSingle={handleUnlockSingle}
        onUnlockPremium={handleUnlockPremium}
      />

      {/* AI Analysis Modal */}
      {analysisOpen && analyzingMatch && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center pointer-events-none">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" 
            onClick={() => setAnalysisOpen(false)}
          />
          
          <div className="relative w-full max-w-lg bg-[#111] border-t sm:border border-white/10 sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col animate-[slideUp_0.3s_ease-out]">
            
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-2">
                    <BrainCircuit className="w-5 h-5 text-naksir-purple animate-pulse" />
                    <h2 className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Gemini Meta Analysis</h2>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-widest">
                    {analyzingMatch.homeTeam.name} vs {analyzingMatch.awayTeam.name}
                </p>
            </div>

            <div className="p-6 overflow-y-auto min-h-[250px]">
                {isLoadingAnalysis ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 className="w-8 h-8 text-naksir-neon animate-spin" />
                        <p className="text-sm text-gray-400 animate-pulse text-center">
                            Aggregating H2H, Form, Injuries & Stats...<br/>
                            <span className="text-xs text-gray-600 mt-1">Calling Gemini 2.5 Flash</span>
                        </p>
                    </div>
                ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                        <div className="whitespace-pre-line text-gray-300 leading-relaxed text-sm font-light">
                            {analysisContent}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-white/5 bg-black/40">
                <button 
                    onClick={() => setAnalysisOpen(false)}
                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                    Close Analysis
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
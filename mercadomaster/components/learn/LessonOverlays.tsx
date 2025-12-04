
import React, { useState, useEffect } from 'react';
import { Loader2, HeartCrack, Heart, Coins, PackageOpen, Gift, XCircle, Lightbulb, Brain, CheckCircle } from 'lucide-react';

interface LessonOverlaysProps {
  isLoading: boolean;
  loadingMessage: string; // Used as base/fallback
  loadingProgress: number;
  showGameOver: boolean;
  onBuyHearts: () => void;
  onCloseGameOver: () => void;
  phase: string;
  lootBoxOpen: boolean;
  setLootBoxOpen: (open: boolean) => void;
  onCloseLesson: () => void;
  onCancelLoading?: () => void; // New prop
  rewardAmount: number;
}

const LOADING_TIPS = [
  "El interés compuesto es la octava maravilla del mundo.",
  "Nunca inviertas dinero que no puedas permitirte perder.",
  "Diversificar es la única 'comida gratis' en finanzas.",
  "El mercado transfiere dinero del impaciente al paciente.",
  "No atrapes cuchillos cayendo: espera confirmación.",
  "Compra con el rumor, vende con la noticia.",
  "El tiempo en el mercado supera al timing del mercado."
];

const LOADING_STEPS = [
  "Analizando tendencias...",
  "Redactando teoría...",
  "Diseñando quiz...",
  "Calibrando dificultad...",
  "Finalizando lección..."
];

export const LessonOverlays: React.FC<LessonOverlaysProps> = ({
  isLoading, loadingMessage, loadingProgress,
  showGameOver, onBuyHearts, onCloseGameOver,
  phase, lootBoxOpen, setLootBoxOpen, onCloseLesson, onCancelLoading, rewardAmount
}) => {
  
  const [tipIndex, setTipIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [easterEgg, setEasterEgg] = useState(false);

  // Rotate Tips
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % LOADING_TIPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Advance Steps based on progress
  useEffect(() => {
    if (!isLoading) return;
    const newStep = Math.min(LOADING_STEPS.length - 1, Math.floor((loadingProgress / 100) * LOADING_STEPS.length));
    setStepIndex(newStep);
  }, [loadingProgress, isLoading]);

  if (isLoading) {
     return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-950 p-8 z-50 fixed inset-0">
           {/* Animated Background */}
           <div className="bg-grid-pattern absolute inset-0 opacity-20 pointer-events-none"></div>
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>
           </div>

           {/* Loader */}
           <div className="relative cursor-pointer" onClick={() => setEasterEgg(true)}>
              <div className={`absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full ${easterEgg ? 'animate-ping' : 'animate-pulse'}`}></div>
              <Loader2 className={`text-green-400 relative z-10 ${easterEgg ? 'animate-spin duration-75' : 'animate-spin'}`} size={64} />
           </div>

           {/* Step Indicator */}
           <h2 className="text-2xl font-bold text-white mt-8 mb-1 font-mono tracking-wider animate-fade-in">
              {LOADING_STEPS[stepIndex]}
           </h2>
           
           {/* Progress Bar */}
           <div className="w-64 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700 mb-8 relative">
              <div className="h-full bg-green-500 transition-all duration-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{ width: `${loadingProgress}%` }}></div>
              {/* Shine effect */}
              <div className="absolute top-0 bottom-0 w-20 bg-white/20 skew-x-[-20deg] animate-slide-right" style={{ left: '-100%' }}></div>
           </div>

           {/* Tip Card */}
           <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 max-w-md text-center animate-slide-up relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
               <div className="flex items-center gap-2 mb-2 justify-center text-yellow-500 font-bold uppercase text-xs tracking-widest">
                  <Lightbulb size={14} /> Pro Tip #{tipIndex + 1}
               </div>
               <p className="text-slate-300 italic font-medium transition-opacity duration-500 key={tipIndex}">
                  "{LOADING_TIPS[tipIndex]}"
               </p>
           </div>

           {/* Cancel Button */}
           {onCancelLoading && (
             <button onClick={onCancelLoading} className="mt-8 text-slate-500 hover:text-red-400 text-sm flex items-center gap-2 transition-colors">
                <XCircle size={16} /> Cancelar y volver
             </button>
           )}
        </div>
     );
  }

  if (showGameOver) {
      return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 backdrop-blur-md animate-fade-in">
           <div className="bg-slate-900 p-8 rounded-3xl border border-red-500/50 max-w-sm w-full text-center relative overflow-hidden shadow-2xl shadow-red-900/50">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-600"></div>
              <HeartCrack size={80} className="text-red-500 mx-auto mb-6 animate-pulse" />
              <h2 className="text-3xl font-black text-white mb-2">¡MERCADO BAJISTA!</h2>
              <p className="text-slate-400 mb-8">Te has quedado sin vidas.</p>
              
              <button onClick={onBuyHearts} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl mb-3 shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                 <Heart size={20} fill="currentColor"/> Recargar (300 <Coins size={14}/>)
              </button>
              <button onClick={onCloseGameOver} className="text-slate-500 font-bold hover:text-white transition-colors">Volver al Lobby</button>
           </div>
        </div>
      );
  }

  if (phase === 'outro') {
      return (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden h-full">
             <div className="bg-grid-pattern absolute inset-0 opacity-20 pointer-events-none"></div>
             {/* Lootbox Logic */}
             <div className="relative mb-12 z-10 cursor-pointer" onClick={() => !lootBoxOpen && setLootBoxOpen(true)}>
                <div className="absolute inset-0 bg-yellow-500 blur-[100px] opacity-20"></div>
                {lootBoxOpen ? (
                   <div className="animate-bounce-in flex flex-col items-center">
                      <PackageOpen size={160} className="text-yellow-400 drop-shadow-[0_0_50px_rgba(250,204,21,0.6)]" />
                      <div className="text-6xl font-black text-yellow-300 mt-6 flex items-center gap-3 animate-slide-up">
                         +{rewardAmount} <Coins size={48} fill="currentColor"/>
                      </div>
                      <div className="mt-4 text-sm text-yellow-600 font-bold bg-yellow-900/20 px-4 py-2 rounded-full border border-yellow-500/20">
                         Probabilidad Legendaria: 5% (Simulado)
                      </div>
                   </div>
                ) : (
                   <div className="animate-float">
                      <Gift size={140} className="text-indigo-400 drop-shadow-2xl" />
                      <p className="text-center mt-6 text-slate-400 font-bold animate-pulse">¡Toca para abrir!</p>
                   </div>
                )}
             </div>
             
             <button onClick={onCloseLesson} className="relative z-10 w-64 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl border border-slate-600 shadow-xl transition-all">
                Volver al Mapa
             </button>
          </div>
      );
  }

  return null;
};

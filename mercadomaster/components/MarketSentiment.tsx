import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { ThermometerSun, Skull, Zap, TrendingUp } from 'lucide-react';

export const MarketSentiment: React.FC = () => {
  const { market } = useGame();
  const [score, setScore] = useState(50); // 0-100

  // El sentimiento reacciona a la tendencia de Bitcoin (BTC)
  useEffect(() => {
    const btcTrend = market.trend['BTC'];
    
    setScore(prev => {
      let change = 0;
      if (btcTrend === 'up') change = Math.floor(Math.random() * 5) + 1;
      else if (btcTrend === 'down') change = -(Math.floor(Math.random() * 5) + 1);
      else change = (Math.random() - 0.5) * 2;

      // Mantener entre 0 y 100
      return Math.min(100, Math.max(0, prev + change));
    });

  }, [market.trend['BTC']]); 

  // --- CORRECCIÓN: Calcular etiqueta al vuelo (Sin setState) ---
  let label = "Neutral";
  let colorClass = "text-yellow-400";
  let icon = <Zap size={20} className="text-yellow-400"/>;
  
  if (score < 20) { 
      label = "Miedo Extremo"; 
      colorClass = "text-red-500"; 
      icon = <Skull size={20} className="text-red-500"/>; 
  } else if (score < 40) { 
      label = "Miedo"; 
      colorClass = "text-orange-400"; 
      icon = <ThermometerSun size={20} className="text-orange-400"/>; 
  } else if (score < 60) { 
      label = "Neutral"; 
      colorClass = "text-yellow-400"; 
      icon = <Zap size={20} className="text-yellow-400"/>; 
  } else if (score < 80) { 
      label = "Codicia"; 
      colorClass = "text-lime-400"; 
      icon = <TrendingUp size={20} className="text-lime-400"/>; 
  } else { 
      label = "Codicia Extrema"; 
      colorClass = "text-green-500"; 
      icon = <TrendingUp size={20} className="text-green-500"/>; 
  }

  // Calcular rotación de la aguja (-90deg a 90deg)
  const rotation = (score / 100) * 180 - 90;

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
       
       {/* Título */}
       <div className="flex justify-between items-start z-10">
          <h3 className="text-white font-bold flex items-center gap-2">
             {icon} Sentimiento
          </h3>
          <div className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 ${colorClass}`}>
             {label}
          </div>
       </div>

       {/* Medidor Visual (Gauge) */}
       <div className="relative h-32 mt-4 flex items-end justify-center">
          {/* Arco de fondo */}
          <div className="w-48 h-24 rounded-t-full border-[16px] border-slate-800 box-border absolute bottom-0"></div>
          
          {/* Arco de color */}
          <div 
            className="w-48 h-24 rounded-t-full border-[16px] border-transparent box-border absolute bottom-0 opacity-50"
            style={{ 
                background: 'conic-gradient(from 180deg, #ef4444 0deg, #eab308 90deg, #22c55e 180deg)',
                maskImage: 'radial-gradient(white 55%, transparent 56%)',
                WebkitMaskImage: 'radial-gradient(transparent 55%, black 56%)' 
            }}
          ></div>

          {/* Aguja */}
          <div 
            className="absolute bottom-0 w-1 h-24 bg-white origin-bottom transition-transform duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
             <div className="absolute -top-1 -left-1.5 w-4 h-4 bg-white rounded-full"></div>
          </div>
          
          {/* Pivote central */}
          <div className="w-8 h-4 bg-slate-900 absolute bottom-0 z-20 border-t-2 border-slate-700 rounded-t-full"></div>
       </div>

       {/* Puntuación Grande */}
       <div className="text-center mt-2 z-10">
          <div className={`text-5xl font-black ${colorClass} drop-shadow-md`}>{Math.round(score)}</div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Índice de Mercado</p>
       </div>

       {/* Consejo Dinámico */}
       <div className="mt-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-xs text-slate-300 italic text-center">
          {score < 30 ? '"Sé codicioso cuando otros tengan miedo."' : 
           score > 70 ? '"Sé temeroso cuando otros sean codiciosos."' : 
           '"El mercado está indeciso. Opera con cautela."'}
       </div>
    </div>
  );
};
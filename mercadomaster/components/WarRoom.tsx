import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Globe, Lock, Unlock, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { WarRoomScene } from './WarRoomScene';
import { MARKET_NODES } from '../data/markets';
import { TradingModal } from './TradingModal'; // Importa el modal que acabamos de crear

export const WarRoom: React.FC = () => {
  const { stats, actions } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedMarket = MARKET_NODES.find(m => m.id === selectedId);
  const isUnlocked = selectedMarket ? stats.unlockedMarkets.includes(selectedMarket.id) : false;

  const handleUnlock = () => {
      if (selectedMarket && actions.unlockMarket(selectedMarket.id)) {
          // Éxito
      }
      // 1. ESTADO PARA EL MODAL
  const [isTradingOpen, setIsTradingOpen] = useState(false);
  
  // Datos del nodo seleccionado (Simulado basado en tu imagen)
  const selectedNode = {
      id: 'ny',
      name: "New York (NYSE)",
      assets: ["AAPL", "TSLA", "MSFT"]
  };

  return (
    <div className="h-full flex flex-col bg-black animate-fade-in relative overflow-hidden">
       
       {/* TITULO */}
       <div className="absolute top-6 left-6 z-10 pointer-events-none">
           <div className="flex items-center gap-3 mb-1">
               <Globe className="text-blue-500 animate-pulse" />
               <h1 className="text-2xl font-black text-white tracking-widest uppercase">War Room</h1>
           </div>
           <p className="text-slate-500 text-xs font-mono">GLOBAL MARKET COMMAND</p>
       </div>

       {/* ESCENA 3D */}
       <div className="flex-1 bg-[radial-gradient(circle_at_center,#1e293b_0%,#000_100%)]">
           <WarRoomScene unlocked={stats.unlockedMarkets} onSelect={setSelectedId} />
       </div>

       {/* PANEL LATERAL (DETALLES) */}
       {selectedMarket ? (
           <div className="absolute right-0 top-0 h-full w-80 bg-slate-900/90 backdrop-blur-xl border-l border-slate-700 p-6 flex flex-col shadow-2xl animate-slide-left">
               <div className="mb-6">
                   <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                       {isUnlocked ? <span className="text-green-400 flex items-center gap-1"><Unlock size={12}/> CONECTADO</span> : <span className="text-red-400 flex items-center gap-1"><Lock size={12}/> BLOQUEADO</span>}
                   </div>
                   <h2 className="text-3xl font-black text-white leading-tight mb-2">{selectedMarket.name}</h2>
                   <p className="text-slate-400 text-sm">{selectedMarket.desc}</p>
               </div>

               <div className="flex-1 space-y-6">
                   <div>
                       <h3 className="text-xs font-bold text-blue-400 uppercase mb-3">Activos Exclusivos</h3>
                       <div className="flex flex-wrap gap-2">
                           {selectedMarket.assets.map(asset => (
                               <span key={asset} className="px-3 py-1 bg-slate-800 rounded-lg text-white text-xs font-mono border border-slate-700">
                                   {asset}
                               </span>
                           ))}
                       </div>
                   </div>

                   <div>
                       <h3 className="text-xs font-bold text-yellow-400 uppercase mb-3">Condiciones</h3>
                       <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-2">
                           <div className="flex justify-between text-xs text-slate-300">
                               <span>Volatilidad</span>
                               <span className="text-white font-bold">Alta</span>
                           </div>
                           <div className="flex justify-between text-xs text-slate-300">
                               <span>Comisión</span>
                               <span className="text-white font-bold">0.1%</span>
                           </div>
                       </div>
                   </div>
               </div>

               <div className="mt-auto pt-6 border-t border-slate-800">
                   {isUnlocked ? (
                       <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20">
                           <TrendingUp size={18}/> OPERAR AQUÍ
                       </button>
                   ) : (
                       <button 
                           onClick={handleUnlock}
                           className={`w-full py-4 font-black rounded-xl flex items-center justify-center gap-2 transition-all ${stats.masterCoins >= selectedMarket.cost ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                           disabled={stats.masterCoins < selectedMarket.cost}
                       >
                           {stats.masterCoins >= selectedMarket.cost ? <Unlock size={18}/> : <Lock size={18}/>}
                           DESBLOQUEAR ${selectedMarket.cost.toLocaleString()}
                       </button>
                   )}
                   {stats.masterCoins < selectedMarket.cost && !isUnlocked && (
                       <p className="text-center text-[10px] text-red-400 mt-3 flex items-center justify-center gap-1">
                           <AlertTriangle size={10}/> Fondos insuficientes
                       </p>
                   )}
               </div>
           </div>
       ) : (
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-slate-400 text-sm animate-pulse pointer-events-none">
               Haz clic en un nodo para ver detalles
           </div>
       )}

    </div>
  );
};
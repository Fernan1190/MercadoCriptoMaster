import React, { useState, Suspense, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Globe, Lock, Unlock, TrendingUp, AlertTriangle, Loader, Zap, Shield, Crosshair, Wifi, Terminal, Clock, Radio } from 'lucide-react';
import { WarRoomScene } from './WarRoomScene';
import { MARKET_NODES } from '../data/markets';
import { MarketNode } from '../types';

interface WarRoomProps {
  onEnterMarket?: (market: MarketNode) => void;
}

// --- NOTICIAS FALSAS PARA EL TICKER ---
const NEWS_HEADLINES = [
    "BTC sube un 5% tras anuncio de la FED",
    "Londres abre con alta volatilidad en sector energético",
    "Tokio reporta volumen récord en acciones tech",
    "Alerta: Ballena mueve 10,000 ETH a exchange desconocido",
    "Inflación en zona Euro se mantiene estable",
    "Nuevo protocolo DeFi sufre exploit menor, tokens seguros"
];

// --- COMPONENTE TICKER ---
const NewsTicker = () => (
    <div className="absolute bottom-0 left-0 w-full bg-slate-900/90 border-t border-slate-700 h-8 flex items-center overflow-hidden z-20">
        <div className="bg-blue-600 h-full px-3 flex items-center justify-center z-10 shrink-0">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE NEWS</span>
        </div>
        <div className="whitespace-nowrap animate-marquee flex gap-16 items-center">
            {[...NEWS_HEADLINES, ...NEWS_HEADLINES].map((news, i) => (
                <span key={i} className="text-xs font-mono text-blue-200 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> {news}
                </span>
            ))}
        </div>
        <style>{`
            @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .animate-marquee { animation: marquee 30s linear infinite; }
        `}</style>
    </div>
);

// --- OVERLAY DE TRANSICIÓN (ESCANEO) ---
const ConnectionOverlay = ({ targetName }: { targetName: string }) => (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center font-mono text-green-500 animate-fade-in">
        <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-green-500 animate-[loading_1s_ease-in-out_forwards]" style={{width: '100%'}}></div>
        </div>
        <div className="text-xl font-black tracking-widest animate-pulse">ESTABLISHING UPLINK</div>
        <div className="text-xs mt-2 opacity-70">TARGET: {targetName.toUpperCase()}</div>
        <div className="text-[10px] mt-1 opacity-50">ENCRYPTING PACKETS... DONE</div>
        <style>{`@keyframes loading { 0% { width: 0% } 100% { width: 100% } }`}</style>
    </div>
);

export const WarRoom: React.FC<WarRoomProps> = ({ onEnterMarket }) => {
  const { stats, actions } = useGame();
  const [selectedNode, setSelectedNode] = useState<MarketNode | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [typedName, setTypedName] = useState("");
  
  // Helpers de Horario
  const getLocalTime = (timezone: string) => new Date().toLocaleTimeString("en-US", { timeZone: timezone, hour: '2-digit', minute: '2-digit' });
  const isMarketOpen = (timezone: string) => {
      const h = new Date().toLocaleString("en-US", { timeZone: timezone, hour: 'numeric', hour12: false });
      const hour = parseInt(h);
      return hour >= 9 && hour < 17;
  };

  useEffect(() => {
      if (selectedNode) {
          let i = 0;
          setTypedName("");
          const interval = setInterval(() => {
              setTypedName(selectedNode.name.slice(0, i + 1));
              i++;
              if (i > selectedNode.name.length) clearInterval(interval);
          }, 30);
          return () => clearInterval(interval);
      }
  }, [selectedNode]);

  const isUnlocked = selectedNode ? stats.unlockedMarkets.includes(selectedNode.id) : false;
  const isOpen = selectedNode ? isMarketOpen(selectedNode.timezone) : false;

  const handleUnlock = () => {
      if (selectedNode && actions.unlockMarket(selectedNode.id)) { } // Sonido y lógica en contexto
  };

  const handleConnect = () => {
      if (!selectedNode || !onEnterMarket) return;
      setIsConnecting(true);
      actions.playSound('click'); // Sonido de tech
      // Retraso para mostrar la animación
      setTimeout(() => {
          onEnterMarket(selectedNode);
      }, 1500);
  };

  const handleSelectFromGlobe = (id: string) => {
      const node = MARKET_NODES.find(n => n.id === id);
      if (node) { setSelectedNode(node); actions.playSound('click'); }
  };

  if (isConnecting && selectedNode) return <ConnectionOverlay targetName={selectedNode.name} />;

  return (
    <div className="h-full flex flex-col bg-black animate-fade-in relative overflow-hidden">
       
       {/* DECORACIÓN HUD */}
       <div className="absolute top-6 left-6 z-20 pointer-events-none">
           <div className="flex items-center gap-3 mb-1">
               <div className="p-2 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                   <Globe className="text-blue-400 animate-spin-slow" size={20} />
               </div>
               <div>
                   <h1 className="text-xl font-black text-white tracking-[0.2em] uppercase">War Room</h1>
                   <div className="h-0.5 w-full bg-blue-500/50 mt-1"></div>
               </div>
           </div>
       </div>

       {/* --- ESCENA 3D --- */}
       <div className="flex-1 w-full h-full relative cursor-move bg-[radial-gradient(circle_at_center,#0f172a_0%,#000_100%)]">
           <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-blue-500"><Loader className="animate-spin" /></div>}>
               <WarRoomScene unlocked={stats.unlockedMarkets} onSelect={handleSelectFromGlobe} />
           </Suspense>
           <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(transparent_50%,black_100%)]"></div>
       </div>

       {/* TICKER DE NOTICIAS */}
       <NewsTicker />

       {/* PANEL LATERAL */}
       {selectedNode && (
           <div className="absolute right-0 top-0 h-full w-80 md:w-96 bg-slate-900/80 backdrop-blur-xl border-l border-blue-500/20 p-0 flex flex-col shadow-2xl animate-slide-left z-30 pb-10">
               <div className="h-1 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
               
               <div className="p-8 flex-1 flex flex-col">
                   {/* HEADER NODO */}
                   <div className="mb-6 relative">
                       <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] text-slate-400 font-mono tracking-widest">{selectedNode.id.toUpperCase()}_NODE</span>
                           <div className="flex gap-2">
                               <span className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 ${isOpen ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-orange-900/20 border-orange-500/30 text-orange-400'}`}>
                                   <Clock size={10}/> {isOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
                               </span>
                           </div>
                       </div>
                       
                       <h2 className="text-4xl font-black text-white leading-tight mb-2 font-mono">
                           {typedName}<span className="animate-pulse">_</span>
                       </h2>
                       <div className="text-xs font-mono text-blue-300 mb-4 flex items-center gap-2">
                           <Radio size={12} className="animate-pulse"/> LOCAL TIME: {getLocalTime(selectedNode.timezone)}
                       </div>
                       <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-blue-500/50 pl-4 py-1">{selectedNode.desc}</p>
                   </div>

                   {/* STATS */}
                   <div className="space-y-6">
                       <div className="bg-black/40 p-4 rounded-xl border border-blue-500/10">
                           <h3 className="text-[10px] font-bold text-blue-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                               <Shield size={12}/> Market Assets
                           </h3>
                           <div className="flex flex-wrap gap-2">
                               {selectedNode.assets.map(asset => (
                                   <span key={asset} className="px-3 py-1 bg-blue-900/20 text-blue-200 text-xs font-mono font-bold rounded border border-blue-500/20">
                                       {asset}
                                   </span>
                               ))}
                           </div>
                       </div>
                   </div>

                   {/* ACCIONES */}
                   <div className="mt-auto pt-8">
                       {isUnlocked ? (
                           onEnterMarket ? (
                               <button 
                                    onClick={handleConnect}
                                    className={`w-full py-4 text-white font-black rounded-sm flex items-center justify-center gap-3 transition-all group relative overflow-hidden clip-path-polygon border-t border-b
                                        ${isOpen 
                                            ? 'bg-blue-600 hover:bg-blue-500 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                                            : 'bg-slate-700 hover:bg-slate-600 border-slate-500'
                                        }`}
                                    style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                               >
                                   {isOpen ? <Zap size={18} className="fill-current"/> : <Lock size={18}/>}
                                   <span className="relative z-10 tracking-widest">{isOpen ? 'INITIATE UPLINK' : 'ENTER (AFTER HOURS)'}</span>
                               </button>
                           ) : <div className="text-center text-slate-500 font-mono">READ ONLY</div>
                       ) : (
                           <button 
                               onClick={handleUnlock}
                               className={`w-full py-4 font-black rounded-sm flex items-center justify-center gap-2 transition-all border ${stats.masterCoins >= selectedNode.cost ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black' : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'}`}
                               disabled={stats.masterCoins < selectedNode.cost}
                               style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                           >
                               {stats.masterCoins >= selectedNode.cost ? <Unlock size={18}/> : <Lock size={18}/>}
                               {stats.masterCoins >= selectedNode.cost ? `UNLOCK PROTOCOL: $${selectedNode.cost}` : 'INSUFFICIENT FUNDS'}
                           </button>
                       )}
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};
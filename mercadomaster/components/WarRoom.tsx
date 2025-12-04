import React, { useState, Suspense, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Globe, Lock, Unlock, TrendingUp, AlertTriangle, Loader, Zap, Shield, X, Clock, Radio } from 'lucide-react';
import { WarRoomScene } from './WarRoomScene';
import { MARKET_NODES } from '../data/markets';
import { MarketNode } from '../types';

interface WarRoomProps {
  onEnterMarket?: (market: MarketNode) => void;
}

// 📰 NOTICIAS INMERSIVAS
const NEWS_HEADLINES = [
    "BTC sube un 5% tras anuncio de la FED",
    "Londres abre con alta volatilidad en sector energético",
    "Tokio reporta volumen récord en acciones tech",
    "Alerta: Ballena mueve 10,000 ETH a exchange desconocido",
    "Inflación en zona Euro se mantiene estable",
    "Nuevo protocolo DeFi sufre exploit menor, tokens seguros"
];

const NewsTicker = () => (
    <div className="absolute bottom-0 left-0 w-full bg-slate-900/90 border-t border-slate-700 h-8 flex items-center overflow-hidden z-20 pointer-events-none">
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

// 📡 TRANSICIÓN DE HACKEO
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
      try {
          const h = new Date().toLocaleString("en-US", { timeZone: timezone, hour: 'numeric', hour12: false });
          const hour = parseInt(h);
          return hour >= 9 && hour < 17;
      } catch (e) { return true; }
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

  const handleSelectFromGlobe = (id: string) => {
      const node = MARKET_NODES.find(n => n.id === id);
      if (node) { setSelectedNode(node); actions.playSound('click'); }
  };

  const handleConnect = () => {
      if (!selectedNode || !onEnterMarket) return;
      setIsConnecting(true);
      actions.playSound('click');
      setTimeout(() => { 
          onEnterMarket(selectedNode); 
          setIsConnecting(false);
      }, 1500);
  };

  if (isConnecting && selectedNode) return <ConnectionOverlay targetName={selectedNode.name} />;

  const isUnlocked = selectedNode ? stats.unlockedMarkets.includes(selectedNode.id) : false;
  const isOpen = selectedNode ? isMarketOpen(selectedNode.timezone) : false;

  return (
    <div className="h-full flex flex-col bg-black animate-fade-in relative overflow-hidden">
       
       {/* TITULO (Overlay pointer-events-none CRÍTICO para que funcione el clic en el mapa) */}
       <div className="absolute top-6 left-6 z-10 pointer-events-none">
           <div className="flex items-center gap-3 mb-1">
               <Globe className="text-blue-500 animate-pulse" />
               <h1 className="text-2xl font-black text-white tracking-widest uppercase">War Room</h1>
           </div>
           <p className="text-slate-500 text-xs font-mono">GLOBAL MARKET COMMAND</p>
       </div>

       {/* --- ESCENA 3D --- */}
       <div className="flex-1 w-full h-full relative cursor-move bg-[radial-gradient(circle_at_center,#1e293b_0%,#000_100%)] z-0">
           <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-blue-500"><Loader className="animate-spin" /></div>}>
               <WarRoomScene unlocked={stats.unlockedMarkets} onSelect={handleSelectFromGlobe} />
           </Suspense>
           <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(transparent_60%,black_100%)]"></div>
       </div>

       <NewsTicker />

       {/* PANEL LATERAL */}
       {selectedNode && (
           <div className="absolute right-0 top-0 h-full w-80 md:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 p-6 flex flex-col shadow-2xl animate-slide-left z-20 pb-12">
               
               <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                   <X size={20}/>
               </button>

               <div className="mb-6 mt-4">
                   <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] text-slate-400 font-mono tracking-widest">{selectedNode.id.toUpperCase()}_NODE</span>
                       <span className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 ${isOpen ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-orange-900/20 border-orange-500/30 text-orange-400'}`}>
                           <Clock size={10}/> {isOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
                       </span>
                   </div>
                   <h2 className="text-4xl font-black text-white leading-tight mb-2 font-mono">{typedName}<span className="animate-pulse">_</span></h2>
                   <div className="text-xs font-mono text-blue-300 mb-4 flex items-center gap-2">
                       <Radio size={12} className="animate-pulse"/> LOCAL TIME: {getLocalTime(selectedNode.timezone)}
                   </div>
                   <p className="text-slate-400 text-sm border-l-2 border-slate-700 pl-3">{selectedNode.desc}</p>
               </div>

               <div className="flex-1 space-y-6">
                   <div className="bg-black/40 p-4 rounded-xl border border-slate-700">
                       <h3 className="text-[10px] font-bold text-blue-400 uppercase mb-3 tracking-widest">Activos Disponibles</h3>
                       <div className="flex flex-wrap gap-2">
                           {selectedNode.assets.map(asset => (
                               <span key={asset} className="px-3 py-1 bg-slate-800 text-white text-xs font-mono font-bold rounded border border-slate-600">{asset}</span>
                           ))}
                       </div>
                   </div>
               </div>

               <div className="mt-auto border-t border-slate-800 pt-4">
                   {isUnlocked ? (
                       <button 
                            onClick={handleConnect}
                            className={`w-full py-4 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg ${isOpen ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40' : 'bg-slate-700 hover:bg-slate-600'}`}
                       >
                           {isOpen ? <Zap size={18}/> : <Lock size={18}/>}
                           {isOpen ? 'INITIATE UPLINK' : 'ENTER (AFTER HOURS)'}
                       </button>
                   ) : (
                       <button 
                           onClick={() => actions.unlockMarket(selectedNode.id)}
                           className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-xl flex items-center justify-center gap-2"
                           disabled={stats.masterCoins < selectedNode.cost}
                       >
                           <Unlock size={18}/> UNLOCK ${selectedNode.cost.toLocaleString()}
                       </button>
                   )}
               </div>
           </div>
       )}
    </div>
  );
};
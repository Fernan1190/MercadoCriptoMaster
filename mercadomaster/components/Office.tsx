import React, { Suspense } from 'react';
import { useGame } from '../context/GameContext';
import { Briefcase, ArrowUpRight, MapPin, TrendingUp, Shield, Loader, Sun, Moon } from 'lucide-react';
import OfficeScene from './OfficeScene'; 

export const Office: React.FC = () => {
  const { stats } = useGame();
  const { level, officeItems, balance, league } = stats;

  // Texto dinámico
  let tierName = "Sótano Familiar";
  if (level >= 5) tierName = "Garaje Start-up";
  if (level >= 10) tierName = "Oficina Privada";
  if (level >= 20) tierName = "Penthouse Wall St.";
  if (level >= 50) tierName = "Base Lunar";

  return (
    <div className="p-4 md:p-8 h-full flex flex-col bg-black animate-fade-in pb-24 overflow-hidden">
      
      {/* Header Flotante */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-2xl">
              <div className="bg-blue-600/20 p-3 rounded-xl text-blue-400">
                 <Briefcase size={24} />
              </div>
              <div>
                 <h1 className="text-xl font-black text-white tracking-tight uppercase">{tierName}</h1>
                 <p className="text-xs text-slate-400 font-mono">NIVEL {level}</p>
              </div>
          </div>
      </div>

      <div className="absolute top-6 right-6 z-10 bg-green-900/40 backdrop-blur-xl border border-green-500/30 p-4 rounded-2xl shadow-2xl pointer-events-none">
          <div className="text-[10px] text-green-400 font-bold uppercase tracking-wider mb-1">Valor Neto</div>
          <div className="text-2xl font-mono font-black text-white tracking-tighter">
             ${balance.toLocaleString()}
          </div>
      </div>

      {/* --- VIEWPORT 3D --- */}
      <div className="flex-1 w-full h-full relative rounded-3xl overflow-hidden border-4 border-slate-900 shadow-2xl shadow-black bg-slate-900">
          <Suspense fallback={<div className="flex items-center justify-center h-full text-white gap-2"><Loader className="animate-spin"/> Cargando 3D...</div>}>
             <OfficeScene level={level} items={officeItems} league={league} />
          </Suspense>
          
          {/* Vignette Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(transparent_50%,rgba(0,0,0,0.5)_100%)]"></div>
      </div>

      {/* BARRA DE CONTROL */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-4 rounded-3xl shadow-2xl flex items-center justify-between z-30">
          <div className="flex gap-4 md:gap-8 px-2">
              <div className="flex items-center gap-3">
                 <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><MapPin size={20}/></div>
                 <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Ubicación</div>
                    <div className="text-sm font-bold text-white">{level < 50 ? 'Tierra' : 'Espacio'}</div>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-400"><Shield size={20}/></div>
                 <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Prestigio</div>
                    <div className="text-sm font-bold text-white">Nivel {stats.prestige}</div>
                 </div>
              </div>
          </div>

          <button 
            onClick={() => (document.querySelector('button[aria-label="Tienda"]') as HTMLElement)?.click()} 
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 md:px-6 py-3 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95"
          >
              <TrendingUp size={16}/> <span className="hidden md:inline">Mejorar Setup</span>
          </button>
      </div>
    </div>
  );
};
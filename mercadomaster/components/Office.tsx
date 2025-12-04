import React, { Suspense, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Briefcase, ArrowUpRight, MapPin, TrendingUp, Shield, Loader, Sun, Moon, Palette, Gamepad2, Zap } from 'lucide-react';
import OfficeScene from './OfficeScene'; 

export const Office: React.FC = () => {
  const { stats, actions } = useGame();
  const { level, officeItems, balance, activeBuffs, activeSkin } = stats;
  const { changeOfficeSkin } = actions;

  const [showDecorator, setShowDecorator] = useState(false);
  const [showArcade, setShowArcade] = useState(false);

  let tierName = "Sótano Familiar";
  if (level >= 5) tierName = "Garaje Start-up";
  if (level >= 10) tierName = "Oficina Privada";
  if (level >= 20) tierName = "Penthouse Wall St.";
  if (level >= 50) tierName = "Base Lunar";

  return (
    <div className="p-4 md:p-8 h-full flex flex-col bg-black animate-fade-in pb-24 overflow-hidden">
      
      {/* Header Flotante */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-2xl pointer-events-auto">
              <div className="bg-blue-600/20 p-3 rounded-xl text-blue-400">
                 <Briefcase size={24} />
              </div>
              <div>
                 <h1 className="text-xl font-black text-white tracking-tight uppercase">{tierName}</h1>
                 <p className="text-xs text-slate-400 font-mono">NIVEL {level}</p>
              </div>
          </div>
          
          {/* Buffs Activos */}
          {activeBuffs.length > 0 && (
              <div className="flex gap-2 mt-2">
                  {activeBuffs.map(buff => (
                      <div key={buff.id} className="bg-yellow-900/80 border border-yellow-500/30 px-3 py-1 rounded-full flex items-center gap-2 text-[10px] text-yellow-400 font-bold animate-pulse">
                          <Zap size={10} fill="currentColor"/> {buff.id === 'lucky_cat' ? 'Suerte Gatuna' : 'Buff'}
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* Botón Arcade */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
         <button onClick={() => setShowArcade(true)} className="bg-purple-600/90 hover:bg-purple-500 text-white px-4 py-2 rounded-full border border-white/20 shadow-lg flex items-center gap-2 font-black text-xs tracking-wider transition-all hover:scale-105">
            <Gamepad2 size={16}/> ARCADE
         </button>
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
             <OfficeScene 
                level={level} 
                items={officeItems} 
                league={stats.league} 
                skin={activeSkin} 
                achievements={stats.unlockedAchievements}
             />
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
              
              <button onClick={() => setShowDecorator(!showDecorator)} className="flex items-center gap-3 group">
                 <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors"><Palette size={20}/></div>
                 <div className="text-left">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Estilo</div>
                    <div className="text-sm font-bold text-white">Decorar</div>
                 </div>
              </button>
          </div>

          <button 
            onClick={() => (document.querySelector('button[aria-label="Tienda"]') as HTMLElement)?.click()} 
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 md:px-6 py-3 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95"
          >
              <TrendingUp size={16}/> <span className="hidden md:inline">Tienda</span>
          </button>
      </div>

      {/* MODAL DECORADOR */}
      {showDecorator && (
          <div className="absolute bottom-48 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-6 rounded-2xl shadow-2xl z-40 animate-slide-up w-80">
              <h3 className="text-white font-bold mb-4">Suelos</h3>
              <div className="flex gap-2 mb-4">
                  {['#1e293b', '#3f3f46', '#57534e', '#312e81'].map(c => (
                      <button key={c} onClick={() => changeOfficeSkin('floor', c)} className="w-8 h-8 rounded-full border-2 border-white/20" style={{backgroundColor: c}}></button>
                  ))}
              </div>
              <h3 className="text-white font-bold mb-4">Paredes</h3>
              <div className="flex gap-2">
                  {['#334155', '#1e1b4b', '#0f172a', '#27272a'].map(c => (
                      <button key={c} onClick={() => changeOfficeSkin('wall', c)} className="w-8 h-8 rounded-full border-2 border-white/20" style={{backgroundColor: c}}></button>
                  ))}
              </div>
              <button onClick={() => setShowDecorator(false)} className="mt-6 w-full bg-slate-800 text-white py-2 rounded-lg font-bold text-xs">Cerrar</button>
          </div>
      )}

      {/* MODAL ARCADE */}
      {showArcade && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm animate-fade-in">
              <div className="bg-slate-900 border-4 border-purple-500 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(168,85,247,0.5)]">
                  <Gamepad2 size={48} className="text-purple-500 mx-auto mb-4 animate-bounce"/>
                  <h2 className="text-2xl font-black text-white mb-2">FLAPPY CANDLE</h2>
                  <div className="h-48 bg-black border border-slate-700 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(transparent_90%,#00ff00_90%)] bg-[size:20px_20px] opacity-20 animate-move-grid"></div>
                      <p className="text-green-400 font-mono text-xs">Proximamente...</p>
                  </div>
                  <button onClick={() => setShowArcade(false)} className="bg-white text-black font-black px-6 py-3 rounded-xl hover:scale-105 transition-transform">SALIR</button>
              </div>
          </div>
      )}
    </div>
  );
};
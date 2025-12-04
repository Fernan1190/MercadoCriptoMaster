import React from 'react';
import { useGame } from '../context/GameContext';
import { ShoppingBag, Zap, Clock, SkipForward, Shield, Palette, Check, Armchair, Monitor, Trophy, Cat } from 'lucide-react';

export const Shop: React.FC = () => {
  const { stats, actions } = useGame();
  const { buyShopItem, buyTheme, equipTheme, buyOfficeItem } = actions;

  const CONSUMABLES = [
    { id: 'hint5050', name: "Pista 50/50", desc: "Elimina 2 opciones.", cost: 50, icon: Zap, color: "yellow" },
    { id: 'timeFreeze', name: "Congelar Tiempo", desc: "Para el reloj 30s.", cost: 100, icon: Clock, color: "blue" },
    { id: 'skip', name: "Saltar Nivel", desc: "Pasa una pregunta.", cost: 150, icon: SkipForward, color: "purple" },
    { id: 'streakFreeze', name: "Protector", desc: "Salva tu racha.", cost: 200, icon: Shield, color: "green" },
  ];

  // NUEVOS ITEMS DE OFICINA
  const OFFICE_ITEMS = [
    { id: 'plant', name: "Planta de la Suerte", desc: "Da vida a tu oficina.", cost: 500, icon: <span className="text-2xl">🌿</span> },
    { id: 'cat', name: "Gato Trader", desc: "Te hace compañía.", cost: 1000, icon: <Cat size={24}/> },
    { id: 'setup_pro', name: "Setup RGB", desc: "Luces LED para más FPS.", cost: 2500, icon: <Monitor size={24}/> },
    { id: 'trophy_gold', name: "Trono de Oro", desc: "Símbolo de estatus.", cost: 5000, icon: <Trophy size={24}/> },
  ];

  const THEMES = [
    { id: 'default', name: "Standard", desc: "Clásico.", cost: 0, color: "bg-slate-900" },
    { id: 'cyberpunk', name: "Cyberpunk", desc: "Neon Vibes.", cost: 500, color: "bg-fuchsia-900" },
    { id: 'terminal', name: "Matrix", desc: "Hacker style.", cost: 1000, color: "bg-black" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto pb-24 animate-fade-in relative z-10">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
           <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400">
              <ShoppingBag size={32} />
           </div>
           <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Tienda</h1>
              <p className="text-slate-400">Invierte en tu éxito.</p>
           </div>
        </div>
        <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl inline-flex items-center gap-2 backdrop-blur-md">
            <span className="text-slate-400 text-sm font-bold uppercase">Saldo:</span>
            <span className="text-yellow-400 font-black text-2xl flex items-center gap-1">{stats.masterCoins} <span className="text-sm">©</span></span>
        </div>
      </header>

      {/* SECCIÓN 1: CONSUMIBLES */}
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Zap className="text-yellow-500"/> Potenciadores</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
         {CONSUMABLES.map((item) => (
            <div key={item.id} className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl flex flex-col hover:border-slate-500 transition-all">
               <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/20 text-${item.color}-400 flex items-center justify-center mb-3`}>
                  <item.icon size={20} />
               </div>
               <h3 className="font-bold text-white">{item.name}</h3>
               <p className="text-slate-400 text-xs mb-3 flex-1">{item.desc}</p>
               <button onClick={() => buyShopItem(item.id as any, item.cost)} className="bg-slate-800 hover:bg-white hover:text-slate-900 text-white font-bold py-2 rounded-lg text-xs transition-colors border border-slate-600">
                  {item.cost} ©
               </button>
            </div>
         ))}
      </div>

      {/* SECCIÓN 2: OFICINA (EL IMPERIO) - NUEVA SECCIÓN */}
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Armchair className="text-blue-400"/> Mejoras de Oficina</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
         {OFFICE_ITEMS.map((item) => {
            const isOwned = stats.officeItems.includes(item.id);
            return (
              <div key={item.id} className={`relative p-6 rounded-3xl border-2 transition-all ${isOwned ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-900/80 border-slate-700 hover:border-slate-500'}`}>
                 <div className="text-4xl mb-4 text-center">{item.icon}</div>
                 <h3 className="font-bold text-white text-center">{item.name}</h3>
                 <p className="text-slate-400 text-xs text-center mb-4">{item.desc}</p>
                 
                 {isOwned ? (
                    <div className="w-full py-2 bg-blue-500/20 text-blue-400 rounded-xl text-center text-xs font-bold border border-blue-500/30 flex items-center justify-center gap-1">
                       <Check size={12}/> ADQUIRIDO
                    </div>
                 ) : (
                    <button onClick={() => buyOfficeItem(item.id, item.cost)} className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-xl text-xs font-bold transition-colors">
                       COMPRAR {item.cost} ©
                    </button>
                 )}
              </div>
            );
         })}
      </div>

      {/* SECCIÓN 3: TEMAS */}
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Palette className="text-pink-500"/> Temas de Interfaz</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {THEMES.map((theme) => {
            const isUnlocked = stats.unlockedThemes.includes(theme.id);
            const isEquipped = stats.theme === theme.id;
            return (
              <div key={theme.id} className={`relative overflow-hidden rounded-2xl border-2 transition-all ${isEquipped ? 'border-green-500' : 'border-slate-700 hover:border-slate-500'}`}>
                 <div className={`h-16 ${theme.color} opacity-50`}></div>
                 <div className="p-4 bg-slate-900/90">
                    <div className="flex justify-between items-center mb-2">
                       <h3 className="font-bold text-white">{theme.name}</h3>
                       {isEquipped && <Check size={16} className="text-green-500"/>}
                    </div>
                    {isUnlocked ? (
                       <button onClick={() => equipTheme(theme.id)} disabled={isEquipped} className={`w-full py-2 rounded-lg font-bold text-xs ${isEquipped ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-900'}`}>
                          {isEquipped ? 'EQUIPADO' : 'USAR'}
                       </button>
                    ) : (
                       <button onClick={() => buyTheme(theme.id, theme.cost)} className="w-full py-2 rounded-lg font-bold text-xs bg-yellow-500 text-slate-900">
                          {theme.cost} ©
                       </button>
                    )}
                 </div>
              </div>
            );
         })}
      </div>
    </div>
  );
};
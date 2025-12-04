import React from 'react';
import { MarketNode } from '../types';
import { TradingTerminal } from './TradingTerminal';
import { ArrowLeft, MapPin, Building2 } from 'lucide-react';

interface CityTradingViewProps {
  market: MarketNode;
  onBack: () => void;
}

export const CityTradingView: React.FC<CityTradingViewProps> = ({ market, onBack }) => {
  
  // 1. Configuración visual según la ciudad (Ambiente)
  const getCityTheme = (id: string) => {
    switch(id) {
      case 'ny': return "bg-gradient-to-b from-blue-900 to-slate-900"; // Corporativo
      case 'tokyo': return "bg-gradient-to-b from-fuchsia-900 to-black"; // Cyberpunk/Neon
      case 'london': return "bg-gradient-to-b from-slate-800 to-slate-900"; // Nublado/Serio
      case 'zurich': return "bg-gradient-to-b from-emerald-900 to-slate-900"; // Dinero/Seguro
      default: return "bg-slate-950";
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${getCityTheme(market.id)} animate-fade-in overflow-hidden`}>
       
       {/* FONDO DECORATIVO (Patrones sutiles) */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

       {/* HEADER DE LA CIUDAD */}
       <div className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-md border-b border-white/10 z-10">
          <div className="flex items-center gap-4">
             <button 
                onClick={onBack}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-2 group"
             >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/> 
                <span className="font-bold text-sm">Volver al Mapa</span>
             </button>
             
             <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
                   <MapPin className="text-yellow-500" /> {market.name}
                </h1>
                <p className="text-white/60 text-sm flex items-center gap-2">
                   <Building2 size={12}/> Centro de Operaciones Local • {market.region.toUpperCase()}
                </p>
             </div>
          </div>

          {/* Badge de Coste/Comisión (Decorativo) */}
          <div className="hidden md:block text-right">
             <div className="text-xs text-white/50 font-bold uppercase">Comisión de Plaza</div>
             <div className="text-xl font-mono font-bold text-white">{(market.cost / 1000).toFixed(1)}%</div>
          </div>
       </div>

       {/* ÁREA DE TRABAJO (Aquí va la terminal y quizás el personaje a un lado) */}
       <div className="flex-1 p-6 flex gap-6 overflow-hidden relative z-10">
          
          {/* LADO IZQUIERDO: TERMINAL (Ocupa la mayoría) */}
          <div className="flex-1 h-full shadow-2xl rounded-3xl overflow-hidden border border-white/10 bg-slate-900/80 backdrop-blur-xl">
             <TradingTerminal 
                allowedAssets={market.assets} 
                defaultAsset={market.assets[0]}
                isModal={false} // Se comporta como pantalla completa, no modal
             />
          </div>

          {/* LADO DERECHO: PANEL DE INFORMACIÓN / PERSONAJE (Opcional) */}
          <div className="w-80 hidden xl:flex flex-col gap-4">
              {/* Tarjeta de "Estás Aquí" */}
              <div className="bg-slate-900/80 p-6 rounded-3xl border border-white/10 flex-1 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/10 to-transparent"></div>
                  <h3 className="relative z-10 font-bold text-white mb-2">Noticias Locales</h3>
                  <p className="relative z-10 text-sm text-slate-400">
                     El mercado en {market.name.split(' ')[0]} muestra alta volatilidad en el sector tecnológico.
                  </p>
                  
                  {/* Aquí podrías poner una imagen o icono gigante de la ciudad o tu personaje "viajero" */}
                  <div className="absolute bottom-0 right-0 opacity-20 text-9xl">
                     🏙️
                  </div>
              </div>
          </div>

       </div>
    </div>
  );
};
import React from 'react';
import { MarketNode } from '../types';
import { TradingTerminal } from './TradingTerminal';
import { ArrowLeft, MapPin, Building2, Globe, TrendingUp, Radio } from 'lucide-react';

interface CityTradingViewProps {
  market: MarketNode;
  onBack: () => void;
}

export const CityTradingView: React.FC<CityTradingViewProps> = ({ market, onBack }) => {
  
  // 1. Temas Visuales según la Ciudad
  const getCityTheme = (id: string) => {
    switch(id) {
      case 'ny': return "bg-gradient-to-br from-blue-900 via-slate-900 to-black"; // Azul Wall St
      case 'london': return "bg-gradient-to-br from-slate-700 via-slate-900 to-black"; // Gris Lluvia
      case 'tokyo': return "bg-gradient-to-br from-fuchsia-900 via-purple-900 to-black"; // Neon Cyberpunk
      case 'hong_kong': return "bg-gradient-to-br from-red-900 via-slate-900 to-black"; // Rojo Asiático
      case 'zurich': return "bg-gradient-to-br from-emerald-900 via-slate-900 to-black"; // Verde Dinero
      default: return "bg-slate-950";
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${getCityTheme(market.id)} animate-fade-in overflow-hidden`}>
       
       {/* FONDO DECORATIVO */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none"></div>

       {/* BARRA SUPERIOR DE NAVEGACIÓN */}
       <div className="flex items-center justify-between p-4 md:p-6 bg-black/40 backdrop-blur-md border-b border-white/10 z-20">
          <div className="flex items-center gap-6">
             <button 
                onClick={onBack}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/5 hover:border-white/20"
             >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> 
                <span className="font-bold text-sm">Volver al Mapa</span>
             </button>
             
             <div>
                <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3 uppercase tracking-tight drop-shadow-lg">
                   <MapPin className="text-yellow-500 fill-yellow-500/20" size={28} /> 
                   {market.name}
                </h1>
                <div className="flex items-center gap-3 text-xs md:text-sm font-medium text-white/60">
                   <span className="flex items-center gap-1"><Building2 size={12}/> Bolsa de Valores</span>
                   <span className="w-1 h-1 rounded-full bg-white/40"></span>
                   <span className="text-white/80">{market.region.toUpperCase()}</span>
                </div>
             </div>
          </div>

          {/* Datos Rápidos de la Plaza */}
          <div className="hidden md:flex gap-8">
             <div className="text-right">
                <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Latencia</div>
                <div className="text-lg font-mono font-bold text-green-400 flex items-center justify-end gap-2">
                    <Radio size={14} className="animate-pulse"/> 12ms
                </div>
             </div>
             <div className="text-right">
                <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Comisión</div>
                <div className="text-lg font-mono font-bold text-white">{(market.cost / 1000).toFixed(2)}%</div>
             </div>
          </div>
       </div>

       {/* CONTENIDO PRINCIPAL: La "Mesa de Operaciones" */}
       <div className="flex-1 p-4 md:p-8 flex gap-6 overflow-hidden relative z-10">
          
          {/* COLUMNA IZQUIERDA: TERMINAL (El núcleo) */}
          <div className="flex-1 h-full shadow-2xl rounded-[2rem] overflow-hidden border border-white/10 bg-slate-900/60 backdrop-blur-xl relative flex flex-col">
             {/* Barra de título de la terminal */}
             <div className="h-8 bg-black/40 border-b border-white/5 flex items-center px-4 gap-2">
                 <div className="flex gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                 </div>
                 <div className="ml-4 text-[10px] text-slate-500 font-mono uppercase">Terminal v2.5.0 • Conectado a {market.id.toUpperCase()}_RELAY</div>
             </div>
             
             {/* El componente Terminal Real */}
             <div className="flex-1 p-1">
                 <TradingTerminal 
                    allowedAssets={market.assets} 
                    defaultAsset={market.assets[0]}
                 />
             </div>
          </div>

          {/* COLUMNA DERECHA: CONTEXTO (Noticias / Personaje) */}
          <div className="w-80 hidden xl:flex flex-col gap-4">
              
              {/* Widget de Estado del Mercado */}
              <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  
                  <h3 className="relative z-10 font-bold text-white mb-4 flex items-center gap-2">
                     <Globe size={18} className="text-blue-400"/> Resumen Local
                  </h3>
                  
                  <div className="space-y-4 relative z-10">
                      <p className="text-sm text-slate-400 leading-relaxed">
                         El parqué de <strong>{market.name.split(' ')[0]}</strong> registra un alto volumen de transacciones en tecnológicas. Los inversores locales son optimistas.
                      </p>
                      
                      <div className="flex items-center gap-3 bg-black/30 p-3 rounded-xl border border-white/5">
                          <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                              <TrendingUp size={20}/>
                          </div>
                          <div>
                              <div className="text-[10px] text-slate-500 font-bold uppercase">Sentimiento</div>
                              <div className="text-sm font-bold text-white">Alcista (Bullish)</div>
                          </div>
                      </div>
                  </div>

                  {/* Decoración de fondo */}
                  <div className="absolute -bottom-6 -right-6 text-9xl opacity-5 grayscale group-hover:grayscale-0 transition-all duration-500">
                     🏙️
                  </div>
              </div>

              {/* Widget del Personaje (Placeholder Visual) */}
              <div className="flex-1 bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-md rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5"></div>
                  
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                      <span className="text-4xl">👨‍💻</span>
                  </div>
                  <h4 className="text-white font-bold mb-1">Operando en Sitio</h4>
                  <p className="text-xs text-slate-500 px-4">
                      Tu agente está conectado directamente al nodo de {market.name}.
                  </p>
              </div>

          </div>

       </div>
    </div>
  );
};
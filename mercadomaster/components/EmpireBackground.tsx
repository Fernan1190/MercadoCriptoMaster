import React from 'react';
import { useGame } from '../context/GameContext';

export const EmpireBackground: React.FC = () => {
  const { stats } = useGame();
  const { level, officeItems } = stats;

  // Determinar Nivel de Oficina (Tier) basado en el nivel del jugador
  let tier = 1;
  let bgClass = "bg-slate-950";

  if (level >= 5) { tier = 2; bgClass = "bg-zinc-900"; } // Garage
  if (level >= 10) { tier = 3; bgClass = "bg-blue-950"; } // Oficina
  if (level >= 20) { tier = 4; bgClass = "bg-indigo-950"; } // Rascacielos
  if (level >= 50) { tier = 5; bgClass = "bg-black"; } // Luna

  return (
    <div className={`fixed inset-0 -z-50 overflow-hidden transition-all duration-1000 ${bgClass}`}>
       
       {/* CAPA 1: AMBIENTE BASE */}
       {tier === 1 && ( // SÓTANO (Nivel 1-4)
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-slate-950 to-slate-950"></div>
       )}
       
       {tier === 2 && ( // GARAJE (Nivel 5-9)
          <>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] opacity-10"></div>
             <div className="absolute top-10 right-20 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"></div>
          </>
       )}

       {tier === 3 && ( // OFICINA (Nivel 10-19)
          <>
             <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/80 to-transparent"></div>
             {/* City Lights (Simuladas con dots) */}
             <div className="absolute bottom-0 w-full h-64 bg-[url('https://www.transparenttextures.com/patterns/city-lights.png')] opacity-20 animate-pulse"></div>
          </>
       )}

       {tier === 4 && ( // RASCACIELOS (Nivel 20-49)
          <>
             <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-purple-900/20"></div>
             {/* Nubes Flotantes */}
             <div className="absolute top-20 left-[-20%] w-[40%] h-32 bg-white/5 blur-3xl rounded-full animate-pulse"></div>
             <div className="absolute top-40 right-[-10%] w-[30%] h-24 bg-white/5 blur-3xl rounded-full animate-pulse"></div>
          </>
       )}

       {tier === 5 && ( // LUNA (Nivel 50+)
           <>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
              <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl animate-pulse"></div> 
              {/* Tierra a lo lejos */}
              <div className="absolute bottom-[-10%] left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
           </>
       )}

       {/* CAPA 2: DECORACIONES COMPRADAS (Objetos visuales) */}
       <div className="absolute inset-0 pointer-events-none">
           {officeItems.includes('plant') && (
               <div className="absolute bottom-0 left-10 text-6xl opacity-80 drop-shadow-2xl animate-bounce">🌿</div>
           )}
           {officeItems.includes('cat') && (
               <div className="absolute bottom-4 right-20 text-4xl opacity-90 drop-shadow-2xl animate-pulse">🐈</div>
           )}
           {officeItems.includes('trophy_gold') && (
               <div className="absolute top-20 left-10 text-6xl opacity-100 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">🏆</div>
           )}
           {officeItems.includes('setup_pro') && (
               <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-t from-blue-500/10 to-transparent blur-xl"></div>
           )}
       </div>

       {/* GRID SUPERPUESTO SIEMPRE (Estilo Matrix/Tech) */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px]"></div>
    </div>
  );
};
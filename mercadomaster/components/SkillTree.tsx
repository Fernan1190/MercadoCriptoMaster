import React from 'react';
import { useGame } from '../context/GameContext';
import { SKILL_TREE } from '../data/skills';
import { Lock, Unlock, ArrowRight, Brain, Pickaxe, TrendingUp } from 'lucide-react';

export const SkillTree: React.FC = () => {
  const { stats, actions } = useGame();
  const { unlockSkill } = actions;

  // Función para dibujar líneas de conexión
  const renderConnections = () => {
      return SKILL_TREE.map(skill => {
          if (skill.requires.length === 0) return null;
          const parent = SKILL_TREE.find(s => s.id === skill.requires[0]);
          if (!parent) return null;

          // Coordenadas simplificadas para grid
          // Asumimos celdas de 100x100px
          const x1 = (parent.x + 3) * 120 + 60; // Offset para centrar
          const y1 = parent.y * 150 + 40;
          const x2 = (skill.x + 3) * 120 + 60;
          const y2 = skill.y * 150 + 40;

          const isUnlocked = stats.unlockedSkills.includes(skill.id);
          
          return (
              <line 
                key={`${parent.id}-${skill.id}`} 
                x1={x1} y1={y1} x2={x2} y2={y2} 
                stroke={isUnlocked ? "#4ade80" : "#334155"} 
                strokeWidth="4" 
              />
          );
      });
  };

  return (
    <div className="p-8 pb-24 h-full bg-slate-950 overflow-y-auto relative">
       <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-2 flex justify-center items-center gap-3">
             <Brain className="text-fuchsia-500"/> Árbol de Talentos
          </h1>
          <p className="text-slate-400">Puntos Disponibles: <span className="text-yellow-400 font-bold text-xl">{stats.skillPoints}</span></p>
       </div>

       {/* Contenedor Scrollable del Árbol */}
       <div className="relative min-w-[800px] min-h-[600px] mx-auto bg-slate-900/50 rounded-3xl border border-slate-800 p-10 shadow-inner">
           
           {/* Capa SVG para líneas */}
           <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
               {renderConnections()}
           </svg>

           {/* Nodos */}
           {SKILL_TREE.map(skill => {
               const isUnlocked = stats.unlockedSkills.includes(skill.id);
               const canUnlock = !isUnlocked && (skill.requires.length === 0 || skill.requires.every(r => stats.unlockedSkills.includes(r)));
               const canAfford = stats.skillPoints >= skill.cost;

               // Posicionamiento absoluto basado en grid
               const style = {
                   left: `${(skill.x + 3) * 120}px`,
                   top: `${skill.y * 150}px`
               };

               let iconColor = "text-slate-500";
               let borderColor = "border-slate-700";
               if (isUnlocked) {
                   iconColor = skill.category === 'trader' ? 'text-blue-400' : skill.category === 'miner' ? 'text-orange-400' : 'text-fuchsia-400';
                   borderColor = skill.category === 'trader' ? 'border-blue-500' : skill.category === 'miner' ? 'border-orange-500' : 'border-fuchsia-500';
               } else if (canUnlock) {
                   borderColor = "border-white/50";
               }

               return (
                   <div key={skill.id} className="absolute w-32 z-10 flex flex-col items-center group" style={style}>
                       <button 
                           onClick={() => canUnlock && canAfford && unlockSkill(skill.id, skill.cost)}
                           disabled={isUnlocked || !canUnlock}
                           className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl border-4 transition-all shadow-lg relative
                               ${isUnlocked ? `bg-slate-900 ${borderColor} shadow-${iconColor}/20` : 'bg-slate-800'}
                               ${!isUnlocked && canUnlock ? 'hover:scale-110 cursor-pointer hover:border-yellow-400' : ''}
                               ${!isUnlocked && !canUnlock ? 'opacity-50 grayscale' : ''}
                           `}
                       >
                           {skill.icon}
                           {isUnlocked && <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1"><Unlock size={10} className="text-black"/></div>}
                           {!isUnlocked && canUnlock && <div className="absolute -bottom-2 -right-2 bg-slate-700 rounded-full p-1 border border-slate-500"><Lock size={10} className="text-white"/></div>}
                       </button>
                       
                       {/* Tooltip de Info */}
                       <div className="mt-2 text-center bg-black/80 p-2 rounded-lg border border-slate-700 w-40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute top-24 z-20">
                           <div className="text-xs font-bold text-white mb-1">{skill.title}</div>
                           <div className="text-[10px] text-slate-400 leading-tight">{skill.description}</div>
                           {!isUnlocked && (
                               <div className={`text-xs font-bold mt-2 ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                                   Coste: {skill.cost} SP
                               </div>
                           )}
                       </div>
                   </div>
               );
           })}
       </div>
    </div>
  );
};
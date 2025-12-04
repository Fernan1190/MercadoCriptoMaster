import React from 'react';
import { useGame } from '../context/GameContext';
import { MessageSquare, AlertTriangle, X } from 'lucide-react';

export const NpcEventModal: React.FC = () => {
  const { currentNpcEvent, clearNpcEvent, actions } = useGame();
  const { handleNpcAction } = actions;

  if (!currentNpcEvent) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-bounce-in">
       <div className="max-w-lg w-full bg-slate-900 border-2 border-slate-700 rounded-3xl overflow-hidden shadow-2xl relative">
           <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 flex items-center gap-4 border-b border-slate-800">
               <div className="text-6xl filter drop-shadow-lg animate-pulse">{currentNpcEvent.npcAvatar}</div>
               <div>
                   <div className="text-xs text-indigo-300 font-bold uppercase tracking-widest mb-1">Nueva Visita</div>
                   <h2 className="text-2xl font-black text-white">{currentNpcEvent.npcName}</h2>
               </div>
               <button onClick={clearNpcEvent} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
           </div>

           <div className="p-8">
               <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 mb-8 relative">
                   <div className="absolute -top-3 -left-3 bg-slate-700 rounded-full p-1.5"><MessageSquare size={16} className="text-white"/></div>
                   <p className="text-slate-300 italic text-lg leading-relaxed">"{currentNpcEvent.dialogue}"</p>
               </div>

               <div className="grid gap-3">
                   {currentNpcEvent.options.map((option, i) => (
                       <button 
                           key={i}
                           onClick={() => handleNpcAction(option.actionId)}
                           className={`w-full py-4 px-6 rounded-xl font-bold text-left flex justify-between items-center transition-all hover:scale-[1.02] active:scale-95 ${option.risk === 'high' ? 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400' : option.risk === 'medium' ? 'bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white'}`}
                       >
                           <span>{option.text}</span>
                           {option.risk !== 'none' && <span className="text-[10px] uppercase bg-black/30 px-2 py-1 rounded flex items-center gap-1"><AlertTriangle size={10}/> Riesgo: {option.risk}</span>}
                       </button>
                   ))}
               </div>
           </div>
       </div>
    </div>
  );
};
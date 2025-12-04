import React from 'react';
import { useGame } from '../context/GameContext';
import { User, Award, Target, Zap, BrainCircuit, Shield, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

export const Profile: React.FC = () => {
  const { stats } = useGame();

  // Calcular estadísticas derivadas
  const accuracy = stats.questionsAnswered > 0 
    ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) 
    : 0;
  
  const mistakesCount = stats.mistakes?.length || 0;
  
  // Nivel visual de perfil
  let rankTitle = "Novato";
  if (stats.level >= 5) rankTitle = "Aprendiz";
  if (stats.level >= 10) rankTitle = "Trader";
  if (stats.level >= 20) rankTitle = "Maestro";

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto pb-24 animate-fade-in">
       
       {/* Header del Perfil */}
       <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
             <img 
               src={`https://api.dicebear.com/7.x/bottts/svg?seed=${stats.league}`} 
               alt="Avatar" 
               className="w-32 h-32 rounded-full bg-slate-900 border-4 border-slate-800 relative z-10 shadow-2xl" 
             />
             <div className="absolute -bottom-3 -right-3 bg-slate-800 p-2 rounded-xl border border-slate-700 z-20">
                <span className="text-2xl font-black text-white">{stats.level}</span>
             </div>
          </div>
          
          <div className="text-center md:text-left">
             <div className="inline-block px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Licencia de {rankTitle}
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-white mb-2">Trader Anónimo</h1>
             <div className="flex items-center justify-center md:justify-start gap-4 text-slate-400 text-sm font-medium">
                <span className="flex items-center gap-1"><Shield size={14}/> Liga {stats.league}</span>
                <span className="flex items-center gap-1"><User size={14}/> Miembro desde 2024</span>
             </div>
          </div>
       </div>

       {/* Grid de Estadísticas */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><Target size={24}/></div>
                <h3 className="font-bold text-white">Precisión</h3>
             </div>
             <div className="text-4xl font-black text-white">{accuracy}%</div>
             <p className="text-slate-500 text-xs mt-2">{stats.correctAnswers} aciertos de {stats.questionsAnswered}</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-xl"><Zap size={24}/></div>
                <h3 className="font-bold text-white">Racha Máxima</h3>
             </div>
             <div className="text-4xl font-black text-white">{stats.streak}</div>
             <p className="text-slate-500 text-xs mt-2">Días seguidos aprendiendo</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500/20 text-green-400 rounded-xl"><TrendingUp size={24}/></div>
                <h3 className="font-bold text-white">Patrimonio</h3>
             </div>
             <div className="text-4xl font-black text-white">${Math.floor(stats.balance / 1000)}k</div>
             <p className="text-slate-500 text-xs mt-2">Capital total simulado</p>
          </div>
       </div>

       {/* BÓVEDA DE ERRORES (BRAIN GYM) */}
       <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 p-8 rounded-[2.5rem] border border-red-500/20 relative overflow-hidden mb-12">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
             <div>
                <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                   <BrainCircuit className="text-red-400"/> Gimnasio Mental
                </h2>
                <p className="text-slate-300 max-w-md text-lg">
                   Tienes <strong className="text-white">{mistakesCount} errores</strong> registrados en tu bóveda. Repasarlos es la forma más rápida de aprender.
                </p>
             </div>
             
             <button 
                className={`px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-xl transition-transform active:scale-95
                   ${mistakesCount > 0 
                      ? 'bg-red-500 hover:bg-red-400 text-white cursor-pointer' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                disabled={mistakesCount === 0}
                onClick={() => alert("El modo repaso estará disponible en la próxima versión.")}
             >
                {mistakesCount > 0 ? <><Zap fill="currentColor"/> ENTRENAR FALLOS</> : <><CheckCircle/> TODO LIMPIO</>}
             </button>
          </div>
       </div>

       {/* Galería de Logros */}
       <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Award className="text-purple-400"/> Logros Desbloqueados</h3>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.unlockedAchievements.map(achId => (
             <div key={achId} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 mb-3">
                   <Award size={24}/>
                </div>
                <span className="text-white font-bold text-sm capitalize">{achId.replace('_', ' ')}</span>
             </div>
          ))}
          {stats.unlockedAchievements.length === 0 && (
             <p className="text-slate-500 italic col-span-4">Aún no has conseguido logros. ¡Sigue jugando!</p>
          )}
       </div>
    </div>
  );
};
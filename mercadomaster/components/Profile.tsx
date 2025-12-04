import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { User, Award, Target, Zap, BrainCircuit, Shield, TrendingUp, CheckCircle, PenTool, Plus, Save } from 'lucide-react';

export const Profile: React.FC = () => {
  const { stats, actions } = useGame();
  const { addCustomQuestion } = actions; 

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

  // Estados para el Modo Profesor
  const [showCreator, setShowCreator] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ q: "", a: "", w1: "", w2: "" });

  const handleSaveQuestion = () => {
      if (!newQuestion.q || !newQuestion.a) return alert("Rellena al menos pregunta y respuesta correcta.");
      
      const qData = {
          type: 'multiple_choice' as const,
          question: newQuestion.q,
          options: [newQuestion.a, newQuestion.w1, newQuestion.w2].filter(Boolean).sort(() => 0.5 - Math.random()),
          correctAnswerText: newQuestion.a,
          correctIndex: 0, 
          difficulty: 'medium' as const,
          explanation: "Pregunta creada por la comunidad.",
          tags: ['#custom']
      };
      
      // Ajustar el índice correcto después de barajar (el array options ya está mezclado)
      qData.correctIndex = qData.options.indexOf(newQuestion.a);

      addCustomQuestion(qData);
      alert("¡Pregunta guardada! Aparecerá en tus próximas sesiones de repaso.");
      setShowCreator(false);
      setNewQuestion({ q: "", a: "", w1: "", w2: "" });
  };

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

       {/* MEJORA 5: MODO PROFESOR (Creador de Preguntas) */}
       <div className="mb-12 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden">
           <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <PenTool className="text-indigo-400"/> Taller del Profesor
               </h3>
               <button onClick={() => setShowCreator(!showCreator)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                   <Plus size={16}/> {showCreator ? 'Cerrar' : 'Crear Pregunta'}
               </button>
           </div>

           {showCreator ? (
               <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 animate-slide-up">
                   <div className="space-y-4">
                       <input 
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" 
                           placeholder="Escribe tu pregunta aquí..." 
                           value={newQuestion.q}
                           onChange={e => setNewQuestion({...newQuestion, q: e.target.value})}
                       />
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <input className="bg-green-900/20 border border-green-500/30 rounded-xl p-3 text-green-200 placeholder-green-700" placeholder="Respuesta Correcta" value={newQuestion.a} onChange={e => setNewQuestion({...newQuestion, a: e.target.value})} />
                           <input className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 text-red-200 placeholder-red-800" placeholder="Respuesta Incorrecta 1" value={newQuestion.w1} onChange={e => setNewQuestion({...newQuestion, w1: e.target.value})} />
                           <input className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 text-red-200 placeholder-red-800" placeholder="Respuesta Incorrecta 2" value={newQuestion.w2} onChange={e => setNewQuestion({...newQuestion, w2: e.target.value})} />
                       </div>
                       <button onClick={handleSaveQuestion} className="w-full py-3 bg-white text-slate-900 font-black rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2">
                           <Save size={18}/> Guardar en la Base de Datos
                       </button>
                   </div>
               </div>
           ) : (
               <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
                   <p>Contribuye a la comunidad creando contenido educativo.</p>
                   <p className="text-xs mt-2">Ganas 10 Coins por cada pregunta aprobada.</p>
               </div>
           )}
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
                // Redirige al modo aprender y lanza el Brain Gym (requiere que Learn.tsx maneje esto o el usuario navegue manualmente)
                onClick={() => {
                    const learnButton = document.querySelector('a[href="/learn"]') as HTMLElement;
                    if(learnButton) {
                        learnButton.click();
                        // Nota: En una implementación completa, usaríamos un parámetro URL (?mode=braingym)
                        setTimeout(() => alert("¡Ve a la sección 'Aprender' y pulsa 'Gimnasio Mental'!"), 500);
                    }
                }}
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
import React, { useState, useEffect } from 'react';
import { LessonContent } from '../../types';
import { Volume1, BookMarked, Wand2, BrainCircuit, ChevronUp, ChevronDown, AlertTriangle, Lightbulb, ArrowRight, Gem, Bot, Edit3, Save } from 'lucide-react';
import { EducationalChart } from './EducationalChart';
import { GLOSSARY } from '../../data/glossary';
import { useGame } from '../../context/GameContext'; 

interface LessonTheoryProps {
  activeLesson: LessonContent;
  currentSlideIndex: number;
  terminalMode: boolean;
  simplifiedSlide: string | null;
  setCurrentSlideIndex: React.Dispatch<React.SetStateAction<number>>;
  setPhase: (phase: 'quiz') => void;
  onSpeak: (text: string) => void;
  onBookmark: (term: string) => void;
  onSimplify: () => void;
}

// Componente interno para texto con tooltips
const RichText = ({ content, onHoverTerm }: { content: string, onHoverTerm: (term: string | null, definition: string | null) => void }) => {
  const cleanContent = content.replace(/<\/?(span|div|p|script|iframe)[^>]*>/gi, "");
  const parts = cleanContent.split(/(\*\*.*?\*\*)/g);

  return (
    <span className="leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const term = part.slice(2, -2);
          const glossaryKey = Object.keys(GLOSSARY).find(key => term.toLowerCase().includes(key.toLowerCase()));
          const definition = glossaryKey ? GLOSSARY[glossaryKey] : null;

          return (
             <strong 
               key={i} 
               className={`font-black px-1 rounded transition-all duration-200 border-b-2 
                 ${definition 
                    ? 'text-yellow-300 border-yellow-500/50 bg-yellow-500/10 cursor-help hover:bg-yellow-500/30' 
                    : 'text-white border-transparent'}`}
               onMouseEnter={() => definition && onHoverTerm(term, definition)}
               onMouseLeave={() => onHoverTerm(null, null)}
             >
               {term}
             </strong>
          );
        }
        return <span key={i} className="text-slate-300">{part}</span>;
      })}
    </span>
  );
};

export const LessonTheory: React.FC<LessonTheoryProps> = ({
  activeLesson,
  currentSlideIndex,
  terminalMode,
  simplifiedSlide,
  setCurrentSlideIndex,
  setPhase,
  onSpeak,
  onBookmark,
  onSimplify
}) => {
  const { stats, actions } = useGame();
  const [activeTerm, setActiveTerm] = useState<{term: string, def: string} | null>(null);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [checkpointAnswered, setCheckpointAnswered] = useState<boolean | null>(null);
  const [canContinueSlide, setCanContinueSlide] = useState(false);
  
  // Estado para notas
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
     setCanContinueSlide(false);
     setShowDeepDive(false);
     setCheckpointAnswered(null);
     const timer = setTimeout(() => setCanContinueSlide(true), 1500); 
     return () => clearTimeout(timer);
  }, [currentSlideIndex]);

  // Cargar nota guardada
  useEffect(() => {
    if (activeLesson.id && stats.lessonNotes[activeLesson.id]) {
        setNote(stats.lessonNotes[activeLesson.id]);
    }
  }, [activeLesson.id, stats.lessonNotes]);

  const handleSaveNote = () => {
      if (activeLesson.id) {
          actions.saveLessonNote(activeLesson.id, note);
          actions.playSound('success');
      }
  };

  const slide = activeLesson.slides[currentSlideIndex];
  const isStatic = activeLesson.generatedBy === 'static';

  const handleHoverTerm = (term: string | null, def: string | null) => {
      if (term && def) setActiveTerm({ term, def });
      else setActiveTerm(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center bg-slate-950 relative custom-scrollbar">
       <div className="bg-grid-pattern absolute inset-0 opacity-10 pointer-events-none"></div>
       
       <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border z-20 shadow-lg ${isStatic ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
          {isStatic ? <Gem size={12}/> : <Bot size={12}/>}
          {isStatic ? "Contenido Maestro" : "Lección Procedural"}
       </div>

       {slide && (
          <div className="max-w-3xl w-full flex flex-col items-center mt-4 md:mt-10 animate-fade-in relative z-10">
             
             <div className="mb-8 relative group">
                 <div className="absolute inset-0 bg-blue-500 blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                 <div className="text-8xl relative z-10 animate-float drop-shadow-2xl">{slide.icon}</div>
             </div>
             
             <h1 className="text-4xl md:text-5xl font-black text-white text-center mb-10 leading-tight tracking-tight drop-shadow-lg">{slide.title}</h1>

             <div className={`bg-slate-900/90 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-slate-800 shadow-2xl relative w-full group hover:border-blue-500/30 transition-colors ${terminalMode ? 'font-mono' : ''}`}>
                <div className="absolute -top-5 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <button onClick={() => onSpeak(slide.content)} className="p-2 bg-slate-800 rounded-lg border border-slate-700 hover:text-green-400 shadow-lg text-slate-400" title="Leer"><Volume1 size={18}/></button>
                   <button onClick={() => onBookmark(slide.title)} className="p-2 bg-slate-800 rounded-lg border border-slate-700 hover:text-yellow-400 shadow-lg text-slate-400" title="Guardar"><BookMarked size={18}/></button>
                   <button onClick={onSimplify} className="p-2 bg-slate-800 rounded-lg border border-slate-700 hover:text-blue-400 shadow-lg text-slate-400" title="Explicar Simple"><Wand2 size={18}/></button>
                </div>
                
                {slide.visualType && slide.visualType !== 'none' && (
                   <EducationalChart type={slide.visualType} meta={slide.visualMeta} />
                )}

                <div className="prose prose-invert prose-xl leading-loose text-slate-300 relative">
                   {/* GLOSARIO FLOTANTE */}
                   {activeTerm && (
                      <div className="absolute -top-24 left-0 w-full z-50 pointer-events-none animate-slide-up">
                          <div className="bg-slate-800 border-l-4 border-yellow-400 text-white p-4 rounded-r-lg shadow-2xl flex flex-col items-start gap-1">
                              <span className="text-yellow-400 font-black text-xs uppercase tracking-wider">Definición</span>
                              <span className="font-bold text-lg">{activeTerm.term}</span>
                              <span className="text-sm text-slate-300">{activeTerm.def}</span>
                          </div>
                      </div>
                   )}

                   {simplifiedSlide ? (
                     <div className="animate-fade-in bg-blue-900/20 p-6 rounded-2xl border border-blue-500/30">
                       <p className="text-blue-200 font-medium text-xl">👶 "{simplifiedSlide}"</p>
                     </div>
                   ) : (
                     <RichText content={slide.content} onHoverTerm={handleHoverTerm} />
                   )}
                </div>
             </div>

             <div className="w-full grid gap-4 mt-6">
                 {slide.deepDive && (
                    <div className="w-full bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                       <button onClick={() => setShowDeepDive(!showDeepDive)} className="w-full p-4 flex justify-between items-center hover:bg-slate-800 transition-colors">
                          <span className="font-bold text-indigo-400 flex items-center gap-2"><BrainCircuit size={20}/> Profundizar (Deep Dive)</span>
                          {showDeepDive ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                       </button>
                       {showDeepDive && (
                          <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-slate-300 text-sm animate-slide-up">
                             <h4 className="font-bold text-white mb-2">{slide.deepDive?.title}</h4>
                             <p>{slide.deepDive?.content}</p>
                          </div>
                       )}
                    </div>
                 )}

                 {/* CUADERNO DE NOTAS (NUEVO) */}
                 <div className="w-full bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                     <button onClick={() => setShowNote(!showNote)} className="w-full p-4 flex justify-between items-center hover:bg-slate-800 transition-colors">
                        <span className="font-bold text-emerald-400 flex items-center gap-2"><Edit3 size={20}/> Mis Notas</span>
                        {showNote ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                     </button>
                     {showNote && (
                        <div className="p-4 bg-slate-950/50 border-t border-slate-800 animate-slide-up">
                           <textarea 
                              className="w-full h-32 bg-slate-800 rounded-xl p-3 text-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none mb-2"
                              placeholder="Escribe aquí tus conclusiones clave sobre esta lección..."
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                           />
                           <button onClick={handleSaveNote} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                              <Save size={16}/> Guardar Nota
                           </button>
                        </div>
                     )}
                 </div>

                 {slide.checkpointQuestion && checkpointAnswered === null && (
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mt-4 text-center animate-slide-up">
                       <p className="font-bold text-white mb-4">{slide.checkpointQuestion?.question}</p>
                       <div className="flex gap-4 justify-center">
                          <button onClick={() => setCheckpointAnswered(true === slide.checkpointQuestion?.answer)} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold">Verdadero / Sí</button>
                          <button onClick={() => setCheckpointAnswered(false === slide.checkpointQuestion?.answer)} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold">Falso / No</button>
                       </div>
                    </div>
                 )}
                 {checkpointAnswered !== null && (
                    <div className={`p-4 rounded-xl text-center font-bold ${checkpointAnswered ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                       {checkpointAnswered ? "¡Correcto! Entendiste el concepto." : "Ups, revisa de nuevo la explicación."}
                    </div>
                 )}
             </div>
             
             <button 
                onClick={() => currentSlideIndex < activeLesson.slides.length - 1 ? setCurrentSlideIndex(p => p+1) : setPhase('quiz')}
                disabled={!canContinueSlide}
                className="mt-12 w-full max-w-sm bg-white hover:bg-slate-200 disabled:bg-slate-800 disabled:text-slate-600 text-slate-900 font-black py-4 rounded-2xl shadow-xl transition-all flex justify-center items-center gap-2 text-xl active:scale-95"
             >
                {currentSlideIndex < activeLesson.slides.length - 1 ? 'SIGUIENTE' : 'EMPEZAR RETO'} <ArrowRight size={24}/>
             </button>
          </div>
       )}
    </div>
  );
};
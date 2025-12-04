import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext'; 
import { XCircle, Timer, Heart, BrainCircuit, History, Share2, PenTool } from 'lucide-react';
import { PathId, LessonContent, Unit, LearningPath, GameMode } from '../types';
import { getLesson, generateBrainGymLesson, generateHistoricalLesson } from '../services/contentService';
import { simplifyText } from '../services/geminiService';
import { LessonMap } from './learn/LessonMap';
import { LessonTheory } from './learn/LessonTheory';
import { LessonOverlays } from './learn/LessonOverlays';

const PATHS: Record<PathId, LearningPath> = {
  [PathId.STOCKS]: {
    id: PathId.STOCKS,
    title: "Inversor de Bolsa",
    description: "Domina Wall Street desde cero",
    icon: "📈",
    themeColor: "indigo",
    units: [
      { id: 's1', title: "Fundamentos del Mercado", description: "Qué es la bolsa y por qué se mueve", color: "indigo", totalLevels: 10, biome: 'forest' },
      { id: 's2', title: "Análisis Fundamental", description: "Leer balances y entender valor", color: "blue", totalLevels: 15, biome: 'ocean' },
      { id: 's3', title: "Análisis Técnico", description: "Gráficos, tendencias y velas", color: "sky", totalLevels: 20, biome: 'neon' },
      { id: 's4', title: "Psicología del Trading", description: "Control emocional y disciplina", color: "violet", totalLevels: 15, biome: 'volcano' },
      { id: 's5', title: "Estrategias Avanzadas", description: "Opciones, futuros y hedging", color: "purple", totalLevels: 40, biome: 'space' },
    ]
  },
  [PathId.CRYPTO]: {
    id: PathId.CRYPTO,
    title: "Experto Cripto",
    description: "Blockchain, Bitcoin y DeFi",
    icon: "🚀",
    themeColor: "violet",
    units: [
      { id: 'c1', title: "Blockchain 101", description: "La tecnología del futuro", color: "violet", totalLevels: 10, biome: 'neon' },
      { id: 'c2', title: "Bitcoin & Ethereum", description: "Las monedas principales", color: "fuchsia", totalLevels: 15, biome: 'space' },
      { id: 'c3', title: "Trading Cripto", description: "Volatilidad y Exchanges", color: "purple", totalLevels: 20, biome: 'volcano' },
      { id: 'c4', title: "DeFi & Web3", description: "Finanzas descentralizadas", color: "pink", totalLevels: 25, biome: 'ocean' },
      { id: 'c5', title: "NFTs y Metaverso", description: "Propiedad digital", color: "rose", totalLevels: 30, biome: 'forest' },
    ]
  }
};

type LessonPhase = 'intro' | 'theory' | 'quiz' | 'outro';

export const Learn: React.FC = () => {
  const { stats, actions } = useGame();
  const { updateStats, deductHeart, buyHearts, useItem, addBookmark, openChest, playSound, recordAnswer } = actions;

  const [selectedPathId, setSelectedPathId] = useState<PathId | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonContent | null>(null);
  const [phase, setPhase] = useState<LessonPhase>('intro');
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [simplifiedSlide, setSimplifiedSlide] = useState<string | null>(null);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [lootBoxOpen, setLootBoxOpen] = useState(false);
  const [terminalMode, setTerminalMode] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizHistory, setQuizHistory] = useState<boolean[]>([]);
  const [combo, setCombo] = useState(0);
  const [shake, setShake] = useState(false);
  const [explanationOverride, setExplanationOverride] = useState<string | null>(null);

  const [riskSliderValue, setRiskSliderValue] = useState(50);
  const [portfolioState, setPortfolioState] = useState<{ [key: string]: number }>({});
  const [sentimentState, setSentimentState] = useState<{ index: number; correctCount: number; answers: boolean[] }>({ index: 0, correctCount: 0, answers: [] });
  
  const [isMuted, setIsMuted] = useState(false);
  useEffect(() => { (window as any).isMuted = isMuted; }, [isMuted]);

  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  const [matchingState, setMatchingState] = useState<{
    selectedId: string | null;
    matchedIds: string[];
    shuffledItems: { id: string, text: string, type: 'left' | 'right', pairId: number }[];
  }>({ selectedId: null, matchedIds: [], shuffledItems: [] });

  const [orderingState, setOrderingState] = useState<{
    pool: string[];
    userOrder: string[];
  }>({ pool: [], userOrder: [] });

  const speakText = (text: string) => { if (isMuted) return; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'es-ES'; window.speechSynthesis.speak(u); };

  useEffect(() => {
    let timer: any;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      if (gameMode === 'time_trial') {
          setTimerActive(false);
          setPhase('outro');
      } else {
          setTimerActive(false);
          handleTimeUp();
      }
    }
    return () => clearInterval(timer);
  }, [timeLeft, timerActive, gameMode]);

  useEffect(() => {
    if (!activeLesson || !activeLesson.quiz[currentQuestionIndex]) return;
    const q = activeLesson.quiz[currentQuestionIndex];

    setSelectedOption(null);
    setRiskSliderValue(50);

    if (q.type === 'matching' && q.pairs) {
        const items = q.pairs.flatMap((p, i) => [
            { id: `l-${i}`, text: p.left, type: 'left', pairId: i },
            { id: `r-${i}`, text: p.right, type: 'right', pairId: i }
        ]);
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        setMatchingState({ selectedId: null, matchedIds: [], shuffledItems: items as any });
    }

    if (q.type === 'ordering' && q.correctOrder) {
        const pool = [...q.correctOrder];
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        setOrderingState({ pool, userOrder: [] });
    }

    if (q.type === 'portfolio_balancing' && q.portfolioAssets) {
        const init: any = {};
        q.portfolioAssets.forEach(a => init[a.name] = 0);
        setPortfolioState(init);
    }

    if (q.type === 'sentiment_swipe') {
        setSentimentState({ index: 0, correctCount: 0, answers: [] });
    }

  }, [activeLesson, currentQuestionIndex]);

  const startBrainGym = () => {
      setIsLoading(true);
      setLoadingMessage("Recopilando tus fallos...");
      setLoadingProgress(50);
      
      setTimeout(() => {
          const lesson = generateBrainGymLesson(stats.mistakes || []);
          setActiveLesson(lesson);
          setIsLoading(false);
          setPhase('theory'); 
      }, 800);
  };

  const startTimeTravel = (era: '2008_crash') => {
      setIsLoading(true);
      setLoadingMessage("Calibrando Condensador de Fluzo...");
      
      setTimeout(() => {
          const lesson = generateHistoricalLesson(era);
          setActiveLesson(lesson);
          setIsLoading(false);
          setPhase('theory');
      }, 1000);
  };

  const copyDuelLink = () => {
      const duelCode = btoa(JSON.stringify({ u: stats.league, s: stats.xp })); // Código fake
      navigator.clipboard.writeText(`MercadoMaster Duel: ${duelCode}`);
      alert("¡Enlace de duelo copiado! Envíalo a un amigo (Simulado)");
      actions.playSound('pop');
  };

  const handleStartGameMode = async (mode: GameMode) => {
      setGameMode(mode);
      if (stats.hearts <= 0) { setShowGameOver(true); return; }
      
      setIsLoading(true);
      setLoadingMessage(mode === 'survival' ? "Preparando Supervivencia..." : "Calibrando Reloj...");
      setLoadingProgress(10);
      playSound('process');

      try {
          const lesson = await getLesson(PathId.STOCKS, 's1', 1, "Modo Juego", "Desafío");
          setLoadingProgress(100);
          
          setTimeout(() => {
              setActiveLesson(lesson);
              setIsLoading(false);
              setPhase('quiz'); 
              setCurrentQuestionIndex(0);
              
              if (mode === 'time_trial') {
                  setTimeLeft(60); 
                  setTimerActive(true);
              } else if (mode === 'survival') {
                  setTimeLeft(0);
                  setTimerActive(false);
              }
          }, 500);
      } catch (e) {
          setIsLoading(false);
      }
  };

  const startLevel = async (unit: Unit, absoluteLevelIndex: number, levelInUnit: number) => {
    if (!selectedPathId) return;
    setGameMode('standard');
    if (stats.hearts <= 0) { setShowGameOver(true); return; }
    
    setCurrentUnit(unit);
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingMessage("Cargando Contenido...");
    playSound('process');

    const progressInterval = setInterval(() => {
       setLoadingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 15;
       });
    }, 100);

    try {
        const lesson = await getLesson(selectedPathId, unit.id, levelInUnit, PATHS[selectedPathId].title, unit.title);
        
        clearInterval(progressInterval);
        setLoadingProgress(100);
        
        setTimeout(() => {
            setActiveLesson(lesson);
            setIsLoading(false);
            setPhase('theory');
            setCurrentSlideIndex(0);
            setCurrentQuestionIndex(0);
            setQuizHistory([]);
        }, 300);
    } catch (e) { 
        clearInterval(progressInterval);
        setIsLoading(false);
        console.error("Lesson Load Failed", e);
    }
  };

  const handleTimeUp = useCallback(() => {
     setIsCorrect(false);
     setShowFeedback(true);
     setShake(true);
     deductHeart();
  }, [deductHeart]);

  const handleMatchClick = (item: any) => {
      if (matchingState.matchedIds.includes(item.id)) return;
      if (!matchingState.selectedId) {
          setMatchingState(prev => ({ ...prev, selectedId: item.id }));
      } else {
          if (matchingState.selectedId === item.id) {
              setMatchingState(prev => ({ ...prev, selectedId: null }));
              return;
          }
          const first = matchingState.shuffledItems.find(i => i.id === matchingState.selectedId);
          const second = item;
          
          if (first?.pairId === second.pairId) {
              playSound('pop');
              setMatchingState(prev => ({ ...prev, selectedId: null, matchedIds: [...prev.matchedIds, first!.id, second.id] }));
          } else {
              setShake(true);
              playSound('error');
              setTimeout(() => setShake(false), 500);
              setMatchingState(prev => ({ ...prev, selectedId: null }));
          }
      }
  };

  const handleOrderClick = (text: string, isRemoval: boolean) => {
      if (isRemoval) {
          setOrderingState(prev => ({ pool: [...prev.pool, text], userOrder: prev.userOrder.filter(t => t !== text) }));
      } else {
          setOrderingState(prev => ({ userOrder: [...prev.userOrder, text], pool: prev.pool.filter(t => t !== text) }));
      }
      playSound('pop');
  };

  const checkAnswer = () => {
    if (!activeLesson) return;
    if (gameMode !== 'time_trial') setTimerActive(false);

    const q = activeLesson.quiz?.[currentQuestionIndex];
    if (!q) return;

    let correct = false;

    if (q.type === 'matching') {
        correct = matchingState.matchedIds.length === matchingState.shuffledItems.length;
    } 
    else if (q.type === 'ordering') {
        correct = JSON.stringify(orderingState.userOrder) === JSON.stringify(q.correctOrder);
    }
    else if (q.type === 'portfolio_balancing') {
        const total = Object.values(portfolioState).reduce((a, b) => a + b, 0);
        if (Math.abs(total - 100) > 1) { alert("El total debe sumar 100%"); return; }
        
        let currentRisk = 0;
        q.portfolioAssets!.forEach(a => {
            currentRisk += (portfolioState[a.name] || 0) / 100 * a.riskScore;
        });
        const target = q.portfolioTargetRisk || 50;
        correct = Math.abs(currentRisk - target) <= 15;
    }
    else if (q.type === 'risk_slider') {
        const target = q.riskScenario?.correctValue || 50;
        const tol = q.riskScenario?.tolerance || 15;
        correct = Math.abs(riskSliderValue - target) <= tol;
    }
    else if (q.type === 'candle_chart') {
        const trend = q.chartData?.trend;
        correct = (trend === 'up' && selectedOption === 0) || (trend === 'down' && selectedOption === 1);
    }
    else if (q.type === 'sentiment_swipe') {
        correct = sentimentState.correctCount >= (q.sentimentCards?.length || 0) * 0.8; 
    }
    else if (q.type === 'cloze') {
        if (selectedOption !== null && q.clozeOptions && q.correctAnswerText) {
            correct = q.clozeOptions[selectedOption] === q.correctAnswerText;
        }
    }
    else {
        const indexMatch = selectedOption === q.correctIndex;
        let textMatch = false;
        if (selectedOption !== null && q.options && q.options[selectedOption]) {
            const selectedText = q.options[selectedOption].replace(/^[a-z0-9][\)\.]\s*/i, "").trim().toLowerCase();
            const correctText = (q.correctAnswerText || "").replace(/^[a-z0-9][\)\.]\s*/i, "").trim().toLowerCase();
            textMatch = selectedText === correctText;
        }
        correct = indexMatch || textMatch;
    }

    recordAnswer(correct, q);

    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setCombo(c => c + 1);
      playSound('success');
    } else {
      setCombo(0);
      setShake(true);
      deductHeart();
      playSound('error');
      if (gameMode === 'survival') {
          setTimeout(() => setShowGameOver(true), 1000);
      }
    }
  };

  const nextQuestion = useCallback(() => {
    if (!activeLesson) return;
    
    setExplanationOverride(null);
    setShowFeedback(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setShake(false);
    
    if (stats.hearts === 0 && gameMode !== 'time_trial') { setShowGameOver(true); return; }

    if (currentQuestionIndex < activeLesson.quiz.length - 1) {
      setCurrentQuestionIndex(p => p + 1);
    } else {
      setPhase('outro');
      playSound('levelUp');
      setTimeout(() => setLootBoxOpen(true), 500);
    }
  }, [activeLesson, currentQuestionIndex, gameMode, playSound, stats.hearts]);

  const q = activeLesson?.quiz[currentQuestionIndex];
  const isMinigameBroken = q && (
      (q.type === 'portfolio_balancing' && !q.portfolioAssets) || 
      (q.type === 'sentiment_swipe' && !q.sentimentCards) ||
      (q.type === 'matching' && !q.pairs)
  );

  useEffect(() => {
    if (isMinigameBroken) {
        const timer = setTimeout(() => nextQuestion(), 100);
        return () => clearTimeout(timer);
    }
  }, [isMinigameBroken, nextQuestion]);

  const closeLesson = () => {
    if (!selectedPathId) return;
    const baseXP = gameMode === 'survival' ? 100 : 25;
    updateStats(baseXP, selectedPathId, gameMode === 'standard' ? 1 : 0, quizHistory.every(Boolean));
    setActiveLesson(null);
    setPhase('intro');
  };

  if (isLoading || showGameOver || phase === 'outro') {
     return <LessonOverlays 
        isLoading={isLoading} 
        loadingMessage={loadingMessage} 
        loadingProgress={loadingProgress}
        showGameOver={showGameOver} 
        onBuyHearts={() => { if(buyHearts()) setShowGameOver(false); }}
        onCloseGameOver={() => { setActiveLesson(null); setShowGameOver(false); }}
        phase={phase} 
        lootBoxOpen={lootBoxOpen} 
        setLootBoxOpen={setLootBoxOpen} 
        onCloseLesson={closeLesson}
        onCancelLoading={() => setIsLoading(false)}
        rewardAmount={activeLesson?.isBossLevel ? 50 : 25}
     />;
  }

  if (!activeLesson) {
     return (
        <div className="h-full flex flex-col">
            {/* --- BARRA DE HERRAMIENTAS NUEVA (Mejoras 1, 2, 4, 5) --- */}
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex gap-4 overflow-x-auto">
                <button onClick={startBrainGym} className="flex items-center gap-2 bg-fuchsia-900/20 text-fuchsia-400 px-4 py-2 rounded-xl border border-fuchsia-500/30 hover:bg-fuchsia-900/40 transition-all font-bold text-xs whitespace-nowrap">
                    <BrainCircuit size={16}/> Gimnasio Mental
                </button>
                
                <button onClick={() => startTimeTravel('2008_crash')} className="flex items-center gap-2 bg-amber-900/20 text-amber-400 px-4 py-2 rounded-xl border border-amber-500/30 hover:bg-amber-900/40 transition-all font-bold text-xs whitespace-nowrap">
                    <History size={16}/> Crash 2008
                </button>

                <button onClick={copyDuelLink} className="flex items-center gap-2 bg-blue-900/20 text-blue-400 px-4 py-2 rounded-xl border border-blue-500/30 hover:bg-blue-900/40 transition-all font-bold text-xs whitespace-nowrap">
                    <Share2 size={16}/> Desafiar Amigo
                </button>
                
                <button onClick={() => (document.querySelector('a[href="/profile"]') as HTMLElement)?.click()} className="flex items-center gap-2 bg-slate-800 text-slate-400 px-4 py-2 rounded-xl border border-slate-700 hover:text-white transition-all font-bold text-xs whitespace-nowrap">
                    <PenTool size={16}/> Crear Pregunta
                </button>
            </div>

            <LessonMap 
               paths={PATHS} 
               selectedPathId={selectedPathId} 
               stats={stats} 
               onSelectPath={setSelectedPathId} 
               onStartLevel={startLevel}
               onStartGameMode={handleStartGameMode}
               onUpdateStats={updateStats}
               playSound={playSound}
               onOpenChest={openChest} 
            />
        </div>
     );
  }

  if (isMinigameBroken) {
      return <div className="flex justify-center items-center h-full text-white">Optimizando lección...</div>;
  }

  return (
    <div className={`fixed inset-0 bg-slate-950 z-50 flex flex-col overflow-hidden ${terminalMode ? 'font-mono text-green-400' : ''}`}>
       <div className="bg-slate-900/80 backdrop-blur-md p-3 md:p-4 flex items-center justify-between border-b border-slate-800 relative z-[100] shadow-lg">
           <button onClick={() => setActiveLesson(null)} className="text-slate-400 hover:text-white p-2 transition-colors"><XCircle size={24}/></button>
           
           {gameMode === 'time_trial' && (
               <div className="text-2xl font-black text-white flex items-center gap-2">
                   <Timer className={timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-blue-500'} /> 
                   {timeLeft}s
               </div>
           )}

           <div className="flex gap-3 items-center">
              {gameMode === 'survival' && <div className="text-red-500 font-bold uppercase animate-pulse">Muerte Súbita</div>}
              <div className="flex items-center text-red-500 font-bold gap-1 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 relative overflow-hidden">
                 <Heart size={18} fill="currentColor"/> {stats.hearts}
              </div>
           </div>
       </div>

       {phase === 'theory' ? (
          <LessonTheory 
             activeLesson={activeLesson} 
             currentSlideIndex={currentSlideIndex} 
             terminalMode={terminalMode}
             simplifiedSlide={simplifiedSlide}
             setCurrentSlideIndex={setCurrentSlideIndex}
             setPhase={setPhase}
             onSpeak={speakText}
             onBookmark={addBookmark}
             onSimplify={async () => {}} 
          />
       ) : (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center bg-slate-950 relative">
             <div className="bg-grid-pattern absolute inset-0 opacity-10 pointer-events-none"></div>
             
             <div className="max-w-3xl w-full relative z-10 mt-4 pb-32">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">{q.type.replace(/_/g, ' ')}</span>
                    <div className="flex gap-1">
                        {activeLesson.quiz.map((_, i) => (
                            <div key={i} className={`w-3 h-1 rounded-full ${i === currentQuestionIndex ? 'bg-white' : i < currentQuestionIndex ? 'bg-green-500' : 'bg-slate-800'}`}></div>
                        ))}
                    </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 text-center drop-shadow-md">{q.question}</h2>
                
                {/* --- RENDERIZADO DE PREGUNTAS --- */}
                
                {['multiple_choice', 'true_false', 'binary_prediction'].includes(q.type) && (
                      <div className="grid gap-4">
                         {q.options?.map((opt, i) => (
                            <button key={i} disabled={showFeedback} onClick={() => !showFeedback && setSelectedOption(i)}
                               className={`w-full p-5 rounded-2xl text-left transition-all text-lg font-medium shadow-lg border-2 relative overflow-hidden group
                                  ${selectedOption === i 
                                    ? 'bg-blue-600 border-blue-400 text-white' 
                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-750'}
                                  ${showFeedback && i === q.correctIndex ? '!bg-green-500 !border-green-400 !text-slate-900' : ''}
                                  ${showFeedback && selectedOption === i && i !== q.correctIndex ? '!bg-red-500 !border-red-400 !text-white' : ''}
                               `}
                            >
                               {opt}
                            </button>
                         ))}
                      </div>
                )}

                {q.type === 'candle_chart' && (
                    <div className="flex flex-col items-center">
                        <div className="w-full h-64 bg-slate-900 rounded-2xl border border-slate-700 mb-6 flex items-center justify-center">
                           <span className="text-slate-500">Gráfico Simulado: {q.chartData?.trend}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <button onClick={() => setSelectedOption(0)} className={`p-6 rounded-2xl border-2 font-bold ${selectedOption === 0 ? 'bg-green-600 text-white' : 'bg-slate-800 text-green-400'}`}>SUBIRÁ</button>
                            <button onClick={() => setSelectedOption(1)} className={`p-6 rounded-2xl border-2 font-bold ${selectedOption === 1 ? 'bg-red-600 text-white' : 'bg-slate-800 text-red-400'}`}>BAJARÁ</button>
                        </div>
                    </div>
                )}

                {q.type === 'matching' && (
                    <div className="grid grid-cols-2 gap-4">
                        {matchingState.shuffledItems.map(item => {
                            const isMatched = matchingState.matchedIds.includes(item.id);
                            const isSelected = matchingState.selectedId === item.id;
                            if (isMatched) return <div key={item.id} className="opacity-0"></div>;
                            return (
                                <button key={item.id} onClick={() => handleMatchClick(item)} disabled={showFeedback}
                                    className={`p-6 rounded-xl border-2 font-bold ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
                                    {item.text}
                                </button>
                            );
                        })}
                    </div>
                )}

                 {q.type === 'ordering' && (
                    <div className="space-y-4">
                        <div className="min-h-[60px] p-4 bg-slate-900 border border-dashed border-slate-700 rounded-xl flex flex-wrap gap-2">
                             {orderingState.userOrder.map((text, i) => (
                                <button key={i} onClick={() => !showFeedback && handleOrderClick(text, true)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">{text} x</button>
                             ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {orderingState.pool.map((text, i) => (
                                <button key={i} onClick={() => !showFeedback && handleOrderClick(text, false)} className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-slate-300">{text}</button>
                            ))}
                        </div>
                    </div>
                )}

                {q.type === 'risk_slider' && (
                    <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 text-center">
                        <div className="text-4xl font-black mb-4 text-white">{riskSliderValue}%</div>
                        <input type="range" min="0" max="100" value={riskSliderValue} onChange={(e) => setRiskSliderValue(Number(e.target.value))} className="w-full h-4 bg-slate-700 rounded-lg cursor-pointer accent-white" disabled={showFeedback} />
                    </div>
                )}

                {q.type === 'cloze' && q.clozeText && q.clozeOptions && (
                    <div className="flex flex-col gap-8">
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 text-xl md:text-2xl font-medium leading-relaxed text-center">
                            {q.clozeText.split('{0}').map((part, i) => (
                                <React.Fragment key={i}>
                                    {part}
                                    {i < q.clozeText!.split('{0}').length - 1 && (
                                        <span className={`inline-block min-w-[100px] px-3 py-1 mx-1 rounded-lg border-b-2 border-dashed align-bottom transition-all
                                            ${selectedOption !== null 
                                                ? 'bg-blue-600 text-white border-blue-400' 
                                                : 'bg-slate-800 border-slate-600 text-slate-500'}`}
                                        >
                                            {selectedOption !== null ? q.clozeOptions![selectedOption] : "?"}
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {q.clozeOptions.map((opt, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => !showFeedback && setSelectedOption(i)}
                                    className={`p-4 rounded-xl font-bold text-lg border-2 transition-all
                                        ${selectedOption === i 
                                            ? 'bg-blue-600 border-blue-400 text-white' 
                                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}
                                        ${showFeedback && q.correctAnswerText === opt ? '!bg-green-600 !border-green-400 !text-white' : ''}
                                        ${showFeedback && selectedOption === i && q.correctAnswerText !== opt ? '!bg-red-600 !border-red-400 !text-white' : ''}
                                    `}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

             </div>

             {showFeedback ? (
                 <div className={`fixed bottom-0 left-0 w-full p-4 border-t border-slate-800 bg-slate-900 z-[100]`}>
                    <div className="max-w-3xl mx-auto">
                        <p className={`font-black text-xl mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{isCorrect ? '¡CORRECTO!' : 'INCORRECTO'}</p>
                        <p className="text-slate-300 mb-4">{explanationOverride || q?.explanation}</p>
                        <button onClick={nextQuestion} className="w-full py-4 rounded-2xl font-black bg-white text-slate-900">CONTINUAR</button>
                    </div>
                 </div>
             ) : (
                 <div className="fixed bottom-0 left-0 w-full p-4 z-50 bg-slate-900/90 border-t border-slate-800">
                     <button onClick={checkAnswer} 
                        disabled={
                            (q.type === 'matching' && matchingState.matchedIds.length !== matchingState.shuffledItems.length) ||
                            (q.type === 'ordering' && orderingState.pool.length > 0) ||
                            (q.type === 'sentiment_swipe' && sentimentState.index < (q.sentimentCards?.length || 0)) ||
                            ((q.type === 'cloze' || ['multiple_choice', 'true_false', 'binary_prediction', 'candle_chart'].includes(q.type)) && selectedOption === null)
                        }
                        className="w-full max-w-3xl mx-auto block py-4 rounded-2xl font-black bg-blue-600 text-white disabled:bg-slate-800 disabled:text-slate-500 transition-all">
                        COMPROBAR
                     </button>
                 </div>
             )}
          </div>
       )}
    </div>
  );
};
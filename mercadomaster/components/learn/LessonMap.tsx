
import React, { useEffect, useRef } from 'react';
import { UserStats, PathId, Unit, LearningPath, GameMode } from '../../types';
import { ArrowLeft, ArrowRight, Star, Lock, CheckCircle, Gift, Skull, MapPin, Heart, Coins, Target, Award, Zap, Timer, PackageOpen, MousePointerClick, Sparkles } from 'lucide-react';

interface LessonMapProps {
  paths: Record<PathId, LearningPath>;
  selectedPathId: PathId | null;
  stats: UserStats;
  onSelectPath: (id: PathId | null) => void;
  onStartLevel: (unit: Unit, absLevel: number, levelInUnit: number) => void;
  onStartGameMode: (mode: GameMode) => void;
  onUpdateStats: (xp: number, pathId: PathId, level: number, perfect: boolean) => void;
  playSound: (type: any) => void;
  onOpenChest: (chestId: string) => void;
}

// --- VISUAL COMPONENTS ---

const BiomeBackground = ({ biome, color }: { biome?: string, color: string }) => {
  // Generate deterministic random positions based on biome string length
  const generateElements = () => {
    const elements = [];
    const count = 12;
    
    for (let i = 0; i < count; i++) {
      const left = (i * 137) % 90 + 5; // Deterministic pseudo-random
      const top = (i * 293) % 90 + 5;
      const delay = i * 0.5;
      const duration = 10 + (i % 5);
      
      let content = null;

      switch (biome) {
        case 'neon': // Cyberpunk Grid / Tech
          content = (
            <div className={`w-px h-24 bg-gradient-to-b from-transparent via-${color}-500/50 to-transparent transform rotate-45`} />
          );
          break;
        case 'forest': // Organic / Stocks
          content = (
            <div className={`w-16 h-16 rounded-full border border-${color}-500/10 bg-${color}-500/5 backdrop-blur-sm`} />
          );
          break;
        case 'space': // Crypto / Future
          content = (
             <div className="relative">
                <div className="absolute w-1 h-1 bg-white rounded-full animate-ping" />
                <div className={`w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.5)]`} />
             </div>
          );
          break;
        case 'ocean': // Blue / Calm
          content = (
             <div className={`w-4 h-4 rounded-full bg-${color}-400/20 shadow-[0_0_15px_rgba(56,189,248,0.3)]`} />
          );
          break;
        case 'volcano': // Red / Intense
          content = (
             <div className="w-2 h-2 rotate-45 bg-red-500/20 blur-[1px]" />
          );
          break;
        default:
          content = <div className={`w-2 h-2 rounded-full bg-${color}-500/20`} />;
      }

      elements.push(
        <div 
          key={i} 
          className="absolute animate-float opacity-60 pointer-events-none"
          style={{ 
            left: `${left}%`, 
            top: `${top}%`, 
            animationDelay: `${delay}s`, 
            animationDuration: `${duration}s` 
          }}
        >
          {content}
        </div>
      );
    }
    return elements;
  };

  return <div className="absolute inset-0 overflow-hidden">{generateElements()}</div>;
};

export const LessonMap: React.FC<LessonMapProps> = ({ 
  paths, selectedPathId, stats, onSelectPath, onStartLevel, onStartGameMode, onUpdateStats, playSound, onOpenChest 
}) => {
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current level
  useEffect(() => {
    if (selectedPathId) {
      const currentProgress = stats.pathProgress[selectedPathId] || 0;
      // Delay slightly to allow layout to settle
      setTimeout(() => {
        const element = document.getElementById(`level-node-${currentProgress + 1}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [selectedPathId, stats.pathProgress]);

  // --- PATH SELECTION SCREEN ---
  if (!selectedPathId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6 animate-fade-in bg-slate-950 relative overflow-hidden h-full">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        
        <div className="text-center mb-12 relative z-10">
           <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              Academia Financiera
           </div>
           <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter drop-shadow-2xl">
              ELIGE TU <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">CAMINO</span>
           </h1>
           <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Selecciona una especialización para comenzar tu carrera. Aprende, practica y domina los mercados.
           </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-6xl relative z-10 px-4">
          {Object.values(paths).map(path => (
             <button key={path.id} onClick={() => onSelectPath(path.id)} 
                className={`group relative h-[400px] rounded-[2.5rem] text-left transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-800 bg-slate-900/50`}>
                
                {/* Hover Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${path.themeColor}-900/40 via-slate-900/80 to-slate-950 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-10">
                   <div className="flex justify-between items-start">
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-md shadow-xl group-hover:scale-110 transition-transform duration-500">
                        <span className="text-6xl filter drop-shadow-lg">{path.icon}</span>
                      </div>
                      <div className={`p-3 rounded-full border border-slate-700 text-slate-500 group-hover:text-${path.themeColor}-400 group-hover:border-${path.themeColor}-500/50 transition-colors`}>
                         <ArrowRight size={24} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500"/>
                      </div>
                   </div>
                   
                   <div className="mt-auto">
                      <h2 className="text-4xl font-black text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                          {path.title}
                      </h2>
                      <p className="text-slate-400 font-medium text-lg leading-relaxed mb-8 group-hover:text-slate-300 transition-colors">
                          {path.description}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className={`absolute left-0 top-0 h-full bg-${path.themeColor}-500 transition-all duration-1000 ease-out`} 
                              style={{ width: `${Math.min(100, (stats.pathProgress[path.id] || 0) * 2)}%` }}></div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                          <span>Progreso</span>
                          <span className={`text-${path.themeColor}-400`}>Nivel {stats.pathProgress[path.id] || 0}</span>
                      </div>
                   </div>
                </div>
             </button>
          ))}
        </div>
      </div>
    );
  }

  // --- MAIN MAP VIEW ---
  const path = paths[selectedPathId];
  const userPathProgress = stats.pathProgress[selectedPathId] || 0;
  let globalLevelIndex = 0;

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-x-hidden animate-fade-in font-sans selection:bg-indigo-500 selection:text-white">
       
       {/* Global Ambient Background */}
       <div className={`fixed inset-0 pointer-events-none bg-gradient-to-b from-${path.themeColor}-900/10 via-slate-950 to-slate-950`}></div>
       <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none opacity-50"></div>

       <div className="flex flex-col lg:flex-row max-w-screen-2xl mx-auto h-full relative z-10">
          
          {/* LEFT COLUMN: THE MAP */}
          <div className="flex-1 pb-40 lg:pb-0 relative" ref={scrollRef}>
             
             {/* Sticky Header */}
             <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 p-4 px-6 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-4">
                    <button onClick={() => onSelectPath(null)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700">
                        <ArrowLeft size={20}/>
                    </button>
                    <div className="flex flex-col">
                        <h2 className="font-black text-white uppercase tracking-wider text-sm flex items-center gap-2">
                            {path.icon} {path.title}
                        </h2>
                        <span className="text-xs text-slate-500 font-mono font-bold">NIVEL {userPathProgress}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => onStartGameMode('survival')} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all hover:scale-105">
                        <Skull size={14}/> <span className="hidden sm:inline">Supervivencia</span>
                    </button>
                    <button onClick={() => onStartGameMode('time_trial')} className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all hover:scale-105">
                        <Timer size={14}/> <span className="hidden sm:inline">Contrarreloj</span>
                    </button>
                </div>
             </div>

             {/* Map Content */}
             <div className="px-4">
                {path.units.map((unit, uIdx) => {
                    const start = globalLevelIndex;
                    globalLevelIndex += unit.totalLevels;
                    
                    // Optimization: Don't render units far behind
                    if (userPathProgress > start + unit.totalLevels + 2) return null;
                    if (userPathProgress < start - 5) return null; // Don't render units far ahead

                    return (
                    <div key={unit.id} className="relative py-12 md:py-24">
                        <BiomeBackground biome={unit.biome} color={unit.color} />

                        {/* Unit Header Card */}
                        <div className="relative z-20 mx-auto max-w-xl mb-16 text-center">
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full bg-${unit.color}-500/10 border border-${unit.color}-500/30 text-${unit.color}-400 text-xs font-black uppercase tracking-widest mb-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
                                <MapPin size={12}/> Unidad {uIdx + 1}
                            </div>
                            <h3 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-xl">{unit.title}</h3>
                            <p className="text-slate-400 font-medium text-sm md:text-base max-w-sm mx-auto leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800 backdrop-blur-md">
                                {unit.description}
                            </p>
                        </div>

                        {/* Levels Grid/Snake */}
                        <div className="flex flex-col items-center relative gap-4 md:gap-8 z-10">
                            {Array.from({length: unit.totalLevels}).map((_, i) => {
                                const absLevel = start + i + 1;
                                const isCompleted = absLevel <= userPathProgress;
                                const isCurrent = absLevel === userPathProgress + 1;
                                const isLocked = absLevel > userPathProgress + 1;
                                const isBoss = absLevel % 5 === 0;
                                const isChest = absLevel % 3 === 0 && !isBoss; 
                                
                                // Snake Math
                                const wave = Math.sin(absLevel * 0.7); 
                                const xOffset = wave * (window.innerWidth > 768 ? 140 : 80); 

                                const chestId = `${selectedPathId}-${unit.id}-${absLevel}`;
                                const isChestOpen = stats.openedChests?.includes(chestId);

                                return (
                                <div key={absLevel} className="relative flex justify-center items-center w-full h-28 md:h-32">
                                    
                                    {/* SVG Connector Line */}
                                    {i < unit.totalLevels - 1 && (
                                        <svg className="absolute top-1/2 left-1/2 w-full h-48 -z-10 overflow-visible pointer-events-none" style={{ transform: 'translate(-50%, 0)' }}>
                                            {/* Glow Layer */}
                                            <path 
                                                d={`M ${50 + (xOffset/5)}% 0 C ${50 + (xOffset/5)}% 50, ${50 + ((Math.sin((absLevel + 1) * 0.7) * (window.innerWidth > 768 ? 140 : 80))/5)}% 50, ${50 + ((Math.sin((absLevel + 1) * 0.7) * (window.innerWidth > 768 ? 140 : 80))/5)}% 120`}
                                                fill="none" 
                                                stroke={unit.color === 'indigo' ? '#6366f1' : unit.color === 'violet' ? '#8b5cf6' : '#3b82f6'} 
                                                strokeWidth="16"
                                                strokeOpacity="0.15"
                                                strokeLinecap="round"
                                            />
                                            {/* Core Layer */}
                                            <path 
                                                d={`M ${50 + (xOffset/5)}% 0 C ${50 + (xOffset/5)}% 50, ${50 + ((Math.sin((absLevel + 1) * 0.7) * (window.innerWidth > 768 ? 140 : 80))/5)}% 50, ${50 + ((Math.sin((absLevel + 1) * 0.7) * (window.innerWidth > 768 ? 140 : 80))/5)}% 120`}
                                                fill="none" 
                                                stroke={isCompleted ? (isBoss ? '#b91c1c' : '#475569') : '#1e293b'} 
                                                strokeWidth="6" 
                                                strokeLinecap="round"
                                                strokeDasharray={isLocked ? "10,10" : "0"}
                                            />
                                        </svg>
                                    )}

                                    {/* Level Node (3D Platform Style) */}
                                    <button 
                                        id={`level-node-${absLevel}`}
                                        onClick={() => {
                                            if (isChest) {
                                                if (!isChestOpen) {
                                                    playSound('chest');
                                                    onOpenChest(chestId);
                                                    if (absLevel === userPathProgress + 1) {
                                                        onUpdateStats(0, selectedPathId, 1, true);
                                                    }
                                                    alert("+20 Monedas encontradas!");
                                                }
                                                return;
                                            }
                                            if (!isLocked) onStartLevel(unit, absLevel, i + 1);
                                        }}
                                        disabled={isLocked && !isChest}
                                        style={{ transform: `translateX(${xOffset}px)` }}
                                        className={`relative group outline-none transition-all duration-500
                                            ${isCurrent ? 'scale-110 z-30' : 'hover:scale-105 z-20'}
                                            ${isLocked ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        {/* Avatar Sitting on Node */}
                                        {isCurrent && (
                                            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-24 h-24 z-40 drop-shadow-2xl animate-bounce">
                                                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
                                                <img 
                                                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${stats.league || 'bronze'}&backgroundColor=transparent`} 
                                                    alt="Avatar" 
                                                    className="w-full h-full filter drop-shadow-lg relative z-10" 
                                                />
                                                {/* League Crown */}
                                                {(stats.league === 'Gold' || stats.league === 'Diamond' || stats.league === 'Master') && (
                                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-400 filter drop-shadow-lg animate-pulse">
                                                        <Sparkles size={24} fill="currentColor"/>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Start Here Tooltip */}
                                        {isCurrent && (
                                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-slate-900 text-xs font-black uppercase px-3 py-1 rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-bounce">
                                                Comenzar Aquí
                                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                                            </div>
                                        )}

                                        {/* The Node Itself */}
                                        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-[24px] flex items-center justify-center relative transition-all duration-300 transform-style-3d
                                            ${isBoss 
                                                ? 'bg-gradient-to-b from-red-500 to-red-600 shadow-[0_10px_0_#991b1b,0_20px_20px_rgba(0,0,0,0.4)] text-white border-2 border-red-400' 
                                                : isChest 
                                                    ? (isChestOpen 
                                                        ? 'bg-slate-800 shadow-[0_5px_0_#1e293b] text-slate-600 border border-slate-700 mt-2' 
                                                        : 'bg-gradient-to-b from-yellow-400 to-yellow-500 shadow-[0_10px_0_#b45309,0_20px_20px_rgba(0,0,0,0.4)] text-yellow-900 border-2 border-yellow-200 animate-bounce-slow')
                                                    : isCompleted 
                                                        ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-[0_6px_0_#15803d,0_15px_15px_rgba(0,0,0,0.2)] text-white border-t border-emerald-400' 
                                                        : isCurrent 
                                                            ? `bg-gradient-to-b from-${unit.color}-500 to-${unit.color}-600 shadow-[0_12px_0_rgba(0,0,0,0.3),0_25px_30px_rgba(${unit.color === 'indigo' ? '99,102,241' : '168,85,247'},0.4)] text-white border-2 border-${unit.color}-300 ring-4 ring-${unit.color}-500/30` 
                                                            : 'bg-slate-800 shadow-[0_8px_0_#1e293b] text-slate-500 border-t border-slate-700'}
                                            active:translate-y-[6px] active:shadow-none
                                        `}>
                                            {/* Inner Icon */}
                                            <div className="transform transition-transform group-hover:scale-110">
                                                {isBoss ? <Skull size={36} className="drop-shadow-md" /> 
                                                : isChest ? (isChestOpen ? <PackageOpen size={36}/> : <Gift size={36} className="drop-shadow-md"/>) 
                                                : isCompleted ? <CheckCircle size={32} className="drop-shadow-md" /> 
                                                : isLocked ? <Lock size={24} className="opacity-50"/>
                                                : <Star size={32} fill={isCurrent ? "white" : "none"} className="drop-shadow-md"/>}
                                            </div>

                                            {/* Stars for completed levels */}
                                            {isCompleted && !isChest && !isBoss && (
                                                <div className="absolute -bottom-8 flex gap-0.5 bg-slate-900/80 px-2 py-1 rounded-full border border-slate-700/50 backdrop-blur-sm">
                                                    {[1,2,3].map(s => <Star key={s} size={10} className="text-yellow-400 fill-yellow-400" />)}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </div>
                                )
                            })}
                        </div>
                    </div>
                    )
                })}
             </div>
          </div>

          {/* RIGHT COLUMN: SIDEKICK DASHBOARD (Glassmorphism) */}
          <div className="hidden lg:flex w-[380px] sticky top-0 h-screen overflow-hidden flex-col border-l border-slate-800/50 bg-slate-900/60 backdrop-blur-xl z-40 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
              
              {/* Profile Card */}
              <div className="p-8 pb-4">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[2rem] border border-slate-700/50 shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-shine"></div>
                      <div className="flex items-center gap-4 mb-6 relative z-10">
                          <div className="relative">
                              <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${stats.league || 'bronze'}`} className="w-16 h-16 rounded-2xl bg-slate-700 shadow-inner" alt="Profile" />
                              <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-1 border border-slate-700">
                                  {stats.league === 'Bronze' && <div className="w-4 h-4 bg-orange-700 rounded-full"/>}
                                  {stats.league === 'Silver' && <div className="w-4 h-4 bg-slate-300 rounded-full"/>}
                                  {stats.league === 'Gold' && <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"/>}
                                  {stats.league === 'Diamond' && <div className="w-4 h-4 bg-cyan-400 rounded-full animate-pulse"/>}
                                  {stats.league === 'Master' && <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"/>}
                              </div>
                          </div>
                          <div>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nivel {stats.level}</div>
                              <div className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                  Liga {stats.league} 
                              </div>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 relative z-10">
                          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-1 text-red-400 font-bold shadow-inner">
                              <Heart size={20} fill="currentColor" className="mb-1"/> 
                              <span className="text-lg">{stats.hearts}/5</span>
                          </div>
                          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-1 text-yellow-400 font-bold shadow-inner">
                              <Coins size={20} fill="currentColor" className="mb-1"/> 
                              <span className="text-lg">{stats.masterCoins}</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Mission Card */}
              <div className="px-8 py-4 flex-1 overflow-y-auto custom-scrollbar">
                  <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 shadow-lg relative overflow-hidden group transition-all hover:scale-[1.02] hover:shadow-indigo-500/20">
                      <div className="absolute top-0 right-0 p-24 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
                      <div className="relative z-10">
                          <h3 className="text-indigo-200 font-black uppercase text-xs tracking-[0.2em] mb-4 flex items-center gap-2">
                              <Target size={14}/> Misión Actual
                          </h3>
                          <p className="text-white font-bold text-2xl leading-tight mb-6 drop-shadow-md">
                              "Completa la Unidad {Math.ceil((userPathProgress + 1) / 10)} para desbloquear el Torneo."
                          </p>
                          <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                              <div className="h-full bg-white/80" style={{width: `${(userPathProgress % 10) * 10}%`}}></div>
                          </div>
                          <div className="text-right text-xs font-bold text-indigo-200 mt-2">{(userPathProgress % 10) * 10}% Completado</div>
                      </div>
                  </div>

                  {/* Tips Box */}
                  <div className="mt-6 bg-slate-800/40 p-6 rounded-[2rem] border border-slate-700/50 flex items-start gap-4">
                      <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-400 shrink-0">
                          <Zap size={20} fill="currentColor"/>
                      </div>
                      <div>
                          <h4 className="text-white font-bold text-sm mb-1">Racha de Sabiduría</h4>
                          <p className="text-slate-400 text-xs leading-relaxed">
                              Usa las teclas <kbd className="bg-slate-700 px-1 rounded text-white font-mono">1</kbd> - <kbd className="bg-slate-700 px-1 rounded text-white font-mono">4</kbd> para responder más rápido en los quizzes.
                          </p>
                      </div>
                  </div>
              </div>
          </div>
       </div>
    </div>
  );
};

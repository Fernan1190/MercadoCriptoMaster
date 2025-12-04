import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext'; 
import { Heart, Coins, Zap, Trophy, ArrowUpRight, Globe, Pickaxe, Lock, Wallet, Quote, Crown, Calendar, ShoppingBag, Newspaper, Settings, Book, Edit3, EyeOff, Eye, AlertTriangle, X } from 'lucide-react';
import { TradingTerminal } from './TradingTerminal';
import { PortfolioChart } from './PortfolioChart'; 
import { TransactionList } from './TransactionList'; 
import { MarketSentiment } from './MarketSentiment';

interface DashboardProps {
  setView: (view: string) => void;
}

const STATIC_QUOTES = [
  { text: "El riesgo viene de no saber lo que estás haciendo.", author: "Warren Buffett" },
  { text: "El mercado transfiere dinero del impaciente al paciente.", author: "Warren Buffett" },
  { text: "En la inversión, lo que es cómodo rara vez es rentable.", author: "Robert Arnott" },
];

const GLOSSARY_TERMS = [
  { term: "Bull Market", def: "Mercado con tendencia alcista." },
  { term: "Bear Market", def: "Mercado con tendencia bajista." },
  { term: "HODL", def: "Mantener activos a largo plazo sin vender." },
  { term: "FOMO", def: "Miedo a perderse una oportunidad." },
];

const ECONOMIC_EVENTS = [
  { time: "08:30", event: "Nóminas no agrícolas (NFP)", impact: "high" },
  { time: "14:00", event: "Actas del FOMC", impact: "high" },
  { time: "16:00", event: "Inventarios de crudo", impact: "medium" },
];

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  // Extraemos latestEvent y clearEvent del contexto
  const { stats, actions, market, latestEvent, clearEvent } = useGame(); 
  const { mineCoin, stakeCoins, unstakeCoins, toggleTheme, updateNotes } = actions;

  const [news, setNews] = useState("Bienvenido a MercadoMaster. El mercado está abriendo...");
  const [quote] = useState(STATIC_QUOTES[Math.floor(Math.random() * STATIC_QUOTES.length)]);
  const [wordOfDay] = useState(GLOSSARY_TERMS[Math.floor(Math.random() * GLOSSARY_TERMS.length)]);
  const [zenMode, setZenMode] = useState(false);
  const [timeNY, setTimeNY] = useState('');
  const [timeLondon, setTimeLondon] = useState('');
  const [timeTokyo, setTimeTokyo] = useState('');

  // Noticias dinámicas (Tendencia)
  useEffect(() => {
    const trend = market.trend['BTC'];
    const price = market.prices['BTC'];
    
    if (trend === 'up') {
        const bullishNews = [
            `🚀 Bitcoin rompe barreras y alcanza $${price.toFixed(0)}!`,
            "Inversores institucionales aumentan sus posiciones.",
            "El sentimiento de mercado se vuelve alcista."
        ];
        setNews(bullishNews[Math.floor(Math.random() * bullishNews.length)]);
    } else if (trend === 'down') {
        const bearishNews = [
            `📉 Corrección fuerte: BTC cae a $${price.toFixed(0)}.`,
            "Incertidumbre regulatoria provoca ventas.",
            "Analistas sugieren precaución ante la volatilidad."
        ];
        setNews(bearishNews[Math.floor(Math.random() * bearishNews.length)]);
    }
  }, [market.trend['BTC']]);

  // Relojes
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeNY(now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' }));
      setTimeLondon(now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' }));
      setTimeTokyo(now.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Determinar Título del Imperio
  let empireTitle = "Sótano de Trader";
  if (stats.level >= 5) empireTitle = "Garaje Start-up";
  if (stats.level >= 10) empireTitle = "Oficina Propia";
  if (stats.level >= 20) empireTitle = "Penthouse Wall St.";
  if (stats.level >= 50) empireTitle = "Base Lunar";

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-8 animate-fade-in relative">
      
      {/* --- EVENT POPUP (BREAKING NEWS) --- */}
      {latestEvent && (
         <div className="fixed top-24 right-6 z-50 animate-bounce-in">
            <div className="bg-slate-900/95 backdrop-blur-xl border-l-4 border-yellow-500 p-6 rounded-r-xl shadow-2xl max-w-sm relative overflow-hidden ring-1 ring-yellow-500/20">
               <div className="absolute inset-0 bg-yellow-500/5 animate-pulse"></div>
               <button onClick={clearEvent} className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors p-1"><X size={16}/></button>
               
               <div className="flex items-start gap-4 relative z-10">
                  <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-500 text-2xl shrink-0">
                     {latestEvent.icon}
                  </div>
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-2 py-0.5 rounded">BREAKING NEWS</span>
                        {latestEvent.type === 'black_swan' && <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded animate-pulse">ALERTA ROJA</span>}
                     </div>
                     <h4 className="font-black text-white text-lg leading-tight mb-2">{latestEvent.title}</h4>
                     <p className="text-slate-300 text-sm leading-relaxed">{latestEvent.description}</p>
                  </div>
               </div>
            </div>
         </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
           <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
              Inicio
              <button onClick={toggleTheme} className="p-2 bg-slate-800 rounded-lg border border-slate-700 hover:text-green-400 transition-colors" title="Cambiar Tema">
                 <Settings size={20} />
              </button>
              <button onClick={() => setZenMode(!zenMode)} className={`p-2 rounded-lg border transition-colors ${zenMode ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 hover:text-indigo-400'}`} title="Modo Zen">
                 {zenMode ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
           </h1>
           <p className="text-slate-400">Resumen de tu imperio financiero.</p>
        </div>
        {!zenMode && (
        <div className="hidden md:flex items-center gap-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 animate-pulse">
            <Newspaper size={16} className="text-blue-400"/>
            <span className="text-sm text-slate-300 font-mono w-96 truncate">{news}</span>
        </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Stats Row */}
        {!zenMode && (
        <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Heart, val: `${stats.hearts}/5`, label: "Vidas", color: "red" },
              { icon: Coins, val: stats.masterCoins, label: "Coins", color: "yellow" },
              { icon: Zap, val: stats.streak, label: "Racha", color: "orange" },
              { icon: Trophy, val: stats.level, label: "Nivel", color: "purple" }
            ].map((item, i) => (
               <div key={i} className={`bg-slate-900/60 backdrop-blur-md p-5 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-${item.color}-500/30 transition-colors group`}>
                  <div className={`p-3 w-fit rounded-2xl bg-${item.color}-500/10 text-${item.color}-500 group-hover:bg-${item.color}-500 group-hover:text-slate-900 transition-all`}>
                     <item.icon size={24} fill={item.color === 'red' || item.color === 'orange' ? 'currentColor' : 'none'}/>
                  </div>
                  <div>
                     <div className="text-2xl font-black text-white mt-4">{item.val}</div>
                     <div className="text-xs text-slate-500 font-bold uppercase">{item.label}</div>
                  </div>
               </div>
            ))}
        </div>
        )}

        {/* Continue Learning */}
        <div onClick={() => setView('learn')} className={`${zenMode ? 'md:col-span-12 h-96' : 'md:col-span-4 row-span-2'} bg-gradient-to-br from-green-600 to-emerald-800 rounded-[2.5rem] p-8 relative overflow-hidden group cursor-pointer shadow-2xl transition-all hover:scale-[1.01] flex flex-col justify-between`}>
            <div className="absolute top-0 right-0 p-20 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
            <div className="relative z-10">
               <div className="bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold text-white mb-4 backdrop-blur-md border border-white/20">RECOMENDADO</div>
               <h2 className={`${zenMode ? 'text-5xl' : 'text-3xl'} font-black text-white leading-tight mb-2`}>Continuar Camino</h2>
               <p className="text-green-100 font-medium text-lg">Estás en racha. Sigue sumando XP.</p>
            </div>
            <div className="bg-slate-900/30 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between group-hover:bg-slate-900/50 transition-colors mt-8">
               <span className="font-bold text-white">Ir al Mapa</span>
               <div className="bg-white text-green-700 p-2 rounded-full"><ArrowUpRight size={20}/></div>
            </div>
        </div>

        {!zenMode && (
        <>
        {/* World Clocks */}
        <div className="md:col-span-5 bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-white font-bold flex items-center gap-2"><Globe size={20} className="text-blue-500"/> Mercados Mundiales</h3>
             </div>
             <div className="flex justify-between text-center divide-x divide-slate-800">
                <div className="px-2">
                   <div className="text-xs text-slate-500 font-bold uppercase">New York</div>
                   <div className="text-lg font-mono font-bold text-white">{timeNY}</div>
                </div>
                <div className="px-2">
                   <div className="text-xs text-slate-500 font-bold uppercase">London</div>
                   <div className="text-lg font-mono font-bold text-white">{timeLondon}</div>
                </div>
                <div className="px-2">
                   <div className="text-xs text-slate-500 font-bold uppercase">Tokyo</div>
                   <div className="text-lg font-mono font-bold text-white">{timeTokyo}</div>
                </div>
             </div>
        </div>

        {/* Economic Calendar */}
        <div className="md:col-span-3 bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800">
           <h3 className="text-white font-bold flex items-center gap-2 mb-4"><Calendar size={20} className="text-indigo-500"/> Eventos Hoy</h3>
           <div className="space-y-3">
              {ECONOMIC_EVENTS.map((ev, i) => (
                 <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-mono">{ev.time}</span>
                    <span className="text-white font-medium truncate w-20">{ev.event}</span>
                    <div className={`w-2 h-2 rounded-full ${ev.impact === 'high' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                 </div>
              ))}
           </div>
        </div>
        
        {/* MARKET SENTIMENT */}
        <div className="md:col-span-4 row-span-2">
            <MarketSentiment />
        </div>

        {/* TRADING TERMINAL */}
        <div className="md:col-span-8 h-[500px]">
            <TradingTerminal />
        </div>
        
        {/* PORTFOLIO CHART */}
        <div className="md:col-span-4 h-[500px]">
            <PortfolioChart />
        </div>

        {/* TRANSACTION HISTORY */}
        <div className="md:col-span-4 h-80">
            <TransactionList />
        </div>

        {/* QUICK NOTES */}
        <div className="md:col-span-4 h-80 bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 flex flex-col">
           <h3 className="text-white font-bold flex items-center gap-2 mb-3"><Edit3 size={20} className="text-slate-400"/> Notas Rápidas</h3>
           <textarea 
              className="w-full flex-1 bg-slate-800/50 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500 resize-none"
              placeholder="Estrategia: Comprar BTC cuando baje de 60k..."
              value={stats.quickNotes}
              onChange={(e) => updateNotes(e.target.value)}
           ></textarea>
        </div>

        {/* Mining Rig */}
        <div className="md:col-span-4 h-80 bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 relative group overflow-hidden">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-white font-bold flex items-center gap-2"><Pickaxe size={20} className="text-yellow-500"/> Minería BTC</h3>
               <span className="text-xs text-slate-500 font-mono">{stats.minedCoins} Mined</span>
            </div>
            <button 
               onClick={mineCoin}
               className="w-full h-48 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group-hover:border-yellow-500/50 shadow-lg"
            >
               <div className="p-4 bg-yellow-500/20 rounded-full text-yellow-500 animate-pulse"><Zap size={32} fill="currentColor"/></div>
               <span className="font-bold text-white text-lg">Minar Bloque</span>
            </button>
        </div>
        
        {/* Staking Safe */}
        <div className="md:col-span-4 bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
               <h3 className="text-white font-bold flex items-center gap-2"><Lock size={20} className="text-emerald-500"/> Staking</h3>
               <span className="text-xs text-emerald-400 font-bold">5% APY</span>
            </div>
            <div className="text-center py-2">
               <div className="text-2xl font-mono font-bold text-white">{stats.stakedCoins}</div>
               <div className="text-xs text-slate-500 uppercase">Bloqueado</div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
               <button onClick={stakeCoins} className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold py-2 rounded-lg border border-emerald-600/30">Deposit</button>
               <button onClick={unstakeCoins} className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 rounded-lg">Withdraw</button>
            </div>
        </div>

        {/* Word of Day */}
        <div className="md:col-span-4 bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 bg-indigo-500/10 rounded-full blur-2xl"></div>
           <h3 className="text-white font-bold flex items-center gap-2 mb-2"><Book size={20} className="text-indigo-400"/> Palabra del Día</h3>
           <p className="text-2xl font-black text-white mb-1">{wordOfDay.term}</p>
           <p className="text-slate-400 text-sm leading-relaxed">{wordOfDay.def}</p>
        </div>
        
        {/* Inventory Quick Access */}
        <div className="md:col-span-12 bg-slate-800/30 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-400 flex items-center gap-2"><ShoppingBag size={16}/> Inventario Rápido</span>
            <div className="flex gap-4">
               <div className="text-xs bg-slate-900 px-3 py-1 rounded-lg text-purple-400 border border-purple-500/20">Hint: {stats.inventory.hint5050}</div>
               <div className="text-xs bg-slate-900 px-3 py-1 rounded-lg text-cyan-400 border border-cyan-500/20">Freeze: {stats.inventory.timeFreeze}</div>
               <div className="text-xs bg-slate-900 px-3 py-1 rounded-lg text-yellow-400 border border-yellow-500/20">Skip: {stats.inventory.skip}</div>
            </div>
        </div>

        {/* TARJETA DE ACCESO A LA SEDE */}
        <div 
            onClick={() => setView('office')}
            className="md:col-span-12 bg-gradient-to-r from-slate-900 to-blue-950 p-6 rounded-3xl border border-slate-800 relative overflow-hidden mb-6 group cursor-pointer hover:border-blue-500/50 transition-all"
        >
            <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 group-hover:opacity-20 transition-opacity"></div>
            
            <div className="flex items-center justify-between relative z-10">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">
                     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-white group-hover:text-blue-200 transition-colors">Gestionar Sede Central</h2>
                     <p className="text-slate-400 text-sm">Nivel {stats.level} • {stats.officeItems.length} Mejoras instaladas</p>
                  </div>
               </div>
               
               <div className="hidden md:flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full text-sm font-bold text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  Entrar <ArrowUpRight size={16}/>
               </div>
            </div>
        </div>

        </>
        )}

      </div>
    </div>
  );
};
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Keyboard, LineChart as LineChartIcon } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { OrderBook } from './OrderBook'; 
import { CandleData } from '../types';

export const TradingTerminal: React.FC = () => {
  const { stats, actions, market } = useGame(); 
  const { playSound } = actions; 
  
  const [activeSymbol, setActiveSymbol] = useState('BTC');
  const [tradeAmount, setTradeAmount] = useState('');
  const [showIndicators, setShowIndicators] = useState(false); // Estado para el toggle

  // Datos vivos del contexto
  const rawData = market.history[activeSymbol] || [];
  const price = market.prices[activeSymbol] || 0;
  const isUp = market.trend[activeSymbol] === 'up';

  // --- CÁLCULO DE INDICADORES (Memoized) ---
  const chartData = useMemo(() => {
      if (rawData.length === 0) return [];
      
      // Calculamos la Media Móvil Simple (SMA) de 7 periodos
      const period = 7;
      return rawData.map((candle, index, array) => {
          let sma = null;
          if (index >= period - 1) {
              const slice = array.slice(index - period + 1, index + 1);
              const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
              sma = sum / period;
          }
          return { ...candle, sma };
      });
  }, [rawData]);

  const handleTrade = useCallback((type: 'buy' | 'sell') => {
    const rawAmount = tradeAmount || "0.1";
    const amount = parseFloat(rawAmount);
    
    if (!amount || amount <= 0) {
      playSound('error');
      alert("⚠️ Cantidad inválida.");
      return;
    }

    let success = false;
    if (type === 'buy') {
      success = actions.buyAsset(activeSymbol, amount, price);
      if (!success) {
        playSound('error');
        const cost = amount * price;
        alert(`🚫 FONDOS INSUFICIENTES\nNecesitas: $${cost.toLocaleString()}`);
      }
    } else {
      success = actions.sellAsset(activeSymbol, amount, price);
      if (!success) {
        playSound('error');
        alert(`🚫 NO TIENES SUFICIENTES ACTIVOS`);
      }
    }

    if (success) {
      playSound('cash');
      setTradeAmount('');
    }
  }, [tradeAmount, activeSymbol, price, actions, playSound]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.repeat) return; 
      if (e.key.toLowerCase() === 'b') handleTrade('buy');
      else if (e.key.toLowerCase() === 's') handleTrade('sell');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTrade]);

  const ownedAmount = stats.portfolio?.[activeSymbol] || 0;
  const ownedValue = ownedAmount * price;

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden h-full flex flex-col">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
           <div className={`p-3 rounded-xl transition-colors duration-500 ${isUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              <Activity />
           </div>
           <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                 {activeSymbol} <span className="text-slate-600">/</span> USD
              </h3>
              <p className={`text-4xl font-mono font-bold transition-colors duration-300 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                 ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
           </div>
        </div>
        
        <div className="flex gap-2">
           <button 
              onClick={() => setShowIndicators(!showIndicators)}
              className={`px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-xs uppercase tracking-wider ${showIndicators ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
              title="Media Móvil (SMA)"
           >
              <LineChartIcon size={14}/> Indicadores
           </button>

           {['BTC', 'ETH', 'SOL'].map(sym => (
              <button 
                key={sym} 
                onClick={() => { setActiveSymbol(sym); playSound('click'); }}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${activeSymbol === sym ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                 {sym}
              </button>
           ))}
        </div>
      </div>

      {/* Gráfico Pro */}
      <div className="flex-1 w-full mb-6 relative min-h-[200px] flex">
         <div className="flex-1 h-full">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis domain={['auto', 'auto']} hide />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} 
                            formatter={(v:any, name: string) => [
                                `$${Number(v).toFixed(2)}`, 
                                name === 'close' ? 'Precio' : 'Media Móvil (SMA)'
                            ]}
                        />
                        
                        {/* Área de Precio */}
                        <Area 
                            type="monotone" 
                            dataKey="close" 
                            stroke={isUp ? "#22c55e" : "#ef4444"} 
                            fill="url(#colorPrice)" 
                            strokeWidth={2} 
                            isAnimationActive={false} 
                        />

                        {/* Línea de Indicador (SMA) */}
                        {showIndicators && (
                            <Line 
                                type="monotone" 
                                dataKey="sma" 
                                stroke="#a855f7" 
                                strokeWidth={2} 
                                dot={false} 
                                strokeDasharray="5 5"
                                isAnimationActive={false}
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-slate-500">Cargando mercado...</div>}
         </div>
         <OrderBook currentPrice={price} />
      </div>

      {/* Controles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
         <div className="flex flex-col justify-center">
            <span className="text-slate-400 text-xs font-bold uppercase mb-1">Tu Posición</span>
            <div className="text-2xl font-bold text-white mb-1">{ownedAmount.toFixed(4)} {activeSymbol}</div>
            <div className="text-sm text-slate-500">≈ ${ownedValue.toLocaleString()}</div>
         </div>
         <div>
            <div className="relative mb-4 flex gap-2 items-center">
               <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-3 text-slate-500" size={18}/>
                  <input type="number" placeholder="0.1" value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white font-mono focus:outline-none focus:border-indigo-500"/>
               </div>
               <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-500 uppercase font-bold bg-slate-800 px-2 py-1 rounded border border-slate-700"><Keyboard size={12}/> <span>B/S</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <button onClick={() => handleTrade('buy')} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95"><TrendingUp size={18}/> COMPRAR</button>
               <button onClick={() => handleTrade('sell')} className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95"><TrendingDown size={18}/> VENDER</button>
            </div>
         </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Keyboard, LineChart as LineChartIcon, Loader2, CheckCircle2, AlertCircle, Percent } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { OrderBook } from './OrderBook'; 

export const TradingTerminal: React.FC = () => {
  const { stats, actions, market } = useGame(); 
  const { playSound } = actions; 
  
  const [activeSymbol, setActiveSymbol] = useState('BTC');
  const [tradeAmount, setTradeAmount] = useState('');
  const [showIndicators, setShowIndicators] = useState(false);
  
  // --- ESTADOS DE INTERFAZ (WAR ROOM UX) ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [tradeStatus, setTradeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Datos vivos
  const rawData = market.history[activeSymbol] || [];
  const price = market.prices[activeSymbol] || 0;
  const isUp = market.trend[activeSymbol] === 'up';
  
  // Saldos disponibles
  const cashBalance = stats.balance;
  const assetBalance = stats.portfolio?.[activeSymbol] || 0;

  // --- CÁLCULO DE INDICADORES ---
  const chartData = useMemo(() => {
      if (rawData.length === 0) return [];
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

  // --- HELPERS DE CANTIDAD RÁPIDA ---
  const setPercentage = (pct: number, type: 'buy' | 'sell') => {
      playSound('click');
      if (type === 'buy') {
          // Calcular cuánto puedo comprar con el % de mi saldo
          const budget = cashBalance * pct;
          const amount = budget / price;
          setTradeAmount(amount.toFixed(4)); // 4 decimales para cripto
      } else {
          // Calcular el % de mis acciones a vender
          const amount = assetBalance * pct;
          setTradeAmount(amount.toFixed(4));
      }
  };

  // --- LÓGICA DE EJECUCIÓN MEJORADA ---
  const handleTrade = useCallback(async (type: 'buy' | 'sell') => {
    if (isProcessing) return;

    const rawAmount = tradeAmount || "0";
    const amount = parseFloat(rawAmount);
    
    // Validación básica
    if (!amount || amount <= 0) {
      playSound('error');
      setTradeStatus('error');
      setStatusMessage("Ingresa una cantidad válida.");
      setTimeout(() => setTradeStatus('idle'), 3000);
      return;
    }

    // Validación de fondos (Feedback visual antes de ejecutar)
    if (type === 'buy' && amount * price > cashBalance) {
        playSound('error');
        setTradeStatus('error');
        setStatusMessage("Saldo insuficiente.");
        setTimeout(() => setTradeStatus('idle'), 3000);
        return;
    }
    if (type === 'sell' && amount > assetBalance) {
        playSound('error');
        setTradeStatus('error');
        setStatusMessage(`No tienes suficientes ${activeSymbol}.`);
        setTimeout(() => setTradeStatus('idle'), 3000);
        return;
    }

    // 1. ESTADO: PROCESANDO (Simular red)
    setIsProcessing(true);
    setTradeStatus('idle');
    playSound('click'); // Sonido mecánico de tecla

    // Simulamos latencia de exchange (500ms) para realismo
    await new Promise(resolve => setTimeout(resolve, 600));

    let success = false;
    
    // 2. EJECUCIÓN REAL
    if (type === 'buy') {
      success = actions.buyAsset(activeSymbol, amount, price);
    } else {
      success = actions.sellAsset(activeSymbol, amount, price);
    }

    // 3. FEEDBACK FINAL
    setIsProcessing(false);

    if (success) {
      playSound('cash'); // Sonido de caja registradora
      setTradeStatus('success');
      setStatusMessage(`Orden ${type === 'buy' ? 'COMPRA' : 'VENTA'} ejecutada: ${amount} ${activeSymbol}`);
      setTradeAmount('');
    } else {
      playSound('error');
      setTradeStatus('error');
      setStatusMessage("La orden fue rechazada por el mercado.");
    }

    // Limpiar mensaje a los 3 seg
    setTimeout(() => setTradeStatus('idle'), 4000);

  }, [tradeAmount, activeSymbol, price, actions, playSound, isProcessing, cashBalance, assetBalance]);

  // Teclas rápidas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.key.toLowerCase() === 'b') handleTrade('buy');
      else if (e.key.toLowerCase() === 's') handleTrade('sell');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTrade]);

  const ownedValue = assetBalance * price;

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden h-full flex flex-col">
      
      {/* --- NOTIFICACIÓN FLOTANTE (TOAST) --- */}
      <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ${tradeStatus !== 'idle' ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-xl font-bold text-sm ${
              tradeStatus === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400'
          }`}>
              {tradeStatus === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
              {statusMessage}
          </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center gap-4">
           <div className={`p-3 rounded-xl transition-colors duration-500 ${isUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              <Activity />
           </div>
           <div>
              <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                 {activeSymbol} <span className="text-slate-600 text-sm">/ USD</span>
              </h3>
              <p className={`text-2xl md:text-3xl font-mono font-bold transition-colors duration-300 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                 ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
           </div>
        </div>
        
        <div className="flex gap-2">
           <button 
              onClick={() => setShowIndicators(!showIndicators)}
              className={`p-2 rounded-lg transition-all ${showIndicators ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
              title="Media Móvil (SMA)"
           >
              <LineChartIcon size={18}/>
           </button>

           <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
               {['BTC', 'ETH', 'SOL'].map(sym => (
                  <button 
                    key={sym} 
                    onClick={() => { setActiveSymbol(sym); playSound('click'); setTradeStatus('idle'); }}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${activeSymbol === sym ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                     {sym}
                  </button>
               ))}
           </div>
        </div>
      </div>

      {/* Gráfico Pro */}
      <div className="flex-1 w-full mb-4 relative min-h-[150px] flex overflow-hidden border border-slate-800/50 rounded-2xl bg-slate-950/30">
         <div className="flex-1 h-full relative">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis domain={['auto', 'auto']} hide />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }} 
                            formatter={(v:any, name: string) => [
                                `$${Number(v).toFixed(2)}`, 
                                name === 'close' ? 'Precio' : 'SMA (7)'
                            ]}
                        />
                        <Area type="monotone" dataKey="close" stroke={isUp ? "#22c55e" : "#ef4444"} fill="url(#colorPrice)" strokeWidth={2} isAnimationActive={false} />
                        {showIndicators && <Line type="monotone" dataKey="sma" stroke="#a855f7" strokeWidth={2} dot={false} strokeDasharray="5 5" isAnimationActive={false} />}
                    </ComposedChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">Conectando feed...</div>}
         </div>
         <OrderBook currentPrice={price} />
      </div>

      {/* PANEL DE CONTROL (WAR ROOM) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800 shrink-0">
         
         {/* Info Saldo */}
         <div className="flex flex-col justify-center space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
                <span>Disponible USD</span>
                <span className="text-white font-mono">${cashBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
                <span>En Cartera</span>
                <span className="text-white font-mono">{assetBalance.toFixed(4)} {activeSymbol}</span>
            </div>
            <div className="h-px bg-slate-800 my-1"></div>
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase">
                <span>Valor Posición</span>
                <span className="text-slate-300 font-mono">≈ ${ownedValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
         </div>

         {/* Controles de Orden */}
         <div className="flex flex-col gap-2">
            {/* Input */}
            <div className="relative">
               <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
               <input 
                  type="number" 
                  placeholder="Cantidad..." 
                  value={tradeAmount} 
                  onChange={(e) => setTradeAmount(e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-indigo-500 rounded-xl py-3 pl-9 pr-4 text-white font-mono font-bold focus:outline-none transition-colors"
               />
               <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                   {[0.25, 0.5, 1].map(pct => (
                       <button 
                          key={pct}
                          onClick={() => setPercentage(pct, 'buy')} // Por defecto calc sobre buy, si el user quiere vender tendrá que ajustarlo o podemos añadir toggle
                          className="px-2 py-1 bg-slate-800 text-[10px] text-slate-400 rounded hover:bg-slate-700 hover:text-white transition-colors"
                          title={`Usar ${pct*100}% del saldo`}
                       >
                           {pct === 1 ? 'MAX' : `${pct*100}%`}
                       </button>
                   ))}
               </div>
            </div>

            {/* Botones de Acción */}
            <div className="grid grid-cols-2 gap-2">
               <button 
                  onClick={() => handleTrade('buy')} 
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-500 disabled:bg-green-900 disabled:text-green-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-green-900/20 group relative overflow-hidden"
               >
                  {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <TrendingUp size={18}/>}
                  <span>COMPRAR</span>
                  {/* Brillo effect */}
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
               </button>

               <button 
                  onClick={() => handleTrade('sell')} 
                  disabled={isProcessing}
                  className="bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:text-red-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-red-900/20 group relative overflow-hidden"
               >
                  {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <TrendingDown size={18}/>}
                  <span>VENDER</span>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
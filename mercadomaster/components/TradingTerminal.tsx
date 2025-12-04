import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, LineChart as LineChartIcon, Loader2, CheckCircle2, AlertCircle, ArrowDownToLine, ArrowUpToLine, Layers } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { OrderBook } from './OrderBook'; 

interface TradingTerminalProps {
  allowedAssets?: string[];
  defaultAsset?: string;
  onClose?: () => void;
}

export const TradingTerminal: React.FC<TradingTerminalProps> = ({ 
  allowedAssets = ['BTC', 'ETH', 'SOL'], 
  defaultAsset,
  onClose
}) => {
  const { stats, actions, market } = useGame(); 
  const { playSound } = actions; 
  
  const [activeSymbol, setActiveSymbol] = useState(defaultAsset || allowedAssets[0]);
  const [tradeAmount, setTradeAmount] = useState('');
  
  // Configuración de Indicadores
  const [showSMA, setShowSMA] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  
  // Estados para SL / TP
  const [slPrice, setSlPrice] = useState('');
  const [tpPrice, setTpPrice] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [tradeStatus, setTradeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
     if (!allowedAssets.includes(activeSymbol)) {
         setActiveSymbol(allowedAssets[0]);
     }
  }, [allowedAssets, activeSymbol]);

  const rawData = market.history[activeSymbol] || [];
  const price = market.prices[activeSymbol] || 0;
  const isUp = market.trend[activeSymbol] === 'up';
  
  const cashBalance = stats.balance;
  const assetBalance = stats.portfolio?.[activeSymbol] || 0;
  const ownedValue = assetBalance * price;

  // --- CÁLCULO AVANZADO DE INDICADORES ---
  const chartData = useMemo(() => {
      if (rawData.length === 0) return [];
      const period = 20; // Estándar para Bollinger
      
      return rawData.map((candle, index, array) => {
          let sma = null;
          let upperBand = null;
          let lowerBand = null;

          if (index >= period - 1) {
              const slice = array.slice(index - period + 1, index + 1);
              const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
              sma = sum / period;

              // Cálculo de Desviación Estándar para Bollinger
              const squaredDiffs = slice.map(c => Math.pow(c.close - sma!, 2));
              const variance = squaredDiffs.reduce((acc, curr) => acc + curr, 0) / period;
              const stdDev = Math.sqrt(variance);
              
              upperBand = sma + (stdDev * 2);
              lowerBand = sma - (stdDev * 2);
          }
          return { ...candle, sma, upperBand, lowerBand };
      });
  }, [rawData]);

  const handleTrade = useCallback(async (type: 'buy' | 'sell') => {
    if (isProcessing) return;

    const rawAmount = tradeAmount || "0";
    const amount = parseFloat(rawAmount);
    
    if (!amount || amount <= 0) {
      playSound('error');
      setTradeStatus('error');
      setStatusMessage("Cantidad inválida");
      setTimeout(() => setTradeStatus('idle'), 2000);
      return;
    }

    if (type === 'buy' && amount * price > cashBalance) {
        playSound('error');
        setTradeStatus('error');
        setStatusMessage("Saldo insuficiente");
        setTimeout(() => setTradeStatus('idle'), 2000);
        return;
    }
    if (type === 'sell' && amount > assetBalance) {
        playSound('error');
        setTradeStatus('error');
        setStatusMessage("Activos insuficientes");
        setTimeout(() => setTradeStatus('idle'), 2000);
        return;
    }

    setIsProcessing(true);
    setTradeStatus('idle');
    playSound('click'); 

    await new Promise(resolve => setTimeout(resolve, 500));

    let success = false;
    if (type === 'buy') success = actions.buyAsset(activeSymbol, amount, price);
    else success = actions.sellAsset(activeSymbol, amount, price);

    setIsProcessing(false);

    if (success) {
      playSound('cash');
      setTradeStatus('success');
      setStatusMessage(`${type === 'buy' ? 'COMPRA' : 'VENTA'} EXITOSA`);
      setTradeAmount('');
    } else {
      playSound('error');
      setTradeStatus('error');
      setStatusMessage("Error en orden");
    }
    setTimeout(() => setTradeStatus('idle'), 3000);

  }, [tradeAmount, activeSymbol, price, actions, playSound, isProcessing, cashBalance, assetBalance]);

  const handlePlaceOrder = (type: 'stop_loss' | 'take_profit') => {
      const trigger = type === 'stop_loss' ? parseFloat(slPrice) : parseFloat(tpPrice);
      if (!trigger || trigger <= 0) return;
      
      actions.placeOrder(activeSymbol, type, trigger, assetBalance);
      
      if (type === 'stop_loss') setSlPrice('');
      else setTpPrice('');
      
      setTradeStatus('success');
      setStatusMessage(`${type === 'stop_loss' ? 'STOP LOSS' : 'TAKE PROFIT'} FIJADO`);
      setTimeout(() => setTradeStatus('idle'), 2000);
  };

  return (
    <div className="bg-slate-900/50 rounded-3xl border border-slate-700/50 p-6 shadow-2xl relative overflow-hidden h-full flex flex-col backdrop-blur-sm">
      
      {/* Notificación Flotante */}
      <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ${tradeStatus !== 'idle' ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-xl font-bold text-xs ${
              tradeStatus === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400'
          }`}>
              {tradeStatus === 'success' ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
              {statusMessage}
          </div>
      </div>

      {/* Header Terminal */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center gap-4">
           <div className={`p-3 rounded-xl transition-colors duration-500 ${isUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              <Activity />
           </div>
           <div>
              <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                 {activeSymbol} <span className="text-slate-500 text-sm font-mono">USD</span>
              </h3>
              <p className={`text-2xl md:text-3xl font-mono font-bold transition-colors duration-300 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                 ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
           </div>
        </div>
        
        <div className="flex gap-2">
           {/* Selector de Indicadores */}
           <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 gap-1">
               <button 
                  onClick={() => setShowSMA(!showSMA)} 
                  className={`p-2 rounded-md transition-all ${showSMA ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:text-white'}`} 
                  title="Media Móvil (SMA)"
               >
                  <LineChartIcon size={16}/>
               </button>
               <button 
                  onClick={() => setShowBollinger(!showBollinger)} 
                  className={`p-2 rounded-md transition-all ${showBollinger ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-white'}`} 
                  title="Bandas de Bollinger"
               >
                  <Layers size={16}/>
               </button>
           </div>

           {/* Lista de Activos */}
           <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
               {allowedAssets.map(sym => (
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

      {/* Gráfico */}
      <div className="flex-1 w-full mb-4 relative min-h-[150px] flex overflow-hidden border border-slate-700/50 rounded-2xl bg-slate-950/50">
         <div className="flex-1 h-full relative">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                            </linearGradient>
                            {/* Gradiente para Bandas de Bollinger */}
                            <linearGradient id="bollingerFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis domain={['auto', 'auto']} hide />
                        <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }} formatter={(v:any) => [`$${Number(v).toFixed(2)}`, 'Precio']} />
                        
                        {/* Bandas de Bollinger (Área + Líneas) */}
                        {showBollinger && (
                            <>
                                <Area type="monotone" dataKey="upperBand" stroke="none" fill="none" /> {/* Hidden helper */}
                                <Area type="monotone" dataKey="lowerBand" stroke="none" fill="none" /> {/* Hidden helper */}
                                {/* Nota: Recharts no soporta Area entre dos líneas nativamente de forma fácil en composed, 
                                    usamos líneas simples para representar los límites */}
                                <Line type="monotone" dataKey="upperBand" stroke="#3b82f6" strokeWidth={1} strokeOpacity={0.5} dot={false} isAnimationActive={false} />
                                <Line type="monotone" dataKey="lowerBand" stroke="#3b82f6" strokeWidth={1} strokeOpacity={0.5} dot={false} isAnimationActive={false} />
                            </>
                        )}

                        <Area type="monotone" dataKey="close" stroke={isUp ? "#22c55e" : "#ef4444"} fill="url(#colorPrice)" strokeWidth={2} isAnimationActive={false} />
                        
                        {/* Media Móvil Simple */}
                        {(showSMA || showBollinger) && (
                            <Line type="monotone" dataKey="sma" stroke="#a855f7" strokeWidth={2} dot={false} strokeDasharray="5 5" isAnimationActive={false} />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">Cargando datos...</div>}
         </div>
         <OrderBook currentPrice={price} />
      </div>

      {/* Panel de Órdenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-700 shrink-0">
         <div className="flex flex-col justify-center space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-bold uppercase"><span>Saldo USD</span><span className="text-white font-mono">${cashBalance.toLocaleString()}</span></div>
            <div className="flex justify-between text-xs text-slate-400 font-bold uppercase"><span>Tenencia</span><span className="text-white font-mono">{assetBalance.toFixed(4)} {activeSymbol}</span></div>
            <div className="h-px bg-slate-700 my-1"></div>
            <div className="flex justify-between text-xs text-slate-500 font-bold uppercase"><span>Valor</span><span className="text-slate-300 font-mono">≈ ${ownedValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
         </div>

         <div className="flex flex-col gap-2">
            <div className="relative">
               <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
               <input type="number" placeholder="Cantidad..." value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} className="w-full bg-slate-900 border border-slate-600 focus:border-indigo-500 rounded-xl py-3 pl-9 pr-4 text-white font-mono font-bold focus:outline-none transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-2">
               <button onClick={() => handleTrade('buy')} disabled={isProcessing} className="bg-green-600 hover:bg-green-500 disabled:bg-slate-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg">
                  {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <TrendingUp size={18}/>} COMPRAR
               </button>
               <button onClick={() => handleTrade('sell')} disabled={isProcessing} className="bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg">
                  {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <TrendingDown size={18}/>} VENDER
               </button>
            </div>
         </div>
      </div>

      {/* Automatización (SL / TP) */}
      <div className="mt-4 border-t border-slate-800 pt-4 px-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Automatización
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-2">
                  <div className="relative flex-1">
                      <input 
                          type="number" 
                          placeholder="Stop Loss $" 
                          value={slPrice}
                          onChange={e => setSlPrice(e.target.value)}
                          className="w-full bg-slate-900 border border-red-900/30 text-red-400 text-xs rounded-lg p-2 pl-7 font-mono placeholder:text-red-900/50 focus:border-red-500 focus:outline-none transition-colors"
                      />
                      <ArrowDownToLine size={12} className="absolute left-2 top-2.5 text-red-500"/>
                  </div>
                  <button 
                      onClick={() => handlePlaceOrder('stop_loss')}
                      disabled={!slPrice}
                      className="bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-500 text-xs font-bold rounded-lg border border-red-500/20 px-3 transition-colors"
                  >
                      Set
                  </button>
              </div>

              <div className="flex gap-2">
                  <div className="relative flex-1">
                      <input 
                          type="number" 
                          placeholder="Take Profit $" 
                          value={tpPrice}
                          onChange={e => setTpPrice(e.target.value)}
                          className="w-full bg-slate-900 border border-green-900/30 text-green-400 text-xs rounded-lg p-2 pl-7 font-mono placeholder:text-green-900/50 focus:border-green-500 focus:outline-none transition-colors"
                      />
                      <ArrowUpToLine size={12} className="absolute left-2 top-2.5 text-green-500"/>
                  </div>
                  <button 
                      onClick={() => handlePlaceOrder('take_profit')}
                      disabled={!tpPrice}
                      className="bg-green-500/10 hover:bg-green-500/20 disabled:opacity-50 text-green-500 text-xs font-bold rounded-lg border border-green-500/20 px-3 transition-colors"
                  >
                      Set
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};
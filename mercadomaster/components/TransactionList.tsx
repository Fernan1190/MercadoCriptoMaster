import React from 'react';
import { useGame } from '../context/GameContext';
import { ArrowUpRight, ArrowDownLeft, History, TrendingUp, TrendingDown } from 'lucide-react';

export const TransactionList: React.FC = () => {
  const { stats, market } = useGame();
  const txs = stats.transactions || [];

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl h-full flex flex-col">
       <h3 className="text-white font-bold flex items-center gap-2 mb-4">
          <History size={20} className="text-blue-400"/> Historial y Rendimiento
       </h3>
       
       <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-3 max-h-[250px]">
          {txs.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm italic gap-2">
                <History size={32} className="opacity-20"/>
                <p>Sin operaciones recientes</p>
             </div>
          ) : (
             txs.map(tx => {
                // Cálculo de PnL (Profit and Loss) Teórico
                const currentPrice = market.prices[tx.symbol] || tx.price;
                const priceDiff = currentPrice - tx.price;
                const pnlPercent = ((priceDiff / tx.price) * 100);
                
                // Si compramos (buy), ganamos si sube. Si vendimos (sell), "ganamos" si baja (short teórico) o simplemente mostramos la diff.
                // Para simplificar en spot: PnL solo tiene sentido real en Buy si holderas, o en Sell si comparas con recompra.
                // Aquí mostraremos el rendimiento del activo desde que se hizo la operación.
                const isProfitable = (tx.type === 'buy' && priceDiff > 0) || (tx.type === 'sell' && priceDiff < 0); 
                const colorClass = isProfitable ? 'text-green-400' : 'text-red-400';

                return (
                  <div key={tx.id} className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors group">
                     
                     {/* Icono y Tipo */}
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${tx.type === 'buy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                           {tx.type === 'buy' ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                        </div>
                        <div>
                           <div className="text-white font-bold text-sm flex gap-1">
                              {tx.type === 'buy' ? 'Compra' : 'Venta'} <span className="text-slate-400">{tx.symbol}</span>
                           </div>
                           <div className="text-slate-500 text-xs font-mono">{tx.timestamp.split(' ')[1]}</div>
                        </div>
                     </div>

                     {/* Detalles Numéricos */}
                     <div className="text-right">
                        <div className="text-white font-mono font-bold text-sm">
                           {tx.type === 'buy' ? '-' : '+'}${ (tx.amount * tx.price).toLocaleString(undefined, {maximumFractionDigits: 0}) }
                        </div>
                        
                        {/* PnL Badge */}
                        <div className={`text-[10px] flex items-center justify-end gap-1 ${colorClass}`}>
                           {isProfitable ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
                           {Math.abs(pnlPercent).toFixed(2)}%
                           <span className="text-slate-600 ml-1 hidden group-hover:inline">desde op.</span>
                        </div>
                     </div>
                  </div>
                );
             })
          )}
       </div>
    </div>
  );
};
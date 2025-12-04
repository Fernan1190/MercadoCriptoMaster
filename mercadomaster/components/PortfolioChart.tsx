import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useGame } from '../context/GameContext';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

export const PortfolioChart: React.FC = () => {
  const { stats, market } = useGame();

  const data = [
    { name: 'USD (Cash)', value: stats.balance },
    ...Object.entries(stats.portfolio || {}).map(([symbol, amount]) => ({
      name: symbol,
      value: amount * (market.prices[symbol] || 0)
    })).filter(item => item.value > 1) 
  ];

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const initialCapital = 10000; // Capital base del juego
  const profit = totalValue - initialCapital;
  const profitPercent = ((profit / initialCapital) * 100).toFixed(2);
  const isProfit = profit >= 0;

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
         <h3 className="text-white font-bold flex items-center gap-2">
            <Wallet size={20} className="text-purple-500"/> Portafolio
         </h3>
         <span className="text-xs text-slate-400 font-mono">Total: ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
      </div>

      <div className="flex-1 min-h-[200px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#334155' : COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
               formatter={(value: number) => [`$${value.toFixed(2)}`, 'Valor']}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
        
        {/* PnL Central */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">PnL Total</div>
              <div className={`text-lg font-black flex items-center justify-center gap-1 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                 {isProfit ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                 {isProfit ? '+' : ''}{profitPercent}%
              </div>
              <div className="text-xs text-slate-400 font-mono">
                 ${Math.abs(profit).toLocaleString(undefined, {maximumFractionDigits:0})}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
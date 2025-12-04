import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface EducationalChartProps {
  type: 'chart_line' | 'chart_candle' | 'chart_volume' | 'diagram_flow' | 'none';
  meta?: {
    trend?: 'up' | 'down' | 'volatile' | 'flat';
    showIndicators?: boolean;
    label?: string;
  };
}

// Generador de datos simples para ejemplos educativos
const generateEduData = (trend: string = 'up', count: number = 20) => {
  let price = 100;
  return Array.from({ length: count }).map((_, i) => {
    const volatility = trend === 'volatile' ? 10 : 2;
    const bias = trend === 'up' ? 1 : trend === 'down' ? -1 : 0;
    const change = (Math.random() * volatility * 2 - volatility) + bias;
    price += change;
    return { name: i, price: Math.abs(price), volume: Math.random() * 1000 + 500 };
  });
};

export const EducationalChart: React.FC<EducationalChartProps> = ({ type, meta }) => {
  const data = generateEduData(meta?.trend || 'up');
  const color = meta?.trend === 'down' ? '#ef4444' : '#22c55e'; // Rojo si baja, Verde si sube

  if (type === 'none') return null;

  return (
    <div className="w-full h-64 bg-slate-800/50 rounded-2xl border border-slate-700 p-4 mb-6 relative overflow-hidden shadow-inner">
      {/* Etiqueta del Concepto */}
      {meta?.label && (
        <div className="absolute top-2 left-2 z-10 bg-slate-900/80 px-3 py-1 rounded-full text-xs font-bold text-white border border-slate-600 backdrop-blur-sm">
           👀 Concepto: {meta.label}
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        {type === 'chart_volume' ? (
           <BarChart data={data}>
              <Bar dataKey="volume" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.8} />
              <XAxis dataKey="name" hide />
           </BarChart>
        ) : (
           <AreaChart data={data}>
              <defs>
                <linearGradient id={`grad-${meta?.trend}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                 contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }}
                 formatter={(val: number) => val.toFixed(2)}
              />
              <Area 
                 type="monotone" 
                 dataKey="price" 
                 stroke={color} 
                 strokeWidth={3}
                 fill={`url(#grad-${meta?.trend})`} 
                 animationDuration={1500}
              />
              {/* Línea de Referencia para explicar Soportes/Resistencias */}
              {meta?.showIndicators && (
                 <ReferenceLine y={data[0].price} stroke="white" strokeDasharray="3 3" label={{ position: 'right', value: 'Soporte', fill: 'white', fontSize: 10 }} />
              )}
           </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
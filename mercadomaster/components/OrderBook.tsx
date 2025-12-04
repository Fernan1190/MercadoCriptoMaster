import React, { useMemo } from 'react';

interface OrderBookProps {
  currentPrice: number;
}

export const OrderBook: React.FC<OrderBookProps> = ({ currentPrice }) => {
  // Generamos órdenes falsas basadas en el precio actual
  // Usamos useMemo para que no cambien en cada render milimétrico, solo cuando el precio cambia
  const { asks, bids } = useMemo(() => {
    const generateOrders = (basePrice: number, type: 'ask' | 'bid') => {
      return Array.from({ length: 6 }).map((_, i) => {
        const spread = basePrice * 0.0005; // 0.05% de diferencia (Spread)
        const priceOffset = Math.random() * spread * (i + 1);
        const price = type === 'ask' ? basePrice + priceOffset : basePrice - priceOffset;
        const amount = Math.random() * 2; // Cantidad aleatoria
        return { price, amount };
      }).sort((a, b) => type === 'ask' ? b.price - a.price : b.price - a.price); // Ordenar visualmente
    };

    return {
      asks: generateOrders(currentPrice, 'ask').reverse(), // Ventas (Rojo)
      bids: generateOrders(currentPrice, 'bid')            // Compras (Verde)
    };
  }, [currentPrice]);

  return (
    <div className="hidden md:flex flex-col w-40 border-l border-slate-800 pl-4 ml-4 text-[10px] font-mono leading-tight">
      <div className="text-slate-500 font-bold mb-2 flex justify-between">
        <span>Precio</span>
        <span>Monto</span>
      </div>
      
      {/* Vendedores (Asks) - Rojo */}
      <div className="flex flex-col-reverse gap-0.5 mb-2 overflow-hidden">
        {asks.map((order, i) => (
          <div key={`ask-${i}`} className="flex justify-between text-red-400 relative">
             <div className="absolute right-0 top-0 bottom-0 bg-red-500/10" style={{ width: `${Math.random() * 100}%` }}></div>
             <span className="relative z-10">{order.price.toFixed(2)}</span>
             <span className="text-slate-500 relative z-10">{order.amount.toFixed(3)}</span>
          </div>
        ))}
      </div>

      {/* Precio Actual (Centro) */}
      <div className={`text-center py-1 font-bold text-sm border-y border-slate-800 my-1 ${Math.random() > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
        {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[8px] text-slate-500">USD</span>
      </div>

      {/* Compradores (Bids) - Verde */}
      <div className="flex flex-col gap-0.5 overflow-hidden">
        {bids.map((order, i) => (
          <div key={`bid-${i}`} className="flex justify-between text-green-400 relative">
            <div className="absolute right-0 top-0 bottom-0 bg-green-500/10" style={{ width: `${Math.random() * 100}%` }}></div>
            <span className="relative z-10">{order.price.toFixed(2)}</span>
            <span className="text-slate-500 relative z-10">{order.amount.toFixed(3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
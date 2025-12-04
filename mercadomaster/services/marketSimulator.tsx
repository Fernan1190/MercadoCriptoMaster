import { CandleData } from '../types';

export const INITIAL_PRICES = {
  BTC: 65000,
  ETH: 3500,
  SOL: 145,
  AAPL: 180,
  TSLA: 240
};

// Genera una vela, pero ahora acepta "bias" (tendencia forzada por eventos)
export const generateNextCandle = (
    prevClose: number, 
    volatility: number = 0.002, 
    trendBias: number = 0 // Nuevo: -1 (muy bajista) a 1 (muy alcista)
): CandleData => {
  
  // El cambio base es aleatorio
  let randomMove = (Math.random() * volatility * 2 - volatility);
  
  // Aplicamos el sesgo del evento (si trendBias es positivo, empuja arriba. Si es negativo, abajo)
  // Multiplicamos por volatilidad para que sea proporcional al activo
  const eventImpact = trendBias * volatility * 5; 
  
  const change = 1 + randomMove + eventImpact;
  const close = prevClose * change;
  
  // Mechas dinámicas según volatilidad
  const high = Math.max(prevClose, close) * (1 + Math.random() * volatility * 0.8);
  const low = Math.min(prevClose, close) * (1 - Math.random() * volatility * 0.8);
  
  const now = new Date();
  return {
    time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
    open: prevClose,
    high,
    low,
    close
  };
};

export const generateHistory = (basePrice: number, count: number): CandleData[] => {
  let price = basePrice;
  const data: CandleData[] = [];
  for (let i = 0; i < count; i++) {
    const candle = generateNextCandle(price);
    price = candle.close;
    candle.time = `${10 + Math.floor(i/60)}:${i%60}`; 
    data.push(candle);
  }
  return data;
};
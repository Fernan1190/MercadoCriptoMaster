import { CandleData } from '../types';

export const INITIAL_PRICES = {
  BTC: 65000,
  ETH: 3500,
  SOL: 145,
  AAPL: 180,
  TSLA: 240
};

// Generador de distribución normal (Box-Muller) para movimientos realistas
const randn_bm = (): number => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

export const generateNextCandle = (
    prevClose: number, 
    volatility: number = 0.002, 
    trendBias: number = 0 
): CandleData => {
  
  const dt = 1/24; 
  const drift = trendBias * 0.5; 
  
  const randomShock = volatility * Math.sqrt(dt) * randn_bm();
  const driftComponent = drift * dt;
  
  const change = Math.exp(driftComponent + randomShock);
  const close = prevClose * change;
  
  const moveSize = Math.abs(close - prevClose);
  const noiseHigh = Math.abs(randn_bm()) * volatility * prevClose * 0.5;
  const noiseLow = Math.abs(randn_bm()) * volatility * prevClose * 0.5;

  const high = Math.max(prevClose, close) + noiseHigh + (moveSize * 0.1);
  const low = Math.min(prevClose, close) - noiseLow - (moveSize * 0.1);
  
  // Generar volumen realista: Mayor volatilidad = Mayor volumen
  // Base aleatoria + bonus por tamaño del movimiento
  const baseVolume = 1000;
  const volatilityBonus = (moveSize / prevClose) * 1000000; 
  const volume = Math.floor(baseVolume + Math.random() * 2000 + volatilityBonus);

  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour12: false });

  return {
    time: timeString,
    open: prevClose,
    high,
    low,
    close,
    volume // <--- AQUI ESTABA EL ERROR (Faltaba esta propiedad)
  };
};

export const generateHistory = (basePrice: number, count: number): CandleData[] => {
  let price = basePrice;
  const data: CandleData[] = [];
  const initialTrend = (Math.random() - 0.5) * 0.5; 
  
  for (let i = 0; i < count; i++) {
    const candle = generateNextCandle(price, 0.002, initialTrend);
    price = candle.close;
    
    const d = new Date();
    d.setMinutes(d.getMinutes() - (count - i));
    candle.time = d.toLocaleTimeString('en-US', { hour12: false });
    
    data.push(candle);
  }
  return data;
};
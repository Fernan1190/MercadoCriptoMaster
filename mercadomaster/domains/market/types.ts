/**
 * Types para el dominio de Market
 */

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketEvent {
  id: string;
  name: string;
  description: string;
  impact: { [symbol: string]: number };
  duration: number;
}

export interface MarketState {
  prices: { [symbol: string]: number };
  history: { [symbol: string]: CandleData[] };
  trend: { [symbol: string]: 'up' | 'down' | 'neutral' };
  phase: 'accumulation' | 'bull_run' | 'correction' | 'capitulation';
  activeEvents: { event: MarketEvent; ticksLeft: number }[];
  globalVolatility: number;
}

export interface VolatilityFactors {
  baseVolatility: number;
  eventVolatility: number;
  trendVolatility: number;
  phaseVolatility: number;
  totalVolatility: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  bollinger: { upper: number; middle: number; lower: number };
  sma: number;
  volatility: number;
}

export interface MarketActions {
  generateNextCandle: (symbol: string) => CandleData;
  updatePrices: (symbols: string[]) => void;
  getTechnicalIndicators: (symbol: string) => TechnicalIndicators;
  getTradeSignal: (symbol: string) => 'buy' | 'sell' | 'neutral';
}

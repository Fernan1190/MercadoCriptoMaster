/**
 * MarketSimulator - Lógica pura de simulación de mercado
 * ✅ Sin estado, sin contexto, sin side-effects
 * ✅ Totalmente testeable
 */
export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}


export interface MarketState {
  prices: { [symbol: string]: number };
  history: { [symbol: string]: CandleData[] };
  trend: { [symbol: string]: 'up' | 'down' | 'neutral' };
  phase: 'accumulation' | 'bull_run' | 'distribution' | 'bear_market' | 'crash';
  activeEvents: { event: MarketEvent; ticksLeft: number }[];
  globalVolatility: number;
}

export interface MarketEvent {
  id: string;
  name: string;
  title?: string;  // Alias para compatibilidad
  description: string;
  type?: string;   // Nuevo campo
  icon?: string;   // Nuevo campo
  impact: { [symbol: string]: number };
  duration: number;
}


export interface VolatilityFactors {
  baseVolatility: number;
  eventVolatility: number;
  trendVolatility: number;
  phaseVolatility: number;
  totalVolatility: number;
}

export class MarketSimulator {
  private readonly MIN_PRICE = 100;
  private readonly MAX_PRICE = 100000;
  private readonly BASE_VOLATILITY = 0.002; // 0.2%

  /**
   * Genera la siguiente vela OHLC basada en la anterior
   * @param lastClose Precio de cierre anterior
   * @param baseVolatility Volatilidad base del mercado
   * @param volatilityMultiplier Multiplicador por eventos
   * @param trendBias Sesgo direccional (-1 a 1)
   */
  generateNextCandle(
    lastClose: number,
    baseVolatility: number = this.BASE_VOLATILITY,
    volatilityMultiplier: number = 1,
    trendBias: number = 0
  ): CandleData {
    const effectiveVolatility = baseVolatility * volatilityMultiplier;

    // Open cercano al cierre anterior (gap pequeño)
    const gapChance = Math.random();
    const gap = gapChance < 0.1 ? lastClose * (Math.random() - 0.5) * 0.02 : 0;
    const open = Math.max(this.MIN_PRICE, lastClose + gap);

    // Movimiento durante la vela
    const trend = trendBias + (Math.random() - 0.5) * 0.1;
    const volatilityMove = (Math.random() - 0.5) * 2 * effectiveVolatility;
    const close = Math.max(this.MIN_PRICE, open * (1 + trend * 0.01 + volatilityMove));

    // High y Low
    const high = Math.max(open, close) * (1 + Math.random() * effectiveVolatility);
    const low = Math.min(open, close) * (1 - Math.random() * effectiveVolatility);

    // Volume (simulado)
    const volume = Math.random() * 1000 + 500;

    return {
      timestamp: Date.now(),
      open,
      high,
      low,
      close,
      volume,
    };
  }

  /**
   * Determina la tendencia comparando precio actual con SMA
   */
  determineTrend(
    currentPrice: number,
    smaPrice: number
  ): 'up' | 'down' | 'neutral' {
    const changePercent = ((currentPrice - smaPrice) / smaPrice) * 100;

    if (changePercent > 0.5) return 'up';
    if (changePercent < -0.5) return 'down';
    return 'neutral';
  }

  /**
   * Calcula promedio móvil simple (SMA)
   */
  calculateSMA(candles: CandleData[], period: number = 20): number {
    if (candles.length < period) {
      return candles[candles.length - 1]?.close ?? 0;
    }

    const recentCandles = candles.slice(-period);
    const sum = recentCandles.reduce((acc, c) => acc + c.close, 0);
    return sum / period;
  }

  /**
   * Calcula volatilidad histórica
   */
  calculateHistoricalVolatility(
    candles: CandleData[],
    period: number = 20
  ): number {
    if (candles.length < period) return this.BASE_VOLATILITY;

    const recentCandles = candles.slice(-period);
    const returns = recentCandles.map((c, i) =>
      i === 0 ? 0 : (c.close - recentCandles[i - 1].close) / recentCandles[i - 1].close
    );

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    return Math.max(this.BASE_VOLATILITY, stdDev);
  }

  /**
   * Calcula RSI (Relative Strength Index)
   * Rango: 0-100. >70 = overbought, <30 = oversold
   */
  calculateRSI(candles: CandleData[], period: number = 14): number {
    if (candles.length < period + 1) return 50;

    const recentCandles = candles.slice(-(period + 1));
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < recentCandles.length; i++) {
      const change = recentCandles[i].close - recentCandles[i - 1].close;
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    return Math.min(100, Math.max(0, rsi));
  }

  /**
   * Calcula MACD (Moving Average Convergence Divergence)
   */
  calculateMACD(
    candles: CandleData[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
  ): {
    macd: number;
    signal: number;
    histogram: number;
  } {
    const ema12 = this.calculateEMA(candles, fastPeriod);
    const ema26 = this.calculateEMA(candles, slowPeriod);
    const macd = ema12 - ema26;

    // Signal line es EMA del MACD (simplificado)
    const signal = macd * 0.85; // Aproximación

    return {
      macd,
      signal,
      histogram: macd - signal,
    };
  }

  /**
   * Calcula EMA (Exponential Moving Average)
   */
  private calculateEMA(candles: CandleData[], period: number): number {
    if (candles.length < period) {
      return candles[candles.length - 1]?.close ?? 0;
    }

    const k = 2 / (period + 1);
    let ema = candles[0].close;

    for (let i = 1; i < candles.length; i++) {
      ema = candles[i].close * k + ema * (1 - k);
    }

    return ema;
  }

  /**
   * Calcula Bollinger Bands
   */
  calculateBollingerBands(
    candles: CandleData[],
    period: number = 20,
    stdDevMultiplier: number = 2
  ): {
    upper: number;
    middle: number;
    lower: number;
  } {
    const middle = this.calculateSMA(candles, period);

    if (candles.length < period) {
      return { upper: middle * 1.1, middle, lower: middle * 0.9 };
    }

    const recentCandles = candles.slice(-period);
    const variance = recentCandles.reduce(
      (sum, c) => sum + Math.pow(c.close - middle, 2),
      0
    ) / period;
    const stdDev = Math.sqrt(variance);

    return {
      upper: middle + stdDev * stdDevMultiplier,
      middle,
      lower: middle - stdDev * stdDevMultiplier,
    };
  }

   /**
   * Determina la fase del mercado basada en el contexto
   */
  determineMarketPhase(
    rsi: number,
    volatility: number,
    trend: 'up' | 'down' | 'neutral'
  ): 'accumulation' | 'bull_run' | 'distribution' | 'bear_market' | 'crash' {
    if (rsi > 70 && trend === 'up') return 'bull_run';
    if (rsi < 30 && trend === 'down') return 'bear_market';
    if (volatility > this.BASE_VOLATILITY * 2) return 'crash';
    return 'accumulation';
  }


  /**
   * Calcula factores de volatilidad total
   */
  calculateVolatilityFactors(
    baseVolatility: number,
    eventImpact: number,
    trendFactor: number,
    phaseMultiplier: number
  ): VolatilityFactors {
    return {
      baseVolatility,
      eventVolatility: baseVolatility * eventImpact,
      trendVolatility: baseVolatility * Math.abs(trendFactor),
      phaseVolatility: baseVolatility * phaseMultiplier,
      totalVolatility: baseVolatility * eventImpact * phaseMultiplier,
    };
  }

  /**
   * Valida si un precio es realista
   */
  isValidPrice(price: number): boolean {
    return price >= this.MIN_PRICE && price <= this.MAX_PRICE && price > 0;
  }

  /**
   * Calcula cambio porcentual entre dos precios
   */
  calculatePriceChange(oldPrice: number, newPrice: number): number {
    return ((newPrice - oldPrice) / oldPrice) * 100;
  }

  /**
   * Detecta señales de compra/venta basadas en RSI y MACD
   */
  getTradeSignal(
    rsi: number,
    macdHistogram: number
  ): 'buy' | 'sell' | 'neutral' {
    if (rsi < 30 && macdHistogram > 0) return 'buy';
    if (rsi > 70 && macdHistogram < 0) return 'sell';
    return 'neutral';
  }
}

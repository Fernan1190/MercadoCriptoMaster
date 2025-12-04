import { MarketEvent } from '../types';

export const MARKET_EVENTS: MarketEvent[] = [
  {
    id: 'tech_boom',
    title: "¡BOOM de la IA!",
    description: "Una nueva tecnología revoluciona el sector. Las acciones tecnológicas se disparan.",
    type: 'macro',
    impact: { AAPL: 2.5, TSLA: 3.0, volatility: 1.2 },
    duration: 15,
    icon: "🤖"
  },
  {
    id: 'crypto_regulation',
    title: "Regulación Estricta",
    description: "Gobiernos anuncian medidas duras contra las criptomonedas. Pánico en el mercado.",
    type: 'news',
    impact: { BTC: -2.0, ETH: -2.5, SOL: -3.0, volatility: 2.5 },
    duration: 10,
    icon: "⚖️"
  },
  {
    id: 'inflation_spike',
    title: "Dato de Inflación Alto",
    description: "La inflación sube más de lo esperado. Miedo generalizado en todos los mercados.",
    type: 'macro',
    impact: { AAPL: -1.5, BTC: -1.2, volatility: 1.5 },
    duration: 8,
    icon: "📈"
  },
  {
    id: 'etf_approval',
    title: "ETF de Spot Aprobado",
    description: "La SEC aprueba ETFs de criptomonedas al contado. Entrada masiva de capital institucional.",
    type: 'news',
    impact: { BTC: 4.0, ETH: 3.0, volatility: 1.8 },
    duration: 20,
    icon: "🏛️"
  },
  {
    id: 'exchange_hack',
    title: "Hackeo de Exchange",
    description: "Un exchange importante ha sido hackeado. Incertidumbre extrema.",
    type: 'black_swan',
    impact: { BTC: -4.0, ETH: -4.0, SOL: -5.0, volatility: 4.0 },
    duration: 5,
    icon: "💀"
  },
  {
    id: 'fed_pivot',
    title: "La FED baja Tipos",
    description: "Dinero barato inunda el mercado. ¡Fiesta en Wall Street y Cripto!",
    type: 'macro',
    impact: { AAPL: 2.0, BTC: 2.0, TSLA: 3.0, volatility: 0.8 },
    duration: 25,
    icon: "🏦"
  }
];
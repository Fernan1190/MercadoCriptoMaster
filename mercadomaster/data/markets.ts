import { MarketNode } from '../../types';

export const MARKET_NODES: MarketNode[] = [
  { 
    id: 'ny', 
    name: 'New York (NYSE)', 
    lat: 40.7128, 
    lng: -74.0060, 
    cost: 0, 
    desc: "El corazón financiero del mundo. Volatilidad media-alta.",
    assets: ['AAPL', 'TSLA', 'MSFT'],
    region: 'america',
    timezone: 'America/New_York'
  },
  { 
    id: 'london', 
    name: 'London (LSE)', 
    lat: 51.5074, 
    lng: -0.1278, 
    cost: 5000, 
    desc: "Puerta de Europa. Ideal para Forex y materias primas.",
    assets: ['BP', 'HSBC', 'SHEL'],
    region: 'europe',
    timezone: 'Europe/London'
  },
  { 
    id: 'tokyo', 
    name: 'Tokyo (TSE)', 
    lat: 35.6762, 
    lng: 139.6503, 
    cost: 12000, 
    desc: "Tecnología y automoción. Abre cuando occidente duerme.",
    assets: ['SONY', 'TM', 'NINTENDO'],
    region: 'asia',
    timezone: 'Asia/Tokyo'
  },
  { 
    id: 'hong_kong', 
    name: 'Hong Kong (HKEX)', 
    lat: 22.3193, 
    lng: 114.1694, 
    cost: 25000, 
    desc: "El puente con China. Mercado de alto riesgo y recompensa.",
    assets: ['TENCENT', 'BABA', 'BYD'],
    region: 'asia',
    timezone: 'Asia/Hong_Kong'
  },
  { 
    id: 'zurich', 
    name: 'Zürich (SIX)', 
    lat: 47.3769, 
    lng: 8.5417, 
    cost: 50000, 
    desc: "El refugio seguro. Banca privada y farmacéuticas.",
    assets: ['NESTLE', 'ROCHE', 'UBS'],
    region: 'europe',
    timezone: 'Europe/Zurich'
  }
];
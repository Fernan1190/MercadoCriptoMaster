import { QuizQuestion } from '../types';

export interface BankQuestion extends QuizQuestion {
  tags: string[]; 
}

export const QUESTION_BANK: BankQuestion[] = [
  // --- BASICS EXISTING ---
  {
    type: 'true_false',
    question: "¿Es posible perder más dinero del que invertiste al comprar una acción normal (sin apalancamiento)?",
    options: ["Verdadero", "Falso"],
    correctIndex: 1,
    correctAnswerText: "Falso",
    difficulty: "easy",
    explanation: "Con acciones al contado, lo máximo que pierdes es el 100%.",
    tags: ['#basics', '#risk', '#stocks']
  },
  
  // --- NEW: FUNDAMENTAL ANALYSIS ---
  {
    type: 'multiple_choice',
    question: "¿Qué ratio usarías para saber si una empresa está 'barata' respecto a sus beneficios?",
    options: ["RSI", "PER (Price to Earnings)", "MACD", "Volumen"],
    correctIndex: 1,
    correctAnswerText: "PER (Price to Earnings)",
    difficulty: "medium",
    explanation: "El PER relaciona el precio actual con los beneficios por acción.",
    tags: ['#fundamental', '#stocks', '#valuation']
  },
  {
    type: 'binary_prediction',
    question: "Una empresa anuncia que NO pagará dividendos para reinvertir en crecimiento. ¿Es esto necesariamente malo?",
    options: ["Sí, quiero mi dinero", "No, puede ser bueno"],
    correctIndex: 1,
    correctAnswerText: "No, puede ser bueno",
    difficulty: "medium",
    explanation: "Empresas como Amazon o Google no pagan dividendos porque crecen muy rápido reinvirtiendo todo.",
    tags: ['#fundamental', '#strategy']
  },
  {
    type: 'matching',
    question: "Relaciona el estado financiero con su función:",
    pairs: [
      { left: "Balance General", right: "Lo que tengo y debo (Foto)" },
      { left: "Cuenta de Resultados", right: "Lo que gané este año (Video)" },
      { left: "Flujo de Caja", right: "El dinero real en el banco" }
    ],
    difficulty: "hard",
    explanation: "Son los 3 pilares de la contabilidad.",
    tags: ['#fundamental', '#accounting']
  },

  // --- NEW: TECHNICAL ANALYSIS ---
  {
    type: 'binary_prediction',
    question: "El precio rebota en una línea de tendencia alcista. ¿Qué es más probable?",
    options: ["Que siga subiendo", "Que rompa y baje"],
    correctIndex: 0,
    correctAnswerText: "Que siga subiendo",
    difficulty: "medium",
    explanation: "La tendencia es tu amiga hasta que se demuestre lo contrario.",
    tags: ['#technical', '#trend']
  },

  // --- NEW: CRYPTO ADVANCED ---
  {
    type: 'multiple_choice',
    question: "¿Qué es una 'Layer 2' (Capa 2) en Cripto?",
    options: ["Una nueva criptomoneda rival", "Una solución para hacer la red principal más rápida y barata", "Un tipo de estafa", "La web profunda"],
    correctIndex: 1,
    correctAnswerText: "Una solución para hacer la red principal más rápida y barata",
    difficulty: "medium",
    explanation: "Ejemplos son Arbitrum u Optimism, que ayudan a Ethereum a escalar.",
    tags: ['#crypto', '#tech', '#ethereum']
  },
  {
    type: 'true_false',
    question: "Si pierdes tus 12 palabras (frase semilla), ¿el soporte técnico de Bitcoin puede recuperarlas?",
    options: ["Verdadero", "Falso"],
    correctIndex: 1,
    correctAnswerText: "Falso",
    difficulty: "easy",
    explanation: "NO existe soporte técnico en Bitcoin. Tú eres tu propio banco. Si pierdes la clave, pierdes todo.",
    tags: ['#crypto', '#security', '#bitcoin']
  },
  {
    type: 'sentiment_swipe',
    question: "Clasifica estos eventos para el precio de Bitcoin:",
    sentimentCards: [
      { text: "Un país adopta BTC como moneda legal", sentiment: "bullish" },
      { text: "China prohíbe la minería otra vez", sentiment: "bearish" },
      { text: "El Halving será la próxima semana", sentiment: "bullish" }
    ],
    difficulty: "easy",
    explanation: "Adopción y escasez (Halving) son positivos. Prohibiciones son negativas.",
    tags: ['#crypto', '#news', '#sentiment']
  },

  // --- NEW: PSYCHOLOGY ---
  {
    type: 'risk_slider',
    question: "El mercado ha caído un 40% en un mes. Tienes dinero disponible. ¿Qué nivel de agresividad compras?",
    riskScenario: { correctValue: 70, tolerance: 30, minLabel: "Vender todo (Pánico)", maxLabel: "Comprar (Oportunidad)" },
    difficulty: "hard",
    explanation: "Como dijo Rothschild: 'Compra cuando haya sangre en las calles'. Es difícil psicológicamente, pero suele ser rentable.",
    tags: ['#psychology', '#strategy']
  },

  {
    type: 'cloze',
    question: "Completa la definición:",
    clozeText: "El {0} mide cuánto tarda una inversión en recuperar su coste.",
    clozeOptions: ["PER", "RSI", "Volumen", "ROI"],
    correctAnswerText: "PER",
    difficulty: "medium",
    explanation: "El Price-to-Earnings Ratio indica los años necesarios para recuperar la inversión vía beneficios.",
    tags: ['#fundamental', '#stocks']
  }
];
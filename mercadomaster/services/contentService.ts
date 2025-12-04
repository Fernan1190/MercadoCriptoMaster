import { LessonContent, QuizQuestion, CandleData } from "../types";
import { STATIC_LESSONS } from "../data/staticLessons";
import { QUESTION_BANK } from "../data/questionBank";

const CURRICULUM: Record<string, string[]> = {
  "Inversor de Bolsa": [
    "Fundamentos de Mercado", "Riesgo vs Recompensa", "Velas Japonesas", "Soportes y Resistencias", "Volumen",
    "Medias Móviles", "RSI y Sobrecompra", "Psicología del Trading", "Gestión de Capital", "Diversificación",
    "Dividendos", "Interés Compuesto", "ETFs vs Acciones", "Análisis Fundamental", "PER y EPS",
    "Balances Financieros", "Deuda y Pasivos", "Fosos Económicos (Moats)", "IPOs", "Short Selling",
    "Opciones Básicas", "Futuros", "Bonos del Tesoro", "Inflación y Tasas", "Ciclos de Mercado",
    "Crash del 29", "Burbuja DotCom", "Crisis de 2008", "Trading Algorítmico", "Market Makers",
    "Order Flow", "Price Action", "Patrones Chartistas", "Hombro-Cabeza-Hombro", "Triángulos",
    "Gaps", "Fibonacci", "Ondas de Elliott", "Wyckoff", "Smart Money Concepts",
    "Trading Intradía", "Swing Trading", "Inversión en Valor", "Growth Investing", "Impuestos",
    "Brokers y Plataformas", "Regulación SEC", "Manipulación de Mercado", "Cisnes Negros", "Libertad Financiera"
  ],
  "Experto Cripto": [
    "Bitcoin: Oro Digital", "Blockchain: La Base", "Hot vs Cold Wallets", "Minería (PoW)", "Halving de Bitcoin",
    "Ethereum y Smart Contracts", "Gas Fees", "Proof of Stake", "Altcoins", "Stablecoins",
    "Exchanges Centralizados (CEX)", "DEX (Uniswap)", "DeFi: Finanzas Descentralizadas", "Yield Farming", "Staking",
    "Liquidity Pools", "Impermanent Loss", "NFTs: Arte y Utilidad", "Metaverso", "GameFi",
    "DAOs", "Gobernanza On-Chain", "Layer 2 (Polygon/Arbitrum)", "Puentes (Bridges)", "Oráculos (Chainlink)",
    "Identidad Digital", "Privacidad (Monero)", "Seguridad: Seed Phrases", "Estafas Comunes", "Phishing",
    "Análisis On-Chain", "Ballenas", "Ciclos de Bitcoin", "Fear & Greed Index", "Dominancia de BTC",
    "Tokenomics", "Vesting Schedules", "ICOs y IDOs", "Airdrops", "Web3 Social",
    "Regulación Cripto", "CBDCs", "Lightning Network", "Zk-Rollups", "Interoperabilidad",
    "Real World Assets (RWA)", "Tokenización", "Custodia Institucional", "Futuro de Cripto", "Soberanía Financiera"
  ]
};

const getTopicForLevel = (pathTitle: string, level: number): string => {
  const pathCurriculum = CURRICULUM[pathTitle] || CURRICULUM["Inversor de Bolsa"];
  const topicIndex = (level - 1) % pathCurriculum.length;
  return pathCurriculum[topicIndex];
};

const getTagsForTopic = (topic: string, isCrypto: boolean): string[] => {
  const tags: string[] = isCrypto ? ['#crypto'] : ['#stocks'];
  const lowerTopic = topic.toLowerCase();

  if (lowerTopic.includes('riesgo') || lowerTopic.includes('capital') || lowerTopic.includes('psicología')) tags.push('#risk', '#psychology', '#strategy');
  if (lowerTopic.includes('velas') || lowerTopic.includes('técnico') || lowerTopic.includes('patrones') || lowerTopic.includes('soportes')) tags.push('#technical', '#candles', '#patterns');
  if (lowerTopic.includes('rsi') || lowerTopic.includes('medias') || lowerTopic.includes('volumen')) tags.push('#technical', '#indicators', '#volume');
  if (lowerTopic.includes('bitcoin') || lowerTopic.includes('btc')) tags.push('#bitcoin');
  if (lowerTopic.includes('ethereum') || lowerTopic.includes('defi')) tags.push('#ethereum', '#defi');
  if (lowerTopic.includes('blockchain') || lowerTopic.includes('minería')) tags.push('#tech', '#blockchain');
  if (lowerTopic.includes('fundamental') || lowerTopic.includes('noticias')) tags.push('#news');
  if (lowerTopic.includes('básico') || lowerTopic.includes('fundamento') || lowerTopic.includes('intro')) tags.push('#basics');

  return tags;
};

// --- MEJORA 1: BRAIN GYM ---
export const generateBrainGymLesson = (mistakes: QuizQuestion[]): LessonContent => {
  const pool = mistakes.length >= 3 
    ? mistakes 
    : [...mistakes, ...QUESTION_BANK.filter(q => q.difficulty === 'hard')];
    
  const selectedQuiz = Array.from(new Set(pool.sort(() => 0.5 - Math.random())))
    .slice(0, 5)
    .map(q => ({...q, question: `(Repaso) ${q.question}`}));

  return {
    id: `brain-gym-${Date.now()}`,
    title: "🧠 Gimnasio Mental",
    isBossLevel: false,
    generatedBy: 'fallback',
    slides: [{
      title: "Entrenamiento de Recuperación",
      content: "La repetición espaciada es la clave de la maestría. Vamos a repasar conceptos que te costaron anteriormente o que son de alta dificultad.",
      icon: "🏋️‍♂️",
      proTip: "No memorices la respuesta, entiende el porqué."
    }],
    quiz: selectedQuiz
  };
};

// --- MEJORA 2: TIME TRAVEL ---
export const generateHistoricalLesson = (era: '2008_crash' | '2020_covid' | '2017_ico'): LessonContent => {
  let title = "";
  let content = "";
  let basePrice = 100;
  let volatility = 0.02;
  let trend = -1;

  if (era === '2008_crash') {
      title = "El Crash de 2008";
      content = "Estás en Septiembre de 2008. Lehman Brothers acaba de quebrar. El pánico es total.";
      basePrice = 1500; 
      trend = -0.8; 
  } else if (era === '2017_ico') {
      title = "El Boom de las ICOs 2017";
      content = "Todo el mundo compra cualquier cosa que tenga 'blockchain' en el nombre. Euforia máxima.";
      basePrice = 3000; 
      trend = 1.2;
      volatility = 0.05;
  }

  const history: CandleData[] = [];
  let price = basePrice;
  for(let i=0; i<50; i++) {
      const change = 1 + (Math.random() * volatility * 2 - volatility) + (trend * 0.005);
      price *= change;
      history.push({
          time: `Day ${i}`,
          open: price,
          high: price * 1.02,
          low: price * 0.98,
          close: price * change,
          volume: Math.floor(Math.random() * 10000)
      });
  }

  return {
    id: `history-${era}`,
    title: `⏳ Viaje: ${title}`,
    isBossLevel: true,
    historicalData: history,
    slides: [{ title, content, icon: "🕰️", visualType: "chart_candle" }],
    quiz: [{
        type: 'binary_prediction',
        question: `Viendo el gráfico de ${title}, ¿qué harías ahora mismo?`,
        options: ["Vender (Pánico)", "Comprar (Oportunidad)"],
        correctIndex: 1,
        correctAnswerText: "Comprar (Oportunidad)",
        difficulty: "hard",
        explanation: "Como dijo Rothschild: 'Compra cuando haya sangre en las calles'. Históricamente, los crashes son las mejores oportunidades de compra."
    }]
  };
};

const generateProceduralLesson = (pathTitle: string, unitTitle: string, level: number): LessonContent => {
  const topic = getTopicForLevel(pathTitle, level);
  const isCrypto = pathTitle.toLowerCase().includes('cripto');
  const targetTags = getTagsForTopic(topic, isCrypto);
  
  const relevantQuestions = QUESTION_BANK.filter(q => 
    q.tags?.some(tag => targetTags.includes(tag))
  );

  const generalQuestions = QUESTION_BANK.filter(q => 
    q.tags?.includes(isCrypto ? '#crypto' : '#stocks') || q.tags?.includes('#basics')
  );

  let selectedPool = relevantQuestions.length >= 3 ? relevantQuestions : [...relevantQuestions, ...generalQuestions];
  
  const shuffled = selectedPool.sort(() => 0.5 - Math.random());
  const uniqueQuestions = Array.from(new Set(shuffled.map(q => q.question)))
    .map(qText => shuffled.find(q => q.question === qText)!)
    .slice(0, 3);

  if (uniqueQuestions.length === 0) {
      uniqueQuestions.push({
          type: 'true_false',
          question: "¿El mercado se mueve en ciclos?",
          options: ["Verdadero", "Falso"],
          correctIndex: 0,
          correctAnswerText: "Verdadero",
          difficulty: "easy",
          explanation: "Sí, la historia tiende a rimar.",
          tags: [],
          pedagogicalGoal: "Fallback"
      });
  }

  return {
    id: `procedural-${Date.now()}`,
    title: topic,
    isBossLevel: level % 5 === 0,
    generatedBy: 'fallback',
    slides: [
      { 
        title: topic, 
        content: `**${topic}** es clave para tu desarrollo como ${isCrypto ? 'experto en blockchain' : 'inversor inteligente'}.\n\nEn este nivel exploraremos los matices de este concepto. No basta con conocer la definición, hay que saber aplicarlo bajo presión.`, 
        analogy: "Es como aprender un nuevo idioma: al principio traduces, luego piensas directamente en él.", 
        icon: isCrypto ? "⛓️" : "🏛️",
        keyTerms: [topic, "Contexto", "Aplicación"],
        proTip: "Intenta conectar este concepto con lo que aprendiste en el nivel anterior."
      },
      {
        title: "En el Mundo Real",
        content: "Los mercados no son teoría pura. Son la suma de la psicología de millones de personas. **${topic}** es una herramienta para navegar ese caos.",
        analogy: "Un mapa no es el territorio, pero te ayuda a no perderte.",
        icon: "🌍",
        deepDive: {
            title: "Dato Curioso",
            content: "Muchos de los mejores traders del mundo empezaron perdiendo dinero hasta que dominaron conceptos como este."
        }
      }
    ],
    quiz: uniqueQuestions
  };
};

export const getLesson = async (pathId: string, unitId: string, levelInUnit: number, pathTitle: string, unitTitle: string): Promise<LessonContent> => {
  const staticKey = `${pathId}-${unitId}-${levelInUnit}`;
  
  if (STATIC_LESSONS[staticKey]) {
    console.log(`[ContentService] Loading static lesson: ${staticKey}`);
    await new Promise(r => setTimeout(r, 200)); 
    return STATIC_LESSONS[staticKey];
  }

  const topic = getTopicForLevel(pathTitle, levelInUnit);
  console.log(`[ContentService] Generating procedural lesson for: ${topic}`);
  await new Promise(r => setTimeout(r, 600)); 
  return generateProceduralLesson(pathTitle, unitTitle, levelInUnit);
};
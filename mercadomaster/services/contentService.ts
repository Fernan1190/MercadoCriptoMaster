import { LessonContent, QuizQuestion } from "../types";
import { STATIC_LESSONS } from "../data/staticLessons";
import { QUESTION_BANK } from "../data/questionBank";

// --- CURRICULUM SYLLABUS ---
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

// --- TAG EXTRACTOR ---
// Maps keywords in the topic title to tags in the question bank
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

// --- CONTEXTUAL GENERATOR ---
const generateProceduralLesson = (pathTitle: string, unitTitle: string, level: number): LessonContent => {
  const topic = getTopicForLevel(pathTitle, level);
  const isCrypto = pathTitle.toLowerCase().includes('cripto');
  
  // 1. Identify relevant tags for this lesson
  const targetTags = getTagsForTopic(topic, isCrypto);
  
  // 2. Filter Question Bank for matching tags
  // We prioritize questions that match MORE tags, but accept any match
  const relevantQuestions = QUESTION_BANK.filter(q => 
    q.tags.some(tag => targetTags.includes(tag))
  );

  // 3. Fallback: If not enough relevant questions, use general ones from the path
  const generalQuestions = QUESTION_BANK.filter(q => 
    q.tags.includes(isCrypto ? '#crypto' : '#stocks') || q.tags.includes('#basics')
  );

  let selectedPool = relevantQuestions.length >= 3 ? relevantQuestions : [...relevantQuestions, ...generalQuestions];
  
  // Shuffle and pick 3 unique questions
  const shuffled = selectedPool.sort(() => 0.5 - Math.random());
  // Deduplicate by question text to be safe
  const uniqueQuestions = Array.from(new Set(shuffled.map(q => q.question)))
    .map(qText => shuffled.find(q => q.question === qText)!)
    .slice(0, 3);

  // If still empty (shouldn't happen with a big bank), put a placeholder
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

// --- MAIN SERVICE FUNCTION ---
export const getLesson = async (pathId: string, unitId: string, levelInUnit: number, pathTitle: string, unitTitle: string): Promise<LessonContent> => {
  // 1. Construct the Static ID
  const staticKey = `${pathId}-${unitId}-${levelInUnit}`;
  
  // 2. Check if we have a handcrafted lesson
  if (STATIC_LESSONS[staticKey]) {
    console.log(`[ContentService] Loading static lesson: ${staticKey}`);
    await new Promise(r => setTimeout(r, 200)); 
    return STATIC_LESSONS[staticKey];
  }

  // 3. Fallback to Contextual Procedural Generation
  const topic = getTopicForLevel(pathTitle, levelInUnit);
  console.log(`[ContentService] Generating procedural lesson for: ${topic} with tags: ${getTagsForTopic(topic, pathTitle.toLowerCase().includes('cripto')).join(', ')}`);
  await new Promise(r => setTimeout(r, 600)); 
  return generateProceduralLesson(pathTitle, unitTitle, levelInUnit);
};

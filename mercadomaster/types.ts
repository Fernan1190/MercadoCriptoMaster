export interface UserStats {
  xp: number;
  level: number;
  league: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Master';
  streak: number;
  balance: number;
  hearts: number;
  maxHearts: number;
  portfolio: { [symbol: string]: number };
  transactions: Transaction[];
  unlockedAchievements: string[];
  masterCoins: number;
  completedLessons: string[];
  levelRatings: { [lessonId: string]: 1 | 2 | 3 };
  unlockedMarkets: string[];
  pendingOrders: PendingOrder[];
  customQuestions: QuizQuestion[]; 
  lessonNotes: { [lessonId: string]: string }; 
  questionsAnswered: number; 
  correctAnswers: number;    
  mistakes: QuizQuestion[]; 
  pathProgress: { [key in PathId]?: number };
  inventory: {
    hint5050: number;
    timeFreeze: number;
    skip: number;
    streakFreeze: number;
    doubleXp: number;
  };
  bookmarks: string[];
  dailyQuests: DailyQuest[];
  lastLogin?: string;
  openedChests: string[];
  theme: 'default' | 'cyberpunk' | 'terminal';
  unlockedThemes: string[];
  prestige: number;
  stakedCoins: number;
  minedCoins: number;
  quickNotes: string;
  
  // TYCOON
  officeItems: string[];
  officeTier: number;
  employees: string[];
  decorations: { id: string, x: number, y: number }[];
  xpMultiplier: number;
  lastSaveTime: number;
  activeSkin: { floor: string, wall: string };
  activeBuffs: { id: string, expiresAt: number, multiplier: number }[];
  unlockedSkins: string[];
  miningFarm: MiningStats; 

  // --- NUEVO: SKILLS ---
  skillPoints: number;
  unlockedSkills: string[]; 
}

// --- NUEVO: SKILL TREE ---
export interface SkillNode {
    id: string;
    title: string;
    description: string;
    icon: string;
    cost: number;
    requires: string[]; 
    x: number; 
    y: number; 
    category: 'trader' | 'miner' | 'sage';
}

// --- NUEVO: NPC EVENTS ---
export interface NpcOption {
    text: string;
    risk: 'low' | 'medium' | 'high' | 'none';
    actionId: string; 
}

export interface NpcEvent {
    id: string;
    npcName: string;
    npcAvatar: string; 
    dialogue: string;
    options: NpcOption[];
}

// ... (Resto de interfaces se mantienen igual)
export interface InstalledMiner { instanceId: string; modelId: string; condition: number; active: boolean; }
export interface InstalledRack { instanceId: string; modelId: string; slots: (InstalledMiner | null)[]; }
export interface MiningStats { racks: InstalledRack[]; minedFragments: number; totalHashrate: number; totalPowerConsumption: number; electricityCostPerWatt: number; }
export interface PendingOrder { id: string; symbol: string; type: 'stop_loss' | 'take_profit'; triggerPrice: number; amount: number; }
export interface Transaction { id: string; type: 'buy' | 'sell'; symbol: string; amount: number; price: number; timestamp: string; }
export enum PathId { STOCKS = 'stocks', CRYPTO = 'crypto' }
export interface Unit { id: string; title: string; description: string; color: string; totalLevels: number; biome?: 'neon' | 'forest' | 'ocean' | 'volcano' | 'space'; nextPathOptions?: { pathId: string; title: string; description: string; }[]; }
export interface LearningPath { id: PathId; title: string; description: string; icon: string; themeColor: string; units: Unit[]; }
export type QuestionType = 'multiple_choice' | 'true_false' | 'matching' | 'ordering' | 'binary_prediction' | 'candle_chart' | 'word_construction' | 'risk_slider' | 'portfolio_balancing' | 'sentiment_swipe' | 'chart_point' | 'cloze';
export interface QuizQuestion { type: QuestionType; question: string; difficulty: 'easy' | 'medium' | 'hard'; pedagogicalGoal?: string; bloomLevel?: 'remember' | 'understand' | 'apply' | 'analyze'; scenarioContext?: string; options?: string[]; correctIndex?: number; correctAnswerText?: string; pairs?: { left: string; right: string }[]; correctOrder?: string[]; chartData?: { trend: 'up' | 'down' | 'volatile' | 'doji_reversal'; indicatorHint?: string; }; sentenceParts?: string[]; riskScenario?: { correctValue: number; tolerance: number; minLabel: string; maxLabel: string }; portfolioAssets?: { name: string; type: 'stock' | 'bond' | 'crypto'; riskScore: number }[]; portfolioTargetRisk?: number; sentimentCards?: { text: string; sentiment: 'bullish' | 'bearish' }[]; chartPointConfig?: { entryPrice: number; trend: 'up' | 'down'; idealStopLoss: number }; clozeText?: string; clozeOptions?: string[]; correctClozeAnswer?: string; explanation: string; relatedSlideIndex?: number; tags?: string[]; }
export interface TheorySlide { title: string; content: string; simplifiedContent?: string; analogy?: string; realWorldExample?: string; icon?: string; visualType?: 'chart_line' | 'chart_candle' | 'chart_volume' | 'diagram_flow' | 'none'; visualMeta?: { trend?: 'up' | 'down' | 'volatile' | 'flat'; showIndicators?: boolean; label?: string; }; keyTerms?: string[]; deepDive?: { title: string; content: string }; commonPitfall?: string; proTip?: string; checkpointQuestion?: { question: string; answer: boolean }; }
export interface LessonContent { id?: string; title: string; isBossLevel: boolean; slides: TheorySlide[]; quiz: QuizQuestion[]; generatedBy?: 'ai' | 'fallback' | 'static' | 'user'; historicalData?: CandleData[]; }
export interface ChatMessage { role: 'user' | 'model'; text: string; }
export interface MarketData { time: string; price: number; }
export interface OHLCData { time: number; open: number; high: number; low: number; close: number; volume: number; }
export interface Achievement { id: string; title: string; description: string; iconName: string; condition: (stats: UserStats) => boolean; }
export interface LeaderboardEntry { rank: number; username: string; xp: number; avatar: string; isCurrentUser?: boolean; league: string; }
export interface DailyQuest { id: string; text: string; target: number; progress: number; completed: boolean; reward: number; type: 'xp' | 'lessons' | 'perfect'; }
export interface Order { id: string; type: 'buy' | 'sell'; price: number; amount: number; timestamp: number; asset: string; leverage: number; pl?: number; commission?: number; }
export type GameMode = 'standard' | 'survival' | 'time_trial';
export type AIPersona = 'standard' | 'warren' | 'wolf' | 'socrates';
export interface SimSettings { leverage: number; showRSI: boolean; showSMA: boolean; }
export interface Asset { symbol: string; name: string; price: number; change24h: number; type: 'crypto' | 'stock'; }
export interface CandleData { time: string; open: number; high: number; low: number; close: number; volume: number; }
export type MarketPhase = 'accumulation' | 'bull_run' | 'distribution' | 'bear_market' | 'crash';
export interface MarketEvent { id: string; title: string; description: string; type: 'news' | 'macro' | 'black_swan'; impact: { BTC?: number; ETH?: number; SOL?: number; AAPL?: number; TSLA?: number; volatility: number; }; duration: number; icon: string; }
export interface MarketState { prices: { [symbol: string]: number }; history: { [symbol: string]: CandleData[] }; trend: { [symbol: string]: 'up' | 'down' | 'neutral' }; phase: MarketPhase; activeEvents: MarketEvent[]; globalVolatility: number; }
export interface MarketNode { id: string; name: string; lat: number; lng: number; cost: number; desc: string; assets: string[]; region: 'america' | 'europe' | 'asia'; timezone: string; }
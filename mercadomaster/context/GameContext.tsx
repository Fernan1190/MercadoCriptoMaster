import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef, useMemo } from 'react';
import { UserStats, PathId, DailyQuest, Transaction, Achievement, CandleData, QuizQuestion, MarketEvent, MarketState, PendingOrder, InstalledRack, InstalledMiner } from '../types';
import { INITIAL_PRICES, generateNextCandle } from '../services/marketSimulator';
import { ACHIEVEMENTS } from '../data/achievements';
import { MARKET_EVENTS } from '../data/events';
import { MARKET_NODES } from '../data/markets';
import { MINERS, RACKS } from '../data/items';

const INITIAL_QUESTS: DailyQuest[] = [
  { id: 'q1', text: 'Gana 50 XP', target: 50, progress: 0, completed: false, reward: 50, type: 'xp' },
  { id: 'q2', text: 'Completa 2 Lecciones', target: 2, progress: 0, completed: false, reward: 100, type: 'lessons' },
  { id: 'q3', text: 'Racha Perfecta', target: 1, progress: 0, completed: false, reward: 200, type: 'perfect' },
];

const INITIAL_STATS: UserStats = {
  xp: 0, level: 1, league: 'Bronze', streak: 1, balance: 10000, hearts: 5, maxHearts: 5, masterCoins: 350,
  portfolio: {}, transactions: [], pendingOrders: [], customQuestions: [], unlockedAchievements: [],
  completedLessons: [], levelRatings: {}, pathProgress: { [PathId.STOCKS]: 0, [PathId.CRYPTO]: 0 },
  inventory: { hint5050: 3, timeFreeze: 2, skip: 1, streakFreeze: 1, doubleXp: 0 },
  bookmarks: [], dailyQuests: INITIAL_QUESTS, theme: 'default', unlockedThemes: ['default'],
  prestige: 0, stakedCoins: 0, minedCoins: 0, quickNotes: "", openedChests: [],
  officeItems: [], officeTier: 1, employees: [], decorations: [], xpMultiplier: 1,
  lessonNotes: {}, questionsAnswered: 0, correctAnswers: 0, mistakes: [], unlockedMarkets: ['ny'],
  lastSaveTime: Date.now(), activeSkin: { floor: '#1e293b', wall: '#334155' }, activeBuffs: [], unlockedSkins: ['default'],
  miningFarm: {
      racks: [],
      minedFragments: 0,
      totalHashrate: 0,
      totalPowerConsumption: 0,
      electricityCostPerWatt: 0.0001 
  }
};

type SoundType = 'success' | 'error' | 'cash' | 'pop' | 'levelUp' | 'click' | 'chest' | 'news' | 'process' | 'meow' | 'fan' | 'repair';

interface GameContextType {
  stats: UserStats;
  latestAchievement: Achievement | null;
  clearAchievement: () => void;
  market: MarketState;
  latestEvent: MarketEvent | null;
  clearEvent: () => void;
  actions: {
    updateStats: (xpGained: number, pathId?: PathId, levelIncrement?: number, perfectRun?: boolean) => void;
    recordAnswer: (isCorrect: boolean, question: QuizQuestion) => void;
    saveLessonNote: (lessonId: string, note: string) => void;
    deductHeart: () => void;
    buyHearts: () => boolean;
    useItem: (type: 'hint5050' | 'timeFreeze' | 'skip') => boolean;
    addBookmark: (term: string) => void;
    mineCoin: () => void;
    stakeCoins: () => void;
    unstakeCoins: () => void;
    openChest: (chestId: string) => void;
    toggleTheme: () => void;
    updateNotes: (notes: string) => void;
    getThemeClass: () => string;
    buyAsset: (symbol: string, amount: number, price: number) => boolean;
    sellAsset: (symbol: string, amount: number, price: number) => boolean;
    placeOrder: (symbol: string, type: 'stop_loss' | 'take_profit', triggerPrice: number, amount: number) => void;
    addCustomQuestion: (question: QuizQuestion) => void; 
    playSound: (type: SoundType) => void;
    buyShopItem: (itemId: keyof UserStats['inventory'], cost: number) => boolean;
    buyTheme: (themeId: string, cost: number) => boolean;
    equipTheme: (themeId: any) => void;
    buyOfficeItem: (itemId: string, cost: number) => boolean;
    unlockMarket: (marketId: string) => boolean;
    activateBuff: (id: string, duration: number, multiplier: number) => void;
    changeOfficeSkin: (type: 'floor' | 'wall', color: string) => void;
    buyRack: (modelId: string) => boolean;
    buyMiner: (modelId: string, rackInstanceId: string) => boolean;
    sellMinedCrypto: () => void;
    repairMiner: (rackInstanceId: string, slotIndex: number) => void;
  };
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('mercadoMasterStats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Fusiones de seguridad para evitar crashes por datos viejos
        if (!parsed.miningFarm) parsed.miningFarm = INITIAL_STATS.miningFarm;
        if (!parsed.portfolio) parsed.portfolio = {};
        if (!parsed.transactions) parsed.transactions = [];
        if (!parsed.pendingOrders) parsed.pendingOrders = [];
        if (!parsed.customQuestions) parsed.customQuestions = [];
        if (!parsed.unlockedAchievements) parsed.unlockedAchievements = [];
        if (!parsed.activeBuffs) parsed.activeBuffs = [];
        return { ...INITIAL_STATS, ...parsed };
      } catch (e) { return INITIAL_STATS; }
    }
    return INITIAL_STATS;
  });

  const [marketState, setMarketState] = useState<MarketState>({
      prices: INITIAL_PRICES,
      history: {},
      trend: {},
      phase: 'accumulation',
      activeEvents: [],
      globalVolatility: 0.002
  });
  
  const [latestAchievement, setLatestAchievement] = useState<Achievement | null>(null);
  const [latestEvent, setLatestEvent] = useState<MarketEvent | null>(null);
  const prevAchievementsCount = useRef(stats.unlockedAchievements.length);

  const marketRef = useRef({
    prices: { ...INITIAL_PRICES },
    history: {} as { [symbol: string]: CandleData[] },
    trend: {} as { [symbol: string]: 'up' | 'down' | 'neutral' },
    activeEvents: [] as { event: MarketEvent, ticksLeft: number }[],
    volatility: 0.002
  });

  const playSound = useCallback((type: SoundType) => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    switch (type) {
      case 'cash': osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); osc.start(now); osc.stop(now + 0.3); break;
      case 'error': osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.2); osc.start(now); osc.stop(now + 0.2); break;
      case 'pop': osc.type = 'triangle'; osc.frequency.setValueAtTime(600, now); gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05); osc.start(now); osc.stop(now + 0.05); break;
      case 'success': osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); osc.start(now); osc.stop(now + 0.3); break;
      case 'levelUp': [440, 554, 659, 880].forEach((f,i) => { const o=ctx.createOscillator(); const g=ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value=f; g.gain.setValueAtTime(0.05, now+i*0.1); g.gain.exponentialRampToValueAtTime(0.001,now+i*0.1+0.3); o.start(now+i*0.1); o.stop(now+i*0.1+0.3); }); break;
      case 'click': osc.type = 'square'; osc.frequency.setValueAtTime(800, now); gain.gain.setValueAtTime(0.02, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03); osc.start(now); osc.stop(now + 0.03); break;
      case 'chest': osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(800, now + 0.5); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.5); osc.start(now); osc.stop(now + 0.5); break;
      case 'news': osc.type = 'square'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(100, now + 0.3); gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now + 0.5); osc.start(now); osc.stop(now + 0.5); break;
      case 'process': osc.type = 'triangle'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(600, now + 0.1); gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1); osc.start(now); osc.stop(now + 0.1); break;
      case 'meow': osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1); osc.frequency.exponentialRampToValueAtTime(600, now + 0.3); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.3); osc.start(now); osc.stop(now + 0.3); break;
      case 'fan': osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); gain.gain.setValueAtTime(0.02, now); gain.gain.linearRampToValueAtTime(0, now + 0.5); osc.start(now); osc.stop(now + 0.5); break;
      case 'repair': osc.type = 'square'; osc.frequency.setValueAtTime(200, now); osc.frequency.linearRampToValueAtTime(400, now + 0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.2); osc.start(now); osc.stop(now + 0.2); break;
    }
  }, []);

  // --- FUNCIÓN QUE FALTABA ---
  const calculateAchievements = (currentStats: UserStats): Partial<UserStats> => {
    const newUnlocked: string[] = [];
    let xpBonus = 0; let coinsBonus = 0;
    ACHIEVEMENTS.forEach(ach => {
      if (!currentStats.unlockedAchievements.includes(ach.id) && ach.condition(currentStats)) {
        newUnlocked.push(ach.id); xpBonus += 100; coinsBonus += 50;
      }
    });
    if (newUnlocked.length > 0) {
      return { unlockedAchievements: [...currentStats.unlockedAchievements, ...newUnlocked], xp: currentStats.xp + xpBonus, masterCoins: currentStats.masterCoins + coinsBonus };
    }
    return {};
  };

  // --- ACCIONES DE MINERÍA ---
  const buyRack = useCallback((modelId: string) => {
      const rackModel = RACKS.find(r => r.id === modelId);
      if (!rackModel) return false;
      if (stats.balance >= rackModel.price) {
          const newRack: InstalledRack = { instanceId: `rack-${Date.now()}`, modelId, slots: Array(rackModel.slots).fill(null) };
          setStats(prev => ({ ...prev, balance: prev.balance - rackModel.price, miningFarm: { ...prev.miningFarm, racks: [...prev.miningFarm.racks, newRack] } }));
          playSound('success');
          return true;
      }
      playSound('error');
      return false;
  }, [stats.balance, playSound]);

  const buyMiner = useCallback((modelId: string, rackInstanceId: string) => {
      const minerModel = MINERS.find(m => m.id === modelId);
      if (!minerModel) return false;
      const rackIndex = stats.miningFarm.racks.findIndex(r => r.instanceId === rackInstanceId);
      if (rackIndex === -1) return false;
      const rack = stats.miningFarm.racks[rackIndex];
      const emptySlotIndex = rack.slots.findIndex(s => s === null);
      if (emptySlotIndex !== -1 && stats.balance >= minerModel.price) {
          const newMiner: InstalledMiner = { instanceId: `miner-${Date.now()}`, modelId, condition: 100, active: true };
          const newRacks = [...stats.miningFarm.racks];
          newRacks[rackIndex].slots[emptySlotIndex] = newMiner;
          setStats(prev => {
              const currentFarm = prev.miningFarm;
              return { ...prev, balance: prev.balance - minerModel.price, miningFarm: { ...currentFarm, racks: newRacks, totalHashrate: currentFarm.totalHashrate + minerModel.hashrate, totalPowerConsumption: currentFarm.totalPowerConsumption + minerModel.power } };
          });
          playSound('fan'); 
          return true;
      }
      playSound('error');
      return false;
  }, [stats.miningFarm.racks, stats.balance, playSound]);

  const sellMinedCrypto = useCallback(() => {
      if (stats.miningFarm.minedFragments > 0) {
          const btcPrice = marketState.prices['BTC'];
          const earnings = stats.miningFarm.minedFragments * btcPrice;
          setStats(prev => ({ ...prev, balance: prev.balance + earnings, miningFarm: { ...prev.miningFarm, minedFragments: 0 } }));
          playSound('cash');
      }
  }, [stats.miningFarm.minedFragments, marketState.prices, playSound]);

  const repairMiner = useCallback((rackInstanceId: string, slotIndex: number) => {
      setStats(prev => {
          const newRacks = JSON.parse(JSON.stringify(prev.miningFarm.racks));
          const rack = newRacks.find((r: any) => r.instanceId === rackInstanceId);
          if (!rack) return prev;
          const miner = rack.slots[slotIndex];
          
          const repairCost = 50;
          if (prev.balance < repairCost || !miner) {
              playSound('error');
              return prev;
          }
          
          miner.condition = 100;
          playSound('repair');
          return {
              ...prev,
              balance: prev.balance - repairCost,
              miningFarm: { ...prev.miningFarm, racks: newRacks }
          };
      });
  }, [playSound]);

  // --- MINERÍA OFFLINE ---
  useEffect(() => {
      const now = Date.now();
      const last = stats.lastSaveTime || now;
      const diffSeconds = Math.floor((now - last) / 1000);
      if (diffSeconds > 60) {
          const miningRate = (stats.level * 0.1) + 1;
          const earned = Math.floor(diffSeconds * miningRate * 0.1);
          if (earned > 0) {
              setStats(prev => ({ ...prev, masterCoins: prev.masterCoins + earned, lastSaveTime: now }));
          }
      }
  }, []);

  // --- INICIALIZAR MERCADO ---
  useEffect(() => {
    const initialHistory: any = {};
    const initialTrend: any = {};
    Object.keys(INITIAL_PRICES).forEach(symbol => {
      // @ts-ignore
      let currentPrice = INITIAL_PRICES[symbol];
      const history = [];
      for(let i=0; i<30; i++) {
         const candle = generateNextCandle(currentPrice);
         candle.time = `${10 + Math.floor(i/60)}:${i%60}`;
         history.push(candle);
         currentPrice = candle.close;
      }
      initialHistory[symbol] = history;
      initialTrend[symbol] = 'neutral';
    });
    
    marketRef.current.history = initialHistory;
    marketRef.current.trend = initialTrend;
    setMarketState({ prices: INITIAL_PRICES, history: initialHistory, trend: initialTrend, phase: 'accumulation', activeEvents: [], globalVolatility: 0.002 });
  }, []);

  // --- BUCLE PRINCIPAL ---
  useEffect(() => {
    const interval = setInterval(() => {
      // Mercado
      if (Math.random() < 0.05 && marketRef.current.activeEvents.length === 0) {
         const randomEvent = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
         marketRef.current.activeEvents.push({ event: randomEvent, ticksLeft: randomEvent.duration });
         setLatestEvent(randomEvent);
         playSound('news');
      }
      marketRef.current.activeEvents = marketRef.current.activeEvents.map(e => ({ ...e, ticksLeft: e.ticksLeft - 1 })).filter(e => e.ticksLeft > 0);
      const activeEventsData = marketRef.current.activeEvents.map(e => e.event);
      
      const currentState = marketRef.current;
      const newHistory: any = { ...currentState.history };
      const newPrices: any = { ...currentState.prices };
      const newTrends: any = { ...currentState.trend };

      Object.keys(currentState.prices).forEach(symbol => {
        const history = currentState.history[symbol];
        if (!history || history.length === 0) return;
        const lastCandle = history[history.length - 1];
        let trendBias = 0;
        let volatilityMultiplier = 1;
        marketRef.current.activeEvents.forEach(({ event }) => {
           // @ts-ignore
           if (event.impact[symbol]) trendBias += event.impact[symbol];
           volatilityMultiplier += (event.impact.volatility || 0);
        });
        const nextCandle = generateNextCandle(lastCandle.close, 0.002 * volatilityMultiplier, trendBias * 0.005);
        // @ts-ignore
        newPrices[symbol] = nextCandle.close;
        // @ts-ignore
        newTrends[symbol] = nextCandle.close > lastCandle.close ? 'up' : 'down';
        newHistory[symbol] = [...history.slice(1), nextCandle];
      });

      marketRef.current = { ...currentState, prices: newPrices, history: newHistory, trend: newTrends };
      setMarketState({ prices: newPrices, history: newHistory, trend: newTrends, phase: 'bull_run', activeEvents: activeEventsData, globalVolatility: 0.002 });

      // Lógica Juego (Minería + Desgaste)
      setStats(prev => {
        const now = Date.now();
        const activeBuffs = prev.activeBuffs.filter(b => b.expiresAt > now);
        
        let miningFarm = { ...prev.miningFarm };
        let balance = prev.balance;

        // PROCESAR MINERÍA
        if (miningFarm.racks.length > 0) {
            let currentTotalHashrate = 0;
            let currentTotalPower = 0;
            
            const updatedRacks = miningFarm.racks.map(rack => {
                const updatedSlots = rack.slots.map(miner => {
                    if (!miner) return null;
                    // Desgaste: 0.5% por tick
                    let newCondition = Math.max(0, miner.condition - (miner.active ? 0.5 : 0));
                    const minerModel = MINERS.find(m => m.id === miner.modelId);
                    
                    if (newCondition > 0 && minerModel) {
                        currentTotalHashrate += minerModel.hashrate;
                        currentTotalPower += minerModel.power;
                    }
                    
                    return { ...miner, condition: newCondition };
                });
                return { ...rack, slots: updatedSlots };
            });

            miningFarm.racks = updatedRacks;
            miningFarm.totalHashrate = currentTotalHashrate;
            miningFarm.totalPowerConsumption = currentTotalPower;

            const production = currentTotalHashrate * 0.0000001;
            const electricityCost = currentTotalPower * miningFarm.electricityCostPerWatt;
            
            balance -= electricityCost;
            if (balance < 0) balance = 0; 
            miningFarm.minedFragments += production;
        }

        // PROCESAR ÓRDENES (SL/TP)
        if (!prev.pendingOrders || prev.pendingOrders.length === 0) return { ...prev, balance, miningFarm, activeBuffs, lastSaveTime: now };
        
        const remainingOrders: PendingOrder[] = [];
        let newTransactions = [...prev.transactions];
        let newPortfolio = { ...prev.portfolio };
        let hasExecuted = false;

        prev.pendingOrders.forEach(order => {
            const currentPrice = newPrices[order.symbol];
            let triggered = false;
            if (order.type === 'stop_loss' && currentPrice <= order.triggerPrice) triggered = true;
            if (order.type === 'take_profit' && currentPrice >= order.triggerPrice) triggered = true;

            if (triggered) {
                const amountToSell = Math.min(order.amount, newPortfolio[order.symbol] || 0);
                if (amountToSell > 0) {
                    balance += amountToSell * currentPrice;
                    newPortfolio[order.symbol] -= amountToSell;
                    newTransactions.unshift({
                        id: `auto-${Date.now()}-${Math.random()}`,
                        type: 'sell',
                        symbol: order.symbol,
                        amount: amountToSell,
                        price: currentPrice,
                        timestamp: new Date().toLocaleTimeString() + ` [AUTO ${order.type === 'stop_loss' ? 'SL' : 'TP'}]`
                    });
                    hasExecuted = true;
                }
            } else {
                remainingOrders.push(order);
            }
        });

        if (hasExecuted) playSound('cash');

        return { ...prev, balance, portfolio: newPortfolio, transactions: newTransactions, pendingOrders: remainingOrders, activeBuffs, miningFarm, lastSaveTime: now };
      });

    }, 2000);
    return () => clearInterval(interval);
  }, [playSound]);

  useEffect(() => { localStorage.setItem('mercadoMasterStats', JSON.stringify(stats)); }, [stats]);
  
  // Checkeo de logros en segundo plano
  useEffect(() => {
    if (stats.unlockedAchievements.length > prevAchievementsCount.current) {
      const lastId = stats.unlockedAchievements[stats.unlockedAchievements.length - 1];
      const ach = ACHIEVEMENTS.find(a => a.id === lastId);
      if (ach) { setLatestAchievement(ach); playSound('levelUp'); }
      prevAchievementsCount.current = stats.unlockedAchievements.length;
    }
  }, [stats.unlockedAchievements, playSound]);

  // --- ACCIONES COMPLETAS ---
  const updateStats = useCallback((xpGained: number, pathId?: PathId, levelIncrement: number = 0, perfectRun: boolean = false) => {
    setStats(prev => {
      const multiplier = prev.activeBuffs.reduce((acc, b) => acc * b.multiplier, 1);
      const finalXp = Math.floor(xpGained * multiplier);
      let next = { ...prev };
      if (pathId) {
          const newPathProgress = { ...next.pathProgress };
          newPathProgress[pathId] = (newPathProgress[pathId] || 0) + levelIncrement;
          next.pathProgress = newPathProgress;
      }
      const coinsGained = Math.floor(finalXp / 2);
      // Progreso de misiones
      const newQuests = next.dailyQuests.map(q => {
        if (q.completed) return q;
        let newProgress = q.progress;
        if (q.type === 'xp') newProgress += finalXp;
        if (q.type === 'lessons' && levelIncrement > 0) newProgress += 1;
        if (q.type === 'perfect' && perfectRun) newProgress += 1;
        return { ...q, progress: newProgress, completed: newProgress >= q.target };
      });
      next = { ...next, xp: next.xp + finalXp, masterCoins: next.masterCoins + coinsGained, dailyQuests: newQuests };
      const newLevel = Math.floor(next.xp / 500) + 1;
      if (newLevel > next.level) next.level = newLevel;
      
      // Importante: usar la función calculateAchievements aquí
      return { ...next, ...calculateAchievements(next) };
    });
  }, []);

  const mineCoin = useCallback(() => { playSound('pop'); setStats(prev => { const next = { ...prev, masterCoins: prev.masterCoins + 1, minedCoins: (prev.minedCoins || 0) + 1 }; return { ...next, ...calculateAchievements(next) }; }); }, [playSound]);
  const buyAsset = useCallback((symbol: string, amount: number, currentPrice: number) => { const totalCost = amount * currentPrice; if (stats.balance >= totalCost) { const newTx: Transaction = { id: Date.now().toString(), type: 'buy', symbol, amount, price: currentPrice, timestamp: new Date().toLocaleString() }; setStats(prev => { if (prev.balance < totalCost) return prev; const next = { ...prev, balance: prev.balance - totalCost, portfolio: { ...prev.portfolio, [symbol]: (prev.portfolio[symbol] || 0) + amount }, transactions: [newTx, ...(prev.transactions || [])] }; return { ...next, ...calculateAchievements(next) }; }); return true; } return false; }, [stats.balance]);
  const sellAsset = useCallback((symbol: string, amount: number, currentPrice: number) => { const currentQty = stats.portfolio[symbol] || 0; if (currentQty >= amount) { const totalGain = amount * currentPrice; const newTx: Transaction = { id: Date.now().toString(), type: 'sell', symbol, amount, price: currentPrice, timestamp: new Date().toLocaleString() }; setStats(prev => { if ((prev.portfolio[symbol] || 0) < amount) return prev; const next = { ...prev, balance: prev.balance + totalGain, portfolio: { ...prev.portfolio, [symbol]: (prev.portfolio[symbol] || 0) - amount }, transactions: [newTx, ...(prev.transactions || [])] }; return { ...next, ...calculateAchievements(next) }; }); return true; } return false; }, [stats.portfolio]);
  const placeOrder = useCallback((symbol: string, type: 'stop_loss' | 'take_profit', triggerPrice: number, amount: number) => { setStats(prev => ({ ...prev, pendingOrders: [...prev.pendingOrders, { id: Date.now().toString(), symbol, type, triggerPrice, amount }] })); playSound('click'); }, [playSound]);
  const addCustomQuestion = useCallback((question: QuizQuestion) => { setStats(prev => ({ ...prev, customQuestions: [...prev.customQuestions, question], masterCoins: prev.masterCoins + 10 })); playSound('success'); }, [playSound]);
  const unlockMarket = useCallback((marketId: string) => { const market = MARKET_NODES.find(m => m.id === marketId); if (!market) return false; if (stats.masterCoins >= market.cost && !stats.unlockedMarkets.includes(marketId)) { playSound('success'); setStats(prev => ({ ...prev, masterCoins: prev.masterCoins - market.cost, unlockedMarkets: [...prev.unlockedMarkets, marketId] })); return true; } playSound('error'); return false; }, [stats.masterCoins, stats.unlockedMarkets, playSound]);
  const buyShopItem = useCallback((itemId: keyof UserStats['inventory'], cost: number) => { if (stats.masterCoins >= cost) { playSound('cash'); setStats(prev => ({ ...prev, masterCoins: prev.masterCoins - cost, inventory: { ...prev.inventory, [itemId]: prev.inventory[itemId] + 1 } })); return true; } playSound('error'); return false; }, [stats.masterCoins, playSound]);
  const buyTheme = useCallback((themeId: string, cost: number) => { if (stats.masterCoins >= cost && !stats.unlockedThemes.includes(themeId)) { playSound('cash'); setStats(prev => ({ ...prev, masterCoins: prev.masterCoins - cost, unlockedThemes: [...prev.unlockedThemes, themeId], theme: themeId as any })); return true; } playSound('error'); return false; }, [stats.masterCoins, stats.unlockedThemes, playSound]);
  const equipTheme = useCallback((themeId: any) => { if (stats.unlockedThemes.includes(themeId)) { playSound('click'); setStats(prev => ({ ...prev, theme: themeId })); } }, [stats.unlockedThemes, playSound]);
  const buyOfficeItem = useCallback((itemId: string, cost: number) => { if (stats.masterCoins >= cost && !stats.officeItems.includes(itemId)) { playSound('cash'); setStats(prev => ({ ...prev, masterCoins: prev.masterCoins - cost, officeItems: [...prev.officeItems, itemId] })); return true; } playSound('error'); return false; }, [stats.masterCoins, stats.officeItems, playSound]);
  const deductHeart = useCallback(() => { playSound('error'); setStats(prev => ({ ...prev, hearts: Math.max(0, prev.hearts - 1) })); }, [playSound]);
  const buyHearts = useCallback(() => { if (stats.masterCoins >= 300) { setStats(prev => ({ ...prev, masterCoins: prev.masterCoins - 300, hearts: prev.maxHearts })); playSound('cash'); return true; } playSound('error'); return false; }, [stats.masterCoins, playSound]);
  const useItem = useCallback((type: 'hint5050' | 'timeFreeze' | 'skip') => { return true; }, []);
  const addBookmark = useCallback((term: string) => { if (!stats.bookmarks.includes(term)) setStats(prev => ({ ...prev, bookmarks: [...prev.bookmarks, term] })); }, [stats.bookmarks]);
  const stakeCoins = useCallback(() => { if (stats.masterCoins >= 100) setStats(prev => ({ ...prev, masterCoins: prev.masterCoins - 100, stakedCoins: (prev.stakedCoins || 0) + 100 })); }, [stats.masterCoins]);
  const unstakeCoins = useCallback(() => { if (stats.stakedCoins > 0) setStats(prev => ({ ...prev, masterCoins: prev.masterCoins + prev.stakedCoins, stakedCoins: 0 })); }, [stats.stakedCoins]);
  const openChest = useCallback((chestId: string) => { if (stats.openedChests.includes(chestId)) return; playSound('chest'); setStats(prev => ({ ...prev, masterCoins: prev.masterCoins + 20, openedChests: [...prev.openedChests, chestId] })); }, [stats.openedChests, playSound]);
  const toggleTheme = useCallback(() => { playSound('click'); const themes: UserStats['theme'][] = ['default', 'cyberpunk', 'terminal']; const nextIndex = (themes.indexOf(stats.theme) + 1) % themes.length; setStats(prev => ({ ...prev, theme: themes[nextIndex] })); }, [stats.theme, playSound]);
  const updateNotes = useCallback((notes: string) => setStats(prev => ({ ...prev, quickNotes: notes })), []);
  const getThemeClass = useCallback(() => { if (stats.theme === 'cyberpunk') return 'bg-slate-950 font-mono text-cyan-400 selection:bg-pink-500'; if (stats.theme === 'terminal') return 'bg-black font-mono text-green-500 selection:bg-green-700'; return 'bg-slate-950 text-slate-100 font-sans selection:bg-green-500 selection:text-slate-900'; }, [stats.theme]);
  const clearAchievement = useCallback(() => setLatestAchievement(null), []);
  const clearEvent = useCallback(() => setLatestEvent(null), []);
  const recordAnswer = useCallback((isCorrect: boolean, question: QuizQuestion) => { setStats(prev => { const next = { ...prev }; next.questionsAnswered = (prev.questionsAnswered || 0) + 1; if (isCorrect) { next.correctAnswers = (prev.correctAnswers || 0) + 1; } else { const alreadyExists = prev.mistakes?.some(m => m.question === question.question); if (!alreadyExists) { next.mistakes = [...(prev.mistakes || []), question]; } } return { ...next, ...calculateAchievements(next) }; }); }, []);
  const saveLessonNote = useCallback((lessonId: string, note: string) => { setStats(prev => ({ ...prev, lessonNotes: { ...prev.lessonNotes, [lessonId]: note } })); }, []);
  const activateBuff = useCallback((id: string, duration: number, multiplier: number) => { setStats(prev => { const existing = prev.activeBuffs.find(b => b.id === id); let newBuffs; if (existing) { newBuffs = prev.activeBuffs.map(b => b.id === id ? { ...b, expiresAt: Date.now() + duration } : b); } else { newBuffs = [...prev.activeBuffs, { id, expiresAt: Date.now() + duration, multiplier }]; } return { ...prev, activeBuffs: newBuffs }; }); playSound('meow'); }, [playSound]);
  const changeOfficeSkin = useCallback((type: 'floor' | 'wall', color: string) => { setStats(prev => ({ ...prev, activeSkin: { ...prev.activeSkin, [type]: color } })); playSound('click'); }, [playSound]);

  const contextValue = useMemo(() => ({
    stats, latestAchievement, clearAchievement, market: marketState, latestEvent, clearEvent,
    actions: { updateStats, mineCoin, buyAsset, sellAsset, deductHeart, buyHearts, useItem, addBookmark, stakeCoins, unstakeCoins, openChest, toggleTheme, updateNotes, getThemeClass, playSound, buyShopItem, buyTheme, equipTheme, saveLessonNote, recordAnswer, buyOfficeItem, unlockMarket, placeOrder, addCustomQuestion, activateBuff, changeOfficeSkin, buyRack, buyMiner, sellMinedCrypto, repairMiner }
  }), [stats, marketState, latestAchievement, latestEvent, updateStats, mineCoin, buyAsset, sellAsset, deductHeart, buyHearts, useItem, addBookmark, stakeCoins, unstakeCoins, openChest, toggleTheme, updateNotes, getThemeClass, playSound, buyShopItem, buyTheme, equipTheme, saveLessonNote, recordAnswer, buyOfficeItem, unlockMarket, placeOrder, addCustomQuestion, clearEvent, activateBuff, changeOfficeSkin, buyRack, buyMiner, sellMinedCrypto, repairMiner]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
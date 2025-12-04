import { useGameState } from '../hooks/useGameState';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef, useMemo } from 'react';
import { UserStats, PathId, DailyQuest, Transaction, Achievement, CandleData, QuizQuestion, MarketEvent, MarketState, PendingOrder, InstalledRack, InstalledMiner, NpcEvent } from '../../types';
import { INITIAL_PRICES, generateNextCandle } from '../services/marketSimulator';
import { ACHIEVEMENTS } from '../data/achievements';
import { MARKET_EVENTS } from '../data/events';
import { MARKET_NODES } from '../data/markets';
import { MINERS, RACKS } from '../data/items'; 
import { NPC_EVENTS } from '../data/npcEvents';


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
  miningFarm: { racks: [], minedFragments: 0, totalHashrate: 0, totalPowerConsumption: 0, electricityCostPerWatt: 0.0001 },
  skillPoints: 0, unlockedSkills: [] 
};


type SoundType = 'success' | 'error' | 'cash' | 'pop' | 'levelUp' | 'click' | 'chest' | 'news' | 'process' | 'meow' | 'fan' | 'repair' | 'doorbell';


interface GameContextType {
  stats: UserStats;
  latestAchievement: Achievement | null;
  clearAchievement: () => void;
  market: MarketState;
  latestEvent: MarketEvent | null;
  clearEvent: () => void;
  currentNpcEvent: NpcEvent | null;
  clearNpcEvent: () => void;
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
    repairMiner: (rackInstanceId: string, slotIndex: number, repairCost?: number) => void;
    unlockSkill: (skillId: string, cost: number) => boolean;
    handleNpcAction: (actionId: string) => void;
  };
}


const GameContext = createContext<GameContextType | undefined>(undefined);


export const GameProvider = ({ children }: { children: ReactNode }) => {
  // ✅ NUEVO: Usar el hook orquestador
  const gameState = useGameState({
    initialBalance: 10000,
    bitcoinPrice: 45000,
    onXPGain: (amount) => {
      console.log(`✨ +${amount} XP`);
      playSound('success');
    },
    onLevelUp: (level) => {
      console.log(`🎉 Level Up! Ahora eres nivel ${level}`);
      playSound('levelUp');
    },
    onTradeExecuted: (result) => {
      console.log(`📊 Trade: ${result.message}`);
    },
  });

  // ────────────────────────────────────────────────────────────────
  // ESTADO GLOBAL
  // ────────────────────────────────────────────────────────────────

  const [stats, setStats] = useState<UserStats>({
    xp: gameState.progressionState.xp,
    level: gameState.progressionState.level,
    league: gameState.progressionState.league,
    streak: gameState.progressionState.streak,
    skillPoints: gameState.progressionState.skillPoints,
    unlockedSkills: gameState.progressionState.unlockedSkills,
    portfolio: gameState.tradingState.portfolio,
    balance: gameState.tradingState.balance,
    transactions: gameState.tradingState.transactions,
    pendingOrders: gameState.tradingState.pendingOrders,
    miningFarm: {
      racks: gameState.miningState.racks,
      minedFragments: gameState.miningState.minedFragments,
      totalHashrate: gameState.miningState.totalHashrate,
      totalPowerConsumption: gameState.miningState.totalPowerConsumption,
      electricityCostPerWatt: gameState.miningState.electricityCostPerWatt,
    },
    hearts: 5,
    maxHearts: 5,
    masterCoins: 350,
    customQuestions: [],
    unlockedAchievements: [],
    completedLessons: [],
    levelRatings: {},
    pathProgress: {},
    inventory: { hint5050: 3, timeFreeze: 2, skip: 1, streakFreeze: 1, doubleXp: 0 },
    bookmarks: [],
    dailyQuests: INITIAL_QUESTS,
    theme: 'default',
    unlockedThemes: ['default'],
    prestige: 0,
    stakedCoins: 0,
    minedCoins: 0,
    quickNotes: '',
    openedChests: [],
    officeItems: [],
    officeTier: 1,
    employees: [],
    decorations: [],
    xpMultiplier: 1,
    lessonNotes: {},
    questionsAnswered: 0,
    correctAnswers: 0,
    mistakes: [],
    unlockedMarkets: ['ny'],
    lastSaveTime: Date.now(),
    activeSkin: { floor: '#1e293b', wall: '#334155' },
    activeBuffs: [],
    unlockedSkins: ['default'],
  });

  const [latestAchievement, setLatestAchievement] = useState<Achievement | null>(null);
  const [latestEvent, setLatestEvent] = useState<MarketEvent | null>(null);
  const [currentNpcEvent, setCurrentNpcEvent] = useState<NpcEvent | null>(null);

  // ────────────────────────────────────────────────────────────────
  // SINCRONIZAR GAMESTATE CON STATS
  // ────────────────────────────────────────────────────────────────

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      xp: gameState.progressionState.xp,
      level: gameState.progressionState.level,
      league: gameState.progressionState.league,
      streak: gameState.progressionState.streak,
      skillPoints: gameState.progressionState.skillPoints,
      unlockedSkills: gameState.progressionState.unlockedSkills,
      portfolio: gameState.tradingState.portfolio,
      balance: gameState.tradingState.balance,
      transactions: gameState.tradingState.transactions,
      pendingOrders: gameState.tradingState.pendingOrders,
      miningFarm: {
        racks: gameState.miningState.racks,
        minedFragments: gameState.miningState.minedFragments,
        totalHashrate: gameState.miningState.totalHashrate,
        totalPowerConsumption: gameState.miningState.totalPowerConsumption,
        electricityCostPerWatt: gameState.miningState.electricityCostPerWatt,
      },
    }));
  }, [
    gameState.progressionState,
    gameState.tradingState,
    gameState.miningState,
  ]);

  // ────────────────────────────────────────────────────────────────
  // ACCIONES DOMAIN-BASED
  // ────────────────────────────────────────────────────────────────

  const updateStats = useCallback(
    (xpGained: number) => {
      gameState.progressionActions.addXP(xpGained);
    },
    [gameState.progressionActions]
  );

  const buyAsset = useCallback(
    (symbol: string, amount: number, price: number) => {
      return gameState.executeTrade(symbol, amount, 'buy');
    },
    [gameState.executeTrade]
  );

  const sellAsset = useCallback(
    (symbol: string, amount: number, price: number) => {
      return gameState.executeTrade(symbol, amount, 'sell');
    },
    [gameState.executeTrade]
  );

  const unlockSkill = useCallback(
    (skillId: string, cost: number) => {
      return gameState.purchaseSkill(skillId, cost);
    },
    [gameState.purchaseSkill]
  );

  const buyRack = useCallback(
    (rackModel: any) => {
      return gameState.miningActions.buyRack(rackModel);
    },
    [gameState.miningActions]
  );

  const buyMiner = useCallback(
    (minerModel: any, rackInstanceId: string) => {
      return gameState.miningActions.buyMiner(minerModel, rackInstanceId);
    },
    [gameState.miningActions]
  );

  const repairMiner = useCallback(
    (rackInstanceId: string, slotIndex: number, repairCost: number = 100) => {
      return gameState.miningActions.repairMiner(rackInstanceId, slotIndex, repairCost);
    },
    [gameState.miningActions]
  );

  const sellMinedCrypto = useCallback(() => {
    return gameState.sellMinedCryptoAndReward();
  }, [gameState.sellMinedCryptoAndReward]);

  // ────────────────────────────────────────────────────────────────
  // ACCIONES EXISTENTES (mantener compatibilidad)
  // ────────────────────────────────────────────────────────────────

  const recordAnswer = useCallback(
    (isCorrect: boolean, question: QuizQuestion) => {
      setStats(prev => ({
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        mistakes: !isCorrect ? [...prev.mistakes, question] : prev.mistakes,
      }));
    },
    []
  );

  const saveLessonNote = useCallback(
    (lessonId: string, note: string) => {
      setStats(prev => ({
        ...prev,
        lessonNotes: { ...prev.lessonNotes, [lessonId]: note },
      }));
    },
    []
  );

  const deductHeart = useCallback(() => {
    setStats(prev => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1),
    }));
  }, []);

  const buyHearts = useCallback(() => {
    if (stats.masterCoins >= 50) {
      setStats(prev => ({
        ...prev,
        hearts: Math.min(prev.maxHearts, prev.hearts + 5),
        masterCoins: prev.masterCoins - 50,
      }));
      return true;
    }
    return false;
  }, [stats.masterCoins]);

  const useItem = useCallback(
    (type: 'hint5050' | 'timeFreeze' | 'skip') => {
      if (stats.inventory[type] > 0) {
        setStats(prev => ({
          ...prev,
          inventory: { ...prev.inventory, [type]: prev.inventory[type] - 1 },
        }));
        return true;
      }
      return false;
    },
    [stats.inventory]
  );

  const addBookmark = useCallback((term: string) => {
    setStats(prev => ({
      ...prev,
      bookmarks: [...new Set([...prev.bookmarks, term])],
    }));
  }, []);

  const mineCoin = useCallback(() => {
    setStats(prev => ({
      ...prev,
      minedCoins: prev.minedCoins + 1,
    }));
  }, []);

  const stakeCoins = useCallback(() => {
    setStats(prev => ({
      ...prev,
      stakedCoins: prev.masterCoins,
      masterCoins: 0,
    }));
  }, []);

  const unstakeCoins = useCallback(() => {
    setStats(prev => ({
      ...prev,
      masterCoins: prev.stakedCoins,
      stakedCoins: 0,
    }));
  }, []);

  const openChest = useCallback((chestId: string) => {
    setStats(prev => ({
      ...prev,
      openedChests: [...prev.openedChests, chestId],
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    setStats(prev => ({
      ...prev,
      theme: prev.theme === 'default' ? 'cyberpunk' : 'default',
    }));
  }, []);

  const updateNotes = useCallback((notes: string) => {
    setStats(prev => ({
      ...prev,
      quickNotes: notes,
    }));
  }, []);

  const getThemeClass = useCallback(() => {
    return stats.theme === 'cyberpunk' ? 'theme-cyberpunk' : 'theme-default';
  }, [stats.theme]);

  const placeOrder = useCallback(
    (symbol: string, type: 'stop_loss' | 'take_profit', triggerPrice: number, amount: number) => {
      gameState.tradingActions.placeOrder(symbol, type, triggerPrice, amount);
    },
    [gameState.tradingActions]
  );

  const addCustomQuestion = useCallback(
    (question: QuizQuestion) => {
      setStats(prev => ({
        ...prev,
        customQuestions: [...prev.customQuestions, question],
      }));
    },
    []
  );

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
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'error':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'levelUp':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      default:
        break;
    }
  }, []);

  const buyShopItem = useCallback(
    (itemId: keyof UserStats['inventory'], cost: number) => {
      if (stats.masterCoins >= cost) {
        setStats(prev => ({
          ...prev,
          masterCoins: prev.masterCoins - cost,
          inventory: { ...prev.inventory, [itemId]: prev.inventory[itemId] + 1 },
        }));
        return true;
      }
      return false;
    },
    [stats.masterCoins, stats.inventory]
  );

  const buyTheme = useCallback(
    (themeId: string, cost: number) => {
      if (stats.masterCoins >= cost && !stats.unlockedThemes.includes(themeId)) {
        setStats(prev => ({
          ...prev,
          masterCoins: prev.masterCoins - cost,
          unlockedThemes: [...prev.unlockedThemes, themeId],
        }));
        return true;
      }
      return false;
    },
    [stats.masterCoins, stats.unlockedThemes]
  );

  const equipTheme = useCallback((themeId: any) => {
    setStats(prev => ({
      ...prev,
      theme: themeId,
    }));
  }, []);

  const buyOfficeItem = useCallback(
    (itemId: string, cost: number) => {
      if (stats.balance >= cost) {
        setStats(prev => ({
          ...prev,
          balance: prev.balance - cost,
          officeItems: [...prev.officeItems, itemId],
        }));
        return true;
      }
      return false;
    },
    [stats.balance]
  );

  const unlockMarket = useCallback(
    (marketId: string) => {
      if (!stats.unlockedMarkets.includes(marketId)) {
        setStats(prev => ({
          ...prev,
          unlockedMarkets: [...prev.unlockedMarkets, marketId],
        }));
        return true;
      }
      return false;
    },
    [stats.unlockedMarkets]
  );

  const activateBuff = useCallback(
    (id: string, duration: number, multiplier: number) => {
      setStats(prev => ({
        ...prev,
        activeBuffs: [
          ...prev.activeBuffs,
          { id, expiresAt: Date.now() + duration * 1000, multiplier },
        ],
      }));
    },
    []
  );

  const changeOfficeSkin = useCallback(
    (type: 'floor' | 'wall', color: string) => {
      setStats(prev => ({
        ...prev,
        activeSkin: { ...prev.activeSkin, [type]: color },
      }));
    },
    []
  );

  const clearAchievement = useCallback(() => {
    setLatestAchievement(null);
  }, []);

  const clearEvent = useCallback(() => {
    setLatestEvent(null);
  }, []);

  const clearNpcEvent = useCallback(() => {
    setCurrentNpcEvent(null);
  }, []);

  const handleNpcAction = useCallback((actionId: string) => {
    console.log(`NPC Action: ${actionId}`);
    setCurrentNpcEvent(null);
  }, []);

  // ────────────────────────────────────────────────────────────────
  // GUARDAR A LOCALSTORAGE
  // ────────────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      localStorage.setItem('mercadoMasterStats', JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [stats]);

  // ────────────────────────────────────────────────────────────────
  // CONTEXT VALUE
  // ────────────────────────────────────────────────────────────────

  const contextValue = useMemo(
    () => ({
      stats,
      market: gameState.marketState,
      latestAchievement,
      clearAchievement,
      latestEvent,
      clearEvent,
      currentNpcEvent,
      clearNpcEvent,
      actions: {
        updateStats,
        recordAnswer,
        saveLessonNote,
        deductHeart,
        buyHearts,
        useItem,
        addBookmark,
        mineCoin,
        stakeCoins,
        unstakeCoins,
        openChest,
        toggleTheme,
        updateNotes,
        getThemeClass,
        buyAsset,
        sellAsset,
        placeOrder,
        addCustomQuestion,
        playSound,
        buyShopItem,
        buyTheme,
        equipTheme,
        buyOfficeItem,
        unlockMarket,
        activateBuff,
        changeOfficeSkin,
        buyRack,
        buyMiner,
        sellMinedCrypto,
        repairMiner,
        unlockSkill,
        handleNpcAction,
      },
    }),
    [
      stats,
      gameState.marketState,
      latestAchievement,
      latestEvent,
      currentNpcEvent,
      updateStats,
      recordAnswer,
      saveLessonNote,
      deductHeart,
      buyHearts,
      useItem,
      addBookmark,
      mineCoin,
      stakeCoins,
      unstakeCoins,
      openChest,
      toggleTheme,
      updateNotes,
      getThemeClass,
      buyAsset,
      sellAsset,
      placeOrder,
      addCustomQuestion,
      playSound,
      buyShopItem,
      buyTheme,
      equipTheme,
      buyOfficeItem,
      unlockMarket,
      activateBuff,
      changeOfficeSkin,
      buyRack,
      buyMiner,
      sellMinedCrypto,
      repairMiner,
      unlockSkill,
      handleNpcAction,
    ]
  );

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
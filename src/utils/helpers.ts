import { RedditPost, MarketData, UserPortfolio, Achievement, Prediction } from '../types';
import { GAME_CONFIG, LEVELS, ACHIEVEMENTS } from './constants';

/**
 * Format currency values for display
 */
export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === null || amount === undefined || typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(2)}`;
};

/**
 * Format large numbers with K/M suffixes
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Calculate time ago from timestamp
 */
export const timeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Calculate user level from experience
 */
export const calculateLevel = (experience: number): { level: number; title: string; progress: number } => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (experience >= LEVELS[i].experience) {
      const currentLevel = LEVELS[i];
      const nextLevel = LEVELS[i + 1];

      if (!nextLevel) {
        return {
          level: currentLevel.level,
          title: currentLevel.title,
          progress: 100
        };
      }

      const progress = ((experience - currentLevel.experience) /
        (nextLevel.experience - currentLevel.experience)) * 100;

      return {
        level: currentLevel.level,
        title: currentLevel.title,
        progress: Math.min(progress, 100)
      };
    }
  }

  return {
    level: 1,
    title: LEVELS[0].title,
    progress: 0
  };
};

/**
 * Calculate prediction odds based on various factors
 */
import { predictionEngine } from '../services/PredictionEngine';

export const calculateOdds = (
  post: RedditPost,
  marketData: MarketData,
  predictionType: string,
  targetValue: number,
  timeframe: string = 'LONG'
): number => {
  // Use the sophisticated prediction engine instead of simple calculations
  return predictionEngine.calculateOdds(post, marketData, predictionType, targetValue, timeframe);
};

/**
 * Check if user should unlock an achievement
 */
export const checkAchievements = (portfolio: UserPortfolio): Achievement[] => {
  const newAchievements: Achievement[] = [];
  const unlockedIds = portfolio.achievements.map(a => a.id);

  // First Trade
  if (!unlockedIds.includes('first_trade') && portfolio.predictions.length > 0) {
    newAchievements.push({
      ...ACHIEVEMENTS.FIRST_TRADE,
      unlockedAt: Date.now()
    });
  }

  // Winning Streak
  const recentPredictions = portfolio.predictions.slice(-5);
  const winningStreak = recentPredictions.filter(p => p.status === 'won').length;
  if (!unlockedIds.includes('winning_streak') && winningStreak >= 5) {
    newAchievements.push({
      ...ACHIEVEMENTS.WINNING_STREAK,
      unlockedAt: Date.now()
    });
  }

  // High Roller
  const hasHighBet = portfolio.predictions.some(p => p.betAmount >= GAME_CONFIG.HIGH_ROLLER_THRESHOLD);
  if (!unlockedIds.includes('high_roller') && hasHighBet) {
    newAchievements.push({
      ...ACHIEVEMENTS.HIGH_ROLLER,
      unlockedAt: Date.now()
    });
  }

  // Perfect Predictor
  const perfectStreak = recentPredictions.filter(p => p.status === 'won').length;
  if (!unlockedIds.includes('perfect_predictor') && perfectStreak >= 10) {
    newAchievements.push({
      ...ACHIEVEMENTS.PERFECT_PREDICTOR,
      unlockedAt: Date.now()
    });
  }

  return newAchievements;
};

/**
 * Generate mock market volatility
 */
export const generateVolatility = (): number => {
  // Normal distribution around 0 with some randomness
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  // Scale to reasonable volatility range (±5%)
  return z0 * 0.05;
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Local storage helpers
 */
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently fail if storage is full
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  }
};

/**
 * Animation utilities
 */
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  },

  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
  }
};

/**
 * Calculate unlocked achievements based on user portfolio and predictions
 */
export const calculateUnlockedAchievements = (portfolio: UserPortfolio): Achievement[] => {
  const unlockedAchievements: Achievement[] = [];
  const { predictions } = portfolio;

  // First Trade - Made your first prediction
  if (predictions.length > 0) {
    unlockedAchievements.push({
      ...ACHIEVEMENTS.FIRST_TRADE,
      unlockedAt: predictions[0].created
    });
  }

  // High Roller - Bet over 1000 MemeCoins in a single prediction
  const highRollerBet = predictions.find(p => p.betAmount >= GAME_CONFIG.HIGH_ROLLER_THRESHOLD);
  if (highRollerBet) {
    unlockedAchievements.push({
      ...ACHIEVEMENTS.HIGH_ROLLER,
      unlockedAt: highRollerBet.created
    });
  }

  // Winning Streak - Won 5 predictions in a row
  const wonPredictions = predictions.filter(p => p.status === 'won');
  let currentStreak = 0;
  let maxStreak = 0;

  for (const prediction of predictions) {
    if (prediction.status === 'won') {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  if (maxStreak >= 5) {
    const winningStreakPrediction = wonPredictions[4]; // 5th win in streak
    unlockedAchievements.push({
      ...ACHIEVEMENTS.WINNING_STREAK,
      unlockedAt: winningStreakPrediction.created
    });
  }

  // Perfect Predictor - Got 10 predictions right in a row
  if (maxStreak >= 10) {
    const perfectPrediction = wonPredictions[9]; // 10th win in streak
    unlockedAchievements.push({
      ...ACHIEVEMENTS.PERFECT_PREDICTOR,
      unlockedAt: perfectPrediction.created
    });
  }

  // Market Crash Survivor - Survived 3 market crashes (this would need crash event tracking)
  // For now, we'll simulate this based on having made predictions during volatile periods
  const totalPredictions = predictions.length;
  if (totalPredictions >= GAME_CONFIG.MARKET_CRASH_SURVIVOR_THRESHOLD) {
    // Check if user has been active long enough to potentially experience crashes
    const oldestPrediction = Math.min(...predictions.map(p => p.created));
    const daysActive = (Date.now() - oldestPrediction) / (1000 * 60 * 60 * 24);

    if (daysActive >= 7) { // Active for at least a week
      unlockedAchievements.push({
        ...ACHIEVEMENTS.MARKET_CRASH_SURVIVOR,
        unlockedAt: Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 days ago
      });
    }
  }

  return unlockedAchievements;
};

/**
 * Calculate achievement progress for display
 */
export const calculateAchievementProgress = (portfolio: UserPortfolio) => {
  const { predictions } = portfolio;

  // Calculate current winning streak
  let currentStreak = 0;
  for (let i = predictions.length - 1; i >= 0; i--) {
    if (predictions[i].status === 'won') {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate max bet amount
  const maxBet = Math.max(...predictions.map(p => p.betAmount), 0);

  return {
    firstTrade: {
      progress: predictions.length > 0 ? 100 : 0,
      current: predictions.length,
      target: 1
    },
    winningStreak: {
      progress: Math.min((currentStreak / 5) * 100, 100),
      current: currentStreak,
      target: 5
    },
    highRoller: {
      progress: Math.min((maxBet / GAME_CONFIG.HIGH_ROLLER_THRESHOLD) * 100, 100),
      current: maxBet,
      target: GAME_CONFIG.HIGH_ROLLER_THRESHOLD
    },
    marketVeteran: {
      progress: Math.min((predictions.length / 100) * 100, 100),
      current: predictions.length,
      target: 100
    },
    perfectPredictor: {
      progress: Math.min((currentStreak / 10) * 100, 100),
      current: currentStreak,
      target: 10
    }
  };
};

/**
 * Check for daily rewards
 */
export const checkDailyReward = (portfolio: UserPortfolio): { eligible: boolean; reward: number } => {
  const lastRewardKey = `lastDailyReward_${portfolio.userId}`;
  const lastReward = localStorage.getItem(lastRewardKey);
  const today = new Date().toDateString();

  if (lastReward === today) {
    return { eligible: false, reward: 0 };
  }

  // Award daily reward
  localStorage.setItem(lastRewardKey, today);
  return { eligible: true, reward: GAME_CONFIG.DAILY_REWARD };
};

/**
 * Award MemeCoins for achievements
 */
export const awardAchievementBonus = (achievementId: string): number => {
  switch (achievementId) {
    case 'first_trade':
      return GAME_CONFIG.ACHIEVEMENT_REWARD;
    case 'winning_streak':
      return GAME_CONFIG.ACHIEVEMENT_REWARD * 2;
    case 'high_roller':
      return GAME_CONFIG.ACHIEVEMENT_REWARD * 3;
    case 'market_crash_survivor':
      return GAME_CONFIG.ACHIEVEMENT_REWARD * 2;
    case 'perfect_predictor':
      return GAME_CONFIG.ACHIEVEMENT_REWARD * 5;
    case 'market_veteran':
      return GAME_CONFIG.ACHIEVEMENT_REWARD * 4;
    default:
      return GAME_CONFIG.ACHIEVEMENT_REWARD;
  }
};

/**
 * Check for level-up bonuses
 */
export const checkLevelUpBonus = (oldLevel: number, newLevel: number): number => {
  if (newLevel > oldLevel) {
    return (newLevel - oldLevel) * GAME_CONFIG.LEVEL_UP_BONUS;
  }
  return 0;
};

/**
 * Check for winning streak bonuses
 */
export const checkStreakBonus = (currentStreak: number): number => {
  if (currentStreak >= 5 && currentStreak % 5 === 0) {
    return Math.floor(currentStreak / 5) * GAME_CONFIG.WINNING_STREAK_BONUS;
  }
  return 0;
};

/**
 * Check for perfect prediction bonus
 */
export const checkPerfectPredictionBonus = (predictions: Prediction[]): number => {
  const recentPredictions = predictions.slice(-10);
  const perfectStreak = recentPredictions.filter(p => p.status === 'won').length;

  if (perfectStreak >= 10) {
    return GAME_CONFIG.PERFECT_PREDICTION_BONUS;
  }
  return 0;
};

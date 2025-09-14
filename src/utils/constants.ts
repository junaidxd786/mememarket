// Game constants and configuration
export const GAME_CONFIG = {
  // Market settings
  INITIAL_MEMECOINS: 1000,
  MIN_BET_AMOUNT: 10,
  MAX_BET_AMOUNT: 1000,
  MARKET_UPDATE_INTERVAL: 30000, // 30 seconds

  // Sector rotation
  SECTOR_DURATION: 24 * 60 * 60 * 1000, // 24 hours

  // Achievement thresholds
  FIRST_WIN_THRESHOLD: 1,
  HIGH_ROLLER_THRESHOLD: 1000,
  PERFECT_PREDICTIONS_THRESHOLD: 10,
  MARKET_CRASH_SURVIVOR_THRESHOLD: 5,

  // API settings
  REDDIT_API_BASE: 'https://www.reddit.com',
  MAX_POSTS_PER_REQUEST: 25,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

  // UI settings
  ANIMATION_DURATION: 300,
  CHART_UPDATE_INTERVAL: 5000, // 5 seconds
  NOTIFICATION_DURATION: 3000,

  // Game balance
  ODDS_MULTIPLIER: 2.0,
  WIN_MULTIPLIER: 1.8,
  LOSS_MULTIPLIER: 0.9,
  BONUS_MULTIPLIER: 1.5,

  // MemeCoin rewards
  DAILY_REWARD: 50,
  ACHIEVEMENT_REWARD: 100,
  LEVEL_UP_BONUS: 25,
  WINNING_STREAK_BONUS: 10,
  PERFECT_PREDICTION_BONUS: 50,

  // Default fallback values
  DEFAULT_WIN_RATE: 0,
  DEFAULT_TOTAL_PREDICTIONS: 0,
  DEFAULT_TOTAL_WINS: 0,
  DEFAULT_TOTAL_LOSSES: 0,
  DEFAULT_STAKED_COINS: 0,
  DEFAULT_STAKING_REWARDS: 0,
  DEFAULT_TOURNAMENT_POINTS: 0,
  DEFAULT_WIN_STREAK: 0,
  DEFAULT_LOSS_STREAK: 0,
  DEFAULT_BEST_WIN: 0,
  DEFAULT_PERFECT_DAYS: 0,
  DEFAULT_TOTAL_INVESTED: 0,
  DEFAULT_AVERAGE_BET_SIZE: 0,
  DEFAULT_VOLATILITY: 0,
  DEFAULT_RISK_ADJUSTED_RETURN: 0,

  // Market volatility settings
  BASE_VOLATILITY: 0.02, // 2% base volatility
  RANDOM_VOLATILITY_RANGE: 0.02, // ±2% random volatility
  MIN_VOLATILITY: 0.005, // Minimum volatility floor
  VOLATILITY_MULTIPLIER: 1.0, // Global volatility multiplier

  // Market update parameters
  TIME_MULTIPLIER_MAX: 1.5, // Maximum time multiplier for updates
  TIME_MULTIPLIER_BASE: 30, // Base time period in minutes
  RANDOM_FACTOR_RANGE: 0.03, // ±3% random factor range
  TRENDING_BIAS_FACTOR: 0.005, // Slight upward bias factor
  MAX_PRICE_CHANGE_PERCENT: 0.5, // Maximum price change per update (±50%)
  MIN_PRICE: 0.01, // Minimum price floor
  VOLUME_INCREASE_MIN: 5, // Minimum volume increase
  VOLUME_INCREASE_MAX: 30, // Maximum volume increase

  // Market timing constants
  SECTOR_DURATION_HOURS: 24, // How long each sector lasts
  PREDICTION_EXPIRY_HOURS: 24, // When predictions expire
  EVENT_DURATION_MINUTES: 5, // How long market events last

  // Price calculation constants
  SCORE_MULTIPLIER: 0.001, // How much each upvote is worth
  MAX_SCORE_VALUE: 2.0, // Maximum value from upvotes
  PRICE_ROUNDING_DECIMALS: 2, // Decimal places for prices
  PERCENTAGE_ROUNDING_DECIMALS: 2, // Decimal places for percentages
};

export const MARKET_SECTORS = {
  CATS: {
    id: 'cats',
    name: 'Cat Memes',
    description: 'Everything feline and adorable',
    emoji: '🐱',
    multiplier: 1.2,
    keywords: ['cat', 'kitten', 'feline', 'meow']
  },
  POLITICS: {
    id: 'politics',
    name: 'Political Satire',
    description: 'When politics meets memes',
    emoji: '🏛️',
    multiplier: 1.5,
    keywords: ['politics', 'government', 'election', 'policy']
  },
  GAMING: {
    id: 'gaming',
    name: 'Gaming Culture',
    description: 'Epic gaming moments and fails',
    emoji: '🎮',
    multiplier: 1.3,
    keywords: ['game', 'gaming', 'esports', 'streamer']
  },
  FOOD: {
    id: 'food',
    name: 'Food & Cooking',
    description: 'Mouthwatering food content',
    emoji: '🍕',
    multiplier: 1.1,
    keywords: ['food', 'cooking', 'recipe', 'delicious']
  },
  WTF: {
    id: 'wtf',
    name: 'WTF Moments',
    description: 'Mind-blowing and bizarre content',
    emoji: '🤯',
    multiplier: 1.8,
    keywords: ['wtf', 'crazy', 'weird', 'insane']
  }
};



export const ACHIEVEMENTS = {
  FIRST_TRADE: {
    id: 'first_trade',
    name: 'First Trade',
    description: 'Made your first prediction',
    icon: '🎯',
    rarity: 'common' as const
  },
  WINNING_STREAK: {
    id: 'winning_streak',
    name: 'On Fire',
    description: 'Won 5 predictions in a row',
    icon: '🔥',
    rarity: 'rare' as const
  },
  HIGH_ROLLER: {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Bet over 1000 MemeCoins in a single prediction',
    icon: '💰',
    rarity: 'epic' as const
  },
  MARKET_CRASH_SURVIVOR: {
    id: 'crash_survivor',
    name: 'Crash Survivor',
    description: 'Survived 3 market crashes without losing everything',
    icon: '🛡️',
    rarity: 'legendary' as const
  },
  PERFECT_PREDICTOR: {
    id: 'perfect_predictor',
    name: 'Perfect Predictor',
    description: 'Got 10 predictions right in a row',
    icon: '🎪',
    rarity: 'legendary' as const
  }
};

export const LEVELS = [
  { level: 1, experience: 0, title: 'Market Newbie' },
  { level: 2, experience: 100, title: 'Trend Spotter' },
  { level: 3, experience: 250, title: 'Market Analyst' },
  { level: 4, experience: 500, title: 'Prediction Pro' },
  { level: 5, experience: 1000, title: 'Meme Lord' },
  { level: 6, experience: 2000, title: 'Market Wizard' },
  { level: 7, experience: 3500, title: 'Reddit Oracle' },
  { level: 8, experience: 5000, title: 'Legendary Trader' },
  { level: 9, experience: 7500, title: 'Meme Market God' },
  { level: 10, experience: 10000, title: 'Supreme Predictor' }
];

export const COLORS = {
  primary: '#FF4500', // Reddit orange
  secondary: '#0079D3', // Reddit blue
  success: '#00A35B',
  warning: '#FF8C00',
  error: '#FF6B6B',
  background: '#1A1A1B',
  surface: '#272729',
  text: '#D7DADC',
  textSecondary: '#818384',
  up: '#00A35B',
  down: '#FF6B6B',
  neutral: '#D7DADC'
};

export const SOUNDS = {
  betPlaced: '/sounds/bet-placed.mp3',
  win: '/sounds/win.mp3',
  lose: '/sounds/lose.mp3',
  levelUp: '/sounds/level-up.mp3',
  marketCrash: '/sounds/market-crash.mp3',
  achievement: '/sounds/achievement.mp3'
};

export const SUBREDDIT_MULTIPLIERS = {
  'memes': 1.3,
  'programmerhumor': 1.4,
  'gaming': 1.2,
  'cats': 1.3,
  'askreddit': 1.5,
  'todayilearned': 1.4,
  'nextfuckinglevel': 1.6,
  'interestingasfuck': 1.5,
  'wtf': 1.2,
  'politics': 1.1,
  'funny': 1.2,
  'aww': 1.4,
  'news': 1.1,
};

export const PREDICTION_TYPES = {
  GROWTH_RATE: {
    id: 'growth_rate',
    name: 'Growth Rate',
    description: 'Predict upvotes per hour for the next 24 hours',
    icon: '📈',
    baseOdds: 2.0,
    timeBased: true,
    difficulty: 'medium'
  },
  MILESTONE_REACH: {
    id: 'milestone_reach',
    name: 'Milestone Reach',
    description: 'Predict if post will reach target upvotes by deadline',
    icon: '🎯',
    baseOdds: 1.8,
    timeBased: true,
    difficulty: 'medium'
  },
  RANKING_POSITION: {
    id: 'ranking_position',
    name: 'Ranking Position',
    description: 'Predict final ranking position in subreddit',
    icon: '🏆',
    baseOdds: 3.0,
    timeBased: false,
    difficulty: 'hard'
  },
  ENGAGEMENT_RATIO: {
    id: 'engagement_ratio',
    name: 'Engagement Ratio',
    description: 'Predict comments-to-upvotes ratio at deadline',
    icon: '💬',
    baseOdds: 2.5,
    timeBased: true,
    difficulty: 'hard'
  },
  VIRALITY_INDEX: {
    id: 'virality_index',
    name: 'Virality Index',
    description: 'Predict virality score based on multiple factors',
    icon: '🚀',
    baseOdds: 4.0,
    timeBased: true,
    difficulty: 'expert'
  }
};

export const MARKET_DYNAMICS = {
  VOLATILITY_FACTORS: {
    POST_AGE_HOURS: {
      '0-1': 1.0,    // Very volatile (new posts)
      '1-3': 0.8,    // High volatility
      '3-6': 0.6,    // Medium volatility
      '6-12': 0.4,   // Low volatility
      '12-24': 0.3,  // Very low volatility
      '24+': 0.2     // Stable
    },
    CURRENT_RANKING: {
      '1-5': 0.9,    // High competition
      '6-20': 0.7,   // Medium competition
      '21-50': 0.5,  // Low competition
      '51+': 0.3     // Minimal competition
    },
    TIME_OF_DAY: {
      'peak': 1.2,   // 8-10 PM EST
      'normal': 1.0, // 10 AM - 8 PM EST
      'quiet': 0.8   // 10 PM - 10 AM EST
    }
  },
  TREND_FACTORS: {
    GROWTH_PATTERNS: {
      'exponential': 1.3,
      'linear': 1.0,
      'declining': 0.7,
      'plateau': 0.8
    },
    COMMUNITY_SIZE: {
      'large': 1.2,   // >1M subscribers
      'medium': 1.0,  // 100K-1M subscribers
      'small': 0.8    // <100K subscribers
    }
  }
};

export const PREDICTION_TIMEFRAMES = {
  SHORT: { hours: 6, volatility: 1.2, baseMultiplier: 1.5 },
  MEDIUM: { hours: 12, volatility: 1.0, baseMultiplier: 1.2 },
  LONG: { hours: 24, volatility: 0.8, baseMultiplier: 1.0 },
  EXTENDED: { hours: 48, volatility: 0.6, baseMultiplier: 0.8 }
};

export const STAKING_TIERS = [
  {
    minAmount: 0,
    maxAmount: 999,
    apr: 5.0,
    name: 'Bronze Staker',
    color: 'bronze',
    benefits: ['Basic staking rewards', 'Community access']
  },
  {
    minAmount: 1000,
    maxAmount: 4999,
    apr: 8.5,
    name: 'Silver Staker',
    color: 'silver',
    benefits: ['Higher APR', 'Priority support', 'Exclusive tournaments']
  },
  {
    minAmount: 5000,
    maxAmount: 9999,
    apr: 12.0,
    name: 'Gold Staker',
    color: 'gold',
    benefits: ['Premium APR', 'VIP support', 'Early access to features', 'Monthly bonuses']
  },
  {
    minAmount: 10000,
    maxAmount: Infinity,
    apr: 15.0,
    name: 'Diamond Staker',
    color: 'diamond',
    benefits: ['Maximum APR', '24/7 concierge', 'Beta feature access', 'Custom tournaments', 'Revenue sharing']
  }
];

export const TOURNAMENT_CONFIG = {
  ENTRY_FEE: 100,
  DURATION_HOURS: 24,
  MAX_PARTICIPANTS: 100,
  PRIZE_DISTRIBUTION: [0.5, 0.25, 0.15, 0.1], // 50%, 25%, 15%, 10%
  POINTS_PER_WIN: 10,
  POINTS_PER_LOSS: -2,
  BONUS_MULTIPLIER: 1.5 // For consecutive wins
};

export const ALERT_TYPES = {
  EXPIRING_BET: 'expiring_bet',
  MARKET_OPPORTUNITY: 'market_opportunity',
  ACHIEVEMENT: 'achievement',
  STAKING_REWARD: 'staking_reward',
  TOURNAMENT: 'tournament'
};

export const ANALYTICS_CONFIG = {
  PERFORMANCE_TRACKING_DAYS: 30,
  CHART_UPDATE_INTERVAL: 5000, // 5 seconds
  ALERT_CHECK_INTERVAL: 60000, // 1 minute
  STAKING_CLAIM_INTERVAL: 3600000 // 1 hour
};

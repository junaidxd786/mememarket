// Core game types for r/MemeMarket
export interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  commentCount: number;
  created: number;
  url: string;
  thumbnail?: string;
  selftext?: string;
  isIPO?: boolean; // If this is a user-submitted IPO post
}

export interface MarketData {
  postId: string;
  currentPrice: number;
  previousPrice: number;
  volume: number;
  changePercent: number;
  lastUpdated: number;
  trend: 'up' | 'down' | 'stable';
  ranking?: number;
}

export interface Prediction {
  id: string;
  userId: string;
  postId: string;
  postUrl: string;
  postTitle: string;
  predictionType: 'growth_rate' | 'milestone_reach' | 'ranking_position' | 'engagement_ratio' | 'virality_index';
  targetValue: number;
  timeframe: 'SHORT' | 'MEDIUM' | 'LONG' | 'EXTENDED';
  betAmount: number;
  odds: number;
  status: 'active' | 'won' | 'lost' | 'pending';
  created: number;
  resolved: number | null;
  baselineValue: number; // Starting value when prediction was made
  volatilityFactor: number;
  marketConditions: {
    postAge: number;
    currentRanking: number;
    subredditMultiplier: number;
    timeOfDay: 'peak' | 'normal' | 'quiet';
  };
}

export interface UserPortfolio {
  userId: string;
  memeCoins: number;
  totalValue: number;
  predictions: Prediction[];
  achievements: Achievement[];
  level: number;
  experience: number;
  stakedCoins: number;
  stakingRewards: number;
  lastStakingClaim: number;
  tournamentPoints: number;
  currentTournament?: string;
  alertsEnabled: boolean;
  favoriteSubreddits: string[];
  winStreak: number;
  lossStreak: number;
  bestWin: number;
  perfectDays: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: number;
  endDate: number;
  prizePool: number;
  entryFee: number;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'active' | 'completed';
  rules: string[];
  leaderboard: TournamentParticipant[];
}

export interface TournamentParticipant {
  userId: string;
  username: string;
  points: number;
  rank: number;
  predictions: number;
  winRate: number;
}

export interface StakingTier {
  minAmount: number;
  maxAmount: number;
  apr: number; // Annual Percentage Rate
  name: string;
  color: string;
  benefits: string[];
}

export interface Alert {
  id: string;
  type: 'expiring_bet' | 'market_opportunity' | 'achievement' | 'staking_reward' | 'tournament';
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
  actionUrl?: string;
}

export interface PerformanceData {
  date: string;
  memeCoins: number;
  totalPredictions: number;
  winRate: number;
  netEarnings: number;
  experience: number;
}

export interface MarketAnalysis {
  subreddit: string;
  totalPredictions: number;
  winRate: number;
  averageOdds: number;
  volatility: 'low' | 'medium' | 'high';
  trend: 'rising' | 'falling' | 'stable';
  recommendation: 'buy' | 'sell' | 'hold';
}

export interface MarketSector {
  id: string;
  name: string;
  description: string;
  emoji: string;
  activeUntil: number;
  multiplier: number; // Bonus multiplier for this sector
  keywords?: string[]; // Keywords for filtering posts in this sector
}

export interface GameState {
  currentSector: MarketSector | null;
  marketData: Record<string, MarketData>;
  userPortfolio: UserPortfolio;
  trendingPosts: RedditPost[];
  isMarketOpen: boolean;
  nextCrashTime: number | null;
}

export interface IPOApplication {
  id: string;
  postId: string;
  userId: string;
  title: string;
  description: string;
  initialPrice: number;
  totalShares: number;
  status: 'pending' | 'approved' | 'rejected';
  submitted: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalValue: number;
  winRate: number;
  level: number;
  rank: number;
}

export interface MarketEvent {
  id: string;
  type: 'crash' | 'boom' | 'sector_change' | 'achievement';
  title: string;
  description: string;
  impact: number; // Multiplier effect on market
  duration: number; // How long the event lasts
  created: number;
}

// API Response types
export interface RedditApiResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
    after?: string;
  };
}

export interface MarketApiResponse {
  success: boolean;
  data: any;
  error?: string;
}

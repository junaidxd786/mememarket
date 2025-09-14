import {
  RedditPost,
  MarketData,
  Prediction,
  MarketSector,
  MarketEvent,
  UserPortfolio
} from '../types';
import { MARKET_SECTORS, GAME_CONFIG, SUBREDDIT_MULTIPLIERS } from '../utils/constants';
import { calculateLevel } from '../utils/helpers';

export class MarketEngine {
  private static instance: MarketEngine;
  private marketData: Record<string, MarketData> = {};
  private sectors: MarketSector[] = [];
  private currentSector: MarketSector | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeSectors();
    this.startMarketUpdates();
  }

  static getInstance(): MarketEngine {
    if (!MarketEngine.instance) {
      MarketEngine.instance = new MarketEngine();
    }
    return MarketEngine.instance;
  }

  private initializeSectors(): void {
    this.sectors = Object.values(MARKET_SECTORS).map(sector => ({
      ...sector,
      activeUntil: sector.id === 'cats' ? Date.now() + GAME_CONFIG.SECTOR_DURATION : 0
    }));

    // Set initial sector (cats sector is active by default)
    this.currentSector = this.sectors.find(s => s.id === 'cats') || this.sectors[0];
  }

  private startMarketUpdates(): void {
    // Update market prices based on config
    this.updateInterval = setInterval(() => {
      this.updateAllPrices();
    }, GAME_CONFIG.MARKET_UPDATE_INTERVAL);
  }

  private calculateMarketVolatility(): number {
    // Base volatility that varies by market conditions
    const baseVolatility = GAME_CONFIG.BASE_VOLATILITY;

    // Add randomness for market unpredictability
    const randomVolatility = (Math.random() - 0.5) * GAME_CONFIG.RANDOM_VOLATILITY_RANGE;

    // Factor in sector influence
    const sectorInfluence = this.currentSector?.multiplier || 1.0;

    return Math.max(GAME_CONFIG.MIN_VOLATILITY, baseVolatility + randomVolatility) * sectorInfluence * GAME_CONFIG.VOLATILITY_MULTIPLIER;
  }

  private updateAllPrices(): void {
    for (const postId of Object.keys(this.marketData)) {
      this.updatePostPrice(postId);
    }
  }

  private updatePostPrice(postId: string): void {
    const currentData = this.marketData[postId];
    if (!currentData) return;

    const previousPrice = currentData.currentPrice;

    // Enhanced price calculation with real Reddit data patterns
    const marketVolatility = this.calculateMarketVolatility();
    const sectorInfluence = this.currentSector?.multiplier || 1.0;

    // Time-based factors for realistic price movement
    const timeSinceLastUpdate = (Date.now() - currentData.lastUpdated) / (1000 * 60); // minutes
    const timeMultiplier = Math.min(GAME_CONFIG.TIME_MULTIPLIER_MAX, timeSinceLastUpdate / GAME_CONFIG.TIME_MULTIPLIER_BASE);

    // Random market movement with realistic bounds
    const randomFactor = (Math.random() - 0.5) * GAME_CONFIG.RANDOM_FACTOR_RANGE * timeMultiplier;
    const trendingBias = Math.random() * GAME_CONFIG.TRENDING_BIAS_FACTOR * timeMultiplier;

    // Combine all market factors
    const totalChange = marketVolatility + randomFactor + trendingBias;
    const sectorAdjustedChange = totalChange * sectorInfluence;

    // Apply change with realistic bounds
    const priceChange = Math.max(-GAME_CONFIG.MAX_PRICE_CHANGE_PERCENT, Math.min(GAME_CONFIG.MAX_PRICE_CHANGE_PERCENT, sectorAdjustedChange));
    const newPrice = Math.max(GAME_CONFIG.MIN_PRICE, previousPrice * (1 + priceChange));

    // Update market data with enhanced metrics
    const updatedData: MarketData = {
      ...currentData,
      currentPrice: Math.round(newPrice * 100) / 100, // Round to 2 decimals
      previousPrice,
      changePercent: Math.round(((newPrice - previousPrice) / previousPrice) * 10000) / 100, // Round to 2 decimals
      trend: newPrice > previousPrice ? 'up' : newPrice < previousPrice ? 'down' : 'stable',
      lastUpdated: Date.now(),
      volume: currentData.volume + Math.floor(Math.random() * GAME_CONFIG.VOLUME_INCREASE_MAX) + GAME_CONFIG.VOLUME_INCREASE_MIN,
      ranking: Math.floor(Math.random() * 100) + 1 // Add ranking for post performance
    };

    this.marketData[postId] = updatedData;
  }







  // Public API methods
  getMarketData(postId: string): MarketData | null {
    return this.marketData[postId] || null;
  }

  getAllMarketData(): Record<string, MarketData> {
    return { ...this.marketData };
  }

  initializePostMarket(post: RedditPost): MarketData {
    const initialPrice = this.calculateInitialPrice(post);
    const marketData: MarketData = {
      postId: post.id,
      currentPrice: initialPrice,
      previousPrice: initialPrice,
      volume: Math.floor(Math.random() * 1000) + 100,
      changePercent: 0,
      lastUpdated: Date.now(),
      trend: 'stable'
    };

    this.marketData[post.id] = marketData;
    return marketData;
  }

  private calculateInitialPrice(post: RedditPost): number {
    // Enhanced pricing algorithm for real Reddit data
    const basePrice = 0.1;

    // Score-based pricing with diminishing returns
    const scoreValue = Math.min(post.score * GAME_CONFIG.SCORE_MULTIPLIER, GAME_CONFIG.MAX_SCORE_VALUE);

    // Comment engagement with logarithmic scaling
    const commentValue = Math.log(Math.max(1, post.commentCount)) * 0.05;

    // Time-based decay with realistic Reddit patterns
    const ageInHours = (Date.now() - post.created * 1000) / (1000 * 60 * 60);
    const freshnessMultiplier = Math.max(0.1, Math.min(2.0,
      1 + (24 - ageInHours) * 0.02 // Peak value around 24 hours
    ));

    // Subreddit popularity multiplier
    const subredditMultiplier = this.getSubredditMultiplier(post.subreddit);

    // Sector bonus
    const sectorMultiplier = this.currentSector?.multiplier || 1.0;

    // Content quality factors
    const contentMultiplier = this.calculateContentMultiplier(post);

    // Market volatility (±15% for realism)
    const volatility = 1 + (Math.random() - 0.5) * 0.3;

    const finalPrice = (basePrice + scoreValue + commentValue) *
                      freshnessMultiplier *
                      subredditMultiplier *
                      sectorMultiplier *
                      contentMultiplier *
                      volatility;

    return Math.max(0.01, Math.round(finalPrice * 100) / 100); // Round to 2 decimal places
  }

  private calculateContentMultiplier(post: RedditPost): number {
    // Additional factors based on post content
    let multiplier = 1.0;

    // Title length (sweet spot around 50-80 characters)
    const titleLength = post.title.length;
    if (titleLength >= 40 && titleLength <= 100) {
      multiplier *= 1.1;
    } else if (titleLength < 20 || titleLength > 150) {
      multiplier *= 0.9;
    }

    // Self-text content (text posts often have different engagement)
    if (post.selftext && post.selftext.length > 100) {
      multiplier *= 1.05; // Text posts slightly more valuable
    }

    // Image content (visual posts often more engaging)
    if (post.thumbnail && post.thumbnail !== 'self') {
      multiplier *= 1.15; // Visual content bonus
    }

    return multiplier;
  }

  private getSubredditMultiplier(subreddit: string): number {
    // Use configurable subreddit multipliers
    return SUBREDDIT_MULTIPLIERS[subreddit.toLowerCase() as keyof typeof SUBREDDIT_MULTIPLIERS] || 1.0;
  }

  calculatePredictionOdds(prediction: Omit<Prediction, 'odds'>): number {
    // Use the sophisticated prediction engine for odds calculation
    // Note: We would need the RedditPost data to make this fully functional
    // For now, return a reasonable default based on prediction type
    switch (prediction.predictionType) {
      case 'growth_rate': return 2.0;
      case 'milestone_reach': return 1.8;
      case 'ranking_position': return 3.0;
      case 'engagement_ratio': return 2.5;
      case 'virality_index': return 4.0;
      default: return 2.0;
    }
  }

  resolvePrediction(prediction: Prediction, actualValue: number): boolean {
    // Use the sophisticated prediction engine for resolution
    // This would need to be called with proper market data and post data
    // For now, implement basic resolution logic for each type

    switch (prediction.predictionType) {
      case 'growth_rate':
        // Compare actual growth rate with target (within 10% tolerance)
        return Math.abs(actualValue - prediction.targetValue) <= (prediction.targetValue * 0.1);

      case 'milestone_reach':
        return actualValue >= prediction.targetValue;

      case 'ranking_position':
        return actualValue === prediction.targetValue;

      case 'engagement_ratio':
        // Within 15% tolerance for ratio predictions
        return Math.abs(actualValue - prediction.targetValue) <= (prediction.targetValue * 0.15);

      case 'virality_index':
        // Within 20% tolerance for complex virality predictions
        return Math.abs(actualValue - prediction.targetValue) <= (prediction.targetValue * 0.2);

      default:
        return false;
    }
  }

  getCurrentSector(): MarketSector | null {
    return this.currentSector;
  }

  rotateSector(): MarketSector {
    const currentIndex = this.sectors.findIndex(s => s.id === this.currentSector?.id);
    const nextIndex = (currentIndex + 1) % this.sectors.length;
    this.currentSector = this.sectors[nextIndex];
    this.currentSector.activeUntil = Date.now() + GAME_CONFIG.SECTOR_DURATION_HOURS * 60 * 60 * 1000;

    return this.currentSector;
  }

  triggerMarketEvent(eventType: 'crash' | 'boom'): MarketEvent {
    const impact = eventType === 'crash' ? -0.3 : 0.2; // -30% or +20%
    const event: MarketEvent = {
      id: `event_${Date.now()}`,
      type: eventType,
      title: eventType === 'crash' ? 'Market Crash!' : 'Market Boom!',
      description: eventType === 'crash'
        ? 'Panic selling has caused prices to plummet!'
        : 'Investor confidence surges, prices are soaring!',
      impact,
      duration: GAME_CONFIG.EVENT_DURATION_MINUTES * 60 * 1000,
      created: Date.now()
    };

    // Apply event impact to all prices
    for (const postId of Object.keys(this.marketData)) {
      const data = this.marketData[postId];
      const newPrice = Math.max(0.01, data.currentPrice * (1 + impact));
      this.marketData[postId] = {
        ...data,
        currentPrice: newPrice,
        previousPrice: data.currentPrice,
        changePercent: ((newPrice - data.currentPrice) / data.currentPrice) * 100,
        trend: newPrice > data.currentPrice ? 'up' : 'down',
        lastUpdated: Date.now()
      };
    }

    return event;
  }

  // Resolve predictions based on current Reddit data
  resolvePredictions(portfolio: UserPortfolio, redditPosts: RedditPost[]): UserPortfolio {
    const updatedPredictions = portfolio.predictions.map(prediction => {
      if (prediction.status !== 'active') return prediction;

      // Find the corresponding Reddit post
      const post = redditPosts.find(p => p.id === prediction.postId);
      if (!post) return prediction;

      // Check if prediction should be resolved
      let isWon = false;
      let actualValue = 0;
      const postAge = (Date.now() - post.created * 1000) / (1000 * 60 * 60); // Calculate once for all cases

      switch (prediction.predictionType) {
        case 'growth_rate':
          // Calculate actual growth rate
          actualValue = post.score / Math.max(1, postAge);
          isWon = Math.abs(actualValue - prediction.targetValue) <= (prediction.targetValue * 0.1);
          break;
        case 'milestone_reach':
          actualValue = post.score;
          isWon = actualValue >= prediction.targetValue;
          break;
        case 'ranking_position':
          // For now, assume ranking based on score relative to other posts
          // This would need more sophisticated ranking logic in a real implementation
          actualValue = Math.floor(Math.random() * 50) + 1; // Placeholder
          isWon = actualValue === prediction.targetValue;
          break;
        case 'engagement_ratio':
          actualValue = post.commentCount / Math.max(1, post.score);
          isWon = Math.abs(actualValue - prediction.targetValue) <= (prediction.targetValue * 0.15);
          break;
        case 'virality_index':
          actualValue = (post.score + post.commentCount * 2) / Math.max(1, postAge);
          isWon = Math.abs(actualValue - prediction.targetValue) <= (prediction.targetValue * 0.2);
          break;
        default:
          isWon = false;
          break;
      }

      if (isWon) {
        return {
          ...prediction,
          status: 'won' as const,
          resolved: Date.now()
        };
      }

      // Check if prediction has expired (e.g., post is too old)
      const postAgeMs = Date.now() - post.created;
      const maxPredictionAge = GAME_CONFIG.PREDICTION_EXPIRY_HOURS * 60 * 60 * 1000;

      if (postAgeMs > maxPredictionAge) {
        return {
          ...prediction,
          status: 'lost' as const,
          resolved: Date.now()
        };
      }

      return prediction;
    });

    // Calculate winnings for won predictions
    let memeCoins = portfolio.memeCoins;
    let experience = portfolio.experience;

    updatedPredictions.forEach(prediction => {
      if (prediction.status === 'won' && 'resolved' in prediction) {
        const winnings = prediction.betAmount * prediction.odds;
        memeCoins += winnings;
        experience += Math.floor(winnings * 0.1); // Experience based on winnings
      }
    });

    // Calculate updated level from experience
    const { level } = calculateLevel(experience);

    return {
      ...portfolio,
      predictions: updatedPredictions,
      memeCoins,
      experience,
      level
    };
  }

  calculatePortfolioValue(portfolio: UserPortfolio): number {
    let totalValue = portfolio.memeCoins;

    // Add value from active predictions (potential winnings)
    for (const prediction of portfolio.predictions) {
      if (prediction.status === 'active') {
        const potentialWinnings = prediction.betAmount * prediction.odds;
        totalValue += potentialWinnings * 0.1; // 10% of potential value
      }
    }

    // Add value from won predictions (already earned)
    for (const prediction of portfolio.predictions) {
      if (prediction.status === 'won') {
        const actualWinnings = prediction.betAmount * (prediction.odds - 1);
        totalValue += actualWinnings;
      }
    }

    return totalValue;
  }

  // Calculate MemeCoin earnings summary
  calculateEarningsSummary(portfolio: UserPortfolio): {
    initial: number;
    fromWins: number;
    fromDailyRewards: number;
    fromAchievements: number;
    fromLevelUps: number;
    fromStreaks: number;
    totalSpent: number;
    netEarnings: number;
  } {
    let fromWins = 0;
    let totalSpent = 0;

    for (const prediction of portfolio.predictions) {
      if (prediction.status === 'won') {
        fromWins += prediction.betAmount * (prediction.odds - 1);
      }
      if (prediction.status === 'lost') {
        totalSpent += prediction.betAmount;
      } else if (prediction.status === 'active') {
        totalSpent += prediction.betAmount;
      }
    }

    // These would need to be tracked separately in a real implementation
    const fromDailyRewards = Math.max(0, portfolio.memeCoins - GAME_CONFIG.INITIAL_MEMECOINS - fromWins + totalSpent);
    const fromAchievements = portfolio.achievements.length * 50; // Rough estimate
    const fromLevelUps = Math.floor(portfolio.experience / 100) * 10; // Rough estimate
    const fromStreaks = Math.floor(portfolio.predictions.filter(p => p.status === 'won').length / 5) * 10; // Rough estimate

    return {
      initial: GAME_CONFIG.INITIAL_MEMECOINS,
      fromWins,
      fromDailyRewards,
      fromAchievements,
      fromLevelUps,
      fromStreaks,
      totalSpent,
      netEarnings: portfolio.memeCoins - GAME_CONFIG.INITIAL_MEMECOINS
    };
  }

  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

// Export singleton instance
export const marketEngine = MarketEngine.getInstance();

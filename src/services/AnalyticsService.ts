import { UserPortfolio, PerformanceData, MarketAnalysis } from '../types';
import { ANALYTICS_CONFIG, SUBREDDIT_MULTIPLIERS } from '../utils/constants';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private performanceData: PerformanceData[] = [];

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Track daily performance
  trackDailyPerformance(portfolio: UserPortfolio): void {
    const today = new Date().toISOString().split('T')[0];
    const existingData = this.performanceData.find(d => d.date === today);

    const predictions = portfolio.predictions.filter(p => {
      const predictionDate = new Date(p.created).toISOString().split('T')[0];
      return predictionDate === today;
    });

    const dailyData: PerformanceData = {
      date: today,
      memeCoins: portfolio.memeCoins,
      totalPredictions: predictions.length,
      winRate: predictions.length > 0 ?
        (predictions.filter(p => p.status === 'won').length / predictions.length) * 100 : 0,
      netEarnings: predictions.reduce((sum, p) => {
        if (p.status === 'won') {
          return sum + (p.betAmount * p.odds - p.betAmount);
        } else if (p.status === 'lost') {
          return sum - p.betAmount;
        }
        return sum;
      }, 0),
      experience: portfolio.experience
    };

    if (existingData) {
      // Update existing data
      Object.assign(existingData, dailyData);
    } else {
      // Add new data
      this.performanceData.push(dailyData);
    }

    // Keep only last 30 days
    this.performanceData = this.performanceData
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, ANALYTICS_CONFIG.PERFORMANCE_TRACKING_DAYS);
  }

  // Calculate streak statistics
  calculateStreaks(portfolio: UserPortfolio) {
    const completedPredictions = portfolio.predictions
      .filter(p => p.status === 'won' || p.status === 'lost')
      .sort((a, b) => b.created - a.created); // Most recent first

    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let bestWinStreak = 0;
    let bestLossStreak = 0;
    let tempWinStreak = 0;
    let tempLossStreak = 0;

    for (const prediction of completedPredictions) {
      if (prediction.status === 'won') {
        tempWinStreak++;
        tempLossStreak = 0;

        if (tempWinStreak > bestWinStreak) {
          bestWinStreak = tempWinStreak;
        }
      } else {
        tempLossStreak++;
        tempWinStreak = 0;

        if (tempLossStreak > bestLossStreak) {
          bestLossStreak = tempLossStreak;
        }
      }
    }

    // Current streaks (from most recent predictions)
    if (completedPredictions.length > 0) {
      const mostRecent = completedPredictions[0];
      if (mostRecent.status === 'won') {
        currentWinStreak = tempWinStreak;
      } else {
        currentLossStreak = tempLossStreak;
      }
    }

    return {
      currentWinStreak,
      currentLossStreak,
      bestWinStreak,
      bestLossStreak,
      totalPredictions: completedPredictions.length,
      totalWins: completedPredictions.filter(p => p.status === 'won').length,
      totalLosses: completedPredictions.filter(p => p.status === 'lost').length
    };
  }

  // Analyze subreddit performance
  analyzeSubreddits(portfolio: UserPortfolio, trendingPosts: any[] = []): MarketAnalysis[] {
    const subredditStats: { [key: string]: {
      totalPredictions: number;
      wins: number;
      totalBetAmount: number;
      averageOdds: number;
    }} = {};

    // Analyze user's prediction history by subreddit
    portfolio.predictions.forEach(prediction => {
      const post = trendingPosts.find(p => p.id === prediction.postId);
      const subreddit = post?.subreddit || 'unknown';

      if (!subredditStats[subreddit]) {
        subredditStats[subreddit] = {
          totalPredictions: 0,
          wins: 0,
          totalBetAmount: 0,
          averageOdds: 0
        };
      }

      subredditStats[subreddit].totalPredictions++;
      if (prediction.status === 'won') {
        subredditStats[subreddit].wins++;
      }
      subredditStats[subreddit].totalBetAmount += prediction.betAmount;
      subredditStats[subreddit].averageOdds += prediction.odds;
    });

    // Calculate averages and create analysis
    return Object.entries(subredditStats).map(([subreddit, stats]) => {
      const winRate = stats.totalPredictions > 0 ? (stats.wins / stats.totalPredictions) * 100 : 0;
      const averageOdds = stats.totalPredictions > 0 ? stats.averageOdds / stats.totalPredictions : 0;
      const multiplier = SUBREDDIT_MULTIPLIERS[subreddit as keyof typeof SUBREDDIT_MULTIPLIERS] || 1.0;

      // Determine volatility
      const volatility: 'low' | 'medium' | 'high' =
        winRate > 70 ? 'low' :
        winRate > 40 ? 'medium' : 'high';

      // Determine trend
      const trend: 'rising' | 'falling' | 'stable' =
        winRate > 60 ? 'rising' :
        winRate < 30 ? 'falling' : 'stable';

      // Generate recommendation
      let recommendation: 'buy' | 'sell' | 'hold' = 'hold';
      if (winRate > 65 && multiplier > 1.2) {
        recommendation = 'buy';
      } else if (winRate < 35) {
        recommendation = 'sell';
      }

      return {
        subreddit,
        totalPredictions: stats.totalPredictions,
        winRate,
        averageOdds,
        volatility,
        trend,
        recommendation
      };
    });
  }

  // Get performance chart data
  getPerformanceChartData(): PerformanceData[] {
    return [...this.performanceData].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  // Calculate risk metrics
  calculateRiskMetrics(portfolio: UserPortfolio) {
    const activePredictions = portfolio.predictions.filter(p => p.status === 'active');
    const completedPredictions = portfolio.predictions.filter(p => p.status !== 'active');

    const totalInvested = activePredictions.reduce((sum, p) => sum + p.betAmount, 0);
    const averageBetSize = activePredictions.length > 0 ?
      totalInvested / activePredictions.length : 0;

    const winRate = completedPredictions.length > 0 ?
      (completedPredictions.filter(p => p.status === 'won').length / completedPredictions.length) * 100 : 0;

    // Calculate Sharpe-like ratio (returns vs volatility)
    const returns = completedPredictions.map(p => {
      if (p.status === 'won') return p.betAmount * p.odds - p.betAmount;
      if (p.status === 'lost') return -p.betAmount;
      return 0;
    });

    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const variance = returns.length > 0 ?
      returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length : 0;
    const volatility = Math.sqrt(variance);

    const riskAdjustedReturn = volatility > 0 ? avgReturn / volatility : 0;

    return {
      totalInvested,
      averageBetSize,
      winRate,
      volatility: volatility,
      riskAdjustedReturn,
      riskLevel: volatility > 1000 ? 'High' : volatility > 500 ? 'Medium' : 'Low'
    };
  }

  // Get betting frequency analysis
  getBettingFrequency(portfolio: UserPortfolio) {
    const predictions = portfolio.predictions.sort((a, b) => a.created - b.created);

    if (predictions.length < 2) {
      return {
        betsPerDay: 0,
        averageInterval: 0,
        mostActiveHour: 0,
        mostActiveDay: 'N/A'
      };
    }

    // Calculate bets per day
    const firstBet = predictions[0].created;
    const lastBet = predictions[predictions.length - 1].created;
    const daysActive = Math.max(1, (lastBet - firstBet) / (1000 * 60 * 60 * 24));
    const betsPerDay = predictions.length / daysActive;

    // Calculate average interval between bets
    const intervals = [];
    for (let i = 1; i < predictions.length; i++) {
      intervals.push(predictions[i].created - predictions[i-1].created);
    }
    const averageInterval = intervals.length > 0 ?
      intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;

    // Most active hour
    const hourCounts = new Array(24).fill(0);
    predictions.forEach(p => {
      const hour = new Date(p.created).getHours();
      hourCounts[hour]++;
    });
    const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));

    // Most active day
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = new Array(7).fill(0);
    predictions.forEach(p => {
      const day = new Date(p.created).getDay();
      dayCounts[day]++;
    });
    const mostActiveDay = dayNames[dayCounts.indexOf(Math.max(...dayCounts))];

    return {
      betsPerDay: Math.round(betsPerDay * 10) / 10,
      averageInterval: Math.round(averageInterval / (1000 * 60)), // minutes
      mostActiveHour,
      mostActiveDay
    };
  }

  // Get top performing subreddits for user
  getFavoriteSubreddits(portfolio: UserPortfolio, trendingPosts: any[] = []): string[] {
    const subredditPerformance: { [key: string]: { wins: number; total: number; winRate: number }} = {};

    portfolio.predictions.forEach(prediction => {
      const post = trendingPosts.find(p => p.id === prediction.postId);
      const subreddit = post?.subreddit || 'unknown';

      if (!subredditPerformance[subreddit]) {
        subredditPerformance[subreddit] = { wins: 0, total: 0, winRate: 0 };
      }

      subredditPerformance[subreddit].total++;
      if (prediction.status === 'won') {
        subredditPerformance[subreddit].wins++;
      }
    });

    // Calculate win rates and sort
    Object.keys(subredditPerformance).forEach(subreddit => {
      const stats = subredditPerformance[subreddit];
      stats.winRate = stats.total > 0 ? (stats.wins / stats.total) * 100 : 0;
    });

    return Object.entries(subredditPerformance)
      .sort(([, a], [, b]) => b.winRate - a.winRate)
      .slice(0, 5)
      .map(([subreddit]) => subreddit);
  }
}

export const analyticsService = AnalyticsService.getInstance();

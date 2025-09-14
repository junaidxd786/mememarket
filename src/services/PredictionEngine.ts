import { Prediction, RedditPost, MarketData } from '../types';
import { PREDICTION_TYPES, MARKET_DYNAMICS, PREDICTION_TIMEFRAMES, SUBREDDIT_MULTIPLIERS } from '../utils/constants';

export class PredictionEngine {
  private static instance: PredictionEngine;

  static getInstance(): PredictionEngine {
    if (!PredictionEngine.instance) {
      PredictionEngine.instance = new PredictionEngine();
    }
    return PredictionEngine.instance;
  }

  // Calculate sophisticated odds based on multiple market factors
  calculateOdds(
    post: RedditPost,
    marketData: MarketData,
    predictionType: string,
    targetValue: number,
    timeframe: string = 'LONG'
  ): number {
    const predictionConfig = PREDICTION_TYPES[predictionType as keyof typeof PREDICTION_TYPES];
    if (!predictionConfig) return 2.0; // Default odds

    const marketConditions = this.analyzeMarketConditions(post, marketData);
    const volatilityFactor = this.calculateVolatilityFactor(marketConditions);
    const timeMultiplier = PREDICTION_TIMEFRAMES[timeframe as keyof typeof PREDICTION_TIMEFRAMES]?.baseMultiplier || 1.0;

    // Base odds from prediction type
    let baseOdds = predictionConfig.baseOdds;

    // Adjust for market conditions
    baseOdds *= volatilityFactor;

    // Adjust for timeframe
    baseOdds *= timeMultiplier;

    // Adjust for subreddit performance
    const subredditMultiplier = SUBREDDIT_MULTIPLIERS[post.subreddit as keyof typeof SUBREDDIT_MULTIPLIERS] || 1.0;
    baseOdds *= subredditMultiplier;

    // Adjust based on prediction difficulty and current vs target
    const difficultyMultiplier = this.calculateDifficultyMultiplier(
      predictionType,
      post,
      targetValue,
      marketConditions
    );

    baseOdds *= difficultyMultiplier;

    // Ensure minimum and maximum odds
    return Math.max(1.1, Math.min(50.0, baseOdds));
  }

  // Analyze current market conditions for a post
  private analyzeMarketConditions(post: RedditPost, marketData: MarketData) {
    const postAge = (Date.now() - post.created * 1000) / (1000 * 60 * 60); // Hours old
    const currentTime = new Date().getHours();

    // Determine time of day
    let timeOfDay: 'peak' | 'normal' | 'quiet' = 'normal';
    if (currentTime >= 20 && currentTime <= 22) { // 8-10 PM EST
      timeOfDay = 'peak';
    } else if (currentTime >= 22 || currentTime <= 10) { // 10 PM - 10 AM EST
      timeOfDay = 'quiet';
    }

    return {
      postAge,
      currentRanking: marketData.ranking || 50,
      subredditMultiplier: SUBREDDIT_MULTIPLIERS[post.subreddit as keyof typeof SUBREDDIT_MULTIPLIERS] || 1.0,
      timeOfDay,
      currentUpvotes: post.score,
      currentComments: post.commentCount,
      growthRate: this.calculateGrowthRate(post)
    };
  }

  // Calculate volatility factor based on market conditions
  private calculateVolatilityFactor(conditions: any): number {
    let volatility = 1.0;

    // Post age volatility
    if (conditions.postAge <= 1) volatility *= MARKET_DYNAMICS.VOLATILITY_FACTORS.POST_AGE_HOURS['0-1'];
    else if (conditions.postAge <= 3) volatility *= MARKET_DYNAMICS.VOLATILITY_FACTORS.POST_AGE_HOURS['1-3'];
    else if (conditions.postAge <= 6) volatility *= MARKET_DYNAMICS.VOLATILITY_FACTORS.POST_AGE_HOURS['3-6'];
    else if (conditions.postAge <= 12) volatility *= MARKET_DYNAMICS.VOLATILITY_FACTORS.POST_AGE_HOURS['6-12'];
    else if (conditions.postAge <= 24) volatility *= MARKET_DYNAMICS.VOLATILITY_FACTORS.POST_AGE_HOURS['12-24'];
    else volatility *= MARKET_DYNAMICS.VOLATILITY_FACTORS.POST_AGE_HOURS['24+'];

    // Ranking competition
    if (conditions.currentRanking <= 5) volatility *= MARKET_DYNAMICS.VOLATILITY_FACTORS.CURRENT_RANKING['1-5'];
    else if (conditions.currentRanking <= 20) volatility *= MARKET_DYNAMICS.VOLATILITY_FACTORS.CURRENT_RANKING['6-20'];
    else if (conditions.currentRanking <= 50) volatility *= MARKET_DYNAMICS.VOLATILITY_FACTORS.CURRENT_RANKING['21-50'];
    else volatility *= MARKET_DYNAMICS.VOLATILITY_FACTORS.CURRENT_RANKING['51+'];

    // Time of day
    volatility *= MARKET_DYNAMICS.VOLATILITY_FACTORS.TIME_OF_DAY[conditions.timeOfDay as keyof typeof MARKET_DYNAMICS.VOLATILITY_FACTORS.TIME_OF_DAY];

    return volatility;
  }

  // Calculate difficulty multiplier based on prediction type and target
  private calculateDifficultyMultiplier(
    predictionType: string,
    post: RedditPost,
    targetValue: number,
    conditions: any
  ): number {
    switch (predictionType) {
      case 'growth_rate':
        // Harder if predicting high growth rates
        const expectedGrowth = conditions.growthRate * 24; // 24-hour projection
        const growthDifficulty = Math.abs(targetValue - expectedGrowth) / expectedGrowth;
        return Math.max(0.5, Math.min(2.0, 1 + growthDifficulty));

      case 'milestone_reach':
        // Harder if target is much higher than current
        const milestoneDifficulty = targetValue / Math.max(1, post.score);
        return Math.max(0.8, Math.min(3.0, milestoneDifficulty / 2));

      case 'ranking_position':
        // Harder to predict top rankings
        if (targetValue <= 5) return 2.5;
        if (targetValue <= 20) return 1.8;
        if (targetValue <= 50) return 1.2;
        return 0.8;

      case 'engagement_ratio':
        // Harder to predict exact engagement ratios
        const currentRatio = post.commentCount / Math.max(1, post.score);
        const ratioDifficulty = Math.abs(targetValue - currentRatio) / currentRatio;
        return Math.max(0.7, Math.min(2.5, 1 + ratioDifficulty));

      case 'virality_index':
        // Most complex prediction type
        return 2.0;

      default:
        return 1.0;
    }
  }

  // Calculate current growth rate of a post
  private calculateGrowthRate(post: RedditPost): number {
    const postAge = (Date.now() - post.created * 1000) / (1000 * 60 * 60); // Hours
    if (postAge <= 0) return 0;

    return post.score / postAge; // Upvotes per hour
  }

  // Generate smart prediction suggestions
  generatePredictionSuggestions(post: RedditPost, marketData: MarketData) {
    const conditions = this.analyzeMarketConditions(post, marketData);
    const suggestions = [];

    // Growth Rate Suggestion
    const expectedGrowthRate = conditions.growthRate;
    const suggestedGrowthRate = Math.round(expectedGrowthRate * (0.8 + Math.random() * 0.4)); // ±20% variation
    suggestions.push({
      type: 'growth_rate',
      targetValue: suggestedGrowthRate,
      timeframe: 'LONG',
      confidence: this.calculateConfidence(expectedGrowthRate, suggestedGrowthRate),
      reasoning: `Based on current ${expectedGrowthRate.toFixed(1)} upvotes/hour growth rate`
    });

    // Milestone Suggestion
    const projectedUpvotes = post.score + (expectedGrowthRate * 24);
    const milestoneTarget = Math.round(projectedUpvotes * (0.9 + Math.random() * 0.2)); // ±10% variation
    suggestions.push({
      type: 'milestone_reach',
      targetValue: milestoneTarget,
      timeframe: 'LONG',
      confidence: this.calculateConfidence(projectedUpvotes, milestoneTarget),
      reasoning: `Projected ${projectedUpvotes.toFixed(0)} upvotes in 24 hours`
    });

    // Ranking Suggestion (if post is doing well)
    if (post.score > 100) {
      const currentRanking = conditions.currentRanking;
      const rankingTarget = Math.max(1, currentRanking - Math.floor(Math.random() * 10));
      suggestions.push({
        type: 'ranking_position',
        targetValue: rankingTarget,
        timeframe: 'LONG',
        confidence: 0.6,
        reasoning: `Current ranking: ${currentRanking}, strong performer`
      });
    }

    return suggestions;
  }

  // Calculate confidence level for suggestions
  private calculateConfidence(expected: number, predicted: number): number {
    const accuracy = 1 - Math.abs(predicted - expected) / expected;
    return Math.max(0.1, Math.min(0.9, accuracy));
  }

  // Resolve prediction based on sophisticated win conditions
  resolvePrediction(prediction: Prediction, currentPost: RedditPost, marketData: MarketData): boolean {
    const resolutionTime = prediction.created + (PREDICTION_TIMEFRAMES[prediction.timeframe].hours * 60 * 60 * 1000);

    // Only resolve if timeframe has passed
    if (Date.now() < resolutionTime) return false;

    switch (prediction.predictionType) {
      case 'growth_rate':
        const actualGrowthRate = (currentPost.score - prediction.baselineValue) /
          (PREDICTION_TIMEFRAMES[prediction.timeframe].hours);
        return Math.abs(actualGrowthRate - prediction.targetValue) <= (prediction.targetValue * 0.1); // ±10% tolerance

      case 'milestone_reach':
        return currentPost.score >= prediction.targetValue;

      case 'ranking_position':
        return marketData.ranking === prediction.targetValue;

      case 'engagement_ratio':
        const actualRatio = currentPost.commentCount / Math.max(1, currentPost.score);
        return Math.abs(actualRatio - prediction.targetValue) <= (prediction.targetValue * 0.15); // ±15% tolerance

      case 'virality_index':
        const viralityScore = this.calculateViralityScore(currentPost, marketData);
        return Math.abs(viralityScore - prediction.targetValue) <= (prediction.targetValue * 0.2); // ±20% tolerance

      default:
        return false;
    }
  }

  // Calculate virality score based on multiple factors
  private calculateViralityScore(post: RedditPost, marketData: MarketData): number {
    const upvotes = post.score;
    const comments = post.commentCount;
    const age = (Date.now() - post.created * 1000) / (1000 * 60 * 60);
    const ranking = marketData.ranking || 100;

    // Virality formula: (upvotes * comments * growth_rate) / (age * ranking)
    const growthRate = upvotes / Math.max(1, age);
    const engagement = upvotes + (comments * 2); // Comments worth more than upvotes
    const competition = Math.max(1, ranking / 10); // Lower ranking = higher competition

    return (engagement * growthRate) / (age * competition);
  }

  // Get prediction statistics for analytics
  getPredictionStats(predictions: Prediction[]): any {
    const resolved = predictions.filter(p => p.status !== 'active');

    return {
      totalPredictions: predictions.length,
      resolvedPredictions: resolved.length,
      winRate: resolved.length > 0 ? (resolved.filter(p => p.status === 'won').length / resolved.length) * 100 : 0,
      averageOdds: predictions.reduce((sum, p) => sum + p.odds, 0) / Math.max(1, predictions.length),
      byType: this.groupByType(predictions),
      byTimeframe: this.groupByTimeframe(predictions)
    };
  }

  private groupByType(predictions: Prediction[]): any {
    const grouped = predictions.reduce((acc, p) => {
      acc[p.predictionType] = acc[p.predictionType] || { total: 0, wins: 0 };
      acc[p.predictionType].total++;
      if (p.status === 'won') acc[p.predictionType].wins++;
      return acc;
    }, {} as any);

    Object.keys(grouped).forEach(type => {
      grouped[type].winRate = grouped[type].total > 0 ?
        (grouped[type].wins / grouped[type].total) * 100 : 0;
    });

    return grouped;
  }

  private groupByTimeframe(predictions: Prediction[]): any {
    const grouped = predictions.reduce((acc, p) => {
      acc[p.timeframe] = acc[p.timeframe] || { total: 0, wins: 0 };
      acc[p.timeframe].total++;
      if (p.status === 'won') acc[p.timeframe].wins++;
      return acc;
    }, {} as any);

    Object.keys(grouped).forEach(timeframe => {
      grouped[timeframe].winRate = grouped[timeframe].total > 0 ?
        (grouped[timeframe].wins / grouped[timeframe].total) * 100 : 0;
    });

    return grouped;
  }
}

export const predictionEngine = PredictionEngine.getInstance();

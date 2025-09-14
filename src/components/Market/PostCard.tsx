import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RedditPost, MarketData, Prediction } from '../../types';
import { formatCurrency, formatNumber, timeAgo, calculateOdds } from '../../utils/helpers';
import { PREDICTION_TYPES, PREDICTION_TIMEFRAMES, GAME_CONFIG } from '../../utils/constants';

interface PostCardProps {
  post: RedditPost;
  marketData: MarketData | null;
  isSelected: boolean;
  onSelect: () => void;
  onPlaceBet?: (prediction: Omit<Prediction, 'id' | 'userId' | 'status' | 'created' | 'resolved'>) => void;
  userPortfolio?: any; // For checking available balance
}

const PostCard: React.FC<PostCardProps> = ({ post, marketData, isSelected, onSelect, onPlaceBet, userPortfolio }) => {
  const [betAmount, setBetAmount] = useState(GAME_CONFIG.MIN_BET_AMOUNT);
  const [predictionType, setPredictionType] = useState('growth_rate');
  const [timeframe, setTimeframe] = useState('LONG');

  // Dynamic target value suggestions based on prediction type and timeframe
  const getSuggestedTarget = (type: string, tf: string = 'LONG') => {
    const hours = PREDICTION_TIMEFRAMES[tf as keyof typeof PREDICTION_TIMEFRAMES]?.hours || 24;
    const growthRate = post.score / Math.max(1, (Date.now() - post.created * 1000) / (1000 * 60 * 60));

    switch (type) {
      case 'growth_rate':
        return Math.round(growthRate * (0.8 + Math.random() * 0.4)); // ±20% variation
      case 'milestone_reach':
        const projectedUpvotes = post.score + (growthRate * hours);
        return Math.round(projectedUpvotes * (0.9 + Math.random() * 0.2)); // ±10% variation
      case 'ranking_position':
        return Math.max(1, Math.floor(Math.random() * 20) + 1);
      case 'engagement_ratio':
        const currentRatio = post.commentCount / Math.max(1, post.score);
        return (currentRatio * (0.8 + Math.random() * 0.4)).toFixed(2); // ±20% variation
      case 'virality_index':
        return Math.round((post.score + post.commentCount * 2) / Math.max(1, (Date.now() - post.created * 1000) / (1000 * 60 * 60)));
      default:
        return post.score + 10;
    }
  };

  const [targetValue, setTargetValue] = useState(getSuggestedTarget('growth_rate', 'LONG'));
  const [showBetting, setShowBetting] = useState(false);
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  const handleBet = () => {
    if (!marketData || !onPlaceBet || !userPortfolio) return;

    // Validation
    if (betAmount < GAME_CONFIG.MIN_BET_AMOUNT) {
      alert(`Minimum bet is ${GAME_CONFIG.MIN_BET_AMOUNT} MemeCoins`);
      return;
    }

    if (betAmount > GAME_CONFIG.MAX_BET_AMOUNT) {
      alert(`Maximum bet is ${GAME_CONFIG.MAX_BET_AMOUNT} MemeCoins`);
      return;
    }

    if (betAmount > userPortfolio.memeCoins) {
      alert('Insufficient MemeCoins balance');
      return;
    }

    const odds = calculateOdds(post, marketData, predictionType, Number(targetValue), timeframe);
    const prediction: Omit<Prediction, 'id' | 'userId' | 'status' | 'created' | 'resolved'> = {
      postId: post.id,
      predictionType: predictionType as any,
      targetValue: parseFloat(targetValue.toString()),
      timeframe: timeframe as any,
      betAmount,
      odds,
      postUrl: post.url,
      postTitle: post.title,
      baselineValue: predictionType === 'growth_rate' ? post.score :
                   predictionType === 'milestone_reach' ? post.score :
                   predictionType === 'engagement_ratio' ? (post.commentCount / Math.max(1, post.score)) :
                   predictionType === 'virality_index' ? ((post.score + post.commentCount * 2) / Math.max(1, (Date.now() - post.created * 1000) / (1000 * 60 * 60))) :
                   post.score,
      volatilityFactor: 1.0,
      marketConditions: {
        postAge: (Date.now() - post.created * 1000) / (1000 * 60 * 60),
        currentRanking: marketData?.ranking || 50,
        subredditMultiplier: 1.0,
        timeOfDay: new Date().getHours() >= 20 && new Date().getHours() <= 22 ? 'peak' :
                  new Date().getHours() >= 22 || new Date().getHours() <= 10 ? 'quiet' : 'normal'
      }
    };

    // Place the bet
    onPlaceBet(prediction);
    setShowBetting(false);
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  return (
    <motion.div
      className={`border-b border-gray-700 p-4 cursor-pointer transition-all duration-200 hover:bg-gray-700/50 ${
        isSelected ? 'bg-orange-500/10 border-orange-500/50' : ''
      }`}
      onClick={onSelect}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start space-x-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          {post.thumbnail && post.thumbnail !== 'self' ? (
            <img
              src={post.thumbnail}
              alt="Post thumbnail"
              className="w-16 h-16 rounded-lg object-cover bg-gray-700"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <span className="text-2xl">
                {post.subreddit.toLowerCase().includes('cat') ? '🐱' :
                 post.subreddit.toLowerCase().includes('gaming') ? '🎮' :
                 post.subreddit.toLowerCase().includes('food') ? '🍕' : '📱'}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-white font-medium text-sm leading-tight mb-1 line-clamp-2">
                {post.title}
              </h4>
              <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
                <span>r/{post.subreddit}</span>
                <span>•</span>
                <span>u/{post.author}</span>
                <span>•</span>
                <span>{timeAgo(post.created)}</span>
                {post.isIPO && (
                  <>
                    <span>•</span>
                    <span className="text-green-400 font-semibold">IPO</span>
                  </>
                )}
              </div>
            </div>

            {/* Market Data */}
            {marketData && (
              <div className="text-right ml-4">
                <div className="text-lg font-bold text-white">
                  {formatCurrency(marketData.currentPrice)}
                </div>
                <div className={`flex items-center text-sm ${getTrendColor(marketData.trend)}`}>
                  <span className="mr-1">{getTrendIcon(marketData.trend)}</span>
                  <span>{marketData.changePercent > 0 ? '+' : ''}{marketData.changePercent.toFixed(2)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <span className="text-orange-500">⬆️</span>
                <span className="text-gray-300">{formatNumber(post.score)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-blue-500">💬</span>
                <span className="text-gray-300">{formatNumber(post.commentCount)}</span>
              </div>
              {marketData && (
                <div className="flex items-center space-x-1">
                  <span className="text-green-500">📊</span>
                  <span className="text-gray-300">{formatNumber(marketData.volume)}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(post.url, '_blank', 'noopener,noreferrer');
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="View on Reddit"
              >
                <span>🔗</span>
                <span>Reddit</span>
              </motion.button>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBetting(!showBetting);
                }}
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showBetting ? 'Cancel' : 'Bet'}
              </motion.button>
            </div>
          </div>

          {/* Detailed Stats */}
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">📊 Detailed Analytics</h3>
                <button
                  onClick={() => setShowDetailedStats(!showDetailedStats)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  {showDetailedStats ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{formatNumber(post.score)}</div>
                  <div className="text-xs text-gray-400">Current Upvotes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{formatNumber(post.commentCount)}</div>
                  <div className="text-xs text-gray-400">Comments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{timeAgo(post.created * 1000)}</div>
                  <div className="text-xs text-gray-400">Posted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{post.subreddit}</div>
                  <div className="text-xs text-gray-400">Subreddit</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-center mb-4">
                <motion.button
                  onClick={() => window.open(post.url, '_blank', 'noopener,noreferrer')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="View original Reddit post"
                >
                  <span>🔗</span>
                  <span>View on Reddit</span>
                  <span>↗️</span>
                </motion.button>
              </div>

              {showDetailedStats && (
                <div className="border-t border-gray-600 pt-4">
                  <h4 className="text-md font-semibold text-white mb-3">🎯 Prediction Guide</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-600 p-3 rounded">
                      <div className="font-medium text-white mb-1">📈 Upvote Prediction</div>
                      <div className="text-sm text-gray-300">
                        Predict final upvotes. Win if post reaches your target or higher.
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Current: {post.score} | Suggested: {getSuggestedTarget('upvotes')}
                      </div>
                    </div>
                    <div className="bg-gray-600 p-3 rounded">
                      <div className="font-medium text-white mb-1">💬 Comment Prediction</div>
                      <div className="text-sm text-gray-300">
                        Predict final comment count. Win if post gets your target comments or more.
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Current: {post.commentCount} | Suggested: {getSuggestedTarget('comments')}
                      </div>
                    </div>
                    <div className="bg-gray-600 p-3 rounded">
                      <div className="font-medium text-white mb-1">🚀 Virality Index</div>
                      <div className="text-sm text-gray-300">
                        Predict virality score based on upvotes, comments, and engagement. Expert level prediction!
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Target: {getSuggestedTarget('virality_index', timeframe)} virality score
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Betting Interface */}
          {showBetting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="prediction-type" className="block text-sm font-medium text-gray-300 mb-2">
                    Prediction Type
                  </label>
                  <select
                    id="prediction-type"
                    value={predictionType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setPredictionType(newType);
                      setTargetValue(getSuggestedTarget(newType, timeframe));
                    }}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                    aria-label="Select prediction type"
                  >
                    {Object.entries(PREDICTION_TYPES).map(([key, type]) => (
                      <option key={key} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="timeframe" className="block text-sm font-medium text-gray-300 mb-2">
                    Time Frame
                  </label>
                  <select
                    id="timeframe"
                    value={timeframe}
                    onChange={(e) => {
                      const newTimeframe = e.target.value;
                      setTimeframe(newTimeframe);
                      setTargetValue(getSuggestedTarget(predictionType, newTimeframe));
                    }}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                    aria-label="Select timeframe"
                  >
                    <option value="SHORT">Short (6 hours)</option>
                    <option value="MEDIUM">Medium (12 hours)</option>
                    <option value="LONG">Long (24 hours)</option>
                    <option value="EXTENDED">Extended (48 hours)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="target-value" className="block text-sm font-medium text-gray-300 mb-2">
                    Target Value
                  </label>
                  <input
                    id="target-value"
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                    min="1"
                    aria-label="Enter target value for prediction"
                    placeholder="e.g., 10000"
                  />
                </div>

                <div>
                  <label htmlFor="bet-amount" className="block text-sm font-medium text-gray-300 mb-2">
                    Bet Amount
                  </label>
                  <input
                    id="bet-amount"
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                    min="10"
                    max="1000"
                    aria-label="Enter bet amount in MemeCoins"
                    placeholder="10-1000"
                  />
                </div>
              </div>

              {/* Betting Explanation */}
              <div className="mt-4 p-3 bg-gray-600 rounded-lg border border-gray-500">
                <h4 className="text-sm font-semibold text-white mb-2">🎲 Betting Rules & Payouts</h4>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>Your Bet:</span>
                    <span className="text-red-400">-{formatCurrency(betAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>If You Win:</span>
                    <span className="text-green-400">+{formatCurrency(betAmount * calculateOdds(post, marketData!, predictionType, Number(targetValue), timeframe) - betAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>If You Lose:</span>
                    <span className="text-red-400">-{formatCurrency(betAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Odds:</span>
                    <span className="text-blue-400">{calculateOdds(post, marketData!, predictionType, Number(targetValue), timeframe).toFixed(2)}x</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-500">
                  <h5 className="text-xs font-semibold text-white mb-2">⏰ When Does Bet Resolve?</h5>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div>• <strong>Resolution:</strong> 24 hours after post creation</div>
                    <div>• <strong>Win Condition:</strong> Post must reach your target value</div>
                    <div>• <strong>Payout:</strong> Immediate after resolution</div>
                    <div>• <strong>Status:</strong> Track in Portfolio → Active Predictions</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-500">
                  <h5 className="text-xs font-semibold text-white mb-2">🎯 Win/Lose Conditions</h5>
                  <div className="text-xs text-gray-300">
                    {predictionType === 'growth_rate' && (
                      <div>Win if post achieves {targetValue} upvotes/hour growth rate</div>
                    )}
                    {predictionType === 'milestone_reach' && (
                      <div>Win if post reaches {targetValue} upvotes by resolution time</div>
                    )}
                    {predictionType === 'ranking_position' && (
                      <div>Win if post reaches position #{targetValue} in subreddit</div>
                    )}
                    {predictionType === 'engagement_ratio' && (
                      <div>Win if post achieves {targetValue} comments-to-upvotes ratio</div>
                    )}
                    {predictionType === 'virality_index' && (
                      <div>Win if post achieves virality score of {targetValue}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-400">
                  Odds: {calculateOdds(post, marketData!, predictionType, Number(targetValue), timeframe).toFixed(2)}x
                </div>
                <motion.button
                  onClick={handleBet}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Place Bet ({formatCurrency(betAmount)})
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;

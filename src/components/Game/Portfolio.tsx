import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPortfolio } from '../../types';
import { formatCurrency, calculateLevel } from '../../utils/helpers';
import { marketEngine } from '../../services/MarketEngine';
import { animations } from '../../utils/helpers';
import { GAME_CONFIG } from '../../utils/constants';
import { stakingService } from '../../services/StakingService';
import { tournamentService } from '../../services/TournamentService';
import { analyticsService } from '../../services/AnalyticsService';
import { alertService } from '../../services/AlertService';

interface PortfolioProps {
  portfolio: UserPortfolio;
  marketData: Record<string, any>; // Keep for future use
}

const Portfolio: React.FC<PortfolioProps> = ({ portfolio, marketData: _marketData }) => {
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [stakingAmount, setStakingAmount] = useState('');
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  const { level, title, progress } = calculateLevel(portfolio.experience);
  const earningsSummary = marketEngine.calculateEarningsSummary(portfolio);

  const activePredictions = portfolio.predictions.filter(p => p.status === 'active');
  const completedPredictions = portfolio.predictions.filter(p => p.status !== 'active');

  const winRate = completedPredictions.length > 0
    ? (completedPredictions.filter(p => p.status === 'won').length / completedPredictions.length) * 100
    : 0;

  // Calculate real-time statistics with error handling
  const streakStats = (() => {
    try {
      return analyticsService.calculateStreaks(portfolio);
    } catch (error) {
      console.warn('Error calculating streaks:', error);
      return {
        currentWinStreak: GAME_CONFIG.DEFAULT_WIN_STREAK,
        currentLossStreak: GAME_CONFIG.DEFAULT_LOSS_STREAK,
        bestWinStreak: GAME_CONFIG.DEFAULT_WIN_STREAK,
        bestLossStreak: GAME_CONFIG.DEFAULT_LOSS_STREAK,
        totalPredictions: GAME_CONFIG.DEFAULT_TOTAL_PREDICTIONS,
        totalWins: GAME_CONFIG.DEFAULT_TOTAL_WINS,
        totalLosses: GAME_CONFIG.DEFAULT_TOTAL_LOSSES
      };
    }
  })();

  const stakingStats = (() => {
    try {
      return stakingService.getStakingStats(portfolio);
    } catch (error) {
      console.warn('Error calculating staking stats:', error);
      return {
        currentTier: { name: 'Bronze', apr: 5.0 },
        pendingRewards: GAME_CONFIG.DEFAULT_STAKING_REWARDS,
        totalStaked: GAME_CONFIG.DEFAULT_STAKED_COINS,
        totalRewards: GAME_CONFIG.DEFAULT_STAKING_REWARDS,
        timeUntilNextClaim: 0,
        nextTierThreshold: 1000
      };
    }
  })();

  const riskMetrics = (() => {
    try {
      return analyticsService.calculateRiskMetrics(portfolio);
    } catch (error) {
      console.warn('Error calculating risk metrics:', error);
      return {
        totalInvested: GAME_CONFIG.DEFAULT_TOTAL_INVESTED,
        averageBetSize: GAME_CONFIG.DEFAULT_AVERAGE_BET_SIZE,
        winRate: GAME_CONFIG.DEFAULT_WIN_RATE,
        volatility: GAME_CONFIG.DEFAULT_VOLATILITY,
        riskAdjustedReturn: GAME_CONFIG.DEFAULT_RISK_ADJUSTED_RETURN,
        riskLevel: 'Low'
      };
    }
  })();

  const bettingFrequency = (() => {
    try {
      return analyticsService.getBettingFrequency(portfolio);
    } catch (error) {
      console.warn('Error calculating betting frequency:', error);
      return {
        betsPerDay: 0,
        averageInterval: 0,
        mostActiveHour: 12,
        mostActiveDay: 'Monday'
      };
    }
  })();

  // Update portfolio data
  useEffect(() => {
    analyticsService.trackDailyPerformance(portfolio);
  }, [portfolio]);

  // Subscribe to alerts
  useEffect(() => {
    const unsubscribe = alertService.subscribe(setAlerts);
    return unsubscribe;
  }, []);

  // Handle staking
  const handleStake = () => {
    const amount = parseInt(stakingAmount);
    if (amount > 0 && amount <= portfolio.memeCoins) {
      // This would normally update the global state
      console.log(`Staking ${amount} MemeCoins`);
      setStakingAmount('');
      setShowStakingModal(false);
    }
  };

  const handleUnstake = () => {
    const amount = parseInt(stakingAmount);
    if (amount > 0 && amount <= portfolio.stakedCoins) {
      // This would normally update the global state
      console.log(`Unstaking ${amount} MemeCoins`);
      setStakingAmount('');
      setShowStakingModal(false);
    }
  };

  // Quick action handlers
  const handleBrowseMarket = () => {
    // This would normally navigate to market view
    console.log('Navigating to Market View');
    // You can add navigation logic here if you have routing
  };

  const handleQuickBet = () => {
    // This would normally open a quick bet modal
    console.log('Opening Quick Bet Modal');
    // For now, just show an alert - you can replace this with a modal
    alert('Quick Bet feature coming soon! Use the main market to place bets.');
  };

  const handleViewLeaderboard = () => {
    // This would normally navigate to leaderboard
    console.log('Navigating to Leaderboard');
    // You can add navigation logic here if you have routing
  };

  const handleViewAchievements = () => {
    // This would normally open achievements modal
    console.log('Opening Achievements');
    // For now, just show an alert - you can replace this with a modal
    alert('Achievements feature! Check your progress in the main game.');
  };

  const handleClaimStakingRewards = () => {
    if (stakingService.canClaimRewards(portfolio)) {
      // This would normally update the global state
      console.log('Claiming staking rewards');
    }
  };

  // Handle tournaments
  const handleJoinTournament = (tournamentId: string) => {
    const result = tournamentService.joinTournament(tournamentId, portfolio);
    if (result.success) {
      console.log(`Joined tournament: ${tournamentId}`);
      setShowTournamentModal(false);
    } else {
      alert(result.error);
    }
  };

  const activeTournaments = tournamentService.getActiveTournaments();
  const upcomingTournaments = tournamentService.getUpcomingTournaments();

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <motion.div
          className="bg-gray-800 rounded-lg border border-gray-700 p-4"
          {...animations.fadeIn}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            <button
              onClick={() => setAlerts([])}
              className="text-sm text-gray-400 hover:text-white"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert, index) => (
              <motion.div
                key={alert.id}
                className="bg-gray-700 rounded-lg p-3 flex justify-between items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-lg">
                    {alert.type === 'expiring_bet' ? '⏰' :
                     alert.type === 'market_opportunity' ? '📈' :
                     alert.type === 'achievement' ? '🏆' :
                     alert.type === 'staking_reward' ? '💎' : '🔔'}
                  </span>
                  <div>
                    <div className="text-white font-medium text-sm">{alert.title}</div>
                    <div className="text-gray-400 text-sm">{alert.message}</div>
                  </div>
                </div>
                <button
                  onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Portfolio Overview */}
      <motion.div
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        {...animations.slideUp}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Your Portfolio</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* MemeCoins Balance */}
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm font-medium">MemeCoins</span>
              <span className="text-green-400">💰</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(portfolio.memeCoins)}
            </div>
            <div className="text-xs text-green-300 mt-1">
              Initial: {formatCurrency(GAME_CONFIG.INITIAL_MEMECOINS)}
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-400 text-sm font-medium">Level {level}</span>
              <span className="text-blue-400">⭐</span>
            </div>
            <div className="text-xl font-bold text-white mb-1">{title}</div>
            <div className="text-sm text-gray-400 mb-2">
              {portfolio.experience.toLocaleString()} XP
            </div>
            <div className="progress-bar">
              <div className={`progress-fill progress-fill-blue progress-${Math.round(progress / 5) * 5}`}></div>
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-400 text-sm font-medium">Win Rate</span>
              <span className="text-purple-400">🎯</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {winRate.toFixed(1)}%
            </div>
          </div>

          {/* Active Bets */}
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg p-4 border border-orange-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-400 text-sm font-medium">Active Bets</span>
              <span className="text-orange-400">🎲</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {activePredictions.length}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Active Predictions */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700"
        {...animations.fadeIn}
      >
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            Active Predictions ({activePredictions.length})
          </h3>
        </div>

        <div className="p-4">
          {activePredictions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎯</div>
              <p className="text-gray-400 mb-2">No active predictions</p>
              <p className="text-sm text-gray-500">
                Head to the market to place your first bet!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activePredictions.map((prediction) => (
                <motion.div
                  key={prediction.id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-orange-400 font-medium">
                            {prediction.predictionType === 'growth_rate' ? '📈 Growth Rate' :
                             prediction.predictionType === 'milestone_reach' ? '🎯 Milestone' :
                             prediction.predictionType === 'ranking_position' ? '🏆 Ranking' :
                             prediction.predictionType === 'engagement_ratio' ? '💬 Engagement' : '🚀 Virality'}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-400">
                            Target: {prediction.targetValue.toLocaleString()}
                          </span>
                        </div>
                        <motion.button
                          onClick={() => window.open(prediction.postUrl, '_blank', 'noopener,noreferrer')}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors flex items-center space-x-1"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="View on Reddit"
                        >
                          <span>🔗</span>
                          <span>Reddit</span>
                        </motion.button>
                      </div>

                      {/* Post Title */}
                      <div className="text-sm text-gray-300 mb-3 line-clamp-2" title={prediction.postTitle}>
                        {prediction.postTitle}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Bet Amount:</span>
                          <span className="text-green-400 font-medium">{formatCurrency(prediction.betAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Odds:</span>
                          <span className="text-blue-400 font-medium">{prediction.odds.toFixed(2)}x</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">If Win:</span>
                          <span className="text-green-400 font-medium">+{formatCurrency(prediction.betAmount * prediction.odds - prediction.betAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">If Lose:</span>
                          <span className="text-red-400 font-medium">-{formatCurrency(prediction.betAmount)}</span>
                        </div>
                      </div>

                      {/* Progress and Time Remaining */}
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="text-gray-400">Time Remaining:</span>
                          <span className="text-orange-400 font-medium">
                            {(() => {
                              const created = prediction.created;
                              const resolutionTime = created + (24 * 60 * 60 * 1000); // 24 hours
                              const remaining = Math.max(0, resolutionTime - Date.now());
                              const hours = Math.floor(remaining / (1000 * 60 * 60));
                              const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                              return remaining > 0 ? `${hours}h ${minutes}m` : 'Resolving...';
                            })()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div
                            className={`bg-orange-500 h-2 rounded-full transition-all duration-300 progress-w-${Math.min(100, Math.round(((Date.now() - prediction.created) / (24 * 60 * 60 * 1000)) * 100) / 5) * 5}`}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 text-center">
                          Resolves in 24 hours
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-400 mb-1">
                        {new Date(prediction.created).toLocaleDateString()}
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {(() => {
                          const created = prediction.created;
                          const resolutionTime = created + (24 * 60 * 60 * 1000);
                          const remaining = resolutionTime - Date.now();
                          const hoursLeft = remaining / (1000 * 60 * 60);

                          if (hoursLeft <= 2 && hoursLeft > 0) {
                            return (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded animate-pulse">
                                ⏰ Expires Soon
                              </span>
                            );
                          } else if (hoursLeft <= 0) {
                            return (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                                🔄 Resolving...
                              </span>
                            );
                          } else {
                            return (
                              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                                Active
                              </span>
                            );
                          }
                        })()}
                        <span className="text-xs text-gray-400">
                          ID: {prediction.id.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Prediction History */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700"
        {...animations.fadeIn}
      >
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            Prediction History ({completedPredictions.length})
          </h3>
        </div>

        <div className="p-4">
          {completedPredictions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-400">No prediction history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedPredictions.slice(0, 10).map((prediction) => (
                <div
                  key={prediction.id}
                  className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      prediction.status === 'won' ? 'bg-green-400' :
                      prediction.status === 'lost' ? 'bg-red-400' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <div className="text-white text-sm font-medium">
                        {prediction.predictionType === 'growth_rate' ? 'Growth Rate Prediction' :
                         prediction.predictionType === 'milestone_reach' ? 'Milestone Prediction' :
                         prediction.predictionType === 'ranking_position' ? 'Ranking Prediction' :
                         prediction.predictionType === 'engagement_ratio' ? 'Engagement Prediction' : 'Virality Prediction'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(prediction.created).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        prediction.status === 'won' ? 'text-green-400' :
                        prediction.status === 'lost' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {prediction.status === 'won' ? '+' : ''}
                        {formatCurrency(
                          prediction.status === 'won'
                            ? prediction.betAmount * (prediction.odds - 1)
                            : -prediction.betAmount
                        )}
                      </div>
                    </div>
                    <motion.button
                      onClick={() => window.open(prediction.postUrl, '_blank', 'noopener,noreferrer')}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="View on Reddit"
                    >
                      🔗
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* MemeCoin Earnings Summary */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700"
        {...animations.fadeIn}
      >
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            MemeCoin Earnings Summary
          </h3>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{formatCurrency(earningsSummary.fromWins)}</div>
              <div className="text-xs text-gray-400">From Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{formatCurrency(earningsSummary.fromDailyRewards)}</div>
              <div className="text-xs text-gray-400">Daily Rewards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{formatCurrency(earningsSummary.fromAchievements)}</div>
              <div className="text-xs text-gray-400">Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{formatCurrency(earningsSummary.fromLevelUps)}</div>
              <div className="text-xs text-gray-400">Level Ups</div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Total Spent:</span>
              <span className="text-red-400">-{formatCurrency(earningsSummary.totalSpent)}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold mt-2">
              <span className="text-white">Net Earnings:</span>
              <span className={earningsSummary.netEarnings >= 0 ? 'text-green-400' : 'text-red-400'}>
                {earningsSummary.netEarnings >= 0 ? '+' : ''}{formatCurrency(earningsSummary.netEarnings)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Staking Section */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Staking Dashboard</h3>
          <div className="flex space-x-2">
            <motion.button
              onClick={() => setShowStakingModal(true)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Stake
            </motion.button>
            <motion.button
              onClick={handleClaimStakingRewards}
              disabled={!stakingService.canClaimRewards(portfolio)}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm font-medium rounded transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Claim
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-lg p-4 border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 text-sm font-medium">Staked</span>
              <span className="text-amber-400">💎</span>
            </div>
            <div className="text-xl font-bold text-white">{formatCurrency(portfolio.stakedCoins)}</div>
            <div className="text-xs text-gray-400">Currently staked</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm font-medium">Pending</span>
              <span className="text-green-400">⏳</span>
            </div>
            <div className="text-xl font-bold text-white">{formatCurrency(stakingStats.pendingRewards)}</div>
            <div className="text-xs text-gray-400">Rewards to claim</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-400 text-sm font-medium">APR</span>
              <span className="text-purple-400">📈</span>
            </div>
            <div className="text-xl font-bold text-white">{stakingStats.currentTier.apr}%</div>
            <div className="text-xs text-gray-400">{stakingStats.currentTier.name}</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-400 text-sm font-medium">Next Claim</span>
              <span className="text-blue-400">⏰</span>
            </div>
            <div className="text-xl font-bold text-white">
              {stakingStats.timeUntilNextClaim > 0
                ? `${Math.floor(stakingStats.timeUntilNextClaim / (1000 * 60 * 60))}h`
                : 'Ready'
              }
            </div>
            <div className="text-xs text-gray-400">Time until rewards</div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Staking Progress</span>
            <span className="text-sm text-gray-400">
              {portfolio.stakedCoins}/{stakingStats.nextTierThreshold === Infinity ? '∞' : stakingStats.nextTierThreshold}
            </span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className={`bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-300 ${
                stakingStats.nextTierThreshold === Infinity
                  ? 'progress-w-100'
                  : `progress-w-${Math.min(100, Math.round((portfolio.stakedCoins / stakingStats.nextTierThreshold) * 100 / 5) * 5)}`
              }`}
            ></div>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {stakingStats.nextTierThreshold === Infinity
              ? 'Maximum tier reached!'
              : `${formatCurrency(stakingStats.nextTierThreshold - portfolio.stakedCoins)} to next tier`
            }
          </div>
        </div>
      </motion.div>

      {/* Tournament Section */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Tournaments</h3>
          <motion.button
            onClick={() => setShowTournamentModal(true)}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Join Tournament
          </motion.button>
        </div>

        {activeTournaments.length > 0 ? (
          <div className="space-y-4">
            {activeTournaments.slice(0, 2).map((tournament) => (
              <div key={tournament.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-medium">{tournament.name}</h4>
                    <p className="text-sm text-gray-400">{tournament.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-400 font-medium">
                      {formatCurrency(tournament.prizePool)} Pool
                    </div>
                    <div className="text-xs text-gray-400">
                      {tournament.currentParticipants}/{tournament.maxParticipants} players
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-400">
                    Ends: {new Date(tournament.endDate).toLocaleString()}
                  </div>
                  {portfolio.currentTournament === tournament.id && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                      Participating
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏆</div>
            <p className="text-gray-400">No active tournaments</p>
            <p className="text-sm text-gray-500 mt-2">
              Check back soon for new competitive events!
            </p>
          </div>
        )}
      </motion.div>

      {/* Portfolio Performance Chart */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Portfolio Performance</h3>
        <div className="h-64 flex items-center justify-center bg-gray-700 rounded-lg">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-400">Advanced analytics dashboard</p>
            <p className="text-sm text-gray-500 mt-2">
              Performance charts, trends, and market analysis
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-400">
                  {analyticsService.getPerformanceChartData().length}
                </div>
                <div className="text-xs text-gray-400">Days Tracked</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">
                  {winRate.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400">Avg Win Rate</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-400">
                  {portfolio.experience}
                </div>
                <div className="text-xs text-gray-400">XP Gained</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Streak Tracking */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Current Streaks</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm font-medium">Win Streak</span>
              <span className="text-green-400">🔥</span>
            </div>
            <div className="text-2xl font-bold text-white">{streakStats.currentWinStreak}</div>
            <div className="text-xs text-gray-400">Consecutive wins</div>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg p-4 border border-red-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-400 text-sm font-medium">Loss Streak</span>
              <span className="text-red-400">❄️</span>
            </div>
            <div className="text-2xl font-bold text-white">{streakStats.currentLossStreak}</div>
            <div className="text-xs text-gray-400">Consecutive losses</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg p-4 border border-yellow-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-400 text-sm font-medium">Best Win</span>
              <span className="text-yellow-400">🏆</span>
            </div>
            <div className="text-2xl font-bold text-white">{streakStats.bestWinStreak}</div>
            <div className="text-xs text-gray-400">Best win streak</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-400 text-sm font-medium">Perfect Day</span>
              <span className="text-purple-400">⭐</span>
            </div>
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-xs text-gray-400">Days with 100% win rate</div>
          </div>
        </div>
      </motion.div>

      {/* Risk Metrics */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Risk Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-400 text-sm font-medium">Average Bet Size</span>
              <span className="text-blue-400">📊</span>
            </div>
            <div className="text-xl font-bold text-white">
              {formatCurrency(riskMetrics.averageBetSize)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Based on active bets
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg p-4 border border-orange-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-orange-400 text-sm font-medium">Portfolio Volatility</span>
              <span className="text-orange-400">📈</span>
            </div>
            <div className="text-xl font-bold text-white">{riskMetrics.riskLevel}</div>
            <div className="text-xs text-gray-400 mt-1">
              Risk assessment based on betting patterns
            </div>
          </div>
          <div className="bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-lg p-4 border border-teal-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-teal-400 text-sm font-medium">Bet Frequency</span>
              <span className="text-teal-400">⚡</span>
            </div>
            <div className="text-xl font-bold text-white">
              {bettingFrequency.betsPerDay}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Bets per day (avg)
            </div>
          </div>
        </div>
      </motion.div>

      {/* Favorite Subreddits */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Favorite Subreddits</h3>
        <div className="space-y-3">
          {completedPredictions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📱</div>
              <p className="text-gray-400">No subreddit data yet</p>
              <p className="text-sm text-gray-500">
                Your favorite betting subreddits will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(() => {
                // Calculate subreddit statistics
                const subredditStats = completedPredictions.reduce((acc, prediction) => {
                  const subreddit = prediction.postTitle.split(' ')[0]?.toLowerCase() || 'unknown';
                  if (!acc[subreddit]) {
                    acc[subreddit] = {
                      bets: 0,
                      wins: 0,
                      totalBet: 0,
                      totalEarnings: 0,
                      winRate: 0,
                      avgBetSize: 0
                    };
                  }

                  acc[subreddit].bets += 1;
                  acc[subreddit].totalBet += prediction.betAmount;

                  if (prediction.status === 'won') {
                    acc[subreddit].wins += 1;
                    // Calculate earnings (assuming 2x payout for won bets)
                    const earnings = prediction.betAmount * 2;
                    acc[subreddit].totalEarnings += earnings;
                  }

                  acc[subreddit].winRate = (acc[subreddit].wins / acc[subreddit].bets) * 100;
                  acc[subreddit].avgBetSize = acc[subreddit].totalBet / acc[subreddit].bets;

                  return acc;
                }, {} as Record<string, any>);

                // Sort by total earnings descending
                const sortedSubreddits = Object.entries(subredditStats)
                  .sort(([, a], [, b]) => b.totalEarnings - a.totalEarnings)
                  .slice(0, 5); // Top 5 subreddits

                return sortedSubreddits.map(([subreddit, stats]) => (
                  <motion.div
                    key={subreddit}
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white font-medium">r/{subreddit}</h4>
                        <p className="text-xs text-gray-400">{stats.bets} bets placed</p>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">
                          +{formatCurrency(stats.totalEarnings)}
                        </div>
                        <div className="text-xs text-gray-400">Total P&L</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-blue-400 font-bold">{stats.winRate.toFixed(0)}%</div>
                        <div className="text-xs text-gray-400">Win Rate</div>
                      </div>
                      <div>
                        <div className="text-purple-400 font-bold">{formatCurrency(stats.avgBetSize)}</div>
                        <div className="text-xs text-gray-400">Avg Bet</div>
                      </div>
                      <div>
                        <div className="text-orange-400 font-bold">{stats.bets}</div>
                        <div className="text-xs text-gray-400">Total Bets</div>
                      </div>
                    </div>

                    {/* Progress bar for win rate */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Performance</span>
                        <span>{stats.winRate.toFixed(0)}% win rate</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full progress-w-${Math.round(stats.winRate / 5) * 5}`}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ));
              })()}
            </div>
          )}
        </div>
      </motion.div>

      {/* Coming Soon Features */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-6">Coming Soon Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Social Trading */}
          <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-lg p-4 border border-indigo-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-indigo-400 text-lg">🤝</span>
            </div>
            <h4 className="text-white font-medium mb-2">Social Trading</h4>
            <p className="text-sm text-gray-400">
              Follow successful traders and copy their strategies
            </p>
            <div className="mt-3">
              <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">
                Q4 2025
              </span>
            </div>
          </div>

          {/* Advanced Analytics */}
          <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg p-4 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-cyan-400 text-lg">📊</span>
            </div>
            <h4 className="text-white font-medium mb-2">Advanced Analytics</h4>
            <p className="text-sm text-gray-400">
              Detailed charts, correlations, and predictive models
            </p>
            <div className="mt-3">
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                Q3 2025
              </span>
            </div>
          </div>

          {/* Tournament Mode */}
          <motion.div
            className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-lg p-4 border border-pink-500/30 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowTournamentModal(true)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-pink-400 text-lg">🏆</span>
              {portfolio.currentTournament && (
                <div className="text-right">
                  <div className="text-white font-bold text-lg">
                    {portfolio.tournamentPoints}
                  </div>
                  <div className="text-xs text-pink-400">Points</div>
                </div>
              )}
            </div>
            <h4 className="text-white font-medium mb-2">Tournament Arena</h4>
            <div className="space-y-2 mb-3">
              {portfolio.currentTournament ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Current Rank:</span>
                    <span className="text-pink-400 font-medium">
                      #{tournamentService.getUserTournamentRank(portfolio.currentTournament, portfolio.userId)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Points:</span>
                    <span className="text-pink-400 font-medium">{portfolio.tournamentPoints}</span>
                  </div>
                  <div className="text-xs text-gray-300">
                    Keep climbing the leaderboard for prizes! 🏆
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-300">
                  Join competitive tournaments and win big prizes!
                </div>
              )}
            </div>
            <div className="mt-3">
              <span className="px-2 py-1 bg-pink-500/20 text-pink-400 text-xs rounded-full">
                {portfolio.currentTournament ? 'Active Tournament' : 'Available Now'}
              </span>
            </div>
          </motion.div>

          {/* AI Portfolio Assistant */}
          <motion.div
            className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-lg p-4 border border-emerald-500/30 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowAIModal(true)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-emerald-400 text-lg">🤖</span>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <h4 className="text-white font-medium mb-2">AI Portfolio Assistant</h4>
            <div className="space-y-2 mb-3">
              <div className="text-sm text-gray-300">
                {(() => {
                  const winRate = completedPredictions.length > 0 ?
                    (completedPredictions.filter(p => p.status === 'won').length / completedPredictions.length * 100) : 0;

                  if (winRate >= 70) {
                    return "🎯 You're crushing it! Consider higher risk bets.";
                  } else if (winRate >= 50) {
                    return "📈 Steady performance. Focus on consistent growth.";
                  } else {
                    return "🎓 Learning phase. Stick to safer predictions.";
                  }
                })()}
              </div>
              <div className="text-xs text-emerald-400">
                💡 {(() => {
                  const recentPredictions = completedPredictions.slice(-3);
                  if (recentPredictions.length === 0) return "Make your first prediction to get insights!";
                  const winCount = recentPredictions.filter(p => p.status === 'won').length;
                  return `Recent: ${winCount}/3 predictions won`;
                })()}
              </div>
            </div>
            <div className="mt-3">
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                AI Analysis Available
              </span>
            </div>
          </motion.div>

          {/* Staking Rewards */}
          <motion.div
            className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-lg p-4 border border-amber-500/30 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowStakingModal(true)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-amber-400 text-lg">💎</span>
              <div className="text-right">
                <div className="text-white font-bold text-lg">
                  {formatCurrency(stakingStats.pendingRewards)}
                </div>
                <div className="text-xs text-amber-400">Pending</div>
              </div>
            </div>
            <h4 className="text-white font-medium mb-2">Staking Dashboard</h4>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Staked:</span>
                <span className="text-amber-400 font-medium">{formatCurrency(stakingStats.totalStaked)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Tier:</span>
                <span className="text-amber-400 font-medium">{stakingStats.currentTier.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">APR:</span>
                <span className="text-amber-400 font-medium">{stakingStats.currentTier.apr}%</span>
              </div>
            </div>
            <div className="mt-3">
              {stakingStats.pendingRewards > 0 ? (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  {stakingStats.pendingRewards} MemeCoins Available
                </span>
              ) : (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                  {Math.ceil(stakingStats.timeUntilNextClaim / (1000 * 60 * 60))}h until rewards
                </span>
              )}
            </div>
          </motion.div>

          {/* Custom Alerts */}
          <div className="bg-gradient-to-br from-rose-500/20 to-rose-600/20 rounded-lg p-4 border border-rose-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-rose-400 text-lg">🔔</span>
            </div>
            <h4 className="text-white font-medium mb-2">Smart Alerts</h4>
            <p className="text-sm text-gray-400">
              Get notified about expiring bets and market opportunities
            </p>
            <div className="mt-3">
              <span className="px-2 py-1 bg-rose-500/20 text-rose-400 text-xs rounded-full">
                Q3 2025
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button
            onClick={handleBrowseMarket}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex flex-col items-center space-y-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl">📱</span>
            <span className="text-sm">Browse Market</span>
          </motion.button>
          <motion.button
            onClick={handleQuickBet}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex flex-col items-center space-y-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl">🎯</span>
            <span className="text-sm">Quick Bet</span>
          </motion.button>
          <motion.button
            onClick={handleViewLeaderboard}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex flex-col items-center space-y-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl">📊</span>
            <span className="text-sm">View Leaderboard</span>
          </motion.button>
          <motion.button
            onClick={handleViewAchievements}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex flex-col items-center space-y-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl">🏆</span>
            <span className="text-sm">Achievements</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Staking Modal */}
      {showStakingModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Staking Dashboard</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount to Stake/Unstake
                </label>
                <input
                  type="number"
                  value={stakingAmount}
                  onChange={(e) => setStakingAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter amount..."
                  min="0"
                  max={portfolio.memeCoins}
                />
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Available:</span>
                  <span className="text-white">{formatCurrency(portfolio.memeCoins)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Staked:</span>
                  <span className="text-amber-400">{formatCurrency(portfolio.stakedCoins)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Your Tier:</span>
                  <span className="text-purple-400">{stakingStats.currentTier.name}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <motion.button
                  onClick={handleStake}
                  disabled={!stakingAmount || parseInt(stakingAmount) <= 0}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Stake
                </motion.button>
                <motion.button
                  onClick={handleUnstake}
                  disabled={!stakingAmount || parseInt(stakingAmount) <= 0 || parseInt(stakingAmount) > portfolio.stakedCoins}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Unstake
                </motion.button>
              </div>

              <motion.button
                onClick={() => setShowStakingModal(false)}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Tournament Modal */}
      {showTournamentModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Available Tournaments</h3>

            <div className="space-y-4">
              {upcomingTournaments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🏆</div>
                  <p className="text-gray-400">No upcoming tournaments</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Check back later for new competitive events!
                  </p>
                </div>
              ) : (
                upcomingTournaments.map((tournament) => (
                  <div key={tournament.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">{tournament.name}</h4>
                        <p className="text-sm text-gray-400 mb-2">{tournament.description}</p>
                        <div className="text-xs text-gray-500">
                          Starts: {new Date(tournament.startDate).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-green-400">
                          {formatCurrency(tournament.prizePool)}
                        </div>
                        <div className="text-xs text-gray-400">Prize Pool</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm text-gray-400">
                        Entry Fee: {formatCurrency(tournament.entryFee)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {tournament.currentParticipants}/{tournament.maxParticipants} players
                      </div>
                    </div>

                    <div className="bg-gray-600 rounded-lg p-3 mb-3">
                      <h5 className="text-sm font-medium text-white mb-2">Rules:</h5>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {tournament.rules.map((rule, index) => (
                          <li key={index}>• {rule}</li>
                        ))}
                      </ul>
                    </div>

                    <motion.button
                      onClick={() => handleJoinTournament(tournament.id)}
                      disabled={portfolio.currentTournament === tournament.id}
                      className="w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {portfolio.currentTournament === tournament.id ? 'Already Participating' : 'Join Tournament'}
                    </motion.button>
                  </div>
                ))
              )}
            </div>

            <motion.button
              onClick={() => setShowTournamentModal(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* AI Assistant Modal */}
      {showAIModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AI Portfolio Assistant</h3>
                    <p className="text-sm text-gray-400">Personalized insights & recommendations</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Portfolio Analysis */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-4">📊 Portfolio Analysis</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-400">
                        {completedPredictions.length > 0 ?
                          Math.round((completedPredictions.filter(p => p.status === 'won').length / completedPredictions.length) * 100) : 0}%
                      </div>
                      <div className="text-sm text-gray-400">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {formatCurrency(portfolio.memeCoins)}
                      </div>
                      <div className="text-sm text-gray-400">Current Balance</div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-4">🎯 AI Recommendations</h4>
                  <div className="space-y-3">
                    {(() => {
                      const winRate = completedPredictions.length > 0 ?
                        (completedPredictions.filter(p => p.status === 'won').length / completedPredictions.length * 100) : 0;
                      const recommendations = [];

                      if (winRate >= 70) {
                        recommendations.push({
                          type: 'aggressive',
                          icon: '🚀',
                          title: 'High Risk, High Reward',
                          description: 'Your win rate is excellent! Consider virality index predictions for maximum returns.',
                          action: 'Try Virality Index bets'
                        });
                      } else if (winRate >= 50) {
                        recommendations.push({
                          type: 'balanced',
                          icon: '📈',
                          title: 'Growth Strategy',
                          description: 'Focus on growth rate predictions with 6-12 hour timeframes for consistent gains.',
                          action: 'Use Medium Timeframes'
                        });
                      } else {
                        recommendations.push({
                          type: 'conservative',
                          icon: '🛡️',
                          title: 'Risk Management',
                          description: 'Start with milestone reach predictions and longer timeframes to build confidence.',
                          action: 'Try Milestone Predictions'
                        });
                      }

                      if (portfolio.memeCoins < 1000) {
                        recommendations.push({
                          type: 'staking',
                          icon: '💎',
                          title: 'Staking Opportunity',
                          description: 'Consider staking some MemeCoins for passive income while you learn.',
                          action: 'Open Staking Dashboard'
                        });
                      }

                      if (completedPredictions.length < 5) {
                        recommendations.push({
                          type: 'learning',
                          icon: '📚',
                          title: 'Learning Phase',
                          description: 'Make more predictions to unlock detailed analytics and better insights.',
                          action: 'View Analytics'
                        });
                      }

                      return recommendations.map((rec, index) => (
                        <motion.div
                          key={index}
                          className="bg-gray-600 rounded-lg p-3 border border-gray-500"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-xl">{rec.icon}</span>
                            <div className="flex-1">
                              <h5 className="text-white font-medium">{rec.title}</h5>
                              <p className="text-sm text-gray-300 mt-1">{rec.description}</p>
                              <button className="mt-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors">
                                {rec.action}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Market Insights */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-4">🔍 Market Insights</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Best Performing Subreddit:</span>
                      <span className="text-emerald-400 font-medium">
                        {(() => {
                          // Calculate best performing subreddit from user's predictions
                          const subredditStats = completedPredictions.reduce((acc, prediction) => {
                            const subreddit = prediction.postTitle.split(' ')[0]?.toLowerCase() || 'unknown';
                            if (!acc[subreddit]) {
                              acc[subreddit] = { bets: 0, wins: 0 };
                            }
                            acc[subreddit].bets += 1;
                            if (prediction.status === 'won') acc[subreddit].wins += 1;
                            return acc;
                          }, {} as Record<string, { bets: number; wins: number }>);

                          const bestSubreddit = Object.entries(subredditStats)
                            .filter(([, stats]) => stats.bets >= 3) // At least 3 bets for meaningful data
                            .sort(([, a], [, b]) => (b.wins / b.bets) - (a.wins / a.bets))[0];

                          if (bestSubreddit) {
                            const [subreddit, stats] = bestSubreddit;
                            const winRate = Math.round((stats.wins / stats.bets) * 100);
                            return `r/${subreddit} (${winRate}% win rate)`;
                          }
                          return 'r/memes (72% win rate)'; // Fallback
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Optimal Bet Size:</span>
                      <span className="text-blue-400 font-medium">{formatCurrency(Math.min(portfolio.memeCoins * 0.1, 100))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Peak Trading Hours:</span>
                      <span className="text-purple-400 font-medium">8-10 PM EST</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowAIModal(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Portfolio;

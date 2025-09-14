import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPortfolio } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { analyticsService } from '../../services/AnalyticsService';
import { animations } from '../../utils/helpers';

interface AnalyticsProps {
  portfolio: UserPortfolio;
  trendingPosts: any[];
}

const Analytics: React.FC<AnalyticsProps> = ({ portfolio, trendingPosts }) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<'portfolio' | 'earnings' | 'winrate'>('portfolio');

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);

      // Get performance data
      const perfData = analyticsService.getPerformanceChartData();
      setPerformanceData(perfData);

      // Get market analysis
      const analysis = analyticsService.analyzeSubreddits(portfolio, trendingPosts);
      setMarketAnalysis(analysis);

      setIsLoading(false);
    };

    loadAnalytics();
  }, [portfolio, trendingPosts]);

  const riskMetrics = analyticsService.calculateRiskMetrics(portfolio);
  const streakStats = analyticsService.calculateStreaks(portfolio);

  const timeframes = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        {...animations.fadeIn}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Advanced Analytics</h2>
            <p className="text-gray-400">Detailed insights into your trading performance</p>
          </div>
          <div className="flex space-x-2">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeframe === tf.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        {...animations.fadeIn}
      >
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-400 text-sm font-medium">Sharpe Ratio</span>
            <span className="text-green-400">📊</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {riskMetrics.riskAdjustedReturn.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400">Risk-adjusted returns</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-4 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-400 text-sm font-medium">Volatility</span>
            <span className="text-blue-400">📈</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.sqrt(riskMetrics.volatility).toFixed(0)}
          </div>
          <div className="text-xs text-gray-400">Standard deviation</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-400 text-sm font-medium">Best Streak</span>
            <span className="text-purple-400">🔥</span>
          </div>
          <div className="text-2xl font-bold text-white">{streakStats.bestWinStreak}</div>
          <div className="text-xs text-gray-400">Consecutive wins</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg p-4 border border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-400 text-sm font-medium">Days Tracked</span>
            <span className="text-orange-400">📅</span>
          </div>
          <div className="text-2xl font-bold text-white">{performanceData.length}</div>
          <div className="text-xs text-gray-400">Performance history</div>
        </div>
      </motion.div>

      {/* Performance Chart */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Performance Trend</h3>
        {performanceData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-400">No performance data yet</p>
            <p className="text-sm text-gray-500">Start trading to see your performance trends!</p>
          </div>
        ) : (
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Performance Chart</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => setChartType('portfolio')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    chartType === 'portfolio' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Portfolio
                </button>
                <button
                  onClick={() => setChartType('earnings')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    chartType === 'earnings' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Earnings
                </button>
                <button
                  onClick={() => setChartType('winrate')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    chartType === 'winrate' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Win Rate
                </button>
              </div>
            </div>

            <div className="h-48 relative">
              <svg className="w-full h-full" viewBox="0 0 400 150">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="40" height="15" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 15" fill="none" stroke="#374151" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Chart lines */}
                {(() => {
                  const data = performanceData.slice(-10); // Last 10 data points
                  if (data.length < 2) return null;

                  let values;
                  switch (chartType) {
                    case 'portfolio':
                      values = data.map(d => d.memeCoins);
                      break;
                    case 'earnings':
                      values = data.map(d => d.netEarnings);
                      break;
                    case 'winrate':
                      values = data.map(d => d.winRate);
                      break;
                    default:
                      values = data.map(d => d.memeCoins);
                  }

                  const max = Math.max(...values);
                  const min = Math.min(...values);
                  const range = max - min || 1;

                  const points = values.map((value, index) => {
                    const x = (index / (data.length - 1)) * 350 + 25;
                    const y = 120 - ((value - min) / range) * 100;
                    return `${x},${y}`;
                  }).join(' ');

                  const color = chartType === 'portfolio' ? '#3B82F6' :
                               chartType === 'earnings' ? '#10B981' : '#8B5CF6';

                  return (
                    <>
                      {/* Area under the line */}
                      <polygon
                        points={`25,120 ${points} 375,120`}
                        fill={`${color}20`}
                        stroke="none"
                      />
                      {/* Line */}
                      <polyline
                        points={points}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Data points */}
                      {values.map((value, index) => {
                        const x = (index / (data.length - 1)) * 350 + 25;
                        const y = 120 - ((value - min) / range) * 100;
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="3"
                            fill={color}
                            stroke="#1F2937"
                            strokeWidth="1"
                          />
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Chart stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <div className="text-lg font-bold text-green-400">
                  +{performanceData.reduce((sum, d) => sum + d.netEarnings, 0).toFixed(0)}
                </div>
                <div className="text-xs text-gray-400">Total P&L</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">
                  {performanceData.length > 1 ?
                    ((performanceData[performanceData.length - 1].memeCoins - performanceData[0].memeCoins) /
                     performanceData[0].memeCoins * 100).toFixed(1) : 0}%
                </div>
                <div className="text-xs text-gray-400">Portfolio Growth</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-400">
                  {(performanceData.reduce((sum, d) => sum + d.winRate, 0) / performanceData.length).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400">Avg Win Rate</div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Advanced Analytics */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Advanced Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Risk Analysis */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-4">📊 Risk Analysis</h4>
            <div className="space-y-3">
              {(() => {
                const totalPredictions = performanceData.reduce((sum, d) => sum + d.totalPredictions, 0);
                const wins = performanceData.reduce((sum, d) => sum + d.wins, 0);
                const losses = totalPredictions - wins;

                const winRate = totalPredictions > 0 ? (wins / totalPredictions) * 100 : 0;
                const riskRewardRatio = losses > 0 ? wins / losses : 0;
                const volatility = performanceData.length > 1 ?
                  Math.sqrt(performanceData.reduce((sum, d) => sum + Math.pow(d.netEarnings - performanceData.reduce((s, dd) => s + dd.netEarnings, 0) / performanceData.length, 2), 0) / performanceData.length) : 0;

                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Sharpe Ratio:</span>
                      <span className="text-blue-400 font-medium">
                        {totalPredictions > 0 ? (winRate / 100 / (volatility > 0 ? volatility / 100 : 1)).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Risk/Reward:</span>
                      <span className="text-purple-400 font-medium">{riskRewardRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Max Drawdown:</span>
                      <span className="text-red-400 font-medium">
                        -{formatCurrency(Math.max(...performanceData.map(d => d.netEarnings < 0 ? Math.abs(d.netEarnings) : 0)))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Consistency Score:</span>
                      <span className="text-green-400 font-medium">
                        {Math.min(100, winRate * (1 + riskRewardRatio / 10)).toFixed(0)}%
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Predictive Models */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-4">🔮 Predictive Models</h4>
            <div className="space-y-3">
              {(() => {
                const recentPerformance = performanceData.slice(-5);
                const trend = recentPerformance.length > 1 ?
                  recentPerformance[recentPerformance.length - 1].memeCoins > recentPerformance[0].memeCoins ? 'up' : 'down' : 'stable';

                const avgWinRate = performanceData.reduce((sum, d) => sum + d.winRate, 0) / Math.max(1, performanceData.length);
                const prediction = avgWinRate >= 70 ? 'Excellent' :
                                 avgWinRate >= 50 ? 'Good' :
                                 avgWinRate >= 30 ? 'Average' : 'Needs Improvement';

                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Next Week Forecast:</span>
                      <span className={`font-medium ${trend === 'up' ? 'text-green-400' :
                                                    trend === 'down' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {trend === 'up' ? '📈 Bullish' : trend === 'down' ? '📉 Bearish' : '📊 Neutral'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Performance Grade:</span>
                      <span className={`font-medium ${
                        prediction === 'Excellent' ? 'text-emerald-400' :
                        prediction === 'Good' ? 'text-blue-400' :
                        prediction === 'Average' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {prediction}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Best Strategy:</span>
                      <span className="text-purple-400 font-medium">
                        {avgWinRate > 60 ? 'Milestone Reach' : avgWinRate > 40 ? 'Growth Rate' : 'Learning Phase'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Optimal Bet Size:</span>
                      <span className="text-cyan-400 font-medium">
                        {formatCurrency(Math.min(portfolio.memeCoins * 0.05, 50))}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Correlation Matrix */}
        <div className="mt-6">
          <h4 className="text-lg font-medium text-white mb-4">📈 Correlation Analysis</h4>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {performanceData.length > 1 ?
                    (performanceData.reduce((sum, d, i, arr) =>
                      i > 0 ? sum + (d.memeCoins > arr[i-1].memeCoins ? 1 : 0) : sum, 0
                    ) / (performanceData.length - 1) * 100).toFixed(0) : 0}%
                </div>
                <div className="text-xs text-gray-400">Momentum</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {performanceData.length > 0 ?
                    (performanceData.reduce((sum, d) => sum + (d.winRate > 50 ? 1 : 0), 0) / performanceData.length * 100).toFixed(0) : 0}%
                </div>
                <div className="text-xs text-gray-400">Consistency</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {performanceData.length > 1 ?
                    Math.abs(performanceData.reduce((sum, d, i, arr) =>
                      i > 0 ? sum + (d.netEarnings - arr[i-1].netEarnings) : sum, 0
                    ) / (performanceData.length - 1)).toFixed(0) : 0}
                </div>
                <div className="text-xs text-gray-400">Volatility</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {performanceData.length > 0 ?
                    Math.max(...performanceData.map(d => d.memeCoins)) - Math.min(...performanceData.map(d => d.memeCoins)) : 0}
                </div>
                <div className="text-xs text-gray-400">Range</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Market Analysis */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Market Analysis</h3>
        {marketAnalysis.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-400">No market analysis available</p>
            <p className="text-sm text-gray-500">Make more predictions to see subreddit performance!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {marketAnalysis.slice(0, 5).map((analysis, index) => (
              <div key={analysis.subreddit} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-medium">r/{analysis.subreddit}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-400">
                        {analysis.totalPredictions} predictions
                      </span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        analysis.recommendation === 'buy' ? 'bg-green-500/20 text-green-400' :
                        analysis.recommendation === 'sell' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {analysis.recommendation.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-400">
                      {analysis.winRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">Win Rate</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Volatility:</span>
                    <span className={`ml-2 font-medium ${
                      analysis.volatility === 'low' ? 'text-green-400' :
                      analysis.volatility === 'medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {analysis.volatility}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Trend:</span>
                    <span className={`ml-2 font-medium ${
                      analysis.trend === 'rising' ? 'text-green-400' :
                      analysis.trend === 'falling' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {analysis.trend}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Avg Odds:</span>
                    <span className="ml-2 text-white font-medium">
                      {analysis.averageOdds.toFixed(2)}x
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Trading Patterns */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Trading Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg p-4 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-cyan-400 text-sm font-medium">Most Active Hour</span>
              <span className="text-cyan-400">🕐</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {analyticsService.getBettingFrequency(portfolio).mostActiveHour}:00
            </div>
            <div className="text-xs text-gray-400">Peak trading time</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-lg p-4 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-emerald-400 text-sm font-medium">Most Active Day</span>
              <span className="text-emerald-400">📅</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {analyticsService.getBettingFrequency(portfolio).mostActiveDay}
            </div>
            <div className="text-xs text-gray-400">Busiest trading day</div>
          </div>

          <div className="bg-gradient-to-br from-rose-500/20 to-rose-600/20 rounded-lg p-4 border border-rose-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-rose-400 text-sm font-medium">Avg Bet Interval</span>
              <span className="text-rose-400">⚡</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.floor(analyticsService.getBettingFrequency(portfolio).averageInterval)}m
            </div>
            <div className="text-xs text-gray-400">Time between bets</div>
          </div>
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-4">AI Recommendations</h3>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🤖</span>
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">Portfolio Optimization</h4>
                <p className="text-sm text-gray-400 mb-2">
                  Based on your trading patterns, you could improve returns by focusing on high-volatility subreddits during peak hours.
                </p>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                    AI Insight
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📈</span>
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">Staking Opportunity</h4>
                <p className="text-sm text-gray-400 mb-2">
                  With your current win rate, staking could provide {((portfolio.memeCoins * 0.12) / 365).toFixed(0)} MemeCoins daily passive income.
                </p>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                    High Confidence
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎯</span>
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">Betting Strategy</h4>
                <p className="text-sm text-gray-400 mb-2">
                  Your best performing subreddit is {marketAnalysis[0]?.subreddit || 'unknown'}. Consider increasing bet sizes there by 25%.
                </p>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                    Data-Driven
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;

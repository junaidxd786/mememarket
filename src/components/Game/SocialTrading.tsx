import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPortfolio } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { animations } from '../../utils/helpers';

interface SocialTradingProps {
  portfolio: UserPortfolio;
  trendingPosts: any[];
}

const SocialTrading: React.FC<SocialTradingProps> = ({ portfolio, trendingPosts }) => {
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  // Dynamic group management
  const availableGroups = [
    { id: 'beginners', name: 'Beginners Circle', members: 34, winRate: 65, description: 'Perfect for new traders learning the ropes' },
    { id: 'highrollers', name: 'High Rollers Club', members: 12, winRate: 89, description: 'Elite traders with high stakes and bigger rewards' },
    { id: 'strategymasters', name: 'Strategy Masters', members: 8, winRate: 76, description: 'Advanced traders sharing sophisticated strategies' },
    { id: 'aggressive', name: 'Aggressive Traders', members: 15, winRate: 92, description: 'High-risk, high-reward strategies' }
  ];

  const [joinedGroups, setJoinedGroups] = useState<string[]>(['highrollers', 'strategymasters']);
  // Generate dynamic chat messages
  const generateChatMessages = () => {
    const usernames = ['MemeMaster', 'RedditOracle', 'TrendHunter', 'CryptoWizard', 'BetKing'];
    const messages = [
      'Just made a killer bet on that viral post! 📈',
      'Anyone seeing the pattern in r/memes today?',
      'r/gaming is heating up - great opportunities there 🚀',
      'My growth rate prediction just hit! +$150 profit 💰',
      'Sticking with milestone predictions today - safer bets',
      'New user here - any tips for beginners?',
      'That cat video is going to explode! Betting big 🎯',
      'Market analysis shows strong bullish signals 📊'
    ];

    return messages.slice(0, 5).map((message, index) => ({
      username: usernames[index % usernames.length],
      message,
      timeAgo: `${(index + 1) * 3}m ago`
    }));
  };

  const [chatMessages, setChatMessages] = useState<any[]>(generateChatMessages());
  const [chatInput, setChatInput] = useState('');

  // Generate dynamic mock data based on current market conditions
  const generateMockUsers = () => {
    const usernames = ['MemeMaster', 'RedditOracle', 'CryptoWizard', 'TrendHunter', 'BetKing', 'MarketGuru', 'ViralHunter', 'BetPro'];
    return usernames.slice(0, 5).map((username, index) => ({
      id: `user${index + 1}`,
      username,
      winRate: 65 + Math.floor(Math.random() * 25), // 65-90% win rate
      totalTrades: 50 + Math.floor(Math.random() * 150), // 50-200 trades
      followers: 10 + Math.floor(Math.random() * 100) // 10-110 followers
    })).sort((a, b) => b.winRate - a.winRate); // Sort by win rate descending
  };

  const generateMockTrades = () => {
    const actions = ['bought', 'sold'];
    const timeAgos = ['1m ago', '3m ago', '5m ago', '8m ago', '12m ago', '15m ago', '20m ago'];

    // Use real trending posts if available, otherwise use generic titles
    const postTitles = trendingPosts.length > 0
      ? trendingPosts.slice(0, 5).map(post => post.title.substring(0, 50) + (post.title.length > 50 ? '...' : ''))
      : [
          'Amazing cat video goes viral',
          'Breaking news story',
          'Tech innovation breakthrough',
          'Viral meme format',
          'Political discussion thread'
        ];

    return Array.from({ length: 5 }, (_, index) => ({
      userId: `user${(index % 5) + 1}`,
      username: generateMockUsers()[index % 5].username,
      action: actions[Math.floor(Math.random() * actions.length)],
      postTitle: postTitles[index % postTitles.length],
      amount: 10 + Math.floor(Math.random() * 90), // 10-100 MemeCoins
      timeAgo: timeAgos[index % timeAgos.length]
    }));
  };

  const mockUsers = generateMockUsers();
  const mockTrades = generateMockTrades();

  useEffect(() => {
    setRecentTrades(mockTrades);
  }, []);

  const handleFollowUser = (userId: string) => {
    if (followedUsers.includes(userId)) {
      setFollowedUsers(followedUsers.filter(id => id !== userId));
    } else {
      setFollowedUsers([...followedUsers, userId]);
    }
  };

  const handleCopyTrade = (trade: any) => {
    // Mock copy trading functionality
    console.log(`Copying trade: ${trade.action} ${formatCurrency(trade.amount)} on "${trade.postTitle}"`);
    alert(`Trade copied! ${trade.action.toUpperCase()} ${formatCurrency(trade.amount)} on "${trade.postTitle}"`);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage = {
      username: 'You',
      message: chatInput,
      timeAgo: 'now'
    };

    setChatMessages([newMessage, ...chatMessages]);
    setChatInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        {...animations.fadeIn}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Social Trading</h2>
            <p className="text-gray-400">Follow successful traders and copy their strategies</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Following</div>
            <div className="text-lg font-bold text-green-400">{followedUsers.length}</div>
          </div>
        </div>
      </motion.div>

      {/* Top Traders */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Top Traders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockUsers.map((user) => (
            <div key={user.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-medium">{user.username}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-400">{user.totalTrades} trades</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{user.followers} followers</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">{user.winRate}%</div>
                  <div className="text-xs text-gray-400">Win Rate</div>
                </div>
              </div>
              <motion.button
                onClick={() => handleFollowUser(user.id)}
                className={`w-full px-3 py-2 text-sm font-medium rounded transition-colors ${
                  followedUsers.includes(user.id)
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {followedUsers.includes(user.id) ? 'Following' : 'Follow'}
              </motion.button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Trades Feed */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Live Trading Feed</h3>
        <div className="space-y-3">
          {recentTrades.map((trade, index) => (
            <motion.div
              key={index}
              className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  trade.action === 'bought' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <div>
                  <div className="text-white font-medium">{trade.username}</div>
                  <div className="text-sm text-gray-400">
                    {trade.action} {formatCurrency(trade.amount)} • {trade.timeAgo}
                  </div>
                  <div className="text-sm text-gray-300 mt-1 line-clamp-1">
                    "{trade.postTitle}"
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 text-xs rounded ${
                  trade.action === 'bought'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {trade.action.toUpperCase()}
                </div>
                <motion.button
                  onClick={() => handleCopyTrade(trade)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Copy Trade
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Trading Insights */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Trading Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-400 text-lg">📊</span>
            </div>
            <h4 className="text-white font-medium mb-2">Market Sentiment</h4>
            <p className="text-sm text-gray-400">
              68% of followed traders are bullish on meme stocks today
            </p>
            <div className="mt-3">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                Bullish
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-green-400 text-lg">🎯</span>
            </div>
            <h4 className="text-white font-medium mb-2">Hot Subreddits</h4>
            <p className="text-sm text-gray-400">
              r/memes and r/gaming showing highest trading volume
            </p>
            <div className="mt-3">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                High Volume
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trading Groups */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Trading Groups</h3>
        <div className="space-y-4">
          {/* My Groups */}
          <div>
            <h4 className="text-white font-medium mb-3">My Groups</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableGroups.filter(group => joinedGroups.includes(group.id)).map((group, index) => {
                const colors = [
                  { bg: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-500/30', text: 'text-purple-400' },
                  { bg: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/30', text: 'text-blue-400' }
                ];
                const colorScheme = colors[index % colors.length];

                return (
                  <motion.div
                    key={group.id}
                    className={`bg-gradient-to-r ${colorScheme.bg} rounded-lg p-4 border ${colorScheme.border}`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{index === 0 ? '🚀' : '🧠'}</span>
                        <div>
                          <h5 className="text-white font-medium">{group.name}</h5>
                          <p className="text-xs text-gray-400">{group.members} members • {group.winRate}% avg win rate</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Recent: +${(Math.random() * 2000 + 1000).toFixed(0)} today</span>
                      <button className={`${colorScheme.text} hover:opacity-80 text-sm`}>
                        View →
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Join New Groups */}
          <div>
            <h4 className="text-white font-medium mb-3">Join New Groups</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableGroups.filter(group => !joinedGroups.includes(group.id)).slice(0, 2).map((group, index) => {
                const colors = [
                  { bg: 'from-green-500/20 to-green-600/20', border: 'border-green-500/30', button: 'bg-green-500 hover:bg-green-600' },
                  { bg: 'from-red-500/20 to-red-600/20', border: 'border-red-500/30', button: 'bg-red-500 hover:bg-red-600' }
                ];
                const colorScheme = colors[index % colors.length];

                return (
                  <motion.div
                    key={group.id}
                    className={`bg-gradient-to-r ${colorScheme.bg} rounded-lg p-4 border ${colorScheme.border} cursor-pointer`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setJoinedGroups([...joinedGroups, group.id])}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{index === 0 ? '🌱' : '⚡'}</span>
                        <div>
                          <h5 className="text-white font-medium">{group.name}</h5>
                          <p className="text-xs text-gray-400">{group.members} members • {group.winRate}% avg win rate</p>
                        </div>
                      </div>
                      {!joinedGroups.includes(group.id) && (
                        <button className={`px-3 py-1 ${colorScheme.button} text-white text-xs rounded-full transition-colors`}>
                          Join
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-300">{group.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Live Chat */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Live Trading Chat</h3>

        {/* Chat Messages */}
        <div className="bg-gray-900 rounded-lg p-4 mb-4 h-48 overflow-y-auto">
          <div className="space-y-3">
            {chatMessages.map((message, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                  {message.username.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-medium text-sm">{message.username}</span>
                    <span className="text-xs text-gray-400">{message.timeAgo}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{message.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Share your trading insights..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SocialTrading;

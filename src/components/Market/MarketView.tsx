import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import PostCard from './PostCard';
import PriceChart from './PriceChart';
import { GameState, RedditPost, MarketData, Prediction } from '../../types';
import { redditAPI } from '../../services/RedditAPI';
import { marketEngine } from '../../services/MarketEngine';
import { animations, debounce, calculateLevel } from '../../utils/helpers';
import { GAME_CONFIG } from '../../utils/constants';

interface MarketViewProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
}

const MarketView: React.FC<MarketViewProps> = ({ gameState, updateGameState }) => {
  // Handle placing a bet
  const handlePlaceBet = (predictionData: Omit<Prediction, 'id' | 'userId' | 'status' | 'created' | 'resolved'>) => {
    // Check if user has enough coins
    if (predictionData.betAmount > gameState.userPortfolio.memeCoins) {
      alert('Insufficient MemeCoins!');
      return;
    }

    // Find the post data to get URL and title
    const post = gameState.trendingPosts.find(p => p.id === predictionData.postId);
    if (!post) {
      alert('Post data not found!');
      return;
    }

    // Create the prediction
    const prediction: Prediction = {
      ...predictionData,
      id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: gameState.userPortfolio.userId,
      postUrl: post.url,
      postTitle: post.title,
      status: 'active',
      created: Date.now(),
      resolved: null
    };

    // Award experience for placing a bet
    const experienceGained = Math.floor(predictionData.betAmount * 0.05); // 5% of bet amount as experience
    const newExperience = gameState.userPortfolio.experience + experienceGained;
    const { level } = calculateLevel(newExperience);

    // Update user portfolio
    const updatedPortfolio = {
      ...gameState.userPortfolio,
      memeCoins: gameState.userPortfolio.memeCoins - predictionData.betAmount,
      predictions: [...gameState.userPortfolio.predictions, prediction],
      experience: newExperience,
      level
    };

    // Update game state
    updateGameState({
      userPortfolio: updatedPortfolio
    });

    console.log('✅ Bet placed successfully:', prediction);
  };
  const [selectedPost, setSelectedPost] = useState<RedditPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Update market data periodically
  useEffect(() => {
    const updateMarket = () => {
      const updatedData = marketEngine.getAllMarketData();
      updateGameState({ marketData: updatedData });
      setLastUpdate(Date.now());
    };

    // Update immediately and then based on config
    updateMarket();
    const interval = setInterval(updateMarket, GAME_CONFIG.MARKET_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []); // Remove updateGameState from dependencies since it's now memoized

  // Search functionality with debouncing
  const debouncedSearch = useCallback(debounce(async (query: string) => {
    if (!query.trim()) {
      const posts = await redditAPI.getTrendingPosts(undefined, 20);
      updateGameState({ trendingPosts: posts });
      return;
    }

    setIsLoading(true);
    try {
      const posts = await redditAPI.searchPosts(query, 20);
      updateGameState({ trendingPosts: posts });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, 500), [updateGameState]);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handlePostSelect = (post: RedditPost) => {
    setSelectedPost(post);
  };

  const getMarketData = (postId: string): MarketData | null => {
    return gameState.marketData[postId] || null;
  };

  return (
    <div className="space-y-6">
      {/* Market Header */}
      <motion.div
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        {...animations.slideUp}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Trading Floor</h2>
            <p className="text-gray-400">
              Bet on Reddit posts going viral • Last update: {new Date(lastUpdate).toLocaleTimeString()}
            </p>
          </div>

          {gameState.currentSector && (
            <div className="text-right">
              <div className="text-lg font-semibold text-orange-500">
                {gameState.currentSector.emoji} {gameState.currentSector.name}
              </div>
              <div className="text-sm text-gray-400">
                {gameState.currentSector.description}
              </div>
              <div className="text-xs text-green-400">
                {gameState.currentSector.multiplier}x multiplier active
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search Reddit posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          {isLoading && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts List */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div
            className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
            {...animations.fadeIn}
          >
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                Trending Posts {gameState.trendingPosts.length > 0 && `(${gameState.trendingPosts.length})`}
              </h3>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {gameState.trendingPosts.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <div className="text-4xl mb-4">🔄</div>
                  <p>Loading trending posts...</p>
                </div>
              ) : (
                gameState.trendingPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PostCard
                      post={post}
                      marketData={getMarketData(post.id)}
                      isSelected={selectedPost?.id === post.id}
                      onSelect={() => handlePostSelect(post)}
                      onPlaceBet={handlePlaceBet}
                      userPortfolio={gameState.userPortfolio}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Price Chart & Details */}
        <div className="space-y-4">
          {selectedPost ? (
            <motion.div
              className="bg-gray-800 rounded-lg border border-gray-700 p-4"
              {...animations.slideUp}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Price Chart</h3>
                  <p className="text-sm text-gray-400 truncate max-w-[200px]">
                    {selectedPost.title}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <PriceChart
                marketData={getMarketData(selectedPost.id)}
              />
            </motion.div>
          ) : (
            <motion.div
              className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center"
              {...animations.fadeIn}
            >
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-white mb-2">Select a Post</h3>
              <p className="text-gray-400">
                Click on any post to view its price chart and make predictions
              </p>
            </motion.div>
          )}

          {/* Market Stats */}
          <motion.div
            className="bg-gray-800 rounded-lg border border-gray-700 p-4"
            {...animations.fadeIn}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Market Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Active Posts</span>
                <span className="text-white">{gameState.trendingPosts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Market Status</span>
                <span className="text-green-400">🟢 Open</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Next Update</span>
                <span className="text-white">
                  {Math.max(0, 30 - Math.floor((Date.now() - lastUpdate) / 1000))}s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Your Balance</span>
                <span className="text-green-400">
                  ${gameState.userPortfolio.memeCoins.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MarketView;

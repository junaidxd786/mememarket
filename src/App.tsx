import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import MarketView from './components/Market/MarketView';
import Portfolio from './components/Game/Portfolio';
import Leaderboard from './components/Game/Leaderboard';
import Achievements from './components/Game/Achievements';
import Analytics from './components/Game/Analytics';
import SocialTrading from './components/Game/SocialTrading';
import { GameState } from './types';
import { GAME_CONFIG } from './utils/constants';
import { marketEngine } from './services/MarketEngine';
import { redditAPI } from './services/RedditAPI';
import { tournamentService } from './services/TournamentService';
import { animations, storage, calculateLevel, checkDailyReward, awardAchievementBonus, checkLevelUpBonus, checkStreakBonus, checkPerfectPredictionBonus, calculateUnlockedAchievements } from './utils/helpers';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'market' | 'portfolio' | 'leaderboard' | 'achievements' | 'analytics' | 'social'>('market');
  const [gameState, setGameState] = useState<GameState>({
    currentSector: marketEngine.getCurrentSector(),
    marketData: {},
    userPortfolio: (() => {
      const savedPortfolio = storage.get('userPortfolio', null) as any;
      if (savedPortfolio && typeof savedPortfolio === 'object') {
        // Migrate existing portfolio to include new fields
        return {
          userId: savedPortfolio.userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          memeCoins: savedPortfolio.memeCoins ?? GAME_CONFIG.INITIAL_MEMECOINS,
          totalValue: savedPortfolio.totalValue ?? GAME_CONFIG.INITIAL_MEMECOINS,
          predictions: savedPortfolio.predictions || [],
          achievements: savedPortfolio.achievements || [],
          level: savedPortfolio.level ?? 1,
          experience: savedPortfolio.experience ?? 0,
          stakedCoins: savedPortfolio.stakedCoins ?? 0,
          stakingRewards: savedPortfolio.stakingRewards ?? 0,
          lastStakingClaim: savedPortfolio.lastStakingClaim ?? Date.now(),
          tournamentPoints: savedPortfolio.tournamentPoints ?? 0,
          currentTournament: savedPortfolio.currentTournament ?? undefined,
          alertsEnabled: savedPortfolio.alertsEnabled ?? true,
          favoriteSubreddits: savedPortfolio.favoriteSubreddits || [],
          winStreak: savedPortfolio.winStreak ?? 0,
          lossStreak: savedPortfolio.lossStreak ?? 0,
          bestWin: savedPortfolio.bestWin ?? 0,
          perfectDays: savedPortfolio.perfectDays ?? 0
        };
      }
      return {
        userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        memeCoins: GAME_CONFIG.INITIAL_MEMECOINS,
        totalValue: GAME_CONFIG.INITIAL_MEMECOINS,
        predictions: [],
        achievements: [],
        level: 1,
        experience: 0,
        stakedCoins: 0,
        stakingRewards: 0,
        lastStakingClaim: Date.now(),
        tournamentPoints: 0,
        currentTournament: undefined,
        alertsEnabled: true,
        favoriteSubreddits: [],
        winStreak: 0,
        lossStreak: 0,
        bestWin: 0,
        perfectDays: 0
      };
    })(),
    trendingPosts: [],
    isMarketOpen: true,
    nextCrashTime: null
  });

  // Initialize market data on mount
  useEffect(() => {
    const initializeMarket = async () => {
      try {
        console.log('🚀 Initializing r/MemeMarket...');

        // Initialize services
        tournamentService.initializeDefaultTournaments();

        // Fetch trending posts with better error handling
        const posts = await redditAPI.getTrendingPosts(undefined, 20);

        if (posts.length === 0) {
          console.warn('⚠️ No trending posts loaded from Reddit API');
        } else {
          console.log(`✅ Loaded ${posts.length} trending posts`);
        }

        // Initialize market data for each post
        const marketData: Record<string, any> = {};
        posts.forEach(post => {
          const data = marketEngine.initializePostMarket(post);
          marketData[post.id] = data;
        });

        // Resolve any predictions based on updated Reddit data
        let updatedPortfolio = marketEngine.resolvePredictions(gameState.userPortfolio, posts);

        // Check for daily reward
        const dailyReward = checkDailyReward(updatedPortfolio);
        if (dailyReward.eligible) {
          updatedPortfolio = {
            ...updatedPortfolio,
            memeCoins: updatedPortfolio.memeCoins + dailyReward.reward
          };
          console.log(`🎁 Daily reward: +${dailyReward.reward} MemeCoins`);
        }

        // Check for level-up bonus
        const levelUpBonus = checkLevelUpBonus(gameState.userPortfolio.level, updatedPortfolio.level);
        if (levelUpBonus > 0) {
          updatedPortfolio = {
            ...updatedPortfolio,
            memeCoins: updatedPortfolio.memeCoins + levelUpBonus
          };
          console.log(`⬆️ Level up bonus: +${levelUpBonus} MemeCoins`);
        }

        // Check for streak bonuses
        const streakBonus = checkStreakBonus(updatedPortfolio.predictions.filter(p => p.status === 'won').length);
        if (streakBonus > 0) {
          updatedPortfolio = {
            ...updatedPortfolio,
            memeCoins: updatedPortfolio.memeCoins + streakBonus
          };
          console.log(`🔥 Streak bonus: +${streakBonus} MemeCoins`);
        }

        // Check for perfect prediction bonus
        const perfectBonus = checkPerfectPredictionBonus(updatedPortfolio.predictions);
        if (perfectBonus > 0) {
          updatedPortfolio = {
            ...updatedPortfolio,
            memeCoins: updatedPortfolio.memeCoins + perfectBonus
          };
          console.log(`🎪 Perfect prediction bonus: +${perfectBonus} MemeCoins`);
        }

        // Check for newly unlocked achievements and award bonuses
        const existingAchievementIds = gameState.userPortfolio.achievements.map(a => a.id);
        const allAchievements = calculateUnlockedAchievements(updatedPortfolio);
        const newAchievements = allAchievements.filter(a => !existingAchievementIds.includes(a.id));

        if (newAchievements.length > 0) {
          let achievementBonus = 0;
          newAchievements.forEach(achievement => {
            const bonus = awardAchievementBonus(achievement.id);
            achievementBonus += bonus;
            console.log(`🏆 Achievement unlocked: ${achievement.name} (+${bonus} MemeCoins)`);
          });

          updatedPortfolio = {
            ...updatedPortfolio,
            memeCoins: updatedPortfolio.memeCoins + achievementBonus,
            achievements: [...updatedPortfolio.achievements, ...newAchievements]
          };
        }

        setGameState(prev => ({
          ...prev,
          trendingPosts: posts,
          marketData,
          userPortfolio: updatedPortfolio
        }));

        console.log('🎉 Market initialization complete!');
      } catch (error) {
        console.error('❌ Failed to initialize market:', error);

        // Set empty state on error to prevent crashes
        setGameState(prev => ({
          ...prev,
          trendingPosts: [],
          marketData: {}
        }));
      }
    };

    initializeMarket();
  }, []);

  // Save portfolio to localStorage whenever it changes
  useEffect(() => {
    storage.set('userPortfolio', gameState.userPortfolio);
  }, [gameState.userPortfolio]);

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  const navigationItems = [
    { id: 'market', label: 'Market', icon: '📈' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'social', label: 'Social', icon: '👥' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'achievements', label: 'Achievements', icon: '🏅' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-3"
            {...animations.fadeIn}
          >
            <div className="text-3xl">📈</div>
            <div>
              <h1 className="text-2xl font-bold text-orange-500">r/MemeMarket</h1>
              <p className="text-sm text-gray-400">Reddit's Viral Prediction Exchange</p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">MemeCoins</div>
              <div className="text-xl font-bold text-green-400">
                ${gameState.userPortfolio.memeCoins.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Level {calculateLevel(gameState.userPortfolio.experience).level}</div>
              <div className="text-sm text-blue-400">
                {gameState.currentSector ? `${gameState.currentSector.emoji} ${gameState.currentSector.name}` : 'Loading...'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  currentView === item.id
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <motion.div
          key={currentView}
          {...animations.fadeIn}
          className="min-h-[600px]"
        >
          {currentView === 'market' && (
            <MarketView
              gameState={gameState}
              updateGameState={updateGameState}
            />
          )}

          {currentView === 'portfolio' && (
            <Portfolio
              portfolio={gameState.userPortfolio}
              marketData={gameState.marketData}
            />
          )}

          {currentView === 'analytics' && (
            <Analytics
              portfolio={gameState.userPortfolio}
              trendingPosts={gameState.trendingPosts}
            />
          )}

          {currentView === 'social' && (
            <SocialTrading
              portfolio={gameState.userPortfolio}
              trendingPosts={gameState.trendingPosts}
            />
          )}

          {currentView === 'leaderboard' && (
            <Leaderboard
              userPortfolio={gameState.userPortfolio}
              marketData={gameState.marketData}
              trendingPosts={gameState.trendingPosts}
            />
          )}

          {currentView === 'achievements' && (
            <Achievements
              userPortfolio={gameState.userPortfolio}
            />
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <div>
              <p>Built for Reddit Devvit Hackathon 2025</p>
              <p className="text-xs mt-1">Market updates every 30 seconds</p>
            </div>
            <div className="text-right">
              <p>Next sector rotation: {gameState.currentSector ? '24h' : 'Loading...'}</p>
              <p className="text-xs mt-1">Real-time Reddit integration</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

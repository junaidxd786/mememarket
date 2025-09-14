import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { UserPortfolio } from '../../types';
import { animations, calculateUnlockedAchievements, calculateAchievementProgress } from '../../utils/helpers';
import { ACHIEVEMENTS } from '../../utils/constants';

interface AchievementsProps {
  userPortfolio: UserPortfolio;
}

const Achievements: React.FC<AchievementsProps> = ({ userPortfolio }) => {
  // Calculate real achievements and progress based on user data
  const achievements = useMemo(() =>
    calculateUnlockedAchievements(userPortfolio),
    [userPortfolio]
  );

  const progressData = useMemo(() =>
    calculateAchievementProgress(userPortfolio),
    [userPortfolio]
  );

  const unlockedIds = achievements.map(a => a.id);
  const allAchievements = Object.values(ACHIEVEMENTS);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-purple-500/20 to-pink-500/20 border-purple-500/50';
      case 'epic': return 'from-blue-500/20 to-purple-500/20 border-blue-500/50';
      case 'rare': return 'from-green-500/20 to-blue-500/20 border-green-500/50';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/50';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-purple-400';
      case 'epic': return 'text-blue-400';
      case 'rare': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        {...animations.slideUp}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Achievements</h2>
        <p className="text-gray-400">
          Unlock achievements by trading, winning predictions, and exploring the market.
          {achievements.length > 0 && ` You've unlocked ${achievements.length} so far!`}
        </p>
      </motion.div>

      {/* Achievement Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        {...animations.fadeIn}
      >
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
          <div className="text-2xl font-bold text-orange-400">{achievements.length}</div>
          <div className="text-sm text-gray-400">Unlocked</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {allAchievements.length - achievements.length}
          </div>
          <div className="text-sm text-gray-400">Remaining</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {achievements.filter(a => a.rarity === 'legendary').length}
          </div>
          <div className="text-sm text-gray-400">Legendary</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
          <div className="text-2xl font-bold text-green-400">
            {Math.round((achievements.length / allAchievements.length) * 100)}%
          </div>
          <div className="text-sm text-gray-400">Complete</div>
        </div>
      </motion.div>

      {/* Unlocked Achievements */}
      {achievements.length > 0 && (
        <motion.div
          className="bg-gray-800 rounded-lg border border-gray-700"
          {...animations.fadeIn}
        >
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">
              Unlocked Achievements ({achievements.length})
            </h3>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                className={`bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-lg p-4 border`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm">{achievement.name}</h4>
                    <p className="text-gray-300 text-xs mt-1">{achievement.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs font-medium ${getRarityTextColor(achievement.rarity)}`}>
                        {achievement.rarity.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Available Achievements */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700"
        {...animations.fadeIn}
      >
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            Available Achievements ({allAchievements.length - achievements.length})
          </h3>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allAchievements
            .filter(achievement => !unlockedIds.includes(achievement.id))
            .map((achievement, index) => (
              <motion.div
                key={achievement.id}
                className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl opacity-50">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-gray-400 font-semibold text-sm">{achievement.name}</h4>
                    <p className="text-gray-500 text-xs mt-1">{achievement.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs font-medium ${getRarityTextColor(achievement.rarity)} opacity-75`}>
                        {achievement.rarity.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">Locked</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </motion.div>

      {/* Achievement Progress */}
      <motion.div
        className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        {...animations.fadeIn}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Achievement Progress</h3>

        <div className="space-y-4">
          {[
            {
              name: 'First Trade',
              description: 'Make your first prediction',
              progress: progressData.firstTrade.progress,
              current: progressData.firstTrade.current,
              target: progressData.firstTrade.target,
              icon: '🎯'
            },
            {
              name: 'Winning Streak',
              description: 'Win 5 predictions in a row',
              progress: progressData.winningStreak.progress,
              current: progressData.winningStreak.current,
              target: progressData.winningStreak.target,
              icon: '🔥'
            },
            {
              name: 'High Roller',
              description: 'Bet 1000 MemeCoins in a single prediction',
              progress: progressData.highRoller.progress,
              current: progressData.highRoller.current,
              target: progressData.highRoller.target,
              icon: '💰'
            },
            {
              name: 'Market Veteran',
              description: 'Complete 100 predictions',
              progress: progressData.marketVeteran.progress,
              current: progressData.marketVeteran.current,
              target: progressData.marketVeteran.target,
              icon: '🏆'
            },
            {
              name: 'Perfect Predictor',
              description: 'Get 10 predictions right in a row',
              progress: progressData.perfectPredictor.progress,
              current: progressData.perfectPredictor.current,
              target: progressData.perfectPredictor.target,
              icon: '🎪'
            }
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="text-2xl">{item.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-medium text-sm">{item.name}</span>
                  <span className="text-gray-400 text-sm">
                    {item.current}/{item.target} ({item.progress.toFixed(0)}%)
                  </span>
                </div>
                <p className="text-gray-400 text-xs mb-2">{item.description}</p>
                <div className="progress-bar">
                  <div className={`progress-fill ${
                    item.progress >= 100 ? 'progress-fill-green' : 'progress-fill-orange'
                  } progress-${Math.min(Math.round(item.progress / 5) * 5, 100)}`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Achievements;

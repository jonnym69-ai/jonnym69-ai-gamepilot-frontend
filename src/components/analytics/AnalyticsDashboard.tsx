import React from 'react';
import { motion } from 'framer-motion';
import { useRealtimeAnalytics } from '../../hooks/useUserProgress';
import { useAchievements } from '../../hooks/useUserProgress';
import { useTitles, equipTitle } from '../../hooks/useUserProgress';

export function AnalyticsDashboard() {
  const analytics = useRealtimeAnalytics();
  const { getTitles, equipTitle } = useTitles();
  const titles = getTitles();
  const achievements = useAchievements();

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).format(date);
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const unlockedTitles = titles.filter(t => t.unlocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Analytics Overview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              📊 Gaming Analytics
            </h2>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Total Playtime</h3>
                <p className="text-3xl font-bold text-gaming-primary">{formatTime(analytics.totalPlaytime)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white/70 mb-1">Total Sessions</h4>
                  <p className="text-2xl font-bold text-gaming-secondary">{analytics.totalSessions}</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white/70 mb-1">Games Played</h4>
                  <p className="text-2xl font-bold text-gaming-accent">{analytics.gamesPlayed}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white/70 mb-1">Avg Session</h4>
                  <p className="text-xl font-bold text-gaming-primary">{formatTime(analytics.averageSessionLength)}</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white/70 mb-1">Peak Hour</h4>
                  <p className="text-xl font-bold text-gaming-secondary">{analytics.peakGamingHour}:00</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white/70 mb-2">Top Genres & Moods</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Most Played:</span>
                    <span className="text-gaming-accent font-semibold">{analytics.mostPlayedGenre}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Favorite Mood:</span>
                    <span className="text-gaming-primary font-semibold">{analytics.mostPlayedMood}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white/70 mb-2">Last Active</h4>
                <p className="text-white">{formatDate(analytics.lastActiveDate)}</p>
              </div>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              🏆 Achievements
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <span className="text-white/70">Progress</span>
                <span className="text-gaming-accent font-bold">
                  {unlockedAchievements.length} / {achievements.length}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={`p-4 rounded-lg border-2 ${
                      achievement.unlocked 
                        ? 'bg-gaming-primary/20 border-gaming-primary/50' 
                        : 'bg-white/5 border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          achievement.unlocked ? 'text-gaming-primary' : 'text-white/60'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm ${
                          achievement.unlocked ? 'text-white/80' : 'text-white/50'
                        }`}>
                          {achievement.description}
                        </p>
                        {achievement.unlocked && (
                          <p className="text-xs text-gaming-primary mt-1">
                            Unlocked {formatDate(achievement.unlockedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Titles */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              👑 Identity Titles
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <span className="text-white/70">Progress</span>
                <span className="text-gaming-accent font-bold">
                  {unlockedTitles.length} / {titles.length}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {titles.map((title, index) => (
                  <motion.div
                    key={title.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    onClick={() => title.unlocked && equipTitle(title.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      title.unlocked 
                        ? 'bg-gradient-to-r ' + title.color + ' border-white/30 hover:scale-105' 
                        : 'bg-white/5 border-white/20 opacity-60'
                    } ${title.equipped ? 'ring-2 ring-gaming-accent' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{title.icon}</div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          title.unlocked ? 'text-white' : 'text-white/40'
                        }`}>
                          {title.name}
                        </h3>
                        <p className={`text-sm ${
                          title.unlocked ? 'text-white/80' : 'text-white/30'
                        }`}>
                          {title.description}
                        </p>
                        {title.unlocked && (
                          <div className="mt-2 space-x-2">
                            <button
                              onClick={() => equipTitle(title.id)}
                              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                                title.equipped 
                                  ? 'bg-gaming-accent text-white' 
                                  : 'bg-white/20 text-gaming-accent hover:bg-white/30'
                              }`}
                            >
                              {title.equipped ? 'Equipped' : 'Equip'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

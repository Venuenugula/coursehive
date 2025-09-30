import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { 
  Award, 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Flame, 
  Users, 
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Crown,
  Medal,
  Badge,
  Gift,
  Sparkles,
  BarChart3,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Gamification = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch gamification stats
  const { data: stats, isLoading: statsLoading } = useQuery(
    'gamification-stats',
    () => axios.get('/api/gamification/stats').then(res => res.data),
    { enabled: !!user }
  );

  // Fetch leaderboard
  const { data: leaderboardData } = useQuery(
    'leaderboard',
    () => axios.get('/api/gamification/leaderboard').then(res => res.data)
  );

  // Fetch challenges
  const { data: challengesData } = useQuery(
    'challenges',
    () => axios.get('/api/gamification/challenges').then(res => res.data),
    { enabled: !!user }
  );

  // Check badges mutation
  const checkBadgesMutation = useMutation(
    () => axios.post('/api/gamification/check-badges'),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('gamification-stats');
        if (response.data.newBadges.length > 0) {
          // Show notification for new badges
          console.log('New badges earned:', response.data.newBadges);
        }
      }
    }
  );

  // Generate daily challenge mutation
  const generateChallengeMutation = useMutation(
    () => axios.post('/api/gamification/challenges/daily'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('challenges');
      }
    }
  );

  // Update challenge progress mutation
  const updateChallengeMutation = useMutation(
    ({ challengeId, increment }) => axios.patch(`/api/gamification/challenges/${challengeId}/progress`, { increment }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('challenges');
      }
    }
  );

  useEffect(() => {
    if (user) {
      checkBadgesMutation.mutate();
    }
  }, [user]);

  const getBadgeIcon = (badgeType) => {
    const icons = {
      streak_7: <Flame className="h-6 w-6" />,
      streak_30: <Crown className="h-6 w-6" />,
      streak_100: <Medal className="h-6 w-6" />,
      test_master: <Target className="h-6 w-6" />,
      perfect_score: <Star className="h-6 w-6" />,
      speed_demon: <Zap className="h-6 w-6" />,
      knowledge_seeker: <Award className="h-6 w-6" />,
      skill_builder: <Badge className="h-6 w-6" />,
      explorer: <Trophy className="h-6 w-6" />,
      forum_contributor: <Users className="h-6 w-6" />,
      helpful_member: <Gift className="h-6 w-6" />,
      mentor: <Crown className="h-6 w-6" />,
      early_adopter: <Sparkles className="h-6 w-6" />,
      content_creator: <Award className="h-6 w-6" />,
      top_performer: <Trophy className="h-6 w-6" />
    };
    return icons[badgeType] || <Award className="h-6 w-6" />;
  };

  const getBadgeColor = (badgeType) => {
    const colors = {
      streak_7: 'text-orange-600 bg-orange-100',
      streak_30: 'text-red-600 bg-red-100',
      streak_100: 'text-purple-600 bg-purple-100',
      test_master: 'text-blue-600 bg-blue-100',
      perfect_score: 'text-yellow-600 bg-yellow-100',
      speed_demon: 'text-green-600 bg-green-100',
      knowledge_seeker: 'text-indigo-600 bg-indigo-100',
      skill_builder: 'text-pink-600 bg-pink-100',
      explorer: 'text-teal-600 bg-teal-100',
      forum_contributor: 'text-cyan-600 bg-cyan-100',
      helpful_member: 'text-emerald-600 bg-emerald-100',
      mentor: 'text-amber-600 bg-amber-100',
      early_adopter: 'text-violet-600 bg-violet-100',
      content_creator: 'text-rose-600 bg-rose-100',
      top_performer: 'text-gold-600 bg-gold-100'
    };
    return colors[badgeType] || 'text-gray-600 bg-gray-100';
  };

  const getLevelColor = (level) => {
    const colors = {
      1: 'text-gray-600 bg-gray-100',
      2: 'text-green-600 bg-green-100',
      3: 'text-blue-600 bg-blue-100',
      4: 'text-purple-600 bg-purple-100',
      5: 'text-yellow-600 bg-yellow-100',
      6: 'text-orange-600 bg-orange-100',
      7: 'text-red-600 bg-red-100',
      8: 'text-pink-600 bg-pink-100'
    };
    return colors[level] || 'text-gray-600 bg-gray-100';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const stats = stats || {};
  const leaderboard = leaderboardData?.leaderboard || [];
  const challenges = challengesData?.challenges || [];

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gamification data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="coursehive-card p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold coursehive-primary mb-3 flex items-center">
                  <Trophy className="h-12 w-12 mr-4 text-yellow-500" />
                  Gamification Hub
                </h1>
                <p className="text-xl text-dark-gray">
                  Track your progress, earn badges, and climb the leaderboard
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-gray mb-1">Current Level</div>
                <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${getLevelColor(stats.level?.level)}`}>
                  {stats.level?.name || 'Beginner'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="coursehive-card p-4">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'badges', label: 'Badges', icon: Award },
                { id: 'challenges', label: 'Challenges', icon: Target },
                { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white text-coursehive-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Level Progress */}
              <div className="coursehive-card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Crown className="h-6 w-6 mr-2 text-yellow-500" />
                  Level Progress
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{stats.level?.name || 'Beginner'}</p>
                      <p className="text-sm text-gray-600">Level {stats.level?.level || 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{stats.totalPoints || 0}</p>
                      <p className="text-sm text-gray-600">Total Points</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(((stats.totalPoints || 0) / (stats.level?.points || 500)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {stats.pointsToNextLevel || 0} points to next level
                  </p>
                </div>
              </div>

              {/* Streak */}
              <div className="coursehive-card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Flame className="h-6 w-6 mr-2 text-orange-500" />
                  Learning Streak
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-2">
                      {stats.streak?.current || 0}
                    </div>
                    <p className="text-gray-600">Current Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {stats.streak?.longest || 0}
                    </div>
                    <p className="text-gray-600">Longest Streak</p>
                  </div>
                </div>
              </div>

              {/* Recent Badges */}
              <div className="coursehive-card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Award className="h-6 w-6 mr-2 text-blue-500" />
                  Recent Badges
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {stats.badges?.slice(0, 6).map((badge, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${getBadgeColor(badge.type)}`}>
                        {getBadgeIcon(badge.type)}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{badge.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(badge.earnedAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Leaderboard Position */}
              <div className="coursehive-card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Your Ranking
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    #{stats.leaderboardRank || 'N/A'}
                  </div>
                  <p className="text-gray-600">Global Ranking</p>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Leaderboard Score</p>
                    <p className="text-lg font-bold text-gray-900">{stats.leaderboardScore || 0}</p>
                  </div>
                </div>
              </div>

              {/* Next Badge */}
              {stats.nextBadge && (
                <div className="coursehive-card p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-green-500" />
                    Next Badge
                  </h3>
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${getBadgeColor(stats.nextBadge.type)}`}>
                      {getBadgeIcon(stats.nextBadge.type)}
                    </div>
                    <p className="font-medium text-gray-900 mb-2">{stats.nextBadge.name}</p>
                    <p className="text-sm text-gray-600 mb-3">{stats.nextBadge.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${stats.nextBadge.progress || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{stats.nextBadge.progress || 0}% complete</p>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="coursehive-card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => generateChallengeMutation.mutate()}
                    disabled={generateChallengeMutation.isLoading}
                    className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Generate Daily Challenge
                  </button>
                  <button
                    onClick={() => checkBadgesMutation.mutate()}
                    disabled={checkBadgesMutation.isLoading}
                    className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Check for New Badges
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="coursehive-card p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="h-6 w-6 mr-2 text-yellow-500" />
              All Badges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.badges?.map((badge, index) => (
                <div key={index} className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${getBadgeColor(badge.type)}`}>
                      {getBadgeIcon(badge.type)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{badge.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Earned:</span>
                      <span className="font-medium">{formatDate(badge.earnedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {/* Active Challenges */}
            <div className="coursehive-card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="h-6 w-6 mr-2 text-blue-500" />
                Active Challenges
              </h2>
              <div className="space-y-4">
                {challenges.filter(c => !c.completed).map((challenge) => (
                  <div key={challenge._id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{challenge.icon}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                          <p className="text-sm text-gray-600">{challenge.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{challenge.points}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${challenge.getProgressPercentage()}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {challenge.current}/{challenge.target} ({challenge.getProgressPercentage()}%)
                        </p>
                      </div>
                      <button
                        onClick={() => updateChallengeMutation.mutate({ challengeId: challenge._id, increment: 1 })}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Update Progress
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Challenges */}
            <div className="coursehive-card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
                Completed Challenges
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.filter(c => c.completed).map((challenge) => (
                  <div key={challenge._id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{challenge.icon}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                          <p className="text-sm text-gray-600">Completed {formatDate(challenge.completedAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{challenge.points}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="coursehive-card p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
              Global Leaderboard
            </h2>
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div key={user.userId} className={`flex items-center space-x-4 p-4 rounded-lg ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200' : 'bg-gray-50'
                }`}>
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">
                      {user.totalPoints || 0} points • {user.streaks?.current || 0} day streak
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{user.leaderboardScore || 0}</div>
                    <div className="text-xs text-gray-500">score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gamification;

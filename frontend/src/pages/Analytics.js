import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target,
  Award,
  BookOpen,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Brain,
  Flame,
  Eye,
  Star,
  Zap,
  ExternalLink,
  Users
} from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('week');

  // Fetch user analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    'user-analytics',
    () => axios.get('/api/analytics/dashboard').then(res => res.data),
    { refetchInterval: 60000 }
  );

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery(
    'leaderboard',
    () => axios.get('/api/analytics/leaderboard').then(res => res.data),
    { refetchInterval: 30000 }
  );

  // Fetch user's link analytics
  const { data: linkAnalytics } = useQuery(
    'link-analytics',
    () => axios.get('/api/users/stats').then(res => res.data),
    { enabled: !!user }
  );

  // Fetch trending content analytics
  const { data: trendingAnalytics } = useQuery(
    'trending-analytics',
    () => axios.get('/api/links/trending?limit=10').then(res => res.data)
  );

  // Fetch user's skill progress
  const { data: skillProgress } = useQuery(
    'skill-progress',
    () => axios.get('/api/users/skills').then(res => res.data),
    { enabled: !!user }
  );

  if (analyticsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const analytics = analyticsData?.analytics || {};
  const weeklyStats = analytics.weeklyStats || {};
  const monthlyStats = analytics.monthlyStats || {};
  const recentAttempts = analyticsData?.recentAttempts || [];
  const leaderboard = leaderboardData?.leaderboard || [];

  const stats = [
    { 
      label: 'Tests Completed', 
      value: weeklyStats.testsCompleted || 0, 
      change: '+12%',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      label: 'Study Time', 
      value: `${Math.round((weeklyStats.timeSpent || 0) / 60)}h`, 
      change: '+8%',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      label: 'Average Accuracy', 
      value: `${weeklyStats.averageAccuracy || 0}%`, 
      change: '+5%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    { 
      label: 'Current Streak', 
      value: `${analytics.streaks?.current || 0} days`, 
      change: '+3',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    { 
      label: 'Links Explored', 
      value: linkAnalytics?.totalClicks || 0, 
      change: '+15%',
      icon: Eye,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    { 
      label: 'Skills Learned', 
      value: linkAnalytics?.skillsLearned || 0, 
      change: '+2 this week',
      icon: Brain,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="card p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Track your learning progress and performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="input text-sm font-medium bg-white border-blue-200 focus:border-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6 group hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                <p className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{stat.value}</p>
                <p className="text-sm text-green-600 font-semibold">{stat.change}</p>
              </div>
              <div className={`p-4 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Recent Activity
            </h2>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {recentAttempts.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent test attempts</p>
              </div>
            ) : (
              recentAttempts.map((attempt, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  {getStatusIcon(attempt.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {attempt.testId?.title || 'Test Attempt'}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(attempt.completedAt || attempt.createdAt)}</p>
                  </div>
                  {attempt.percentage && (
                    <div className="text-sm font-semibold text-gray-900 bg-blue-50 px-2 py-1 rounded">
                      {attempt.percentage}%
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-500" />
              Leaderboard
            </h2>
            <div className="text-sm text-gray-500">Top performers</div>
          </div>
          <div className="space-y-3">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No leaderboard data available</p>
              </div>
            ) : (
              leaderboard.slice(0, 5).map((user, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex-shrink-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                      'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">Rank #{user.leaderboardRank}</p>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 bg-green-50 px-2 py-1 rounded">
                    {user.streaks?.current || 0} days
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Skill Progress Section */}
      {skillProgress && skillProgress.length > 0 && (
        <div className="mt-8 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-500" />
              Skill Progress
            </h2>
            <span className="text-sm text-gray-500 bg-purple-50 px-3 py-1 rounded-full">{skillProgress.length} skills tracked</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillProgress.slice(0, 6).map((skill, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{skill.skill}</h3>
                  <span className="text-sm font-bold text-purple-600 bg-white px-2 py-1 rounded">{skill.confidence}%</span>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    skill.level === 'Beginner' ? 'bg-green-100 text-green-600' :
                    skill.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-600' :
                    skill.level === 'Advanced' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {skill.level}
                  </span>
                  <span className="text-xs text-gray-500">
                    Updated {new Date(skill.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-indigo-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${skill.confidence}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Content Analytics */}
      {trendingAnalytics && trendingAnalytics.length > 0 && (
        <div className="mt-8 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
              Trending Content Analytics
            </h2>
            <span className="text-sm text-gray-500 bg-orange-50 px-3 py-1 rounded-full">Top trending resources</span>
          </div>
          <div className="space-y-3">
            {trendingAnalytics.slice(0, 5).map((link, index) => (
              <div key={link._id} className="flex items-center space-x-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm truncate">{link.title}</h3>
                  <p className="text-xs text-gray-600 truncate">{link.summary}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                    <Eye className="h-3 w-3" />
                    <span>{link.clickCount}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    link.difficulty === 'Beginner' ? 'bg-green-100 text-green-600' :
                    link.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {link.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Chart Placeholder */}
      <div className="mt-8 card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
            Performance Overview
          </h2>
          <div className="text-sm text-gray-500">Track your progress over time</div>
        </div>
        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Performance chart will be displayed here</p>
            <p className="text-sm text-gray-500">Track your progress over time</p>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {analytics.aiInsights && (
        <div className="mt-8 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-500" />
              AI Learning Insights
            </h2>
            <div className="text-sm text-gray-500 bg-purple-50 px-3 py-1 rounded-full">Powered by AI</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Strong Topics
              </h3>
              <div className="space-y-3">
                {analytics.aiInsights.strongTopics?.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200">
                    <span className="text-sm font-medium text-green-800">{topic.topic}</span>
                    <span className="text-sm text-green-600 bg-white px-2 py-1 rounded font-semibold">{topic.accuracy}%</span>
                  </div>
                )) || <p className="text-gray-500 text-sm">No strong topics identified yet</p>}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                Areas for Improvement
              </h3>
              <div className="space-y-3">
                {analytics.aiInsights.weakTopics?.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200">
                    <span className="text-sm font-medium text-red-800">{topic.topic}</span>
                    <span className="text-sm text-red-600 bg-white px-2 py-1 rounded font-semibold">{topic.accuracy}%</span>
                  </div>
                )) || <p className="text-gray-500 text-sm">No weak areas identified yet</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
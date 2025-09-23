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
  Calendar
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Analytics Dashboard
                </h1>
                <p className="text-xl text-gray-600">
                  Track your learning progress and performance
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                </div>
                <div className={`p-4 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentAttempts.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent test attempts</p>
                </div>
              ) : (
                recentAttempts.map((attempt, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    {getStatusIcon(attempt.status)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {attempt.testId?.title || 'Test Attempt'}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(attempt.completedAt || attempt.createdAt)}</p>
                    </div>
                    {attempt.percentage && (
                      <div className="text-sm font-semibold text-gray-900">
                        {attempt.percentage}%
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Leaderboard</h2>
              <Award className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No leaderboard data available</p>
                </div>
              ) : (
                leaderboard.slice(0, 5).map((user, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">Rank #{user.leaderboardRank}</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {user.streaks?.current || 0} days
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Performance Overview</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Performance chart will be displayed here</p>
              <p className="text-sm text-gray-500">Track your progress over time</p>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {analytics.aiInsights && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">AI Learning Insights</h2>
              <Award className="h-5 w-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Strong Topics</h3>
                <div className="space-y-2">
                  {analytics.aiInsights.strongTopics?.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">{topic.topic}</span>
                      <span className="text-sm text-green-600">{topic.accuracy}%</span>
                    </div>
                  )) || <p className="text-gray-500 text-sm">No strong topics identified yet</p>}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Areas for Improvement</h3>
                <div className="space-y-2">
                  {analytics.aiInsights.weakTopics?.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-red-800">{topic.topic}</span>
                      <span className="text-sm text-red-600">{topic.accuracy}%</span>
                    </div>
                  )) || <p className="text-gray-500 text-sm">No weak areas identified yet</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
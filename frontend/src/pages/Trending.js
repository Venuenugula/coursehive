import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  TrendingUp, 
  Clock, 
  Eye, 
  Star, 
  Bookmark, 
  ExternalLink,
  Filter,
  Calendar,
  Zap,
  Flame,
  BarChart3,
  Users,
  Award,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Trending = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('24h');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');

  // Fetch trending links
  const { data: trendingData, isLoading: trendingLoading } = useQuery(
    ['trending', timeframe],
    () => axios.get(`/api/links/trending/${timeframe}`).then(res => res.data),
    { refetchInterval: 60000 } // Refetch every minute
  );

  // Fetch trending tests
  const { data: trendingTests } = useQuery(
    'trending-tests',
    () => axios.get('/api/tests/trending').then(res => res.data)
  );

  // Fetch leaderboard
  const { data: leaderboardData } = useQuery(
    ['leaderboard', timeframe],
    () => axios.get(`/api/gamification/leaderboard?timeframe=${timeframe}`).then(res => res.data)
  );

  // Fetch trending categories
  const { data: trendingCategories } = useQuery(
    'trending-categories',
    () => axios.get('/api/analytics/trending-categories').then(res => res.data)
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Zap className="h-4 w-4" />;
      case 'article': return <Target className="h-4 w-4" />;
      case 'course': return <Bookmark className="h-4 w-4" />;
      case 'tutorial': return <ExternalLink className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const formatTimeframe = (tf) => {
    switch (tf) {
      case '1h': return 'Last Hour';
      case '24h': return 'Last 24 Hours';
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      default: return 'Last 24 Hours';
    }
  };

  const trendingLinks = trendingData || [];
  const trendingTests = trendingTests?.tests || [];
  const leaderboard = leaderboardData?.leaderboard || [];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="coursehive-card p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold coursehive-primary mb-3 flex items-center">
                  <Flame className="h-12 w-12 mr-4 text-orange-500" />
                  Trending Now
                </h1>
                <p className="text-xl text-dark-gray">
                  Discover what's hot and trending in the learning community
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-gray mb-1">Last Updated</div>
                <div className="text-lg font-semibold text-charcoal">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="mb-8">
          <div className="coursehive-card p-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-700">Timeframe:</span>
              </div>
              <div className="flex space-x-2">
                {['1h', '24h', '7d', '30d'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      timeframe === tf
                        ? 'bg-coursehive-primary text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {formatTimeframe(tf)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Trending Links */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trending Learning Resources */}
            <div className="coursehive-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-orange-500" />
                  Trending Learning Resources
                </h2>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="Programming">Programming</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
              </div>

              {trendingLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 bg-gray-100 rounded-lg animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : trendingLinks.length > 0 ? (
                <div className="space-y-4">
                  {trendingLinks.map((link, index) => (
                    <div key={link._id} className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              {getContentTypeIcon(link.contentType)}
                              <span className="text-sm text-gray-500 capitalize">{link.contentType}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                              {link.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {link.summary || link.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Eye className="h-4 w-4" />
                                <span>{link.clickCount}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <TrendingUp className="h-4 w-4" />
                                <span>{Math.round(link.trendingScore || 0)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4" />
                                <span>{Math.round(link.qualityScore || 0)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(link.difficulty)}`}>
                            {link.difficulty}
                          </span>
                          <button
                            onClick={() => window.open(link.url, '_blank')}
                            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No trending content</h3>
                  <p className="text-gray-500">Check back later for trending learning resources!</p>
                </div>
              )}
            </div>

            {/* Trending Tests */}
            {trendingTests.length > 0 && (
              <div className="coursehive-card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2 text-blue-500" />
                  Trending Tests
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trendingTests.slice(0, 4).map((test, index) => (
                    <div key={test._id} className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{test.title}</h3>
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{test.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty || 'Medium')}`}>
                          {test.difficulty || 'Medium'}
                        </span>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          <span>{test.stats?.totalAttempts || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Leaderboard & Stats */}
          <div className="space-y-8">
            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="coursehive-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  Top Performers
                </h2>
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((user, index) => (
                    <div key={user.userId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-sm text-gray-500">
                          {user.totalPoints || 0} points • {user.streaks?.current || 0} day streak
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">{user.leaderboardScore || 0}</div>
                          <div className="text-xs text-gray-500">score</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Categories */}
            {trendingCategories && (
              <div className="coursehive-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-500" />
                  Hot Categories
                </h2>
                <div className="space-y-3">
                  {trendingCategories.slice(0, 5).map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {category.count} resources
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="coursehive-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                Quick Stats
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Resources</span>
                  <span className="font-bold text-gray-900">{trendingLinks.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-bold text-gray-900">{leaderboard.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Timeframe</span>
                  <span className="font-bold text-gray-900">{formatTimeframe(timeframe)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-bold text-gray-900">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;

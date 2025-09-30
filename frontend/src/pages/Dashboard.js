import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  TrendingUp, 
  Star, 
  Clock, 
  Eye, 
  Users, 
  Award,
  Target,
  BarChart3,
  Calendar,
  Zap,
  Bookmark,
  ExternalLink,
  ChevronRight,
  Activity,
  Brain,
  Lightbulb,
  ArrowUpRight,
  Flame
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState('week');

  // Fetch user analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    'user-analytics',
    () => axios.get('/api/analytics/dashboard').then(res => res.data),
    { refetchInterval: 60000 }
  );

  // Fetch personalized recommendations
  const { data: recommendations } = useQuery(
    'recommendations',
    () => axios.get('/api/links/recommendations').then(res => res.data),
    { enabled: !!user, refetchInterval: 300000 } // Refetch every 5 minutes
  );

  // Fetch trending links
  const { data: trendingLinks } = useQuery(
    'trending-links',
    () => axios.get('/api/links/trending?limit=6').then(res => res.data),
    { refetchInterval: 120000 } // Refetch every 2 minutes
  );

  // Fetch user's recent activity
  const { data: recentActivity } = useQuery(
    'recent-activity',
    () => axios.get('/api/users/activity').then(res => res.data),
    { enabled: !!user }
  );

  // Fetch user's bookmarks
  const { data: bookmarks } = useQuery(
    'user-bookmarks',
    () => axios.get('/api/users/bookmarks').then(res => res.data),
    { enabled: !!user }
  );

  // Click tracking mutation
  const clickMutation = useMutation(
    ({ linkId, timeSpent }) => axios.post(`/api/links/${linkId}/click`, { timeSpent })
  );

  const handleLinkClick = async (linkId) => {
    try {
      await clickMutation.mutateAsync({ linkId, timeSpent: 0 });
      window.open(linkId, '_blank');
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

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
      case 'video': return <BookOpen className="h-4 w-4" />;
      case 'article': return <BookOpen className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'tutorial': return <Zap className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const stats = [
    {
      label: 'Total Clicks',
      value: analyticsData?.totalClicks || 0,
      change: '+12%',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Learning Streak',
      value: `${analyticsData?.streakDays || 0} days`,
      change: '+3 days',
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      label: 'Skills Learned',
      value: analyticsData?.skillsLearned || 0,
      change: '+2 this week',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Time Spent',
      value: `${Math.round((analyticsData?.totalTimeSpent || 0) / 60)} min`,
      change: '+25 min',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  const quickActions = [
    {
      title: 'Learning Resources',
      description: 'Explore educational content',
      icon: BookOpen,
      link: '/links',
      color: 'bg-blue-500'
    },
    {
      title: 'Mock Tests',
      description: 'Practice and assess',
      icon: Target,
      link: '/tests',
      color: 'bg-green-500'
    },
    {
      title: 'AI Tutor',
      description: 'Get personalized help',
      icon: Brain,
      link: '/ai-tutor',
      color: 'bg-purple-500'
    },
    {
      title: 'Analytics',
      description: 'Track your progress',
      icon: BarChart3,
      link: '/analytics',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="coursehive-card p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, <span className="font-medium text-blue-600">{user?.name || 'User'}</span>!
                  Here's your learning progress overview.
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-gray mb-1">Today is</div>
                <div className="text-lg font-semibold text-charcoal">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card-interactive p-6 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">{stat.label}</p>
                  <p className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                </div>
                <div className={`p-5 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personalized Recommendations */}
            {recommendations && recommendations.recommendations.length > 0 && (
              <div className="card-interactive p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Lightbulb className="h-6 w-6 mr-2 text-yellow-500" />
                    Recommended for You
                  </h2>
                  <Link 
                    to="/links" 
                    className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                  >
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
                <p className="text-gray-600 mb-4">{recommendations.reasoning}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.recommendations.slice(0, 4).map((link) => (
                    <div key={link._id} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{link.title}</h3>
                        <button
                          onClick={() => handleLinkClick(link.url)}
                          className="ml-2 p-1 hover:bg-white/50 rounded"
                        >
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{link.summary}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(link.difficulty)}`}>
                          {link.difficulty}
                        </span>
                        <div className="flex items-center space-x-1 text-sm text-purple-600">
                          <span className="font-medium">{Math.round(recommendations.confidence * 100)}%</span>
                          <span>match</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Content */}
            {trendingLinks && trendingLinks.length > 0 && (
              <div className="card-interactive p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <TrendingUp className="h-6 w-6 mr-2 text-orange-500" />
                    Trending Now
                  </h2>
                  <Link 
                    to="/links?sortBy=trendingScore" 
                    className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                  >
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {trendingLinks.slice(0, 3).map((link, index) => (
                    <div key={link._id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{link.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{link.summary}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(link.difficulty)}`}>
                            {link.difficulty}
                          </span>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Eye className="h-3 w-3" />
                            <span>{link.clickCount}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleLinkClick(link.url)}
                        className="flex-shrink-0 p-2 hover:bg-white/50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card-interactive p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-primary-300 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-xs text-gray-600">{action.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors ml-auto" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Recent Bookmarks */}
            {bookmarks && bookmarks.length > 0 && (
              <div className="card-interactive p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium text-gray-900 flex items-center">
                    <Bookmark className="h-5 w-5 mr-2 text-blue-500" />
                    Recent Bookmarks
                  </h3>
                  <Link to="/links?bookmarked=true" className="text-primary-600 hover:text-primary-700 text-sm">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {bookmarks.slice(0, 3).map((bookmark) => (
                    <div key={bookmark._id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{bookmark.title}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(bookmark.difficulty)}`}>
                          {bookmark.difficulty}
                        </span>
                        <button
                          onClick={() => handleLinkClick(bookmark.url)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Streak */}
            <div className="card-interactive p-6">
              <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <Flame className="h-5 w-5 mr-2 text-orange-500" />
                Learning Streak
              </h3>
              <div className="text-center">
                <div className="text-xl font-semibold text-orange-600 mb-2">
                  {analyticsData?.streakDays || 0}
                </div>
                <p className="text-gray-600 mb-4">days in a row</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((analyticsData?.streakDays || 0) * 10, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">
                  Keep it up! {30 - (analyticsData?.streakDays || 0)} more days to reach 30!
                </p>
              </div>
            </div>

            {/* Skills Progress */}
            {user?.skills && user.skills.length > 0 && (
              <div className="card-interactive p-6">
                <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-500" />
                  Your Skills
                </h3>
                <div className="space-y-3">
                  {user.skills.slice(0, 5).map((skill, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{skill.skill}</p>
                        <p className="text-sm text-gray-500">{skill.level}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-purple-600">{skill.confidence}%</div>
                        <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-purple-500 h-1 rounded-full transition-all duration-500"
                            style={{ width: `${skill.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link 
                  to="/analytics" 
                  className="block text-center text-primary-600 hover:text-primary-700 font-medium mt-4"
                >
                  View All Skills
                </Link>
              </div>
            )}

            {/* Recent Activity */}
            {recentActivity && recentActivity.length > 0 && (
              <div className="card-interactive p-6">
                <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-500" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievement Badges */}
            {user?.badges && user.badges.length > 0 && (
              <div className="card-interactive p-6">
                <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  Recent Badges
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {user.badges.slice(0, 4).map((badge, index) => (
                    <div key={index} className="text-center p-3 bg-yellow-50 rounded-lg">
                      <Award className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-gray-900">{badge.type.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
                <Link 
                  to="/analytics" 
                  className="block text-center text-primary-600 hover:text-primary-700 font-medium mt-4"
                >
                  View All Badges
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
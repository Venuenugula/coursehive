import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Award,
  Target,
  Users,
  Upload,
  Plus,
  FileText,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import UploadContent from '../components/UploadContent';
import CreateMockTest from '../components/CreateMockTest';

const Dashboard = () => {
  const { user } = useAuth();
  const [showUploadContent, setShowUploadContent] = useState(false);
  const [showCreateTest, setShowCreateTest] = useState(false);

  // Fetch user analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    'user-analytics',
    () => axios.get('/api/users/analytics').then(res => res.data),
    { refetchInterval: 30000 }
  );

  // Fetch recent activity
  const { data: activityData, isLoading: activityLoading } = useQuery(
    'user-activity',
    () => axios.get('/api/users/activity').then(res => res.data),
    { refetchInterval: 30000 }
  );

  // Fetch study plan
  const { data: studyPlanData, isLoading: studyPlanLoading } = useQuery(
    'study-plan',
    () => axios.get('/api/users/study-plan').then(res => res.data),
    { refetchInterval: 30000 }
  );

  // Fetch recent content
  const { data: recentContent, isLoading: contentLoading } = useQuery(
    'recentContent',
    () => axios.get('/api/content?limit=5').then(res => res.data),
    { refetchInterval: 60000 }
  );

  // Fetch recent tests
  const { data: recentTests, isLoading: testsLoading } = useQuery(
    'recentTests',
    () => axios.get('/api/tests?limit=5').then(res => res.data),
    { refetchInterval: 60000 }
  );

  if (analyticsLoading) {
    return <LoadingSpinner size="lg" className="min-h-screen" />;
  }

  const stats = analytics?.analytics || {};
  const weeklyStats = stats.weeklyStats || {};
  const recentActivity = activityData?.activities || [];
  const studyPlan = studyPlanData?.tasks || [];
  const content = recentContent?.content || [];
  const tests = recentTests?.tests || [];

  const quickStats = [
    {
      title: 'Tests Completed',
      value: weeklyStats.testsCompleted || 0,
      change: '+12%',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Study Time',
      value: `${Math.round((weeklyStats.timeSpent || 0) / 60)}h`,
      change: '+8%',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Average Accuracy',
      value: `${weeklyStats.averageAccuracy || 0}%`,
      change: '+5%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak || 0} days`,
      change: 'Keep it up!',
      icon: Award,
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
        return <Activity className="h-5 w-5 text-yellow-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-xl text-gray-600">
                  Welcome back, <span className="font-semibold text-blue-600">{user?.name || 'User'}</span>! 
                  Here's your learning progress overview.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Today's Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-gray-300">
                <div className="flex items-center">
                  <div className={`${stat.bgColor} p-4 rounded-xl`}>
                    <Icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                  <p className="text-gray-600 mt-1">Your latest learning progress</p>
                </div>
                <Link
                  to="/analytics"
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent activity</p>
                    <p className="text-sm text-gray-500">Start learning to see your activity here</p>
                  </div>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      {getStatusIcon(activity.status)}
                      <div className="ml-4 flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">
                          {activity.score && `Score: ${activity.score}% • `}
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Study Plan */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Today's Study Plan</h2>
                  <p className="text-gray-600 mt-1">Your daily learning tasks</p>
                </div>
                <Link
                  to="/study-plan"
                  className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Manage
                </Link>
              </div>
              <div className="space-y-3">
                {studyPlan.length === 0 ? (
                  <div className="text-center py-4">
                    <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No tasks for today</p>
                    <Link
                      to="/study-plan"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Create study plan
                    </Link>
                  </div>
                ) : (
                  studyPlan.slice(0, 3).map((task, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        task.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className={`text-sm ${
                        task.completed ? 'text-gray-500 line-through' : 'text-gray-700'
                      }`}>
                        {task.title}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                <p className="text-gray-600 mt-1">Common tasks and shortcuts</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setShowUploadContent(true)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Content
                </button>
                <button
                  onClick={() => setShowCreateTest(true)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Mock Test
                </button>
                <Link
                  to="/my-submissions"
                  className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  My Submissions
                </Link>
                <Link
                  to="/tests"
                  className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Take Practice Test
                </Link>
                <Link
                  to="/links"
                  className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Browse Study Materials
                </Link>
                <Link
                  to="/forum"
                  className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Join Discussion
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Content & Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Recent Content */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Study Materials</h2>
                <p className="text-gray-600 mt-1">Your latest uploaded content</p>
              </div>
              <Link
                to="/links"
                className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {content.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent materials</p>
                  <p className="text-sm text-gray-500">Upload content to see it here</p>
                </div>
              ) : (
                content.map((item) => (
                  <div key={item._id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">
                        {item.subject} • {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Tests */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Tests</h2>
                <p className="text-gray-600 mt-1">Your latest test attempts</p>
              </div>
              <Link
                to="/tests"
                className="bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {tests.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent tests</p>
                  <p className="text-sm text-gray-500">Take a test to see it here</p>
                </div>
              ) : (
                tests.map((test) => (
                  <div key={test._id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-medium text-gray-900">{test.title}</p>
                      <p className="text-sm text-gray-600">
                        {test.subject} • {test.questions?.length || 0} questions
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {showUploadContent && (
          <UploadContent onClose={() => setShowUploadContent(false)} />
        )}

        {showCreateTest && (
          <CreateMockTest onClose={() => setShowCreateTest(false)} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
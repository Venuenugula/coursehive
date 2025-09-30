import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  CheckCircle,
  Award,
  Target,
  TrendingUp,
  Filter,
  Search,
  Calendar,
  BarChart3,
  Brain,
  Zap,
  ChevronRight,
  Eye,
  Bookmark,
  Plus,
  FileText,
  History,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CreateMockTest from '../components/CreateMockTest';

const Tests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get view type from URL parameters
  const viewType = searchParams.get('my') === 'true' ? 'my' : 
                   searchParams.get('history') === 'true' ? 'history' : 'all';
  
  const [filters, setFilters] = useState({
    subject: '',
    difficulty: '',
    duration: '',
    search: '',
    sortBy: 'popularity',
    sortOrder: 'desc',
    viewType: viewType
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);

  // Update filters when URL parameters change
  useEffect(() => {
    const newViewType = searchParams.get('my') === 'true' ? 'my' : 
                       searchParams.get('history') === 'true' ? 'history' : 'all';
    
    setFilters(prev => ({
      ...prev,
      viewType: newViewType
    }));
  }, [searchParams]);

  // Fetch available tests
  const { data: testsData, isLoading } = useQuery(
    ['tests', filters, page],
    () => axios.get('/api/tests', { params: { ...filters, page } }).then(res => res.data),
    { keepPreviousData: true }
  );

  // Fetch user's test history
  const { data: testHistory } = useQuery(
    'test-history',
    () => axios.get('/api/tests/history').then(res => res.data),
    { enabled: !!user }
  );

  // Fetch trending tests
  const { data: trendingTests } = useQuery(
    'trending-tests',
    () => axios.get('/api/tests/trending').then(res => res.data)
  );

  // Fetch test categories
  const { data: categoriesData } = useQuery(
    'test-categories',
    () => axios.get('/api/tests/categories').then(res => res.data)
  );

  // Start test mutation
  const startTestMutation = useMutation(
    (testId) => axios.post(`/api/tests/${testId}/start`).then(res => res.data)
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleStartTest = async (testId) => {
    try {
      const result = await startTestMutation.mutateAsync(testId);
      // Navigate to test detail page
      window.location.href = `/tests/${testId}`;
    } catch (error) {
      console.error('Error starting test:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSubjectIcon = (subject) => {
    switch (subject.toLowerCase()) {
      case 'mathematics': return <Target className="h-4 w-4" />;
      case 'science': return <Brain className="h-4 w-4" />;
      case 'programming': return <Zap className="h-4 w-4" />;
      case 'english': return <BookOpen className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const tests = testsData?.tests || [];
  const totalPages = testsData?.pagination?.totalPages || 1;
  const categories = categoriesData?.categories || [];
  const trending = trendingTests?.tests || [];

  const displayTests = tests;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="coursehive-card p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Mock Tests & Quizzes
                </h1>
                <p className="text-sm text-gray-600">
                  Test your knowledge and track your progress with our comprehensive test collection
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCreateTestModal(true)}
                  className="coursehive-button flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Test</span>
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View Type Tabs */}
        <div className="mb-6">
          <div className="coursehive-card p-4">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setSearchParams({});
                  setFilters(prev => ({ ...prev, viewType: 'all' }));
                }}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
                  viewType === 'all'
                    ? 'bg-white text-coursehive-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>All Tests</span>
              </button>
              <button
                onClick={() => {
                  setSearchParams({ my: 'true' });
                  setFilters(prev => ({ ...prev, viewType: 'my' }));
                }}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
                  viewType === 'my'
                    ? 'bg-white text-coursehive-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <User className="h-4 w-4" />
                <span>My Tests</span>
              </button>
              <button
                onClick={() => {
                  setSearchParams({ history: 'true' });
                  setFilters(prev => ({ ...prev, viewType: 'history' }));
                }}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
                  viewType === 'history'
                    ? 'bg-white text-coursehive-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <History className="h-4 w-4" />
                <span>Test History</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-8">
            <div className="card-interactive p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={filters.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                    className="input"
                  >
                    <option value="">All Subjects</option>
                    <option value="Programming">Programming</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="General">General Knowledge</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className="input"
                  >
                    <option value="">All Levels</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <select
                    value={filters.duration}
                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                    className="input"
                  >
                    <option value="">Any Duration</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60+ minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="input"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="rating">Rating</option>
                    <option value="recent">Most Recent</option>
                    <option value="difficulty">Difficulty</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search for tests and quizzes..."
                className="input pl-10 w-full"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>

        {/* Test History Summary */}
        {testHistory && testHistory.length > 0 && (
          <div className="mb-8">
            <div className="card-interactive p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                Your Test Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl font-semibold text-blue-600">{testHistory.length}</div>
                  <div className="text-sm text-gray-600">Tests Taken</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-xl font-semibold text-green-600">
                    {Math.round(testHistory.reduce((acc, test) => acc + (test.score || 0), 0) / testHistory.length)}%
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-xl font-semibold text-purple-600">
                    {testHistory.filter(test => test.score >= 80).length}
                  </div>
                  <div className="text-sm text-gray-600">High Scores</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-xl font-semibold text-orange-600">
                    {Math.round(testHistory.reduce((acc, test) => acc + (test.timeSpent || 0), 0) / testHistory.length)} min
                  </div>
                  <div className="text-sm text-gray-600">Avg Time</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trending Tests */}
        {trending && trending.length > 0 && (
          <div className="mb-8">
            <div className="card-interactive p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
                Trending Tests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trending.slice(0, 3).map((test) => (
                  <div key={test._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-gray-900 mb-2">{test.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty || 'Medium')}`}>
                        {test.difficulty || 'Medium'}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{test.stats?.totalAttempts || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-interactive p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))
          ) : displayTests.length > 0 ? (
            displayTests.map((test) => (
              <div key={test._id} className="card-interactive p-6 group hover:shadow-medium transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getSubjectIcon(test.subject)}
                    <span className="text-sm text-gray-500">{test.subject}</span>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Bookmark className={`h-5 w-5 ${
                      test.isBookmarked ? 'text-blue-500 fill-current' : 'text-gray-400'
                    }`} />
                  </button>
                </div>

                <h3 className="text-base font-medium text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {test.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {test.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty || 'Medium')}`}>
                    {test.difficulty || 'Medium'}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                    {test.duration} min
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>{test.questions?.length || 0} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{test.stats?.totalAttempts || 0}</span>
                    </div>
                  </div>
                  {test.stats?.averageScore > 0 && (
                    <div className="flex items-center space-x-1">
                      {renderStars(Math.round(test.stats.averageScore / 20))}
                      <span className="text-sm text-gray-500">
                        ({Math.round(test.stats.averageScore)}%)
                      </span>
                    </div>
                  )}
                </div>

                {/* Previous Performance */}
                {test.bestScore && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Best Score</span>
                      <span className="text-base font-semibold text-green-600">{test.bestScore}%</span>
                    </div>
                    {test.lastAttempted && (
                      <div className="text-xs text-green-600 mt-1">
                        Last attempted: {new Date(test.lastAttempted).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStartTest(test._id)}
                    className="btn btn-primary flex-1"
                    disabled={startTestMutation.isLoading}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {test.bestScore ? 'Retake Test' : 'Start Test'}
                  </button>
                  <Link
                    to={`/tests/${test._id}`}
                    className="btn btn-outline p-2"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <BookOpen className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="flex items-center px-4 py-2 text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Test Modal */}
      {showCreateTestModal && (
        <CreateMockTest onClose={() => setShowCreateTestModal(false)} />
      )}
    </div>
  );
};

export default Tests;
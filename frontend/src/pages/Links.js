import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Bookmark, 
  Star, 
  Clock, 
  Eye, 
  TrendingUp,
  BookOpen,
  Video,
  FileText,
  Zap,
  Users,
  Plus,
  BookmarkCheck,
  History
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UploadContent from '../components/UploadContent';

const Links = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get view type from URL parameters
  const viewType = searchParams.get('bookmarked') === 'true' ? 'bookmarked' : 
                   searchParams.get('recent') === 'true' ? 'recent' : 'all';
  
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    contentType: '',
    search: '',
    sortBy: 'popularityScore',
    sortOrder: 'desc',
    viewType: viewType
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [semanticQuery, setSemanticQuery] = useState('');
  const [showSemanticSearch, setShowSemanticSearch] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Update filters when URL parameters change
  useEffect(() => {
    const newViewType = searchParams.get('bookmarked') === 'true' ? 'bookmarked' : 
                       searchParams.get('recent') === 'true' ? 'recent' : 'all';
    
    setFilters(prev => ({
      ...prev,
      viewType: newViewType
    }));
  }, [searchParams]);

  // Fetch links
  const { data: linksData, isLoading } = useQuery(
    ['links', filters, page],
    () => axios.get('/api/links', { params: { ...filters, page } }).then(res => res.data),
    { keepPreviousData: true }
  );

  // Fetch trending links
  const { data: trendingLinks } = useQuery(
    'trending-links',
    () => axios.get('/api/links/trending').then(res => res.data)
  );

  // Fetch personalized recommendations
  const { data: recommendations } = useQuery(
    'recommendations',
    () => axios.get('/api/links/recommendations').then(res => res.data),
    { enabled: !!user }
  );

  // Semantic search mutation
  const semanticSearchMutation = useMutation(
    (query) => axios.post('/api/links/search', { 
      query, 
      userContext: user?.profile?.subjects?.join(', ') || '',
      limit: 20 
    }).then(res => res.data)
  );

  // Click tracking mutation
  const clickMutation = useMutation(
    ({ linkId, timeSpent }) => axios.post(`/api/links/${linkId}/click`, { timeSpent })
  );

  // Bookmark mutation
  const bookmarkMutation = useMutation(
    ({ linkId, bookmarked }) => axios.post(`/api/links/${linkId}/bookmark`, { bookmarked })
  );

  // Rating mutation
  const ratingMutation = useMutation(
    ({ linkId, rating }) => axios.post(`/api/links/${linkId}/rate`, { rating })
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleSemanticSearch = async (e) => {
    e.preventDefault();
    if (semanticQuery.trim()) {
      await semanticSearchMutation.mutateAsync(semanticQuery);
    }
  };

  const handleLinkClick = async (link) => {
    try {
      await clickMutation.mutateAsync({ linkId: link._id, timeSpent: 0 });
      // Open link in new tab
      window.open(link.url, '_blank');
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleBookmark = async (linkId, isBookmarked) => {
    try {
      await bookmarkMutation.mutateAsync({ linkId, bookmarked: !isBookmarked });
      queryClient.invalidateQueries(['links']);
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const handleRating = async (linkId, rating) => {
    try {
      await ratingMutation.mutateAsync({ linkId, rating });
      queryClient.invalidateQueries(['links']);
    } catch (error) {
      console.error('Error rating link:', error);
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'tutorial': return <Zap className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
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

  const links = semanticSearchMutation.data?.results || linksData?.links || [];
  const totalPages = linksData?.totalPages || 1;

  // Debug logging removed to prevent console spam

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="card p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Learning Resources
              </h1>
              <p className="text-sm text-gray-600">
                Discover and explore educational content tailored for you
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Upload Resource</span>
              </button>
              <button
                onClick={() => setShowSemanticSearch(!showSemanticSearch)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <Search className="h-5 w-5" />
                <span>AI Search</span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline flex items-center space-x-2"
              >
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Type Tabs */}
        <div className="mb-6">
          <div className="card p-4">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setSearchParams({});
                  setFilters(prev => ({ ...prev, viewType: 'all' }));
                }}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
                  viewType === 'all'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>All Resources</span>
              </button>
              <button
                onClick={() => {
                  setSearchParams({ bookmarked: 'true' });
                  setFilters(prev => ({ ...prev, viewType: 'bookmarked' }));
                }}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
                  viewType === 'bookmarked'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BookmarkCheck className="h-4 w-4" />
                <span>Bookmarked</span>
              </button>
              <button
                onClick={() => {
                  setSearchParams({ recent: 'true' });
                  setFilters(prev => ({ ...prev, viewType: 'recent' }));
                }}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
                  viewType === 'recent'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <History className="h-4 w-4" />
                <span>Recent</span>
              </button>
            </div>
          </div>
        </div>

        {/* Semantic Search */}
        {showSemanticSearch && (
          <div className="mb-8">
            <div className="card p-6">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">AI-Powered Semantic Search</h3>
              <form onSubmit={handleSemanticSearch} className="flex space-x-4">
                <input
                  type="text"
                  value={semanticQuery}
                  onChange={(e) => setSemanticQuery(e.target.value)}
                  placeholder="Ask a question or describe what you want to learn..."
                  className="input flex-1"
                />
                <button
                  type="submit"
                  disabled={semanticSearchMutation.isLoading}
                  className="btn btn-primary px-6 py-2"
                >
                  {semanticSearchMutation.isLoading ? 'Searching...' : 'Search'}
                </button>
              </form>
              {semanticSearchMutation.data && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Search Confidence:</strong> {Math.round(semanticSearchMutation.data.confidence * 100)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="mb-8">
            <div className="card p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input"
                  >
                    <option value="">All Categories</option>
                    <option value="Programming">Programming</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
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
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={filters.contentType}
                    onChange={(e) => handleFilterChange('contentType', e.target.value)}
                    className="input"
                  >
                    <option value="">All Types</option>
                    <option value="video">Video</option>
                    <option value="article">Article</option>
                    <option value="course">Course</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="pdf">PDF</option>
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
                    <option value="popularityScore">Popularity</option>
                    <option value="trendingScore">Trending</option>
                    <option value="qualityScore">Quality</option>
                    <option value="createdAt">Newest</option>
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
                placeholder="Search for learning resources..."
                className="input pl-10 w-full"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>

        {/* Trending Section */}
        {trendingLinks && trendingLinks.length > 0 && (
          <div className="mb-8">
            <div className="card p-6">
                 <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
                Trending Now
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trendingLinks.slice(0, 3).map((link) => (
                  <div key={link._id} className="card-compact">
                    <h4 className="font-semibold text-gray-900 mb-2">{link.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{link.summary}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(link.difficulty)}`}>
                        {link.difficulty}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{link.clickCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Personalized Recommendations */}
        {recommendations && recommendations.recommendations.length > 0 && (
          <div className="mb-8">
            <div className="card p-6">
                 <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-500" />
                Recommended for You
              </h3>
              <p className="text-sm text-gray-600 mb-4">{recommendations.reasoning}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.recommendations.slice(0, 4).map((link) => (
                  <div key={link._id} className="card-compact bg-purple-50 hover:bg-purple-100">
                    <h4 className="font-semibold text-gray-900 mb-2">{link.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{link.summary}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(link.difficulty)}`}>
                        {link.difficulty}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-purple-600 font-medium">
                          {Math.round(recommendations.confidence * 100)}% match
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))
          ) : links.length > 0 ? (
            links.map((link) => (
              <div key={link._id} className="card p-6 group hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getContentTypeIcon(link.contentType)}
                    <span className="text-sm text-gray-600 capitalize">{link.contentType}</span>
                  </div>
                  <button
                    onClick={() => handleBookmark(link._id, link.engagement?.bookmarks?.includes(user?._id))}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Bookmark className={`h-5 w-5 ${
                      link.engagement?.bookmarks?.includes(user?._id) 
                        ? 'text-blue-500 fill-current' 
                        : 'text-gray-400'
                    }`} />
                  </button>
                </div>

                   <h3 className="text-base font-medium text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {link.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {link.summary || link.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(link.difficulty)}`}>
                    {link.difficulty}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                    {link.categories.primary}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{link.clickCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{link.estimatedReadTime || 5} min</span>
                    </div>
                  </div>
                  {link.engagement?.averageRating > 0 && (
                    <div className="flex items-center space-x-1">
                      {renderStars(Math.round(link.engagement.averageRating))}
                      <span className="text-sm text-gray-500">
                        ({link.engagement.ratings?.length || 0})
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleLinkClick(link)}
                    className="btn btn-primary flex-1"
                  >
                    Open Link
                  </button>
                  {user && (
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRating(link._id, rating)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Star className={`h-4 w-4 ${
                            rating <= (link.engagement?.averageRating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters to discover more learning materials.</p>
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
            <span className="flex items-center px-4 py-2 text-gray-900">
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

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadContent onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
};

export default Links;
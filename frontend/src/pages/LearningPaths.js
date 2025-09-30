import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
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
  User,
  ArrowRight,
  ExternalLink,
  BookmarkCheck,
  Settings,
  Edit,
  Trash2,
  Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LearningPaths = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    subject: '',
    difficulty: '',
    search: '',
    sortBy: 'popularity',
    sortOrder: 'desc'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [showCreatePathModal, setShowCreatePathModal] = useState(false);
  const [editingPath, setEditingPath] = useState(null);

  // Fetch learning paths
  const { data: pathsData, isLoading } = useQuery(
    ['learning-paths', filters, page],
    () => axios.get('/api/learning-paths', { params: { ...filters, page } }).then(res => res.data),
    { keepPreviousData: true }
  );

  // Fetch user's learning paths
  const { data: userPaths } = useQuery(
    'user-learning-paths',
    () => axios.get('/api/users/learning-paths').then(res => res.data),
    { enabled: !!user }
  );

  // Create learning path mutation
  const createPathMutation = useMutation(
    (pathData) => axios.post('/api/learning-paths', pathData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('learning-paths');
        queryClient.invalidateQueries('user-learning-paths');
        setShowCreatePathModal(false);
      }
    }
  );

  // Update learning path mutation
  const updatePathMutation = useMutation(
    ({ pathId, pathData }) => axios.put(`/api/learning-paths/${pathId}`, pathData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('learning-paths');
        queryClient.invalidateQueries('user-learning-paths');
        setEditingPath(null);
      }
    }
  );

  // Delete learning path mutation
  const deletePathMutation = useMutation(
    (pathId) => axios.delete(`/api/learning-paths/${pathId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('learning-paths');
        queryClient.invalidateQueries('user-learning-paths');
      }
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleCreatePath = async (pathData) => {
    await createPathMutation.mutateAsync(pathData);
  };

  const handleUpdatePath = async (pathId, pathData) => {
    await updatePathMutation.mutateAsync({ pathId, pathData });
  };

  const handleDeletePath = async (pathId) => {
    if (window.confirm('Are you sure you want to delete this learning path?')) {
      await deletePathMutation.mutateAsync(pathId);
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

  const paths = pathsData?.paths || [];
  const userPathsList = userPaths?.learningPaths || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading learning paths...</p>
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
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Learning Paths
                </h1>
                <p className="text-sm text-gray-600">
                  Structured learning journeys to master new skills
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCreatePathModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Path</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="coursehive-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Paths</p>
                <p className="text-xl font-semibold text-gray-900">{pathsData?.total || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="coursehive-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Paths</p>
                <p className="text-xl font-semibold text-gray-900">{userPathsList.length}</p>
              </div>
            </div>
          </div>
          
          <div className="coursehive-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl font-semibold text-gray-900">
                  {userPathsList.filter(path => path.progress === 100).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="coursehive-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-xl font-semibold text-gray-900">
                  {userPathsList.filter(path => path.progress > 0 && path.progress < 100).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="coursehive-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="input"
                >
                  <option value="">All Subjects</option>
                  <option value="Programming">Programming</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Language">Language</option>
                  <option value="Business">Business</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="input"
                >
                  <option value="popularity">Popularity</option>
                  <option value="createdAt">Date Created</option>
                  <option value="title">Title</option>
                  <option value="difficulty">Difficulty</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <form onSubmit={handleSearch} className="flex">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search paths..."
                    className="input flex-1"
                  />
                  <button type="submit" className="btn-primary ml-2">
                    <Search className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Learning Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map((path) => (
            <div key={path._id} className="coursehive-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-base font-medium text-gray-900 mb-2">{path.title}</h3>
                  <p className="text-gray-600 mb-3">{path.description}</p>
                </div>
                {user && path.author._id === user._id && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingPath(path)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePath(path._id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                  {path.difficulty}
                </span>
                <span className="text-sm text-gray-500">
                  {path.links?.length || 0} resources
                </span>
                <span className="text-sm text-gray-500">
                  {path.estimatedDuration || 'N/A'} min
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">{path.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${path.progress || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>{path.author?.name || 'Unknown'}</span>
                </div>
                <Link
                  to={`/learning-paths/${path._id}`}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Start Path</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pathsData?.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {page} of {pathsData.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pathsData.totalPages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Create Path Modal */}
        {showCreatePathModal && (
          <CreatePathModal
            onClose={() => setShowCreatePathModal(false)}
            onSubmit={handleCreatePath}
          />
        )}

        {/* Edit Path Modal */}
        {editingPath && (
          <EditPathModal
            path={editingPath}
            onClose={() => setEditingPath(null)}
            onSubmit={(pathData) => handleUpdatePath(editingPath._id, pathData)}
          />
        )}
      </div>
    </div>
  );
};

// Create Path Modal Component
const CreatePathModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    difficulty: 'Beginner',
    estimatedDuration: '',
    tags: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-medium mb-4">Create Learning Path</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows="3"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="input"
              required
            >
              <option value="">Select Subject</option>
              <option value="Programming">Programming</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="Language">Language</option>
              <option value="Business">Business</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="input"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration (minutes)</label>
            <input
              type="number"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
              className="input"
            />
          </div>
          
          <div className="flex space-x-4">
            <button type="submit" className="btn-primary flex-1">
              Create Path
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Path Modal Component
const EditPathModal = ({ path, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: path.title || '',
    description: path.description || '',
    subject: path.subject || '',
    difficulty: path.difficulty || 'Beginner',
    estimatedDuration: path.estimatedDuration || '',
    tags: path.tags || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-medium mb-4">Edit Learning Path</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows="3"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="input"
              required
            >
              <option value="">Select Subject</option>
              <option value="Programming">Programming</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="Language">Language</option>
              <option value="Business">Business</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="input"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration (minutes)</label>
            <input
              type="number"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
              className="input"
            />
          </div>
          
          <div className="flex space-x-4">
            <button type="submit" className="btn-primary flex-1">
              Update Path
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LearningPaths;
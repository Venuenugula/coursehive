import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter,
  Clock,
  User,
  Reply,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const Forum = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    category: 'General'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch forum threads
  const { data: threadsData, isLoading: threadsLoading } = useQuery(
    'forum-threads',
    () => axios.get('/api/forum/threads').then(res => res.data),
    { refetchInterval: 30000 }
  );

  // Create new thread mutation
  const createThreadMutation = useMutation(
    (threadData) => axios.post('/api/forum/threads', threadData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('forum-threads');
        setShowCreateThread(false);
        setNewThread({ title: '', content: '', category: 'General' });
        toast.success('Thread created successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create thread');
      }
    }
  );

  const threads = threadsData?.threads || [];
  const categories = ['All', 'General', 'React', 'JavaScript', 'CSS', 'Python', 'Java', 'Other'];

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thread.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || thread.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newThread.title.trim() || !newThread.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Transform category to subject and topic for backend
    const threadData = {
      title: newThread.title,
      content: newThread.content,
      subject: newThread.category,
      topic: newThread.category,
      tags: []
    };
    
    createThreadMutation.mutate(threadData);
  };

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

  if (threadsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading forum threads...</p>
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
                <h1 className="text-4xl font-bold text-charcoal mb-2">
                  Community Forum
                </h1>
                <p className="text-xl text-dark-gray">
                  Connect with fellow learners and share knowledge
                </p>
              </div>
              <button
                onClick={() => setShowCreateThread(true)}
                className="coursehive-button px-6 py-3 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span>Start New Thread</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="coursehive-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search threads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-medium-gray rounded-xl focus:ring-2 focus:ring-coursehive-primary focus:border-coursehive-primary text-lg bg-pure-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-4 border border-medium-gray rounded-xl focus:ring-2 focus:ring-coursehive-primary focus:border-coursehive-primary text-lg bg-pure-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Create Thread Modal */}
        {showCreateThread && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Create New Thread</h2>
              </div>
              <form onSubmit={handleCreateThread} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thread Title
                  </label>
                  <input
                    type="text"
                    value={newThread.title}
                    onChange={(e) => setNewThread({...newThread, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter thread title..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newThread.category}
                    onChange={(e) => setNewThread({...newThread, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.filter(cat => cat !== 'All').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={newThread.content}
                    onChange={(e) => setNewThread({...newThread, content: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Share your thoughts, ask questions, or start a discussion..."
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateThread(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createThreadMutation.isLoading}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {createThreadMutation.isLoading ? 'Creating...' : 'Create Thread'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Threads List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900">Recent Discussions ({filteredThreads.length})</h2>
            <p className="text-gray-600 mt-1">Join the conversation and share your knowledge</p>
          </div>
          
          {filteredThreads.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No threads found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'All' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Be the first to start a discussion!'
                }
              </p>
              {!searchTerm && selectedCategory === 'All' && (
                <button
                  onClick={() => setShowCreateThread(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Start First Thread
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredThreads.map((thread) => (
                <Link
                  key={thread._id}
                  to={`/forum/threads/${thread._id}`}
                  className="block px-6 py-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {thread.title}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {thread.content}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{thread.author?.name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(thread.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Reply className="h-4 w-4" />
                          <span>{thread.replies?.length || 0} replies</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{thread.views || 0} views</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {thread.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;
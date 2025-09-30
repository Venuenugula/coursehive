import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { 
  Bookmark, 
  BookmarkCheck, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Grid3X3,
  List,
  Download,
  Share2,
  Tag,
  Calendar,
  Clock,
  Eye,
  Star,
  Trash2,
  FolderPlus,
  FolderOpen,
  Plus,
  X,
  Check,
  MoreVertical,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Bookmarks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('bookmarkedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedBookmarks, setSelectedBookmarks] = useState([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');

  // Fetch bookmarks
  const { data: bookmarksData, isLoading } = useQuery(
    ['bookmarks', selectedFolder],
    () => axios.get(`/api/users/bookmarks${selectedFolder ? `?folder=${selectedFolder}` : ''}`).then(res => res.data),
    { enabled: !!user }
  );

  // Fetch folders
  const { data: foldersData } = useQuery(
    'bookmark-folders',
    () => axios.get('/api/users/bookmark-folders').then(res => res.data),
    { enabled: !!user }
  );

  // Remove bookmark mutation
  const removeBookmarkMutation = useMutation(
    (bookmarkId) => axios.delete(`/api/users/bookmarks/${bookmarkId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookmarks');
        setSelectedBookmarks([]);
      }
    }
  );

  // Create folder mutation
  const createFolderMutation = useMutation(
    (folderName) => axios.post('/api/users/bookmark-folders', { name: folderName }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookmark-folders');
        setShowCreateFolder(false);
        setNewFolderName('');
      }
    }
  );

  // Move to folder mutation
  const moveToFolderMutation = useMutation(
    ({ bookmarkIds, folderId }) => axios.patch('/api/users/bookmarks/move', { bookmarkIds, folderId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookmarks');
        setSelectedBookmarks([]);
      }
    }
  );

  // Export bookmarks mutation
  const exportBookmarksMutation = useMutation(
    (format) => axios.get(`/api/users/bookmarks/export?format=${format}`, { responseType: 'blob' }),
    {
      onSuccess: (response, format) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `bookmarks.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    }
  );

  const bookmarks = bookmarksData?.bookmarks || [];
  const folders = foldersData?.folders || [];

  // Filter and sort bookmarks
  const filteredBookmarks = bookmarks
    .filter(bookmark => {
      const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bookmark.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !selectedCategory || bookmark.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'bookmarkedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSelectBookmark = (bookmarkId) => {
    setSelectedBookmarks(prev => 
      prev.includes(bookmarkId) 
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBookmarks.length === filteredBookmarks.length) {
      setSelectedBookmarks([]);
    } else {
      setSelectedBookmarks(filteredBookmarks.map(b => b._id));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedBookmarks.length === 0) return;
    
    if (window.confirm(`Remove ${selectedBookmarks.length} bookmark(s)?`)) {
      selectedBookmarks.forEach(bookmarkId => {
        removeBookmarkMutation.mutate(bookmarkId);
      });
    }
  };

  const handleMoveToFolder = (folderId) => {
    if (selectedBookmarks.length === 0) return;
    moveToFolderMutation.mutate({ bookmarkIds: selectedBookmarks, folderId });
  };

  const getContentTypeIcon = (type) => {
    const icons = {
      video: <Video className="h-4 w-4" />,
      article: <FileText className="h-4 w-4" />,
      course: <BookOpen className="h-4 w-4" />,
      tutorial: <Zap className="h-4 w-4" />,
      pdf: <FileText className="h-4 w-4" />,
      interactive: <Zap className="h-4 w-4" />
    };
    return icons[type] || <BookOpen className="h-4 w-4" />;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookmarks...</p>
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
                  <Bookmark className="h-12 w-12 mr-4 text-blue-500" />
                  My Bookmarks
                </h1>
                <p className="text-xl text-dark-gray">
                  Your personal library of saved learning resources
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-gray mb-1">Total Bookmarks</div>
                <div className="text-3xl font-bold text-blue-600">{bookmarks.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="coursehive-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input w-full"
              >
                <option value="">All Categories</option>
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Data Science">Data Science</option>
                <option value="Business">Business</option>
                <option value="Marketing">Marketing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input"
              >
                <option value="bookmarkedAt">Date Bookmarked</option>
                <option value="title">Title</option>
                <option value="difficulty">Difficulty</option>
                <option value="category">Category</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </button>
            </div>

            {/* View Mode */}
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Folders Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="coursehive-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Folders</h3>
                <button
                  onClick={() => setShowCreateFolder(true)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setSelectedFolder('')}
                  className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-colors ${
                    selectedFolder === '' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                  <span>All Bookmarks</span>
                  <span className="ml-auto text-sm text-gray-500">{bookmarks.length}</span>
                </button>

                {folders.map((folder) => (
                  <button
                    key={folder._id}
                    onClick={() => setSelectedFolder(folder._id)}
                    className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-colors ${
                      selectedFolder === folder._id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span>{folder.name}</span>
                    <span className="ml-auto text-sm text-gray-500">{folder.bookmarkCount}</span>
                  </button>
                ))}
              </div>

              {/* Create Folder Modal */}
              {showCreateFolder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-96">
                    <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
                    <input
                      type="text"
                      placeholder="Folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="input w-full mb-4"
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={() => createFolderMutation.mutate(newFolderName)}
                        disabled={!newFolderName.trim() || createFolderMutation.isLoading}
                        className="btn-primary flex-1"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => setShowCreateFolder(false)}
                        className="btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bookmarks Content */}
          <div className="lg:col-span-3">
            {/* Bulk Actions */}
            {selectedBookmarks.length > 0 && (
              <div className="coursehive-card p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {selectedBookmarks.length} selected
                    </span>
                    <button
                      onClick={handleRemoveSelected}
                      className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Remove</span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Move to:</span>
                      <select
                        onChange={(e) => handleMoveToFolder(e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="">Select folder</option>
                        {folders.map((folder) => (
                          <option key={folder._id} value={folder._id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => exportBookmarksMutation.mutate('pdf')}
                      className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export PDF</span>
                    </button>
                    <button
                      onClick={() => exportBookmarksMutation.mutate('csv')}
                      className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bookmarks Grid/List */}
            {filteredBookmarks.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredBookmarks.map((bookmark) => (
                  <div key={bookmark._id} className={`coursehive-card p-6 group hover:shadow-lg transition-all duration-300 ${
                    viewMode === 'list' ? 'flex items-center space-x-4' : ''
                  }`}>
                    {viewMode === 'grid' ? (
                      <>
                        {/* Grid View */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            {getContentTypeIcon(bookmark.contentType)}
                            <span className="text-sm text-dark-gray capitalize">{bookmark.contentType}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedBookmarks.includes(bookmark._id)}
                              onChange={() => handleSelectBookmark(bookmark._id)}
                              className="rounded"
                            />
                            <button
                              onClick={() => removeBookmarkMutation.mutate(bookmark._id)}
                              className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-charcoal mb-3 group-hover:text-coursehive-primary transition-colors">
                          <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {bookmark.title}
                          </a>
                        </h3>

                        <p className="text-dark-gray text-sm mb-4 line-clamp-3">
                          {bookmark.summary || bookmark.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(bookmark.difficulty)}`}>
                            {bookmark.difficulty}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-coursehive-light-blue text-coursehive-primary">
                            {bookmark.category}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-dark-gray">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(bookmark.bookmarkedAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{bookmark.clickCount || 0}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* List View */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold text-charcoal group-hover:text-coursehive-primary transition-colors">
                              <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {bookmark.title}
                              </a>
                            </h3>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedBookmarks.includes(bookmark._id)}
                                onChange={() => handleSelectBookmark(bookmark._id)}
                                className="rounded"
                              />
                              <button
                                onClick={() => removeBookmarkMutation.mutate(bookmark._id)}
                                className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-4 w-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                          <p className="text-dark-gray text-sm mb-2 line-clamp-2">
                            {bookmark.summary || bookmark.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-dark-gray">
                            <div className="flex items-center space-x-1">
                              {getContentTypeIcon(bookmark.contentType)}
                              <span className="capitalize">{bookmark.contentType}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(bookmark.difficulty)}`}>
                              {bookmark.difficulty}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-coursehive-light-blue text-coursehive-primary">
                              {bookmark.category}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(bookmark.bookmarkedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="coursehive-card p-12 text-center">
                <Bookmark className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedCategory 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Start bookmarking resources to build your personal library!'
                  }
                </p>
                {!searchTerm && !selectedCategory && (
                  <a
                    href="/links"
                    className="btn-primary"
                  >
                    Browse Resources
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookmarks;

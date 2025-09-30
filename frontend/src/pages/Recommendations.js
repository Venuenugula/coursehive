import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Star, Bookmark, ExternalLink } from 'lucide-react';
import LinkCard from '../components/LinkCard';
import { useAuth } from '../contexts/AuthContext';

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/links/recommendations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (linkId, action) => {
    try {
      const response = await fetch(`/api/links/${linkId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save link');
      }
    } catch (error) {
      console.error('Error saving link:', error);
      throw error;
    }
  };

  const handleRate = async (linkId, rating) => {
    try {
      const response = await fetch(`/api/links/${linkId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating })
      });
      
      if (!response.ok) {
        throw new Error('Failed to rate link');
      }
    } catch (error) {
      console.error('Error rating link:', error);
      throw error;
    }
  };

  const handleVisit = async (linkId) => {
    try {
      await fetch(`/api/links/${linkId}/click`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error recording click:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view personalized recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-2xl mr-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Personalized Recommendations
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            AI-powered suggestions based on your learning history and preferences
          </p>
          
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <Sparkles className="h-5 w-5 mr-2" />
            )}
            Refresh Recommendations
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your personalized recommendations...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-red-400 mb-4">
              <Sparkles className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading recommendations</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchRecommendations}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <Sparkles className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
            <p className="text-gray-600 mb-4">
              Start exploring learning resources to get personalized recommendations.
            </p>
            <a
              href="/links"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Browse Resources
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {recommendations.map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {category.category || 'Recommended for you'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {category.links?.length || 0} resources
                    </p>
                  </div>
                </div>

                {category.links && category.links.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.links.map(link => (
                      <LinkCard
                        key={link._id}
                        link={link}
                        onSave={handleSave}
                        onRate={handleRate}
                        onVisit={handleVisit}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No resources in this category yet.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Learning Stats */}
        {user && (
          <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Learning Journey</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-3 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Bookmark className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Saved Resources</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-green-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <ExternalLink className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Resources Visited</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-yellow-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Resources Rated</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;

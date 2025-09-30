import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Lightbulb, ExternalLink, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RecommendationsWidget = ({ limit = 4 }) => {
  const { user } = useAuth();
  
  const { data: recommendations, isLoading } = useQuery(
    'recommendations-widget',
    () => axios.get('/api/links/recommendations').then(res => res.data),
    { 
      enabled: !!user,
      refetchInterval: 300000 // Refetch every 5 minutes
    }
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleLinkClick = (url) => {
    window.open(url, '_blank');
  };

  if (!user) {
    return (
      <div className="card-interactive p-6">
        <div className="flex items-center mb-4">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900">Personalized Recommendations</h3>
        </div>
        <p className="text-gray-500 text-center py-4">Sign in to get personalized recommendations</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card-interactive p-6">
        <div className="flex items-center mb-4">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900">Personalized Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.recommendations.length === 0) {
    return (
      <div className="card-interactive p-6">
        <div className="flex items-center mb-4">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900">Personalized Recommendations</h3>
        </div>
        <p className="text-gray-500 text-center py-4">No recommendations available yet</p>
      </div>
    );
  }

  return (
    <div className="card-interactive p-6">
      <div className="flex items-center mb-4">
        <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
        <h3 className="text-lg font-bold text-gray-900">Recommended for You</h3>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">{recommendations.reasoning}</p>
        <div className="flex items-center mt-2">
          <Star className="h-4 w-4 text-yellow-400 mr-1" />
          <span className="text-sm font-medium text-gray-700">
            {Math.round(recommendations.confidence * 100)}% confidence
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.recommendations.slice(0, limit).map((link) => (
          <div 
            key={link._id} 
            className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleLinkClick(link.url)}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">{link.title}</h4>
              <ExternalLink className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
            </div>
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{link.summary}</p>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(link.difficulty)}`}>
                {link.difficulty}
              </span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-xs text-purple-600 font-medium">
                  {Math.round(recommendations.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsWidget;

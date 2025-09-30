import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { TrendingUp, Eye, Clock, ExternalLink } from 'lucide-react';

const TrendingWidget = ({ limit = 5 }) => {
  const { data: trendingLinks, isLoading } = useQuery(
    'trending-widget',
    () => axios.get(`/api/links/trending?limit=${limit}`).then(res => res.data),
    { refetchInterval: 120000 } // Refetch every 2 minutes
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

  if (isLoading) {
    return (
      <div className="card-interactive p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
          <h3 className="text-lg font-bold text-gray-900">Trending Now</h3>
        </div>
        <div className="space-y-3">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!trendingLinks || trendingLinks.length === 0) {
    return (
      <div className="card-interactive p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
          <h3 className="text-lg font-bold text-gray-900">Trending Now</h3>
        </div>
        <p className="text-gray-500 text-center py-4">No trending content available</p>
      </div>
    );
  }

  return (
    <div className="card-interactive p-6">
      <div className="flex items-center mb-4">
        <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
        <h3 className="text-lg font-bold text-gray-900">Trending Now</h3>
      </div>
      <div className="space-y-3">
        {trendingLinks.map((link, index) => (
          <div 
            key={link._id} 
            className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleLinkClick(link.url)}
          >
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                {index + 1}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{link.title}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(link.difficulty)}`}>
                  {link.difficulty}
                </span>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Eye className="h-3 w-3" />
                  <span>{link.clickCount}</span>
                </div>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingWidget;

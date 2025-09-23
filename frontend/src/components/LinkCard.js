import React, { useState } from 'react';
import { ExternalLink, Heart, Star, Clock, Tag, Save, Bookmark } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LinkCard = ({ link, onSave, onRate, onVisit }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(link.savedByUsers?.includes(user?._id) || false);
  const [userRating, setUserRating] = useState(
    link.userRatings?.find(r => r.user === user?._id)?.rating || 0
  );
  const [isRating, setIsRating] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    
    const action = isSaved ? 'unsave' : 'save';
    try {
      await onSave(link._id, action);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving link:', error);
    }
  };

  const handleRate = async (rating) => {
    if (!user || isRating) return;
    
    setIsRating(true);
    try {
      await onRate(link._id, rating);
      setUserRating(rating);
    } catch (error) {
      console.error('Error rating link:', error);
    } finally {
      setIsRating(false);
    }
  };

  const handleVisit = () => {
    onVisit(link._id);
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatReadTime = (minutes) => {
    if (minutes < 1) return '< 1 min';
    if (minutes === 1) return '1 min';
    return `${minutes} mins`;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 group overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100/50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
              {link.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
              {link.description}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleSave}
              className={`p-3 rounded-full transition-all duration-200 ${
                isSaved 
                  ? 'text-red-500 bg-red-50 hover:bg-red-100 shadow-md' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 hover:shadow-md'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save link'}
            >
              <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleVisit}
              className="p-3 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 hover:shadow-md"
              title="Visit link"
            >
              <ExternalLink className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="p-6 space-y-4">
        {/* Subject and Topic */}
        <div className="flex items-center space-x-3">
          <span 
            className="px-3 py-1.5 text-sm font-semibold rounded-full shadow-sm"
            style={{ 
              backgroundColor: link.subject?.color + '20', 
              color: link.subject?.color 
            }}
          >
            {link.subject?.name}
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-sm text-gray-600 font-medium">{link.topic?.name}</span>
        </div>

        {/* Tags */}
        {link.tags && link.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {link.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
              >
                <Tag className="h-3 w-3 mr-1.5" />
                {tag}
              </span>
            ))}
            {link.tags.length > 3 && (
              <span className="text-xs text-gray-500 font-medium px-2 py-1">
                +{link.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Difficulty and Read Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1.5 text-sm font-semibold rounded-full shadow-sm ${getDifficultyColor(link.difficulty)}`}>
              {link.difficulty}
            </span>
            {link.metadata?.estimatedReadTime && (
              <span className="flex items-center text-sm text-gray-500 font-medium">
                <Clock className="h-4 w-4 mr-1.5" />
                {formatReadTime(link.metadata.estimatedReadTime)}
              </span>
            )}
          </div>
          
          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  disabled={isRating}
                  className={`h-4 w-4 transition-colors ${
                    star <= userRating
                      ? 'text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-400'
                  } ${isRating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Star className={`h-4 w-4 ${star <= userRating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {link.userRatings?.length || 0}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100/50">
          <div className="flex items-center space-x-6">
            <span className="flex items-center font-medium">
              <ExternalLink className="h-4 w-4 mr-2 text-blue-500" />
              {link.clickCount || 0} clicks
            </span>
            <span className="flex items-center font-medium">
              <Bookmark className="h-4 w-4 mr-2 text-red-500" />
              {link.savedByUsers?.length || 0} saved
            </span>
          </div>
          <span className="text-gray-400 font-medium text-xs">
            {link.sourceSite}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LinkCard;

import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Brain, Flame, Target, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LearningProgressWidget = () => {
  const { user } = useAuth();
  
  const { data: analyticsData, isLoading } = useQuery(
    'learning-progress',
    () => axios.get('/api/analytics/dashboard').then(res => res.data),
    { refetchInterval: 60000 }
  );

  const { data: userStats } = useQuery(
    'user-stats',
    () => axios.get('/api/users/stats').then(res => res.data),
    { enabled: !!user }
  );

  if (!user) {
    return (
      <div className="card-interactive p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-blue-500" />
          Learning Progress
        </h3>
        <p className="text-gray-500 text-center py-4">Sign in to track your progress</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card-interactive p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-blue-500" />
          Learning Progress
        </h3>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const progressItems = [
    {
      label: 'Learning Streak',
      value: analyticsData?.streakDays || 0,
      max: 30,
      icon: Flame,
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    },
    {
      label: 'Skills Mastered',
      value: userStats?.skillsLearned || 0,
      max: 20,
      icon: Brain,
      color: 'from-purple-400 to-indigo-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      label: 'Content Explored',
      value: userStats?.totalClicks || 0,
      max: 100,
      icon: TrendingUp,
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      label: 'Badges Earned',
      value: userStats?.badgesEarned || 0,
      max: 15,
      icon: Award,
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    }
  ];

  return (
    <div className="card-interactive p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
        <Target className="h-5 w-5 mr-2 text-blue-500" />
        Learning Progress
      </h3>
      
      <div className="space-y-4">
        {progressItems.map((item, index) => {
          const percentage = Math.min((item.value / item.max) * 100, 100);
          const Icon = item.icon;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <Icon className={`h-4 w-4 ${item.textColor}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <span className={`text-sm font-bold ${item.textColor}`}>
                  {item.value}/{item.max}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${item.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <div className="text-xs text-gray-500 text-right">
                {percentage.toFixed(0)}% complete
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Progress Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-lg font-bold text-gray-900">
            {Math.round(progressItems.reduce((acc, item) => acc + (item.value / item.max) * 100, 0) / progressItems.length)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.round(progressItems.reduce((acc, item) => acc + (item.value / item.max) * 100, 0) / progressItems.length)}%` 
            }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Keep learning to unlock new achievements!
        </p>
      </div>
    </div>
  );
};

export default LearningProgressWidget;

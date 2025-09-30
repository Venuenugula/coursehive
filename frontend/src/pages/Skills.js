import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Circle, 
  Star, 
  Award, 
  BookOpen, 
  Video, 
  FileText, 
  Zap, 
  BarChart3, 
  PieChart, 
  Activity, 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Share2, 
  ChevronRight, 
  ChevronDown, 
  Lightbulb, 
  Flag, 
  Trophy, 
  Crown, 
  Medal, 
  Badge, 
  Gift, 
  Sparkles, 
  Eye, 
  Bookmark, 
  ExternalLink, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Plus as PlusIcon, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  HelpCircle, 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon, 
  TrendingUp as TrendingUpIcon2, 
  TrendingDown as TrendingDownIcon2, 
  TrendingUp as TrendingUpIcon3, 
  TrendingDown as TrendingDownIcon3, 
  TrendingUp as TrendingUpIcon4, 
  TrendingDown as TrendingDownIcon4, 
  TrendingUp as TrendingUpIcon5, 
  TrendingDown as TrendingDownIcon5, 
  TrendingUp as TrendingUpIcon6, 
  TrendingDown as TrendingDownIcon6, 
  TrendingUp as TrendingUpIcon7, 
  TrendingDown as TrendingDownIcon7, 
  TrendingUp as TrendingUpIcon8, 
  TrendingDown as TrendingDownIcon8, 
  TrendingUp as TrendingUpIcon9, 
  TrendingDown as TrendingDownIcon9, 
  TrendingUp as TrendingUpIcon10, 
  TrendingDown as TrendingDownIcon10
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Skills = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [expandedSkills, setExpandedSkills] = useState(new Set());
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  // Fetch user skills
  const { data: skillsData, isLoading: skillsLoading } = useQuery(
    'user-skills',
    () => axios.get('/api/users/skills').then(res => res.data),
    { enabled: !!user }
  );

  // Fetch skill analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    'skill-analytics',
    () => axios.get('/api/users/skills/analytics').then(res => res.data),
    { enabled: !!user }
  );

  // Fetch skill recommendations
  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery(
    'skill-recommendations',
    () => axios.get('/api/users/skills/recommendations').then(res => res.data),
    { enabled: !!user }
  );

  // Fetch skill gaps
  const { data: gapsData, isLoading: gapsLoading } = useQuery(
    'skill-gaps',
    () => axios.get('/api/users/skills/gaps').then(res => res.data),
    { enabled: !!user }
  );

  // Add skill mutation
  const addSkillMutation = useMutation(
    (skillData) => axios.post('/api/users/skills', skillData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-skills');
        setShowAddSkill(false);
      }
    }
  );

  // Update skill mutation
  const updateSkillMutation = useMutation(
    ({ skillId, skillData }) => axios.patch(`/api/users/skills/${skillId}`, skillData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-skills');
        setEditingSkill(null);
      }
    }
  );

  // Delete skill mutation
  const deleteSkillMutation = useMutation(
    (skillId) => axios.delete(`/api/users/skills/${skillId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-skills');
      }
    }
  );

  // Update skill level mutation
  const updateSkillLevelMutation = useMutation(
    ({ skillId, level }) => axios.patch(`/api/users/skills/${skillId}/level`, { level }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-skills');
      }
    }
  );

  const skills = skillsData?.skills || [];
  const analytics = analyticsData || {};
  const recommendations = recommendationsData?.recommendations || [];
  const gaps = gapsData?.gaps || [];

  // Filter skills
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || skill.category === selectedCategory;
    const matchesLevel = !selectedLevel || skill.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const toggleSkillExpansion = (skillId) => {
    const newExpanded = new Set(expandedSkills);
    if (newExpanded.has(skillId)) {
      newExpanded.delete(skillId);
    } else {
      newExpanded.add(skillId);
    }
    setExpandedSkills(newExpanded);
  };

  const getLevelColor = (level) => {
    const colors = {
      'Beginner': 'text-green-600 bg-green-100',
      'Intermediate': 'text-yellow-600 bg-yellow-100',
      'Advanced': 'text-red-600 bg-red-100',
      'Expert': 'text-purple-600 bg-purple-100'
    };
    return colors[level] || 'text-gray-600 bg-gray-100';
  };

  const getLevelIcon = (level) => {
    const icons = {
      'Beginner': <Circle className="h-4 w-4" />,
      'Intermediate': <Star className="h-4 w-4" />,
      'Advanced': <Award className="h-4 w-4" />,
      'Expert': <Crown className="h-4 w-4" />
    };
    return icons[level] || <Circle className="h-4 w-4" />;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-green-600 bg-green-100';
    if (progress >= 60) return 'text-yellow-600 bg-yellow-100';
    if (progress >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSkillIcon = (category) => {
    const icons = {
      'Programming': <Zap className="h-5 w-5" />,
      'Design': <Eye className="h-5 w-5" />,
      'Data Science': <BarChart3 className="h-5 w-5" />,
      'Business': <Trophy className="h-5 w-5" />,
      'Marketing': <Target className="h-5 w-5" />,
      'Other': <BookOpen className="h-5 w-5" />
    };
    return icons[category] || <BookOpen className="h-5 w-5" />;
  };

  if (skillsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading skills data...</p>
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
                  <Brain className="h-12 w-12 mr-4 text-purple-500" />
                  Skills Dashboard
                </h1>
                <p className="text-xl text-dark-gray">
                  Track your skill development and identify growth opportunities
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-gray mb-1">Total Skills</div>
                <div className="text-3xl font-bold text-purple-600">{skills.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="coursehive-card p-4">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'skills', label: 'My Skills', icon: Brain },
                { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
                { id: 'gaps', label: 'Skill Gaps', icon: AlertCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white text-coursehive-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Skills Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Skill Distribution */}
              <div className="coursehive-card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <PieChart className="h-6 w-6 mr-2 text-blue-500" />
                  Skill Distribution
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analytics.skillDistribution?.map((category) => (
                    <div key={category.name} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{category.count}</div>
                      <p className="text-sm text-gray-600">{category.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Progress */}
              <div className="coursehive-card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-green-500" />
                  Skill Progress
                </h2>
                <div className="space-y-4">
                  {skills.slice(0, 5).map((skill) => (
                    <div key={skill._id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getSkillIcon(skill.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                              {skill.level}
                            </span>
                            <span className="text-sm text-gray-600">{skill.progress}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${skill.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="coursehive-card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Activity className="h-6 w-6 mr-2 text-orange-500" />
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  {analytics.recentActivity?.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {getSkillIcon(activity.category)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {getTrendIcon(activity.trend)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Skill Stats */}
              <div className="coursehive-card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                  Skill Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Skills</span>
                    <span className="font-bold text-gray-900">{skills.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Advanced Skills</span>
                    <span className="font-bold text-gray-900">
                      {skills.filter(s => s.level === 'Advanced' || s.level === 'Expert').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Avg. Progress</span>
                    <span className="font-bold text-gray-900">
                      {Math.round(skills.reduce((sum, s) => sum + s.progress, 0) / skills.length)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Skills Improved</span>
                    <span className="font-bold text-gray-900">
                      {skills.filter(s => s.trend > 0).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Skills */}
              <div className="coursehive-card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Top Skills
                </h3>
                <div className="space-y-3">
                  {skills
                    .sort((a, b) => b.progress - a.progress)
                    .slice(0, 5)
                    .map((skill, index) => (
                      <div key={skill._id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-500 text-white' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{skill.name}</p>
                          <p className="text-xs text-gray-600">{skill.progress}%</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="coursehive-card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAddSkill(true)}
                    className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Add New Skill
                  </button>
                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    View Recommendations
                  </button>
                  <button
                    onClick={() => setActiveTab('gaps')}
                    className="w-full p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    Check Skill Gaps
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="coursehive-card p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                {/* Search */}
                <div className="flex-1 w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search skills..."
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

                {/* Level Filter */}
                <div className="w-full lg:w-48">
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Skills List */}
            {filteredSkills.length > 0 ? (
              <div className="space-y-4">
                {filteredSkills.map((skill) => (
                  <div key={skill._id} className="coursehive-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getSkillIcon(skill.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{skill.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                              {skill.level}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                              {skill.category}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{skill.description}</p>
                          
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Progress</span>
                              <span className="text-sm text-gray-600">{skill.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${skill.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Skill Stats */}
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Added {formatDate(skill.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{skill.hoursSpent || 0} hours</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {getTrendIcon(skill.trend)}
                              <span className={getTrendColor(skill.trend)}>
                                {skill.trend > 0 ? '+' : ''}{skill.trend}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleSkillExpansion(skill._id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {expandedSkills.has(skill._id) ? 
                            <ChevronDown className="h-5 w-5" /> : 
                            <ChevronRight className="h-5 w-5" />
                          }
                        </button>
                        <button
                          onClick={() => setEditingSkill(skill)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteSkillMutation.mutate(skill._id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedSkills.has(skill._id) && (
                      <div className="border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Learning Resources */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Learning Resources</h4>
                            <div className="space-y-2">
                              {skill.resources?.map((resource, index) => (
                                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                  <BookOpen className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-700">{resource.title}</span>
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Skill Tags */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                              {skill.tags?.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="coursehive-card p-12 text-center">
                <Brain className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedCategory || selectedLevel
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Start tracking your skills to build your professional profile!'
                  }
                </p>
                {!searchTerm && !selectedCategory && !selectedLevel && (
                  <button
                    onClick={() => setShowAddSkill(true)}
                    className="btn-primary"
                  >
                    Add Your First Skill
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="coursehive-card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Lightbulb className="h-6 w-6 mr-2 text-yellow-500" />
                Recommended Skills
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((recommendation) => (
                  <div key={recommendation._id} className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      {getSkillIcon(recommendation.category)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{recommendation.name}</h3>
                        <p className="text-sm text-gray-600">{recommendation.category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">{recommendation.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>{recommendation.demand}% demand</span>
                      </div>
                      <button
                        onClick={() => addSkillMutation.mutate({
                          name: recommendation.name,
                          category: recommendation.category,
                          description: recommendation.description,
                          level: 'Beginner',
                          progress: 0
                        })}
                        className="btn-primary text-sm"
                      >
                        Add Skill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gaps' && (
          <div className="space-y-6">
            <div className="coursehive-card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <AlertCircle className="h-6 w-6 mr-2 text-orange-500" />
                Skill Gaps Analysis
              </h2>
              <div className="space-y-4">
                {gaps.map((gap) => (
                  <div key={gap._id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{gap.title}</h3>
                        <p className="text-sm text-gray-700 mb-3">{gap.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Target className="h-4 w-4" />
                            <span>{gap.skillsNeeded} skills needed</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{gap.estimatedTime} hours</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{gap.priority} priority</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('recommendations')}
                        className="btn-primary text-sm"
                      >
                        View Recommendations
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Skill Modal */}
        {showAddSkill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Add New Skill</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                addSkillMutation.mutate({
                  name: formData.get('name'),
                  description: formData.get('description'),
                  category: formData.get('category'),
                  level: formData.get('level'),
                  progress: parseInt(formData.get('progress')),
                  tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
                  resources: []
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="input w-full"
                      placeholder="e.g., React.js"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      required
                      rows={3}
                      className="input w-full"
                      placeholder="Describe your experience with this skill..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select name="category" required className="input w-full">
                        <option value="">Select category</option>
                        <option value="Programming">Programming</option>
                        <option value="Design">Design</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Business">Business</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                      <select name="level" required className="input w-full">
                        <option value="">Select level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Progress (%)</label>
                    <input
                      type="number"
                      name="progress"
                      min="0"
                      max="100"
                      defaultValue="0"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      name="tags"
                      className="input w-full"
                      placeholder="e.g., javascript, frontend, ui"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    disabled={addSkillMutation.isLoading}
                    className="btn-primary flex-1"
                  >
                    Add Skill
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSkill(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Skills;

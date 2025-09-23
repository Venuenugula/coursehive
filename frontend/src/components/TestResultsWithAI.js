import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BookOpen, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from './ui/LoadingSpinner';

const TestResultsWithAI = ({ attemptId, testId }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: attemptData, isLoading: attemptLoading } = useQuery(
    ['attempt', attemptId],
    () => axios.get(`/api/tests/${testId}/attempts`).then(res => 
      res.data.attempts.find(attempt => attempt._id === attemptId)
    ),
    { enabled: !!attemptId }
  );

  const { data: testData, isLoading: testLoading } = useQuery(
    ['test', testId],
    () => axios.get(`/api/tests/${testId}`).then(res => res.data.test),
    { enabled: !!testId }
  );

  const { data: aiFeedback, isLoading: feedbackLoading } = useQuery(
    ['aiFeedback', attemptId],
    () => axios.get(`/api/ai-feedback/${attemptId}`).then(res => res.data),
    { enabled: !!attemptId && !!attemptData?.aiFeedbackId }
  );

  const { data: suggestedContent, isLoading: contentLoading } = useQuery(
    ['suggestedContent', attemptId],
    () => axios.get(`/api/content/suggested?attemptId=${attemptId}`).then(res => res.data),
    { enabled: !!attemptId }
  );

  if (attemptLoading || testLoading) {
    return <LoadingSpinner size="lg" className="min-h-screen" />;
  }

  const attempt = attemptData;
  const test = testData;
  const feedback = aiFeedback?.feedback;

  if (!attempt || !test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Test attempt not found</h3>
          <p className="text-gray-600">The requested test attempt could not be found.</p>
        </div>
      </div>
    );
  }

  const percentage = Math.round((attempt.score / test.totalMarks) * 100);
  const passed = percentage >= test.passingMarks;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'feedback', label: 'AI Feedback', icon: Brain },
    { id: 'suggestions', label: 'Study Suggestions', icon: Lightbulb }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
              <p className="text-gray-600 mt-2">{test.title}</p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {percentage}%
              </div>
              <div className="text-sm text-gray-500">
                {attempt.score} / {test.totalMarks} marks
              </div>
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
                {passed ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {passed ? 'Passed' : 'Failed'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((attempt.answers.filter(a => a.isCorrect).length / test.questions.length) * 100)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Time Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Questions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {test.questions.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Review</h3>
                <div className="space-y-4">
                  {test.questions.map((question, index) => {
                    const answer = attempt.answers[index];
                    const isCorrect = answer?.isCorrect;
                    
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-sm font-medium text-gray-500 mr-2">Q{index + 1}:</span>
                              <span className="text-sm text-gray-900">{question.question}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>Topic: {question.topic}</span>
                              <span className={`px-2 py-1 rounded-full ${getDifficultyColor(question.difficulty)}`}>
                                {question.difficulty}
                              </span>
                              <span>Points: {question.points}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`p-2 rounded-lg text-sm ${
                                optionIndex === question.correctAnswer
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : optionIndex === answer?.selectedAnswer && !isCorrect
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-gray-50 text-gray-700'
                              }`}
                            >
                              {option}
                              {optionIndex === question.correctAnswer && (
                                <span className="ml-2 text-xs font-medium">(Correct)</span>
                              )}
                              {optionIndex === answer?.selectedAnswer && !isCorrect && (
                                <span className="ml-2 text-xs font-medium">(Your Answer)</span>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {question.explanation && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Feedback Tab */}
            {activeTab === 'feedback' && (
              <div>
                {feedbackLoading ? (
                  <LoadingSpinner />
                ) : feedback ? (
                  <div className="space-y-6">
                    {/* Overall Performance */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
                          <ul className="space-y-1">
                            {feedback.strengths?.map((strength, index) => (
                              <li key={index} className="flex items-center text-sm text-green-700">
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Areas for Improvement</h4>
                          <ul className="space-y-1">
                            {feedback.weaknesses?.map((weakness, index) => (
                              <li key={index} className="flex items-center text-sm text-red-700">
                                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Topic Mistakes */}
                    {feedback.topicMistakes && feedback.topicMistakes.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Topic Analysis</h3>
                        <div className="space-y-4">
                          {feedback.topicMistakes.map((mistake, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{mistake.topic}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(mistake.severity)}`}>
                                  {mistake.severity} priority
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{mistake.explanation}</p>
                              <div className="text-xs text-gray-500">
                                Mistake Type: {mistake.mistakeType} | Question: {mistake.questionIndex + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Improvement Suggestions */}
                    {feedback.improvementSuggestions && feedback.improvementSuggestions.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Improvement Suggestions</h3>
                        <div className="space-y-3">
                          {feedback.improvementSuggestions.map((suggestion, index) => (
                            <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-start">
                                <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                                <div>
                                  <h4 className="font-medium text-yellow-900">{suggestion.area}</h4>
                                  <p className="text-sm text-yellow-800 mt-1">{suggestion.suggestion}</p>
                                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                                    {suggestion.priority} priority
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">AI Feedback Unavailable</h3>
                    <p className="text-gray-600">AI analysis is not available for this test attempt.</p>
                  </div>
                )}
              </div>
            )}

            {/* Study Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <div>
                {contentLoading ? (
                  <LoadingSpinner />
                ) : suggestedContent?.content?.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Study Materials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {suggestedContent.content.map((item) => (
                        <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority || 'medium')}`}>
                              {item.priority || 'medium'} priority
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{item.type} • {item.subject}</span>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Suggestions Available</h3>
                    <p className="text-gray-600">No study materials are currently recommended for this test.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResultsWithAI;

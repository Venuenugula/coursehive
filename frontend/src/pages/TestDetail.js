import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { 
  Clock, 
  CheckCircle, 
  Circle, 
  ArrowLeft, 
  ArrowRight,
  Flag,
  BookOpen,
  Target,
  Users,
  Star,
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());

  // Fetch test details
  const { data: testData, isLoading } = useQuery(
    ['test', id],
    () => axios.get(`/api/tests/${id}`).then(res => res.data),
    { enabled: !!id }
  );

  // Submit test mutation
  const submitTestMutation = useMutation(
    (testData) => axios.post(`/api/tests/${id}/submit`, testData).then(res => res.data)
  );

  // Mock test data for demonstration
  const mockTest = {
    _id: id,
    title: "JavaScript Fundamentals Quiz",
    description: "Test your knowledge of JavaScript basics including variables, functions, and DOM manipulation.",
    subject: "Programming",
    difficulty: "Medium",
    duration: 30,
    questions: [
      {
        id: 1,
        question: "What is the correct way to declare a variable in JavaScript?",
        options: [
          "var myVar = 5;",
          "variable myVar = 5;",
          "v myVar = 5;",
          "declare myVar = 5;"
        ],
        correctAnswer: 0,
        explanation: "The 'var' keyword is used to declare variables in JavaScript."
      },
      {
        id: 2,
        question: "Which method is used to add an element to the end of an array?",
        options: [
          "push()",
          "pop()",
          "shift()",
          "unshift()"
        ],
        correctAnswer: 0,
        explanation: "The push() method adds one or more elements to the end of an array."
      },
      {
        id: 3,
        question: "What does the 'typeof' operator return for an array?",
        options: [
          "array",
          "object",
          "undefined",
          "null"
        ],
        correctAnswer: 1,
        explanation: "In JavaScript, arrays are objects, so typeof returns 'object'."
      },
      {
        id: 4,
        question: "Which of the following is NOT a JavaScript data type?",
        options: [
          "string",
          "number",
          "boolean",
          "float"
        ],
        correctAnswer: 3,
        explanation: "JavaScript has number type, not separate float type."
      },
      {
        id: 5,
        question: "What is the result of: console.log(2 + '2')?",
        options: [
          "4",
          "22",
          "NaN",
          "Error"
        ],
        correctAnswer: 1,
        explanation: "JavaScript performs type coercion, converting the number to string and concatenating."
      }
    ],
    totalQuestions: 5,
    passingScore: 60
  };

  const test = testData?.test || mockTest;
  const questions = test?.questions || [];

  useEffect(() => {
    if (isTestStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isTestStarted && timeLeft === 0) {
      handleSubmitTest();
    }
  }, [isTestStarted, timeLeft]);

  const startTest = () => {
    setIsTestStarted(true);
    setTimeLeft(test.duration * 60); // Convert minutes to seconds
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFlagQuestion = (questionId) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmitTest = async () => {
    setIsTestCompleted(true);
    setIsTestStarted(false);
    
    try {
      const result = await submitTestMutation.mutateAsync({
        answers,
        timeSpent: (test.duration * 60) - timeLeft,
        completedAt: new Date().toISOString()
      });
      
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting test:', error);
      // Show mock results for demonstration
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach(question => {
      const questionId = question._id || question.id;
      if (answers[questionId] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!test || !questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Not Found</h2>
          <p className="text-gray-600 mb-4">The test you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/tests')}
            className="btn btn-primary"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const isPassed = score >= test.passingScore;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <button
              onClick={() => navigate('/tests')}
              className="btn btn-secondary mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </button>
            <h1 className="text-4xl font-bold gradient-text mb-4">Test Results</h1>
          </div>

          <div className="card-interactive p-8 text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
              isPassed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isPassed ? (
                <CheckCircle className="h-12 w-12 text-green-600" />
              ) : (
                <AlertCircle className="h-12 w-12 text-red-600" />
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isPassed ? 'Congratulations!' : 'Keep Learning!'}
            </h2>
            
            <div className="text-6xl font-bold mb-4">
              <span className={isPassed ? 'text-green-600' : 'text-red-600'}>
                {score}%
              </span>
            </div>
            
            <p className="text-xl text-gray-600 mb-8">
              {isPassed 
                ? `You passed the test! You scored ${score}% which is above the passing score of ${test.passingScore}%.`
                : `You scored ${score}%. The passing score is ${test.passingScore}%. Keep studying and try again!`
              }
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(answers).filter((answer, index) => 
                    answer === questions[index]?.correctAnswer
                  ).length}
                </div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime((test.duration * 60) - timeLeft)}
                </div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowResults(false);
                  setIsTestCompleted(false);
                  setCurrentQuestion(0);
                  setAnswers({});
                  setFlaggedQuestions(new Set());
                  setTimeLeft(0);
                }}
                className="btn btn-primary mr-4"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Test
              </button>
              <button
                onClick={() => navigate('/tests')}
                className="btn btn-secondary"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Browse More Tests
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isTestStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <button
              onClick={() => navigate('/tests')}
              className="btn btn-secondary mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </button>
            <h1 className="text-4xl font-bold gradient-text mb-4">{test.title}</h1>
          </div>

          <div className="card-interactive p-8">
            <div className="text-center mb-8">
              <p className="text-xl text-gray-600 mb-6">{test.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-6 w-6 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-800">Questions</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{test.totalQuestions}</div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-6 w-6 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">Duration</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{test.duration} min</div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-6 w-6 text-purple-600 mr-2" />
                    <span className="font-semibold text-purple-800">Difficulty</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(test.difficulty)}`}>
                    {test.difficulty}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                <h3 className="font-semibold text-yellow-800 mb-2">Test Instructions:</h3>
                <ul className="text-left text-yellow-700 space-y-1">
                  <li>• Read each question carefully before selecting your answer</li>
                  <li>• You can flag questions for review using the flag button</li>
                  <li>• Use the navigation buttons to move between questions</li>
                  <li>• The test will auto-submit when time runs out</li>
                  <li>• You can submit early if you finish before time expires</li>
                </ul>
              </div>

              <button
                onClick={startTest}
                className="btn btn-primary btn-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="coursehive-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-charcoal">{test.title}</h1>
              <p className="text-dark-gray">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-red-500" />
                  <span className="text-lg font-bold text-red-600">{formatTime(timeLeft)}</span>
                </div>
                <button
                  onClick={() => handleFlagQuestion(currentQ._id || currentQ.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    flaggedQuestions.has(currentQ._id || currentQ.id) 
                      ? 'bg-yellow-100 text-yellow-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-yellow-100'
                  }`}
                >
                  <Flag className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="card-interactive p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {currentQ.question}
          </h2>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  answers[currentQ._id || currentQ.id] === index
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQ._id || currentQ.id}`}
                  value={index}
                  checked={answers[currentQ._id || currentQ.id] === index}
                  onChange={() => handleAnswerSelect(currentQ._id || currentQ.id, index)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                  answers[currentQ._id || currentQ.id] === index
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                }`}>
                  {answers[currentQ._id || currentQ.id] === index && (
                    <Circle className="h-3 w-3 text-white fill-current" />
                  )}
                </div>
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className="btn btn-secondary disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </button>
          
          <div className="flex items-center space-x-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? 'bg-primary-500 text-white'
                    : answers[questions[index]._id || questions[index].id] !== undefined
                    ? 'bg-green-100 text-green-600'
                    : flaggedQuestions.has(questions[index]._id || questions[index].id)
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmitTest}
              className="btn btn-primary"
            >
              Submit Test
              <CheckCircle className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="btn btn-primary"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestDetail;
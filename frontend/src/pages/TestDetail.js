import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TestResultsWithAI from '../components/TestResultsWithAI';

const TestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [attemptId, setAttemptId] = useState(null);

  const questions = [
    {
      id: 1,
      question: "What is the primary purpose of React?",
      options: [
        "To build user interfaces",
        "To manage databases",
        "To handle server requests",
        "To style web pages"
      ],
      correct: 0
    },
    {
      id: 2,
      question: "Which hook is used to manage state in functional components?",
      options: [
        "useEffect",
        "useState",
        "useContext",
        "useReducer"
      ],
      correct: 1
    }
  ];

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Simulate test submission
    const mockAttemptId = 'attempt_' + Date.now();
    setAttemptId(mockAttemptId);
    setTestCompleted(true);
  };

  // Show AI feedback results if test is completed
  if (testCompleted) {
    return <TestResultsWithAI attemptId={attemptId} testId={id} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Test #{id}
            </h1>
            <p className="text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          {questions[currentQuestion] && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6">
                {questions[currentQuestion].question}
              </h2>
              
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <label
                    key={index}
                    className={`block p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      answers[questions[currentQuestion].id] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${questions[currentQuestion].id}`}
                      value={index}
                      checked={answers[questions[currentQuestion].id] === index}
                      onChange={() => handleAnswerSelect(questions[currentQuestion].id, index)}
                      className="sr-only"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <button
              onClick={currentQuestion === questions.length - 1 ? handleSubmit : handleNext}
              disabled={currentQuestion === questions.length - 1}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDetail;

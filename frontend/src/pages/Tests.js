import React from 'react';

const Tests = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Practice Tests
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Test your knowledge with our comprehensive assessments
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Quick Quiz</h3>
            <p className="text-gray-600 mb-4">Short 10-question quizzes to test basic concepts.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Start Quiz
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Mock Exam</h3>
            <p className="text-gray-600 mb-4">Full-length practice exams with detailed feedback.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Start Exam
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Chapter Tests</h3>
            <p className="text-gray-600 mb-4">Test your understanding of specific topics.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              View Chapters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tests;

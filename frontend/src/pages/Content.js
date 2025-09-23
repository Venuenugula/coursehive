import React from 'react';

const Content = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Course Content
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Explore our comprehensive learning materials
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Video Lessons</h3>
            <p className="text-gray-600">Interactive video content to enhance your learning experience.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Reading Materials</h3>
            <p className="text-gray-600">Comprehensive articles and documentation.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Practice Exercises</h3>
            <p className="text-gray-600">Hands-on exercises to reinforce your knowledge.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;

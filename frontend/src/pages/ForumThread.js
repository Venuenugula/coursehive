import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const ForumThread = () => {
  const { id } = useParams();
  const [newReply, setNewReply] = useState('');

  const thread = {
    id: parseInt(id),
    title: "Getting started with React",
    author: "John Doe",
    content: "I'm new to React and looking for some guidance on how to get started. What are the best resources and practices I should follow?",
    createdAt: "2 hours ago",
    replies: [
      {
        id: 1,
        author: "Jane Smith",
        content: "Welcome to React! I'd recommend starting with the official React documentation and building small projects to practice.",
        createdAt: "1 hour ago"
      },
      {
        id: 2,
        author: "Mike Johnson",
        content: "The React tutorial on the official website is excellent. Also, try building a todo app as your first project.",
        createdAt: "30 minutes ago"
      }
    ]
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (newReply.trim()) {
      // Handle reply submission
      console.log('New reply:', newReply);
      setNewReply('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <a href="/forum" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Forum
          </a>
          <h1 className="text-3xl font-bold text-gray-900">{thread.title}</h1>
          <p className="text-gray-600 mt-2">
            By {thread.author} • {thread.createdAt}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-gray-900 leading-relaxed">{thread.content}</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Replies ({thread.replies.length})</h2>
          
          {thread.replies.map((reply) => (
            <div key={reply.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-3">
                <h3 className="font-semibold text-gray-900">{reply.author}</h3>
                <span className="text-gray-500 text-sm ml-2">• {reply.createdAt}</span>
              </div>
              <p className="text-gray-700">{reply.content}</p>
            </div>
          ))}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Add a Reply</h3>
            <form onSubmit={handleReplySubmit}>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Write your reply here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
              <button
                type="submit"
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Post Reply
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumThread;

import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Upload,
  Calendar
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const MySubmissions = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('content');

  // Fetch user's content submissions
  const { data: contentSubmissionsData, isLoading: contentLoading } = useQuery(
    'myContentSubmissions',
    async () => {
      const response = await axios.get('/api/content/my-submissions');
      return response.data;
    },
    { enabled: !!user }
  );

  const contentSubmissions = contentSubmissionsData?.content || [];

  // Fetch user's test submissions
  const { data: testSubmissionsData, isLoading: testLoading } = useQuery(
    'myTestSubmissions',
    async () => {
      const response = await axios.get('/api/tests/my-submissions');
      return response.data;
    },
    { enabled: !!user }
  );

  const testSubmissions = testSubmissionsData?.tests || [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (contentLoading || testLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
          <p className="mt-2 text-gray-600">
            Track the status of your content and test submissions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('content')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'content'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-5 w-5 inline mr-2" />
                Content Submissions ({contentSubmissions?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Upload className="h-5 w-5 inline mr-2" />
                Test Submissions ({testSubmissions?.length || 0})
              </button>
            </nav>
          </div>
        </div>

        {/* Content Submissions */}
        {activeTab === 'content' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Content Submissions
              </h3>
              {contentSubmissions?.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No content submissions
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't submitted any content yet.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Content
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {contentSubmissions?.map((submission) => (
                    <div
                      key={submission._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900">
                              {submission.title}
                            </h4>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                submission.status
                              )}`}
                            >
                              {getStatusIcon(submission.status)}
                              <span className="ml-1 capitalize">
                                {submission.status}
                              </span>
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {submission.description}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Submitted: {formatDate(submission.createdAt)}
                            </span>
                            <span className="capitalize">
                              Type: {submission.type.replace('_', ' ')}
                            </span>
                            <span className="capitalize">
                              Subject: {submission.subject}
                            </span>
                          </div>
                          {submission.rejectionReason && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-800">
                                <strong>Rejection Reason:</strong>{' '}
                                {submission.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/content/${submission._id}`}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Test Submissions */}
        {activeTab === 'tests' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Test Submissions
              </h3>
              {testSubmissions?.length === 0 ? (
                <div className="text-center py-12">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No test submissions
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't created any tests yet.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Create Test
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {testSubmissions?.map((submission) => (
                    <div
                      key={submission._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900">
                              {submission.title}
                            </h4>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                submission.status
                              )}`}
                            >
                              {getStatusIcon(submission.status)}
                              <span className="ml-1 capitalize">
                                {submission.status}
                              </span>
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {submission.description}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Created: {formatDate(submission.createdAt)}
                            </span>
                            <span>
                              Questions: {submission.questions?.length || 0}
                            </span>
                            <span className="capitalize">
                              Subject: {submission.subject}
                            </span>
                          </div>
                          {submission.rejectionReason && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-800">
                                <strong>Rejection Reason:</strong>{' '}
                                {submission.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/tests/${submission._id}`}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubmissions;

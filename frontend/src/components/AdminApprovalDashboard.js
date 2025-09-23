import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  BookOpen,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from './ui/LoadingSpinner';

const AdminApprovalDashboard = () => {
  const [activeTab, setActiveTab] = useState('content');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: contentData, isLoading: contentLoading } = useQuery(
    'pendingContent',
    () => axios.get('/api/admin/content/pending').then(res => res.data),
    { refetchInterval: 10000 }
  );

  const { data: testsData, isLoading: testsLoading } = useQuery(
    'pendingTests',
    () => axios.get('/api/admin/tests/pending').then(res => res.data),
    { refetchInterval: 10000 }
  );

  const approveContentMutation = useMutation(
    (id) => axios.post(`/api/admin/content/${id}/approve`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pendingContent');
        queryClient.invalidateQueries('adminDashboard');
      }
    }
  );

  const rejectContentMutation = useMutation(
    ({ id, reason }) => axios.post(`/api/admin/content/${id}/reject`, { reason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pendingContent');
        queryClient.invalidateQueries('adminDashboard');
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedItem(null);
      }
    }
  );

  const approveTestMutation = useMutation(
    (id) => axios.post(`/api/admin/tests/${id}/approve`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pendingTests');
        queryClient.invalidateQueries('adminDashboard');
      }
    }
  );

  const rejectTestMutation = useMutation(
    ({ id, reason }) => axios.post(`/api/admin/tests/${id}/reject`, { reason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pendingTests');
        queryClient.invalidateQueries('adminDashboard');
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedItem(null);
      }
    }
  );

  const handleApprove = (item, type) => {
    if (type === 'content') {
      approveContentMutation.mutate(item._id);
    } else {
      approveTestMutation.mutate(item._id);
    }
  };

  const handleReject = (item, type) => {
    setSelectedItem({ ...item, type });
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectionReason.trim()) return;
    
    if (selectedItem.type === 'content') {
      rejectContentMutation.mutate({ id: selectedItem._id, reason: rejectionReason });
    } else {
      rejectTestMutation.mutate({ id: selectedItem._id, reason: rejectionReason });
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

  const tabs = [
    { 
      id: 'content', 
      label: 'Content', 
      count: contentData?.pagination?.totalItems || 0,
      icon: FileText
    },
    { 
      id: 'tests', 
      label: 'Tests', 
      count: testsData?.pagination?.totalItems || 0,
      icon: BookOpen
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Approval Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Review and approve content and tests submitted by students.
          </p>
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
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'content' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Content</h2>
                {contentLoading ? (
                  <LoadingSpinner />
                ) : contentData?.content?.length > 0 ? (
                  <div className="space-y-4">
                    {contentData.content.map((item) => (
                      <div key={item._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <FileText className="h-6 w-6 text-gray-400 mr-3" />
                              <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-3">
                              <div>
                                <span className="font-medium">Subject:</span> {item.subject}
                              </div>
                              <div>
                                <span className="font-medium">Type:</span> {item.type}
                              </div>
                              <div>
                                <span className="font-medium">Difficulty:</span> {item.difficulty}
                              </div>
                              <div>
                                <span className="font-medium">Tags:</span> {item.tags?.join(', ') || 'None'}
                              </div>
                            </div>

                            <div className="flex items-center text-sm text-gray-500 mb-4">
                              <User className="h-4 w-4 mr-1" />
                              <span>Submitted by {item.uploadedBy?.name} ({item.uploadedBy?.email})</span>
                              <Calendar className="h-4 w-4 ml-4 mr-1" />
                              <span>{formatDate(item.createdAt)}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                              >
                                View Content
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end space-x-3">
                          <button
                            onClick={() => handleReject(item, 'content')}
                            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(item, 'content')}
                            disabled={approveContentMutation.isLoading}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {approveContentMutation.isLoading ? 'Approving...' : 'Approve'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending content</h3>
                    <p className="text-gray-600">All content has been reviewed.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tests' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Tests</h2>
                {testsLoading ? (
                  <LoadingSpinner />
                ) : testsData?.tests?.length > 0 ? (
                  <div className="space-y-4">
                    {testsData.tests.map((test) => (
                      <div key={test._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <BookOpen className="h-6 w-6 text-gray-400 mr-3" />
                              <h3 className="text-lg font-medium text-gray-900">{test.title}</h3>
                              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-3">
                              <div>
                                <span className="font-medium">Subject:</span> {test.subject}
                              </div>
                              <div>
                                <span className="font-medium">Questions:</span> {test.questions.length}
                              </div>
                              <div>
                                <span className="font-medium">Duration:</span> {test.duration} min
                              </div>
                              <div>
                                <span className="font-medium">Marks:</span> {test.totalMarks}
                              </div>
                            </div>

                            <div className="flex items-center text-sm text-gray-500 mb-4">
                              <User className="h-4 w-4 mr-1" />
                              <span>Created by {test.createdBy?.name} ({test.createdBy?.email})</span>
                              <Calendar className="h-4 w-4 ml-4 mr-1" />
                              <span>{formatDate(test.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end space-x-3">
                          <button
                            onClick={() => handleReject(test, 'tests')}
                            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(test, 'tests')}
                            disabled={approveTestMutation.isLoading}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {approveTestMutation.isLoading ? 'Approving...' : 'Approve'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending tests</h3>
                    <p className="text-gray-600">All tests have been reviewed.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Reject {selectedItem?.type === 'content' ? 'Content' : 'Test'}</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this {selectedItem?.type === 'content' ? 'content' : 'test'}.
              </p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter rejection reason..."
              />
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={!rejectionReason.trim() || rejectContentMutation.isLoading || rejectTestMutation.isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {rejectContentMutation.isLoading || rejectTestMutation.isLoading ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApprovalDashboard;

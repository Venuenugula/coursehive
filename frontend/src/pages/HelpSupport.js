import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  Phone, 
  Search, 
  BookOpen, 
  Video, 
  FileText,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  User,
  CreditCard
} from 'lucide-react';

const HelpSupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen },
    { id: 'getting-started', name: 'Getting Started', icon: CheckCircle },
    { id: 'account', name: 'Account & Profile', icon: User },
    { id: 'learning', name: 'Learning & Tests', icon: BookOpen },
    { id: 'technical', name: 'Technical Issues', icon: AlertCircle },
    { id: 'billing', name: 'Billing & Plans', icon: CreditCard }
  ];

  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I get started with CourseHive?',
      answer: 'Getting started with CourseHive is easy! First, create your account, then explore our resources, take tests, and track your progress. Start by visiting the Dashboard to see your learning overview.',
      tags: ['beginner', 'setup', 'onboarding']
    },
    {
      id: 2,
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'You can update your profile by going to Settings > Profile. Here you can change your name, email, bio, location, and profile picture. All changes are saved automatically.',
      tags: ['profile', 'settings', 'personal']
    },
    {
      id: 3,
      category: 'learning',
      question: 'How do I take a test?',
      answer: 'Navigate to the Tests section from the sidebar, browse available tests, and click on any test to start. You can filter tests by subject, difficulty, or duration. Each test shows your progress and results.',
      tags: ['tests', 'learning', 'assessment']
    },
    {
      id: 4,
      category: 'technical',
      question: 'The page is loading slowly, what should I do?',
      answer: 'Try refreshing the page, clearing your browser cache, or checking your internet connection. If the issue persists, contact our support team with details about your browser and device.',
      tags: ['performance', 'browser', 'troubleshooting']
    },
    {
      id: 5,
      category: 'learning',
      question: 'How do I bookmark resources?',
      answer: 'When viewing resources, click the bookmark icon (heart) on any resource card. Bookmarked resources can be accessed from the Resources section by filtering for "Bookmarked" items.',
      tags: ['bookmarks', 'resources', 'saving']
    },
    {
      id: 6,
      category: 'account',
      question: 'How do I change my password?',
      answer: 'Go to Settings > Account > Security. Click "Change Password" and follow the instructions. You\'ll need to enter your current password and create a new secure password.',
      tags: ['password', 'security', 'account']
    },
    {
      id: 7,
      category: 'technical',
      question: 'I\'m having trouble with the AI Tutor',
      answer: 'The AI Tutor requires a stable internet connection. Try refreshing the page or clearing your browser cache. If questions aren\'t being answered, check if you\'re asking clear, specific questions.',
      tags: ['ai-tutor', 'chat', 'troubleshooting']
    },
    {
      id: 8,
      category: 'billing',
      question: 'How do I upgrade my plan?',
      answer: 'Currently, CourseHive is free for all users. We may introduce premium features in the future. Stay tuned for updates about new features and pricing plans.',
      tags: ['billing', 'plans', 'upgrade']
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const quickActions = [
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: MessageSquare,
      color: 'coursehive-primary',
      action: () => window.open('mailto:coursehive.pro@gmail.com')
    },
    {
      title: 'Report a Bug',
      description: 'Help us improve by reporting issues',
      icon: AlertCircle,
      color: 'coursehive-warm',
      action: () => window.open('mailto:coursehive.pro@gmail.com')
    },
    {
      title: 'Feature Request',
      description: 'Suggest new features',
      icon: CheckCircle,
      color: 'coursehive-accent',
      action: () => window.open('mailto:coursehive.pro@gmail.com')
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: MessageSquare,
      color: 'coursehive-secondary',
      action: () => alert('Live chat coming soon!')
    }
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="coursehive-card p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Help & Support
                </h1>
                <p className="text-sm text-gray-600">
                  Find answers, get help, and connect with our support team
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-dark-gray mb-1">Support Status</div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-coursehive-accent rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-coursehive-accent">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className="coursehive-card p-6 text-left hover:scale-105 transition-all duration-300"
                >
                  <div className={`w-12 h-12 bg-${action.color} bg-opacity-10 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 text-${action.color}`} />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="coursehive-card p-4 mb-6">
              <h3 className="font-semibold text-charcoal mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                        selectedCategory === category.id
                          ? 'bg-coursehive-primary text-white'
                          : 'text-dark-gray hover:bg-coursehive-light-blue hover:text-coursehive-primary'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact Info */}
            <div className="coursehive-card p-4">
              <h3 className="font-semibold text-charcoal mb-4">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-coursehive-primary" />
                  <span className="text-sm text-dark-gray">coursehive.pro@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-coursehive-primary" />
                  <span className="text-sm text-dark-gray">24/7 Support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-4 w-4 text-coursehive-primary" />
                  <span className="text-sm text-dark-gray">Live Chat Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="coursehive-card p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-gray" />
                  <input
                    type="text"
                    placeholder="Search help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-medium-gray rounded-lg focus:ring-2 focus:ring-coursehive-primary focus:border-coursehive-primary bg-pure-white"
                  />
                </div>
                <div className="text-sm text-dark-gray">
                  {filteredFaqs.length} articles found
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="coursehive-card p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Frequently Asked Questions</h2>
              
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-dark-gray mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-charcoal mb-2">No articles found</h3>
                  <p className="text-dark-gray">Try adjusting your search terms or browse different categories.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <div key={faq.id} className="border border-medium-gray rounded-lg">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-coursehive-light-blue transition-colors"
                      >
                        <h3 className="text-sm font-medium text-gray-900">{faq.question}</h3>
                        {expandedFaq === faq.id ? (
                          <ChevronDown className="h-5 w-5 text-dark-gray" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-dark-gray" />
                        )}
                      </button>
                      
                      {expandedFaq === faq.id && (
                        <div className="px-4 pb-4 border-t border-medium-gray">
                          <div className="pt-4">
                            <p className="text-sm text-gray-600 mb-4">{faq.answer}</p>
                            <div className="flex flex-wrap gap-2">
                              {faq.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-coursehive-light-blue text-coursehive-primary text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Resources */}
            <div className="coursehive-card p-6 mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Additional Resources</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <BookOpen className="h-5 w-5 text-coursehive-primary mt-1" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Documentation</h3>
                      <p className="text-xs text-gray-600">Comprehensive guides and tutorials</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Video className="h-5 w-5 text-coursehive-primary mt-1" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Video Tutorials</h3>
                      <p className="text-xs text-gray-600">Step-by-step video guides</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-coursehive-primary mt-1" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">User Guide</h3>
                      <p className="text-xs text-gray-600">Complete user manual</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <ExternalLink className="h-5 w-5 text-coursehive-primary mt-1" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Community Forum</h3>
                      <p className="text-xs text-gray-600">Connect with other learners</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Brain, 
  ArrowRight, 
  CheckCircle,
  Star,
  TrendingUp
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Comprehensive Study Materials',
      description: 'Access notes, previous papers, and question banks from trusted sources',
      color: 'text-blue-600'
    },
    {
      icon: Brain,
      title: 'AI-Powered Evaluation',
      description: 'Get personalized feedback and study recommendations from our AI evaluator',
      color: 'text-purple-600'
    },
    {
      icon: Users,
      title: 'Peer Discussion Forums',
      description: 'Connect with fellow students and discuss topics in organized forums',
      color: 'text-green-600'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track your progress with detailed analytics and leaderboards',
      color: 'text-orange-600'
    }
  ];

  const stats = [
    { label: 'Active Students', value: '10,000+' },
    { label: 'Study Materials', value: '50,000+' },
    { label: 'Practice Tests', value: '5,000+' },
    { label: 'Success Rate', value: '95%' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'JEE Aspirant',
      content: 'CourseHive helped me improve my JEE score by 200 points! The AI feedback was incredibly helpful.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'NEET Student',
      content: 'The study materials are comprehensive and the forum discussions really helped clarify my doubts.',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'GATE Candidate',
      content: 'The performance analytics helped me identify my weak areas and focus my preparation effectively.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/50 to-accent-600/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8">
              <img 
                src="/logo.jpg" 
                alt="CourseHive Logo" 
                className="h-20 w-20 mx-auto rounded-2xl shadow-strong floating-animation"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 fade-in">
              Master Your Exams with
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                CourseHive
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-4xl mx-auto slide-up">
              Your centralized platform for academic and competitive exam preparation. 
              Access comprehensive study materials, practice tests, and AI-powered feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center slide-up">
              {user ? (
                <Link
                  to="/dashboard"
                  className="btn btn-lg btn-warning px-10 py-5 text-xl font-bold"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn btn-lg btn-warning px-10 py-5 text-xl font-bold"
                  >
                    Get Started Free
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-10 py-5 text-xl font-bold"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and resources you need 
              to excel in your academic and competitive exams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card-interactive p-8 text-center group">
                  <div className={`${feature.color} mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-16 w-16" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and begin your journey to academic excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Sign Up & Explore
              </h3>
              <p className="text-gray-600">
                Create your account and browse our extensive collection of study materials
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Take Practice Tests
              </h3>
              <p className="text-gray-600">
                Test your knowledge with our comprehensive practice tests and mock exams
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Get AI Feedback
              </h3>
              <p className="text-gray-600">
                Receive personalized feedback and study recommendations to improve your performance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of successful students who have achieved their academic goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Success Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already using CourseHive to achieve their academic goals
          </p>
          {!user && (
            <Link
              to="/register"
              className="btn btn-lg bg-yellow-400 text-gray-900 hover:bg-yellow-300 px-8 py-4 text-lg font-semibold"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

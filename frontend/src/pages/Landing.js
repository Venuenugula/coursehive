import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Brain, 
  TrendingUp, 
  Award, 
  Zap,
  ChevronRight,
  Star,
  CheckCircle,
  ArrowRight,
  Target,
  BarChart3,
  MessageSquare,
  Shield,
  Clock,
  Globe,
  Heart,
  Sparkles,
  Play,
  Download,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-pure-white text-charcoal font-sans">
      {/* Navigation */}
      <nav className="coursehive-navbar px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.jpg" 
              alt="CourseHive Logo" 
              className="h-10 w-10 rounded-lg shadow-sm"
            />
            <h1 className="text-3xl font-bold text-blue-600">CourseHive</h1>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/links" className="text-dark-gray hover-coursehive-primary transition-colors font-medium">Resources</Link>
            <Link to="/tests" className="text-dark-gray hover-coursehive-primary transition-colors font-medium">Tests</Link>
            <Link to="/analytics" className="text-dark-gray hover-coursehive-primary transition-colors font-medium">Analytics</Link>
            <Link to="/login" className="text-dark-gray hover-coursehive-primary transition-colors font-medium">Login</Link>
            <Link to="/register" className="coursehive-button px-6 py-2 text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="coursehive-hero py-20 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium mb-4">
              🚀 AI-Powered Learning Platform
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Learn Smarter.
            <br />
            <span className="text-white opacity-90">Grow Together.</span>
          </h1>
          <p className="text-lg text-white opacity-90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your hive of knowledge powered by AI & community. Discover curated resources, 
            take personalized tests, and accelerate your learning journey with intelligent recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Start Learning Free
              <ArrowRight className="inline ml-2 w-5 h-5" />
            </Link>
            <Link to="/links" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300">
              Explore Resources
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center space-x-8 text-white opacity-80">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">10K+ Learners</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm">5K+ Resources</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span className="text-sm">98% Success Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8 bg-mint-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CourseHive?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of learning with our AI-powered platform designed for modern learners.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="coursehive-card p-8 text-center">
              <div className="w-16 h-16 bg-coursehive-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Curated Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                Intelligent algorithms analyze your learning patterns and curate personalized content 
                that matches your goals and skill level.
              </p>
            </div>
            
            <div className="coursehive-card p-8 text-center">
              <div className="w-16 h-16 bg-coursehive-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Growth</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with fellow learners, share knowledge, and grow together in our 
                supportive learning community.
              </p>
            </div>
            
            <div className="coursehive-card p-8 text-center">
              <div className="w-16 h-16 bg-coursehive-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Track your progress with detailed analytics and insights that help you 
                optimize your learning strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-8 bg-warm-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How CourseHive Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your learning experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-coursehive-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Discover Resources</h3>
              <p className="text-gray-600">
                Browse our curated collection of educational resources, from tutorials to interactive courses.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-coursehive-secondary rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Take Smart Tests</h3>
              <p className="text-gray-600">
                Challenge yourself with AI-generated tests tailored to your learning level and goals.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-coursehive-accent rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your growth with detailed analytics and get personalized recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-8 bg-coursehive-primary text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-white opacity-80">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5K+</div>
              <div className="text-white opacity-80">Resources</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-white opacity-80">Tests Taken</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-white opacity-80">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Learning Platform</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to accelerate your learning journey, from AI-powered recommendations to detailed progress tracking.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Paths</h3>
              <p className="text-gray-600 text-sm">
                Structured learning journeys tailored to your goals and skill level.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Analytics</h3>
              <p className="text-gray-600 text-sm">
                Detailed insights into your learning progress and performance metrics.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Tutor</h3>
              <p className="text-gray-600 text-sm">
                Get instant answers and personalized guidance from our AI-powered tutor.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Safe Content</h3>
              <p className="text-gray-600 text-sm">
                All resources are verified for safety and quality through multiple security checks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Learners Choose CourseHive</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Learning Experience</h3>
                    <p className="text-gray-600">
                      Our AI analyzes your learning patterns to provide content that matches your pace and preferences.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Resource Library</h3>
                    <p className="text-gray-600">
                      Access thousands of curated resources including videos, articles, interactive courses, and practice tests.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Progress Tracking</h3>
                    <p className="text-gray-600">
                      Monitor your learning journey with detailed analytics and get insights to optimize your study time.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Support</h3>
                    <p className="text-gray-600">
                      Connect with fellow learners, share knowledge, and get support from our active learning community.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Platform Statistics</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Learners</span>
                  <span className="text-2xl font-bold text-blue-600">10,000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Learning Resources</span>
                  <span className="text-2xl font-bold text-green-600">5,000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tests Completed</span>
                  <span className="text-2xl font-bold text-purple-600">50,000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="text-2xl font-bold text-orange-600">98%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Learning Paths</span>
                  <span className="text-2xl font-bold text-indigo-600">500+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Learners Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied learners who have transformed their skills with CourseHive.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "CourseHive's AI recommendations helped me discover exactly what I needed to learn. The personalized approach is incredible!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  S
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Sarah Johnson</p>
                  <p className="text-sm text-gray-500">Computer Science Student</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The community aspect is amazing. I've learned so much from other learners and their shared resources."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  M
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Michael Chen</p>
                  <p className="text-sm text-gray-500">Software Developer</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The analytics dashboard gives me clear insights into my progress. I can see exactly where I'm improving!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Alex Rodriguez</p>
                  <p className="text-sm text-gray-500">Data Scientist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Your Learning Journey?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of learners who are already transforming their skills with CourseHive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Get Started Free
              <ChevronRight className="inline ml-2 w-5 h-5" />
            </Link>
            <Link to="/links" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300">
              Explore Resources
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/logo.jpg" 
                  alt="CourseHive Logo" 
                  className="w-8 h-8 rounded-lg"
                />
                <h3 className="text-xl font-bold text-blue-400">CourseHive</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Your hive of knowledge powered by AI & community.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors">
                  <span className="text-white text-sm font-semibold">FB</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors">
                  <span className="text-white text-sm font-semibold">TW</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors">
                  <span className="text-white text-sm font-semibold">LI</span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/links" className="hover:text-blue-400 transition-colors">Resources</Link></li>
                <li><Link to="/tests" className="hover:text-blue-400 transition-colors">Tests</Link></li>
                <li><Link to="/analytics" className="hover:text-blue-400 transition-colors">Analytics</Link></li>
                <li><Link to="/learning-paths" className="hover:text-blue-400 transition-colors">Learning Paths</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-blue-400 transition-colors">Help Center</Link></li>
                <li><a href="mailto:coursehive.pro@gmail.com" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Feedback</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">Contact Info</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>coursehive.pro@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Global Learning Platform</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CourseHive. All rights reserved. Built for learners worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
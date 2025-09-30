import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import './styles/coursehive-colors.css';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import Footer from './components/layout/Footer';
import Layout from './components/layout/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Content from './pages/Content';
import Tests from './pages/Tests';
import TestDetail from './pages/TestDetail';
import Forum from './pages/Forum';
import LearningPaths from './pages/LearningPaths';
import ForumThread from './pages/ForumThread';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import MySubmissions from './pages/MySubmissions';
import Admin from './pages/admin/Admin';
import AdminApprovals from './pages/admin/AdminApprovals';
import Links from './pages/Links';
import Recommendations from './pages/Recommendations';
import StudyPlan from './pages/StudyPlan';
import AITutor from './pages/AITutor';
import Settings from './pages/Settings';
import HelpSupport from './pages/HelpSupport';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen bg-gray-50">
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/content" element={
                  <ProtectedRoute>
                    <Layout>
                      <Content />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/tests" element={
                  <ProtectedRoute>
                    <Layout>
                      <Tests />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/tests/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <TestDetail />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/forum" element={
                  <ProtectedRoute>
                    <Layout>
                      <Forum />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/forum/threads/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <ForumThread />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/learning-paths" element={
                  <ProtectedRoute>
                    <Layout>
                      <LearningPaths />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Layout>
                      <Analytics />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/my-submissions" element={
                  <ProtectedRoute>
                    <Layout>
                      <MySubmissions />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/links" element={
                  <ProtectedRoute>
                    <Layout>
                      <Links />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/recommendations" element={
                  <ProtectedRoute>
                    <Layout>
                      <Recommendations />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/study-plan" element={
                  <ProtectedRoute>
                    <Layout>
                      <StudyPlan />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Additional Sidebar Routes */}
                <Route path="/ai-tutor" element={
                  <ProtectedRoute>
                    <Layout>
                      <AITutor />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/community" element={
                  <ProtectedRoute>
                    <Layout>
                      <Forum />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/progress" element={
                  <ProtectedRoute>
                    <Layout>
                      <Analytics />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/achievements" element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/help" element={
                  <ProtectedRoute>
                    <Layout>
                      <HelpSupport />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <Admin />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/approvals" element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <AdminApprovals />
                    </Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            <Footer />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
}

export default App;

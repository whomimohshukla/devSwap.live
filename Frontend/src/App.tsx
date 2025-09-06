import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import Sessions from './pages/Sessions';
import SessionRoom from './pages/SessionRoom';
import Profile from './pages/Profile';
import Skills from './pages/Skills';
import { useAuthStore } from './lib/auth';
import AuthCallback from './pages/AuthCallback';
import Privacy from './pages/Privacy';
import Settings from './pages/Settings';
import LearnIndex from './pages/LearnIndex';
import LearnTopic from './pages/LearnTopic';
import LearnLesson from './pages/LearnLesson';
import Roadmaps from './pages/Roadmaps';
import RoadmapPage from './pages/Roadmap';
// Footer pages
import About from './pages/About';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Help from './pages/Help';
import Community from './pages/Community';
import Status from './pages/Status';
import Blog from './pages/Blog';
import Careers from './pages/Careers';
import Cookies from './pages/Cookies';
import GDPR from './pages/GDPR';
import Terms from './pages/Terms';
import { initAuthRealtime } from './lib/auth';
import ScrollToTop from './components/common/ScrollToTop';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
  // Initialize real-time user/profile updates once
  React.useEffect(() => {
    initAuthRealtime();
  }, []);
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      <Routes>
        {/* OAuth callback route */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* Public Routes */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="skills" element={<Skills />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          {/* Footer linked pages */}
          <Route path="about" element={<About />} />
          <Route path="features" element={<Features />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="contact" element={<Contact />} />
          <Route path="help" element={<Help />} />
          <Route path="community" element={<Community />} />
          <Route path="status" element={<Status />} />
          <Route path="blog" element={<Blog />} />
          <Route path="careers" element={<Careers />} />
          <Route path="cookies" element={<Cookies />} />
          <Route path="gdpr" element={<GDPR />} />
          {/* Learn Section */}
          <Route path="learn" element={<LearnIndex />} />
          <Route path="learn/:topic" element={<LearnTopic />} />
          <Route path="learn/:topic/:slug" element={<LearnLesson />} />
          {/* Roadmaps Section */}
          <Route path="roadmaps" element={<Roadmaps />} />
          <Route path="roadmaps/:id" element={<RoadmapPage />} />
          {/* Documentation removed per request; Learn-only experience */}
          <Route path="docs" element={<Navigate to="/learn" replace />} />
        </Route>
        
        {/* Auth Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/" element={<AppLayout />}>
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="matches" element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          } />
          <Route path="sessions" element={
            <ProtectedRoute>
              <Sessions />
            </ProtectedRoute>
          } />
          <Route path="sessions/:id/room" element={
            <ProtectedRoute>
              <SessionRoom />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

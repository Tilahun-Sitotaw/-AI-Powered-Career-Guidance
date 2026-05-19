import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CareerPaths from './pages/CareerPaths';
import LearningPaths from './pages/LearningPaths';
import Internships from './pages/Internships';
import InternshipDetail from './pages/InternshipDetail';
import InterviewPrep from './pages/InterviewPrep';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import Scholarships from './pages/Scholarships';
import SkillExamination from './pages/SkillExamination';
import JobOpportunities from './pages/JobOpportunities';
import ForgotPassword from './pages/ForgotPassword';

// Protected route component - redirects authenticated users to dashboard
const ProtectedPublicRoute = ({ element }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : element;
};

// Protected route component - redirects non-authenticated users to login
const ProtectedPrivateRoute = ({ element }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public pages - redirect authenticated users to dashboard */}
        <Route path="/" element={<ProtectedPublicRoute element={<Home />} />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<ProtectedPublicRoute element={<Login setIsAuthenticated={setIsAuthenticated} />} />} />
        <Route path="/register" element={<ProtectedPublicRoute element={<Register />} />} />
        <Route path="/forgot-password" element={<ProtectedPublicRoute element={<ForgotPassword />} />} />
        
        {/* Public info pages */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        
        {/* Protected pages - require authentication */}
        <Route path="/dashboard" element={<ProtectedPrivateRoute element={<Dashboard />} />} />
        <Route path="/profile" element={<ProtectedPrivateRoute element={<Profile />} />} />
        <Route path="/career-paths" element={<ProtectedPrivateRoute element={<CareerPaths />} />} />
        <Route path="/learning-paths" element={<ProtectedPrivateRoute element={<LearningPaths />} />} />
        <Route path="/internships" element={<ProtectedPrivateRoute element={<Internships />} />} />
        <Route path="/internships/:id" element={<ProtectedPrivateRoute element={<InternshipDetail />} />} />
        <Route path="/skill-gap-analysis" element={<ProtectedPrivateRoute element={<SkillGapAnalysis />} />} />
        <Route path="/interview-prep" element={<ProtectedPrivateRoute element={<InterviewPrep />} />} />
        <Route path="/scholarships" element={<ProtectedPrivateRoute element={<Scholarships />} />} />
        <Route path="/skill-examination" element={<ProtectedPrivateRoute element={<SkillExamination />} />} />
        <Route path="/job-opportunities" element={<ProtectedPrivateRoute element={<JobOpportunities />} />} />
        
        {/* Legacy redirect */}
        <Route path="/recommendations" element={<Navigate to="/career-paths" replace />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

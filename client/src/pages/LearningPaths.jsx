import { useState, useEffect } from 'react';
import { FiArrowRight, FiCheckCircle, FiBook, FiTarget, FiTrendingUp } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const COLORS = [
  'from-cyan-500 to-blue-600',
  'from-blue-500 to-purple-600',
  'from-purple-500 to-pink-600',
  'from-pink-500 to-orange-600',
];
const ICONS_JSX = [
  <FiBook className="text-4xl" />,
  <FiTrendingUp className="text-4xl" />,
  <FiTarget className="text-4xl" />,
  <FiCheckCircle className="text-4xl" />,
];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Advanced'];

const LearningPaths = () => {
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchRoadmap = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/recommendations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoadmap(res.data.roadmap || []);
      } catch (err) {
        console.error('Learning paths fetch error:', err);
        setError('Failed to load learning paths.');
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">Learning Paths</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Structured learning paths designed to help you master in-demand skills and advance your career.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"></div>
              <span className="ml-4 text-gray-600">Loading your learning paths...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">{error}</div>
          )}

          {!isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg mb-6">
              Please <a href="/login" className="font-semibold underline">sign in</a> to see your personalized learning paths.
            </div>
          )}

          {!loading && isAuthenticated && roadmap.length === 0 && !error && (
            <div className="text-center py-16 text-gray-500">
              <p>No learning paths found. Complete your profile to get personalized paths.</p>
            </div>
          )}

          {!loading && roadmap.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {roadmap.map((phase, index) => (
                <div key={index} className="bg-white border-2 border-gray-200 hover:border-cyan-500 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${COLORS[index % COLORS.length]} p-8 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      {ICONS_JSX[index % ICONS_JSX.length]}
                      <span className="text-sm font-semibold bg-white bg-opacity-20 px-3 py-1 rounded-full">
                        {LEVELS[index % LEVELS.length]}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold">{phase.phase}</h3>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    {/* Duration */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-slate-900">Duration:</span> {phase.duration}
                      </p>
                    </div>

                    {/* Skills */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-900 mb-3">Skills You'll Learn:</h4>
                      <div className="flex flex-wrap gap-2">
                        {(phase.skills || []).map((skill, idx) => (
                          <span key={idx} className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    {phase.resources?.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-slate-900 mb-3">Resources:</h4>
                        <div className="flex flex-wrap gap-2">
                          {phase.resources.map((res, idx) => (
                            <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                              {res}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button className="inline-flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition">
                      <span>Start Learning</span>
                      <FiArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LearningPaths;

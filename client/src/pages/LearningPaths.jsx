import { useState, useEffect } from 'react';
import { FiArrowRight, FiBook, FiTarget, FiTrendingUp, FiCheckCircle, FiClock, FiX, FiRefreshCw } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const COLORS = [
  'from-cyan-500 to-blue-600',
  'from-blue-500 to-purple-600',
  'from-purple-500 to-pink-600',
  'from-pink-500 to-orange-600',
];
const ICONS = [
  <FiBook className="text-4xl" />,
  <FiTrendingUp className="text-4xl" />,
  <FiTarget className="text-4xl" />,
  <FiCheckCircle className="text-4xl" />,
];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const LearningPaths = () => {
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phaseDetails, setPhaseDetails] = useState(null);

  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    if (isAuthenticated) fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/learning-paths`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoadmap(res.data.roadmap || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load learning paths.';
      setError(errorMsg);
      console.error('Error fetching learning paths:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = (phase) => {
    setPhaseDetails(phase);
  };

  const handleRegenerate = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        `${API_BASE}/learning-paths/regenerate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoadmap(res.data.roadmap || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to regenerate learning paths.';
      setError(errorMsg);
      console.error('Error regenerating learning paths:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Page header */}
            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning Paths</h1>
                <p className="text-gray-600">AI-generated learning roadmap tailored to your skills, interests, and career goals.</p>
              </div>
              {isAuthenticated && (
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-60"
                >
                  <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  <span>{loading ? 'Regenerating...' : 'Regenerate with AI'}</span>
                </button>
              )}
            </div>

            {/* Not signed in */}
            {!isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg mb-6">
                Please <a href="/login" className="font-semibold underline">sign in</a> to see your personalized learning paths.
              </div>
            )}

            {/* Profile incomplete */}
            {isAuthenticated && error && error.includes('complete your profile') && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg mb-6">
                <p className="font-semibold mb-2">📋 Complete Your Profile First</p>
                <p className="text-sm mb-3">To get personalized learning paths, please add:</p>
                <ul className="text-sm list-disc list-inside mb-3 space-y-1">
                  <li>At least one skill</li>
                  <li>Your preferred role/career goal</li>
                  <li>Your department (optional but recommended)</li>
                </ul>
                <a href="/profile" className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition">
                  Go to Profile →
                </a>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"></div>
                <span className="ml-4 text-gray-600">Loading your learning paths...</span>
              </div>
            )}

            {/* Error */}
            {error && !error.includes('complete your profile') && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">{error}</div>
            )}

            {/* Empty */}
            {!loading && isAuthenticated && roadmap.length === 0 && !error && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
                <FiBook size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No learning paths yet.</p>
                <p className="text-sm mt-2">Complete your profile with skills and a preferred role to get a personalized roadmap.</p>
              </div>
            )}

            {/* Roadmap cards */}
            {!loading && roadmap.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {roadmap.map((phase, index) => (
                  <div key={index} className="bg-white border-2 border-gray-200 hover:border-cyan-500 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                    <div className={`bg-gradient-to-r ${COLORS[index % COLORS.length]} p-8 text-white`}>
                      <div className="flex items-center justify-between mb-4">
                        {ICONS[index % ICONS.length]}
                        <span className="text-sm font-semibold bg-white bg-opacity-20 px-3 py-1 rounded-full">
                          {LEVELS[index % LEVELS.length]}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold">{phase.phase}</h3>
                    </div>

                    <div className="p-8">
                      <div className="flex items-center space-x-2 mb-6 pb-6 border-b border-gray-200">
                        <FiClock className="text-gray-400" size={16} />
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-slate-900">Duration:</span> {phase.duration}
                        </p>
                      </div>

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

                      {phase.resources?.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-slate-900 mb-3">Resources:</h4>
                          <div className="flex flex-wrap gap-2">
                            {phase.resources.map((res, idx) => {
                              const resourceName = typeof res === 'object' ? res.name : res;
                              return (
                                <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                                  {resourceName}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={() => handleStartLearning(phase)}
                        className="inline-flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition">
                        <span>Start Learning</span>
                        <FiArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />

      {/* Learning Details Modal */}
      {phaseDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className={`bg-gradient-to-r ${COLORS[roadmap.indexOf(phaseDetails) % COLORS.length]} p-8 text-white flex items-start justify-between`}>
              <div className="flex items-start space-x-4">
                <div className="text-white text-opacity-80">
                  {ICONS[roadmap.indexOf(phaseDetails) % ICONS.length]}
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">{phaseDetails.phase}</h2>
                  <p className="text-white text-opacity-90 text-lg flex items-center space-x-2">
                    <FiClock size={16} />
                    <span>{phaseDetails.duration}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPhaseDetails(null);
                }}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition font-semibold"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Level Badge */}
              <div className="mb-8">
                <span className="inline-block bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {LEVELS[roadmap.indexOf(phaseDetails) % LEVELS.length]} Level
                </span>
              </div>

              {/* Skills to Learn */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <FiTarget className="text-pink-500" />
                  <span>Skills You'll Learn</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(phaseDetails.skills || []).map((skill, idx) => {
                    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(skill + ' tutorial')}`;
                    return (
                      <a
                        key={idx}
                        href={searchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 hover:bg-cyan-100 hover:border-cyan-400 transition cursor-pointer"
                      >
                        <p className="text-sm font-semibold text-cyan-900">{skill} →</p>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Learning Resources */}
              {phaseDetails.resources?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <FiBook className="text-purple-500" />
                    <span>Recommended Resources</span>
                  </h3>
                  <div className="space-y-3">
                    {phaseDetails.resources.map((resource, idx) => {
                      // Handle both old format (string) and new format (object with url)
                      const isObject = typeof resource === 'object';
                      const resourceName = isObject ? resource.name : resource;
                      const resourceUrl = isObject ? resource.url : `https://www.google.com/search?q=${encodeURIComponent(resource)}`;
                      const platform = isObject ? resource.platform : 'Resource';

                      return (
                        <a
                          key={idx}
                          href={resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start space-x-3 hover:bg-purple-100 hover:border-purple-400 transition cursor-pointer"
                        >
                          <div className="text-purple-500 mt-1">
                            <FiCheckCircle size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-purple-900">{resourceName}</p>
                            {isObject && <p className="text-xs text-purple-600 mt-1">{platform}</p>}
                            <p className="text-xs text-purple-600 mt-1">Click to access →</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Duration Info */}
              <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                <FiClock className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Estimated Duration</p>
                  <p className="text-sm text-blue-700 mt-1">{phaseDetails.duration}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-4">
                
                <button
                  onClick={() => {
                    setPhaseDetails(null);
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPaths;

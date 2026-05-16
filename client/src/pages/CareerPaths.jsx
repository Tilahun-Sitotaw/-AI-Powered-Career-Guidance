import { useState, useEffect } from 'react';
import { FiArrowRight, FiDollarSign, FiSearch, FiFilter, FiRefreshCw, FiX, FiBook, FiClock, FiTarget } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const CARD_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-blue-500',
  'from-yellow-500 to-orange-500',
];
const CARD_ICONS = ['💻', '📊', '🤖', '☁️', '🎨', '⚙️'];

const CareerPaths = () => {
  const [careerPaths, setCareerPaths] = useState([]);
  const [salaryInsights, setSalaryInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [roadmapData, setRoadmapData] = useState(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await axios.get(`${API_BASE}/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCareerPaths(res.data.careerPaths || []);
      setSalaryInsights(res.data.salaryInsights || null);
    } catch (err) {
      setError('Failed to load career paths.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setRegenerating(true);
    setError(null);
    try {
      const res = await axios.post(
        `${API_BASE}/recommendations/regenerate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCareerPaths(res.data.recommendation?.careerPaths || []);
      setSalaryInsights(res.data.recommendation?.salaryInsights || null);
    } catch (err) {
      setError('Failed to regenerate career paths.');
    } finally {
      setRegenerating(false);
    }
  };

  const filtered = careerPaths.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewRoadmap = async (career) => {
    setSelectedCareer(career);
    setShowRoadmapModal(true);
    setLoadingRoadmap(true);
    setRoadmapData(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setLoadingRoadmap(false);
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/recommendations/roadmap`,
        { careerTitle: career.title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoadmapData(res.data);
    } catch (err) {
      console.error('Failed to load roadmap:', err);
      setRoadmapData(null);
    } finally {
      setLoadingRoadmap(false);
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
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Career Paths</h1>
                <p className="text-gray-600">AI-matched career paths based on your skills, interests, and goals</p>
              </div>
              <button
                onClick={handleRegenerate}
                disabled={regenerating || loading}
                className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-60"
              >
                <FiRefreshCw size={16} className={regenerating ? 'animate-spin' : ''} />
                <span>{regenerating ? 'Regenerating...' : 'Regenerate with AI'}</span>
              </button>
            </div>

            {/* Salary summary */}
            {salaryInsights && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Entry Level', value: salaryInsights.entryLevel, color: 'text-green-600' },
                  { label: 'Mid Level', value: salaryInsights.midLevel, color: 'text-blue-600' },
                  { label: 'Senior Level', value: salaryInsights.senior, color: 'text-purple-600' },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl shadow-md p-4 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>${Math.round(s.value / 1000)}K</p>
                    <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search career paths..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <FiFilter size={20} />
                <span>Filter</span>
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                <span className="ml-4 text-gray-600 text-lg">Loading your career paths...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">{error}</div>
            )}

            {!loading && filtered.length === 0 && !error && (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg">No career paths found.</p>
                <p className="text-sm mt-2">Complete your profile or click "Regenerate with AI".</p>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((career, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition transform hover:scale-105">
                    <div className={`bg-gradient-to-r ${CARD_COLORS[i % CARD_COLORS.length]} h-32 flex items-center justify-center text-5xl`}>
                      {CARD_ICONS[i % CARD_ICONS.length]}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{career.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{career.description}</p>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">Match Score</span>
                          <span className="text-lg font-bold text-pink-500">{career.matchScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                            style={{ width: `${career.matchScore}%` }}
                          ></div>
                        </div>
                      </div>
                      {salaryInsights && (
                        <div className="flex items-center space-x-2 mb-4 text-gray-700">
                          <FiDollarSign size={18} className="text-green-500" />
                          <span className="font-semibold text-sm">
                            ${Math.round(salaryInsights.entryLevel / 1000)}K – ${Math.round(salaryInsights.senior / 1000)}K
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => handleViewRoadmap(career)}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2"
                      >
                        <span>View Roadmap</span>
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

      {/* Roadmap Modal */}
      {showRoadmapModal && selectedCareer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-1">{selectedCareer.title}</h2>
                  <p className="text-white text-opacity-90">Career Roadmap</p>
                </div>
                <button
                  onClick={() => setShowRoadmapModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingRoadmap ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                  <span className="ml-4 text-gray-600 text-lg">Generating your personalized roadmap...</span>
                </div>
              ) : roadmapData && roadmapData.phases ? (
                <div className="space-y-6">
                  {roadmapData.phases.map((phase, index) => (
                    <div key={index} className="border-l-4 border-pink-500 pl-6 pb-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{phase.title}</h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <FiClock size={14} />
                              <span>{phase.duration}</span>
                            </span>
                            <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-semibold">
                              Phase {index + 1}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{phase.description}</p>

                      {/* Skills */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                          <FiTarget size={16} className="text-pink-500" />
                          <span>Skills to Learn</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {phase.skills && phase.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Resources */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                          <FiBook size={16} className="text-pink-500" />
                          <span>Learning Resources</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {phase.resources && phase.resources.map((resource, resourceIndex) => (
                            <span key={resourceIndex} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                              {resource}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Projects */}
                      {phase.projects && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                            <FiTarget size={16} className="text-pink-500" />
                            <span>Recommended Projects</span>
                          </h4>
                          <ul className="space-y-1">
                            {phase.projects.map((project, projectIndex) => (
                              <li key={projectIndex} className="text-gray-700 text-sm flex items-start space-x-2">
                                <span className="text-pink-500 mt-1">•</span>
                                <span>{project}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Specializations */}
                      {phase.specializations && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                            <FiTarget size={16} className="text-pink-500" />
                            <span>Specialization Paths</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {phase.specializations.map((spec, specIndex) => (
                              <div key={specIndex} className="bg-gray-50 p-3 rounded-lg">
                                <h5 className="font-semibold text-gray-900 mb-2">{spec.name}</h5>
                                <div className="flex flex-wrap gap-1">
                                  {spec.skills.map((skill, skillIndex) => (
                                    <span key={skillIndex} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <p className="text-lg">Failed to load roadmap. Please try again.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPaths;

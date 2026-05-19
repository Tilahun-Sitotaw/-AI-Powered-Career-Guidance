import { useState, useEffect } from 'react';
import { FiBarChart2, FiRefreshCw, FiAlertCircle, FiClipboard, FiArrowRight } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const SkillGapAnalysis = () => {
  const [skillGaps, setSkillGaps] = useState([]);
  const [examGaps, setExamGaps] = useState([]);
  const [examResults, setExamResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    if (isAuthenticated) fetchSkillGaps();
  }, []);

  const fetchSkillGaps = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSkillGaps(res.data.skillGaps || []);
      setExamGaps(res.data.examResults?.examGaps || []);
      setExamResults(res.data.examResults || null);
    } catch (err) {
      setError('Failed to load skill gap data.');
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
      setSkillGaps(res.data.recommendation?.skillGaps || []);
    } catch (err) {
      setError('Failed to regenerate skill gaps.');
    } finally {
      setRegenerating(false);
    }
  };

  const highCount = skillGaps.filter((g) => g.importance === 'High').length;
  const medCount = skillGaps.filter((g) => g.importance === 'Medium').length;
  const lowCount = skillGaps.filter((g) => g.importance === 'Low').length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900 py-16 px-4 sm:px-6 lg:px-8 rounded-lg mb-8 -mx-4 sm:-mx-6 lg:-mx-8">
              <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">Skill Gap Analysis</h1>
                <p className="text-lg text-gray-700 max-w-2xl">
                  AI-identified skill gaps based on your current profile and target career role. Personalized recommendations to help you succeed.
                </p>
              </div>
            </section>

            {/* Header row */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <h2 className="text-3xl font-bold text-slate-900">Your Skill Gaps</h2>
              {isAuthenticated && (
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating || loading}
                  className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-60"
                >
                  <FiRefreshCw size={16} className={regenerating ? 'animate-spin' : ''} />
                  <span>{regenerating ? 'Regenerating...' : 'Regenerate with AI'}</span>
                </button>
              )}
            </div>

            {/* Not signed in */}
            {!isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg mb-6">
                Please <a href="/login" className="font-semibold underline">sign in</a> to see your personalized skill gap analysis.
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"></div>
                <span className="ml-4 text-gray-600">Analyzing your skill gaps...</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-center space-x-2">
                <FiAlertCircle />
                <span>{error}</span>
              </div>
            )}

            {/* Empty */}
            {!loading && isAuthenticated && skillGaps.length === 0 && !error && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
                <FiBarChart2 size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No skill gaps found yet.</p>
                <p className="text-sm mt-2">Add skills and a preferred role to your profile to get personalized analysis.</p>
              </div>
            )}

            {/* Exam-detected gaps section */}
            {!loading && examGaps.length > 0 && (
              <div className="bg-white border-2 border-red-300 rounded-2xl overflow-hidden shadow-lg mb-8">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 p-5 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FiClipboard size={24} />
                    <div>
                      <h3 className="text-lg font-bold">Gaps from Skill Examination</h3>
                      <p className="text-red-100 text-sm">
                        Detected on {examResults?.lastTaken ? new Date(examResults.lastTaken).toLocaleDateString() : 'last exam'} · Score: {examResults?.percent}%
                      </p>
                    </div>
                  </div>
                  <a
                    href="/skill-examination"
                    className="flex items-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
                  >
                    <span>Retake Exam</span>
                    <FiArrowRight size={14} />
                  </a>
                </div>
                <div className="p-5 space-y-3">
                  {examGaps.map((gap, i) => (
                    <div key={i} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-900">{gap.skill}</p>
                        <p className="text-sm text-red-600">Exam score: {gap.score}%</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        gap.importance === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {gap.importance} Priority
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No exam taken yet */}
            {!loading && examGaps.length === 0 && isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-3">
                  <FiClipboard size={20} className="text-blue-500" />
                  <p className="text-blue-700 text-sm">
                    <span className="font-semibold">No exam results yet.</span> Take the Skill Examination to detect additional gaps.
                  </p>
                </div>
                <a
                  href="/skill-examination"
                  className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
                  <span>Take Exam</span>
                  <FiArrowRight size={14} />
                </a>
              </div>
            )}

            {/* Summary stats */}
            {!loading && skillGaps.length > 0 && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-10">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-red-600">{highCount}</p>
                    <p className="text-sm font-semibold text-red-500 mt-1">High Priority</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-yellow-600">{medCount}</p>
                    <p className="text-sm font-semibold text-yellow-500 mt-1">Medium Priority</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">{lowCount}</p>
                    <p className="text-sm font-semibold text-green-500 mt-1">Low Priority</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {skillGaps.map((gap, index) => (
                    <div key={index} className="bg-white border-2 border-gray-200 hover:border-cyan-500 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                      <div className={`bg-gradient-to-r ${
                        gap.importance === 'High' ? 'from-red-500 to-pink-600'
                        : gap.importance === 'Medium' ? 'from-yellow-500 to-orange-500'
                        : 'from-green-500 to-emerald-500'
                      } p-8 text-white`}>
                        <div className="flex items-center justify-between mb-4">
                          <FiBarChart2 size={36} />
                          <span className="text-sm font-semibold bg-white bg-opacity-20 px-3 py-1 rounded-full">
                            {gap.importance} Priority
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold">{gap.skill}</h3>
                      </div>
                      <div className="p-8">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Recommended Resources</p>
                        <div className="flex flex-wrap gap-2">
                          {(gap.resources || []).map((resource, i) => (
                            <a key={i} href="#" className="bg-cyan-100 text-cyan-700 text-sm px-3 py-1 rounded-full hover:bg-cyan-200 transition">
                              {resource}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SkillGapAnalysis;

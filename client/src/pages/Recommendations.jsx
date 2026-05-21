import { useState, useEffect } from 'react';
import { FiArrowRight, FiBook, FiDollarSign, FiSearch, FiFilter, FiRefreshCw, FiAward, FiExternalLink, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';
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

const getDifficultyColor = (d) => {
  if (d === 'Easy' || d === 'Beginner') return 'bg-green-100 text-green-700';
  if (d === 'Medium' || d === 'Intermediate') return 'bg-yellow-100 text-yellow-700';
  if (d === 'Hard' || d === 'Advanced') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
};

const EmptyState = ({ message }) => (
  <div className="text-center py-16 text-gray-500">
    <p>{message}</p>
    <p className="text-sm mt-2">Try clicking "Regenerate with AI" above.</p>
  </div>
);

const Recommendations = () => {
  const [activeTab, setActiveTab] = useState('careers');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await axios.get(`${API_BASE}/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      setError('Failed to load recommendations.');
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
      setData(res.data.recommendation);
    } catch (err) {
      setError('Failed to regenerate recommendations.');
    } finally {
      setRegenerating(false);
    }
  };

  const careerPaths = data?.careerPaths || [];
  const roadmap = data?.roadmap || [];
  const skillGaps = data?.skillGaps || [];
  const interviewQuestions = data?.interviewQuestions || [];
  const scholarships = data?.scholarships || [];
  const salaryInsights = data?.salaryInsights || null;

  const filteredCareers = careerPaths.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const TABS = [
    { key: 'careers', label: 'Career Paths' },
    { key: 'learning', label: 'Learning Paths' },
    { key: 'skillgaps', label: 'Skill Gaps' },
    { key: 'interview', label: 'Interview Prep' },
    { key: 'scholarships', label: '🎓 Scholarships' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Page Header */}
            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Career Recommendations</h1>
                <p className="text-gray-600">Personalized career paths and learning resources based on your profile</p>
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

            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                <span className="ml-4 text-gray-600 text-lg">Loading your personalized recommendations...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">{error}</div>
            )}

            {!loading && (
              <>
                {/* Tabs */}
                <div className="flex gap-1 mb-8 border-b border-gray-200 overflow-x-auto">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-5 py-3 font-semibold whitespace-nowrap transition border-b-2 ${
                        activeTab === tab.key
                          ? 'border-pink-500 text-pink-500'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ── Career Paths ── */}
                {activeTab === 'careers' && (
                  <div>
                    <div className="flex gap-4 mb-6">
                      <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                          type="text"
                          placeholder="Search careers..."
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

                    {filteredCareers.length === 0 ? (
                      <EmptyState message="No career paths found." />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCareers.map((career, i) => (
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
                                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full" style={{ width: `${career.matchScore}%` }}></div>
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
                              <Link 
                                to="/learning-paths"
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2"
                              >
                                <span>Start Learning</span>
                                <FiArrowRight size={18} />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Learning Paths ── */}
                {activeTab === 'learning' && (
                  <div className="space-y-6">
                    {roadmap.length === 0 ? (
                      <EmptyState message="No learning paths available." />
                    ) : (
                      roadmap.map((phase, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                          <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                            <div className="flex items-start space-x-4">
                              <div className="text-4xl">{['📚', '⚛️', '🧠', '☁️'][i % 4]}</div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">{phase.phase}</h3>
                                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                  <span className="flex items-center space-x-1">
                                    <FiBook size={16} />
                                    <span>{phase.duration}</span>
                                  </span>
                                  <span className={`px-3 py-1 rounded-full ${
                                    i === 0 ? 'bg-green-100 text-green-700'
                                    : i === 1 ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                  }`}>
                                    {i === 0 ? 'Beginner' : i === 1 ? 'Intermediate' : 'Advanced'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition">
                              Start Learning
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {(phase.skills || []).map((skill) => (
                              <span key={skill} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">{skill}</span>
                            ))}
                          </div>
                          {phase.resources?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {phase.resources.map((res) => (
                                <span key={res} className="bg-pink-100 text-pink-700 text-xs px-3 py-1 rounded-full">{res}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ── Skill Gaps ── */}
                {activeTab === 'skillgaps' && (
                  <div className="space-y-6">
                    {skillGaps.length === 0 ? (
                      <EmptyState message="No skill gap data available." />
                    ) : (
                      skillGaps.map((gap, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">{gap.skill}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              gap.importance === 'High' ? 'bg-red-100 text-red-700'
                              : gap.importance === 'Medium' ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                            }`}>
                              {gap.importance} Priority
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Recommended Resources</p>
                          <div className="flex flex-wrap gap-2">
                            {(gap.resources || []).map((resource) => (
                              <a key={resource} href="#" className="bg-pink-100 text-pink-700 text-sm px-3 py-1 rounded hover:bg-pink-200 transition">
                                {resource}
                              </a>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ── Interview Prep ── */}
                {activeTab === 'interview' && (
                  <div className="space-y-4">
                    {interviewQuestions.length === 0 ? (
                      <EmptyState message="No interview questions available." />
                    ) : (
                      interviewQuestions.map((q, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 flex-1">{q.question}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${getDifficultyColor(q.difficulty)}`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">{q.category}</span>
                            <button className="text-pink-500 hover:text-pink-600 font-semibold flex items-center space-x-2">
                              <span>View Answer</span>
                              <FiArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ── Scholarships ── */}
                {activeTab === 'scholarships' && (
                  <div>
                    <div className="mb-6">
                      <p className="text-gray-600">Scholarships matched to your profile, department, and career goals.</p>
                    </div>
                    {scholarships.length === 0 ? (
                      <EmptyState message="No scholarship recommendations available." />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {scholarships.map((s, i) => (
                          <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-gray-100">
                            {/* Card header */}
                            <div className={`bg-gradient-to-r ${CARD_COLORS[i % CARD_COLORS.length]} p-6 text-white`}>
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-xl font-bold mb-1">{s.name}</h3>
                                  <p className="text-white text-opacity-90 text-sm">{s.provider}</p>
                                </div>
                                <FiAward size={32} className="opacity-80 flex-shrink-0" />
                              </div>
                              {s.amount && (
                                <div className="mt-3 inline-block bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                                  {s.amount}
                                </div>
                              )}
                            </div>

                            {/* Card body */}
                            <div className="p-6">
                              <p className="text-gray-700 text-sm mb-4">{s.description}</p>

                              {s.matchReason && (
                                <div className="bg-pink-50 border border-pink-100 rounded-lg px-4 py-3 mb-4">
                                  <p className="text-pink-700 text-sm font-medium">✨ Why it matches you</p>
                                  <p className="text-pink-600 text-sm mt-1">{s.matchReason}</p>
                                </div>
                              )}

                              <div className="space-y-2 mb-4">
                                {s.eligibility && (
                                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                                    <span className="font-semibold text-gray-700 whitespace-nowrap">Eligibility:</span>
                                    <span>{s.eligibility}</span>
                                  </div>
                                )}
                                {s.deadline && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <FiCalendar size={14} className="text-gray-400 flex-shrink-0" />
                                    <span className="font-semibold text-gray-700">Deadline:</span>
                                    <span>{s.deadline}</span>
                                  </div>
                                )}
                              </div>

                              <a
                                href={s.link && s.link !== '#' ? s.link : '#'}
                                target={s.link && s.link !== '#' ? '_blank' : '_self'}
                                rel="noopener noreferrer"
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2"
                              >
                                <span>Apply Now</span>
                                <FiExternalLink size={16} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />

      {/* Chat Button - Always Visible */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-110 z-30"
          title="Open AI Assistant"
        >
          <FiMessageSquare size={24} />
        </button>
      )}

      {/* Chat Bot */}
      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} context="career" />
    </div>
  );
};

export default Recommendations;

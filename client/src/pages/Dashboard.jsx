import { useState, useEffect } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiBook, FiAward, FiDollarSign, FiArrowRight, FiStar, FiMessageSquare } from 'react-icons/fi';
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
const COLORS = ['#ec4899', '#a855f7', '#3b82f6', '#10b981'];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }

      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [profileRes, recRes] = await Promise.all([
          axios.get(`${API_BASE}/profile`, { headers }),
          axios.get(`${API_BASE}/recommendations`, { headers }),
        ]);
        setUser(profileRes.data);
        setRecommendations(recRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Skills pie chart — built from user's actual skills
  const skillsData = user?.skills?.length
    ? user.skills.slice(0, 4).map((skill, i) => ({ name: skill, value: Math.max(40, 90 - i * 12) }))
    : [];

  // Career progress — derived from match scores
  const careerData = recommendations?.careerPaths?.length
    ? recommendations.careerPaths.slice(0, 6).map((p, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i] || `M${i + 1}`,
        progress: p.matchScore,
      }))
    : [];

  // Top 3 career paths from DB
  const careerPaths = (recommendations?.careerPaths || []).slice(0, 3).map((p, i) => ({
    id: i + 1,
    title: p.title,
    match: p.matchScore,
    description: p.description,
    icon: CARD_ICONS[i % CARD_ICONS.length],
    color: CARD_COLORS[i % CARD_COLORS.length],
  }));

  // Skill gaps as recent activities
  const recentActivities = (recommendations?.skillGaps || []).slice(0, 4).map((gap, i) => ({
    id: i + 1,
    title: `Skill gap identified: ${gap.skill}`,
    time: `${gap.importance} priority`,
    icon: gap.importance === 'High' ? '⚡' : gap.importance === 'Medium' ? '📌' : '✓',
  }));

  // Stats
  const topMatch = recommendations?.careerPaths?.[0]?.matchScore ?? 0;
  const skillCount = user?.skills?.length ?? 0;
  const careerPathCount = recommendations?.careerPaths?.length ?? 0;
  const avgSalary = recommendations?.salaryInsights?.midLevel
    ? `$${Math.round(recommendations.salaryInsights.midLevel / 1000)}K`
    : '—';

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                <span className="ml-4 text-gray-600 text-lg">Loading your dashboard...</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Top Career Match</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{topMatch}%</p>
                      </div>
                      <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-3 rounded-lg">
                        <FiTrendingUp className="text-white text-2xl" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Skills Listed</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{skillCount}</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-lg">
                        <FiBook className="text-white text-2xl" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Career Paths</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{careerPathCount}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-lg">
                        <FiAward className="text-white text-2xl" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Avg Salary (Mid)</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{avgSalary}</p>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-lg">
                        <FiDollarSign className="text-white text-2xl" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Career Match Chart */}
                  {careerData.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Career Match Scores</h2>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={careerData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="progress"
                            name="Match %"
                            stroke="#ec4899"
                            strokeWidth={2}
                            dot={{ fill: '#ec4899', r: 5 }}
                            activeDot={{ r: 7 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Skills Distribution */}
                  {skillsData.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Skills Distribution</h2>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={skillsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {skillsData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Empty state if no skills */}
                  {skillsData.length === 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <FiBook size={40} className="mx-auto mb-3 text-gray-300" />
                        <p>Add skills to your profile to see your skills distribution.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Career Paths Section */}
                {careerPaths.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Recommended Career Paths</h2>
                      <a href="/recommendations" className="text-pink-500 hover:text-pink-600 font-semibold flex items-center space-x-2">
                        <span>View All</span>
                        <FiArrowRight />
                      </a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {careerPaths.map((path) => (
                        <div
                          key={path.id}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition transform hover:scale-105"
                        >
                          <div className={`bg-gradient-to-r ${path.color} h-24 flex items-center justify-center text-4xl`}>
                            {path.icon}
                          </div>
                          <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{path.title}</h3>
                            <p className="text-gray-600 text-sm mb-4">{path.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar
                                    key={i}
                                    size={16}
                                    className={i < Math.round(path.match / 20) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-bold text-pink-500">{path.match}% Match</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skill Gaps / Activities */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {recentActivities.length ? 'Skill Gaps to Address' : 'Recent Activities'}
                  </h2>
                  {recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold flex-shrink-0">
                            {activity.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">{activity.title}</p>
                            <p className="text-gray-500 text-sm">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Complete your profile to see personalized skill gap analysis.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />

      {/* Chat Button */}
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

export default Dashboard;

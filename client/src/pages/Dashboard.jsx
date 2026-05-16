import React, { useState, useEffect } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiBook, FiAward, FiDollarSign, FiArrowRight, FiStar } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const Dashboard = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(res.data.name || '');
      } catch (err) {
        // fallback: try localStorage
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        setUserName(stored.name || '');
      }
    };
    fetchProfile();
  }, []);

  const careerData = [
    { month: 'Jan', progress: 20 },
    { month: 'Feb', progress: 35 },
    { month: 'Mar', progress: 50 },
    { month: 'Apr', progress: 65 },
    { month: 'May', progress: 80 },
    { month: 'Jun', progress: 90 },
  ];

  const skillsData = [
    { name: 'JavaScript', value: 85 },
    { name: 'React', value: 75 },
    { name: 'Python', value: 60 },
    { name: 'Data Science', value: 45 },
  ];

  const careerPaths = [
    {
      id: 1,
      title: 'Full Stack Developer',
      match: 92,
      description: 'Build web applications with modern technologies',
      icon: '💻',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 2,
      title: 'Data Scientist',
      match: 78,
      description: 'Analyze data and build ML models',
      icon: '📊',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 3,
      title: 'AI Engineer',
      match: 85,
      description: 'Develop AI and machine learning solutions',
      icon: '🤖',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const recentActivities = [
    { id: 1, title: 'Completed JavaScript Course', time: '2 hours ago', icon: '✓' },
    { id: 2, title: 'Updated Profile Skills', time: '1 day ago', icon: '✓' },
    { id: 3, title: 'Generated Career Recommendations', time: '3 days ago', icon: '✓' },
    { id: 4, title: 'Viewed Internship Opportunities', time: '1 week ago', icon: '✓' },
  ];

  const COLORS = ['#ec4899', '#a855f7', '#3b82f6', '#10b981'];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome Back, {userName ? userName.split(' ')[0] : 'there'}! 👋
              </h1>
              <p className="text-gray-600">Here's your career progress and recommendations</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Career Match</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">92%</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-3 rounded-lg">
                    <FiTrendingUp className="text-white text-2xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Skills Learned</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-lg">
                    <FiBook className="text-white text-2xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Certifications</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-lg">
                    <FiAward className="text-white text-2xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Avg Salary</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">$95K</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-lg">
                    <FiDollarSign className="text-white text-2xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Progress Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Career Progress</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={careerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="progress"
                      stroke="#ec4899"
                      strokeWidth={2}
                      dot={{ fill: '#ec4899', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Skills Distribution */}
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
                      {skillsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Career Paths Section */}
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

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{activity.title}</p>
                      <p className="text-gray-500 text-sm">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;

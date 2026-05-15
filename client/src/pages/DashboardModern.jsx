import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Book, Award, DollarSign, ArrowRight, Star, Zap, Target, Users } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const DashboardModern = () => {
  const [careerData] = useState([
    { month: 'Jan', progress: 20 },
    { month: 'Feb', progress: 35 },
    { month: 'Mar', progress: 50 },
    { month: 'Apr', progress: 65 },
    { month: 'May', progress: 80 },
    { month: 'Jun', progress: 90 },
  ]);

  const [skillsData] = useState([
    { name: 'JavaScript', value: 85 },
    { name: 'React', value: 75 },
    { name: 'Python', value: 60 },
    { name: 'Data Science', value: 45 },
  ]);

  const [careerPaths] = useState([
    {
      id: 1,
      title: 'Full Stack Developer',
      match: 92,
      description: 'Build web applications with modern technologies',
      icon: '💻',
      color: 'from-blue-500 to-cyan-500',
      salary: '$95K - $150K',
      skills: ['JavaScript', 'React', 'Node.js'],
    },
    {
      id: 2,
      title: 'Data Scientist',
      match: 78,
      description: 'Analyze data and build ML models',
      icon: '📊',
      color: 'from-purple-500 to-pink-500',
      salary: '$100K - $160K',
      skills: ['Python', 'ML', 'Statistics'],
    },
    {
      id: 3,
      title: 'AI Engineer',
      match: 85,
      description: 'Develop AI and machine learning solutions',
      icon: '🤖',
      color: 'from-green-500 to-emerald-500',
      salary: '$110K - $180K',
      skills: ['Python', 'TensorFlow', 'NLP'],
    },
    {
      id: 4,
      title: 'Cloud Architect',
      match: 72,
      description: 'Design and manage cloud infrastructure',
      icon: '☁️',
      color: 'from-orange-500 to-red-500',
      salary: '$120K - $170K',
      skills: ['AWS', 'Docker', 'Kubernetes'],
    },
  ]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8 animate-fadeIn">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome back! 👋</h1>
              <p className="text-slate-600">Here's your career progress and recommendations</p>
            </div>

            {/* Stats Cards - Modern Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { title: 'Career Match', value: '92%', change: '+12%', icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
                { title: 'Skills Learned', value: '12', change: '+3', icon: Book, color: 'from-purple-500 to-purple-600' },
                { title: 'Certifications', value: '3', change: '+1', icon: Award, color: 'from-pink-500 to-pink-600' },
                { title: 'Avg Salary', value: '$95K', change: '+8%', icon: DollarSign, color: 'from-green-500 to-green-600' },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-slate-200 hover:border-slate-300 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-slate-600">{stat.title}</h3>
                      <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="text-white" size={20} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-xs text-green-600 font-medium">{stat.change} from last month</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Career Progress Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Career Progress</h2>
                  <p className="text-sm text-slate-600">Your growth over the last 6 months</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={careerData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="progress"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Progress %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Skills Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Skills Distribution</h2>
                  <p className="text-sm text-slate-600">Your skill proficiency levels</p>
                </div>
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
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Recommended Career Paths</h2>
                  <p className="text-slate-600 text-sm mt-1">Based on your skills and interests</p>
                </div>
                <a href="/recommendations" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
                  View All <ArrowRight size={18} />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {careerPaths.map((path) => (
                  <div
                    key={path.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300 group"
                  >
                    {/* Header with gradient */}
                    <div className={`bg-gradient-to-r ${path.color} h-24 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform`}>
                      {path.icon}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{path.title}</h3>
                      <p className="text-slate-600 text-sm mb-4">{path.description}</p>

                      {/* Match Score */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-700">Match Score</span>
                          <span className="text-sm font-bold text-blue-600">{path.match}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${path.match}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Salary */}
                      <div className="flex items-center gap-2 text-slate-700 mb-4 text-sm">
                        <DollarSign size={16} className="text-green-600" />
                        <span className="font-semibold">{path.salary}</span>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2">
                        {path.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Ready to start your journey?</h3>
                  <p className="text-blue-100">Get personalized recommendations and start learning today</p>
                </div>
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2">
                  Get Started <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardModern;

import React, { useState } from 'react';
import { FiArrowRight, FiBook, FiAward, FiDollarSign, FiTrendingUp, FiFilter, FiSearch } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const Recommendations = () => {
  const [activeTab, setActiveTab] = useState('careers');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const careerRecommendations = [
    {
      id: 1,
      title: 'Full Stack Developer',
      match: 92,
      description: 'Build end-to-end web applications using modern technologies',
      salary: '$95K - $150K',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      roadmap: ['Learn Frontend Basics', 'Master React', 'Backend Development', 'Database Design'],
      icon: '💻',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 2,
      title: 'Data Scientist',
      match: 78,
      description: 'Analyze complex datasets and build predictive models',
      salary: '$100K - $160K',
      skills: ['Python', 'Machine Learning', 'Statistics', 'SQL'],
      roadmap: ['Python Fundamentals', 'Data Analysis', 'ML Algorithms', 'Deep Learning'],
      icon: '📊',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 3,
      title: 'AI/ML Engineer',
      match: 85,
      description: 'Develop intelligent systems and machine learning solutions',
      salary: '$110K - $180K',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP'],
      roadmap: ['ML Basics', 'Deep Learning', 'NLP', 'Computer Vision'],
      icon: '🤖',
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 4,
      title: 'Cloud Architect',
      match: 72,
      description: 'Design and manage cloud infrastructure solutions',
      salary: '$120K - $170K',
      skills: ['AWS', 'Docker', 'Kubernetes', 'DevOps'],
      roadmap: ['Cloud Basics', 'AWS Services', 'Containerization', 'Orchestration'],
      icon: '☁️',
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 5,
      title: 'Frontend Developer',
      match: 88,
      description: 'Create beautiful and responsive user interfaces',
      salary: '$80K - $130K',
      skills: ['React', 'CSS', 'JavaScript', 'UI/UX'],
      roadmap: ['HTML/CSS', 'JavaScript', 'React', 'Advanced UI'],
      icon: '🎨',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      id: 6,
      title: 'Backend Developer',
      match: 80,
      description: 'Build robust server-side applications and APIs',
      salary: '$90K - $140K',
      skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'],
      roadmap: ['Server Basics', 'Express.js', 'Database Design', 'API Development'],
      icon: '⚙️',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const learningPaths = [
    {
      id: 1,
      title: 'Web Development Bootcamp',
      duration: '12 weeks',
      level: 'Beginner',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
      progress: 45,
      icon: '📚',
    },
    {
      id: 2,
      title: 'Advanced React Mastery',
      duration: '8 weeks',
      level: 'Intermediate',
      skills: ['React Hooks', 'State Management', 'Performance'],
      progress: 60,
      icon: '⚛️',
    },
    {
      id: 3,
      title: 'Machine Learning Fundamentals',
      duration: '10 weeks',
      level: 'Intermediate',
      skills: ['Python', 'Scikit-learn', 'Data Analysis'],
      progress: 30,
      icon: '🧠',
    },
    {
      id: 4,
      title: 'Cloud Computing with AWS',
      duration: '6 weeks',
      level: 'Advanced',
      skills: ['AWS', 'EC2', 'S3', 'Lambda'],
      progress: 20,
      icon: '☁️',
    },
  ];

  const skillGaps = [
    {
      skill: 'Advanced JavaScript',
      current: 65,
      required: 90,
      resources: ['JavaScript.info', 'Eloquent JavaScript', 'You Don\'t Know JS'],
    },
    {
      skill: 'System Design',
      current: 40,
      required: 85,
      resources: ['System Design Interview', 'Designing Data-Intensive Applications'],
    },
    {
      skill: 'Database Optimization',
      current: 55,
      required: 80,
      resources: ['PostgreSQL Documentation', 'MongoDB University'],
    },
    {
      skill: 'DevOps & Deployment',
      current: 35,
      required: 75,
      resources: ['Docker Docs', 'Kubernetes Basics', 'CI/CD Pipelines'],
    },
  ];

  const interviewQuestions = [
    {
      id: 1,
      question: 'Explain the difference between var, let, and const in JavaScript',
      difficulty: 'Easy',
      category: 'JavaScript',
    },
    {
      id: 2,
      question: 'How does React\'s virtual DOM work?',
      difficulty: 'Medium',
      category: 'React',
    },
    {
      id: 3,
      question: 'Design a URL shortening service like bit.ly',
      difficulty: 'Hard',
      category: 'System Design',
    },
    {
      id: 4,
      question: 'What is the difference between SQL and NoSQL databases?',
      difficulty: 'Medium',
      category: 'Databases',
    },
    {
      id: 5,
      question: 'Explain the concept of microservices architecture',
      difficulty: 'Hard',
      category: 'Architecture',
    },
  ];

  const filteredCareers = careerRecommendations.filter((career) =>
    career.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Career Recommendations</h1>
              <p className="text-gray-600">Personalized career paths and learning resources based on your profile</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
              {['careers', 'learning', 'skillgaps', 'interview'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-semibold whitespace-nowrap transition border-b-2 ${
                    activeTab === tab
                      ? 'border-pink-500 text-pink-500'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'careers' && 'Career Paths'}
                  {tab === 'learning' && 'Learning Paths'}
                  {tab === 'skillgaps' && 'Skill Gaps'}
                  {tab === 'interview' && 'Interview Prep'}
                </button>
              ))}
            </div>

            {/* Career Paths Tab */}
            {activeTab === 'careers' && (
              <div>
                {/* Search and Filter */}
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

                {/* Career Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCareers.map((career) => (
                    <div
                      key={career.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition transform hover:scale-105"
                    >
                      {/* Header */}
                      <div className={`bg-gradient-to-r ${career.color} h-32 flex items-center justify-center text-5xl`}>
                        {career.icon}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{career.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{career.description}</p>

                        {/* Match Score */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">Match Score</span>
                            <span className="text-lg font-bold text-pink-500">{career.match}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                              style={{ width: `${career.match}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Salary */}
                        <div className="flex items-center space-x-2 mb-4 text-gray-700">
                          <FiDollarSign size={18} className="text-green-500" />
                          <span className="font-semibold">{career.salary}</span>
                        </div>

                        {/* Skills */}
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Key Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {career.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* CTA */}
                        <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2">
                          <span>View Roadmap</span>
                          <FiArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Paths Tab */}
            {activeTab === 'learning' && (
              <div className="space-y-6">
                {learningPaths.map((path) => (
                  <div key={path.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">{path.icon}</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{path.title}</h3>
                          <div className="flex gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <FiBook size={16} />
                              <span>{path.duration}</span>
                            </span>
                            <span className={`px-3 py-1 rounded-full ${
                              path.level === 'Beginner'
                                ? 'bg-green-100 text-green-700'
                                : path.level === 'Intermediate'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {path.level}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition">
                        Start Learning
                      </button>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-pink-500">{path.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${path.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                      {path.skills.map((skill) => (
                        <span key={skill} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skill Gaps Tab */}
            {activeTab === 'skillgaps' && (
              <div className="space-y-6">
                {skillGaps.map((gap, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{gap.skill}</h3>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Current vs Required</p>
                        <p className="text-lg font-bold text-gray-900">{gap.current}% → {gap.required}%</p>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-2 mb-4">
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Current Level</span>
                          <span>{gap.current}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${gap.current}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Required Level</span>
                          <span>{gap.required}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${gap.required}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Resources */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Recommended Resources</p>
                      <div className="flex flex-wrap gap-2">
                        {gap.resources.map((resource) => (
                          <a
                            key={resource}
                            href="#"
                            className="bg-pink-100 text-pink-700 text-sm px-3 py-1 rounded hover:bg-pink-200 transition"
                          >
                            {resource}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Interview Prep Tab */}
            {activeTab === 'interview' && (
              <div className="space-y-4">
                {interviewQuestions.map((q) => (
                  <div key={q.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">{q.question}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                        {q.category}
                      </span>
                      <button className="text-pink-500 hover:text-pink-600 font-semibold flex items-center space-x-2">
                        <span>View Answer</span>
                        <FiArrowRight size={16} />
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
    </div>
  );
};

export default Recommendations;

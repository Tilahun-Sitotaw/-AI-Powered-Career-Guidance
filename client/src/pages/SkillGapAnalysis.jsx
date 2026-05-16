import { useState, useEffect } from 'react';
import { FiArrowRight, FiCheckCircle, FiTrendingUp, FiTarget, FiBarChart2, FiAward } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const SkillGapAnalysis = () => {
  const [skillGaps, setSkillGaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchSkillGaps = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/recommendations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSkillGaps(res.data.skillGaps || []);
      } catch (err) {
        console.error('Skill gap fetch error:', err);
        setError('Failed to load skill gap data.');
      } finally {
        setLoading(false);
      }
    };
    fetchSkillGaps();
  }, []);

  const benefits = [
    {
      title: 'Identify Gaps',
      description: 'Discover which skills you need to develop to reach your career goals.'
    },
    {
      title: 'Personalized Roadmap',
      description: 'Get a customized learning plan based on your current skills and target role.'
    },
    {
      title: 'Track Progress',
      description: 'Monitor your improvement over time with detailed progress reports.'
    },
    {
      title: 'Benchmark Against Industry',
      description: 'Compare your skills with industry standards and peer benchmarks.'
    },
    {
      title: 'Resource Recommendations',
      description: 'Receive curated learning resources to fill your skill gaps efficiently.'
    },
    {
      title: 'Career Insights',
      description: 'Get actionable insights on which skills will boost your career prospects.'
    },
  ];

  const process = [
    {
      step: '01',
      title: 'Take Assessment',
      description: 'Complete our comprehensive skill assessment questionnaire'
    },
    {
      step: '02',
      title: 'Get Analysis',
      description: 'Receive detailed analysis of your current skill levels'
    },
    {
      step: '03',
      title: 'View Gaps',
      description: 'Identify gaps between your skills and target role requirements'
    },
    {
      step: '04',
      title: 'Get Recommendations',
      description: 'Receive personalized learning recommendations and resources'
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">Skill Gap Analysis</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Identify your skill gaps and get personalized recommendations to accelerate your career growth.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Process Section */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold mb-12 text-slate-900">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {process.map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-2xl mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                  {index < process.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-20 w-12 h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skill Gaps from DB */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold mb-12 text-slate-900">Your Skill Gaps</h2>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"></div>
                <span className="ml-4 text-gray-600">Loading your skill gaps...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">{error}</div>
            )}

            {!loading && !isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg">
                Please <a href="/login" className="font-semibold underline">sign in</a> to see your personalized skill gap analysis.
              </div>
            )}

            {!loading && isAuthenticated && skillGaps.length === 0 && !error && (
              <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
                <p>No skill gaps found. Complete your profile to get personalized analysis.</p>
              </div>
            )}

            {!loading && skillGaps.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {skillGaps.map((gap, index) => (
                  <div key={index} className="bg-white border-2 border-gray-200 hover:border-cyan-500 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                    <div className={`bg-gradient-to-r ${
                      gap.importance === 'High' ? 'from-red-500 to-pink-600'
                      : gap.importance === 'Medium' ? 'from-yellow-500 to-orange-500'
                      : 'from-green-500 to-emerald-500'
                    } p-8 text-white`}>
                      <div className="flex items-center justify-between mb-4">
                        <FiBarChart2 className="text-4xl" />
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
                          <a
                            key={i}
                            href="#"
                            className="bg-cyan-100 text-cyan-700 text-sm px-3 py-1 rounded-full hover:bg-cyan-200 transition"
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
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-12">
            <h2 className="text-4xl font-bold mb-12 text-slate-900">Why Use Skill Gap Analysis?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                  <div className="flex items-start space-x-4">
                    <FiCheckCircle className="text-cyan-500 text-2xl flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SkillGapAnalysis;

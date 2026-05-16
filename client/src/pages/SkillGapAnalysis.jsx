import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiTrendingUp, FiTarget, FiBarChart2, FiAward } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SkillGapAnalysis = () => {
  const assessments = [
    {
      title: 'Technical Skills Assessment',
      description: 'Evaluate your proficiency in programming languages, frameworks, and tools',
      duration: '30 mins',
      questions: 25,
      icon: <FiBarChart2 className="text-4xl" />,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Soft Skills Evaluation',
      description: 'Assess communication, leadership, teamwork, and problem-solving abilities',
      duration: '20 mins',
      questions: 20,
      icon: <FiTarget className="text-4xl" />,
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Industry-Specific Skills',
      description: 'Measure expertise in domain-specific knowledge for your target industry',
      duration: '25 mins',
      questions: 22,
      icon: <FiAward className="text-4xl" />,
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Career Readiness Check',
      description: 'Comprehensive evaluation of your overall readiness for career advancement',
      duration: '40 mins',
      questions: 35,
      icon: <FiTrendingUp className="text-4xl" />,
      color: 'from-pink-500 to-orange-600'
    },
  ];

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

          {/* Assessments Section */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold mb-12 text-slate-900">Assessment Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {assessments.map((assessment, index) => (
                <div key={index} className="bg-white border-2 border-gray-200 hover:border-cyan-500 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${assessment.color} p-8 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      {assessment.icon}
                      <span className="text-sm font-semibold bg-white bg-opacity-20 px-3 py-1 rounded-full">{assessment.questions} Q's</span>
                    </div>
                    <h3 className="text-2xl font-bold">{assessment.title}</h3>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <p className="text-gray-700 mb-6">{assessment.description}</p>

                    {/* Duration */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-slate-900">Duration:</span> {assessment.duration}
                      </p>
                    </div>

                    {/* CTA Button */}
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition"
                    >
                      <span>Start Assessment</span>
                      <FiArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
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

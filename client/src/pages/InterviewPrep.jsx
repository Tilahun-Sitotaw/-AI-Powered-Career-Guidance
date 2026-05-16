import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiBook, FiTarget, FiAward, FiPlay } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

const InterviewPrep = () => {
  const modules = [
    {
      title: 'Interview Fundamentals',
      description: 'Learn the basics of interview preparation and what employers are looking for',
      lessons: 8,
      duration: '2 weeks',
      topics: ['Interview Types', 'Preparation Strategies', 'Common Questions', 'Body Language'],
      icon: <FiBook className="text-4xl" />,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Technical Interviews',
      description: 'Master coding problems, system design, and technical problem-solving',
      lessons: 12,
      duration: '3 weeks',
      topics: ['Data Structures', 'Algorithms', 'System Design', 'Code Optimization'],
      icon: <FiTarget className="text-4xl" />,
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Behavioral Interviews',
      description: 'Develop skills to answer behavioral questions using the STAR method',
      lessons: 6,
      duration: '1.5 weeks',
      topics: ['STAR Method', 'Storytelling', 'Conflict Resolution', 'Leadership Examples'],
      icon: <FiAward className="text-4xl" />,
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Mock Interviews',
      description: 'Practice with realistic interview scenarios and get personalized feedback',
      lessons: 10,
      duration: '2.5 weeks',
      topics: ['Live Practice', 'Feedback Sessions', 'Recording Analysis', 'Improvement Plans'],
      icon: <FiPlay className="text-4xl" />,
      color: 'from-pink-500 to-orange-600'
    },
  ];

  const tips = [
    {
      title: 'Research the Company',
      description: 'Understand the company\'s mission, values, recent news, and culture before the interview.'
    },
    {
      title: 'Practice Common Questions',
      description: 'Prepare answers for frequently asked questions like "Tell me about yourself" and "Why do you want this job?"'
    },
    {
      title: 'Prepare Your Stories',
      description: 'Have 5-7 compelling stories ready that demonstrate your skills and achievements.'
    },
    {
      title: 'Ask Smart Questions',
      description: 'Prepare thoughtful questions about the role, team, and company to show genuine interest.'
    },
    {
      title: 'Mock Interview Practice',
      description: 'Practice with friends, mentors, or use our mock interview tool to build confidence.'
    },
    {
      title: 'Follow Up After',
      description: 'Send a thank you email within 24 hours reiterating your interest and key points discussed.'
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">Interview Preparation</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Comprehensive interview preparation courses to help you ace your next job interview with confidence.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Modules Section */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold mb-12 text-slate-900">Interview Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {modules.map((module, index) => (
                <div key={index} className="bg-white border-2 border-gray-200 hover:border-cyan-500 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${module.color} p-8 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      {module.icon}
                      <span className="text-sm font-semibold bg-white bg-opacity-20 px-3 py-1 rounded-full">{module.lessons} Lessons</span>
                    </div>
                    <h3 className="text-2xl font-bold">{module.title}</h3>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <p className="text-gray-700 mb-6">{module.description}</p>

                    {/* Duration */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-slate-900">Duration:</span> {module.duration}
                      </p>
                    </div>

                    {/* Topics */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-900 mb-3">Topics Covered:</h4>
                      <div className="flex flex-wrap gap-2">
                        {module.topics.map((topic, idx) => (
                          <span key={idx} className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition"
                    >
                      <span>Start Preparing</span>
                      <FiArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-12">
            <h2 className="text-4xl font-bold mb-12 text-slate-900">Interview Tips & Tricks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tips.map((tip, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                  <div className="flex items-start space-x-4">
                    <FiCheckCircle className="text-cyan-500 text-2xl flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">{tip.title}</h3>
                      <p className="text-gray-600 text-sm">{tip.description}</p>
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

export default InterviewPrep;

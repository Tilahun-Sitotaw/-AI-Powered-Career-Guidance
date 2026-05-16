import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiBook, FiTarget, FiTrendingUp } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LearningPaths = () => {
  const paths = [
    {
      title: 'Web Development',
      description: 'Master frontend and backend web development with modern technologies',
      duration: '12 weeks',
      level: 'Beginner to Advanced',
      skills: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Databases'],
      icon: <FiBook className="text-4xl" />,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Data Science',
      description: 'Learn data analysis, visualization, and machine learning fundamentals',
      duration: '14 weeks',
      level: 'Intermediate to Advanced',
      skills: ['Python', 'Pandas', 'NumPy', 'Machine Learning', 'Data Visualization'],
      icon: <FiTrendingUp className="text-4xl" />,
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Mobile Development',
      description: 'Build native and cross-platform mobile applications',
      duration: '10 weeks',
      level: 'Intermediate',
      skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile UI/UX'],
      icon: <FiTarget className="text-4xl" />,
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Cloud & DevOps',
      description: 'Master cloud platforms and DevOps practices for scalable applications',
      duration: '10 weeks',
      level: 'Intermediate to Advanced',
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Infrastructure as Code'],
      icon: <FiCheckCircle className="text-4xl" />,
      color: 'from-pink-500 to-orange-600'
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">Learning Paths</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Structured learning paths designed to help you master in-demand skills and advance your career.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {paths.map((path, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 hover:border-cyan-500 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                {/* Header */}
                <div className={`bg-gradient-to-r ${path.color} p-8 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    {path.icon}
                    <span className="text-sm font-semibold bg-white bg-opacity-20 px-3 py-1 rounded-full">{path.level}</span>
                  </div>
                  <h3 className="text-2xl font-bold">{path.title}</h3>
                </div>

                {/* Content */}
                <div className="p-8">
                  <p className="text-gray-700 mb-6">{path.description}</p>

                  {/* Duration */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-slate-900">Duration:</span> {path.duration}
                    </p>
                  </div>

                  {/* Skills */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-900 mb-3">Skills You'll Learn:</h4>
                    <div className="flex flex-wrap gap-2">
                      {path.skills.map((skill, idx) => (
                        <span key={idx} className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition"
                  >
                    <span>Start Learning</span>
                    <FiArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LearningPaths;

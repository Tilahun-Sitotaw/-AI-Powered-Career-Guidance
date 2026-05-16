import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiUsers, FiTarget, FiTrendingUp, FiAward } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

const About = () => {
  const values = [
    {
      icon: <FiTarget className="text-3xl" />,
      title: 'Mission',
      description: 'Empower students with AI-driven career guidance to make informed decisions about their future.',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: <FiUsers className="text-3xl" />,
      title: 'Community',
      description: 'Build a supportive community where students can learn from each other and grow together.',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: <FiTrendingUp className="text-3xl" />,
      title: 'Innovation',
      description: 'Continuously improve our AI algorithms to provide the most accurate career recommendations.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: <FiAward className="text-3xl" />,
      title: 'Excellence',
      description: 'Deliver world-class career guidance and support to help students achieve their goals.',
      color: 'from-pink-500 to-orange-600'
    },
  ];

  const team = [
    { name: 'Team 1', role: 'Lead Developer', image: '/Images/Team1.jpg', telegram: 'https://t.me/tiletechzone' },
    { name: 'Team 2', role: 'AI Specialist', image: '/Images/Team2.jpg', telegram: 'https://t.me/Beki012310' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-600 to-cyan-600 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              About
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> CareerPath AI</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              We're on a mission to revolutionize career guidance through artificial intelligence and personalized learning paths.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-purple-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Our Story</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                CareerPath AI was founded in 2026 by a team of passionate educators and AI researchers who believed that career guidance should be accessible to everyone, regardless of their background or resources.
              </p>
              <p className="text-gray-300 mb-4 leading-relaxed">
                We recognized that traditional career counseling was limited by time, cost, and availability. Our vision was to create an AI-powered platform that could provide personalized, data-driven career recommendations to millions of students worldwide.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Today, we're proud to serve thousands of students who are using our platform to make informed decisions about their careers and achieve their goals.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl blur-2xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl p-8 text-white">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">🚀</div>
                    <div>
                      <p className="font-semibold">Innovative Platform</p>
                      <p className="text-cyan-100 text-sm">AI-powered career guidance</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">🎯</div>
                    <div>
                      <p className="font-semibold">Personalized Paths</p>
                      <p className="text-cyan-100 text-sm">Tailored to your goals</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">✨</div>
                    <div>
                      <p className="font-semibold">Expert Support</p>
                      <p className="text-cyan-100 text-sm">24/7 guidance available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-purple-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-xl text-gray-400">What drives us every day</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="group">
                <div className={`bg-gradient-to-br ${value.color} p-8 rounded-2xl text-white mb-4 transform group-hover:scale-110 transition`}>
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-purple-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-400">Passionate professionals dedicated to your success</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {team.map((member, index) => (
              <a key={index} href={member.telegram} target="_blank" rel="noopener noreferrer" className="group cursor-pointer">
                <div className="bg-gradient-to-br from-purple-900 to-slate-900 border border-purple-800 rounded-2xl overflow-hidden hover:border-cyan-600 transition transform hover:scale-105 duration-300">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-cyan-300 text-sm">{member.role}</p>
                    <p className="text-cyan-400 text-xs mt-3 group-hover:text-cyan-300 font-semibold">→ Open Telegram</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-purple-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Why Choose CareerPath AI?</h2>
            <p className="text-xl text-gray-400">The best career guidance platform for your future</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              'AI-powered personalized recommendations',
              'Comprehensive skill gap analysis',
              'Real-time industry insights',
              'Expert interview preparation',
              'Curated learning resources',
              'Community support and networking',
              '24/7 availability and accessibility',
              'Proven track record of success',
            ].map((reason, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-gradient-to-br from-purple-900 to-slate-900 border border-purple-800 rounded-xl hover:border-cyan-600 transition">
                <div className="flex-shrink-0">
                  <FiCheck className="text-cyan-400 text-2xl" />
                </div>
                <p className="text-gray-300 text-lg">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 sm:px-6 lg:px-8 border-t border-purple-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-cyan-100">
            Join thousands of students who are already transforming their careers with CareerPath AI
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center space-x-2 bg-white text-cyan-600 px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105"
          >
            <span>Get Started Today</span>
            <FiArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;

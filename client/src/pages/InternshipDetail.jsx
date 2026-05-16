import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiExternalLink, FiCheckCircle, FiBriefcase, FiMapPin, FiClock, FiDollarSign } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const DIFFICULTY_COLORS = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-700',
};

const COMPANY_COLORS = [
  'from-blue-500 to-cyan-600',
  'from-purple-500 to-pink-600',
  'from-orange-500 to-red-600',
  'from-green-500 to-teal-600',
  'from-indigo-500 to-blue-600',
  'from-pink-500 to-rose-600',
];

const InternshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get internship from location state or fetch
    const state = window.history.state?.usr;
    if (state?.internship) {
      setInternship(state.internship);
      setLoading(false);
    } else {
      // Fallback: fetch from API
      fetchInternship();
    }
  }, [id]);

  const fetchInternship = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/internships`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const found = res.data.internships?.[parseInt(id)];
      if (found) {
        setInternship(found);
      } else {
        setError('Internship not found');
      }
    } catch (err) {
      setError('Failed to load internship details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-auto flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto px-4 py-8">
              <button
                onClick={() => navigate('/internships')}
                className="flex items-center space-x-2 text-pink-500 hover:text-pink-600 font-semibold mb-6"
              >
                <FiArrowLeft size={20} />
                <span>Back to Internships</span>
              </button>
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                {error || 'Internship not found'}
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  const colorIndex = internship.company.charCodeAt(0) % COMPANY_COLORS.length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <button
              onClick={() => navigate('/internships')}
              className="flex items-center space-x-2 text-pink-500 hover:text-pink-600 font-semibold mb-6"
            >
              <FiArrowLeft size={20} />
              <span>Back to Internships</span>
            </button>

            {/* Header */}
            <div className={`bg-gradient-to-r ${COMPANY_COLORS[colorIndex]} rounded-2xl p-8 text-white mb-8`}>
              <h1 className="text-4xl font-bold mb-2">{internship.company}</h1>
              <p className="text-2xl text-white text-opacity-90 mb-4">{internship.position}</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <FiBriefcase size={20} />
                  <span>{internship.department}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiMapPin size={20} />
                  <span>{internship.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiClock size={20} />
                  <span>{internship.duration}</span>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-2">Difficulty</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${DIFFICULTY_COLORS[internship.difficulty]}`}>
                  {internship.difficulty}
                </span>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-2">Stipend</p>
                <p className="text-2xl font-bold text-green-600">{internship.stipend}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-2">Duration</p>
                <p className="text-lg font-semibold text-gray-900">{internship.duration}</p>
              </div>
            </div>

            {/* Why Good Fit */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why This is a Good Fit</h2>
              <p className="text-gray-700 leading-relaxed text-lg">{internship.whyGoodFit}</p>
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Responsibilities</h2>
              <ul className="space-y-4">
                {(internship.responsibilities || []).map((resp, idx) => (
                  <li key={idx} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <FiCheckCircle className="text-green-500" size={24} />
                    </div>
                    <span className="text-gray-700 text-lg">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Skills */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Required Skills</h2>
              <div className="flex flex-wrap gap-3">
                {(internship.requiredSkills || []).map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Application Section */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border-2 border-pink-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Apply?</h2>
              <p className="text-gray-700 mb-6">
                Click the button below to visit the company's careers page and submit your application.
              </p>
              <a
                href={internship.applyUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-8 rounded-lg hover:shadow-lg transition text-lg"
              >
                <span>Apply Now</span>
                <FiExternalLink size={20} />
              </a>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h3>
              <p className="text-blue-800">
                Before applying, make sure your resume highlights the required skills and your profile matches the job description. Good luck!
              </p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default InternshipDetail;

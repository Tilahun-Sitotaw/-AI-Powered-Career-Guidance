import { useState, useEffect } from 'react';
import { FiArrowRight, FiBriefcase, FiRefreshCw, FiFilter, FiX } from 'react-icons/fi';
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

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [selectedInternship, setSelectedInternship] = useState(null);

  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    if (isAuthenticated) fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/internships`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInternships(res.data.internships || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load internship opportunities.';
      setError(errorMsg);
      console.error('Error fetching internships:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setRegenerating(true);
    setError(null);
    try {
      const res = await axios.post(
        `${API_BASE}/internships/regenerate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInternships(res.data.internships || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to regenerate internship opportunities.';
      setError(errorMsg);
      console.error('Error regenerating internships:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const filteredInternships = internships.filter(i => {
    const difficultyMatch = filterDifficulty === 'All' || i.difficulty === filterDifficulty;
    const locationMatch = filterLocation === 'All' || (i.location && i.location.toLowerCase().includes(filterLocation.toLowerCase()));
    return difficultyMatch && locationMatch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Page header */}
            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Internship Opportunities</h1>
                <p className="text-gray-600">Discover personalized internship opportunities tailored to your skills, interests, and career goals.</p>
              </div>
              {isAuthenticated && (
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating || loading}
                  className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-60"
                >
                  <FiRefreshCw size={16} className={regenerating ? 'animate-spin' : ''} />
                  <span>{regenerating ? 'Regenerating...' : 'Regenerate with AI'}</span>
                </button>
              )}
            </div>

              {/* Not signed in */}
              {!isAuthenticated && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg mb-6">
                  Please <a href="/login" className="font-semibold underline">sign in</a> to see your personalized internship opportunities.
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"></div>
                  <span className="ml-4 text-gray-600">Loading internship opportunities...</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">{error}</div>
              )}

              {/* Empty */}
              {!loading && isAuthenticated && internships.length === 0 && !error && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
                  <FiBriefcase size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No internship opportunities yet.</p>
                  <p className="text-sm mt-2">Complete your profile with skills and a preferred role to get personalized recommendations.</p>
                </div>
              )}

              {/* Filter */}
              {!loading && internships.length > 0 && (
                <div className="mb-8 space-y-4">
                  <div className="flex items-center space-x-3 flex-wrap gap-2">
                    <FiFilter size={18} className="text-gray-600" />
                    <span className="text-sm font-semibold text-gray-600">Filter by difficulty:</span>
                    {['All', 'Easy', 'Medium', 'Hard'].map(level => (
                      <button
                        key={level}
                        onClick={() => setFilterDifficulty(level)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          filterDifficulty === level
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center space-x-3 flex-wrap gap-2">
                    <span className="text-sm font-semibold text-gray-600">Search by location:</span>
                    <input
                      type="text"
                      placeholder="e.g., Remote, New York, India..."
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    {filterLocation !== 'All' && (
                      <button
                        onClick={() => setFilterLocation('All')}
                        className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Internship cards */}
              {!loading && filteredInternships.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInternships.map((internship, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedInternship(internship)}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 hover:border-pink-500"
                    >
                      {/* Header */}
                      <div className={`bg-gradient-to-r ${COMPANY_COLORS[index % COMPANY_COLORS.length]} p-6 text-white`}>
                        <h3 className="text-xl font-bold mb-1">{internship.company}</h3>
                        <p className="text-sm text-white text-opacity-90">{internship.position}</p>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Location</p>
                          <p className="text-sm font-medium text-gray-700">{internship.location || 'Not specified'}</p>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Department</p>
                          <p className="text-sm font-medium text-gray-700">{internship.department}</p>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Duration</p>
                          <p className="text-sm font-medium text-gray-700">{internship.duration}</p>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Difficulty</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${DIFFICULTY_COLORS[internship.difficulty]}`}>
                            {internship.difficulty}
                          </span>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Stipend</p>
                          <p className="text-sm font-medium text-green-600">{internship.stipend}</p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInternship(internship);
                          }}
                          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition"
                        >
                          <span>View Details</span>
                          <FiArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No results after filter */}
              {!loading && filteredInternships.length === 0 && internships.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
                  <FiBriefcase size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No internships found with this difficulty level.</p>
                </div>
              )}
          </div>
        </main>
      </div>
      <Footer />

      {/* Detail Modal */}
      {selectedInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className={`bg-gradient-to-r ${COMPANY_COLORS[internships.indexOf(selectedInternship) % COMPANY_COLORS.length]} p-8 text-white flex items-start justify-between`}>
              <div>
                <h2 className="text-3xl font-bold mb-2">{selectedInternship.company}</h2>
                <p className="text-lg text-white text-opacity-90">{selectedInternship.position}</p>
              </div>
              <button
                onClick={() => setSelectedInternship(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Location</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedInternship.location || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Department</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedInternship.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Duration</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedInternship.duration}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Stipend</p>
                  <p className="text-lg font-semibold text-green-600">{selectedInternship.stipend}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Difficulty</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${DIFFICULTY_COLORS[selectedInternship.difficulty]}`}>
                    {selectedInternship.difficulty}
                  </span>
                </div>
              </div>

              {/* Responsibilities */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Key Responsibilities</h3>
                <ul className="space-y-2">
                  {(selectedInternship.responsibilities || []).map((resp, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <span className="text-pink-500 font-bold mt-1">•</span>
                      <span className="text-gray-700">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Skills */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedInternship.requiredSkills || []).map((skill, idx) => {
                    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(skill + ' tutorial')}`;
                    return (
                      <a
                        key={idx}
                        href={searchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-200 hover:text-blue-800 transition cursor-pointer"
                      >
                        {skill} →
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Why Good Fit */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Why This is a Good Fit</h3>
                <p className="text-gray-700 leading-relaxed">{selectedInternship.whyGoodFit}</p>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-4">
                <a
                  href={selectedInternship.applyUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition text-center"
                >
                  Apply Now →
                </a>
                <button
                  onClick={() => setSelectedInternship(null)}
                  className="flex-1 border-2 border-red-500 text-red-600 font-semibold py-3 rounded-lg hover:bg-red-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Internships;

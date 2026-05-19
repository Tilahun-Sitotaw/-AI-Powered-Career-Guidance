import { useState, useEffect } from 'react';
import { FiRefreshCw, FiExternalLink, FiX, FiMapPin, FiBriefcase, FiClock, FiDollarSign, FiAward, FiAlertCircle, FiTrendingUp, FiSearch } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const CARD_COLORS = [
  'from-indigo-500 via-blue-500 to-cyan-500',
  'from-cyan-500 via-teal-500 to-emerald-500',
  'from-purple-500 via-indigo-500 to-blue-500',
  'from-teal-500 via-emerald-500 to-green-500',
  'from-blue-600 via-indigo-600 to-purple-600',
];

const DIFFICULTY_COLORS = {
  Easy: 'bg-green-50 text-green-700 border-green-200',
  Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Hard: 'bg-red-50 text-red-700 border-red-200',
};

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/internships`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInternships(res.data.internships || []);
    } catch (err) {
      setError('Failed to load internship opportunities.');
      console.error('Internships error:', err);
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
      handleResetFilters();
    } catch (err) {
      setError('Failed to regenerate internship opportunities.');
      console.error('Regenerate error:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleResetFilters = () => {
    setFilterDifficulty('All');
    setSearchTerm('');
  };

  const filteredInternships = internships.filter((internship) => {
    const difficultyMatch = filterDifficulty === 'All' || internship.difficulty === filterDifficulty;
    
    const search = searchTerm.toLowerCase().trim();
    if (!search) return difficultyMatch;
    
    const companyMatch = internship.company && internship.company.toLowerCase().includes(search);
    const positionMatch = internship.position && internship.position.toLowerCase().includes(search);
    const deptMatch = internship.department && internship.department.toLowerCase().includes(search);
    const locationMatch = internship.location && internship.location.toLowerCase().includes(search);
    
    const requiredSkills = internship.requiredSkills || [];
    const skillMatch = requiredSkills.some(s => s.toLowerCase().includes(search));
    
    const matchesSearch = companyMatch || positionMatch || deptMatch || locationMatch || skillMatch;
    
    return difficultyMatch && matchesSearch;
  });

  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Hero */}
            <section className="bg-gradient-to-br from-indigo-50/70 via-cyan-50/70 to-emerald-50/70 text-gray-900 py-16 px-6 sm:px-8 rounded-3xl mb-8 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-cyan-600 to-teal-600 mb-4">Internship Opportunities</h1>
                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                  Discover curated internship placements matched precisely to your academic department, skills, and target career goals.
                </p>
              </div>
              {isAuthenticated && (
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating || loading}
                  className="flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-teal-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition duration-300 disabled:opacity-60 disabled:transform-none"
                >
                  <FiRefreshCw size={18} className={regenerating ? 'animate-spin' : ''} />
                  <span>{regenerating ? 'Finding Placements...' : 'Refresh with AI'}</span>
                </button>
              )}
            </section>

            {/* Not signed in */}
            {!isAuthenticated && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl mb-6">
                Please <a href="/login" className="font-semibold underline text-amber-950">sign in</a> to see your personalized internship opportunities.
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                <span className="mt-4 text-slate-600 font-medium">Analyzing your profile & finding internships...</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-xl mb-6 flex items-center space-x-2">
                <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Empty */}
            {!loading && isAuthenticated && internships.length === 0 && !error && (
              <div className="bg-white rounded-2xl shadow-md p-16 text-center text-slate-500 border border-slate-100 max-w-2xl mx-auto">
                <FiBriefcase size={48} className="mx-auto mb-4 text-indigo-300" />
                <p className="text-xl font-bold text-slate-800">No placements available yet.</p>
                <p className="text-slate-500 mt-2">Add your skills, interests, and target roles to your profile, then click "Refresh with AI" above to generate matches.</p>
              </div>
            )}

            {/* Stats & Filters */}
            {!loading && internships.length > 0 && (
              <>
                {/* Sleek Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matched Positions</p>
                      <p className="text-2xl font-extrabold text-indigo-600 mt-1">{internships.length}</p>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 flex-shrink-0">
                      <FiBriefcase className="w-5 h-5" />
                    </div>
                  </div>
                  {['Easy', 'Medium', 'Hard'].map((level) => {
                    const count = internships.filter((i) => i.difficulty === level).length;
                    const colors = {
                      Easy: { bg: 'bg-green-50 text-green-600 border-green-100', text: 'text-green-700' },
                      Medium: { bg: 'bg-amber-50 text-amber-600 border-amber-100', text: 'text-amber-700' },
                      Hard: { bg: 'bg-rose-50 text-rose-600 border-rose-100', text: 'text-rose-700' },
                    };
                    const colorData = colors[level];
                    return (
                      <div key={level} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{level} Level</p>
                          <p className={`text-2xl font-extrabold ${colorData.text} mt-1`}>{count}</p>
                        </div>
                        <div className={`${colorData.bg} p-2 rounded-lg flex-shrink-0`}>
                          <FiTrendingUp className="w-5 h-5" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Unified, Responsive Filter Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Unified Search Input */}
                  <div className="relative w-full md:flex-1">
                    <input
                      type="text"
                      placeholder="Search internships by role, company, country, city, or required skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 transition-all duration-300"
                    />
                    <FiSearch className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>

                  {/* Difficulty pills */}
                  <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto md:min-w-[280px]">
                    {['All', 'Easy', 'Medium', 'Hard'].map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFilterDifficulty(level)}
                        className={`flex-1 md:flex-initial md:px-5 py-2 rounded-lg text-sm font-semibold transition ${
                          filterDifficulty === level
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Internship Cards Grid */}
                {filteredInternships.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInternships.map((internship, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedInternship(internship)}
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden border border-slate-100 hover:border-indigo-500 flex flex-col justify-between"
                      >
                        {/* Header banner */}
                        <div>
                          <div className={`bg-gradient-to-r ${CARD_COLORS[index % CARD_COLORS.length]} p-6 text-white relative`}>
                            <div className="absolute top-0 right-0 p-4 opacity-15">
                              <FiBriefcase size={64} />
                            </div>
                            <h3 className="text-xl font-bold mb-1 leading-snug truncate">{internship.company}</h3>
                            <p className="text-sm text-indigo-50/90 font-medium truncate">{internship.position}</p>
                          </div>

                          {/* Content */}
                          <div className="p-6 space-y-4">
                            <div className="flex items-center text-slate-600 text-sm gap-2">
                              <FiMapPin className="text-slate-400 w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{internship.location || 'Remote / Global'}</span>
                            </div>

                            <div className="flex items-center text-slate-600 text-sm gap-2">
                              <FiAward className="text-slate-400 w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{internship.department || 'General'}</span>
                            </div>

                            <div className="flex items-center text-slate-600 text-sm gap-2">
                              <FiClock className="text-slate-400 w-4 h-4 flex-shrink-0" />
                              <span>{internship.duration || '3-6 Months'}</span>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${DIFFICULTY_COLORS[internship.difficulty] || 'bg-slate-100 text-slate-700'}`}>
                                {internship.difficulty}
                              </span>
                              <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                                <FiDollarSign className="w-3.5 h-3.5" /> {internship.stipend || 'Competitive'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 pt-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInternship(internship);
                            }}
                            className="w-full flex items-center justify-center space-x-2 bg-slate-50 border border-slate-200 text-indigo-600 font-semibold py-2.5 rounded-xl group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-teal-500 group-hover:text-white group-hover:border-transparent transition-all duration-300"
                          >
                            <span>View Placement Details</span>
                            <FiExternalLink size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-500">
                    <p className="text-lg font-bold text-slate-800">No placements match your active filters.</p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 text-indigo-600 hover:text-indigo-800 font-semibold text-sm underline"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />

      {/* Modern Detail Modal */}
      {selectedInternship && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-100">
            {/* Header */}
            <div className={`bg-gradient-to-r ${CARD_COLORS[internships.indexOf(selectedInternship) % CARD_COLORS.length]} p-8 text-white flex items-start justify-between relative`}>
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold mb-2">
                  Internship Opportunity
                </span>
                <h2 className="text-3xl font-extrabold mb-1">{selectedInternship.company}</h2>
                <p className="text-lg text-white/90 font-medium">{selectedInternship.position}</p>
              </div>
              <button
                onClick={() => setSelectedInternship(null)}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-0.5">Location</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5"><FiMapPin className="text-indigo-500 w-4 h-4 flex-shrink-0" /> {selectedInternship.location || 'Remote'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-0.5">Department</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5"><FiBriefcase className="text-indigo-500 w-4 h-4 flex-shrink-0" /> {selectedInternship.department}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-0.5">Duration</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5"><FiClock className="text-indigo-500 w-4 h-4 flex-shrink-0" /> {selectedInternship.duration}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-0.5">Stipend</p>
                  <p className="font-semibold text-green-600 flex items-center gap-1"><FiDollarSign className="w-4 h-4" /> {selectedInternship.stipend || 'Competitive'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-0.5">Difficulty</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mt-0.5 ${DIFFICULTY_COLORS[selectedInternship.difficulty]}`}>
                    {selectedInternship.difficulty}
                  </span>
                </div>
              </div>

              {/* Match Reason */}
              {selectedInternship.whyGoodFit && (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5">
                  <p className="text-indigo-800 text-xs font-bold uppercase tracking-wider mb-1.5">✨ Why it matches you</p>
                  <p className="text-indigo-950 text-sm leading-relaxed">{selectedInternship.whyGoodFit}</p>
                </div>
              )}

              {/* Responsibilities */}
              {selectedInternship.responsibilities?.length > 0 && (
                <div>
                  <h3 className="text-md font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs">Key Responsibilities</h3>
                  <ul className="space-y-2">
                    {selectedInternship.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm text-slate-600">
                        <span className="text-indigo-500 font-bold mt-0.5">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Skills */}
              {selectedInternship.requiredSkills?.length > 0 && (
                <div>
                  <h3 className="text-md font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs">Required Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInternship.requiredSkills.map((skill, idx) => (
                      <a
                        key={idx}
                        href={`https://www.google.com/search?q=${encodeURIComponent(skill + ' training course')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-indigo-100"
                      >
                        {skill} <FiExternalLink size={10} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex space-x-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedInternship(null)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <a
                  href={selectedInternship.applyUrl || selectedInternship.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition text-center flex items-center justify-center space-x-1.5"
                >
                  <span>Apply Now</span>
                  <FiExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Internships;

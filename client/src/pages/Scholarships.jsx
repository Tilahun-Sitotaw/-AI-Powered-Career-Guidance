import { useState, useEffect } from 'react';
import { FiAward, FiCalendar, FiExternalLink, FiRefreshCw, FiAlertCircle, FiX, FiTrendingUp, FiUser, FiInfo, FiSearch } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const CARD_COLORS = [
  'from-pink-500 via-rose-500 to-red-500',
  'from-purple-500 via-pink-500 to-rose-500',
  'from-indigo-500 via-purple-500 to-pink-500',
  'from-blue-500 via-indigo-500 to-purple-500',
  'from-cyan-500 via-blue-500 to-indigo-500',
];

const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [fundingFilter, setFundingFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/scholarships`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScholarships(res.data.scholarships || []);
    } catch (err) {
      setError('Failed to load scholarships.');
      console.error(err);
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
        `${API_BASE}/scholarships/regenerate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScholarships(res.data.scholarships || []);
      handleResetFilters();
    } catch (err) {
      setError('Failed to regenerate scholarships.');
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleResetFilters = () => {
    setFundingFilter('All');
    setSearchTerm('');
  };

  const getFundingCategory = (amountStr) => {
    if (!amountStr) return 'Varies';
    const s = amountStr.toLowerCase();
    if (s.includes('fully')) return 'Fully Funded';
    if (s.includes('partial')) return 'Partial Funding';
    return 'Varies';
  };

  const filteredScholarships = scholarships.filter((s) => {
    const fundingMatch = fundingFilter === 'All' || getFundingCategory(s.amount) === fundingFilter;
    
    const search = searchTerm.toLowerCase().trim();
    if (!search) return fundingMatch;
    
    const nameMatch = s.name && s.name.toLowerCase().includes(search);
    const providerMatch = s.provider && s.provider.toLowerCase().includes(search);
    const descMatch = s.description && s.description.toLowerCase().includes(search);
    const eligibilityMatch = s.eligibility && s.eligibility.toLowerCase().includes(search);
    
    const matchesSearch = nameMatch || providerMatch || descMatch || eligibilityMatch;
    
    return fundingMatch && matchesSearch;
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
            <section className="bg-gradient-to-br from-pink-50/70 via-rose-50/70 to-indigo-50/70 text-gray-900 py-16 px-6 sm:px-8 rounded-3xl mb-8 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 mb-4">Personalized Scholarships</h1>
                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                  Discover fully and partially funded academic scholarships curated specifically for your profile, skills, and background.
                </p>
              </div>
              {isAuthenticated && (
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating || loading}
                  className="flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition duration-300 disabled:opacity-60 disabled:transform-none"
                >
                  <FiRefreshCw size={18} className={regenerating ? 'animate-spin' : ''} />
                  <span>{regenerating ? 'Finding Scholarships...' : 'Refresh with AI'}</span>
                </button>
              )}
            </section>

            {/* Not signed in */}
            {!isAuthenticated && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl mb-6">
                Please <a href="/login" className="font-semibold underline text-amber-950">sign in</a> to see your personalized scholarships.
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
                <span className="mt-4 text-slate-600 font-medium">Matching your academic background with global scholarships...</span>
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
            {!loading && isAuthenticated && scholarships.length === 0 && !error && (
              <div className="bg-white rounded-2xl shadow-md p-16 text-center text-slate-500 border border-slate-100 max-w-2xl mx-auto">
                <FiAward size={48} className="mx-auto mb-4 text-rose-300" />
                <p className="text-xl font-bold text-slate-800">No scholarships matched yet.</p>
                <p className="text-slate-500 mt-2">Complete your profile with a department and skills, then click "Refresh with AI" above to find opportunities.</p>
              </div>
            )}

            {/* Stats & Filters */}
            {!loading && scholarships.length > 0 && (
              <>
                {/* Compact, Sleek Stats Dashboard */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matched Awards</p>
                      <p className="text-2xl font-extrabold text-rose-600 mt-1">{scholarships.length}</p>
                    </div>
                    <div className="bg-rose-50 p-2 rounded-lg text-rose-600 flex-shrink-0">
                      <FiAward className="w-5 h-5" />
                    </div>
                  </div>
                  {['Fully Funded', 'Partial Funding', 'Varies'].map((level) => {
                    const count = scholarships.filter((s) => getFundingCategory(s.amount) === level).length;
                    const colors = {
                      'Fully Funded': { bg: 'bg-green-50 text-green-600 border-green-100', text: 'text-green-700' },
                      'Partial Funding': { bg: 'bg-yellow-50 text-yellow-600 border-yellow-100', text: 'text-yellow-700' },
                      'Varies': { bg: 'bg-indigo-50 text-indigo-600 border-indigo-100', text: 'text-indigo-700' },
                    };
                    const colorData = colors[level];
                    return (
                      <div key={level} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{level}</p>
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
                      placeholder="Search scholarships by name, provider, eligible field, or coverage description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-slate-50/50 transition-all duration-300"
                    />
                    <FiSearch className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-rose-600 transition"
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>

                  {/* Funding Coverage selection pills */}
                  <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto md:min-w-[320px]">
                    {['All', 'Fully Funded', 'Partial Funding', 'Varies'].map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFundingFilter(level)}
                        className={`flex-1 md:flex-initial md:px-4 py-2 rounded-lg text-sm font-semibold transition ${
                          fundingFilter === level
                            ? 'bg-white text-rose-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scholarship Cards Grid */}
                {filteredScholarships.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredScholarships.map((s, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedScholarship(s)}
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden border border-slate-100 hover:border-rose-500 flex flex-col justify-between"
                      >
                        <div>
                          {/* Card header */}
                          <div className={`bg-gradient-to-r ${CARD_COLORS[index % CARD_COLORS.length]} p-6 text-white relative`}>
                            <div className="absolute top-0 right-0 p-4 opacity-15">
                              <FiAward size={64} />
                            </div>
                            <h3 className="text-xl font-bold mb-1 leading-snug truncate">{s.name}</h3>
                            <p className="text-sm text-rose-50/90 font-medium truncate">{s.provider}</p>
                          </div>

                          {/* Card body */}
                          <div className="p-6 space-y-4">
                            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">{s.description}</p>

                            <div className="flex items-center text-slate-600 text-sm gap-2">
                              <FiCalendar className="text-slate-400 w-4 h-4 flex-shrink-0" />
                              <span className="font-semibold">Deadline:</span>
                              <span className="truncate">{s.deadline || 'Check Website'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 pt-0 flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedScholarship(s);
                            }}
                            className="flex-1 bg-slate-50 border border-slate-200 text-rose-600 font-semibold py-2.5 rounded-xl group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-rose-600 group-hover:text-white group-hover:border-transparent transition-all duration-300 text-center text-sm"
                          >
                            View Details
                          </button>
                          <a
                            href={s.link && s.link !== '#' ? s.link : '#'}
                            target={s.link && s.link !== '#' ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold py-2.5 rounded-xl transition text-center text-sm flex items-center justify-center gap-1.5"
                          >
                            Apply Portal <FiExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-500">
                    <p className="text-lg font-bold text-slate-800">No scholarships match your funding filter.</p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 text-rose-600 hover:text-rose-800 font-semibold text-sm underline"
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
      {selectedScholarship && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-100">
            {/* Header */}
            <div className={`bg-gradient-to-r ${CARD_COLORS[scholarships.indexOf(selectedScholarship) % CARD_COLORS.length]} p-8 text-white flex items-start justify-between relative`}>
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold mb-2">
                  Academic Scholarship Opportunity
                </span>
                <h2 className="text-3xl font-extrabold mb-1">{selectedScholarship.name}</h2>
                <p className="text-lg text-white/90 font-medium">{selectedScholarship.provider}</p>
              </div>
              <button
                onClick={() => setSelectedScholarship(null)}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-0.5">Funding Amount</p>
                  <p className="font-semibold text-green-700 flex items-center gap-1.5">
                    <FiInfo className="w-4 h-4 text-green-600" /> {selectedScholarship.amount || 'Full Funding'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-0.5">Deadline</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <FiCalendar className="text-rose-500 w-4 h-4" /> {selectedScholarship.deadline || 'Check Portal'}
                  </p>
                </div>
              </div>

              {/* Match Reason */}
              {selectedScholarship.matchReason && (
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5">
                  <p className="text-rose-800 text-xs font-bold uppercase tracking-wider mb-1.5">✨ Why it matches you</p>
                  <p className="text-rose-950 text-sm leading-relaxed">{selectedScholarship.matchReason}</p>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-md font-bold text-slate-900 mb-2.5 uppercase tracking-wider text-xs">About the Scholarship</h3>
                <p className="text-slate-650 text-sm leading-relaxed">{selectedScholarship.description}</p>
              </div>

              {/* Eligibility */}
              {selectedScholarship.eligibility && (
                <div>
                  <h3 className="text-md font-bold text-slate-900 mb-2.5 uppercase tracking-wider text-xs">Eligibility Criteria</h3>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 flex items-start gap-2.5">
                    <FiUser className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <span>{selectedScholarship.eligibility}</span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex space-x-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedScholarship(null)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <a
                  href={selectedScholarship.link && selectedScholarship.link !== '#' ? selectedScholarship.link : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition text-center flex items-center justify-center space-x-1.5"
                >
                  <span>Apply Portal</span>
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

export default Scholarships;

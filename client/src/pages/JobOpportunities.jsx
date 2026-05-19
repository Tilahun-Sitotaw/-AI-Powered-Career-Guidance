import { useState, useEffect } from 'react';
import { FiExternalLink, FiRefreshCw, FiAlertCircle, FiBriefcase, FiMapPin, FiDollarSign, FiClock, FiX, FiTrendingUp, FiSearch } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const CARD_COLORS = [
  'from-blue-600 via-indigo-600 to-purple-600',
  'from-indigo-500 via-blue-500 to-cyan-500',
  'from-cyan-500 via-teal-500 to-emerald-500',
  'from-purple-500 via-pink-500 to-rose-500',
  'from-teal-500 via-emerald-500 to-green-500',
];

const JobOpportunities = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data.jobs || []);
    } catch (err) {
      setError('Failed to load job opportunities.');
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
        `${API_BASE}/jobs/regenerate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobs(res.data.jobs || []);
      handleResetFilters();
    } catch (err) {
      setError('Failed to regenerate job opportunities.');
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleResetFilters = () => {
    setActiveFilter('All');
    setSearchTerm('');
  };

  const filteredJobs = jobs.filter((job) => {
    const typeMatch = activeFilter === 'All' || job.type === activeFilter;
    
    const search = searchTerm.toLowerCase().trim();
    if (!search) return typeMatch;
    
    const companyMatch = job.company && job.company.toLowerCase().includes(search);
    const titleMatch = job.title && job.title.toLowerCase().includes(search);
    const locationMatch = job.location && job.location.toLowerCase().includes(search);
    const descMatch = job.description && job.description.toLowerCase().includes(search);
    
    const skills = job.skills || [];
    const skillMatch = skills.some(s => s.toLowerCase().includes(search));
    
    const matchesSearch = companyMatch || titleMatch || locationMatch || descMatch || skillMatch;
    
    return typeMatch && matchesSearch;
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
            <section className="bg-gradient-to-br from-blue-50/70 via-indigo-50/70 to-purple-50/70 text-gray-900 py-16 px-6 sm:px-8 rounded-3xl mb-8 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-4">Job Opportunities</h1>
                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                  Discover career openings and roles matched precisely to your professional background, skills, and target positions.
                </p>
              </div>
              {isAuthenticated && (
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating || loading}
                  className="flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition duration-300 disabled:opacity-60 disabled:transform-none"
                >
                  <FiRefreshCw size={18} className={regenerating ? 'animate-spin' : ''} />
                  <span>{regenerating ? 'Finding Jobs...' : 'Refresh with AI'}</span>
                </button>
              )}
            </section>

            {/* Not signed in */}
            {!isAuthenticated && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl mb-6">
                Please <a href="/login" className="font-semibold underline text-amber-950">sign in</a> to see your personalized jobs.
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                <span className="mt-4 text-slate-600 font-medium">Matching your skills with global job opportunities...</span>
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
            {!loading && isAuthenticated && jobs.length === 0 && !error && (
              <div className="bg-white rounded-2xl shadow-md p-16 text-center text-slate-500 border border-slate-100 max-w-2xl mx-auto">
                <FiBriefcase size={48} className="mx-auto mb-4 text-indigo-300" />
                <p className="text-xl font-bold text-slate-800">No job matches yet.</p>
                <p className="text-slate-500 mt-2">Update your profile with a preferred role and target skills, then click "Refresh with AI" above to generate job listings.</p>
              </div>
            )}

            {/* Stats & Filters */}
            {!loading && jobs.length > 0 && (
              <>
                {/* Sleek Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matched Careers</p>
                      <p className="text-2xl font-extrabold text-indigo-600 mt-1">{jobs.length}</p>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 flex-shrink-0">
                      <FiBriefcase className="w-5 h-5" />
                    </div>
                  </div>
                  {['Full-time', 'Remote', 'Contract'].map((level) => {
                    const count = jobs.filter((j) => (j.type || '').toLowerCase().includes(level.toLowerCase())).length;
                    const colors = {
                      'Full-time': { bg: 'bg-green-50 text-green-600 border-green-100', text: 'text-green-700' },
                      'Remote': { bg: 'bg-cyan-50 text-cyan-600 border-cyan-100', text: 'text-cyan-700' },
                      'Contract': { bg: 'bg-amber-50 text-amber-600 border-amber-100', text: 'text-amber-700' },
                    };
                    const colorData = colors[level] || { bg: 'bg-slate-50 text-slate-600 border-slate-100', text: 'text-slate-700' };
                    return (
                      <div key={level} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{level} Jobs</p>
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
                      placeholder="Search jobs by title, company, location, salary, or required skills..."
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

                  {/* Job type pills */}
                  <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto md:min-w-[280px]">
                    {['All', 'Full-time', 'Remote', 'Contract'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setActiveFilter(type)}
                        className={`flex-1 md:flex-initial md:px-5 py-2 rounded-lg text-sm font-semibold transition ${
                          activeFilter === type
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Jobs Grid */}
                {filteredJobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredJobs.map((job, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedJob(job)}
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden border border-slate-100 hover:border-indigo-500 flex flex-col justify-between"
                      >
                        <div>
                          {/* Card header */}
                          <div className={`bg-gradient-to-r ${CARD_COLORS[index % CARD_COLORS.length]} p-6 text-white relative`}>
                            <div className="absolute top-0 right-0 p-4 opacity-15">
                              <FiBriefcase size={64} />
                            </div>
                            <h3 className="text-xl font-bold mb-1 leading-snug truncate">{job.title}</h3>
                            <p className="text-sm text-indigo-50/90 font-medium truncate">{job.company}</p>
                            {job.type && (
                              <span className="mt-3 inline-block bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-semibold">
                                {job.type}
                              </span>
                            )}
                          </div>

                          {/* Card body */}
                          <div className="p-6 space-y-4">
                            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">{job.description}</p>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-slate-500">
                              {job.location && (
                                <div className="flex items-center gap-1.5">
                                  <FiMapPin className="text-slate-400 w-4 h-4 flex-shrink-0" />
                                  <span>{job.location}</span>
                                </div>
                              )}
                            </div>
                            {job.salary && (
                              <div className="flex items-center gap-1.5 text-green-600 font-medium">
                                <FiDollarSign className="w-4 h-4 flex-shrink-0" />
                                <span>{job.salary}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-6 pt-0 flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJob(job);
                            }}
                            className="flex-1 bg-slate-50 border border-slate-200 text-indigo-600 font-semibold py-2.5 rounded-xl group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white group-hover:border-transparent transition-all duration-300 text-center text-sm"
                          >
                            View Job Details
                          </button>
                          <a
                            href={job.link && job.link !== '#' ? job.link : '#'}
                            target={job.link && job.link !== '#' ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold py-2.5 rounded-xl transition text-center text-sm flex items-center justify-center gap-1.5"
                          >
                            Apply Portal <FiExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-500">
                    <p className="text-lg font-bold text-slate-800">No jobs match your active filters.</p>
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
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-100">
            {/* Header */}
            <div className={`bg-gradient-to-r ${CARD_COLORS[jobs.indexOf(selectedJob) % CARD_COLORS.length]} p-8 text-white flex items-start justify-between relative`}>
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold mb-2">
                  Personalized Job opening
                </span>
                <h2 className="text-3xl font-extrabold mb-1">{selectedJob.title}</h2>
                <p className="text-lg text-white/90 font-medium">{selectedJob.company}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-0.5">Location</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <FiMapPin className="text-indigo-500 w-4 h-4 flex-shrink-0" /> {selectedJob.location || 'Remote'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-0.5">Job Type</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <FiBriefcase className="text-indigo-500 w-4 h-4 flex-shrink-0" /> {selectedJob.type || 'Full-time'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-0.5">Estimated Salary</p>
                  <p className="font-semibold text-green-700 flex items-center gap-1.5">
                    <FiDollarSign className="w-4 h-4 text-green-600 flex-shrink-0" /> {selectedJob.salary || 'Competitive'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-0.5">Apply By</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <FiClock className="text-indigo-500 w-4 h-4 flex-shrink-0" /> {selectedJob.deadline || 'Check Website'}
                  </p>
                </div>
              </div>

              {/* Match Reason */}
              {selectedJob.matchReason && (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5">
                  <p className="text-indigo-800 text-xs font-bold uppercase tracking-wider mb-1.5">✨ Why it matches your profile</p>
                  <p className="text-indigo-950 text-sm leading-relaxed">{selectedJob.matchReason}</p>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-md font-bold text-slate-900 mb-2.5 uppercase tracking-wider text-xs">About the Role</h3>
                <p className="text-slate-650 text-sm leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Required Skills */}
              {selectedJob.skills?.length > 0 && (
                <div>
                  <h3 className="text-md font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs">Required & Recommended Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.skills.map((skill, idx) => (
                      <a
                        key={idx}
                        href={`https://www.google.com/search?q=${encodeURIComponent(skill + ' tutorials')}`}
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
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <a
                  href={selectedJob.link && selectedJob.link !== '#' ? selectedJob.link : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition text-center flex items-center justify-center space-x-1.5"
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

export default JobOpportunities;

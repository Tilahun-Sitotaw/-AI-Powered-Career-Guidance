import { useState, useEffect } from 'react';
import { FiExternalLink, FiRefreshCw, FiAlertCircle, FiBriefcase, FiMapPin, FiDollarSign, FiClock } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const CARD_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-cyan-500 to-teal-500',
  'from-teal-500 to-emerald-500',
  'from-green-500 to-teal-500',
  'from-indigo-500 to-blue-500',
  'from-blue-600 to-cyan-500',
];

const JobOpportunities = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/recommendations/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data.jobs || []);
    } catch (err) {
      setError('Failed to load job opportunities.');
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
        `${API_BASE}/recommendations/jobs/regenerate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobs(res.data.jobs || []);
      setActiveFilter('All');
    } catch (err) {
      setError('Failed to regenerate job opportunities.');
    } finally {
      setRegenerating(false);
    }
  };

  const jobTypes = ['All', ...new Set(jobs.map((j) => j.type).filter(Boolean))];
  const filtered = activeFilter === 'All' ? jobs : jobs.filter((j) => j.type === activeFilter);

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
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Opportunities</h1>
                <p className="text-gray-600">AI-matched job openings based on your skills and career goals</p>
              </div>
              <button
                onClick={handleRegenerate}
                disabled={regenerating || loading}
                className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-60"
              >
                <FiRefreshCw size={16} className={regenerating ? 'animate-spin' : ''} />
                <span>{regenerating ? 'Finding Jobs...' : 'Refresh with AI'}</span>
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                <span className="ml-4 text-gray-600 text-lg">Finding job opportunities for you...</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-center space-x-2">
                <FiAlertCircle />
                <span>{error}</span>
              </div>
            )}

            {/* Empty */}
            {!loading && jobs.length === 0 && !error && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
                <FiBriefcase size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No job opportunities found yet.</p>
                <p className="text-sm mt-2">Complete your profile with skills and a preferred role to get matched jobs.</p>
              </div>
            )}

            {/* Filter tabs */}
            {!loading && jobs.length > 0 && (
              <>
                <div className="flex flex-wrap gap-2 mb-6">
                  {jobTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveFilter(type)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                        activeFilter === type
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filtered.map((job, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-gray-100">
                      {/* Card header */}
                      <div className={`bg-gradient-to-r ${CARD_COLORS[i % CARD_COLORS.length]} p-5 text-white`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                            <p className="text-white text-opacity-90 text-sm font-medium">{job.company}</p>
                          </div>
                          <FiBriefcase size={28} className="opacity-80 flex-shrink-0" />
                        </div>
                        {job.type && (
                          <span className="mt-3 inline-block bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-semibold">
                            {job.type}
                          </span>
                        )}
                      </div>

                      {/* Card body */}
                      <div className="p-5">
                        <p className="text-gray-700 text-sm mb-4">{job.description}</p>

                        {/* Meta info */}
                        <div className="space-y-2 mb-4">
                          {job.location && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <FiMapPin size={14} className="text-gray-400 flex-shrink-0" />
                              <span>{job.location}</span>
                            </div>
                          )}
                          {job.salary && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <FiDollarSign size={14} className="text-gray-400 flex-shrink-0" />
                              <span>{job.salary}</span>
                            </div>
                          )}
                          {job.deadline && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <FiClock size={14} className="text-gray-400 flex-shrink-0" />
                              <span>Apply by: {job.deadline}</span>
                            </div>
                          )}
                        </div>

                        {/* Match reason */}
                        {job.matchReason && (
                          <div className="bg-pink-50 border border-pink-100 rounded-lg px-4 py-3 mb-4">
                            <p className="text-pink-700 text-xs font-medium">✨ Why it matches you</p>
                            <p className="text-pink-600 text-sm mt-1">{job.matchReason}</p>
                          </div>
                        )}

                        {/* Required skills */}
                        {job.skills?.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-500 mb-2">Required Skills</p>
                            <div className="flex flex-wrap gap-1">
                              {job.skills.map((s, j) => (
                                <span key={j} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        <a
                          href={job.link && job.link !== '#' ? job.link : '#'}
                          target={job.link && job.link !== '#' ? '_blank' : '_self'}
                          rel="noopener noreferrer"
                          className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2"
                        >
                          <span>Apply Now</span>
                          <FiExternalLink size={16} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default JobOpportunities;

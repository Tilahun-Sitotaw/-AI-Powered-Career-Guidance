import { useState, useEffect } from 'react';
import { FiAward, FiCalendar, FiExternalLink, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
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

const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await axios.get(`${API_BASE}/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScholarships(res.data.scholarships || []);
    } catch (err) {
      setError('Failed to load scholarships.');
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
        `${API_BASE}/recommendations/regenerate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScholarships(res.data.recommendation?.scholarships || []);
    } catch (err) {
      setError('Failed to regenerate scholarships.');
    } finally {
      setRegenerating(false);
    }
  };

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
                <h1 className="text-4xl font-bold text-gray-900 mb-2">🎓 Scholarships</h1>
                <p className="text-gray-600">Scholarships matched to your profile, department, and career goals</p>
              </div>
              <button
                onClick={handleRegenerate}
                disabled={regenerating || loading}
                className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-60"
              >
                <FiRefreshCw size={16} className={regenerating ? 'animate-spin' : ''} />
                <span>{regenerating ? 'Regenerating...' : 'Regenerate with AI'}</span>
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                <span className="ml-4 text-gray-600 text-lg">Finding scholarships for you...</span>
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
            {!loading && scholarships.length === 0 && !error && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
                <FiAward size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No scholarships found yet.</p>
                <p className="text-sm mt-2">Complete your profile or click "Regenerate with AI" to find matching scholarships.</p>
              </div>
            )}

            {/* Scholarship cards */}
            {!loading && scholarships.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scholarships.map((s, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-gray-100">
                    {/* Card header */}
                    <div className={`bg-gradient-to-r ${CARD_COLORS[i % CARD_COLORS.length]} p-6 text-white`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{s.name}</h3>
                          <p className="text-white text-opacity-90 text-sm">{s.provider}</p>
                        </div>
                        <FiAward size={32} className="opacity-80 flex-shrink-0" />
                      </div>
                      {s.amount && (
                        <div className="mt-3 inline-block bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                          {s.amount}
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-6">
                      <p className="text-gray-700 text-sm mb-4">{s.description}</p>

                      {s.matchReason && (
                        <div className="bg-pink-50 border border-pink-100 rounded-lg px-4 py-3 mb-4">
                          <p className="text-pink-700 text-sm font-medium">✨ Why it matches you</p>
                          <p className="text-pink-600 text-sm mt-1">{s.matchReason}</p>
                        </div>
                      )}

                      <div className="space-y-2 mb-5">
                        {s.eligibility && (
                          <div className="flex items-start space-x-2 text-sm text-gray-600">
                            <span className="font-semibold text-gray-700 whitespace-nowrap">Eligibility:</span>
                            <span>{s.eligibility}</span>
                          </div>
                        )}
                        {s.deadline && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <FiCalendar size={14} className="text-gray-400 flex-shrink-0" />
                            <span className="font-semibold text-gray-700">Deadline:</span>
                            <span>{s.deadline}</span>
                          </div>
                        )}
                      </div>

                      <a
                        href={s.link && s.link !== '#' ? s.link : '#'}
                        target={s.link && s.link !== '#' ? '_blank' : '_self'}
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
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Scholarships;

import { useState, useEffect } from 'react';
import { FiArrowRight, FiRefreshCw, FiAlertCircle, FiMessageSquare, FiTrendingUp, FiSearch, FiX, FiInfo, FiCheckCircle } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const getDifficultyColor = (d) => {
  if (d === 'Easy' || d === 'Beginner') return 'bg-green-50 text-green-700 border-green-150';
  if (d === 'Medium' || d === 'Intermediate') return 'bg-yellow-50 text-yellow-700 border-yellow-150';
  if (d === 'Hard' || d === 'Advanced') return 'bg-red-55 text-red-700 border-red-150';
  return 'bg-slate-50 text-slate-700 border-slate-150';
};

const InterviewPrep = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    if (isAuthenticated) fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(res.data.interviewQuestions || []);
    } catch (err) {
      setError('Failed to load interview questions.');
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
        `${API_BASE}/recommendations/regenerate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(res.data.recommendation?.interviewQuestions || []);
      handleResetFilters();
    } catch (err) {
      setError('Failed to regenerate interview questions.');
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleResetFilters = () => {
    setActiveCategory('All');
    setSearchTerm('');
  };

  const categories = ['All', ...new Set(questions.map((q) => q.category).filter(Boolean))];
  
  const filtered = questions.filter((q) => {
    const categoryMatch = activeCategory === 'All' || q.category === activeCategory;
    
    const search = searchTerm.toLowerCase().trim();
    if (!search) return categoryMatch;
    
    const qMatch = q.question && q.question.toLowerCase().includes(search);
    const catMatch = q.category && q.category.toLowerCase().includes(search);
    const ansMatch = q.answer && q.answer.toLowerCase().includes(search);
    
    return categoryMatch && (qMatch || catMatch || ansMatch);
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Header />
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Hero */}
            <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-gray-100 py-16 px-6 sm:px-8 rounded-3xl mb-8 border border-indigo-900/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.1),transparent)] pointer-events-none"></div>
              <div className="relative z-10">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 mb-4 drop-shadow-sm">Interview Preparation</h1>
                <p className="text-lg text-indigo-100/90 max-w-2xl leading-relaxed">
                  AI-generated interview questions tailored to your target career and skill set. Practice and prepare with confidence.
                </p>
              </div>
              {isAuthenticated && (
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating || loading}
                  className="relative z-10 flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition duration-300 disabled:opacity-60 disabled:transform-none"
                >
                  <FiRefreshCw size={18} className={regenerating ? 'animate-spin' : ''} />
                  <span>{regenerating ? 'Finding Questions...' : 'Practice Fresh Questions'}</span>
                </button>
              )}
            </section>

            {/* Not signed in */}
            {!isAuthenticated && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl mb-6">
                Please <a href="/login" className="font-semibold underline text-amber-950">sign in</a> to see your personalized interview questions.
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
                <span className="mt-4 text-slate-600 font-medium">Matching your target role with expert interview questions...</span>
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
            {!loading && isAuthenticated && questions.length === 0 && !error && (
              <div className="bg-white rounded-2xl shadow-md p-16 text-center text-slate-500 border border-slate-100 max-w-2xl mx-auto">
                <FiMessageSquare size={48} className="mx-auto mb-4 text-amber-300" />
                <p className="text-xl font-bold text-slate-800">No practice questions yet.</p>
                <p className="text-slate-500 mt-2">Complete your profile with a preferred role to generate personalized interview questions.</p>
              </div>
            )}

            {/* Stats & Filters */}
            {!loading && questions.length > 0 && (
              <>
                {/* Sleek Stats Counters */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Practice Bank</p>
                      <p className="text-2xl font-extrabold text-amber-600 mt-1">{questions.length}</p>
                    </div>
                    <div className="bg-amber-50 p-2 rounded-lg text-amber-600 flex-shrink-0">
                      <FiMessageSquare className="w-5 h-5" />
                    </div>
                  </div>
                  {['Easy', 'Medium', 'Hard'].map((level) => {
                    const displayLevel = level === 'Easy' ? 'Beginner' : level === 'Medium' ? 'Intermediate' : 'Advanced';
                    const count = questions.filter((q) =>
                      q.difficulty === level || q.difficulty === displayLevel
                    ).length;
                    const colors = {
                      Easy: { bg: 'bg-green-50 text-green-600 border-green-100', text: 'text-green-700' },
                      Medium: { bg: 'bg-yellow-50 text-yellow-600 border-yellow-100', text: 'text-yellow-750' },
                      Hard: { bg: 'bg-red-50 text-red-650 border-red-100', text: 'text-red-700' },
                    };
                    const colorData = colors[level];
                    return (
                      <div key={level} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{displayLevel}</p>
                          <p className={`text-2xl font-extrabold ${colorData.text} mt-1`}>{count}</p>
                        </div>
                        <div className={`${colorData.bg} p-2 rounded-lg flex-shrink-0`}>
                          <FiTrendingUp className="w-5 h-5" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Unified Search and Category Row */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Unified Search Input */}
                  <div className="relative w-full md:flex-1">
                    <input
                      type="text"
                      placeholder="Search questions by keyword, topic, or response details..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50/50 transition-all duration-300"
                    />
                    <FiSearch className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-amber-600 transition"
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>

                  {/* Categories Pills */}
                  <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto md:max-w-md overflow-x-auto">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                          activeCategory === cat
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Questions Grid */}
                {filtered.length > 0 ? (
                  <div className="space-y-4">
                    {filtered.map((q, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedQuestion(q);
                          setShowAnswer(false);
                        }}
                        className="group bg-white border border-slate-100 hover:border-amber-500 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-4 gap-4">
                            <h3 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-indigo-650 transition">{q.question}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${getDifficultyColor(q.difficulty)}`}>
                              {q.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-xs">
                          <span className="text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-xl">{q.category}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQuestion(q);
                              setShowAnswer(false);
                            }}
                            className="text-amber-600 hover:text-amber-800 font-bold flex items-center space-x-1.5 transition"
                          >
                            <span>Practice response</span>
                            <FiArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-500">
                    <p className="text-lg font-bold text-slate-800">No questions match your filter.</p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 text-amber-600 hover:text-amber-800 font-semibold text-sm underline"
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

      {/* Answer Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-8 text-white flex items-start justify-between relative overflow-hidden border-b border-indigo-900">
              <div>
                <span className="inline-block px-3 py-1 bg-white/10 text-amber-400 rounded-full text-xs font-bold mb-2 border border-amber-500/20">
                  Tailored Practice Response
                </span>
                <h2 className="text-2xl font-extrabold mb-1 leading-snug">{selectedQuestion.question}</h2>
                <p className="text-slate-300 text-xs mt-1 font-semibold bg-white/5 px-2.5 py-1 rounded-lg inline-block">{selectedQuestion.category}</p>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white transition-all flex-shrink-0"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-xl text-xs font-bold border ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                  Difficulty: {selectedQuestion.difficulty}
                </span>
              </div>

              {!showAnswer ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 p-6">
                  <FiMessageSquare size={36} className="mx-auto mb-3 text-amber-500" />
                  <p className="text-slate-650 text-sm mb-5 leading-relaxed">Formulate your response using the **STAR Method** (Situation, Task, Action, Result) before revealing the expert outline.</p>
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 duration-300"
                  >
                    Reveal Expert Answer
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-indigo-50/30 border border-indigo-100 p-6 rounded-2xl">
                    <h3 className="font-bold text-indigo-950 text-sm mb-2.5 flex items-center gap-1.5">
                      <FiCheckCircle className="text-indigo-600 w-4.5 h-4.5" /> Suggested Outline response:
                    </h3>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                      {selectedQuestion.answer || 'Consider highlighting specific results, direct skills, and outcomes aligned with your goals.'}
                    </p>
                  </div>
                  <div className="p-4.5 bg-amber-50/50 border border-amber-200/60 rounded-2xl">
                    <p className="text-xs text-amber-900 leading-relaxed">
                      <strong>💡 Practice Tip:</strong> Personalize this outline by plugging in a specific project or achievement from your resume. Keep your responses structured and brief.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition"
                >
                  Close Practice
                </button>
                {showAnswer && (
                  <button
                    onClick={() => setShowAnswer(false)}
                    className="flex-1 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold py-3 rounded-xl transition"
                  >
                    Hide Answer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-110 z-35 flex items-center justify-center"
          title="Open AI Assistant"
        >
          <FiMessageSquare size={24} />
        </button>
      )}

      {/* Chat Bot with outside click shrink support */}
      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} context="interview" />
    </div>
  );
};

export default InterviewPrep;
